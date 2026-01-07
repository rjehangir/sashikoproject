# The Sashiko Project

A client-side web application for authoring Sashiko pattern tiles using SVG syntax, previewing them tiled live, scaling to exact physical dimensions, and exporting correctly scaled printable PDFs.

**Live Site**: [sashikoproject.org](https://sashikoproject.org)

## Features

- **Marketing Website**: Beautiful landing page and pattern gallery optimized for SEO
- **SVG Pattern Editor**: Monaco-based code editor for creating pattern tiles
- **Graphical Editor**: Visual drawing tools with grid snapping
- **Live Preview**: Real-time tiled preview with thread styling
- **Physical Scaling**: Set tile sizes in mm or inches, with automatic tiling
- **PDF Export**: Generate correctly scaled PDFs for printing with calibration squares
- **Pattern Library**: Browse and load patterns from the cloud database
- **Pattern Submission**: Submit your patterns for inclusion in the library
- **Local Drafts**: Save work-in-progress designs to browser storage
- **Editing Helpers**: Mirror, rotate, snap-to-grid, and apply stitch styles

## Quick Start

### Prerequisites

- Node.js 20+ and pnpm installed

### Installation

```bash
# Install dependencies
pnpm install
```

### Environment Setup

Create a `.env` file in the project root with your Supabase credentials:

```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Development

```bash
# Start development server
pnpm dev
```

The app will be available at `http://localhost:4321`

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

## Deployment to Cloudflare Pages

This project uses Cloudflare Pages for automatic deployments from GitHub.

### Setup (One-time)

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Click **Create a project** → **Connect to Git**
3. Select your GitHub repository
4. Configure build settings:
   - **Build command**: `pnpm run build`
   - **Build output directory**: `dist`
   - **Root directory**: (leave empty)
5. Click **Save and Deploy**

### Environment Variables

Add these in Cloudflare Pages → Settings → Environment variables:

| Variable | Value |
|----------|-------|
| `NODE_VERSION` | `20` |
| `PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |

### Automatic Deployments

Once connected, every push to `main` triggers an automatic deployment. Pull requests get preview deployments.

### Custom Domain

1. Go to Cloudflare Pages → Your project → Custom domains
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `sashikoproject.org`)
4. Follow DNS configuration instructions

## Project Structure

```
sashiko/
├── public/
│   ├── patterns/              # Pattern JSON files
│   └── images/patterns/       # Generated pattern images (SEO)
├── src/
│   ├── components/            # React & Astro components
│   │   ├── layout/            # Header, SplitPane
│   │   ├── ui/                # Reusable UI components
│   │   ├── marketing/         # Marketing page components
│   │   └── patterns/          # Pattern display components
│   ├── layouts/               # Astro page layouts
│   ├── pages/                 # Astro pages (routes)
│   │   ├── index.astro        # Landing page
│   │   ├── design.astro       # Design tool
│   │   ├── techniques.astro   # Techniques guide
│   │   └── patterns/          # Pattern pages
│   ├── config/                # App configuration
│   ├── features/              # Feature modules
│   │   ├── editor/            # Code & graphical editors
│   │   ├── tools/             # Tools panel
│   │   └── admin/             # Admin panel
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   ├── services/              # External service integrations
│   ├── store/                 # Zustand state management
│   ├── types/                 # TypeScript types & Zod schemas
│   └── styles/                # Global CSS
├── scripts/
│   └── generate-pattern-images.ts  # SEO image generation
├── supabase/
│   └── schema.sql             # Database schema
└── astro.config.mjs           # Astro configuration
```

## Technology Stack

- **Framework**: Astro 4 + React 18 + TypeScript
- **Build Tool**: Astro (Vite under the hood)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Editor**: Monaco Editor
- **PDF Generation**: pdf-lib
- **Image Processing**: Sharp
- **Deployment**: Cloudflare Pages

## Page Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with pattern gallery |
| `/design` | Interactive design tool (React app) |
| `/patterns` | Pattern library listing |
| `/patterns/[id]` | Individual pattern pages (SEO optimized) |
| `/techniques` | Sashiko techniques guide (coming soon) |

## Supabase Setup (for Self-Hosting)

If you're deploying your own instance, you'll need to set up Supabase:

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from Settings → API

### 2. Run the Database Schema

In the Supabase SQL Editor, run the contents of `supabase/schema.sql` to create:
- `patterns` table for pattern metadata
- `gallery_submissions` table for user-submitted images
- `admin_config` table for admin authentication
- Row Level Security policies
- Required indexes

### 3. Create Storage Buckets

In Supabase Storage, create these buckets:

**patterns bucket**:
- Name: `patterns`
- Public: Yes
- Allowed MIME types: `image/svg+xml`

**pattern-images bucket** (for user gallery):
- Name: `pattern-images`
- Public: Yes
- Allowed MIME types: `image/jpeg, image/png, image/webp`

## SVG Subset

The tool enforces a strict SVG subset for security and PDF compatibility:

**Allowed Elements**: `svg`, `g`, `path`, `line`, `polyline`, `polygon`, `circle`, `rect`

**Allowed Attributes**: Standard SVG attributes (no scripts, event handlers, or external references)

**Path Commands**: For best PDF compatibility, prefer `M`, `L`, `H`, `V`, `Z`. Complex curves may not render in PDF.

## License

This project is open source. Individual patterns may have their own licenses (specified in pattern files).

## Contributing

Contributions are welcome! You can:

1. **Submit patterns** via the in-app submission form
2. **Report bugs** by opening GitHub issues
3. **Contribute code** via pull requests

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## Support

For issues, questions, or feature requests, please open an issue on GitHub.
