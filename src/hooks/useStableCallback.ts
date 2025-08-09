import * as React from 'react';

/**
 * Custom hook for managing stable callback references
 *
 * Ensures that callback functions maintain stable references
 * across renders, preventing unnecessary re-renders of child
 * components that depend on these callbacks.
 *
 * @template T - The type of the callback function
 * @param callback - The callback function to stabilize
 * @returns A stable reference to the callback
 *
 * @example
 * ```ts
 * const stableCallback = useStableCallback(() => {
 *   console.log('This callback has a stable reference');
 * });
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
): T {
  const callbackRef = React.useRef<T>(callback);

  React.useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  return React.useCallback(
    ((...args) => callbackRef.current(...args)) as T,
    [],
  );
}
