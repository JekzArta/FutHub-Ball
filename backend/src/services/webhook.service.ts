import { prisma } from '../utils/prisma';
import { NotificationChannel, NotificationStatus } from '@prisma/client';

export const webhookService = {
  async getWebhookUrl(channel: NotificationChannel): Promise<string | null> {
    const configs = await prisma.systemConfig.findMany();
    const modeConfig = configs.find(c => c.key === 'n8n_mode');
    const isGranular = modeConfig?.value === 'GRANULAR';

    const baseUrlConfigFn = (key: string) => configs.find(c => c.key === key)?.value;

    if (!isGranular) {
      return baseUrlConfigFn('n8n_master_url') || process.env.N8N_WEBHOOK_URL || null;
    }

    if (channel === NotificationChannel.WHATSAPP) {
      return baseUrlConfigFn('n8n_wa_url') || null;
    } else if (channel === NotificationChannel.EMAIL) {
      return baseUrlConfigFn('n8n_email_url') || null;
    }

    return baseUrlConfigFn('n8n_master_url') || process.env.N8N_WEBHOOK_URL || null;
  },

  async sendEvent(eventType: string, recipient: string, channel: NotificationChannel, payload: any) {
    const url = await this.getWebhookUrl(channel);

    const logRecord = await prisma.notificationLog.create({
      data: {
        eventType,
        recipient,
        channel,
        payload: JSON.stringify(payload),
        n8nUrlUsed: url || 'NONE'
      }
    });

    if (!url) {
      await prisma.notificationLog.update({
        where: { id: logRecord.id },
        data: { status: NotificationStatus.FAILED, errorMessage: 'No webhook URL configured' }
      });
      return false;
    }

    try {
      // In a real environment, we'd use fetch. For AntiGravity local, fetch is available in Node > 18.
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType, recipient, payload })
      });

      const responseText = await response.text();

      if (!response.ok) {
         await prisma.notificationLog.update({
          where: { id: logRecord.id },
          data: { status: NotificationStatus.FAILED, errorMessage: `HTTP ${response.status}`, response: responseText }
        });
        return false;
      }

      await prisma.notificationLog.update({
        where: { id: logRecord.id },
        data: { status: NotificationStatus.SUCCESS, response: responseText }
      });
      return true;

    } catch (error: any) {
       await prisma.notificationLog.update({
          where: { id: logRecord.id },
          data: { status: NotificationStatus.FAILED, errorMessage: error.message }
       });
       return false;
    }
  },

  // Helper for direct trigger of specific events based on PRD
  async triggerBookingCreated(bookingId: bigint, adminEmail: string, adminPhone: string) {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId }});
    // Send to admin
    await this.sendEvent('booking_created', adminPhone, NotificationChannel.WHATSAPP, booking);
    await this.sendEvent('booking_created', adminEmail, NotificationChannel.EMAIL, booking);
  },

  async triggerBookingConfirmed(bookingId: bigint, customerEmail: string, customerPhone: string) {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId }});
    await this.sendEvent('booking_confirmed', customerPhone, NotificationChannel.WHATSAPP, booking);
    await this.sendEvent('booking_confirmed', customerEmail, NotificationChannel.EMAIL, booking);
  },

  async triggerBookingRejected(bookingId: bigint, customerEmail: string, customerPhone: string) {
     const booking = await prisma.booking.findUnique({ where: { id: bookingId }});
    await this.sendEvent('booking_rejected', customerPhone, NotificationChannel.WHATSAPP, booking);
    await this.sendEvent('booking_rejected', customerEmail, NotificationChannel.EMAIL, booking);
  }
};
