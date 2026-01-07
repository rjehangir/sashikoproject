# The Sashiko Project

A client-side web application for authoring Sashiko pattern tiles using SVG syntax, previewing them tiled live, scaling to exact physical dimensions, and exporting correctly scaled printable PDFs.

## Features

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

- Node.js 18+ and pnpm installed

### Installation

```bash
# Install dependencies
pnpm install
```

### Environment Setup

Create a `.env` file in the project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
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

## Supabase Setup (for Self-Hosting)

If you're deploying your own instance, you'll need to set up Supabase:

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from Settings → API

### 2. Run the Database Schema

In the Supabase SQL Editor, run the contents of `supabase/schema.sql` to create:
- `patterns` table for pattern metadata
- `pattern_images` table for example images (future use)
- `admin_config` table for admin authentication
- Row Level Security policies
- Required indexes

### 3. Create Storage Buckets

In Supabase Storage, create a bucket named `patterns`:
1. Go to Storage → New Bucket
2. Name: `patterns`
3. Public bucket: Yes
4. File size limit: 5MB
5. Allowed MIME types: `image/svg+xml`

Add these storage policies in the SQL Editor:

```sql
-- Allow uploads to submissions folder
CREATE POLICY "Allow anonymous uploads to submissions"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'patterns' AND (storage.foldername(name))[1] = 'submissions');

-- Allow public read access
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'patterns');

-- Allow deleting pattern files
CREATE POLICY "Allow deleting pattern files"
ON storage.objects FOR DELETE TO public
USING (bucket_id = 'patterns');
```

### 4. Set Up Admin Password

Run this SQL to set your admin password:

```sql
INSERT INTO admin_config (key, value) 
VALUES ('admin_password_hash', 'YOUR_BASE64_PASSWORD')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

To generate the base64 password, run in browser console: `btoa('your-password')`

## Usage Guide

### Creating a New Pattern

1. Click **New** to start a fresh design
2. Use the code editor (SVG) or graphical tools to create your pattern
3. Adjust tile size and viewBox as needed
4. Preview the tiled result in the right pane

### Saving Your Work

- **Save Draft**: Saves your current design to browser storage (persists across sessions)
- **Library → My Drafts**: Access your saved drafts

### Submitting a Pattern

1. Click **Submit** in the header
2. Fill in pattern details (name, author, license)
3. Optionally provide your email for updates
4. Submit for review

Submitted patterns go into a moderation queue and will appear in the library once approved.

### Admin Panel

Access the admin panel with **Ctrl+Shift+A** (or click the hidden settings icon in the header).

Features:
- Review pending pattern submissions
- Approve or reject patterns
- Delete patterns from the database

## Project Structure

```
sashiko/
├── public/
│   └── patterns/          # Legacy static patterns
├── src/
│   ├── components/        # React components
│   │   ├── layout/        # Header, SplitPane
│   │   ├── ui/            # Reusable UI components
│   │   ├── fallbacks/     # Error boundary fallbacks
│   │   ├── PatternLibraryModal.tsx
│   │   ├── SubmitPatternModal.tsx
│   │   └── PreviewPane.tsx
│   ├── config/            # App configuration
│   │   └── supabase.ts    # Supabase client
│   ├── features/          # Feature modules
│   │   ├── editor/        # Code & graphical editors
│   │   ├── tools/         # Tools panel
│   │   └── admin/         # Admin panel
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   │   ├── svg.ts         # SVG sanitization
│   │   ├── pdf.ts         # PDF export
│   │   └── units.ts       # Unit conversions
│   ├── services/          # External service integrations
│   │   ├── pattern/       # Pattern CRUD operations
│   │   ├── pdf/           # PDF generation
│   │   ├── storage/       # localStorage adapter
│   │   └── svg/           # SVG parsing/validation
│   ├── store/             # Zustand state management
│   │   └── slices/        # State slices
│   ├── types/             # TypeScript types & Zod schemas
│   └── styles/            # CSS
├── supabase/
│   └── schema.sql         # Database schema
└── .env                   # Environment variables (not committed)
```

## Technology Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
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
