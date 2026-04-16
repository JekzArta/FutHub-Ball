import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { z } from 'zod';
import { PromoType, PromoApplicableTo } from '@prisma/client';
import { promoService } from '../services/promoService';
import { AuthRequest } from '../middlewares/auth';

const checkPromoSchema = z.object({
  code: z.string(),
  field_id: z.number().or(z.string().transform(Number)),
  total_slots: z.number(),
  base_price: z.number(),
});

const createPromoSchema = z.object({
  code: z.string().min(3),
  type: z.nativeEnum(PromoType),
  value: z.number().positive(),
  applicable_to: z.nativeEnum(PromoApplicableTo),
  start_date: z.string(),
  end_date: z.string(),
  max_usage: z.number().nullable().optional(),
  max_usage_per_user: z.number().nullable().optional(),
  field_ids: z.array(z.number()).optional(), // required if applicable_to is SPECIFIC_FIELDS
});

export const promoController = {
  // POST /api/v1/promos/check
  checkPromo: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const validatedData = checkPromoSchema.parse(req.body);
      const userId = req.user?.id;

      const result = await promoService.checkPromo({
        code: validatedData.code,
        fieldId: validatedData.field_id,
        totalSlots: validatedData.total_slots,
        basePrice: validatedData.base_price,
        userId: userId,
      });

      if (!result.valid) {
        res.status(400).json({ success: false, message: result.message });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          valid: true,
          discount_amount: result.discountAmount,
          final_price: result.finalPrice,
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation failed', errors: error.issues });
      } else {
        console.error('Check promo error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  },

  // GET /api/v1/admin/promos
  getPromos: async (req: Request, res: Response): Promise<void> => {
    try {
      const promos = await prisma.promo.findMany({
        include: {
          fields: {
            include: {
              field: { select: { id: true, name: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // BigInt serialization handeling
      const serializedPromos = promos.map((p) => ({
        ...p,
        id: p.id.toString(),
        fields: p.fields.map(pf => ({ ...pf, id: pf.id.toString(), fieldId: pf.fieldId.toString(), promoId: pf.promoId.toString(), field: { ...pf.field, id: pf.field.id.toString() } }))
      }));

      res.status(200).json({
        success: true,
        message: 'Promos fetched successfully',
        data: serializedPromos,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // POST /api/v1/admin/promos
  createPromo: async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = createPromoSchema.parse(req.body);

      // check code uniqueness
      const existing = await prisma.promo.findUnique({ where: { code: validatedData.code } });
      if (existing) {
        res.status(400).json({ success: false, message: 'Promo code already exists' });
        return;
      }

      if (validatedData.applicable_to === PromoApplicableTo.SPECIFIC_FIELDS && (!validatedData.field_ids || validatedData.field_ids.length === 0)) {
        res.status(400).json({ success: false, message: 'Field IDs are required when applying to specific fields' });
        return;
      }

      const promo = await prisma.promo.create({
        data: {
          code: validatedData.code,
          type: validatedData.type,
          value: validatedData.value,
          applicableTo: validatedData.applicable_to,
          startDate: new Date(validatedData.start_date),
          endDate: new Date(validatedData.end_date),
          maxUsage: validatedData.max_usage || null,
          maxUsagePerUser: validatedData.max_usage_per_user || null,
          fields: validatedData.applicable_to === PromoApplicableTo.SPECIFIC_FIELDS ? {
            create: validatedData.field_ids?.map(id => ({ fieldId: BigInt(id) }))
          } : undefined
        }
      });

      res.status(201).json({
        success: true,
        message: 'Promo created successfully',
        data: { ...promo, id: promo.id.toString() }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation failed', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  },

  // PUT /api/v1/admin/promos/:id
  updatePromo: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const validatedData = createPromoSchema.parse(req.body);

      // Ensure promo exists
      const existing = await prisma.promo.findUnique({ where: { id: BigInt(id as string) } });
      if (!existing) {
        res.status(404).json({ success: false, message: 'Promo not found' });
        return;
      }

      if (validatedData.code !== existing.code) {
        const codeCheck = await prisma.promo.findUnique({ where: { code: validatedData.code } });
        if (codeCheck) {
          res.status(400).json({ success: false, message: 'Promo code already exists' });
          return;
        }
      }

      // Update in transaction to map field resets
      const promo = await prisma.$transaction(async (tx) => {
        // Delete all old applies
        await tx.promoField.deleteMany({ where: { promoId: BigInt(id as string) } });

        return await tx.promo.update({
          where: { id: BigInt(id as string) },
          data: {
            code: validatedData.code,
            type: validatedData.type,
            value: validatedData.value,
            applicableTo: validatedData.applicable_to,
            startDate: new Date(validatedData.start_date),
            endDate: new Date(validatedData.end_date),
            maxUsage: validatedData.max_usage || null,
            maxUsagePerUser: validatedData.max_usage_per_user || null,
            fields: validatedData.applicable_to === PromoApplicableTo.SPECIFIC_FIELDS ? {
              create: validatedData.field_ids?.map(fId => ({ fieldId: BigInt(fId) }))
            } : undefined
          }
        });
      });

      res.status(200).json({
        success: true,
        message: 'Promo updated successfully',
        data: { ...promo, id: promo.id.toString() }
      });
    } catch (error) {
       if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation failed', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  },

  // DELETE /api/v1/admin/promos/:id
  deletePromo: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await prisma.promo.delete({ where: { id: BigInt(id as string) }});
      res.status(200).json({ success: true, message: 'Promo deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal server error or promo in use' });
    }
  }
};
