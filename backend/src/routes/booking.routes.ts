import { Router } from 'express';
import { bookingController } from '../controllers/booking.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

// All booking routes require authentication
router.use(authenticate);

router.get('/', bookingController.getMyBookings);
router.post('/', bookingController.createBooking);
router.get('/:id', bookingController.getBookingById);

export default router;
