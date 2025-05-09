import { useState, useEffect, useRef } from 'react';

/**
 * 値の更新を指定した間隔でスロットリングするカスタムフック
 * @param value スロットリングする値
 * @param delay スロットリングの間隔（ミリ秒）
 * @returns スロットリングされた値
 */
export function useThrottledValue<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdatedRef = useRef<number>(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdatedRef.current;

    if (timeSinceLastUpdate >= delay) {
      // 前回の更新から指定時間経過していれば即時更新
      lastUpdatedRef.current = now;
      setThrottledValue(value);
    } else {
      // そうでなければ、残り時間後に更新するようにスケジュール
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        lastUpdatedRef.current = Date.now();
        setThrottledValue(value);
        timeoutRef.current = null;
      }, delay - timeSinceLastUpdate);
    }

    // クリーンアップ関数
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return throttledValue;
} 