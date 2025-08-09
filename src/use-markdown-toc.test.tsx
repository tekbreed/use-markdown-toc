import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { renderHook } from '@testing-library/react';
import { useMarkdownToc } from './use-markdown-toc';

describe('useMarkdownToc', () => {
  let container: HTMLElement;

  beforeEach(() => {
    // Create a container element
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);

    // Mock IntersectionObserver
    const mockIntersectionObserver = vi.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    });
    window.IntersectionObserver = mockIntersectionObserver;
  });

  afterEach(() => {
    if (container.parentNode) {
      document.body.removeChild(container);
    }
    vi.clearAllMocks();
  });

  it('should return empty headings and null activeId when no headings are found', () => {
    const { result } = renderHook(() =>
      useMarkdownToc({ containerId: 'test-container' }),
    );

    expect(result.current.headings).toEqual([]);
    expect(result.current.activeId).toBeNull();
  });

  it('should use default containerId when not provided', () => {
    const { result } = renderHook(() => useMarkdownToc());

    expect(result.current.headings).toEqual([]);
    expect(result.current.activeId).toBeNull();
  });

  it('should generate headings from h1-h6 elements', () => {
    container.innerHTML = `
      <h1>Heading 1</h1>
      <h2>Heading 2</h2>
      <h3>Heading 3</h3>
    `;

    const { result } = renderHook(() =>
      useMarkdownToc({ containerId: 'test-container' }),
    );

    expect(result.current.headings).toEqual([
      { id: 'heading-1', level: 1, text: 'Heading 1' },
      { id: 'heading-2', level: 2, text: 'Heading 2' },
      { id: 'heading-3', level: 3, text: 'Heading 3' },
    ]);
  });

  it('should respect custom selectors', () => {
    container.innerHTML = `
      <h1>Heading 1</h1>
      <h2>Heading 2</h2>
      <h3>Heading 3</h3>
    `;

    const { result } = renderHook(() =>
      useMarkdownToc({
        containerId: 'test-container',
        selectors: 'h1, h3',
      }),
    );

    expect(result.current.headings).toEqual([
      { id: 'heading-1', level: 1, text: 'Heading 1' },
      { id: 'heading-3', level: 3, text: 'Heading 3' },
    ]);
  });

  it('should handle headings with existing IDs', () => {
    container.innerHTML = `
      <h1 id="custom-id-1">Heading 1</h1>
      <h2 id="custom-id-2">Heading 2</h2>
    `;

    const { result } = renderHook(() =>
      useMarkdownToc({ containerId: 'test-container' }),
    );

    expect(result.current.headings).toEqual([
      { id: 'custom-id-1', level: 1, text: 'Heading 1' },
      { id: 'custom-id-2', level: 2, text: 'Heading 2' },
    ]);
  });

  it('should handle empty heading text', () => {
    container.innerHTML = `
      <h1></h1>
      <h2>Heading 2</h2>
    `;

    const { result } = renderHook(() =>
      useMarkdownToc({ containerId: 'test-container' }),
    );

    expect(result.current.headings).toEqual([
      { id: 'heading-2', level: 2, text: 'Heading 2' },
    ]);
  });

  it('should handle whitespace-only heading text', () => {
    container.innerHTML = `
      <h1>   </h1>
      <h2>Heading 2</h2>
    `;

    const { result } = renderHook(() =>
      useMarkdownToc({ containerId: 'test-container' }),
    );

    expect(result.current.headings).toEqual([
      { id: 'heading-2', level: 2, text: 'Heading 2' },
    ]);
  });

  it('should handle hash changes', () => {
    container.innerHTML = `
      <h1 id="heading-1">Heading 1</h1>
      <h2 id="heading-2">Heading 2</h2>
    `;

    const { result } = renderHook(() =>
      useMarkdownToc({ containerId: 'test-container' }),
    );

    act(() => {
      window.location.hash = '#heading-2';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    expect(result.current.activeId).toBe('heading-2');
  });

  it('should handle hash changes with non-existent IDs', () => {
    container.innerHTML = `
      <h1 id="heading-1">Heading 1</h1>
    `;

    const { result } = renderHook(() =>
      useMarkdownToc({ containerId: 'test-container' }),
    );

    act(() => {
      window.location.hash = '#non-existent';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    expect(result.current.activeId).toBe('non-existent');
  });

  it('should handle intersection observer updates', () => {
    container.innerHTML = `
      <h1 id="heading-1">Heading 1</h1>
      <h2 id="heading-2">Heading 2</h2>
    `;

    const { result } = renderHook(() =>
      useMarkdownToc({ containerId: 'test-container' }),
    );

    // Mock intersection observer callback
    const mockCallback = (window.IntersectionObserver as any).mock.calls[0][0];
    const mockEntry = {
      isIntersecting: true,
      target: { id: 'heading-2' },
    };

    act(() => {
      mockCallback([mockEntry]);
    });

    expect(result.current.activeId).toBe('heading-2');
  });

  it('should handle multiple intersecting headings', () => {
    container.innerHTML = `
      <h1 id="heading-1">Heading 1</h1>
      <h2 id="heading-2">Heading 2</h2>
    `;

    const { result } = renderHook(() =>
      useMarkdownToc({ containerId: 'test-container' }),
    );

    // Mock intersection observer callback
    const mockCallback = (window.IntersectionObserver as any).mock.calls[0][0];
    const mockEntries = [
      {
        isIntersecting: true,
        target: { id: 'heading-1' },
      },
      {
        isIntersecting: true,
        target: { id: 'heading-2' },
      },
    ];

    act(() => {
      mockCallback(mockEntries);
    });

    // Should use the last intersecting heading
    expect(result.current.activeId).toBe('heading-2');
  });

  it('should respect custom rootMargin', () => {
    container.innerHTML = `
      <h1 id="heading-1">Heading 1</h1>
    `;

    renderHook(() =>
      useMarkdownToc({
        containerId: 'test-container',
        rootMargin: '0px 0px -50% 0px',
      }),
    );

    const observerOptions = (window.IntersectionObserver as any).mock
      .calls[0][1];
    expect(observerOptions.rootMargin).toBe('0px 0px -50% 0px');
  });

  it('should respect custom threshold', () => {
    container.innerHTML = `
      <h1 id="heading-1">Heading 1</h1>
    `;

    renderHook(() =>
      useMarkdownToc({
        containerId: 'test-container',
        threshold: 0.5,
      }),
    );

    const observerOptions = (window.IntersectionObserver as any).mock
      .calls[0][1];
    expect(observerOptions.threshold).toBe(0.5);
  });

  it('should handle missing container element', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() =>
      useMarkdownToc({ containerId: 'non-existent' }),
    );

    expect(result.current.headings).toEqual([]);
    expect(result.current.activeId).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Container with id "non-existent" not found.',
    );

    consoleSpy.mockRestore();
  });

  it('should handle invalid heading levels', () => {
    container.innerHTML = `
      <h7>Invalid Heading</h7>
      <h2>Valid Heading</h2>
    `;

    const { result } = renderHook(() =>
      useMarkdownToc({ containerId: 'test-container' }),
    );

    expect(result.current.headings).toEqual([
      { id: 'heading-2', level: 2, text: 'Valid Heading' },
    ]);
  });

  it('should cleanup intersection observer on unmount', () => {
    container.innerHTML = `
      <h1>Heading 1</h1>
    `;

    const { unmount } = renderHook(() =>
      useMarkdownToc({ containerId: 'test-container' }),
    );

    const observer = (window.IntersectionObserver as any).mock.results[0].value;
    unmount();

    expect(observer.unobserve).toHaveBeenCalled();
  });

  it('should cleanup hash change listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() =>
      useMarkdownToc({ containerId: 'test-container' }),
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'hashchange',
      expect.any(Function),
    );

    removeEventListenerSpy.mockRestore();
  });
});
