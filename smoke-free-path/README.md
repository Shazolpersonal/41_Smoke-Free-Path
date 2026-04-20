<div align="center">

# 🌿 Smoke-Free Path

**Your Islamic companion to break free from smoking.**

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![iOS](https://img.shields.io/badge/iOS-000000?style=for-the-badge&logo=ios&logoColor=white)]()
[![Android](https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)]()

_Smoke-Free Path is a comprehensive React Native mobile application designed to guide users through a 41-day structured journey to quit smoking. It uniquely integrates behavioral science tracking with profound Islamic spirituality._

</div>

---

## 📸 2. Feature Preview

|                                    Dashboard                                     |                                  41-Day Tracker                                   |                                   Craving Timer                                    |                                      Islamic Content                                      |
| :------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------: |
| ![Dashboard Placeholder](https://via.placeholder.com/250x500.png?text=Dashboard) | ![Tracker Placeholder](https://via.placeholder.com/250x500.png?text=Step+Tracker) | ![Craving Placeholder](https://via.placeholder.com/250x500.png?text=Craving+Timer) | ![Islamic Content Placeholder](https://via.placeholder.com/250x500.png?text=Islamic+Duas) |
|           _View your daily progress, money saved, and quick actions._            |                     _Step-by-step guidance unlocking daily._                      |                    _Breathing exercises and coping strategies._                    |                    _Daily Duas and reminders for spiritual strength._                     |

_(Note: Add actual screenshots to the repository and update the links above.)_

---

## ✨ 3. Core Features

- **🗓️ 41-Day Structured Journey**: A carefully designed step-by-step guided plan with daily checklists, insights, and actionable goals to build lasting habits.
- **🌙 Islamic Integration**: Deeply rooted in faith, featuring daily Islamic inspirations, authentic Duas for strength, and Niyyah (intentions) reminders to foster Sabr (patience).
- **⏱️ Craving Management Timer**: Interactive breathing guides and immediate coping strategies to help users overcome acute cravings safely.
- **📊 Progress & Health Tracking**: Real-time tracking of smoke-free days, money saved, cigarettes avoided, and a timeline of physiological health improvements.
- **🏆 Milestone System**: Earn celebratory achievements at key points in the journey (1, 3, 7, 14, 21, 30, and 41 days).
- **⚠️ Slip-up & Trigger Logging**: Safely log slip-ups or triggers, view weekly trigger charts, and get personalized coping strategies without losing motivation.
- **📱 Offline First**: Fast, responsive, and private. All data is saved locally on your device.

---

## 🛠️ 4. Tech Stack

This project is built using modern mobile development tools:

- **Framework**: [React Native](https://reactnative.dev/) (0.81.5) & [Expo](https://expo.dev/) (~54.0.33) for robust, cross-platform UI and API access.
- **Language**: [TypeScript](https://www.typescriptlang.org/) (~5.9.2) for strong static typing and reliability.
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (~6.0.23) for seamless file-based routing.
- **State Management**: React Context (`AppContext`) combined with local persistence using `@react-native-async-storage/async-storage` (2.2.0).
- **Animations & UI**: `react-native-reanimated` (~4.1.1) for smooth animations, and `@expo-google-fonts` for native typography.
- **Testing**: `jest-expo` for unit/integration tests and `fast-check` for robust property-based testing.

---

## 📂 5. Project Structure

```text
smoke-free-path/
├── __tests__/         # Unit, integration, and property-based test suites
├── app/               # Expo Router file-based screens (tabs, onboarding, craving, etc.)
├── assets/            # Static assets (images, fonts) and local JSON data
├── components/        # Reusable React UI components (Cards, Typography, Timers)
├── constants/         # Centralized calculation constants and application limits
├── context/           # AppContext and ToastContext for global state
├── hooks/             # Custom React hooks (useProgressStats, useMilestones)
├── services/          # Core business logic, StorageService, and ContentService
├── types/             # TypeScript interfaces and enumerations
└── utils/             # Helper functions (trackerUtils, calculation logic)
```

- **`app/`**: Contains the route structures. E.g., `(tabs)` for main navigation, `(onboarding)` for initial setup.
- **`components/`**: Organized UI blocks. Feature-specific components are kept in subfolders (e.g., `craving/`, `slip-up/`).
- **`services/`**: Abstracts data fetching (`ContentService.ts`) and local device storage (`StorageService.ts`).

---

## 🚀 6. Getting Started

### Prerequisites

- Node.js (>= 18.x)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator for testing. Alternatively, the Expo Go app on a physical device.

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/Shazolpersonal/41_Smoke-Free-Path.git
   cd 41_Smoke-Free-Path/smoke-free-path
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

### Running on Devices/Emulators

- Press **`i`** in the terminal to open in the iOS Simulator.
- Press **`a`** to open in the Android Emulator.
- Press **`w`** to run the web version in a browser.

---

## ⚙️ 7. Environment Setup

Currently, **Smoke-Free Path** does not require a complex `.env` configuration. All application content (Duas, daily tasks, steps) is bundled locally within JSON files in the `assets/data/` directory, and user state is handled directly via `AsyncStorage` on the device. Just install and run!

---

## 🧪 8. Testing

The codebase is heavily tested to ensure reliability, specifically the core progress calculations and state updates.

**To run all tests:**

```bash
npm test
```

**Types of Tests Included:**

- **Unit Tests**: Verify the behavior of context reducers and utility functions.
- **Integration Tests**: Verify interactions across multiple functions.
- **Property-based Tests**: Uses `fast-check` (in `__tests__/property/`) to throw thousands of randomized, valid, and invalid edge cases at the logic engine to ensure it never crashes (e.g., handling extreme dates, negative values, and ensuring `NaN` doesn't propagate).

---

## 🧠 9. How It Works (App Logic)

### The User Journey

1. **Onboarding**: The user inputs their current habit data (cigarettes smoked per day, pack price, years smoked) and sets a firm quit date.
2. **The 41-Day Tracker**: The app enforces a "one step per calendar day" rule. Using `Date.UTC` calculations against `planState.activatedAt`, the app ensures users cannot skip ahead, promoting genuine habit building.
3. **Daily Routine**: Users interact with the daily step to check off tasks, read Islamic content, and review their progress statistics (calculated dynamically).
4. **Craving & Slip-up Workflows**:
   - When a user logs a _Craving_, they identify the trigger and utilize a breathing timer.
   - If a _Slip-up_ occurs, the app calculates whether to reset the current streak while maintaining total cumulative progress, preventing a total loss of motivation.

Data is stored locally using `AsyncStorage`. The app features a resilient hydration system in `AppContext.tsx` that restores state upon launch and gracefully defaults to safety if the storage is missing.

---

## 🤝 10. Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Ensure you follow standard React Native and TypeScript conventions. Use `npx prettier --write .` for formatting.
4. Run tests (`npm test`) and ensure everything passes.
5. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
6. Push to the branch (`git push origin feature/AmazingFeature`).
7. Open a Pull Request.

---

## 📜 11. License & Acknowledgements

**License**
This project is open source. (Refer to the repository's main branch for the specific LICENSE file).

**Acknowledgements**
_Smoke-Free Path_ is deeply inspired by Islamic principles. It was created with the belief that tying behavioral change to spiritual purpose—relying on Sabr (patience) and seeking help through Duas—provides profound strength to overcome addiction. May Allah make it easy for everyone embarking on this journey.
