import { Router } from 'express';
import { reviewController } from '../controllers/review.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth';

const router = Router();

// Public routes
router.get('/fields/:id/reviews', reviewController.getReviews);

// User routes
router.post('/fields/:id/reviews', authenticate, reviewController.createReview);
router.post('/reviews/:id/replies', authenticate, reviewController.replyToReview);
router.post('/replies/:id/replies', authenticate, reviewController.replyToReply);
router.post('/reviews/:id/vote', authenticate, reviewController.voteReview);
router.post('/replies/:id/vote', authenticate, reviewController.voteReply);

// Admin routes
router.delete('/admin/reviews/:id', authenticate, authorizeAdmin, reviewController.deleteReviewAdmin);
router.delete('/admin/replies/:id', authenticate, authorizeAdmin, reviewController.deleteReplyAdmin);

export default router;
