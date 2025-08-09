import * as React from 'react';

/**
 * Custom debounce hook for values
 *
 * Delays updating a value until after a specified delay period.
 * Useful for preventing rapid state changes during scrolling.
 *
 * @template T - The type of the value to debounce
 * @param value - The current value
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 *
 * @example
 * ```ts
 * const debouncedScrollPosition = useDebounce(scrollY, 100);
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
