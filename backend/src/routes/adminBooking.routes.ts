import { Router } from 'express';
import { adminBookingController } from '../controllers/adminBooking.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// All admin booking routes require admin auth
router.use(authenticate, authorize(['ADMIN']));

router.get('/bookings', adminBookingController.getAllBookings);
router.get('/bookings/:id', adminBookingController.getBookingById);
router.put('/bookings/:id/approve', adminBookingController.approveBooking);
router.put('/bookings/:id/reject', adminBookingController.rejectBooking);
router.put('/bookings/:id/complete', adminBookingController.completeBooking);
router.put('/bookings/:id/refund', adminBookingController.noteRefund);

export default router;
