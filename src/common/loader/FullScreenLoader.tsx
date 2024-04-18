import React from 'react';
import styles from './FullScreenLoader.module.scss';
import { Loader } from './Loader';

export const FullScreenLoader = () => (
  <div className={styles.loader}>
    <Loader />
  </div>
);
