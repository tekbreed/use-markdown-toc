/**
 * Generates a URL-friendly slug from text content
 *
 * Converts text to lowercase, removes special characters,
 * replaces spaces and underscores with hyphens, and
 * removes leading/trailing hyphens.
 *
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug string
 *
 * @example
 * ```ts
 * generateSlug("Hello World!") // "hello-world"
 * generateSlug("Section 2.1") // "section-21"
 * generateSlug("Special@#$%") // "special"
 * ```
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Default ID generator function
 *
 * Creates unique IDs for headings by combining a slugified version
 * of the text with the heading level and index as fallback.
 *
 * @param text - The heading text content
 * @param level - The heading level (1-6)
 * @param index - The index of the heading in the document
 * @returns A unique ID string
 *
 * @example
 * ```ts
 * defaultIdGenerator("Introduction", 1, 0) // "introduction"
 * defaultIdGenerator("Getting Started", 2, 1) // "getting-started"
 * defaultIdGenerator("", 1, 2) // "heading-1-2"
 * ```
 */
export const defaultIdGenerator = (
  text: string,
  level: number,
  index: number,
): string => {
  const slug = generateSlug(text);
  return slug || `heading-${level}-${index}`;
};
