import { prisma } from '../utils/prisma';
import { PromoType, PromoApplicableTo } from '@prisma/client';

interface CheckPromoInput {
  code: string;
  fieldId: number | string;
  totalSlots: number;
  basePrice: number;
  userId?: number | string;
}

export const promoService = {
  async checkPromo(input: CheckPromoInput) {
    const { code, fieldId, totalSlots, basePrice, userId } = input;
    
    // Find active promo
    const promo = await prisma.promo.findUnique({
      where: { code },
      include: {
        fields: true,
      }
    });

    if (!promo || !promo.isActive) {
      return { valid: false, message: 'Promo code is invalid or inactive' };
    }

    const now = new Date();
    if (now < promo.startDate) {
      return { valid: false, message: 'Promo code is not yet active' };
    }
    if (now > promo.endDate) {
      return { valid: false, message: 'Promo code has expired' };
    }

    // Check application limit
    if (promo.maxUsage !== null && promo.currentUsage >= promo.maxUsage) {
      return { valid: false, message: 'Promo code usage limit reached' };
    }

    // Check specific fields
    if (promo.applicableTo === PromoApplicableTo.SPECIFIC_FIELDS) {
      const isApplicable = promo.fields.some(pf => pf.fieldId.toString() === fieldId.toString());
      if (!isApplicable) {
        return { valid: false, message: 'Promo code is not applicable for this field' };
      }
    }

    // Check per-user limit
    if (userId && promo.maxUsagePerUser !== null) {
      const userUsageCount = await prisma.promoUsage.count({
        where: {
          promoId: promo.id,
          userId: BigInt(userId)
        }
      });
      if (userUsageCount >= promo.maxUsagePerUser) {
        return { valid: false, message: 'You have reached the maximum usage for this promo code' };
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (promo.type === PromoType.PERCENTAGE) {
      discountAmount = Math.floor((basePrice * promo.value) / 100);
      // Optional: cap discount amount if there was a max discount field
    } else if (promo.type === PromoType.NOMINAL) {
      discountAmount = promo.value;
    }

    // Ensure discount does not exceed base price
    if (discountAmount > basePrice) {
      discountAmount = basePrice;
    }

    const finalPrice = basePrice - discountAmount;

    return {
      valid: true,
      discountAmount,
      finalPrice,
      promoId: promo.id.toString(),
    };
  }
};
