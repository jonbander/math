export interface HandwritingPoint {
  x: number;
  y: number;
}

export interface HandwritingMatch {
  passed: boolean;
  score: number;
  coverage: number;
  precision: number;
  reason: 'matched' | 'too-short' | 'missed-guide' | 'off-guide';
}

export interface MatcherOptions {
  brushRadius?: number;
  tolerance?: number;
  minimumPathLength?: number;
  minimumCoverage?: number;
  minimumPrecision?: number;
  maximumStrokeCount?: number;
}

const countPixels = (mask: Uint8Array) => {
  let count = 0;
  for (let i = 0; i < mask.length; i++) count += mask[i];
  return count;
};

export function alphaToMask(alpha: Uint8ClampedArray): Uint8Array {
  const mask = new Uint8Array(alpha.length);
  for (let i = 0; i < alpha.length; i++) mask[i] = alpha[i] > 0 ? 1 : 0;
  return mask;
}

function stampDisk(mask: Uint8Array, width: number, height: number, point: HandwritingPoint, radius: number) {
  const centerX = Math.round(point.x);
  const centerY = Math.round(point.y);
  const r = Math.max(1, Math.ceil(radius));
  const radiusSquared = radius * radius;
  for (let y = Math.max(0, centerY - r); y <= Math.min(height - 1, centerY + r); y++) {
    for (let x = Math.max(0, centerX - r); x <= Math.min(width - 1, centerX + r); x++) {
      const dx = x - point.x;
      const dy = y - point.y;
      if (dx * dx + dy * dy <= radiusSquared) mask[y * width + x] = 1;
    }
  }
}

export function rasterizeStrokes(
  strokes: HandwritingPoint[][],
  width: number,
  height: number,
  brushRadius = 8,
): Uint8Array {
  const mask = new Uint8Array(width * height);
  for (const stroke of strokes) {
    if (!stroke.length) continue;
    stampDisk(mask, width, height, stroke[0], brushRadius);
    for (let i = 1; i < stroke.length; i++) {
      const start = stroke[i - 1];
      const end = stroke[i];
      const distance = Math.hypot(end.x - start.x, end.y - start.y);
      const steps = Math.max(1, Math.ceil(distance / 2));
      for (let step = 1; step <= steps; step++) {
        const ratio = step / steps;
        stampDisk(mask, width, height, {
          x: start.x + (end.x - start.x) * ratio,
          y: start.y + (end.y - start.y) * ratio,
        }, brushRadius);
      }
    }
  }
  return mask;
}

export function dilateMask(mask: Uint8Array, width: number, height: number, radius: number): Uint8Array {
  const r = Math.max(0, Math.floor(radius));
  if (r === 0) return mask.slice();

  const horizontal = new Uint8Array(mask.length);
  const result = new Uint8Array(mask.length);
  const prefix = new Uint32Array(Math.max(width, height) + 1);
  for (let y = 0; y < height; y++) {
    prefix[0] = 0;
    for (let x = 0; x < width; x++) {
      prefix[x + 1] = prefix[x] + mask[y * width + x];
    }
    for (let x = 0; x < width; x++) {
      const left = Math.max(0, x - r);
      const right = Math.min(width, x + r + 1);
      horizontal[y * width + x] = prefix[right] > prefix[left] ? 1 : 0;
    }
  }
  for (let x = 0; x < width; x++) {
    prefix[0] = 0;
    for (let y = 0; y < height; y++) {
      prefix[y + 1] = prefix[y] + horizontal[y * width + x];
    }
    for (let y = 0; y < height; y++) {
      const top = Math.max(0, y - r);
      const bottom = Math.min(height, y + r + 1);
      result[y * width + x] = prefix[bottom] > prefix[top] ? 1 : 0;
    }
  }
  return result;
}

export function matchHandwriting(
  strokes: HandwritingPoint[][],
  guideMask: Uint8Array,
  width: number,
  height: number,
  options: MatcherOptions = {},
): HandwritingMatch {
  const brushRadius = options.brushRadius ?? 8;
  const tolerance = options.tolerance ?? 10;
  const minimumPathLength = options.minimumPathLength ?? 40;
  const minimumCoverage = options.minimumCoverage ?? 0.7;
  const minimumPrecision = options.minimumPrecision ?? 0.68;
  const maximumStrokeCount = options.maximumStrokeCount ?? 3;

  let pathLength = 0;
  for (const stroke of strokes) {
    for (let i = 1; i < stroke.length; i++) {
      pathLength += Math.hypot(stroke[i].x - stroke[i - 1].x, stroke[i].y - stroke[i - 1].y);
    }
  }
  if (pathLength < minimumPathLength) {
    return { passed: false, score: 0, coverage: 0, precision: 0, reason: 'too-short' };
  }
  if (strokes.length > maximumStrokeCount) {
    return { passed: false, score: 0, coverage: 0, precision: 0, reason: 'off-guide' };
  }

  const guidePixels = countPixels(guideMask);
  if (guidePixels === 0) {
    return { passed: false, score: 0, coverage: 0, precision: 0, reason: 'missed-guide' };
  }

  const inkMask = rasterizeStrokes(strokes, width, height, brushRadius);
  const inkPixels = countPixels(inkMask);
  if (inkPixels === 0) {
    return { passed: false, score: 0, coverage: 0, precision: 0, reason: 'too-short' };
  }

  const nearbyInk = dilateMask(inkMask, width, height, tolerance);
  const nearbyGuide = dilateMask(guideMask, width, height, tolerance);
  let coveredGuidePixels = 0;
  let onGuideInkPixels = 0;
  for (let i = 0; i < guideMask.length; i++) {
    if (guideMask[i] && nearbyInk[i]) coveredGuidePixels++;
    if (inkMask[i] && nearbyGuide[i]) onGuideInkPixels++;
  }

  const coverage = coveredGuidePixels / guidePixels;
  const precision = onGuideInkPixels / inkPixels;
  const score = Math.round(Math.min(coverage, precision) * 100);
  const passed = coverage >= minimumCoverage && precision >= minimumPrecision;
  return {
    passed,
    score,
    coverage,
    precision,
    reason: passed ? 'matched' : 'off-guide',
  };
}
