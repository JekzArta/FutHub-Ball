import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { slotService } from '../services/slotService';
import { z } from 'zod';
import { PaymentType } from '@prisma/client';

const createBookingSchema = z.object({
  fieldId: z.string().min(1, 'Field ID wajib diisi'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Format waktu harus HH:MM'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$|^24:00$/, 'Format waktu harus HH:MM'),
  totalSlots: z.number().int().min(1).max(5),
  paymentType: z.nativeEnum(PaymentType),
  promoCode: z.string().optional(),
});

export const bookingController = {
  // User - Get all their bookings
  getMyBookings: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const { status } = req.query;

      const bookings = await prisma.booking.findMany({
        where: {
          userId: BigInt(userId),
          ...(status ? { status: status as any } : {}),
        },
        include: {
          field: { select: { id: true, name: true, number: true, photos: { where: { isPrimary: true }, take: 1 } } },
          payments: { select: { status: true, createdAt: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({ success: true, data: bookings });
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  },

  // User - Get detail of one booking
  getBookingById: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const booking = await prisma.booking.findFirst({
        where: {
          id: BigInt(id as string),
          userId: BigInt(userId),
        },
        include: {
          field: { include: { photos: { where: { isPrimary: true }, take: 1 } } },
          payments: { include: { method: true } },
          promo: { select: { code: true, type: true, value: true } },
        },
      });

      if (!booking) {
        res.status(404).json({ success: false, message: 'Booking tidak ditemukan' });
        return;
      }

      res.status(200).json({ success: true, data: booking });
    } catch (error: any) {
      console.error('Error fetching booking:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  },

  // User - Create a new booking
  createBooking: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const validatedData = createBookingSchema.parse(req.body);

      const fieldId = BigInt(validatedData.fieldId);

      // 1. Slot validation: sequential, available, max 5
      await slotService.validateBookingRequest(
        fieldId,
        validatedData.date,
        validatedData.startTime,
        validatedData.endTime,
        validatedData.totalSlots
      );

      // 2. Business rule: 3-5 slots must be online
      if (validatedData.totalSlots >= 3 && validatedData.paymentType === PaymentType.OFFLINE) {
        res.status(400).json({
          success: false,
          message: 'Pemesanan 3 slot atau lebih wajib menggunakan pembayaran Online.',
        });
        return;
      }

      // 3. Fetch field for price
      const field = await prisma.field.findUnique({ where: { id: fieldId } });
      if (!field || !field.isActive) {
        res.status(404).json({ success: false, message: 'Lapangan tidak ditemukan atau tidak aktif' });
        return;
      }

      const basePrice = field.pricePerSlot * validatedData.totalSlots;
      let discountAmount = 0;
      let promoId: bigint | null = null;

      // 4. Apply promo if provided
      if (validatedData.promoCode) {
        const now = new Date();
        const promo = await prisma.promo.findFirst({
          where: {
            code: validatedData.promoCode,
            isActive: true,
            startDate: { lte: now },
            endDate: { gte: now },
          },
          include: { fields: true },
        });

        if (!promo) {
          res.status(400).json({ success: false, message: 'Kode promo tidak valid atau sudah kedaluwarsa' });
          return;
        }

        // Check max usage overall
        if (promo.maxUsage !== null && promo.currentUsage >= promo.maxUsage) {
          res.status(400).json({ success: false, message: 'Kode promo sudah mencapai batas penggunaan' });
          return;
        }

        // Check per-user usage
        if (promo.maxUsagePerUser !== null) {
          const userUsageCount = await prisma.promoUsage.count({
            where: { promoId: promo.id, userId: BigInt(userId) },
          });
          if (userUsageCount >= promo.maxUsagePerUser) {
            res.status(400).json({ success: false, message: 'Anda sudah mencapai batas penggunaan promo ini' });
            return;
          }
        }

        // Check if promo is applicable to this field
        if (promo.applicableTo === 'SPECIFIC_FIELDS') {
          const isApplicable = promo.fields.some(pf => pf.fieldId === fieldId);
          if (!isApplicable) {
            res.status(400).json({ success: false, message: 'Kode promo tidak berlaku untuk lapangan ini' });
            return;
          }
        }

        // Calculate discount
        if (promo.type === 'PERCENTAGE') {
          discountAmount = Math.round((basePrice * promo.value) / 100);
        } else {
          discountAmount = promo.value;
        }
        discountAmount = Math.min(discountAmount, basePrice); // Discount can't exceed base price
        promoId = promo.id;
      }

      const finalPrice = basePrice - discountAmount;

      // 5. Create booking in a transaction to avoid race conditions
      const booking = await prisma.$transaction(async (tx) => {
        // Re-validate slot availability inside transaction
        await slotService.validateBookingRequest(
          fieldId,
          validatedData.date,
          validatedData.startTime,
          validatedData.endTime,
          validatedData.totalSlots
        );

        const newBooking = await tx.booking.create({
          data: {
            userId: BigInt(userId),
            fieldId,
            promoId,
            date: new Date(validatedData.date),
            startTime: validatedData.startTime,
            endTime: validatedData.endTime,
            totalSlots: validatedData.totalSlots,
            basePrice,
            discountAmount,
            finalPrice,
            paymentType: validatedData.paymentType,
          },
        });

        // Increment promo usage if applied
        if (promoId) {
          await tx.promo.update({
            where: { id: promoId },
            data: { currentUsage: { increment: 1 } },
          });
          await tx.promoUsage.create({
            data: {
              promoId: promoId,
              userId: BigInt(userId),
              bookingId: newBooking.id,
            },
          });
        }

        return newBooking;
      });

      res.status(201).json({
        success: true,
        message: 'Booking berhasil dibuat. Silakan lanjutkan dengan pembayaran.',
        data: booking,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, errors: error.issues });
        return;
      }
      // Business logic errors from slot validation
      if (error?.message) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      console.error('Error creating booking:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  },
};
