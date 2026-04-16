import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authenticate } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

// Public - list active payment methods
router.get('/', paymentController.getPaymentMethods);

// User - upload payment proof for a specific booking
router.post(
  '/bookings/:id/payment',
  authenticate,
  upload.single('proof'),
  paymentController.uploadPaymentProof
);

export default router;
