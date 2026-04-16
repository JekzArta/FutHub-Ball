import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { z } from 'zod';
import { SlotStatus } from '@prisma/client';

const defaultHoursSchema = z.object({
  openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format waktu harus HH:MM'),
  closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format waktu harus HH:MM'),
});

const overrideHoursSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format waktu harus HH:MM').optional(),
  closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format waktu harus HH:MM').optional(),
  isClosed: z.boolean().default(false),
});

const slotOverrideSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  slotTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format waktu harus HH:MM'),
  status: z.nativeEnum(SlotStatus),
  note: z.string().optional(),
});

export const operationalController = {
  // Admin - Set default operational hours for a field
  setDefaultHours: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const validatedData = defaultHoursSchema.parse(req.body);

      // Check if field exists
      const field = await prisma.field.findUnique({ where: { id: BigInt(id as string) } });
      if (!field) {
        res.status(404).json({ success: false, message: 'Lapangan tidak ditemukan' });
        return;
      }

      // Upsert default hours
      const existingHours = await prisma.operationalHour.findFirst({
        where: { fieldId: BigInt(id as string) },
      });

      let hours;
      if (existingHours) {
        hours = await prisma.operationalHour.update({
          where: { id: existingHours.id },
          data: validatedData,
        });
      } else {
        hours = await prisma.operationalHour.create({
          data: {
            fieldId: BigInt(id as string),
            ...validatedData,
          },
        });
      }

      res.status(200).json({ success: true, message: 'Jam operasional default diperbarui', data: hours });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, errors: error.issues });
        return;
      }
      console.error('Error setting default hours:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  },

  // Admin - Set operational override for a specific day
  setOperationalOverride: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const validatedData = overrideHoursSchema.parse(req.body);
      const targetDate = new Date(validatedData.date);

      const field = await prisma.field.findUnique({ where: { id: BigInt(id as string) } });
      if (!field) {
        res.status(404).json({ success: false, message: 'Lapangan tidak ditemukan' });
        return;
      }

      // Check if override already exists for this date
      const existingOverride = await prisma.operationalOverride.findFirst({
        where: {
          fieldId: BigInt(id as string),
          date: targetDate,
        },
      });

      let override;
      if (existingOverride) {
        override = await prisma.operationalOverride.update({
          where: { id: existingOverride.id },
          data: {
            openTime: validatedData.openTime,
            closeTime: validatedData.closeTime,
            isClosed: validatedData.isClosed,
          },
        });
      } else {
        override = await prisma.operationalOverride.create({
          data: {
            fieldId: BigInt(id as string),
            date: targetDate,
            openTime: validatedData.openTime,
            closeTime: validatedData.closeTime,
            isClosed: validatedData.isClosed,
          },
        });
      }

      res.status(200).json({ success: true, message: 'Override jam operasional berhasil disimpan', data: override });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, errors: error.issues });
        return;
      }
      console.error('Error setting operation override:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  },

  // Admin - Set override for a specific slot
  setSlotOverride: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const validatedData = slotOverrideSchema.parse(req.body);
      const targetDate = new Date(validatedData.date);

      const field = await prisma.field.findUnique({ where: { id: BigInt(id as string) } });
      if (!field) {
        res.status(404).json({ success: false, message: 'Lapangan tidak ditemukan' });
        return;
      }

      const existingSlotOverride = await prisma.slotOverride.findFirst({
        where: {
          fieldId: BigInt(id as string),
          date: targetDate,
          slotTime: validatedData.slotTime,
        },
      });

      let slotOverride;
      if (existingSlotOverride) {
        slotOverride = await prisma.slotOverride.update({
          where: { id: existingSlotOverride.id },
          data: {
            status: validatedData.status,
            note: validatedData.note,
          },
        });
      } else {
        slotOverride = await prisma.slotOverride.create({
          data: {
            fieldId: BigInt(id as string),
            date: targetDate,
            slotTime: validatedData.slotTime,
            status: validatedData.status,
            note: validatedData.note,
          },
        });
      }

      res.status(200).json({ success: true, message: 'Override status slot berhasil disimpan', data: slotOverride });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, errors: error.issues });
        return;
      }
      console.error('Error setting slot override:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  },
};
