import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { getDb, saveDb } from './db';
import { User, UserRole } from '../src/types';

const JWT_SECRET = process.env.JWT_SECRET || 'kiosco-escolar-super-secret-key-2026';

export interface AuthRequest extends Request {
  user?: User;
}

// Inappropriate words filter for visible names
const BANNED_WORDS = [
  'puto', 'puta', 'mierda', 'concha', 'carajo', 'pelotudo', 'boludo', 'choto', 'forro',
  'tarado', 'idiota', 'estupido', 'imbecil', 'nazi', 'hitler', 'violador', 'asesino',
  'droga', 'tula', 'pija', 'verga', 'orto', 'culiao', 'culiado'
];

export function validateVisibleName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'El nombre visible es obligatorio.' };
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return { valid: false, error: 'El nombre visible debe tener al menos 2 caracteres.' };
  }

  if (trimmed.length > 20) {
    return { valid: false, error: 'El nombre visible no puede superar los 20 caracteres.' };
  }

  // Check no numbers allowed
  if (/\d/.test(trimmed)) {
    return { valid: false, error: 'El nombre visible no puede contener números.' };
  }

  // Check only letters, accents and spaces
  const lettersRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
  if (!lettersRegex.test(trimmed)) {
    return { valid: false, error: 'El nombre visible solo puede contener letras y espacios, sin símbolos extraños.' };
  }

  // Check banned offensive words
  const lower = trimmed.toLowerCase();
  for (const word of BANNED_WORDS) {
    if (lower.includes(word)) {
      return { valid: false, error: 'El nombre visible elegido contiene términos inapropiados.' };
    }
  }

  return { valid: true };
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      nombreVisible: user.nombreVisible,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autenticado. Inicie sesión.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: UserRole };
    const db = getDb();
    const user = db.users.find((u) => u.id === decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Usuario inexistente o sesión inválida.' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: 'Tu cuenta ha sido suspendida por la administración.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
}

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de Administrador.' });
  }
  next();
}
