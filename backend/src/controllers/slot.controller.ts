import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { slotService } from '../services/slotService';

export const slotController = {
  // Public - Get available slots for a field on a specific date
  getFieldSlots: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { date } = req.query;

      if (!date || typeof date !== 'string') {
        res.status(400).json({ success: false, message: 'Parameter tanggal (date) wajib diisi (YYYY-MM-DD)' });
        return;
      }

      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        res.status(400).json({ success: false, message: 'Format tanggal tidak valid, gunakan YYYY-MM-DD' });
        return;
      }

      const fieldId = BigInt(id as string);
      const field = await prisma.field.findUnique({ where: { id: fieldId } });
      if (!field) {
        res.status(404).json({ success: false, message: 'Lapangan tidak ditemukan' });
        return;
      }

      const slots = await slotService.getSlotsForDate(fieldId, date);

      res.status(200).json({ success: true, data: slots });
    } catch (error: any) {
      console.error('Error fetching slots:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengambil data slot' });
    }
  },
};
