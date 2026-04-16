import { Router } from 'express';
import { fieldController } from '../controllers/field.controller';
import { slotController } from '../controllers/slot.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

// Public routes
router.get('/', fieldController.getAllFields);
router.get('/:id/slots', slotController.getFieldSlots); // Must be before /:id
router.get('/:id', fieldController.getFieldById);

// Admin routes
router.post('/', authenticate, authorize(['ADMIN']), fieldController.createField);
router.put('/:id', authenticate, authorize(['ADMIN']), fieldController.updateField);

// Optional: add delete field
// router.delete('/:id', authenticate, authorize(['ADMIN']), fieldController.deleteField);

router.post('/:id/facilities', authenticate, authorize(['ADMIN']), fieldController.assignFacilities);

// Photo upload (Admin only)
router.post('/:id/photos', authenticate, authorize(['ADMIN']), upload.single('photo'), fieldController.uploadFieldPhoto);

export default router;
