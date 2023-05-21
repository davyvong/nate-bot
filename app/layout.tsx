import 'minireset.css';

import './global.css';

import { Analytics } from '@vercel/analytics/react';
import DiscordLogoSVG from 'assets/images/discord-logo.svg';
import ClientEnvironment from 'client/environment';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import pkg from 'package.json';
import { FC, ReactNode } from 'react';

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

const RootLayout: FC<RootLayoutProps> = ({ children }) => (
  <html lang="en">
    <head>
      {/* <link rel="icon" href="/favicon.ico" /> */}
      <meta content="width=device-width, initial-scale=1" name="viewport" />
    </head>
    <body className={inter.className}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeading}>
          <DiscordLogoSVG className={styles.sidebarHeadingLogo} height={24} width={28} />
          <span>{pkg.name}</span>
          <span className={styles.sidebarHeadingCommit}>@{ClientEnvironment.getCommitId()}</span>
        </div>
      </div>
      <div className={styles.main}>{children}</div>
      <Analytics />
    </body>
  </html>
);

export default RootLayout;
