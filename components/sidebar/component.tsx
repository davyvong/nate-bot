'use client';

import DiscordLogoSVG from 'assets/images/discord-logo.svg';
import ClientEnvironment from 'client/environment';
import mobileHeaderStyles from 'components/mobile-header/component.module.css';
import pkg from 'package.json';
import { useEffect } from 'react';

import styles from './component.module.css';

const Sidebar = () => {
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
    </div>
  );
};

export default Sidebar;
