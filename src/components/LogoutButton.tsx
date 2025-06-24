'use client';
import { useTransition } from 'react';
import { logoutUser } from '@/actions/auth.actions';
import { toast } from 'sonner';

const LogoutButton = () => {
  const [isPending, startTransition] = useTransition();

  const handleLogout = async () => {
    startTransition(async () => {
      try {
        const result = await logoutUser();

        if (result.success) {
          // Show toast and wait for it to be visible
          toast.success('You have been logged out', {
            duration: 2000,
            onDismiss: () => {
              // Only redirect after toast is dismissed or after timeout
              window.location.href = '/login';
            },
          });

          // Fallback redirect in case toast doesn't dismiss properly
          setTimeout(() => {
            window.location.href = '/login';
          }, 2500);
        } else {
          toast.error(result.message || 'Logout failed');
        }
      } catch (error) {
        console.error('Logout error:', error);
        toast.error('An unexpected error occurred');
      }
    });
  };

  return (
    <button
      type='button'
      onClick={handleLogout}
      disabled={isPending}
      className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed'
    >
      {isPending ? 'Logging out...' : 'Logout'}
    </button>
  );
};

export default LogoutButton;
