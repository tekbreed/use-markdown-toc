import * as React from 'react';

/**
 * Represents a single heading item in the table of contents.
 */
export interface MarkdownTocItem {
  /** Unique identifier for the heading */
  id: string;
  /** Heading level (1-6) */
  level: number;
  /** Text content of the heading */
  text: string;
}

/** Array of table of contents items */
export type MarkdownTocHeadings = MarkdownTocItem[];

/**
 * Configuration options for the useMarkdownToc hook.
 */
export interface UseMarkdownTocProps {
  /** ID of the container element containing the markdown content */
  containerId: string;
  /** CSS selector for heading elements (default: 'h1, h2, h3, h4, h5, h6') */
  selectors?: string;
  /** Root margin for the Intersection Observer (default: '0px 0px -80% 0px') */
  rootMargin?: string;
  /** Threshold for the Intersection Observer (default: 0.1) */
  threshold?: number;
}

/**
 * A React hook that generates a table of contents from markdown headings.
 *
 * @example
 * ```tsx
 * const [headings, activeId] = useMarkdownToc({
 *   containerId: 'markdown-content',
 *   selectors: 'h1, h2, h3'
 * });
 * ```
 *
 * @param props - Configuration options
 * @param props.containerId - ID of the container element
 * @param props.selectors - CSS selector for headings (default: 'h1, h2, h3, h4, h5, h6')
 * @param props.rootMargin - Intersection Observer root margin (default: '0px 0px -80% 0px')
 * @param props.threshold - Intersection Observer threshold (default: 0.1)
 *
 * @returns A tuple containing:
 * - headings: Array of heading items with id, level, and text
 * - activeId: ID of the currently active heading (based on scroll position and hash)
 */
export const useMarkdownToc = ({
  containerId = 'markdown-content',
  selectors = 'h1, h2, h3, h4, h5, h6',
  rootMargin = '0px 0px -80% 0px',
  threshold = 0.1,
}: UseMarkdownTocProps) => {
  const [headings, setHeadings] = React.useState<MarkdownTocHeadings>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash) {
        setActiveId(window.location.hash.replace('#', ''));
      }
    };

    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  React.useEffect(() => {
    const container = containerId && document.getElementById(containerId);
    if (!container) {
      console.warn(`Container with id "${containerId}" not found.`);
      return;
    }

    const headingElements = Array.from(
      container.querySelectorAll(selectors),
    ).filter((heading) => Boolean(heading.textContent)) as HTMLElement[];

    /**
     * Filter duplicate IDs
     */
    const processedIds = new Set<string>();
    const toc = headingElements
      .filter((heading) => {
        if (processedIds.has(heading.id)) {
          return false;
        }
        processedIds.add(heading.id);
        return true;
      })
      .map((heading) => ({
        id: heading.id,
        level: parseInt(heading.tagName.substring(1)),
        text: heading.textContent!,
      }));

    setHeadings(toc);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { root: null, rootMargin, threshold },
    );

    headingElements.forEach((element) => observer.observe(element));

    return () => {
      headingElements.forEach((element) => observer.unobserve(element));
    };
  }, [containerId, rootMargin, threshold, selectors]);

  return [headings, activeId] as [MarkdownTocHeadings, string | null];
};
