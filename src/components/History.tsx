'use client';

import { CalculationRecord } from '../types';
import styles from './History.module.css';

interface HistoryProps {
  history: CalculationRecord[];
  loading: boolean;
  onClear: () => void;
  onClose: () => void;
}

export default function History({ history, loading, onClear, onClose }: HistoryProps) {
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className={styles.historyPanel}>
      <div className={styles.historyHeader}>
        <h2 className={styles.historyTitle}>History</h2>
        <div className={styles.headerActions}>
          {history.length > 0 && (
            <button className={styles.clearBtn} onClick={onClear}>
              Clear All
            </button>
          )}
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close history">✕</button>
        </div>
      </div>

      <div className={styles.historyList}>
        {loading ? (
          <div className={styles.empty}>Loading...</div>
        ) : history.length === 0 ? (
          <div className={styles.empty}>No calculations yet</div>
        ) : (
          history.map((item) => (
            <div key={item.id} className={styles.historyItem}>
              <div className={styles.itemExpression}>{item.expression}</div>
              <div className={styles.itemResult}>= {item.result}</div>
              <div className={styles.itemDate}>{formatDate(item.createdAt)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
