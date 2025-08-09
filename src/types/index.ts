/**
 * Represents a single table of contents item
 *
 * @interface TOCItem
 */
export interface TOCItem {
  /** Unique identifier for the heading */
  id: string;
  /** Heading level (1-6, where 1 is h1, 2 is h2, etc.) */
  level: number;
  /** Text content of the heading */
  text: string;
  /** Reference to the DOM element for advanced operations */
  element?: HTMLElement;
}

/**
 * Array of table of contents items
 */
export type TOCHeadings = TOCItem[];

/**
 * Configuration options for the useMarkdownToc hook
 *
 * @interface UseMarkdownTocProps
 */
export interface UseMarkdownTocProps {
  /**
   * ID of the container element to scan for headings
   * @default "markdown-content"
   */
  containerId?: string;
  /**
   * CSS selector string for heading elements
   * @default "h1, h2, h3, h4, h5, h6"
   */
  selectors?: string;
  /**
   * Root margin for IntersectionObserver (similar to CSS margin)
   * Controls when headings are considered "visible"
   * @default "0px 0px -80% 0px"
   */
  rootMargin?: string;
  /**
   * Intersection threshold (0-1) - percentage of element that must be visible
   * @default 0.1
   */
  threshold?: number;
  /**
   * Debounce delay for active ID updates in milliseconds
   * Prevents rapid state changes during scrolling
   * @default 100
   */
  debounceDelay?: number;
  /**
   * Enable automatic ID generation for headings without IDs
   * @default true
   */
  generateIds?: boolean;
  /**
   * Custom ID generator function
   * @param text - The heading text content
   * @param level - The heading level (1-6)
   * @param index - The index of the heading in the document
   * @returns A unique ID string
   */
  idGenerator?: (text: string, level: number, index: number) => string;
  /**
   * Enable error boundary behavior
   * @default true
   */
  enableErrorHandling?: boolean;
  /**
   * Custom error handler function
   * @param error - The error that occurred
   * @param context - The context where the error occurred
   */
  onError?: (error: Error, context: string) => void;
}

/**
 * Return value from the useMarkdownToc hook
 *
 * @interface UseMarkdownTocReturn
 */
export interface UseMarkdownTocReturn {
  /** Array of detected headings with their metadata */
  headings: TOCHeadings;
  /** Currently active heading ID (null if none) */
  activeId: string | null;
  /** Error message if something went wrong (null if no error) */
  error: string | null;
  /** Whether the hook is currently scanning for headings */
  isLoading: boolean;
  /**
   * Programmatically set the active heading
   * @param id - The ID of the heading to activate
   */
  setActiveHeading: (id: string) => void;
  /**
   * Refresh the table of contents (useful for dynamic content)
   * Triggers a re-scan of the document for headings
   */
  refresh: () => void;
  /**
   * Navigate to a specific heading
   * @param id - The ID of the heading to navigate to
   * @param behavior - Scroll behavior ("auto", "smooth", or "instant")
   */
  navigateToHeading: (id: string, behavior?: ScrollBehavior) => void;
}
