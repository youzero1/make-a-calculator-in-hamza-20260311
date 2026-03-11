import styles from './Button.module.css';

interface ButtonProps {
  label: string;
  value: string;
  variant: 'operator' | 'equals' | 'function' | 'zero' | 'default';
  onClick: (value: string) => void;
}

export default function Button({ label, value, variant, onClick }: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[variant]}`}
      onClick={() => onClick(value)}
      aria-label={label}
    >
      {label}
    </button>
  );
}
