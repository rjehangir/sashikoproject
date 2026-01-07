# The Sashiko Project

A client-side web application for authoring Sashiko pattern tiles using SVG syntax, previewing them tiled live, scaling to exact physical dimensions, and exporting correctly scaled printable PDFs.

## Features

- **SVG Pattern Editor**: Monaco-based code editor for creating pattern tiles
- **Live Preview**: Real-time tiled preview with thread styling
- **Physical Scaling**: Set tile sizes in mm or inches, with automatic tiling
- **PDF Export**: Generate correctly scaled PDFs for printing with calibration squares
- **Pattern Library**: Browse and load patterns from the library
- **Editing Helpers**: Mirror, rotate, snap-to-grid, and apply stitch styles
- **GitHub Pages Ready**: Deployable as a static site

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm installed

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Start development server
pnpm dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
# Build for production
pnpm build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
# Preview the production build
pnpm preview
```

## Deployment to GitHub Pages

### Initial Setup

1. Update `vite.config.ts` with your repository name:
   ```typescript
   base: '/your-repo-name/', // Change this
   ```

2. Build the project:
   ```bash
   pnpm build
   ```

3. Configure GitHub Pages:
   - Go to your repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` (or `main` with `/dist` folder)
   - Folder: `/root` or `/dist` (depending on your setup)

### Using GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Custom Domain

To use a custom domain:

1. Update `vite.config.ts`:
   ```typescript
   base: '/', // Change from '/repo-name/' to '/'
   ```

2. Rebuild and redeploy

3. Add a `CNAME` file in `public/` with your domain name

## Pattern Submissions

Patterns are submitted via GitHub Pull Requests. See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed instructions.

### Quick Submission Steps

1. Create your pattern in the tool
2. Export as JSON
3. Fork the repository
4. Add your pattern file to `public/patterns/[pattern-id].json`
5. Update `public/patterns/index.json`
6. Open a Pull Request

Or use the "Submit Pattern" button in the app to open a GitHub issue.

## Project Structure

```
sashiko/
├── public/
│   └── patterns/          # Pattern library
│       ├── index.json     # Pattern index
│       └── *.json        # Individual patterns
├── src/
│   ├── components/        # React components
│   │   ├── EditorPane.tsx
│   │   ├── PreviewPane.tsx
│   │   ├── Controls.tsx
│   │   └── PatternLibraryModal.tsx
│   ├── lib/              # Utility libraries
│   │   ├── svg.ts        # SVG sanitization & manipulation
│   │   ├── pdf.ts        # PDF export
│   │   ├── patterns.ts   # Pattern loading/export
│   │   └── units.ts      # Unit conversions
│   ├── store/            # Zustand state management
│   │   └── useAppStore.ts
│   ├── types/            # TypeScript types & Zod schemas
│   │   ├── pattern.ts
│   │   └── app.ts
│   └── styles/           # CSS
├── .github/              # GitHub templates
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
└── CONTRIBUTING.md       # Contribution guidelines
```

## Technology Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Editor**: Monaco Editor
- **PDF Generation**: pdf-lib
- **SVG Sanitization**: DOMPurify
- **Validation**: Zod
- **Testing**: Vitest

## SVG Subset

The tool enforces a strict SVG subset for security and PDF compatibility:

**Allowed Elements**: `svg`, `g`, `path`, `line`, `polyline`, `polygon`, `circle`, `rect`

**Allowed Attributes**: Standard SVG attributes (no scripts, event handlers, or external references)

**Path Commands**: For best PDF compatibility, prefer `M`, `L`, `H`, `V`, `Z`. Complex curves may not render in PDF.

## PDF Export

PDFs are generated client-side with:
- Correct physical scaling (mm/in to points)
- Calibration square (50mm) for verification
- Crop marks for alignment
- Settings summary
- Support for A4 and Letter paper sizes

## License

This project is open source. Individual patterns may have their own licenses (specified in pattern files).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on submitting patterns and code contributions.

## Support

For issues, questions, or feature requests, please open an issue on GitHub.




