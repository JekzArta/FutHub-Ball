import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const configController = {
  // GET /api/v1/admin/configs
  getConfigs: async (req: Request, res: Response): Promise<void> => {
    try {
      const configs = await prisma.systemConfig.findMany();
      // Translate array to key-value object
      const mapped = configs.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, string>);

      res.status(200).json({ success: true, data: mapped });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // PUT /api/v1/admin/configs
  updateConfigs: async (req: Request, res: Response): Promise<void> => {
    try {
      const updates = req.body; // e.g. { n8n_mode: 'MASTER', n8n_master_url: '...' }
      
      const updatePromises = Object.entries(updates).map(async ([key, value]) => {
        if (typeof value === 'string') {
          return prisma.systemConfig.upsert({
            where: { key },
            update: { value },
            create: { key, value }
          });
        }
      });

      await Promise.all(updatePromises);
      
      res.status(200).json({ success: true, message: 'Configuration updated successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};
