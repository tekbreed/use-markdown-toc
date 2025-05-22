// import * as React from 'react';

// /**
//  * Represents a single heading item in the table of contents.
//  */
// export interface MarkdownTocItem {
//   /** Unique identifier for the heading */
//   id: string;
//   /** Heading level (1-6) */
//   level: number;
//   /** Text content of the heading */
//   text: string;
// }

// /** Array of table of contents items */
// export type MarkdownTocHeadings = MarkdownTocItem[];

// /**
//  * Configuration options for the useMarkdownToc hook.
//  */
// export interface UseMarkdownTocProps {
//   /** ID of the container element containing the markdown content */
//   containerId: string;
//   /** CSS selector for heading elements (default: 'h1, h2, h3, h4, h5, h6') */
//   selectors?: string;
//   /** Root margin for the Intersection Observer (default: '0px 0px -80% 0px') */
//   rootMargin?: string;
//   /** Threshold for the Intersection Observer (default: 0.1) */
//   threshold?: number;
// }

// /**
//  * A React hook that generates a table of contents from markdown headings.
//  *
//  * @example
//  * ```tsx
//  * const [headings, activeId] = useMarkdownToc({
//  *   containerId: 'markdown-content',
//  *   selectors: 'h1, h2, h3'
//  * });
//  * ```
//  *
//  * @param props - Configuration options
//  * @param props.containerId - ID of the container element
//  * @param props.selectors - CSS selector for headings (default: 'h1, h2, h3, h4, h5, h6')
//  * @param props.rootMargin - Intersection Observer root margin (default: '0px 0px -80% 0px')
//  * @param props.threshold - Intersection Observer threshold (default: 0.1)
//  *
//  * @returns A tuple containing:
//  * - headings: Array of heading items with id, level, and text
//  * - activeId: ID of the currently active heading (based on scroll position and hash)
//  */
// export const useMarkdownToc = ({
//   containerId = 'markdown-content',
//   selectors = 'h1, h2, h3, h4, h5, h6',
//   rootMargin = '0px 0px -80% 0px',
//   threshold = 0.1,
// }: UseMarkdownTocProps) => {
//   const [headings, setHeadings] = React.useState<MarkdownTocHeadings>([]);
//   const [activeId, setActiveId] = React.useState<string | null>(null);
//   const observerRef = React.useRef<IntersectionObserver | null>(null);

//   // Handle hash changes
//   React.useEffect(() => {
//     const handleHashChange = () => {
//       const hash = window.location.hash.replace('#', '');
//       if (hash) {
//         setActiveId(hash);
//         // Scroll the heading into view if it exists
//         // const element = document.getElementById(hash);
//         // if (element) {
//         //   element.scrollIntoView({ behavior: 'smooth' });
//         // }
//       }
//     };

//     handleHashChange();
//     window.addEventListener('hashchange', handleHashChange);
//     return () => window.removeEventListener('hashchange', handleHashChange);
//   }, []);

//   // Handle headings and intersection observer
//   React.useEffect(() => {
//     const container = containerId && document.getElementById(containerId);
//     if (!container) {
//       console.warn(`Container with id "${containerId}" not found.`);
//       return;
//     }

//     const headingElements = Array.from(
//       container.querySelectorAll(selectors),
//     ).filter((heading) => Boolean(heading.textContent)) as HTMLElement[];

//     const processedIds = new Set<string>();
//     const toc = headingElements
//       .filter((heading) => {
//         if (processedIds.has(heading.id)) {
//           return false;
//         }
//         processedIds.add(heading.id);
//         return true;
//       })
//       .map((heading) => ({
//         id: heading.id,
//         level: parseInt(heading.tagName.substring(1)),
//         text: heading.textContent!,
//       }));

//     setHeadings(toc);

//     // Cleanup previous observer
//     if (observerRef.current) {
//       observerRef.current.disconnect();
//     }

//     // Create new observer
//     const observer = new IntersectionObserver(
//       (entries) => {
//         // Find the first intersecting heading
//         const intersectingEntry = entries.find((entry) => entry.isIntersecting);
//         if (intersectingEntry) {
//           setActiveId(intersectingEntry.target.id);
//         }
//       },
//       {
//         root: null,
//         rootMargin,
//         threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
//       },
//     );

//     observerRef.current = observer;
//     headingElements.forEach((element) => observer.observe(element));

//     return () => {
//       if (observerRef.current) {
//         observerRef.current.disconnect();
//         observerRef.current = null;
//       }
//     };
//   }, [containerId, rootMargin, selectors]);

//   return [headings, activeId] as [MarkdownTocHeadings, string | null];
// };

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
  /** Auto-generate IDs for headings that don't have them */
  autoGenerateIds?: boolean;
}

/**
 * Generate a slug from text content
 */
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
};

/**
 * Return type for the useMarkdownToc hook
 */
export type UseMarkdownTocReturn = readonly [
  headings: MarkdownTocHeadings,
  activeId: string | null,
];

/**
 * A React hook that generates a table of contents from markdown headings.
 */
export const useMarkdownToc = ({
  containerId = 'markdown-content',
  selectors = 'h1, h2, h3, h4, h5, h6',
  rootMargin = '0px 0px -80% 0px',
  threshold = 0.1,
  autoGenerateIds = true,
}: UseMarkdownTocProps): UseMarkdownTocReturn => {
  const [headings, setHeadings] = React.useState<MarkdownTocHeadings>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const observerRef = React.useRef<IntersectionObserver | null>(null);
  const headingElementsRef = React.useRef<HTMLElement[]>([]);

  // Handle hash changes
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setActiveId(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Handle headings and intersection observer
  React.useEffect(() => {
    const container = containerId && document.getElementById(containerId);
    if (!container) {
      console.warn(`Container with id "${containerId}" not found.`);
      return;
    }

    const headingElements = Array.from(
      container.querySelectorAll(selectors),
    ).filter((heading) =>
      Boolean(heading.textContent?.trim()),
    ) as HTMLElement[];

    // Auto-generate IDs for headings that don't have them
    const processedIds = new Set<string>();
    headingElements.forEach((heading) => {
      if (!heading.id && autoGenerateIds) {
        const baseSlug = generateSlug(heading.textContent || '');
        let slug = baseSlug;
        let counter = 1;

        // Ensure unique ID
        while (processedIds.has(slug) || document.getElementById(slug)) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }

        heading.id = slug;
      }

      if (heading.id) {
        processedIds.add(heading.id);
      }
    });

    // Filter out headings without IDs and duplicates
    const validHeadings = headingElements.filter(
      (heading) =>
        heading.id &&
        Array.from(processedIds).filter((id) => id === heading.id).length <= 1,
    );

    const toc = validHeadings.map((heading) => ({
      id: heading.id,
      level: parseInt(heading.tagName.substring(1)),
      text: heading.textContent?.trim() || '',
    }));

    setHeadings(toc);
    headingElementsRef.current = validHeadings;

    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (validHeadings.length === 0) {
      return;
    }

    // Create new observer
    const observer = new IntersectionObserver(
      (entries) => {
        // Create a map of visible entries with their intersection ratios
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => ({
            id: entry.target.id,
            ratio: entry.intersectionRatio,
            boundingRect: entry.boundingClientRect,
          }))
          .sort((a, b) => b.ratio - a.ratio); // Sort by intersection ratio (most visible first)

        if (visibleEntries.length > 0) {
          // If we have a hash in URL, prioritize it
          const hash = window.location.hash.replace('#', '');
          if (hash && visibleEntries.some((entry) => entry.id === hash)) {
            setActiveId(hash);
          } else {
            // Otherwise, use the most visible heading
            const mostVisibleEntry = visibleEntries[0];
            if (mostVisibleEntry?.id) {
              setActiveId(mostVisibleEntry.id);
            }
          }
        } else {
          // If no headings are visible, find the closest one above the viewport
          const allHeadings = headingElementsRef.current;
          let closestHeading: (HTMLElement & { id: string }) | null = null;
          let closestDistance = Infinity;

          allHeadings.forEach((heading) => {
            const rect = heading.getBoundingClientRect();
            const distanceFromTop = Math.abs(rect.top);

            if (rect.top <= 0 && distanceFromTop < closestDistance) {
              closestDistance = distanceFromTop;
              closestHeading = heading;
            }
          });

          if (closestHeading) {
            setActiveId((closestHeading as HTMLElement & { id: string }).id);
          }
        }
      },
      {
        root: null,
        rootMargin,
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0],
      },
    );

    observerRef.current = observer;
    validHeadings.forEach((element) => observer.observe(element));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [containerId, rootMargin, threshold, selectors, autoGenerateIds]);

  return [headings, activeId] as const;
};
