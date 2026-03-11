import styles from './Display.module.css';

interface DisplayProps {
  value: string;
  expression: string;
}

export default function Display({ value, expression }: DisplayProps) {
  const fontSize = value.length > 12
    ? '1.6rem'
    : value.length > 9
    ? '2rem'
    : value.length > 6
    ? '2.4rem'
    : '2.8rem';

  return (
    <div className={styles.display}>
      <div className={styles.expression}>
        {expression || '\u00A0'}
      </div>
      <div className={styles.value} style={{ fontSize }}>
        {value === 'Error' ? (
          <span className={styles.error}>Error</span>
        ) : (
          value
        )}
      </div>
    </div>
  );
}
