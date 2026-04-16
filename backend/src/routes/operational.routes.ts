import { Router } from 'express';
import { operationalController } from '../controllers/operational.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// All operational routes are Admin only
router.use(authenticate, authorize(['ADMIN']));

// Fields specific operational configurations
router.post('/fields/:id/hours', operationalController.setDefaultHours);
router.post('/fields/:id/overrides', operationalController.setOperationalOverride);
router.post('/fields/:id/slots/overrides', operationalController.setSlotOverride);

export default router;
