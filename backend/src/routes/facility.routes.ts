import { Router } from 'express';
import { facilityController } from '../controllers/facility.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// Public routes
router.get('/', facilityController.getAllFacilities);

// Admin routes
router.post('/', authenticate, authorize(['ADMIN']), facilityController.createFacility);
router.delete('/:id', authenticate, authorize(['ADMIN']), facilityController.deleteFacility);

export default router;
