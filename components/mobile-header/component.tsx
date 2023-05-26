'use client';

import layoutStyles from 'app/layout.module.css';
import { MouseEventHandler } from 'react';

import styles from './component.module.css';

const MobileHeader = () => {
  const toggleSidebar: MouseEventHandler<HTMLButtonElement> = (): void => {
    const sidebar = document.querySelector('.' + layoutStyles.sidebar);
    if (sidebar) {
      const keyframes = [{ transform: 'translateX(-100%)' }, { transform: 'translateX(0)' }];
      const options = {
        duration: 500,
      };
      sidebar.animate(keyframes, options);
    }
  };

  return (
    <div className={styles.mobileHeader}>
      <button onClick={toggleSidebar}>toggle</button>
    </div>
  );
};

export default MobileHeader;
