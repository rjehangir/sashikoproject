# Agent 4: Developer Experience, Testing, and CI/CD

## Mission

Establish comprehensive developer tooling, testing infrastructure, and CI/CD pipeline. Ensure code quality through automation.

## Scope

You own these files and directories:
- All config files in project root (`.eslintrc.*`, `.prettierrc`, etc.)
- `.github/` - GitHub Actions workflows
- `.husky/` - Git hooks
- `src/**/__tests__/` - All test files
- `.storybook/` - Storybook configuration (optional)

## Dependencies

- **Agent 1, 2, 3** - You depend on their work being complete for integration tests
- You can start Tasks 4.1-4.3 immediately (tooling setup)
- Wait for other agents before Task 4.4+ (tests)

## Tasks

### Task 4.1: Set Up ESLint

**Install dependencies:**
```bash
pnpm add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin \
  eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y \
  eslint-plugin-import eslint-config-prettier
```

**Create `.eslintrc.cjs`:**
```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'vite.config.ts', 'vitest.config.ts'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['react-refresh', '@typescript-eslint', 'import'],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc' },
      },
    ],
    'import/no-duplicates': 'error',
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/no-static-element-interactions': 'error',
  },
};
```

**Create `.eslintignore`:**
```
node_modules
dist
coverage
.storybook
*.config.js
*.config.ts
```

### Task 4.2: Set Up Prettier

**Install dependencies:**
```bash
pnpm add -D prettier
```

**Create `.prettierrc`:**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

**Create `.prettierignore`:**
```
node_modules
dist
coverage
pnpm-lock.yaml
*.md
```

### Task 4.3: Set Up Husky and lint-staged

**Install and initialize:**
```bash
pnpm add -D husky lint-staged
pnpm exec husky init
```

**Create `.husky/pre-commit`:**
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm exec lint-staged
```

**Create `lint-staged.config.js`:**
```javascript
export default {
  '*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,yml,yaml}': ['prettier --write'],
  '*.css': ['prettier --write'],
};
```

### Task 4.4: Update package.json Scripts

Add these scripts to `package.json`:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run",
    "lint": "eslint src --ext .ts,.tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css}\"",
    "typecheck": "tsc --noEmit",
    "validate": "pnpm run typecheck && pnpm run lint && pnpm run test:run",
    "prepare": "husky"
  }
}
```

### Task 4.5: Set Up Testing Infrastructure

**Install testing dependencies:**
```bash
pnpm add -D @testing-library/react @testing-library/user-event @testing-library/jest-dom \
  @vitest/coverage-v8 msw jsdom
```

**Update `vitest.config.ts`:**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
});
```

**Create `src/test/setup.ts`:**
```typescript
import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// MSW setup
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

**Create `src/test/mocks/handlers.ts`:**
```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/patterns/index.json', () => {
    return HttpResponse.json({
      patterns: [
        { id: 'test-pattern', name: 'Test Pattern', author: 'Test', license: 'CC BY 4.0' },
      ],
    });
  }),
  
  http.get('/patterns/:id.json', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'Test Pattern',
      author: 'Test Author',
      license: 'CC BY 4.0',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      tile: {
        svg: '<svg viewBox="0 0 10 10"><line x1="0" y1="0" x2="10" y2="10"/></svg>',
        viewBox: '0 0 10 10',
      },
      defaults: {
        stitchLengthMm: 3,
        gapLengthMm: 1.5,
        strokeWidthMm: 0.6,
        snapGridMm: 1,
      },
    });
  }),
];
```

**Create `src/test/mocks/server.ts`:**
```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

**Create `src/test/utils.tsx`:**
```typescript
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Custom render with providers if needed
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return {
    user: userEvent.setup(),
    ...render(ui, options),
  };
}

export * from '@testing-library/react';
export { customRender as render };
```

### Task 4.6: Write Unit Tests for Services

**`src/services/svg/__tests__/SvgParser.test.ts`:**
```typescript
import { describe, it, expect } from 'vitest';
import { SvgParser } from '../SvgParser';

describe('SvgParser', () => {
  const parser = new SvgParser();
  
  describe('parse', () => {
    it('should parse valid SVG', () => {
      const svg = '<svg viewBox="0 0 10 10"><line x1="0" y1="0" x2="10" y2="10"/></svg>';
      const result = parser.parse(svg);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.svgElement).toBeDefined();
        expect(result.data.viewBox).toEqual({ minX: 0, minY: 0, width: 10, height: 10 });
      }
    });
    
    it('should fail on invalid SVG', () => {
      const result = parser.parse('<not-svg>');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('No SVG element');
      }
    });
    
    it('should fail on malformed XML', () => {
      const result = parser.parse('<svg><unclosed');
      
      expect(result.success).toBe(false);
    });
  });
  
  describe('parseViewBox', () => {
    it('should parse integer viewBox', () => {
      const result = parser.parseViewBox('0 0 100 200');
      expect(result).toEqual({ minX: 0, minY: 0, width: 100, height: 200 });
    });
    
    it('should parse decimal viewBox', () => {
      const result = parser.parseViewBox('0.5 1.5 10.5 20.5');
      expect(result).toEqual({ minX: 0.5, minY: 1.5, width: 10.5, height: 20.5 });
    });
    
    it('should return null for invalid viewBox', () => {
      expect(parser.parseViewBox('invalid')).toBeNull();
      expect(parser.parseViewBox('')).toBeNull();
    });
  });
});
```

**`src/services/svg/__tests__/SvgTransformer.test.ts`:**
```typescript
import { describe, it, expect } from 'vitest';
import { SvgTransformer } from '../SvgTransformer';

describe('SvgTransformer', () => {
  const transformer = new SvgTransformer();
  const viewBox = { minX: 0, minY: 0, width: 10, height: 10 };
  
  describe('mirrorHorizontal', () => {
    it('should add horizontal mirror transform', () => {
      const svg = '<svg viewBox="0 0 10 10"><line x1="2" y1="0" x2="8" y2="10"/></svg>';
      const result = transformer.mirrorHorizontal(svg, viewBox);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toContain('scale(-1, 1)');
        expect(result.data).toContain('translate(-10, 0)');
      }
    });
  });
  
  describe('rotate90', () => {
    it('should add rotation transform', () => {
      const svg = '<svg viewBox="0 0 10 10"><line x1="0" y1="0" x2="10" y2="10"/></svg>';
      const result = transformer.rotate90(svg, viewBox);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toContain('rotate(90)');
      }
    });
  });
});
```

**`src/utils/__tests__/color.test.ts`:**
```typescript
import { describe, it, expect } from 'vitest';
import { parseColor, parseHexColor, parseRgbColor } from '../color';

describe('color utils', () => {
  describe('parseHexColor', () => {
    it('should parse 6-digit hex', () => {
      expect(parseHexColor('#ff0000')).toEqual({ r: 1, g: 0, b: 0 });
      expect(parseHexColor('#00ff00')).toEqual({ r: 0, g: 1, b: 0 });
      expect(parseHexColor('#0000ff')).toEqual({ r: 0, g: 0, b: 1 });
    });
    
    it('should return null for invalid hex', () => {
      expect(parseHexColor('#fff')).toBeNull();
      expect(parseHexColor('red')).toBeNull();
    });
  });
  
  describe('parseRgbColor', () => {
    it('should parse rgb() format', () => {
      expect(parseRgbColor('rgb(255, 0, 0)')).toEqual({ r: 1, g: 0, b: 0 });
      expect(parseRgbColor('rgb(0,128,255)')).toEqual({ r: 0, g: 128/255, b: 1 });
    });
  });
  
  describe('parseColor', () => {
    it('should parse hex colors', () => {
      expect(parseColor('#ffffff')).toEqual({ r: 1, g: 1, b: 1 });
    });
    
    it('should parse rgb colors', () => {
      expect(parseColor('rgb(0, 0, 0)')).toEqual({ r: 0, g: 0, b: 0 });
    });
    
    it('should default to white for unknown formats', () => {
      expect(parseColor('unknown')).toEqual({ r: 1, g: 1, b: 1 });
    });
  });
});
```

**`src/utils/__tests__/units.test.ts`:**
Expand existing tests:
```typescript
import { describe, it, expect } from 'vitest';
import { mmToInches, inchesToMm, mmToPoints, pointsToMm, convert } from '../units';

describe('units', () => {
  describe('mmToInches', () => {
    it('should convert mm to inches correctly', () => {
      expect(mmToInches(25.4)).toBeCloseTo(1, 5);
      expect(mmToInches(50.8)).toBeCloseTo(2, 5);
      expect(mmToInches(0)).toBe(0);
    });
  });
  
  describe('inchesToMm', () => {
    it('should convert inches to mm correctly', () => {
      expect(inchesToMm(1)).toBeCloseTo(25.4, 5);
      expect(inchesToMm(2)).toBeCloseTo(50.8, 5);
      expect(inchesToMm(0)).toBe(0);
    });
  });
  
  describe('mmToPoints', () => {
    it('should convert mm to points correctly', () => {
      expect(mmToPoints(25.4)).toBeCloseTo(72, 5);
    });
  });
  
  describe('pointsToMm', () => {
    it('should convert points to mm correctly', () => {
      expect(pointsToMm(72)).toBeCloseTo(25.4, 5);
    });
  });
  
  describe('convert', () => {
    it('should return same value for same units', () => {
      expect(convert(10, 'mm', 'mm')).toBe(10);
      expect(convert(10, 'in', 'in')).toBe(10);
    });
    
    it('should convert mm to in', () => {
      expect(convert(25.4, 'mm', 'in')).toBeCloseTo(1, 5);
    });
    
    it('should convert in to mm', () => {
      expect(convert(1, 'in', 'mm')).toBeCloseTo(25.4, 5);
    });
  });
});
```

### Task 4.7: Write Component Tests

**`src/components/ui/__tests__/Button.test.tsx`:**
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test/utils';
import { Button } from '../Button';

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });
  
  it('should handle click events', async () => {
    const onClick = vi.fn();
    const { user } = render(<Button onClick={onClick}>Click</Button>);
    
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });
  
  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
  
  it('should apply variant classes', () => {
    render(<Button variant="danger">Danger</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-rose-300');
  });
});
```

**`src/hooks/__tests__/useViewBox.test.ts`:**
```typescript
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useViewBox } from '../useViewBox';

describe('useViewBox', () => {
  it('should parse valid viewBox string', () => {
    const { result } = renderHook(() => useViewBox('0 0 100 200'));
    
    expect(result.current).toEqual({
      minX: 0,
      minY: 0,
      width: 100,
      height: 200,
    });
  });
  
  it('should return null for invalid viewBox', () => {
    const { result } = renderHook(() => useViewBox('invalid'));
    expect(result.current).toBeNull();
  });
  
  it('should memoize result', () => {
    const { result, rerender } = renderHook(
      ({ viewBox }) => useViewBox(viewBox),
      { initialProps: { viewBox: '0 0 10 10' } }
    );
    
    const first = result.current;
    rerender({ viewBox: '0 0 10 10' });
    expect(result.current).toBe(first);
  });
});
```

### Task 4.8: Create GitHub Actions CI/CD

**Create `.github/workflows/ci.yml`:**
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm run lint

  typecheck:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm run typecheck

  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          fail_ci_if_error: false

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
          retention-days: 7
```

**Create `.github/workflows/deploy.yml`:**
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm run build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist/

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

### Task 4.9: Create Environment Configuration

**Create `.env.example`:**
```bash
# Application
VITE_APP_TITLE=Sashiko Pattern Tool
VITE_APP_VERSION=$npm_package_version

# GitHub (for submit pattern feature)
VITE_GITHUB_REPO=YOUR_USERNAME/sashiko

# Feature flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_STORYBOOK=false
```

**Create `src/config/env.ts`:**
```typescript
interface EnvConfig {
  appTitle: string;
  appVersion: string;
  githubRepo: string;
  enableAnalytics: boolean;
}

export const env: EnvConfig = {
  appTitle: import.meta.env.VITE_APP_TITLE || 'Sashiko Pattern Tool',
  appVersion: import.meta.env.VITE_APP_VERSION || '0.0.0',
  githubRepo: import.meta.env.VITE_GITHUB_REPO || 'YOUR_USERNAME/sashiko',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
};
```

**Create `src/vite-env.d.ts` (update existing):**
```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_GITHUB_REPO: string;
  readonly VITE_ENABLE_ANALYTICS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

## Deliverables Checklist

- [ ] `.eslintrc.cjs` - ESLint configuration
- [ ] `.eslintignore` - ESLint ignore file
- [ ] `.prettierrc` - Prettier configuration
- [ ] `.prettierignore` - Prettier ignore file
- [ ] `.husky/pre-commit` - Pre-commit hook
- [ ] `lint-staged.config.js` - Lint-staged configuration
- [ ] `vitest.config.ts` - Updated Vitest config
- [ ] `src/test/setup.ts` - Test setup file
- [ ] `src/test/mocks/handlers.ts` - MSW handlers
- [ ] `src/test/mocks/server.ts` - MSW server
- [ ] `src/test/utils.tsx` - Test utilities
- [ ] `src/services/svg/__tests__/SvgParser.test.ts`
- [ ] `src/services/svg/__tests__/SvgTransformer.test.ts`
- [ ] `src/utils/__tests__/color.test.ts`
- [ ] `src/utils/__tests__/units.test.ts`
- [ ] `src/components/ui/__tests__/Button.test.ts`
- [ ] `src/hooks/__tests__/useViewBox.test.ts`
- [ ] `.github/workflows/ci.yml` - CI pipeline
- [ ] `.github/workflows/deploy.yml` - Deploy pipeline
- [ ] `.env.example` - Environment template
- [ ] `src/config/env.ts` - Environment config
- [ ] `package.json` updated with all new scripts
- [ ] All linting errors fixed
- [ ] Test coverage > 70%

## Report Requirements

After completing all tasks, create a report at `.cursor/agents/agent4-report.md` containing:

1. **Summary** - What was accomplished
2. **Tooling Installed** - List of all dev dependencies added
3. **Configuration Files** - List of all config files created
4. **Test Coverage Report** - Coverage percentages by file/directory
5. **CI/CD Pipeline** - Description of pipeline stages
6. **Linting Results** - Summary of linting fixes made
7. **Known Issues** - Any tests that are skipped or flaky
8. **Recommendations** - Future improvements for testing/tooling




