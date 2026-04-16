# Bugfix Requirements Document

## Introduction

এই ডকুমেন্টটি "ধোঁয়া-মুক্ত পথ" (Smoke-Free Path) অ্যাপের একটি গভীর লজিক ও ক্যালকুলেশন অডিটের ফলাফল। UI স্ক্রিনশট বিশ্লেষণ এবং সম্পূর্ণ কোডবেস পর্যালোচনার মাধ্যমে চারটি প্রধান বাগ এবং বেশ কিছু সহায়ক সমস্যা চিহ্নিত করা হয়েছে।

চিহ্নিত বাগগুলো:
- **BUG-01**: `savedMoney` ক্যালকুলেশনে ভুল — ১৫টি সিগারেট বাঁচালে মাত্র ৳১১ দেখাচ্ছে
- **BUG-02**: মাইলস্টোন কাউন্টডাউন ভুল — ধাপ ৩-এ থাকলে "আর মাত্র ৪ দিন — ৭ম ধাপের মাইলস্টোন" দেখাচ্ছে (সঠিক হওয়া উচিত ৪ দিন, কিন্তু বার্তাটি বিভ্রান্তিকর)
- **BUG-03**: `smokeFreeDays` (পূর্ণ দিন = ৩) বনাম `dailyStreak` (টানা লগ-ইন = ৫) মিসম্যাচ — দুটি ভিন্ন কাউন্টার একই UI-তে কোনো ব্যাখ্যা ছাড়া দেখানো হচ্ছে
- **BUG-04**: প্রগ্রেস পার্সেন্টেজ রাউন্ডিং — `1/41 = 2.44%` কিন্তু `Math.round()` ব্যবহার করে `2%` দেখাচ্ছে (floor নয়)

---

## Bug Analysis

### Current Behavior (Defect)

**BUG-01 — Money Calculation Wrong**

1.1 WHEN ব্যবহারকারী ১৫টি সিগারেট বাঁচান এবং `cigarettePricePerPack` ডিফল্ট ১৫ টাকা ও `cigarettesPerPack` ডিফল্ট ২০ হয় THEN সিস্টেম `savedMoney = (15 / 20) * 15 = ৳11.25` দেখায়, যা বাস্তবে অর্থহীনভাবে কম

1.2 WHEN নতুন ব্যবহারকারী অনবোর্ডিং সম্পন্ন করেন THEN সিস্টেম `cigarettePricePerPack = 15` (টাকা) এবং `cigarettesPerPack = 20` ডিফল্ট হিসেবে সেট করে, কিন্তু বাংলাদেশে একটি সিগারেটের দাম ৳৮–১৫ এবং একটি প্যাকে ১০টি সিগারেট থাকে — ফলে প্রতি সিগারেটের দাম `15/20 = ৳0.75` হয়ে যায় যা সম্পূর্ণ ভুল

1.3 WHEN অনবোর্ডিং স্ক্রিনে ব্যবহারকারীকে সিগারেটের দাম ইনপুট করার সুযোগ দেওয়া হয় না THEN সিস্টেম সবসময় ভুল ডিফল্ট মান ব্যবহার করে `savedMoney` ক্যালকুলেট করে

**BUG-02 — Milestone Countdown Wrong**

1.4 WHEN ব্যবহারকারী ধাপ ৩ সম্পন্ন করেন THEN সিস্টেম মাইলস্টোন বার্তায় "আর মাত্র ৪ দিন — ৭ম ধাপের মাইলস্টোন" দেখায়, কিন্তু ধাপ ৩ থেকে ধাপ ৭ পর্যন্ত পৌঁছাতে ৪টি ধাপ (৪, ৫, ৬, ৭) বাকি — সংখ্যাটি সঠিক হলেও বার্তাটি "দিন" বলছে যেখানে "ধাপ" বলা উচিত

1.5 WHEN `milestones.json`-এ `nextMilestoneMotivation` স্ট্যাটিক টেক্সট হিসেবে হার্ডকোড করা থাকে THEN সিস্টেম ব্যবহারকারীর বর্তমান অবস্থান নির্বিশেষে সবসময় একই স্ট্যাটিক বার্তা দেখায়, যা ব্যবহারকারীর প্রকৃত অবস্থানের সাথে মিলে না

1.6 WHEN `progress.tsx`-এ `nextMilestoneMotivation` দেখানোর শর্ত `nextMilestone.steps - completedCount > 3` হয় THEN সিস্টেম শুধুমাত্র পরবর্তী মাইলস্টোনের ৩ ধাপের মধ্যে থাকলে বার্তা দেখায়, কিন্তু এই লজিকটি `completedCount` ব্যবহার করে যা `currentStep` থেকে ভিন্ন হতে পারে

**BUG-03 — Login Streak vs Smoke-Free Days Mismatch**

1.7 WHEN হোম স্ক্রিনে `পূর্ণ দিন` এবং `টানা লগ-ইন` পাশাপাশি দেখানো হয় THEN সিস্টেম কোনো ব্যাখ্যা ছাড়াই দুটি ভিন্ন সংখ্যা দেখায় (যেমন: পূর্ণ দিন = ৩, টানা লগ-ইন = ৫), যা ব্যবহারকারীকে বিভ্রান্ত করে

1.8 WHEN `smokeFreeDays` গণনা করা হয় THEN সিস্টেম `planState.lastSlipUpAt || activatedAt` থেকে বর্তমান সময় পর্যন্ত `Math.floor()` ব্যবহার করে দিন গণনা করে — এটি ধূমপান-মুক্ত দিন পরিমাপ করে

1.9 WHEN `dailyStreak` গণনা করা হয় THEN সিস্টেম প্রতিদিন অ্যাপ খোলার উপর ভিত্তি করে `UPDATE_LAST_OPENED` অ্যাকশনে স্ট্রিক বাড়ায় — এটি অ্যাপ ব্যবহারের ধারাবাহিকতা পরিমাপ করে, ধূমপান-মুক্ত দিন নয়

1.10 WHEN ব্যবহারকারী ৫ দিন ধরে অ্যাপ খোলেন কিন্তু মাত্র ৩ দিন আগে যাত্রা শুরু করেন THEN সিস্টেম `dailyStreak = 5` এবং `smokeFreeDays = 3` দেখায়, কিন্তু UI-তে এই পার্থক্যের কোনো ব্যাখ্যা নেই

**BUG-04 — Progress Percentage Rounding**

1.11 WHEN ব্যবহারকারী ১টি ধাপ সম্পন্ন করেন THEN সিস্টেম `Math.round((1/41) * 100) = Math.round(2.44) = 2%` দেখায়

1.12 WHEN `progress.tsx`-এ `Math.round()` ব্যবহার করা হয় THEN সিস্টেম `1/41 = 2.44%` কে `2%` হিসেবে দেখায়, কিন্তু `index.tsx`-এ একই ক্যালকুলেশন নেই — রাউন্ডিং পদ্ধতি অ্যাপ জুড়ে অসামঞ্জস্যপূর্ণ

1.13 WHEN `savedMoney` ডিসপ্লে করা হয় THEN `progress.tsx` এবং `index.tsx` উভয়ই `Math.round(stats.savedMoney)` ব্যবহার করে, কিন্তু `computeProgressStats` ইতিমধ্যে `Math.round(savedMoney * 100) / 100` করে রিটার্ন করে — ফলে ডাবল রাউন্ডিং হয়

---

### Expected Behavior (Correct)

**BUG-01 — Money Calculation**

2.1 WHEN ব্যবহারকারী ১৫টি সিগারেট বাঁচান এবং বাংলাদেশের বাস্তব মূল্য ব্যবহার করা হয় THEN সিস্টেম SHALL বাস্তবসম্মত BDT পরিমাণ দেখাবে (যেমন: প্রতি সিগারেট ৳১০ হলে ৳১৫০)

2.2 WHEN নতুন ব্যবহারকারী অনবোর্ডিং সম্পন্ন করেন THEN সিস্টেম SHALL বাংলাদেশের বাস্তবতা অনুযায়ী ডিফল্ট মান ব্যবহার করবে: `cigarettePricePerPack = 150` (টাকা) এবং `cigarettesPerPack = 10` — ফলে প্রতি সিগারেটের দাম `150/10 = ৳15` হবে

2.3 WHEN অনবোর্ডিং স্ক্রিনে ব্যবহারকারী সিগারেটের দাম ইনপুট করেন THEN সিস্টেম SHALL সেই মান ব্যবহার করে `savedMoney` ক্যালকুলেট করবে

**BUG-02 — Milestone Countdown**

2.4 WHEN ব্যবহারকারী ধাপ ৩ সম্পন্ন করেন এবং পরবর্তী মাইলস্টোন ধাপ ৭ THEN সিস্টেম SHALL "আর মাত্র ৪ ধাপ — ৭ম ধাপের মাইলস্টোন আপনার অপেক্ষায়!" দেখাবে ("দিন" নয়, "ধাপ" বলবে)

2.5 WHEN `nextMilestoneMotivation` বার্তা তৈরি হয় THEN সিস্টেম SHALL ব্যবহারকারীর বর্তমান `completedCount` এবং পরবর্তী মাইলস্টোনের `steps` থেকে গতিশীলভাবে বাকি ধাপ গণনা করবে

**BUG-03 — Login Streak vs Smoke-Free Days**

2.6 WHEN হোম স্ক্রিনে `পূর্ণ দিন` এবং `টানা লগ-ইন` দেখানো হয় THEN সিস্টেম SHALL প্রতিটি মেট্রিকের নিচে স্পষ্ট সাবটাইটেল দেখাবে যা পার্থক্য বোঝায় (যেমন: "ধূমপান-মুক্ত" এবং "অ্যাপ ব্যবহার")

2.7 WHEN `smokeFreeDays` এবং `dailyStreak` উভয়ই দেখানো হয় THEN সিস্টেম SHALL দুটি মেট্রিকের উদ্দেশ্য আলাদাভাবে লেবেল করবে যাতে ব্যবহারকারী বিভ্রান্ত না হন

**BUG-04 — Progress Percentage Rounding**

2.8 WHEN প্রগ্রেস পার্সেন্টেজ ক্যালকুলেট করা হয় THEN সিস্টেম SHALL `Math.floor()` ব্যবহার করবে যাতে ব্যবহারকারী কখনো অর্জিত হয়নি এমন প্রগ্রেস না দেখেন (conservative display)

2.9 WHEN `savedMoney` ডিসপ্লে করা হয় THEN সিস্টেম SHALL একবারই রাউন্ড করবে — হয় `computeProgressStats`-এ অথবা UI-তে, উভয় জায়গায় নয়

2.10 WHEN প্রগ্রেস পার্সেন্টেজ অ্যাপের যেকোনো স্ক্রিনে দেখানো হয় THEN সিস্টেম SHALL একই রাউন্ডিং পদ্ধতি ব্যবহার করবে

---

### Unchanged Behavior (Regression Prevention)

3.1 WHEN ব্যবহারকারী ধনাত্মক `cigarettesPerDay` এবং বৈধ `cigarettePricePerPack` দিয়ে অনবোর্ডিং সম্পন্ন করেন THEN সিস্টেম SHALL CONTINUE TO `savedCigarettes = smokeFreeDays * cigarettesPerDay` সঠিকভাবে ক্যালকুলেট করবে

3.2 WHEN `cigarettesPerPack = 0` বা নেগেটিভ হয় THEN সিস্টেম SHALL CONTINUE TO `Math.max(1, profile.cigarettesPerPack)` দিয়ে ডিভিশন-বাই-জিরো প্রতিরোধ করবে

3.3 WHEN ব্যবহারকারী একটি ধাপ সম্পন্ন করেন THEN সিস্টেম SHALL CONTINUE TO `completedSteps` অ্যারেতে সেই ধাপ যোগ করবে এবং `currentStep` আপডেট করবে

3.4 WHEN ব্যবহারকারী একই দিনে দুইবার অ্যাপ খোলেন THEN সিস্টেম SHALL CONTINUE TO `dailyStreak` একবারই বাড়াবে (idempotent — `last === today` চেক)

3.5 WHEN ব্যবহারকারী একদিন অ্যাপ না খোলেন THEN সিস্টেম SHALL CONTINUE TO `dailyStreak` রিসেট করে `1` করবে

3.6 WHEN `planState.lastSlipUpAt` সেট থাকে THEN সিস্টেম SHALL CONTINUE TO স্লিপ-আপের তারিখ থেকে `smokeFreeDays` গণনা করবে (activatedAt থেকে নয়)

3.7 WHEN মাইলস্টোন অর্জিত হয় THEN সিস্টেম SHALL CONTINUE TO `ACHIEVE_MILESTONE` অ্যাকশন ডিসপ্যাচ করবে এবং `milestones` রেকর্ডে সংরক্ষণ করবে

3.8 WHEN ধাপ ১–৪১ এর বাইরের কোনো ধাপ `COMPLETE_STEP` অ্যাকশনে পাঠানো হয় THEN সিস্টেম SHALL CONTINUE TO সেই অ্যাকশন উপেক্ষা করবে (boundary guard)

3.9 WHEN ব্যবহারকারী ইতিমধ্যে সম্পন্ন ধাপ আবার সম্পন্ন করার চেষ্টা করেন THEN সিস্টেম SHALL CONTINUE TO idempotent আচরণ করবে (duplicate entry প্রতিরোধ)

3.10 WHEN `progress.tsx`-এ প্রগ্রেস বার দেখানো হয় THEN সিস্টেম SHALL CONTINUE TO `completedCount / TOTAL_STEPS` ভিত্তিক অ্যানিমেটেড প্রগ্রেস বার দেখাবে

---

## Bug Condition Pseudocode

### BUG-01: Money Calculation

```pascal
FUNCTION isBugCondition_BUG01(profile)
  INPUT: profile of type UserProfile
  OUTPUT: boolean
  
  // Bug triggers when default price values are unrealistic for Bangladesh
  RETURN profile.cigarettePricePerPack = 15 AND profile.cigarettesPerPack = 20
  // Results in pricePerCigarette = 0.75 BDT — impossibly low
END FUNCTION

// Property: Fix Checking
FOR ALL profile WHERE isBugCondition_BUG01(profile) DO
  result ← computeProgressStats'(profile, planState)
  ASSERT result.savedMoney >= (smokeFreeDays * cigsPerDay * 8)
  // Minimum realistic price per cigarette in Bangladesh is ৳8
END FOR

// Property: Preservation Checking
FOR ALL profile WHERE NOT isBugCondition_BUG01(profile) DO
  ASSERT computeProgressStats(profile, planState) = computeProgressStats'(profile, planState)
END FOR
```

### BUG-02: Milestone Countdown

```pascal
FUNCTION isBugCondition_BUG02(milestoneEntry, completedCount)
  INPUT: milestoneEntry of type MilestoneEntry, completedCount of type number
  OUTPUT: boolean
  
  // Bug triggers when static text says "দিন" but should say "ধাপ"
  stepsRemaining ← milestoneEntry.steps - completedCount
  RETURN milestoneEntry.content.nextMilestoneMotivation CONTAINS "দিন"
         AND stepsRemaining > 0
END FUNCTION

// Property: Fix Checking
FOR ALL (milestoneEntry, completedCount) WHERE isBugCondition_BUG02(...) DO
  message ← generateNextMilestoneMessage'(milestoneEntry, completedCount)
  stepsRemaining ← milestoneEntry.steps - completedCount
  ASSERT message CONTAINS toString(stepsRemaining)
  ASSERT message CONTAINS "ধাপ"
  ASSERT NOT (message CONTAINS "দিন" AND stepsRemaining != daysBetween)
END FOR
```

### BUG-03: Streak vs Days Mismatch

```pascal
FUNCTION isBugCondition_BUG03(smokeFreeDays, dailyStreak)
  INPUT: smokeFreeDays of type number, dailyStreak of type number
  OUTPUT: boolean
  
  // Bug triggers when both metrics are shown without explanation
  RETURN smokeFreeDays != dailyStreak
END FUNCTION

// Property: Fix Checking
FOR ALL state WHERE isBugCondition_BUG03(state.smokeFreeDays, state.dailyStreak) DO
  ui ← renderHomeScreen'(state)
  ASSERT ui.smokeFreeLabel = "ধূমপান-মুক্ত দিন"
  ASSERT ui.streakLabel = "টানা অ্যাপ ব্যবহার"
  // Labels must clearly distinguish the two metrics
END FOR
```

### BUG-04: Progress Percentage Rounding

```pascal
FUNCTION isBugCondition_BUG04(completedCount, totalSteps)
  INPUT: completedCount of type number, totalSteps of type number
  OUTPUT: boolean
  
  // Bug triggers when Math.round causes upward rounding
  rawPercent ← (completedCount / totalSteps) * 100
  RETURN Math.round(rawPercent) > Math.floor(rawPercent)
END FUNCTION

// Property: Fix Checking
FOR ALL (completedCount, totalSteps) WHERE isBugCondition_BUG04(...) DO
  displayedPercent ← calculateProgressPercent'(completedCount, totalSteps)
  ASSERT displayedPercent = Math.floor((completedCount / totalSteps) * 100)
  ASSERT displayedPercent <= (completedCount / totalSteps) * 100
END FOR

// Property: Preservation Checking
FOR ALL (completedCount, totalSteps) WHERE NOT isBugCondition_BUG04(...) DO
  ASSERT calculateProgressPercent(completedCount, totalSteps) 
       = calculateProgressPercent'(completedCount, totalSteps)
END FOR
```
