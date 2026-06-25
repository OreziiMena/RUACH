'use client';

import { useSession } from 'next-auth/react';
import { notFound, useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { data, status } = useSession();
  const userRole = data?.user.role;

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'authenticated' && userRole !== 'ADMIN') {
      return notFound();
    }
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, userRole, router]);

  if (userRole === 'ADMIN') {
    return children;
  } else {
    return null;
  }
};

export default AdminLayout;
