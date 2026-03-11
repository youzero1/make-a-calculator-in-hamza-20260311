'use client';

import { useState, useEffect, useCallback } from 'react';
import Display from './Display';
import Button from './Button';
import History from './History';
import styles from './Calculator.module.css';
import { CalculationRecord } from '../types';

type ButtonConfig = {
  label: string;
  value: string;
  variant?: 'operator' | 'equals' | 'function' | 'zero' | 'default';
};

const BUTTONS: ButtonConfig[][] = [
  [
    { label: 'C', value: 'clear', variant: 'function' },
    { label: '⌫', value: 'backspace', variant: 'function' },
    { label: '%', value: '%', variant: 'operator' },
    { label: '÷', value: '/', variant: 'operator' },
  ],
  [
    { label: '7', value: '7' },
    { label: '8', value: '8' },
    { label: '9', value: '9' },
    { label: '×', value: '*', variant: 'operator' },
  ],
  [
    { label: '4', value: '4' },
    { label: '5', value: '5' },
    { label: '6', value: '6' },
    { label: '-', value: '-', variant: 'operator' },
  ],
  [
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '+', value: '+', variant: 'operator' },
  ],
  [
    { label: '0', value: '0', variant: 'zero' },
    { label: '.', value: '.' },
    { label: '=', value: '=', variant: 'equals' },
  ],
];

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [prevValue, setPrevValue] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<CalculationRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/calculations');
      const data = await res.json();
      if (data.success) {
        setHistory(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch history', e);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const saveCalculation = useCallback(async (expr: string, result: string) => {
    try {
      await fetch('/api/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression: expr, result }),
      });
      fetchHistory();
    } catch (e) {
      console.error('Failed to save calculation', e);
    }
  }, [fetchHistory]);

  const clearHistory = useCallback(async () => {
    try {
      await fetch('/api/calculations', { method: 'DELETE' });
      setHistory([]);
    } catch (e) {
      console.error('Failed to clear history', e);
    }
  }, []);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setExpression('');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  }, []);

  const handleBackspace = useCallback(() => {
    if (waitingForOperand) return;
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  }, [display, waitingForOperand]);

  const handleDigit = useCallback((digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      if (display === '0' && digit !== '.') {
        setDisplay(digit);
      } else if (digit === '.' && display.includes('.')) {
        return;
      } else {
        setDisplay(display + digit);
      }
    }
  }, [display, waitingForOperand]);

  const calculate = useCallback((a: string, op: string, b: string): string => {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    switch (op) {
      case '+':
        return String(numA + numB);
      case '-':
        return String(numA - numB);
      case '*':
        return String(numA * numB);
      case '/':
        if (numB === 0) return 'Error';
        return String(numA / numB);
      default:
        return b;
    }
  }, []);

  const handleOperator = useCallback((op: string) => {
    if (op === '%') {
      const current = parseFloat(display);
      const result = String(current / 100);
      setDisplay(result);
      setWaitingForOperand(false);
      return;
    }

    const currentValue = display;

    if (operator && !waitingForOperand && prevValue !== null) {
      const result = calculate(prevValue, operator, currentValue);
      const expr = `${prevValue} ${operator === '*' ? '×' : operator === '/' ? '÷' : operator} ${currentValue}`;
      if (result !== 'Error') {
        saveCalculation(expr, result);
      }
      setDisplay(result);
      setPrevValue(result);
      setExpression(`${result} ${op === '*' ? '×' : op === '/' ? '÷' : op}`);
    } else {
      setPrevValue(currentValue);
      setExpression(`${currentValue} ${op === '*' ? '×' : op === '/' ? '÷' : op}`);
    }

    setOperator(op);
    setWaitingForOperand(true);
  }, [display, operator, waitingForOperand, prevValue, calculate, saveCalculation]);

  const handleEquals = useCallback(() => {
    if (!operator || prevValue === null) return;

    const currentValue = display;
    const result = calculate(prevValue, operator, currentValue);
    const opDisplay = operator === '*' ? '×' : operator === '/' ? '÷' : operator;
    const expr = `${prevValue} ${opDisplay} ${currentValue}`;

    if (result !== 'Error') {
      saveCalculation(expr, result);
    }

    setDisplay(result);
    setExpression(`${expr} =`);
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(true);
  }, [display, operator, prevValue, calculate, saveCalculation]);

  const handleButton = useCallback((value: string) => {
    if (value === 'clear') {
      handleClear();
    } else if (value === 'backspace') {
      handleBackspace();
    } else if (value === '=') {
      handleEquals();
    } else if (['+', '-', '*', '/', '%'].includes(value)) {
      handleOperator(value);
    } else {
      handleDigit(value);
    }
  }, [handleClear, handleBackspace, handleEquals, handleOperator, handleDigit]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      if (key >= '0' && key <= '9') handleButton(key);
      else if (key === '.') handleButton('.');
      else if (key === '+') handleButton('+');
      else if (key === '-') handleButton('-');
      else if (key === '*') handleButton('*');
      else if (key === '/') { e.preventDefault(); handleButton('/'); }
      else if (key === '%') handleButton('%');
      else if (key === 'Enter' || key === '=') handleButton('=');
      else if (key === 'Backspace') handleButton('backspace');
      else if (key === 'Escape') handleButton('clear');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleButton]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Calculator</h1>
          <button
            className={styles.historyToggle}
            onClick={() => setShowHistory(!showHistory)}
            aria-label="Toggle history"
          >
            {showHistory ? '✕' : '🕐'}
          </button>
        </div>

        <div className={styles.calculatorBody}>
          <Display value={display} expression={expression} />

          <div className={styles.buttons}>
            {BUTTONS.map((row, rowIdx) => (
              <div key={rowIdx} className={styles.row}>
                {row.map((btn) => (
                  <Button
                    key={btn.value}
                    label={btn.label}
                    value={btn.value}
                    variant={btn.variant || 'default'}
                    onClick={handleButton}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {showHistory && (
          <History
            history={history}
            loading={historyLoading}
            onClear={clearHistory}
            onClose={() => setShowHistory(false)}
          />
        )}
      </div>
    </div>
  );
}
