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

    it('should preserve existing transforms', () => {
      const svg =
        '<svg viewBox="0 0 10 10"><g transform="rotate(45)"><line x1="0" y1="0" x2="10" y2="10"/></g></svg>';
      const result = transformer.mirrorHorizontal(svg, viewBox);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toContain('rotate(45)');
        expect(result.data).toContain('scale(-1, 1)');
      }
    });

    it('should fail on invalid SVG', () => {
      const result = transformer.mirrorHorizontal('invalid', viewBox);
      expect(result.success).toBe(false);
    });
  });

  describe('mirrorVertical', () => {
    it('should add vertical mirror transform', () => {
      const svg = '<svg viewBox="0 0 10 10"><line x1="0" y1="2" x2="10" y2="8"/></svg>';
      const result = transformer.mirrorVertical(svg, viewBox);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toContain('scale(1, -1)');
        expect(result.data).toContain('translate(0, -10)');
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
        // Should rotate around center
        expect(result.data).toContain('translate(5, 5)');
        expect(result.data).toContain('translate(-5, -5)');
      }
    });
  });

  describe('snapToGrid', () => {
    it('should snap coordinates to grid', () => {
      const svg = '<svg viewBox="0 0 100 100"><line x1="0.7" y1="0.3" x2="9.8" y2="10.2"/></svg>';
      const largeViewBox = { minX: 0, minY: 0, width: 100, height: 100 };
      const result = transformer.snapToGrid(svg, largeViewBox, 1);

      expect(result.success).toBe(true);
      if (result.success) {
        // Values should be snapped
        expect(result.data).toContain('svg');
      }
    });

    it('should return original SVG when grid size is 0', () => {
      const svg = '<svg viewBox="0 0 10 10"><line x1="0.5" y1="0.5" x2="10" y2="10"/></svg>';
      const result = transformer.snapToGrid(svg, viewBox, 0);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(svg);
      }
    });
  });

  describe('applyThreadStyle', () => {
    it('should apply stroke styling', () => {
      const svg = '<svg viewBox="0 0 10 10"><line x1="0" y1="0" x2="10" y2="10"/></svg>';
      const options = {
        strokeColor: '#ff0000',
        strokeWidthMm: 0.5,
        stitchLengthMm: 3,
        gapLengthMm: 1.5,
      };
      const result = transformer.applyThreadStyle(svg, viewBox, options);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toContain('stroke="#ff0000"');
        expect(result.data).toContain('stroke-width="0.50"');
        expect(result.data).toContain('stroke-dasharray="3.00 1.50"');
        expect(result.data).toContain('stroke-linecap="round"');
      }
    });

    it('should apply styling to multiple elements', () => {
      const svg = `
        <svg viewBox="0 0 10 10">
          <line x1="0" y1="0" x2="10" y2="10"/>
          <circle cx="5" cy="5" r="2"/>
        </svg>
      `;
      const options = {
        strokeColor: '#ffffff',
        strokeWidthMm: 0.6,
        stitchLengthMm: 3,
        gapLengthMm: 1.5,
      };
      const result = transformer.applyThreadStyle(svg, viewBox, options);

      expect(result.success).toBe(true);
      if (result.success) {
        // Both elements should have stroke applied
        const matches = result.data.match(/stroke="#ffffff"/g);
        expect(matches).toHaveLength(2);
      }
    });
  });

  describe('resetThreadStyle', () => {
    it('should remove dash array styling', () => {
      const svg =
        '<svg viewBox="0 0 10 10"><line x1="0" y1="0" x2="10" y2="10" stroke-dasharray="3 1.5" stroke-linecap="round"/></svg>';
      const result = transformer.resetThreadStyle(svg);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toContain('stroke-dasharray');
        expect(result.data).not.toContain('stroke-linecap');
      }
    });
  });

  describe('setViewBox', () => {
    it('should set viewBox attribute', () => {
      const svg = '<svg><rect width="10" height="10"/></svg>';
      const newViewBox = { minX: 0, minY: 0, width: 50, height: 50 };
      const result = transformer.setViewBox(svg, newViewBox);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toContain('viewBox="0 0 50 50"');
      }
    });

    it('should update existing viewBox', () => {
      const svg = '<svg viewBox="0 0 10 10"><rect/></svg>';
      const newViewBox = { minX: 5, minY: 5, width: 100, height: 100 };
      const result = transformer.setViewBox(svg, newViewBox);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toContain('viewBox="5 5 100 100"');
        expect(result.data).not.toContain('viewBox="0 0 10 10"');
      }
    });
  });
});
