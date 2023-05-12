import type { FC, ReactNode } from 'react';

import styles from './component.module.css';

interface PageHeadingProps {
  children: ReactNode;
  secondary?: ReactNode;
}

const PageHeading: FC<PageHeadingProps> = ({ children, secondary }) => (
  <div className={styles.heading}>
    <div className={styles.primary}>{children}</div>
    {secondary && <div className={styles.secondary}>{secondary}</div>}
  </div>
);

export default PageHeading;
