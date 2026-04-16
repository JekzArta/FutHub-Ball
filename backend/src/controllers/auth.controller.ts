import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { generateToken } from '../utils/jwt';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/auth';
import { Role } from '@prisma/client';

// Schemas for validation
const registerSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string(),
});

const updateProfileSchema = z.object({
  name: z.string().min(3).optional(),
  phone: z.string().optional(),
  avatar: z.string().optional().nullable(),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6),
});

export const authController = {
  // POST /api/v1/auth/register
  register: async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = registerSchema.parse(req.body);

      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (existingUser) {
        res.status(400).json({ success: false, message: 'Email already registered' });
        return;
      }

      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      const user = await prisma.user.create({
        data: {
          ...validatedData,
          password: hashedPassword,
        },
      });

      // Prisma BigInt workaround manually converting `id` if passing raw to jwt
      const token = generateToken(user);

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user: {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          },
          token,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation failed', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  },

  // POST /api/v1/auth/login
  login: async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = loginSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (!user || !user.isActive) {
        res.status(401).json({ success: false, message: 'Invalid email or password' });
        return;
      }

      const isValidPassword = await bcrypt.compare(validatedData.password, user.password);

      if (!isValidPassword) {
        res.status(401).json({ success: false, message: 'Invalid email or password' });
        return;
      }

      const token = generateToken(user);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          },
          token,
        },
      });
    } catch (error) {
       if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation failed', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  },

  // POST /api/v1/auth/admin/login
  adminLogin: async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = loginSchema.parse(req.body);

      const admin = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (!admin || admin.role !== Role.ADMIN) {
        res.status(401).json({ success: false, message: 'Invalid admin credentials' });
        return;
      }

      const isValidPassword = await bcrypt.compare(validatedData.password, admin.password);

      if (!isValidPassword) {
        res.status(401).json({ success: false, message: 'Invalid admin credentials' });
        return;
      }

      const token = generateToken(admin);

      res.status(200).json({
        success: true,
        message: 'Admin login successful',
        data: {
          user: {
            id: admin.id.toString(),
            name: admin.name,
            email: admin.email,
            role: admin.role,
          },
          token,
        },
      });
    } catch (error) {
       if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation failed', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  },

  // GET /api/v1/auth/me
  getMe: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: BigInt(userId) },
        select: { id: true, name: true, email: true, phone: true, avatar: true, role: true, createdAt: true },
      });

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User profile fetched successfully',
        data: user,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // PUT /api/v1/auth/profile
  updateProfile: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const validatedData = updateProfileSchema.parse(req.body);

      const updatedUser = await prisma.user.update({
        where: { id: BigInt(userId) },
        data: validatedData,
        select: { id: true, name: true, email: true, phone: true, avatar: true, role: true },
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { ...updatedUser, id: updatedUser.id.toString() },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation failed', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  },

  // PUT /api/v1/auth/password
  updatePassword: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const validatedData = updatePasswordSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { id: BigInt(userId) },
      });

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      const isValidPassword = await bcrypt.compare(validatedData.currentPassword, user.password);
      if (!isValidPassword) {
        res.status(400).json({ success: false, message: 'Current password is incorrect' });
        return;
      }

      const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);

      await prisma.user.update({
        where: { id: BigInt(userId) },
        data: { password: hashedPassword },
      });

      res.status(200).json({
        success: true,
        message: 'Password updated successfully',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation failed', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  },
};
