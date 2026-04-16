import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const adminUserController = {
  // GET /api/v1/admin/users
  listUsers: async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await prisma.user.findMany({
        where: { role: 'USER' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' }
      });

      const serialized = users.map(u => ({ ...u, id: u.id.toString() }));

      res.status(200).json({ success: true, data: serialized });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // PUT /api/v1/admin/users/:id/toggle
  toggleUserStatus: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = BigInt(req.params.id as string);
      
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
         res.status(404).json({ success: false, message: 'User not found' });
         return;
      }

      if (user.role === 'ADMIN') {
         res.status(400).json({ success: false, message: 'Cannot deactivate admin accounts' });
         return;
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: { isActive: !user.isActive },
        select: { id: true, name: true, isActive: true }
      });

      res.status(200).json({ 
        success: true, 
        message: `User account has been ${updated.isActive ? 'activated' : 'deactivated'}`,
        data: { ...updated, id: updated.id.toString() }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};
