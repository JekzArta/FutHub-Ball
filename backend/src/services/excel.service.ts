import ExcelJS from 'exceljs';
import { prisma } from '../utils/prisma';

export const excelService = {
  async generateBookingsReport(from?: Date, to?: Date): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'FutHub Ball System';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Transactions');

    // Define columns
    sheet.columns = [
      { header: 'Booking ID', key: 'id', width: 10 },
      { header: 'Customer', key: 'customer', width: 25 },
      { header: 'Field', key: 'field', width: 20 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Time', key: 'time', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Base Price', key: 'base', width: 15 },
      { header: 'Discount', key: 'discount', width: 15 },
      { header: 'Final Price', key: 'final', width: 15 }
    ];

    // Style headers
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern:'solid',
      fgColor:{ argb:'FFD3D3D3' }
    };

    // Filter logic
    const whereClause: any = {
      status: { not: 'PENDING' } // Exclude pending from financial reports usually
    };
    
    if (from && to) {
       whereClause.date = { gte: from, lte: to };
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true } },
        field: { select: { name: true } }
      },
      orderBy: { date: 'desc' }
    });

    bookings.forEach(b => {
      sheet.addRow({
        id: b.id.toString(),
        customer: b.user.name,
        field: b.field.name,
        date: b.date.toISOString().split('T')[0],
        time: `${b.startTime} - ${b.endTime}`,
        status: b.status,
        base: b.basePrice,
        discount: b.discountAmount,
        final: b.finalPrice
      });
    });

    // Formatting currency logic manually or rely on excel format
    sheet.getColumn('base').numFmt = '"Rp"#,##0.00';
    sheet.getColumn('discount').numFmt = '"Rp"#,##0.00';
    sheet.getColumn('final').numFmt = '"Rp"#,##0.00';

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
};
