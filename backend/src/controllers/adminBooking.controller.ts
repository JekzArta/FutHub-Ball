import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { webhookService } from '../services/webhook.service';

export const adminBookingController = {
  // Admin - Get all bookings with optional status filter
  getAllBookings: async (req: Request, res: Response): Promise<void> => {
    try {
      const { status, date, fieldId, page = '1', limit = '20' } = req.query;

      const take = parseInt(limit as string);
      const skip = (parseInt(page as string) - 1) * take;

      const where: any = {};
      if (status) where.status = status as BookingStatus;
      if (date) where.date = new Date(date as string);
      if (fieldId) where.fieldId = BigInt(fieldId as string);

      const [bookings, total] = await prisma.$transaction([
        prisma.booking.findMany({
          where,
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            field: { select: { id: true, name: true, number: true } },
            payments: { select: { status: true, proofImageUrl: true, method: true } },
            promo: { select: { code: true } },
          },
          orderBy: { createdAt: 'desc' },
          take,
          skip,
        }),
        prisma.booking.count({ where }),
      ]);

      res.status(200).json({
        success: true,
        data: bookings,
        pagination: {
          total,
          page: parseInt(page as string),
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      });
    } catch (error: any) {
      console.error('Error fetching all bookings:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  },

  // Admin - Get one booking detail
  getBookingById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const booking = await prisma.booking.findUnique({
        where: { id: BigInt(id as string) },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
          field: { include: { photos: { where: { isPrimary: true }, take: 1 } } },
          payments: { include: { method: true } },
          promo: true,
        },
      });

      if (!booking) {
        res.status(404).json({ success: false, message: 'Booking tidak ditemukan' });
        return;
      }

      res.status(200).json({ success: true, data: booking });
    } catch (error: any) {
      console.error('Error fetching booking detail:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  },

  // Admin - Approve booking
  approveBooking: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const booking = await prisma.booking.findUnique({ where: { id: BigInt(id as string) } });
      if (!booking) {
        res.status(404).json({ success: false, message: 'Booking tidak ditemukan' });
        return;
      }

      if (booking.status !== BookingStatus.PENDING) {
        res.status(400).json({ success: false, message: `Hanya booking berstatus PENDING yang bisa di-approve. Status saat ini: ${booking.status}` });
        return;
      }

      // For ONLINE payment, verify a payment record exists before approving
      if (booking.paymentType === 'ONLINE') {
        const payment = await prisma.payment.findFirst({ where: { bookingId: booking.id } });
        if (!payment) {
          res.status(400).json({ success: false, message: 'Booking Online tidak dapat di-approve sebelum ada bukti transfer yang diupload' });
          return;
        }

        // Mark payment as VERIFIED
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.VERIFIED, verifiedAt: new Date() },
        });
      }

      const updatedBooking = await prisma.booking.update({
        where: { id: BigInt(id as string) },
        data: { status: BookingStatus.CONFIRMED },
      });

      // Trigger n8n webhook for booking confirmation
      const user = await prisma.user.findUnique({ where: { id: booking.userId }});
      if (user) {
        webhookService.triggerBookingConfirmed(booking.id, user.email, user.phone || '').catch(console.error);
      }

      res.status(200).json({ success: true, message: 'Booking berhasil di-approve', data: updatedBooking });
    } catch (error: any) {
      console.error('Error approving booking:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  },

  // Admin - Reject booking
  rejectBooking: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const booking = await prisma.booking.findUnique({ where: { id: BigInt(id as string) } });
      if (!booking) {
        res.status(404).json({ success: false, message: 'Booking tidak ditemukan' });
        return;
      }

      if (booking.status !== BookingStatus.PENDING) {
        res.status(400).json({ success: false, message: `Hanya booking berstatus PENDING yang bisa di-reject. Status saat ini: ${booking.status}` });
        return;
      }

      if (booking.paymentType === 'ONLINE') {
        const payment = await prisma.payment.findFirst({ where: { bookingId: booking.id } });
        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: PaymentStatus.REJECTED },
          });
        }
      }

      const updatedBooking = await prisma.booking.update({
        where: { id: BigInt(id as string) },
        data: { status: BookingStatus.REJECTED },
      });

      // Trigger n8n webhook for rejection
       const user = await prisma.user.findUnique({ where: { id: booking.userId }});
       if (user) {
         webhookService.triggerBookingRejected(booking.id, user.email, user.phone || '').catch(console.error);
       }

      res.status(200).json({ success: true, message: 'Booking berhasil di-reject', data: updatedBooking });
    } catch (error: any) {
      console.error('Error rejecting booking:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  },

  // Admin - Mark booking as completed
  completeBooking: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const booking = await prisma.booking.findUnique({ where: { id: BigInt(id as string) } });
      if (!booking) {
        res.status(404).json({ success: false, message: 'Booking tidak ditemukan' });
        return;
      }

      if (booking.status !== BookingStatus.CONFIRMED) {
        res.status(400).json({ success: false, message: `Hanya booking berstatus CONFIRMED yang bisa ditandai completed. Status saat ini: ${booking.status}` });
        return;
      }

      const updatedBooking = await prisma.booking.update({
        where: { id: BigInt(id as string) },
        data: { status: BookingStatus.COMPLETED },
      });

      res.status(200).json({ success: true, message: 'Booking berhasil ditandai selesai', data: updatedBooking });
    } catch (error: any) {
      console.error('Error completing booking:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  },

  // Admin - Mark refund as noted (for rejected ONLINE bookings)
  noteRefund: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const booking = await prisma.booking.findUnique({ where: { id: BigInt(id as string) } });
      if (!booking) {
        res.status(404).json({ success: false, message: 'Booking tidak ditemukan' });
        return;
      }

      if (booking.status !== BookingStatus.REJECTED || booking.paymentType !== 'ONLINE') {
        res.status(400).json({ success: false, message: 'Pencatatan refund hanya berlaku untuk booking Online yang di-reject' });
        return;
      }

      const updatedBooking = await prisma.booking.update({
        where: { id: BigInt(id as string) },
        data: { refundNoted: true },
      });

      res.status(200).json({ success: true, message: 'Refund berhasil dicatat', data: updatedBooking });
    } catch (error: any) {
      console.error('Error noting refund:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  },
};
