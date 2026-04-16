import jwt from 'jsonwebtoken';
import { User, Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';

export const generateToken = (user: User): string => {
  return jwt.sign(
    { id: user.id.toString(), email: user.email, role: user.role },
    JWT_SECRET,
    {
      expiresIn: '7d', // Token valid for 7 days
    }
  );
};
