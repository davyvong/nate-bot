import { FC } from 'react';

import styles from './component.module.css';

const LoadingIndicator: FC = () => (
  <span className={styles.loadingIndicator}>
    <span className={styles.loadingIndicatorCube} />
    <span className={styles.loadingIndicatorCube} />
  </span>
);

export default LoadingIndicator;
