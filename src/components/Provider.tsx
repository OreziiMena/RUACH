'use client';

import { useCartStore } from '@/app/store/cartStore';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { Toaster } from 'sonner';

const Provider = ({ children }: { children: React.ReactNode }) => {
  const { status } = useSession();
  const { loadCart } = useCartStore();

  useEffect(() => {
    loadCart();
  }, [status, loadCart]);
  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  );
};

export default Provider;
