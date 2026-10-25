// @ts-expect-error Bun provides this module only while running tests; it is not an app dependency.
import { describe, expect, test } from 'bun:test';
import { dilateMask, matchHandwriting, type HandwritingPoint } from './handwritingMatcher';

const width = 120;
const height = 120;

function verticalGuide(): Uint8Array {
  const mask = new Uint8Array(width * height);
  for (let y = 18; y <= 102; y++) {
    for (let x = 57; x <= 63; x++) mask[y * width + x] = 1;
  }
  return mask;
}

function line(x1: number, y1: number, x2: number, y2: number, samples = 30): HandwritingPoint[] {
  return Array.from({ length: samples + 1 }, (_, index) => {
    const t = index / samples;
    return { x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t };
  });
}

describe('dilateMask', () => {
  test('expands pixels symmetrically and clips at the image boundaries', () => {
    const source = new Uint8Array(5 * 5);
    source[0] = 1;
    const result = dilateMask(source, 5, 5, 1);
    expect(result[0]).toBe(1);
    expect(result[1]).toBe(1);
    expect(result[5]).toBe(1);
    expect(result[6]).toBe(1);
    expect(result[2]).toBe(0);
    expect(result[10]).toBe(0);
  });
});

describe('matchHandwriting', () => {
  const guide = verticalGuide();
  const options = { brushRadius: 3, tolerance: 5, minimumPathLength: 40, minimumCoverage: 0.7, minimumPrecision: 0.68 };

  test('accepts a full trace with a small offset', () => {
    const result = matchHandwriting([line(66, 20, 66, 100)], guide, width, height, options);
    expect(result.passed).toBe(true);
    expect(result.coverage).toBeGreaterThanOrEqual(0.7);
    expect(result.precision).toBeGreaterThanOrEqual(0.68);
  });

  test('scores the same path consistently at sparse and dense sample rates', () => {
    const sparse = matchHandwriting([line(66, 20, 66, 100, 1)], guide, width, height, options);
    const dense = matchHandwriting([line(66, 20, 66, 100, 60)], guide, width, height, options);
    expect(sparse.score).toBe(dense.score);
    expect(sparse.passed).toBe(dense.passed);
  });

  test('rejects a short tap', () => {
    const result = matchHandwriting([[{ x: 60, y: 20 }, { x: 60, y: 24 }]], guide, width, height, options);
    expect(result.passed).toBe(false);
    expect(result.reason).toBe('too-short');
  });

  test('rejects an unrelated horizontal scribble', () => {
    const result = matchHandwriting([line(15, 35, 105, 35)], guide, width, height, options);
    expect(result.passed).toBe(false);
    expect(result.reason).toBe('off-guide');
  });

  test('rejects a partial trace that only covers part of the glyph', () => {
    const result = matchHandwriting([line(60, 20, 60, 48)], guide, width, height, options);
    expect(result.passed).toBe(false);
    expect(result.coverage).toBeLessThan(0.7);
  });

  test('rejects an otherwise correct trace with a large off-guide scribble', () => {
    const trace = line(60, 20, 60, 100);
    const strayLoop = [
      { x: 15, y: 20 }, { x: 35, y: 20 }, { x: 35, y: 40 },
      { x: 15, y: 40 }, { x: 15, y: 20 },
    ];
    const result = matchHandwriting([trace, strayLoop], guide, width, height, options);
    expect(result.passed).toBe(false);
    expect(result.precision).toBeLessThan(0.68);
  });

  test('rejects many separate doodles even if they touch the guide in several places', () => {
    const fragments = [20, 38, 56, 74, 92].map((y) => line(58, y, 64, y + 9, 4));
    const result = matchHandwriting(fragments, guide, width, height, options);
    expect(result.passed).toBe(false);
    expect(result.reason).toBe('off-guide');
  });
});
