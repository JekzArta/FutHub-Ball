import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { uploadImageToCloudinary } from '../utils/cloudinary';
import { z } from 'zod';
import { BookingStatus } from '@prisma/client';

const uploadPaymentSchema = z.object({
  paymentMethodId: z.string().min(1, 'Metode pembayaran wajib dipilih'),
});

export const paymentController = {
  // Public - Get all active payment methods
  getPaymentMethods: async (req: Request, res: Response): Promise<void> => {
    try {
      const methods = await prisma.paymentMethod.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });
      res.status(200).json({ success: true, data: methods });
    } catch (error: any) {
      console.error('Error fetching payment methods:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  },

  // User - Upload payment proof for a booking
  uploadPaymentProof: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const { id: bookingId } = req.params;
      const validatedData = uploadPaymentSchema.parse(req.body);

      // Check booking belongs to user and is in PENDING status
      const booking = await prisma.booking.findFirst({
        where: {
          id: BigInt(bookingId as string),
          userId: BigInt(userId as string),
        },
      });

      if (!booking) {
        res.status(404).json({ success: false, message: 'Booking tidak ditemukan' });
        return;
      }

      if (booking.status !== BookingStatus.PENDING) {
        res.status(400).json({ success: false, message: `Bukti transfer hanya bisa diupload untuk booking berstatus PENDING. Status saat ini: ${booking.status}` });
        return;
      }

      if (booking.paymentType !== 'ONLINE') {
        res.status(400).json({ success: false, message: 'Upload bukti transfer hanya untuk booking Online' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ success: false, message: 'Foto bukti transfer wajib diupload' });
        return;
      }

      // Check if payment method exists
      const paymentMethod = await prisma.paymentMethod.findUnique({
        where: { id: BigInt(validatedData.paymentMethodId as string), isActive: true },
      });

      if (!paymentMethod) {
        res.status(400).json({ success: false, message: 'Metode pembayaran tidak valid atau tidak aktif' });
        return;
      }

      // Upload to Cloudinary
      const imageUrl = await uploadImageToCloudinary(req.file.buffer, 'futhub-ball/payments');

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          bookingId: BigInt(bookingId as string),
          paymentMethodId: BigInt(validatedData.paymentMethodId as string),
          proofImageUrl: imageUrl,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Bukti transfer berhasil diupload. Menunggu verifikasi admin.',
        data: payment,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, errors: error.issues });
        return;
      }
      console.error('Error uploading payment proof:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan saat upload bukti transfer' });
    }
  },
};
