import 'minireset.css';

import './global.css';

import { Analytics } from '@vercel/analytics/react';
import { Inter } from 'next/font/google';
import type { FC, ReactNode } from 'react';

const inter = Inter({
  display: 'swap',
  subsets: ['latin'],
});

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout: FC<RootLayoutProps> = ({ children }) => (
  <html lang="en">
    <head>
      <meta content="width=device-width, initial-scale=1" name="viewport" />
    </head>
    <body className={inter.className}>
      {children}
      <Analytics />
    </body>
  </html>
);

export default RootLayout;
