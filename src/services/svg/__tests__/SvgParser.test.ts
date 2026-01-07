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

    it('should parse SVG without viewBox', () => {
      const svg = '<svg><rect width="10" height="10"/></svg>';
      const result = parser.parse(svg);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.svgElement).toBeDefined();
        expect(result.data.viewBox).toBeNull();
      }
    });

    it('should fail on invalid SVG - no SVG element', () => {
      const result = parser.parse('<not-svg>content</not-svg>');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('No SVG element');
      }
    });

    it('should fail on malformed XML', () => {
      const result = parser.parse('<svg><unclosed');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Invalid SVG syntax');
      }
    });

    it('should parse SVG with nested elements', () => {
      const svg = `
        <svg viewBox="0 0 100 100">
          <g id="group1">
            <line x1="0" y1="0" x2="100" y2="100"/>
            <circle cx="50" cy="50" r="25"/>
          </g>
        </svg>
      `;
      const result = parser.parse(svg);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.svgElement.querySelector('g')).toBeDefined();
        expect(result.data.svgElement.querySelector('line')).toBeDefined();
        expect(result.data.svgElement.querySelector('circle')).toBeDefined();
      }
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

    it('should parse negative minX and minY', () => {
      const result = parser.parseViewBox('-10 -20 100 200');
      expect(result).toEqual({ minX: -10, minY: -20, width: 100, height: 200 });
    });

    it('should return null for invalid viewBox', () => {
      expect(parser.parseViewBox('invalid')).toBeNull();
      expect(parser.parseViewBox('')).toBeNull();
      expect(parser.parseViewBox('0 0 100')).toBeNull(); // Only 3 values
    });

    it('should handle extra whitespace', () => {
      const result = parser.parseViewBox('  0   0   100   200  ');
      expect(result).toEqual({ minX: 0, minY: 0, width: 100, height: 200 });
    });
  });

  describe('formatViewBox', () => {
    it('should format viewBox correctly', () => {
      const viewBox = { minX: 0, minY: 0, width: 100, height: 200 };
      expect(parser.formatViewBox(viewBox)).toBe('0 0 100 200');
    });

    it('should format negative values', () => {
      const viewBox = { minX: -10, minY: -20, width: 100, height: 200 };
      expect(parser.formatViewBox(viewBox)).toBe('-10 -20 100 200');
    });

    it('should format decimal values', () => {
      const viewBox = { minX: 0.5, minY: 1.5, width: 10.5, height: 20.5 };
      expect(parser.formatViewBox(viewBox)).toBe('0.5 1.5 10.5 20.5');
    });
  });

  describe('serialize', () => {
    it('should serialize document back to string', () => {
      const svg = '<svg viewBox="0 0 10 10"><line x1="0" y1="0" x2="10" y2="10"/></svg>';
      const result = parser.parse(svg);

      expect(result.success).toBe(true);
      if (result.success) {
        const serialized = parser.serialize(result.data.document);
        expect(serialized).toContain('svg');
        expect(serialized).toContain('line');
      }
    });
  });

  describe('extractViewBox', () => {
    it('should extract viewBox from SVG string', () => {
      const svg = '<svg viewBox="0 0 50 50"><rect/></svg>';
      const viewBox = parser.extractViewBox(svg);

      expect(viewBox).toEqual({ minX: 0, minY: 0, width: 50, height: 50 });
    });

    it('should return null for invalid SVG', () => {
      expect(parser.extractViewBox('not svg')).toBeNull();
    });

    it('should return null for SVG without viewBox', () => {
      expect(parser.extractViewBox('<svg><rect/></svg>')).toBeNull();
    });
  });
});
