# 🚬 Smoke-Free Path: UI/UX ডিজাইন ও আর্কিটেকচার অডিট রিপোর্ট

**Target Audience**: বাংলাদেশি সাধারণ ব্যবহারকারী যারা ধূমপান ছাড়তে ইচ্ছুক।
**Platform**: React Native (Expo) - Mobile App

---

## ধাপ ১ — প্রোজেক্ট স্ক্যান রিপোর্ট

প্রোজেক্টের সম্পূর্ণ সোর্স কোড স্ক্যান করে নিচের তথ্যগুলো পাওয়া গেছে:

- **Framework / Library:** React Native (0.81.5), Expo (SDK ~54.0), Expo Router (ফাইল-ভিত্তিক রাউটিং)।
- **CSS পদ্ধতি:** `StyleSheet.create` ব্যবহার করে Plain React Native styling এবং Context API-ভিত্তিক কাস্টম থিম (`theme.tsx`)।
- **Component স্ট্রাকচার:** `app/` ফোল্ডারে স্ক্রিনগুলো (`(tabs)`, `(onboarding)`, `craving` ইত্যাদি) এবং `components/` ফোল্ডারে শেয়ার্ড কম্পোনেন্ট (যেমন: `Card.tsx`, `Typography.tsx`, `Toast.tsx`) রয়েছে।
- **Colors & Typography:** `theme.tsx`-এ Light ও Dark থিম (semantic tokens) এবং `HindSiliguri` (বাংলা) ও `Amiri` (আরবি) ফন্ট স্কেলিং সংজ্ঞায়িত করা আছে।

---

## ধাপ ২ — ডিজাইন অডিট রিপোর্ট

### 🎨 Visual Design

- **সমস্যার স্থান:** `app/craving/index.tsx` (লাইন ৩৬৮), `app/(tabs)/dua.tsx` (লাইন ২৮১)
- **বর্তমান অবস্থা:** `backgroundColor: 'rgba(0,0,0,0.55)'` এবং `rgba(128,128,128,0.2)` এর মতো হার্ডকোড করা রং ব্যবহার করা হয়েছে।
- **কেন এটি C-grade:** থিম টোকেন ব্যবহার না করায় ডার্ক/লাইট মোডে রঙের অসামঞ্জস্যতা (inconsistency) দেখা যায়। এটি অ্যাপটিকে সস্তা এবং অপেশাদার দেখায়।
- **A-grade সমাধান:** হার্ডকোড করা রঙের বদলে `theme.colors.overlay` বা ডাইনামিক Glassmorphism ইফেক্ট (`expo-blur`) ব্যবহার করতে হবে।

### 🔤 Typography

- **সমস্যার স্থান:** `app/(onboarding)/welcome.tsx`, `app/(onboarding)/quit-date.tsx`, `app/tracker/[step].tsx`
- **বর্তমান অবস্থা:** `<Typography>` কম্পোনেন্ট থাকা সত্ত্বেও প্রায় ৪০টির বেশি জায়গায় 인লাইন `fontSize: 32`, `fontSize: 16`, `fontWeight: '700'` ব্যবহার করা হয়েছে।
- **কেন এটি C-grade:** ফন্ট স্কেলিং ভেঙে যায়, যার ফলে বিভিন্ন ডিভাইসে লেখা ছোট/বড় দেখায় এবং ডিজাইনের ভারসাম্য নষ্ট হয়।
- **A-grade সমাধান:** 인লাইন ফন্ট স্টাইলিং পুরোপুরি বাদ দিয়ে শুধুমাত্র থিম-নির্ভর `variant` (যেমন: `heading`, `title`, `body`) ব্যবহার করতে হবে।

### 📐 Layout & Spacing

- **সমস্যার স্থান:** `app/trigger-log/index.tsx`, `app/tracker/[step].tsx` এবং প্রায় সবগুলো স্ক্রিন।
- **বর্তমান অবস্থা:** `padding: 16`, `paddingBottom: 40`, `marginRight: 12` এর মতো ফিক্সড পিক্সেল ভ্যালু ব্যবহার করা হয়েছে। `theme.spacing` টোকেনগুলো (sm, md, lg) বেশিরভাগ জায়গায় উপেক্ষিত।
- **কেন এটি C-grade:** ফিক্সড পিক্সেলের কারণে ছোট পর্দার ফোনে লেআউট আঁটসাঁট (cramped) এবং বড় পর্দায় ফাঁকা লাগে।
- **A-grade সমাধান:** সব স্টাইলে `theme.spacing.md`, `theme.spacing.lg` ইত্যাদি টোকেন বাধ্যতামূলক করতে হবে।

### 🖱️ UX & Interactions

- **সমস্যার স্থান:** `app/craving/index.tsx` (Intensity Buttons & Strategy Tabs)
- **বর্তমান অবস্থা:** বাটনগুলোতে ট্যাপ করলে রঙ সাথে সাথে পরিবর্তন হয়ে যায় (instant state change), কোনো ট্রানজিশন নেই।
- **কেন এটি C-grade:** এটি অ্যাপকে প্রাণহীন (lifeless) এবং যান্ত্রিক মনে করায়। আধুনিক অ্যাপ্লিকেশনে ইউজার ইন্টারঅ্যাকশন অনেক মসৃণ (smooth) হয়।
- **A-grade সমাধান:** `react-native-reanimated` বা `LayoutAnimation` ব্যবহার করে ট্যাবের রঙ ও ব্যাকগ্রাউন্ড ট্রানজিশন (micro-animation) যোগ করতে হবে।

### 📱 Responsiveness

- **সমস্যার স্থান:** `app/craving/index.tsx` (লাইন ৩১৭ ও ৩৭৭)
- **বর্তমান অবস্থা:** মোডালের কার্ডের ম্যাক্সিমাম প্রস্থ ফিক্সড (`maxWidth: 360`) এবং তীব্রতা মাপার বাটনগুলোর আকার ফিক্সড (`width: 40`, `height: 40`)।
- **কেন এটি C-grade:** ডিভাইস অনুযায়ী আনুপাতিক সাইজিং না থাকায় ট্যাবলেট বা ওয়েব ভিউতে এগুলো হাস্যকরভাবে ছোট বা বিকৃত মনে হতে পারে।
- **A-grade সমাধান:** ফ্লেক্সবক্স লেআউট (`flex: 1`) বা `%` ব্যবহার করে রেস্পন্সিভ কার্ড এবং উইন্ডোর মাপ অনুযায়ী ডায়নামিক বাটন সাইজ করতে হবে।

---

## ধাপ ৩ — অগ্রাধিকার তালিকা (Priority Map)

| অগ্রাধিকার         | ক্যাটাগরি        | সমস্যা                                                                   | Impact vs Effort                                                           |
| :----------------- | :--------------- | :----------------------------------------------------------------------- | :------------------------------------------------------------------------- |
| 🔴 **Critical**    | Typography       | ইনলাইন `fontSize` এবং `fontWeight` মুছে ফেলা।                            | **High Impact, Low Effort**. (ডিজাইন কনসিস্টেন্সি দ্রুত বাড়বে)।            |
| 🔴 **Critical**    | Layout & Spacing | ফিক্সড পিক্সেলের বদলে `theme.spacing` এর ব্যবহার।                        | **High Impact, Low Effort**. (রেস্পন্সিভনেস এবং এলাইনমেন্ট ঠিক করবে)।      |
| 🟡 **Important**   | Visual Design    | সমস্ত `rgba` হার্ডকোডিং সরিয়ে থিম কালার বা Glassmorphism যোগ করা।        | **Medium Impact, Low Effort**. (ডার্ক মোডের সাপোর্ট ত্রুটিমুক্ত হবে)।      |
| 🟡 **Important**   | Responsiveness   | `maxWidth: 360` এবং ফিক্সড সাইজ বাটনগুলো ফ্লুইড (fluid) লেআউটে রূপান্তর। | **Medium Impact, Medium Effort**. (মাল্টি-ডিভাইস সাপোর্ট নিশ্চিত করবে)।    |
| 🟢 **Enhancement** | Micro-animations | বাটন ও ট্যাবে Reanimated ট্রানজিশন যোগ করা।                              | **High Impact, High Effort**. (অ্যাপটিকে "Premium" ও "Wow" ফ্যাক্টর দেবে)। |

---

## ধাপ ৪ — A-Grade রোডম্যাপ (ধাপে ধাপে বাস্তবায়ন পরিকল্পনা)

এই ডিজাইন সমস্যাগুলো ফিক্স করে অ্যাপটিকে A-Grade করার জন্য নিচের রোডম্যাপ অনুসরণ করা উচিত:

**Phase 1: Design System Strictness (Foundation)**

1. **Typography Refactoring:** `welcome.tsx`, `quit-date.tsx`, এবং `tracker/[step].tsx` ফাইলগুলোতে গিয়ে স্টাইল থেকে `fontSize`, `fontWeight`, `lineHeight` মুছে দিন এবং `Typography` কম্পোনেন্টের সঠিক `variant` (`heading`, `body`, `small`) পাস করুন।
2. **Spacing Overhaul:** প্রজেক্টে একটি গ্লোবাল ফাইন্ড-রিপ্লেস বা ম্যানুয়াল অডিটের মাধ্যমে `padding: 16` বা `marginBottom: 12` গুলোকে `theme.spacing.md`, `theme.spacing.sm` দিয়ে প্রতিস্থাপন করুন।

**Phase 2: Color & Modern Aesthetic (Visual Polish)**

1. **Hardcoded Colors Elimination:** `craving/index.tsx` এবং `dua.tsx` থেকে `rgba` সরিয়ে `theme.colors.overlay` বা `theme.colors.surfaceVariant` ব্যবহার করুন।
2. **Glassmorphism:** ওভারলে বা মোডালগুলোর ব্যাকগ্রাউন্ডে `expo-blur` এর `<BlurView>` ব্যবহার করুন, যা অ্যাপটিকে খুব প্রিমিয়াম একটা ডাইনামিক লুক দেবে।

**Phase 3: Interactive Delight (Animations)**

1. **Craving Modal Smoothness:** `intensityBtn` এবং `STRATEGY_TABS` ক্লিক করার সময় যেন কালার এবং ব্যাকগ্রাউন্ড হঠাৎ পরিবর্তন না হয়, সেজন্য `react-native-reanimated` ব্যবহার করে স্মুথ কালার ফেডিং (Color transition) তৈরি করুন।
2. **Haptics Refinement:** বর্তমানে যেখানে হ্যাপটিক আছে, সেগুলোকে নির্দিষ্ট অ্যাকশনের উপর ভিত্তি করে স্কেল ইমপ্যাক্ট দিন (যেমন সাধারণ ক্লিকে `Light`, মাইলস্টোনে `Success`)।

---

**আপনার জন্য প্রশ্ন:**
এই রোডম্যাপের উপর ভিত্তি করে আমরা কি **Phase 1 (Design System Strictness)** দিয়ে রিফ্যাক্টরিং এর কাজ শুরু করবো?
