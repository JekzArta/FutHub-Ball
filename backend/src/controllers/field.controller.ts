import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { uploadImageToCloudinary } from '../utils/cloudinary';
import { z } from 'zod';
import { FieldType } from '@prisma/client';

const fieldSchema = z.object({
  number: z.number().int().positive('Nomor lapangan harus positif'),
  name: z.string().min(1, 'Nama wajib diisi'),
  type: z.nativeEnum(FieldType),
  description: z.string().optional(),
  pricePerSlot: z.number().int().positive('Harga harus lebih dari 0'),
  isActive: z.boolean().optional(),
});

export const fieldController = {
  // Public - Get all active fields
  getAllFields: async (req: Request, res: Response): Promise<void> => {
    try {
      const { includeInactive } = req.query;
      const fields = await prisma.field.findMany({
        where: includeInactive === 'true' ? {} : { isActive: true },
        include: {
          photos: { select: { id: true, photoUrl: true, isPrimary: true } },
          facilities: { include: { facility: true } },
        },
        orderBy: { number: 'asc' },
      });
      res.status(200).json({ success: true, data: fields });
    } catch (error: any) {
      console.error('Error fetching fields:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  },

  // Public - Get field by ID
  getFieldById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const field = await prisma.field.findUnique({
        where: { id: BigInt(id as string) },
        include: {
          photos: true,
          facilities: { include: { facility: true } },
          hours: true,
        },
      });

      if (!field) {
        res.status(404).json({ success: false, message: 'Lapangan tidak ditemukan' });
        return;
      }

      res.status(200).json({ success: true, data: field });
    } catch (error: any) {
      console.error('Error fetching field details:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  },

  // Admin - Create field
  createField: async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = fieldSchema.parse(req.body);

      // Check if number already exists
      const existing = await prisma.field.findFirst({
        where: { number: validatedData.number },
      });

      if (existing) {
        res.status(400).json({ success: false, message: `Lapangan dengan nomor ${validatedData.number} sudah ada` });
        return;
      }

      const field = await prisma.field.create({
        data: {
          ...validatedData,
          hours: {
            create: {
              openTime: '07:00',
              closeTime: '22:00', // Default hours
            },
          },
        },
      });

      res.status(201).json({ success: true, message: 'Lapangan berhasil dikonfigurasi', data: field });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, errors: error.issues });
        return;
      }
      console.error('Error creating field:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  },

  // Admin - Update field
  updateField: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const validatedData = fieldSchema.parse(req.body);

      const field = await prisma.field.update({
        where: { id: BigInt(id as string) },
        data: validatedData,
      });

      res.status(200).json({ success: true, message: 'Data lapangan diperbarui', data: field });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, errors: error.issues });
        return;
      }
      console.error('Error updating field:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  },

  // Admin - Assign facilities
  assignFacilities: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { facilityIds } = req.body; // Expecting array of BigInt represented as strings/numbers

      if (!Array.isArray(facilityIds)) {
        res.status(400).json({ success: false, message: 'facilityIds harus berupa array' });
        return;
      }

      // Hapus yang lama lalu pasang yang baru
      await prisma.$transaction([
        prisma.fieldFacility.deleteMany({ where: { fieldId: BigInt(id as string) } }),
        prisma.fieldFacility.createMany({
          data: facilityIds.map((facId: any) => ({
            fieldId: BigInt(id as string),
            facilityId: BigInt(facId),
          })),
        }),
      ]);

      res.status(200).json({ success: true, message: 'Fasilitas lapangan diperbarui' });
    } catch (error: any) {
      console.error('Error assigning facilities:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  },

  // Admin - Upload Field Photo
  uploadFieldPhoto: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const field = await prisma.field.findUnique({ where: { id: BigInt(id as string) } });
      if (!field) {
        res.status(404).json({ success: false, message: 'Lapangan tidak ditemukan' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ success: false, message: 'Tidak ada foto yang diupload' });
        return;
      }

      const imageUrl = await uploadImageToCloudinary(req.file.buffer, 'futhub-ball/fields');
      const { isPrimary } = req.body;

      const photo = await prisma.fieldPhoto.create({
        data: {
          fieldId: BigInt(id as string),
          photoUrl: imageUrl,
          isPrimary: isPrimary === 'true' || isPrimary === true,
        },
      });

      res.status(201).json({ success: true, message: 'Foto berhasil diupload', data: photo });
    } catch (error: any) {
      console.error('Error uploading field photo:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server saat upload foto' });
    }
  },
};
