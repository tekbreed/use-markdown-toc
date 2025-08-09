import * as React from 'react';
import type {
  TOCHeadings,
  UseMarkdownTocProps,
  UseMarkdownTocReturn,
} from './types';
import { defaultIdGenerator } from './utils/slug';
import { useDebounce } from './hooks/useDebounce';
import { useStableCallback } from './hooks/useStableCallback';

/**
 * Custom hook for creating an interactive table of contents
 *
 * This hook provides a complete solution for creating dynamic table of contents
 * that automatically detects headings, tracks the currently visible section,
 * and provides navigation functionality.
 *
 * @param options - Configuration options for the hook
 * @returns Object containing headings, active state, and utility functions
 */
export const useMarkdownToc = ({
  containerId = 'markdown-content',
  selectors = 'h1, h2, h3, h4, h5, h6',
  rootMargin = '0px 0px -80% 0px',
  threshold = 0.1,
  debounceDelay = 100,
  generateIds = true,
  idGenerator = defaultIdGenerator,
  enableErrorHandling = true,
  onError,
}: UseMarkdownTocProps = {}): UseMarkdownTocReturn => {
  // State management
  const [headings, setHeadings] = React.useState<TOCHeadings>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [internalActiveId, setInternalActiveId] = React.useState<string | null>(
    null,
  );

  // Refs for cleanup and state management
  const observerRef = React.useRef<IntersectionObserver | null>(null);
  const headingElementsRef = React.useRef<HTMLElement[]>([]);
  const mountedRef = React.useRef(true);
  const lastActiveIdRef = React.useRef<string | null>(null);

  // Debounced active ID to prevent rapid state changes
  const debouncedActiveId = useDebounce(internalActiveId, debounceDelay);

  /**
   * Error handler that manages error state and calls custom error handlers
   */
  const handleError = useStableCallback((err: Error, context: string) => {
    if (!enableErrorHandling) return;

    const errorMessage = `useMarkdownToc Error in ${context}: ${err.message}`;
    setError(errorMessage);

    if (onError) {
      onError(err, context);
    } else {
      console.error(errorMessage, err);
    }
  });

  // Clear error when dependencies change
  React.useEffect(() => {
    setError(null);
  }, [containerId, selectors, rootMargin, threshold]);

  /**
   * Cleanup function that disconnects observers and clears references
   */
  const cleanup = useStableCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    headingElementsRef.current = [];
  });

  // Handle hash changes for URL navigation
  React.useEffect(() => {
    const handleHashChange = () => {
      if (!mountedRef.current) return;

      try {
        const hash = window.location.hash.replace('#', '');
        if (hash && hash !== lastActiveIdRef.current) {
          setActiveId(hash);
          lastActiveIdRef.current = hash;
        }
      } catch (err) {
        handleError(err as Error, 'hashchange handler');
      }
    };

    // Initialize with current hash
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [handleError]);

  // Update active ID when debounced value changes
  React.useEffect(() => {
    if (
      debouncedActiveId !== null &&
      debouncedActiveId !== lastActiveIdRef.current
    ) {
      setActiveId(debouncedActiveId);
      lastActiveIdRef.current = debouncedActiveId;
    }
  }, [debouncedActiveId]);

  // Main effect for scanning and observing headings
  React.useEffect(() => {
    setIsLoading(true);
    cleanup();

    /**
     * Scans the document for headings and sets up intersection observers
     */
    const scanHeadings = async () => {
      try {
        // Validate selector
        if (!selectors || typeof selectors !== 'string') {
          throw new Error('Invalid selectors provided');
        }

        // Find container
        const container = containerId
          ? document.getElementById(containerId)
          : document.body;

        if (!container) {
          throw new Error(`Container with id "${containerId}" not found`);
        }

        // Query headings with error handling for invalid selectors
        let headingElements: HTMLElement[];
        try {
          const elements = container.querySelectorAll(selectors);
          headingElements = Array.from(elements) as HTMLElement[];
        } catch (selectorError) {
          throw new Error(`Invalid CSS selector: "${selectors}"`);
        }

        // Filter valid headings and generate IDs if needed
        const validHeadings: HTMLElement[] = [];
        const generatedIds = new Set<string>();

        headingElements.forEach((heading, index) => {
          const textContent = heading.textContent?.trim();
          if (!textContent) return;

          // Generate ID if missing and generateIds is enabled
          if (!heading.id && generateIds) {
            const level = parseInt(heading.tagName.substring(1));
            let generatedId = idGenerator(textContent, level, index);

            // Ensure unique IDs
            let counter = 1;
            const baseId = generatedId;
            while (
              generatedIds.has(generatedId) ||
              document.getElementById(generatedId)
            ) {
              generatedId = `${baseId}-${counter}`;
              counter++;
            }

            heading.id = generatedId;
            generatedIds.add(generatedId);
          }

          if (heading.id) {
            validHeadings.push(heading);
          }
        });

        if (validHeadings.length === 0) {
          console.warn(
            `No valid headings found with selector "${selectors}" in container "${containerId}"`,
          );
          setHeadings([]);
          setIsLoading(false);
          return;
        }

        // Create TOC data
        const newHeadings = validHeadings.map((heading) => ({
          id: heading.id,
          level: parseInt(heading.tagName.substring(1)),
          text: heading.textContent!.trim(),
          element: heading,
        }));

        // Update state only if headings have changed
        setHeadings((prevHeadings) => {
          const hasChanged =
            prevHeadings.length !== newHeadings.length ||
            prevHeadings.some(
              (prev, index) =>
                prev.id !== newHeadings[index]?.id ||
                prev.text !== newHeadings[index]?.text ||
                prev.level !== newHeadings[index]?.level,
            );

          return hasChanged ? newHeadings : prevHeadings;
        });

        // Store reference for cleanup
        headingElementsRef.current = validHeadings;

        // Set up IntersectionObserver
        if (validHeadings.length > 0 && 'IntersectionObserver' in window) {
          observerRef.current = new IntersectionObserver(
            (entries) => {
              if (!mountedRef.current) return;

              // Find the most relevant intersecting entry
              const intersectingEntries = entries.filter(
                (entry) => entry.isIntersecting,
              );

              if (intersectingEntries.length > 0) {
                // Sort by intersection ratio and position
                intersectingEntries.sort((a, b) => {
                  const ratioA = a.intersectionRatio;
                  const ratioB = b.intersectionRatio;

                  if (Math.abs(ratioA - ratioB) < 0.01) {
                    // If ratios are similar, prefer the one higher on the page
                    return a.boundingClientRect.top - b.boundingClientRect.top;
                  }

                  return ratioB - ratioA; // Higher ratio first
                });

                const targetId = (
                  intersectingEntries[0] as IntersectionObserverEntry
                ).target.id;
                if (targetId) {
                  setInternalActiveId(targetId);
                }
              }
            },
            {
              root: null,
              rootMargin,
              threshold: Array.isArray(threshold) ? threshold : [threshold],
            },
          );

          // Observe all heading elements
          validHeadings.forEach((element) => {
            observerRef.current?.observe(element);
          });
        }
      } catch (err) {
        handleError(err as Error, 'scanning headings');
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    // Use RAF to ensure DOM is ready
    const rafId = requestAnimationFrame(scanHeadings);

    return () => {
      cancelAnimationFrame(rafId);
      cleanup();
    };
  }, [
    containerId,
    selectors,
    rootMargin,
    threshold,
    generateIds,
    idGenerator,
    handleError,
  ]);

  // Cleanup on unmount
  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  /**
   * Programmatically set the active heading
   */
  const setActiveHeading = useStableCallback((id: string) => {
    if (headings.find((h) => h.id === id)) {
      setActiveId(id);
      setInternalActiveId(id);
      lastActiveIdRef.current = id;
    }
  });

  /**
   * Refresh the table of contents
   */
  const refresh = useStableCallback(() => {
    setIsLoading(true);
    setError(null);
  });

  /**
   * Navigate to a specific heading
   */
  const navigateToHeading = useStableCallback(
    (id: string, behavior: ScrollBehavior = 'smooth') => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior, block: 'start' });

        // Update URL hash
        if (window.history.replaceState) {
          window.history.replaceState(null, '', `#${id}`);
        } else {
          window.location.hash = id;
        }

        setActiveHeading(id);

        // Focus for accessibility
        if (element.tabIndex === -1) {
          element.tabIndex = -1;
        }
        element.focus({ preventScroll: true });
      }
    },
  );

  return {
    headings,
    activeId,
    error,
    isLoading,
    setActiveHeading,
    refresh,
    navigateToHeading,
  };
};
