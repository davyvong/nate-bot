'use client';

import DiscordLogoSVG from 'assets/images/discord-logo.svg';
import classNames from 'classnames';
import ClientEnvironment from 'client/environment';
import mobileHeaderStyles from 'components/mobile-header/component.module.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import pkg from 'package.json';
import { FC, useEffect } from 'react';

import styles from './component.module.css';

const Sidebar: FC = () => {
  const pathname = usePathname();

  useEffect(() => {
    const closeSidebar = (event: MouseEvent): void => {
      const sidebar = document.querySelector('.' + styles.sidebarOpened);
      const mobileHeader = document.querySelector('.' + mobileHeaderStyles.mobileHeader);
      const target = event.target as Node;
      if (sidebar && !sidebar.contains(target) && mobileHeader && !mobileHeader.contains(target)) {
        sidebar.classList.remove(styles.sidebarOpened);
      }
    };
    window.addEventListener('click', closeSidebar);
    return () => {
      window.removeEventListener('click', closeSidebar);
    };
  }, []);

  return (
    <div className={styles.sidebar}>
      <div className={styles.heading}>
        <DiscordLogoSVG className={styles.logo} height={24} width={28} />
        <span>{pkg.name}</span>
        <span className={styles.commit}>@{ClientEnvironment.getCommitId()}</span>
      </div>
      <div className={styles.menuList}>
        <Link className={classNames(styles.menuItem, pathname === '/browse' && styles.menuItemActive)} href="/browse">
          Browse
        </Link>
        <Link className={classNames(styles.menuItem, pathname === '/' && styles.menuItemActive)} href="/">
          Saved Locations
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
