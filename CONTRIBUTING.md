# Contributing to Sashiko Pattern Tool

Thank you for your interest in contributing patterns to the Sashiko Pattern Tool!

## How to Add a Pattern

### Step 1: Create Your Pattern

1. Open the Sashiko Pattern Tool in your browser
2. Design your pattern tile using the SVG editor
3. Use the editing helpers (Mirror, Rotate, Snap-to-grid) as needed
4. Adjust stitch settings to your preference

### Step 2: Export Your Pattern

1. Click "Export JSON" in the controls panel
2. Save the JSON file with a descriptive name (e.g., `my-pattern-name.json`)

### Step 3: Prepare Your Pattern File

1. Ensure your pattern JSON file follows the PatternV1 schema:
   - `id`: kebab-case identifier (e.g., `my-pattern-name`)
   - `name`: Display name
   - `author`: Your name or handle
   - `license`: License (CC BY 4.0 recommended)
   - `notes`: Optional description
   - `tile.svg`: Your SVG code (must use allowed subset)
   - `tile.viewBox`: ViewBox string (e.g., "0 0 100 100")
   - `defaults`: Stitch settings

2. Validate your SVG:
   - Only these elements are allowed: `svg`, `g`, `path`, `line`, `polyline`, `polygon`, `circle`, `rect`
   - Only standard attributes (no scripts, event handlers, external references)
   - Must be a single tile that tiles correctly

### Step 4: Update the Index

1. Open `public/patterns/index.json`
2. Add your pattern entry:
   ```json
   {
     "id": "my-pattern-name",
     "name": "My Pattern Name",
     "author": "Your Name",
     "license": "CC BY 4.0"
   }
   ```

### Step 5: Submit via Pull Request

1. Fork the repository
2. Create a new branch: `git checkout -b add-pattern-my-pattern-name`
3. Add your pattern file: `public/patterns/my-pattern-name.json`
4. Update `public/patterns/index.json`
5. Commit your changes:
   ```bash
   git add public/patterns/my-pattern-name.json public/patterns/index.json
   git commit -m "Add pattern: My Pattern Name"
   ```
6. Push to your fork: `git push origin add-pattern-my-pattern-name`
7. Open a Pull Request on GitHub

### Alternative: Submit via Issue

If you're not comfortable with Git, you can:
1. Open a new issue using the "Pattern Submission" template
2. Attach your pattern JSON file
3. Provide the pattern details
4. A maintainer will add it for you

## SVG Rules

Your pattern SVG must follow these rules:

### Allowed Elements
- `svg`, `g`, `path`, `line`, `polyline`, `polygon`, `circle`, `rect`

### Allowed Attributes
- Standard SVG attributes: `d`, `x`, `y`, `x1`, `y1`, `x2`, `y2`, `points`, `cx`, `cy`, `r`, `width`, `height`, `viewBox`, `fill`, `stroke`, `stroke-width`, `transform`, `opacity`, `stroke-linecap`, `stroke-linejoin`, `stroke-dasharray`

### Disallowed
- Scripts (`<script>` tags, `onclick`, etc.)
- External references (`<image>`, `href` to external resources)
- `foreignObject`
- Event handlers (`on*` attributes)

### Path Commands (for PDF export)
For best PDF export compatibility, prefer:
- `M` (Move), `L` (Line), `H` (Horizontal), `V` (Vertical), `Z` (Close)

Complex path commands (curves, arcs) may not render correctly in PDF export.

## Pattern Guidelines

1. **Tile Correctly**: Your pattern should tile seamlessly (no visible seams)
2. **ViewBox**: Use a consistent viewBox (e.g., "0 0 100 100") for easier scaling
3. **Size**: Patterns are scaled to physical dimensions, so design with that in mind
4. **Testing**: Test your pattern in the tool before submitting

## License

By submitting a pattern, you agree to license it under the license you specify (CC BY 4.0 recommended). Make sure you have the right to license the pattern under your chosen license.

## Questions?

If you have questions, please open an issue or contact the maintainers.

Thank you for contributing!




