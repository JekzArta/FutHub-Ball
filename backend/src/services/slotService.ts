import { prisma } from '../utils/prisma';
import { SlotStatus, BookingStatus } from '@prisma/client';

export type SlotStatusType = 'AVAILABLE' | 'CLOSED' | 'MAINTENANCE' | 'BOOKED';

export interface SlotAvailability {
  time: string; // e.g., "07:00"
  status: SlotStatusType;
  price: number;
}


export const slotService = {
  /**
   * Generates 24 slots for a given field on a given date.
   */
  getSlotsForDate: async (fieldId: bigint, dateString: string): Promise<SlotAvailability[]> => {
    const targetDate = new Date(dateString);
    const field = await prisma.field.findUnique({
      where: { id: fieldId },
    });

    if (!field) {
      throw new Error('Lapangan tidak ditemukan');
    }

    // 1. Get default hours
    const defaultHours = await prisma.operationalHour.findFirst({
      where: { fieldId },
    });

    // 2. Get operational override for this date
    const opOverride = await prisma.operationalOverride.findFirst({
      where: { fieldId, date: targetDate },
    });

    // Determine final open and close times
    let openTime = '07:00';
    let closeTime = '22:00';
    let isCompletelyClosed = false;

    if (opOverride) {
      if (opOverride.isClosed) {
        isCompletelyClosed = true;
      } else {
        if (opOverride.openTime) openTime = opOverride.openTime;
        if (opOverride.closeTime) closeTime = opOverride.closeTime;
      }
    } else if (defaultHours) {
      openTime = defaultHours.openTime;
      closeTime = defaultHours.closeTime;
    }

    // 3. Get manual slot overrides
    const slotOverrides = await prisma.slotOverride.findMany({
      where: { fieldId, date: targetDate },
    });
    const overrideMap = new Map<string, SlotStatusType>();
    for (const so of slotOverrides) {
      overrideMap.set(so.slotTime, so.status as SlotStatusType);
    }

    // 4. Get active bookings (PENDING or CONFIRMED)
    // Bookings have startTime and endTime, and they cover multiple slots possibly.
    // E.g., startTime "08:00", endTime "10:00" -> covers "08:00" and "09:00"
    const bookings = await prisma.booking.findMany({
      where: {
        fieldId,
        date: targetDate,
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      },
      select: { startTime: true, endTime: true },
    });

    // Create 24 slots
    const slots: SlotAvailability[] = [];

    for (let i = 0; i < 24; i++) {
      const hourStr = i.toString().padStart(2, '0');
      const time = `${hourStr}:00`;
      
      let status: SlotStatusType = 'AVAILABLE';

      // Rule A: Outside operational hours or completely closed
      if (isCompletelyClosed || time < openTime || time >= closeTime) {
        status = 'CLOSED';
      }

      // Rule B: Overridden by slot override (admin manual override)
      if (overrideMap.has(time)) {
        status = overrideMap.get(time)!;
      }

      // Rule C: Overridden by existing booking (only check non-closed/maintenance slots)
      if (status !== 'CLOSED' && status !== 'MAINTENANCE') {
        const isBooked = bookings.some((b: { startTime: string; endTime: string }) => time >= b.startTime && time < b.endTime);
        if (isBooked) {
          status = 'BOOKED';
        }
      }

      slots.push({
        time,
        status,
        price: field.pricePerSlot,
      });
    }

    return slots;
  },

  /**
   * Check if requested slots are completely available sequentially.
   * Returns true if valid, throws Error if invalid or booked.
   */
  validateBookingRequest: async (
    fieldId: bigint,
    dateString: string,
    startTime: string,
    endTime: string,
    requestedSlotsCount: number
  ): Promise<boolean> => {
    // Basic format check
    if (requestedSlotsCount < 1 || requestedSlotsCount > 5) {
      throw new Error('Jumlah slot harus antara 1 sampai 5. Lebih dari itu, silakan hubungi admin via WhatsApp.');
    }

    const availableSlots = await slotService.getSlotsForDate(fieldId, dateString);
    
    // Find the start index
    const startIndex = availableSlots.findIndex(s => s.time === startTime);
    if (startIndex === -1) {
      throw new Error('Jam mulai tidak valid');
    }

    // Check sequentially
    for (let i = 0; i < requestedSlotsCount; i++) {
      const currentSlot = availableSlots[startIndex + i];
      if (!currentSlot) {
        throw new Error('Jadwal melewati batas operasional (24:00)');
      }
      if (currentSlot.status !== 'AVAILABLE') {
        throw new Error(`Slot pada jam ${currentSlot.time} sudah tidak tersedia (${currentSlot.status})`);
      }
    }

    // Verify endTime matches
    const expectedEndTimeObj = availableSlots[startIndex + requestedSlotsCount];
    const expectedEndTime = expectedEndTimeObj ? expectedEndTimeObj.time : '24:00'; // if last slot is 23:00, ends at 24:00/00:00 next day
    
    // Since '24:00' isn't explicitly in the slots array (usually), handle 23:00 -> 00:00 cross day logic if needed.
    // We assume endTime from frontend is correct if requestedSlotsCount matches the duration.
    let expectedEndHour = (parseInt(startTime.split(':')[0]) + requestedSlotsCount).toString().padStart(2, '0');
    let expectedEnd = `${expectedEndHour}:00`;
    if (expectedEndHour === '24') {
        expectedEnd = '24:00';
    }

    if (expectedEnd !== endTime) {
        throw new Error(`Kalkulasi jam akhir tidak cocok. Ekspektasi: ${expectedEnd}, Diterima: ${endTime}`);
    }

    return true;
  }
};
