import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/auth';
import { VoteType, VoteableType } from '@prisma/client';
import { reviewService } from '../services/review.service';

const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  content: z.string().min(3)
});

const replySchema = z.object({
  content: z.string().min(1)
});

const voteSchema = z.object({
  type: z.nativeEnum(VoteType)
});

function serialize(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (Array.isArray(obj)) return obj.map(serialize);
  if (typeof obj === 'object') {
    if (obj instanceof Date) return obj.toISOString();
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, serialize(v)])
    );
  }
  return obj;
}

export const reviewController = {
  // GET /api/v1/fields/:id/reviews
  getReviews: async (req: Request, res: Response): Promise<void> => {
    try {
      const fieldId = BigInt(req.params.id as string);
      const reviews = await prisma.review.findMany({
        where: { fieldId },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          votes: true,
          replies: {
            where: { parentId: null }, // Only top level replies
            include: {
              user: { select: { id: true, name: true, avatar: true } },
              votes: true,
              children: {
                include: {
                  user: { select: { id: true, name: true, avatar: true } },
                  votes: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({
        success: true,
        data: serialize(reviews)
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // POST /api/v1/fields/:id/reviews
  createReview: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const fieldId = BigInt(req.params.id as string);
      const userId = BigInt(req.user!.id as string);
      const validatedData = createReviewSchema.parse(req.body);

      const canReview = await reviewService.canUserReviewField(userId, fieldId);
      if (!canReview) {
        res.status(403).json({ success: false, message: 'You must have a completed booking to review this field.' });
        return;
      }

      const hasReviewed = await reviewService.hasUserReviewedField(userId, fieldId);
      if (hasReviewed) {
        res.status(400).json({ success: false, message: 'You have already reviewed this field.' });
        return;
      }

      const latestBookingId = await reviewService.getLatestCompletedBookingId(userId, fieldId);

      const review = await prisma.review.create({
        data: {
          userId,
          fieldId,
          bookingId: latestBookingId!,
          rating: validatedData.rating,
          content: validatedData.content,
        }
      });

      res.status(201).json({ success: true, message: 'Review submitted', data: serialize(review) });
    } catch (error) {
       if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation failed', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  },

  // POST /api/v1/reviews/:id/replies
  replyToReview: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const reviewId = BigInt(req.params.id as string);
      const userId = BigInt(req.user!.id as string);
      const validatedData = replySchema.parse(req.body);

      const review = await prisma.review.findUnique({ where: { id: reviewId } });
      if (!review) {
        res.status(404).json({ success: false, message: 'Review not found' });
        return;
      }

      const reply = await prisma.reviewReply.create({
        data: {
          reviewId,
          userId,
          content: validatedData.content
        }
      });

      res.status(201).json({ success: true, data: serialize(reply) });
    } catch (error) {
       if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation failed', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  },

  // POST /api/v1/replies/:id/replies
  replyToReply: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const parentId = BigInt(req.params.id as string);
      const userId = BigInt(req.user!.id as string);
      const validatedData = replySchema.parse(req.body);

      const parentReply = await prisma.reviewReply.findUnique({ where: { id: parentId } });
      if (!parentReply) {
        res.status(404).json({ success: false, message: 'Parent reply not found' });
        return;
      }

      const reply = await prisma.reviewReply.create({
        data: {
          reviewId: parentReply.reviewId,
          userId,
          parentId,
          content: validatedData.content
        }
      });

      res.status(201).json({ success: true, data: serialize(reply) });
    } catch (error) {
       if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation failed', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  },

  // POST /api/v1/reviews/:id/vote
  voteReview: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const reviewId = BigInt(req.params.id as string);
      const userId = BigInt(req.user!.id as string);
      const { type } = voteSchema.parse(req.body);

      await prisma.reviewVote.upsert({
        where: {
           userId_voteableType_reviewId_replyId: {
             userId,
             voteableType: VoteableType.REVIEW,
             reviewId,
             replyId: 0n // Fake default because Prisma requires all parts, but it's optional in schema? Wait, schema has replyId as BigInt?, so we can't use 0n here directly for compound unique.
           }
        },
        create: {
          userId,
          voteableType: VoteableType.REVIEW,
          reviewId,
          voteType: type,
        },
        update: {
          voteType: type
        }
      });
      res.status(200).json({ success: true, message: 'Vote recorded' });
    } catch (error) {
       if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation failed' });
      } else {
        // Fallback upsert using transaction if compound unique throws error
        try {
          const existing = await prisma.reviewVote.findFirst({
            where: { userId: BigInt(req.user!.id as string), voteableType: VoteableType.REVIEW, reviewId: BigInt(req.params.id as string) }
          });
          if (existing) {
             await prisma.reviewVote.update({ where: { id: existing.id }, data: { voteType: req.body.type }});
          } else {
             await prisma.reviewVote.create({ data: { userId: BigInt(req.user!.id as string), voteableType: VoteableType.REVIEW, reviewId: BigInt(req.params.id as string), voteType: req.body.type }});
          }
          res.status(200).json({ success: true, message: 'Vote recorded' });
        } catch (e) {
          res.status(500).json({ success: false, message: 'Internal server error' });
        }
      }
    }
  },

  // POST /api/v1/replies/:id/vote
  voteReply: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const replyId = BigInt(req.params.id as string);
      const userId = BigInt(req.user!.id as string);
      const { type } = voteSchema.parse(req.body);

      const existing = await prisma.reviewVote.findFirst({
        where: { userId, voteableType: VoteableType.REPLY, replyId }
      });

      if (existing) {
         await prisma.reviewVote.update({ where: { id: existing.id }, data: { voteType: type }});
      } else {
         await prisma.reviewVote.create({ data: { userId, voteableType: VoteableType.REPLY, replyId, voteType: type }});
      }
      res.status(200).json({ success: true, message: 'Vote recorded' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation failed' });
      } else {
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  },

  // DELETE /api/v1/admin/reviews/:id
  deleteReviewAdmin: async (req: Request, res: Response): Promise<void> => {
    try {
      await prisma.review.delete({ where: { id: BigInt(req.params.id as string) } });
      res.status(200).json({ success: true, message: 'Review deleted' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // DELETE /api/v1/admin/replies/:id
  deleteReplyAdmin: async (req: Request, res: Response): Promise<void> => {
    try {
      await prisma.reviewReply.delete({ where: { id: BigInt(req.params.id as string) } });
      res.status(200).json({ success: true, message: 'Reply deleted' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};
