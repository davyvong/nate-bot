'use client';

import MenuSVG from 'assets/images/icons/menu.svg';
import sidebarStyles from 'components/sidebar/component.module.css';
import UserMenuButton from 'components/user-menu-button';
import { FC, MouseEventHandler } from 'react';
import { DiscordToken } from 'server/discord/types';

import styles from './component.module.css';

interface MobileHeaderProps {
  token: DiscordToken;
}

const MobileHeader: FC<MobileHeaderProps> = ({ token }) => {
  const toggleSidebar: MouseEventHandler<HTMLButtonElement> = (): void => {
    const sidebar = document.querySelector('.' + sidebarStyles.sidebar);
    if (sidebar) {
      sidebar.classList.toggle(sidebarStyles.sidebarOpened);
    }
  };

  return (
    <div className={styles.mobileHeader}>
      <button className={styles.toggleButton} onClick={toggleSidebar}>
        <MenuSVG height={24} width={24} />
      </button>
      <div className={styles.spacer} />
      <UserMenuButton height={36} token={token} width={36} />
    </div>
  );
};

export default MobileHeader;
