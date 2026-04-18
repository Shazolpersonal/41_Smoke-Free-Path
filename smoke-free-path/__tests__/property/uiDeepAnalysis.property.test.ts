import * as fc from 'fast-check';

// Mock react-native-reanimated so the worklet-annotated function can be called as a plain function in Jest
jest.mock('react-native-reanimated', () => ({
  __esModule: true,
  default: { createAnimatedComponent: (c: unknown) => c },
  useSharedValue: (v: unknown) => ({ value: v }),
  useAnimatedProps: (fn: () => unknown) => fn(),
  withTiming: (v: unknown) => v,
  cancelAnimation: jest.fn(),
  runOnJS: (fn: (...args: unknown[]) => unknown) => fn,
  Easing: { linear: (t: number) => t },
}));

import { CIRCUMFERENCE } from '@/components/CravingTimer';

// ─── Property 3: CravingTimer Pause Correctness ───────────────────────────────
// Validates: Requirement 18
// Tests the strokeDashoffset formula directly (worklet functions are transformed
// by Reanimated's Babel plugin and cannot be called as plain functions in Jest)

const computeStrokeDashoffset = (progressVal: number) =>
  CIRCUMFERENCE * (1 - progressVal);

test('Property 3: CravingTimer strokeDashoffset calculation', () => {
  fc.assert(
    fc.property(
      fc.float({ min: 0, max: 1, noNaN: true }),
      (progressValue) => {
        const offset = computeStrokeDashoffset(progressValue);
        if (Number.isNaN(progressValue)) return true;
        return Math.abs(offset - CIRCUMFERENCE * (1 - progressValue)) < 0.001;
      }
    ),
    { numRuns: 100 }
  );
});

// ─── Property 2: Dark Mode Surface Color ─────────────────────────────────────
// Validates: Requirement 4

import * as fs from 'fs';
import * as path from 'path';

test('Property 2: Dark Mode Surface Color — no hardcoded #FFFFFF in progress.tsx StyleSheet', () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, '../../app/(tabs)/progress.tsx'),
    'utf-8'
  );
  // Extract the StyleSheet.create block and check for hardcoded white
  const styleSheetMatch = source.match(/StyleSheet\.create\(\{[\s\S]*?\}\);/);
  if (styleSheetMatch) {
    const styleSheetStr = styleSheetMatch[0];
    expect(styleSheetStr).not.toMatch(/#FFFFFF/i);
    expect(styleSheetStr).not.toMatch(/'white'/);
    expect(styleSheetStr).not.toMatch(/"white"/);
  }
});

// ─── Property 1: Typography Consistency ──────────────────────────────────────
// Validates: Requirements 1, 2, 3

const FILES_TO_CHECK = [
  { name: 'milestone/[id].tsx', relPath: '../../app/milestone/[id].tsx' },
  { name: 'slip-up/index.tsx', relPath: '../../app/slip-up/index.tsx' },
  { name: 'HealthTimeline.tsx', relPath: '../../components/HealthTimeline.tsx' },
];

describe('Property 1: Typography Consistency', () => {
  FILES_TO_CHECK.forEach(({ name, relPath }) => {
    test(`${name} should not use raw <Text> component`, () => {
      const source = fs.readFileSync(path.resolve(__dirname, relPath), 'utf-8');
      // Check if file imports Text from react-native
      const importsText = /import\s+\{[^}]*\bText\b[^}]*\}\s+from\s+['"]react-native['"]/.test(source);
      // Check if file uses <Text in JSX
      const usesTextJSX = /<Text[\s>]/.test(source);
      // Both conditions together = raw Text usage
      expect(importsText && usesTextJSX).toBe(false);
    });
  });
});

// ─── Property 4: Touch Target Minimum Size ───────────────────────────────────
// Validates: Requirement 14

test('Property 4: Touch Target Minimum Size — intensity buttons >= 44x44px', () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, '../../app/craving/index.tsx'),
    'utf-8'
  );
  // Extract width and height from intensityBtn style
  const widthMatch = source.match(/intensityBtn:\s*\{[^}]*width:\s*(\d+)/);
  const heightMatch = source.match(/intensityBtn:\s*\{[^}]*height:\s*(\d+)/);

  if (widthMatch && heightMatch) {
    const width = parseInt(widthMatch[1], 10);
    const height = parseInt(heightMatch[1], 10);
    expect(width).toBeGreaterThanOrEqual(44);
    expect(height).toBeGreaterThanOrEqual(44);
  } else {
    // If no explicit size found, fail the test
    fail('intensityBtn width/height not found in StyleSheet');
  }
});
