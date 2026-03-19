import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

interface AuthResult {
  isAuthenticated: boolean;
  userId?: number;
  username?: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
}

export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-token')?.value;

    if (!token) {
      return { isAuthenticated: false };
    }

    const decoded = jwt.verify(token, getJwtSecret()) as { userId: number; username: string };
    return {
      isAuthenticated: true,
      userId: decoded.userId,
      username: decoded.username
    };
  } catch (error) {
    return { isAuthenticated: false };
  }
}

export function createToken(userId: number, username: string): string {
  return jwt.sign(
    { userId, username },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
}