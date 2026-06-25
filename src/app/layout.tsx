import type { Metadata } from 'next';
import { Geist, Geist_Mono, Cinzel, Montserrat } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingCart from '@/components/FloatingCart';
import Provider from '@/components/Provider';
import { SessionProvider } from 'next-auth/react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const cinzel = Cinzel({
  variable: '--font-cinzel',
  subsets: ['latin'],
});

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
});

export const metadata = {
  title: "RUACH H. FASHION | Premium Fashion Design",
  description: "Discover RUACH H. FASHION's latest collections blending contemporary design with timeless aesthetics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} ${montserrat.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <Provider>
            <main className="pageWrapper">
              <Navbar />
              {children}
              <FloatingCart />
              <Footer />
            </main>
          </Provider>
        </SessionProvider>
      </body>
    </html>
  );
}
