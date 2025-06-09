'use server';
import { prisma } from '@/db/prisma';
import bcrypt from 'bcryptjs';
import { logEvent } from '@/utils/sentry';
import { signAuthToken } from '@/lib/auth';
import { setAuthCookie } from '@/lib/auth';

type ResponseResult = {
  success: boolean;
  message: string;
};

// register user
export const registerUser = async (
  prevState: ResponseResult,
  formData: FormData
): Promise<ResponseResult> => {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !password) {
      logEvent(
        'Validation Error: Missing data fields',
        'auth',
        {
          name,
          email,
        },
        'warning'
      );
      return { success: false, message: 'All fields are required' };
    }
    // check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      logEvent(
        `Error: User already exists: ${email}`,
        'auth',
        { email },
        'warning'
      );
      return { success: false, message: 'User already exists' };
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    // sign and set auth cookie
    const token = await signAuthToken({
      userId: user.id,
      email,
    });
    await setAuthCookie(token);

    logEvent('User registered successfully', 'auth', { email }, 'info');
    return { success: true, message: 'User registered successfully' };
  } catch (error) {
    logEvent('Error: Register user', 'auth', {}, 'error', error);
    return { success: false, message: 'Something went wrong' };
  }
};
