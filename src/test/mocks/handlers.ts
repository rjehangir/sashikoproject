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
      id: params['id'],
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
