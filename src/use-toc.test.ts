import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToc } from './use-toc';

describe('useToc', () => {
  const mockContainer = document.createElement('div');
  mockContainer.id = 'markdown-content';

  const mockHeadings = [
    { id: 'heading-1', tagName: 'H1', textContent: 'Heading 1' },
    { id: 'heading-2', tagName: 'H2', textContent: 'Heading 2' },
    { id: 'heading-3', tagName: 'H3', textContent: 'Heading 3' },
  ];

  beforeEach(() => {
    // Setup DOM
    document.body.appendChild(mockContainer);
    mockHeadings.forEach((heading) => {
      const element = document.createElement(heading.tagName);
      element.id = heading.id;
      element.textContent = heading.textContent;
      mockContainer.appendChild(element);
    });
  });

  afterEach(() => {
    // Cleanup
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('should initialize with empty headings and null activeId', () => {
    const { result } = renderHook(() =>
      useToc({ containerId: 'markdown-content' }),
    );
    expect(result.current[0]).toEqual([]);
    expect(result.current[1]).toBeNull();
  });

  it('should find headings in the container', () => {
    const { result } = renderHook(() =>
      useToc({ containerId: 'markdown-content' }),
    );

    expect(result.current[0]).toEqual([
      { id: 'heading-1', level: 1, text: 'Heading 1' },
      { id: 'heading-2', level: 2, text: 'Heading 2' },
      { id: 'heading-3', level: 3, text: 'Heading 3' },
    ]);
  });

  it('should update activeId when hash changes', () => {
    const { result } = renderHook(() =>
      useToc({ containerId: 'markdown-content' }),
    );

    act(() => {
      window.location.hash = '#heading-2';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    expect(result.current[1]).toBe('heading-2');
  });

  it('should handle custom container ID', () => {
    const customContainer = document.createElement('div');
    customContainer.id = 'custom-container';
    document.body.appendChild(customContainer);

    const customHeading = document.createElement('h1');
    customHeading.id = 'custom-heading';
    customHeading.textContent = 'Custom Heading';
    customContainer.appendChild(customHeading);

    const { result } = renderHook(() =>
      useToc({ containerId: 'custom-container' }),
    );

    expect(result.current[0]).toEqual([
      { id: 'custom-heading', level: 1, text: 'Custom Heading' },
    ]);
  });

  it('should handle custom selectors', () => {
    const { result } = renderHook(() =>
      useToc({ containerId: 'markdown-content', selectors: 'h1' }),
    );

    expect(result.current[0]).toEqual([
      { id: 'heading-1', level: 1, text: 'Heading 1' },
    ]);
  });

  it('should handle missing container', () => {
    const consoleSpy = vi.spyOn(console, 'warn');
    const { result } = renderHook(() =>
      useToc({ containerId: 'non-existent' }),
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'Container with id "non-existent" not found.',
    );
    expect(result.current[0]).toEqual([]);
  });

  it('should handle intersection observer updates', () => {
    const { result } = renderHook(() =>
      useToc({ containerId: 'markdown-content' }),
    );

    // Simulate intersection observer callback
    const observerCallback = (window.IntersectionObserver as any).mock
      .calls[0][0];
    act(() => {
      observerCallback([{ isIntersecting: true, target: { id: 'heading-2' } }]);
    });

    expect(result.current[1]).toBe('heading-2');
  });

  it('should cleanup event listeners and observers on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() =>
      useToc({ containerId: 'markdown-content' }),
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'hashchange',
      expect.any(Function),
    );
  });
});
