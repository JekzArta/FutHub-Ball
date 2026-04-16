import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { excelService } from '../services/excel.service';
import { BookingStatus } from '@prisma/client';

export const reportController = {
  // GET /api/v1/admin/dashboard
  getDashboardStats: async (req: Request, res: Response): Promise<void> => {
    try {
      const totalUsers = await prisma.user.count({ where: { role: 'USER' } });
      const pendingBookings = await prisma.booking.count({ where: { status: BookingStatus.PENDING } });
      
      const aggregate = await prisma.booking.aggregate({
        where: { status: BookingStatus.COMPLETED },
        _sum: { finalPrice: true }
      });
      const revenue = aggregate._sum.finalPrice || 0;

      // Stats for today
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const todayBookings = await prisma.booking.count({
        where: { createdAt: { gte: startOfDay } }
      });

      res.status(200).json({
        success: true,
        data: {
          totalUsers,
          pendingBookings,
          revenue,
          todayBookings
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // GET /api/v1/admin/reports
  getReports: async (req: Request, res: Response): Promise<void> => {
    try {
      const format = req.query.format as string;
      const fromStr = req.query.from as string;
      const toStr = req.query.to as string;

      let from = undefined;
      let to = undefined;

      if (fromStr && toStr) {
        from = new Date(fromStr);
        to = new Date(toStr);
      }

      if (format === 'excel') {
        const buffer = await excelService.generateBookingsReport(from, to);
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=futhub-report-${new Date().getTime()}.xlsx`);
        res.send(buffer);
        return;
      }

       // Otherwise return JSON
      const reports = await prisma.booking.findMany({
        where: {
          ...(from && to ? { date: { gte: from, lte: to } } : {})
        },
        include: { user: { select: { id: true, name: true }}, field: { select: { id: true, name: true }} },
        orderBy: { date: 'desc' }
      });

      // serialize BigInt
      const serialized = reports.map(r => ({ ...r, id: r.id.toString(), userId: r.userId.toString(), fieldId: r.fieldId.toString(), user: { ...r.user, id: r.user.id.toString()}, field: { ...r.field, id: r.field.id.toString()} }));

      res.status(200).json({ success: true, data: serialized });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};
