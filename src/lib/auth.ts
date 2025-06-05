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

// this will encrypt and sing token
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

// this will decrypt and verify token
export async function verifyAuthToken<T>(token: string): Promise<T> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as T;
  } catch (error) {
    logEvent(
      'Token decryption failed',
      'auth',
      { tokenSnippet: token.slice(0, 10) },
      'error',
      error
    );
    throw new Error('Token decryption failed');
  }
}

// set the auth cookie
export async function setAuthCookie(token: string) {
  try {
    const cookieStore = await cookies();
    cookieStore.set(cookieName, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
  } catch (error) {
    logEvent('Cookie set failed', 'auth', { token }, 'error');
    throw error;
  }
}
