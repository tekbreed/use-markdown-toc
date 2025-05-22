import * as React from 'react';

export interface TOCItem {
  id: string;
  level: number;
  text: string;
}

export type TOCHeadings = TOCItem[];

export interface UseTOCProps {
  containerId: string;
  selectors?: string;
  rootMargin?: string;
  threshold?: number;
}

export const useToc = ({
  containerId = 'markdown-content',
  selectors = 'h1, h2, h3, h4, h5, h6',
  rootMargin = '0px 0px -80% 0px',
  threshold = 0.1,
}: UseTOCProps) => {
  const [headings, setHeadings] = React.useState<TOCHeadings>([]);
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

    const toc = headingElements.map((heading) => ({
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

  return [headings, activeId] as [TOCHeadings, string | null];
};
