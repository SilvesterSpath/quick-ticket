import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { logEvent } from '@/utils/sentry';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

const cookieName = 'auth-token';

interface JWTPayload {
  userId: string;
  email?: string;
  [key: string]: unknown;
}

export async function signAuthToken(payload: JWTPayload) {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

    return token;
  } catch (error) {
    logEvent('Token sign in failed', 'auth', { payload }, 'error');
    throw error;
  }
}
