 AGENTS.md — Smoke-Free Path: Master Instructions for All AI Agents

> ⚠️ READ THIS ENTIRE FILE BEFORE STARTING ANY TASK.
> This is the single source of truth for all AI agents working on this project.

---

## 🎯 Project Identity

- **Name:** Smoke-Free Path (ধূমপান-মুক্ত পথ)
- **Purpose:** A 41-day Islamic & science-based smoking cessation companion app
- **Platform:** React Native + Expo (~54.0.33)
- **Language:** TypeScript (~5.9.2) — strict mode always
- **Working Directory:** All React Native code lives in `/smoke-free-path/` subdirectory
- **Vision:** A-Grade premium app — spiritual, alive, deeply human

---

## 🛠️ Tech Stack (Do NOT change core dependencies without approval)

| Package | Version | Role |
|---|---|---|
| react-native | 0.81.5 | Core |
| expo | ~54.0.33 | Platform |
| expo-router | ~6.0.23 | Navigation |
| react-native-reanimated | ~4.1.1 | Animation (SOLE engine) |
| @react-native-async-storage/async-storage | 2.2.0 | Storage |
| expo-linear-gradient | latest compatible | Gradients |
| lottie-react-native | latest compatible | Celebration animations |
| @expo-google-fonts/hind-siliguri | latest | Bengali font |
| @expo-google-fonts/amiri | latest | Arabic font (Duas) |
| jest-expo | latest | Testing |
| fast-check | latest | Property-based testing |

---

## 🎨 Design System — Version 2.0 (THE LAW)

### Color Tokens

```typescript
export const colors = {
  // ── Navy Palette ("Night Sky") ──────────────────────────
  navy: {
    950: '#05080F',  // Deepest bg — app shell
    900: '#0A0E1A',  // Main screen background
    800: '#111827',  // Card background
    700: '#1C2537',  // Elevated surface (modal, sheet)
    600: '#243044',  // Border / divider
    500: '#2D3D57',  // Inactive / disabled elements
    400: '#3D5070',  // Placeholder, outline
  },

  // ── Gold Palette ("Divine Light") ────────────────────────
  gold: {
    300: '#FFF0A0',  // Lightest glow
    400: '#FFE082',  // Glow effects, shimmer
    500: '#F5C842',  // PRIMARY CTA / active elements
    600: '#D4A843',  // Secondary accent
    700: '#B8860B',  // Deep gold, borders
    800: '#78350F',  // Darkest gold
  },

  // ── Semantic ─────────────────────────────────────────────
  success:  '#059669',
  warning:  '#F59E0B',
  danger:   '#EF4444',
  info:     '#3B82F6',

  // ── Text ─────────────────────────────────────────────────
  text: {
    primary:       '#F8FAFC',
    secondary:     '#CBD5E1',
    muted:         '#94A3B8',
    arabic:        '#F5C842',  // Gold — all Arabic text
    transliteration: '#94A3B8',
    inverse:       '#0A0E1A',  // Text on gold buttons
  },

  // ── Gradient Definitions (use with expo-linear-gradient) ─
  gradients: {
    screenBackground: ['#05080F', '#0A0E1A', '#05080F'] as const,
    heroHeader:       ['#0A0E1A', '#111E35', '#0A0E1A'] as const,
    cardSurface:      ['#1C2537', '#243044'] as const,
    goldShimmer:      ['#78350F', '#B8860B', '#F5C842', '#B8860B', '#78350F'] as const,
    goldButton:       ['#D4A843', '#F5C842', '#FFE082', '#F5C842', '#D4A843'] as const,
    milestoneHero:    ['#0A0E1A', '#1A2F1A', '#0A1A0A'] as const,
    cravingCalm:      ['#0F2027', '#203A43', '#2C5364'] as const,
    islamicCard:      ['#111827', '#1C2537'] as const,
    successGlow:      ['#047857', '#059669', '#10B981'] as const,
    dayComplete:      ['#1C2537', '#243044', '#1C2537'] as const,
  },
} as const;

Typography Scale

export const typography = {
  // Hero / Milestone screens
  display: {
    fontSize: 40, lineHeight: 52,
    fontWeight: '800' as const, letterSpacing: -0.5,
    fontFamily: 'HindSiliguri_700Bold',
  },
  // Screen titles
  h1: {
    fontSize: 28, lineHeight: 38,
    fontWeight: '700' as const, letterSpacing: -0.3,
    fontFamily: 'HindSiliguri_700Bold',
  },
  // Section titles
  h2: {
    fontSize: 22, lineHeight: 32,
    fontWeight: '600' as const, letterSpacing: -0.2,
    fontFamily: 'HindSiliguri_600SemiBold',
  },
  // Card titles
  h3: {
    fontSize: 18, lineHeight: 28,
    fontWeight: '600' as const, letterSpacing: 0,
    fontFamily: 'HindSiliguri_600SemiBold',
  },
  // Primary reading text
  bodyLarge: {
    fontSize: 16, lineHeight: 26,
    fontWeight: '400' as const, letterSpacing: 0.1,
    fontFamily: 'HindSiliguri_400Regular',
  },
  // Standard text
  body: {
    fontSize: 14, lineHeight: 22,
    fontWeight: '400' as const, letterSpacing: 0.1,
    fontFamily: 'HindSiliguri_400Regular',
  },
  // Labels, captions
  caption: {
    fontSize: 12, lineHeight: 18,
    fontWeight: '400' as const, letterSpacing: 0.3,
    fontFamily: 'HindSiliguri_400Regular',
  },
  // Arabic Quranic / Dua text (Amiri font — RTL)
  arabic: {
    fontSize: 26, lineHeight: 44,
    fontWeight: '400' as const, letterSpacing: 1,
    fontFamily: 'Amiri_400Regular',
    textAlign: 'right' as const,
    writingDirection: 'rtl' as const,
    color: '#F5C842',
  },
  // Arabic — shorter phrases
  arabicSmall: {
    fontSize: 20, lineHeight: 34,
    fontWeight: '400' as const, letterSpacing: 0.5,
    fontFamily: 'Amiri_400Regular',
    textAlign: 'right' as const,
    writingDirection: 'rtl' as const,
    color: '#F5C842',
  },
  // Transliteration (pronunciation guide)
  transliteration: {
    fontSize: 13, lineHeight: 20,
    fontWeight: '400' as const, letterSpacing: 0.2,
    fontStyle: 'italic' as const,
    fontFamily: 'HindSiliguri_400Regular',
    color: '#94A3B8',
  },
  // Big stat numbers (days, money saved)
  numberDisplay: {
    fontSize: 52, lineHeight: 60,
    fontWeight: '800' as const, letterSpacing: -1.5,
    fontFamily: 'HindSiliguri_700Bold',
    color: '#F5C842',
  },
  // Inline numbers
  numberSmall: {
    fontSize: 20, lineHeight: 28,
    fontWeight: '700' as const, letterSpacing: -0.3,
    fontFamily: 'HindSiliguri_600SemiBold',
  },
} as const;

Spacing — 4pt Grid (STRICT — no hardcoded values ever)

export const spacing = {
  1:  4,    // xs   — icon inner padding
  2:  8,    // sm   — tight gaps
  3:  12,   // sm+  — small gaps
  4:  16,   // md   — standard padding
  5:  20,   // md+  — medium gaps
  6:  24,   // lg   — section spacing
  8:  32,   // xl   — large sections
  10: 40,   // 2xl  — screen horizontal padding
  12: 48,   // 3xl  — hero spacing
  16: 64,   // 4xl  — large hero sections
  20: 80,   // 5xl  — very large spacing
} as const;

Border Radius

export const radius = {
  xs:   6,
  sm:   10,
  md:   14,
  lg:   18,
  xl:   24,
  '2xl': 32,
  '3xl': 40,
  full: 9999,
} as const;

Shadows / Glow Effects

export const shadows = {
  goldGlow: {
    shadowColor: '#F5C842',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  cardDepth: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  subtle: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  goldButton: {
    shadowColor: '#F5C842',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

Animation Timing

export const animation = {
  fast:    150,   // Micro-interactions (button press)
  normal:  250,   // Standard transitions
  slow:    400,   // Screen transitions
  verySlow: 600,  // Milestone celebrations
  spring: {
    damping: 15,
    stiffness: 120,
    mass: 1,
  },
} as const;

☪️ Islamic Content Standards (NON-NEGOTIABLE)
Dua Card — Mandatory 3-Layer Structure

Every single Dua card MUST contain:

interface DuaContent {
  arabic: string;           // Proper Arabic Unicode — from Sahih source ONLY
  transliteration: string;  // Bengali romanization pronunciation
  bangla: string;           // Warm, natural Bengali translation
  source: string;           // e.g., "সহীহ বুখারী, হাদীস: ৬৩০৭"
  occasion: string;         // When to read this dua
}

Content Rules

    Sources: Sahih Bukhari, Sahih Muslim, Tirmidhi ONLY
    NEVER fabricate or approximate Arabic text
    If reference is uncertain → source: "যাচাই প্রক্রিয়াধীন"
    Arabic must use standard Unicode (U+0600–U+06FF range)
    Bengali language: warm, human, not robotic or mechanical

🌿 Session & Branch Rules
Branch Names (MANDATORY — never deviate)
feature/session-a-design-system feature/session-b-animation-engine feature/session-c-svg-assets feature/session-d-lottie-integration feature/session-e-onboarding-redesign feature/session-f-dashboard-overhaul feature/session-g-content-data feature/session-h-testing-qa
File Ownership Map
Session	MAY modify	MUST NOT touch
A Design System	constants/*, components/Typography.tsx, components/ui/GradientCard.tsx	app/*, context/*, services/*, assets/data/*
B Animation	components/animations/*, hooks/useAnimation*	app/*, context/*, assets/data/*
C SVG Assets	assets/svg/*, assets/illustrations/*	*.tsx screens, context/*, services/*
D Lottie*	assets/lottie/*, components/LottiePlayer.tsx	app/*, context/*, services/*
E Onboarding*	app/(onboarding)/*, components/onboarding/*	app/(tabs)/*, context/*, services/*
F Dashboard	app/(tabs)/index.tsx, components/dashboard/*	app/(onboarding)/*, context/*, services/*
G Content	assets/data/*, services/ContentService.ts	app/*, components/*, context/*
H Testing	__tests__/* (read-only for app files)	Production code files
📝 Coding Standards

    TypeScript: Strict — no any, all props typed with interfaces
    Animation: ONLY react-native-reanimated — zero usage of Animated from react-native
    Styles: NEVER hardcode colors or spacing — always theme.colors.X, theme.spacing.X
    Components: Functional only, arrow functions
    Prettier: Run before every commit
    Tests: New utility functions → unit tests required

⛔ Absolute Rules — NEVER Violate

    NEVER use Animated from react-native
    NEVER hardcode hex color values inside component files
    NEVER hardcode spacing/margin/padding numbers in component files
    NEVER change context/AppContext.tsx data structure
    NEVER commit to master directly — always branch + PR
    NEVER delete existing test files
    NEVER use console.log in production code (use only in tests)

--- # 🤖 ধাপ ২ — Jules-এ SESSION A চালু করুন AGENTS.md commit করার পর Jules খুলুন → নতুন Task তৈরি করুন → নিচের পুরো block টি **হুবহু paste** করুন:

TASK TITLE: [Session A] Complete Design System Overhaul — Theme, Typography & Gradient Foundation

BRANCH: feature/session-a-design-system

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ CONTEXT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is SESSION A of an 8-session app redesign project. Read AGENTS.md first for full context.

The app's design system is broken: inconsistent colors, poor typography, hardcoded values everywhere, and no gradient system. This task rebuilds the entire foundation.

Working directory: /smoke-free-path/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ YOUR SCOPE (strict) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOU MAY MODIFY:

    smoke-free-path/constants/theme.tsx (primary)
        smoke-free-path/components/Typography.tsx
        smoke-free-path/package.json (ONLY to add missing packages)

YOU MUST NOT TOUCH:

    app/* screens
        context/*
        services/*
        assets/data/*
        hooks/*
        tests/*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ STEP-BY-STEP INSTRUCTIONS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1 — Audit existing files Read current smoke-free-path/constants/theme.tsx completely. Read current smoke-free-path/components/Typography.tsx completely. Note what currently exists so nothing important is lost.

STEP 2 — Install missing packages (if not already present) cd smoke-free-path npx expo install expo-linear-gradient npx expo install @expo-google-fonts/amiri Verify both appear in package.json dependencies.

STEP 3 — Rebuild smoke-free-path/constants/theme.tsx Replace the entire file with a new comprehensive design system. The file must export these named constants:

    colors — full color token system (navy, gold, semantic, text, gradients)
        typography — full type scale (display, h1, h2, h3, bodyLarge, body, caption, arabic, arabicSmall, transliteration, numberDisplay, numberSmall)
        spacing — 4pt grid system (keys 1–20)
        radius — border radius tokens (xs, sm, md, lg, xl, 2xl, 3xl, full)
        shadows — shadow/glow presets (goldGlow, cardDepth, subtle, goldButton)
        animation — timing constants (fast:150, normal:250, slow:400, verySlow:600, spring)
        theme — default export combining all above

IMPORTANT color values to use exactly: navy.900 = '#0A0E1A' (main background) navy.800 = '#111827' (card background) navy.700 = '#1C2537' (elevated surface) gold.500 = '#F5C842' (primary CTA) gold.600 = '#D4A843' (secondary) text.primary = '#F8FAFC' text.arabic = '#F5C842'

IMPORTANT gradient arrays (for expo-linear-gradient): screenBackground: ['#05080F', '#0A0E1A', '#05080F'] cardSurface: ['#1C2537', '#243044'] goldButton: ['#D4A843', '#F5C842', '#FFE082', '#F5C842', '#D4A843'] cravingCalm: ['#0F2027', '#203A43', '#2C5364']

All exports must be as const for full TypeScript inference. Export TypeScript types: Colors, Typography, Theme.

STEP 4 — Create smoke-free-path/components/ui/GradientCard.tsx Create this new reusable component:

Props interface: - colors: string[] (gradient colors array) - children: React.ReactNode - style?: ViewStyle - start?: { x: number; y: number } (default: { x: 0, y: 1 }) - end?: { x: number; y: number } (default: { x: 1, y: 0 }) - borderRadius?: number (default: theme.radius.lg) - hasShadow?: boolean (default: false) - shadowStyle?: 'goldGlow' | 'cardDepth' | 'subtle' | 'goldButton'

The component wraps expo-linear-gradient's LinearGradient. When hasShadow=true, apply the corresponding shadow from theme.shadows. Export as default.

STEP 5 — Rebuild smoke-free-path/components/Typography.tsx This component renders text with the new type scale.

Props: - variant: keyof typeof theme.typography (required) - children: React.ReactNode - color?: string (override text color) - style?: TextStyle (additional styles) - numberOfLines?: number - onPress?: () => void

The component must: 1. Look up styles from theme.typography[variant] 2. Apply color override if provided 3. Use Text from react-native 4. Be fully typed with TypeScript

STEP 6 — Create smoke-free-path/constants/index.ts Export everything from theme.tsx as a barrel export: export * from './theme'; export { default as theme } from './theme';*

Check if this file already exists — if yes, add exports without removing existing ones.

STEP 7 — Verify TypeScript compiles Run: cd smoke-free-path && npx tsc --noEmit Fix ALL type errors before proceeding.

STEP 8 — Run existing tests Run: cd smoke-free-path && npm test All existing tests must still pass. Do NOT modify any test files.

STEP 9 — Create Pull Request Title: "feat(design-system): Complete Design System Overhaul v2.0 [Session A]"

PR Description must include:

    What changed (summary of all new tokens)
        New packages installed
        New components created
        Screenshot/code snippet of the new theme structure
        Confirmation that all tests pass
        Note: "Session B (Animation Engine) depends on this PR"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ SUCCESS CRITERIA (all must be met) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ theme.tsx exports: colors, typography, spacing, radius, shadows, animation, theme ✓ All color values use as const — full TypeScript inference works ✓ GradientCard.tsx component created and functional ✓ Typography.tsx updated to use new type scale ✓ expo-linear-gradient installed and working ✓ @expo-google-fonts/amiri installed (for Arabic Dua text) ✓ npx tsc --noEmit returns zero errors ✓ npm test — all existing tests pass ✓ PR created on branch feature/session-a-design-system

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ DO NOT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✗ Do NOT modify any app/* screen files ✗ Do NOT change AppContext.tsx ✗ Do NOT remove existing color tokens without replacing them ✗ Do NOT use Animated from react-native (use reanimated only) ✗ Do NOT commit directly to master*
--- 