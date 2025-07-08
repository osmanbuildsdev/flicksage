import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '@/lib/db/schema';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (user: Pick<User, 'id' | 'email'>): string => {
  const payload = {
    userId: user.id,
    email: user.email,
  };

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }  const options: SignOptions = {
    expiresIn: '7d',
  };

  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string): any => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Şifre en az 8 karakter olmalıdır');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Şifre en az bir küçük harf içermelidir');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Şifre en az bir büyük harf içermelidir');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Şifre en az bir rakam içermelidir');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};
