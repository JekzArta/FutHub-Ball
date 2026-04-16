import { prisma } from '../utils/prisma';
import { BookingStatus } from '@prisma/client';

export const reviewService = {
  async canUserReviewField(userId: bigint, fieldId: bigint): Promise<boolean> {
    const completedBooking = await prisma.booking.findFirst({
      where: {
        userId,
        fieldId,
        status: BookingStatus.COMPLETED
      }
    });
    return !!completedBooking;
  },

  async hasUserReviewedField(userId: bigint, fieldId: bigint): Promise<boolean> {
    const review = await prisma.review.findFirst({
      where: {
        userId,
        fieldId
      }
    });
    return !!review;
  },

  async getLatestCompletedBookingId(userId: bigint, fieldId: bigint): Promise<bigint | null> {
    const booking = await prisma.booking.findFirst({
      where: {
        userId,
        fieldId,
        status: BookingStatus.COMPLETED
      },
      orderBy: { updatedAt: 'desc' }
    });
    return booking ? booking.id : null;
  }
};
