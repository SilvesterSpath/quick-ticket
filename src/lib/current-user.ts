import { verifyAuthToken, getAuthCookie } from './auth';
import { prisma } from '@/db/prisma';

type AuthPayload = {
  userId: string;
};

export async function getCurrentUser() {
  try {
    const token = await getAuthCookie();
    if (!token) return null;
    const payload = await verifyAuthToken<AuthPayload>(token);

    if (!payload?.userId) return null;

    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) return null;

    return user;
  } catch (error) {
    console.log('Error getting current user', error);
    return null;
  }
}
