import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { configController } from '../controllers/config.controller';
import { notificationController } from '../controllers/notification.controller';
import { adminUserController } from '../controllers/adminUser.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth';

const router = Router();

// Secure all with Admin Auth
router.use(authenticate, authorizeAdmin);

// Reports
router.get('/dashboard', reportController.getDashboardStats);
router.get('/reports', reportController.getReports);

// Configs
router.get('/configs', configController.getConfigs);
router.put('/configs', configController.updateConfigs);

// Notifications
router.get('/notifications', notificationController.getLogs);
router.post('/notifications/:id/resend', notificationController.resendNotification);

// Users
router.get('/users', adminUserController.listUsers);
router.put('/users/:id/toggle', adminUserController.toggleUserStatus);

export default router;
