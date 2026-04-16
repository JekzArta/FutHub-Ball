import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { webhookService } from '../services/webhook.service';
import { NotificationLog } from '@prisma/client';

export const notificationController = {
  // GET /api/v1/admin/notifications
  getLogs: async (req: Request, res: Response): Promise<void> => {
    try {
      const logs = await prisma.notificationLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100 // Limit for performance
      });

      // Serialization for BigInt
      const serialized = logs.map((l: NotificationLog) => ({ ...l, id: l.id.toString() }));

      res.status(200).json({ success: true, data: serialized });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // POST /api/v1/admin/notifications/:id/resend
  resendNotification: async (req: Request, res: Response): Promise<void> => {
    try {
      const logId = BigInt(req.params.id as string);
      
      const logRecord = await prisma.notificationLog.findUnique({ where: { id: logId }});
      if (!logRecord) {
        res.status(404).json({ success: false, message: 'Log not found' });
        return;
      }

      // Re-trigger using service
      let payloadObj = {};
      try {
        payloadObj = JSON.parse(logRecord.payload);
      } catch (e) {}

      const success = await webhookService.sendEvent(
        logRecord.eventType,
        logRecord.recipient,
        logRecord.channel,
        payloadObj
      );

      if (success) {
        res.status(200).json({ success: true, message: 'Notification resent successfully' });
      } else {
        res.status(500).json({ success: false, message: 'Failed to resend notification. Check webhook configuration.' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};
