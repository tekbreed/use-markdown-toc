# use-markdown-toc Source Structure

This directory contains the source code for the `use-markdown-toc` package, organized for maintainability and clarity.

## Directory Structure

```
src/
├── types/
│   └── index.ts              # TypeScript type definitions
├── utils/
│   ├── index.ts              # Utility exports
│   └── slug.ts               # Slug generation utilities
├── hooks/
│   ├── index.ts              # Hook exports
│   ├── useDebounce.ts        # Debounce hook
│   └── useStableCallback.ts  # Stable callback hook
├── test/
│   └── setup.ts              # Test setup configuration
├── use-markdown-toc.ts       # Main hook implementation
├── use-markdown-toc.test.tsx # Test suite
└── index.ts                  # Main package exports
```

## Files Overview

### Types (`types/`)

- **`index.ts`**: Contains all TypeScript interfaces and types used throughout the package
  - `TOCItem`: Represents a single table of contents item
  - `TOCHeadings`: Array of table of contents items
  - `UseMarkdownTocProps`: Configuration options for the hook
  - `UseMarkdownTocReturn`: Return value from the hook

### Utils (`utils/`)

- **`slug.ts`**: Utility functions for generating URL-friendly slugs and IDs
  - `generateSlug()`: Converts text to URL-friendly slug
  - `defaultIdGenerator()`: Default ID generator for headings
- **`index.ts`**: Exports all utility functions

### Hooks (`hooks/`)

- **`useDebounce.ts`**: Custom hook for debouncing values
- **`useStableCallback.ts`**: Custom hook for stable callback references
- **`index.ts`**: Exports all custom hooks

### Main Implementation

- **`use-markdown-toc.ts`**: Main hook implementation with comprehensive documentation
- **`index.ts`**: Main package exports for all public APIs

### Testing

- **`use-markdown-toc.test.tsx`**: Comprehensive test suite
- **`test/setup.ts`**: Test environment configuration

## Development Guidelines

1. **Type Safety**: All new features should include proper TypeScript types
2. **Documentation**: All public APIs should include JSDoc comments
3. **Testing**: New features should include corresponding tests
4. **Modularity**: Keep related functionality in separate files
5. **Exports**: Use index files for clean public APIs

## Adding New Features

1. Add types to `types/index.ts` if needed
2. Add utilities to `utils/` if needed
3. Add hooks to `hooks/` if needed
4. Update main hook implementation
5. Add tests
6. Update exports in `index.ts`
7. Update documentation
