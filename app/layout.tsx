import 'minireset.css';

import './global.css';

import { Analytics } from '@vercel/analytics/react';
import DiscordLogoSVG from 'assets/images/discord-logo.svg';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import pkg from 'package.json';
import type { FC, ReactNode } from 'react';

import styles from './layout.module.css';

const inter = Inter({
  display: 'swap',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: pkg.name + '@' + process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA.substring(0, 7),
};

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout: FC<RootLayoutProps> = ({ children }) => {
  const title = (metadata.title as string).toUpperCase();

  return (
    <html lang="en">
      <head>
        {/* <link rel="icon" href="/favicon.ico" /> */}
        <meta content="width=device-width, initial-scale=1" name="viewport" />
      </head>
      <body className={inter.className}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeading}>
            <DiscordLogoSVG height={24} width={28} />
            <span>{title}</span>
          </div>
        </div>
        <div className={styles.main}>{children}</div>
        <Analytics />
      </body>
    </html>
  );
};

export default RootLayout;
