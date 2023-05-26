import 'minireset.css';

import './global.css';

import { Analytics } from '@vercel/analytics/react';
import ClientEnvironment from 'client/environment';
import MobileHeader from 'components/mobile-header';
import Sidebar from 'components/sidebar';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import pkg from 'package.json';
import { FC, ReactNode } from 'react';
import DiscordAuthentication from 'server/discord/authentication';

import styles from './layout.module.css';

const inter = Inter({
  display: 'swap',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: pkg.name + '@' + ClientEnvironment.getCommitId(),
};

interface RootLayoutProps {
  children: ReactNode;
}

/* @ts-expect-error Async Server Component */
const RootLayout: FC<RootLayoutProps> = async ({ children }) => {
  const token = await DiscordAuthentication.verifyTokenOrRedirect(cookies());

  return (
    <html lang="en">
      <head>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
      </head>
      <body className={inter.className}>
        <MobileHeader token={token} />
        <div className={styles.main}>
          <Sidebar />
          <div className={styles.content}>{children}</div>
        </div>
        <Analytics />
      </body>
    </html>
  );
};

export default RootLayout;
