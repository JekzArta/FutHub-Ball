import { Router } from 'express';
import { promoController } from '../controllers/promo.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth';

const router = Router();

// Public / User routes
router.post('/promos/check', authenticate, promoController.checkPromo);

// Admin routes
router.get('/admin/promos', authenticate, authorizeAdmin, promoController.getPromos);
router.post('/admin/promos', authenticate, authorizeAdmin, promoController.createPromo);
router.put('/admin/promos/:id', authenticate, authorizeAdmin, promoController.updatePromo);
router.delete('/admin/promos/:id', authenticate, authorizeAdmin, promoController.deletePromo);

export default router;
