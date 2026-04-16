import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { z } from 'zod';

const facilitySchema = z.object({
  name: z.string().min(1, 'Nama fasilitas wajib diisi'),
  icon: z.string().optional(),
});

export const facilityController = {
  // Public - Get all facilities
  getAllFacilities: async (req: Request, res: Response): Promise<void> => {
    try {
      const facilities = await prisma.facility.findMany({
        orderBy: { name: 'asc' },
      });
      res.status(200).json({ success: true, data: facilities });
    } catch (error: any) {
      console.error('Error fetching facilities:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  },

  // Admin - Create a facility
  createFacility: async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = facilitySchema.parse(req.body);

      const existingFacility = await prisma.facility.findFirst({
        where: { name: validatedData.name },
      });

      if (existingFacility) {
        res.status(400).json({ success: false, message: 'Fasilitas dengan nama ini sudah ada' });
        return;
      }

      const facility = await prisma.facility.create({
        data: {
          name: validatedData.name,
          icon: validatedData.icon || null,
        },
      });

      res.status(201).json({ success: true, message: 'Fasilitas berhasil ditambahkan', data: facility });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, errors: error.issues });
        return;
      }
      console.error('Error creating facility:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  },

  // Admin - Delete a facility
  deleteFacility: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const facility = await prisma.facility.findUnique({
        where: { id: BigInt(id as string) },
      });

      if (!facility) {
        res.status(404).json({ success: false, message: 'Fasilitas tidak ditemukan' });
        return;
      }

      await prisma.facility.delete({
        where: { id: BigInt(id as string) },
      });

      res.status(200).json({ success: true, message: 'Fasilitas berhasil dihapus' });
    } catch (error: any) {
      console.error('Error deleting facility:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  },
};
