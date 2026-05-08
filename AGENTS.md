# AGENTS.md — Smoke-Free Path: Master Instructions

> Read this entire file before starting any task.

## Project Info

- App name: Smoke-Free Path
- Platform: React Native + Expo
- Language: TypeScript (strict mode always)
- Working directory: /smoke-free-path/ (all RN code is inside this folder)
- Goal: A-Grade premium Islamic smoking cessation app

## Tech Stack (do not change versions without approval)

- expo ~54.0.33
- expo-router ~6.0.23
- react-native-reanimated ~4.1.1 (ONLY animation library — never use Animated from react-native)
- expo-linear-gradient (install if missing)
- lottie-react-native (install if missing)
- @expo-google-fonts/hind-siliguri (Bengali font)
- @expo-google-fonts/amiri (Arabic font — for Duas)
- jest-expo + fast-check (testing)

## New Color System (use exactly these values)

Background colors:
- Main screen background: #0A0E1A
- Card background: #111827
- Elevated surface (modals): #1C2537
- Border / divider: #243044

Gold accent colors:
- Primary CTA / active: #F5C842
- Secondary accent: #D4A843
- Glow / shimmer: #FFE082
- Deep gold: #B8860B

Text colors:
- Primary text: #F8FAFC
- Secondary text: #CBD5E1
- Muted / placeholder: #94A3B8
- Arabic text: #F5C842
- Transliteration text: #94A3B8

Semantic colors:
- Success: #059669
- Warning: #F59E0B
- Danger: #EF4444

Gradient arrays (for expo-linear-gradient):
- screenBackground: ['#05080F', '#0A0E1A', '#05080F']
- cardSurface: ['#1C2537', '#243044']
- goldButton: ['#D4A843', '#F5C842', '#FFE082', '#F5C842', '#D4A843']
- islamicCard: ['#111827', '#1C2537']
- milestoneHero: ['#0A0E1A', '#1A2F1A', '#0A1A0A']
- cravingCalm: ['#0F2027', '#203A43', '#2C5364']

## New Typography Scale

Display (hero/milestone screens): fontSize 40, lineHeight 52, fontWeight 800
H1 (screen titles): fontSize 28, lineHeight 38, fontWeight 700
H2 (section titles): fontSize 22, lineHeight 32, fontWeight 600
H3 (card titles): fontSize 18, lineHeight 28, fontWeight 600
Body Large (main reading): fontSize 16, lineHeight 26, fontWeight 400
Body (standard): fontSize 14, lineHeight 22, fontWeight 400
Caption (labels): fontSize 12, lineHeight 18, fontWeight 400
Arabic (Duas — Amiri font, RTL, gold color): fontSize 26, lineHeight 44
Arabic Small: fontSize 20, lineHeight 34
Transliteration (italic, muted): fontSize 13, lineHeight 20
Number Display (stats): fontSize 52, lineHeight 60, fontWeight 800, gold color
Number Small: fontSize 20, lineHeight 28, fontWeight 700

All Bengali text uses: HindSiliguri font
All Arabic text uses: Amiri font, textAlign right, writingDirection rtl

## Spacing System (4pt grid — never use hardcoded numbers)

spacing[1] = 4
spacing[2] = 8
spacing[3] = 12
spacing[4] = 16
spacing[5] = 20
spacing[6] = 24
spacing[8] = 32
spacing[10] = 40
spacing[12] = 48
spacing[16] = 64

## Border Radius

xs = 6, sm = 10, md = 14, lg = 18, xl = 24, 2xl = 32, full = 9999

## Shadow Presets

goldGlow: shadowColor #F5C842, offset (0,0), opacity 0.35, radius 16, elevation 10
cardDepth: shadowColor #000, offset (0,6), opacity 0.45, radius 12, elevation 8
subtle: shadowColor #000, offset (0,2), opacity 0.25, radius 6, elevation 4

## Animation Timing

fast: 150ms (button press micro-interactions)
normal: 250ms (standard transitions)
slow: 400ms (screen transitions)
verySlow: 600ms (milestone celebrations)
spring: damping 15, stiffness 120, mass 1

## Islamic Content Rules

Every Dua card must have exactly 4 layers:
1. arabic — proper Arabic Unicode text (from Sahih Bukhari, Muslim, or Tirmidhi ONLY)
2. transliteration — Bengali romanization pronunciation guide
3. bangla — warm, natural Bengali translation
4. source — e.g. "সহীহ বুখারী, হাদীস: ৬৩০৭"

Never fabricate or approximate Arabic text.
Never invent hadith references.
If reference is uncertain, write: source: "যাচাই প্রক্রিয়াধীন"

## Session Branch Names (always use exactly these)

feature/session-a-design-system
feature/session-b-animation-engine
feature/session-c-svg-assets
feature/session-d-lottie-integration
feature/session-e-onboarding-redesign
feature/session-f-dashboard-overhaul
feature/session-g-content-data
feature/session-h-testing-qa

## File Ownership Per Session

Session A (Design System):
  CAN modify: constants/theme.tsx, components/Typography.tsx, components/ui/GradientCard.tsx
  CANNOT touch: app/, context/, services/, assets/data/

Session B (Animation):
  CAN modify: components/animations/, hooks/useAnimation files
  CANNOT touch: app/, context/, assets/data/

Session C (SVG Assets):
  CAN modify: assets/svg/, assets/illustrations/
  CANNOT touch: any .tsx screen files, context/, services/

Session D (Lottie):
  CAN modify: assets/lottie/, components/LottiePlayer.tsx
  CANNOT touch: app/, context/, services/

Session E (Onboarding):
  CAN modify: app/(onboarding)/, components/onboarding/
  CANNOT touch: app/(tabs)/, context/, services/

Session F (Dashboard):
  CAN modify: app/(tabs)/index.tsx, components/dashboard/
  CANNOT touch: app/(onboarding)/, context/, services/

Session G (Content/Data):
  CAN modify: assets/data/, services/ContentService.ts
  CANNOT touch: app/, components/, context/

Session H (Testing):
  CAN modify: __tests__/ only
  CANNOT touch: any production code files

## Absolute Rules (never violate)

- NEVER use Animated from react-native — use react-native-reanimated only
- NEVER hardcode hex color values inside component files — use theme tokens
- NEVER hardcode spacing numbers in component files — use theme.spacing
- NEVER commit directly to master — always use a feature branch and PR
- NEVER delete existing test files
- NEVER change AppContext.tsx data structure without approval
- Run npx prettier --write . before every commit
- Run npm test and ensure all existing tests pass before creating PR