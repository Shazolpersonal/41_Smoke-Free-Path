# Bugfix Requirements Document

## Introduction

এই ডকুমেন্টে "ধোঁয়া-মুক্ত পথ" (Smoke-Free Path) React Native অ্যাপের বাকি থাকা বাগগুলোর বিশ্লেষণ ও সমাধানের প্রয়োজনীয়তা উল্লেখ করা হয়েছে। এটি একটি ধূমপান ত্যাগের সহায়ক অ্যাপ যা বাংলা ভাষায় UI প্রদান করে।

**নোট:** কিছু বাগ ইতিমধ্যে পূর্ববর্তী আপডেটে ফিক্স হয়েছে:
- BUG-01 (NavigationGuard) ✅
- BUG-15 (IslamicCard bookmark animation) ✅
- সমস্যা ৫ (parseInt upper bound) ✅
- সমস্যা ৬ (future date upper bound) ✅
- সমস্যা ১২ (CravingTimer drift) ✅

---

## Bug Analysis

### Current Behavior (Defect)

#### BUG-02: Library Tab Unreachable

1.1 WHEN ব্যবহারকারী ট্যাব বারে "ইসলামিক লাইব্রেরি" খুঁজে THEN সেটি খুঁজে পায় না কারণ `href: null` সেট করা আছে

1.2 WHEN ব্যবহারকারী অন্য কোনো পেজ থেকে লাইব্রেরিতে যেতে চায় THEN কোনো নেভিগেশন লিংক পায় না

#### BUG-08: Misleading Variable Name

1.3 WHEN `totalSmokeFreeDays` ভেরিয়েবল ব্যবহার হয় THEN এটি আসলে "মোট দিন" গণনা করে, স্লিপ-আপের দিনগুলো বাদ দেয় না

1.4 WHEN ব্যবহারকারী হোম পেজে "ধূমপানমুক্ত জীবনের পথে" লেবেল দেখে THEN সেখানে মোট দিন দেখায় কিন্তু স্লিপ-আপ থাকলেও একই সংখ্যা দেখায়

#### BUG-09: Future Quit Date Shows Zero

1.5 WHEN ব্যবহারকারী ভবিষ্যতের তারিখে কুইট ডেট সেট করে THEN `smokeFreeDays` শূন্য দেখায় কিন্তু নেগেটিভ দেখানো উচিত (বা "এখনো শুরু হয়নি" বার্তা)

1.6 WHEN প্ল্যান এখনো শুরু হয়নি THEN UI-তে সব স্ট্যাটিস্টিক্স শূন্য দেখায় এবং ব্যবহারকারী বুঝতে পারে না কেন

#### BUG-10: Idempotency After Reset

1.7 WHEN ব্যবহারকারী `RESET_PLAN` করে THEN `planState.activatedAt` null হয়ে যায়

1.8 WHEN `activatedAt` null হয় THEN tracker পেজ `profile-setup`-এ রিডাইরেক্ট করে, পুরো অনবোর্ডিং আবার করতে হয়

#### BUG-11: Price Auto-Correction Loop

1.9 WHEN ব্যবহারকারী সত্যিই ১৫ টাকার প্যাক (বিড়ি) ব্যবহার করে THEN অ্যাপ জোর করে ৩০০ টাকা সেট করে দেয়

1.10 WHEN migration-এ ৫০ টাকার নিচে মূল্য থাকে THEN এটি automatic ভাবে `price * packSize` করে ফেলে (যেমন ৪০ × ২০ = ৮০০)

#### BUG-13: Negative Hours Display

1.11 WHEN ভবিষ্যতের কুইট ডেট সেট করা থাকে THEN `hoursSinceActivation` নেগেটিভ হতে পারে

1.12 WHEN `% 24` অপারেটর নেগেটিভ সংখ্যায় প্রয়োগ হয় THEN নেগেটিভ রেজাল্ট আসে (যেমন `-49 % 24 = -1`)

#### BUG-16: Library Footer Logic

1.13 WHEN `selectedContent` সেট হয় (Modal ওপেন) THEN FlatList-এর footer-এ "সম্পর্কিত কন্টেন্ট" দেখায়

1.14 WHEN Modal ওপেন থাকে THEN footer মূল লিস্টে দেখায় কিন্তু Modal-এর ভেতরে নয়, তাই ব্যবহারকারী এটি দেখতে পায় না

#### সমস্যা ১: Dual Milestone Detection

1.15 WHEN ব্যবহারকারী একটি ধাপ সম্পূর্ণ করে THEN মাইলস্টোন ডিটেকশন দুই জায়গায় হয় (`tracker/[step].tsx` এবং `MilestoneDetector`)

1.16 WHEN উভয় জায়গায় মাইলস্টোন ডিটেক্ট হয় THEN race condition-এ দুবার milestone screen navigate হতে পারে

---

### Expected Behavior (Correct)

#### BUG-02: Library Tab Accessible

2.1 WHEN ব্যবহারকারী ট্যাব বার দেখে THEN সেখানে "লাইব্রেরি" ট্যাব দেখতে পাবে

2.2 WHEN ব্যবহারকারী লাইব্রেরি ট্যাবে ট্যাপ করে THEN সে ইসলামিক লাইব্রেরি পেজে যেতে পারবে

#### BUG-08: Clear Variable Semantics

2.3 WHEN `totalSmokeFreeDays` প্রদর্শিত হয় THEN এটি স্পষ্টভাবে "প্ল্যান শুরু থেকে মোট দিন" বোঝাবে

2.4 WHEN `smokeFreeDays` প্রদর্শিত হয় THEN এটি শুধুমাত্র ধূমপানমুক্ত দিন গণনা করবে (স্লিপ-আপের পর থেকে বা শুরু থেকে)

#### BUG-09: Future Date Handling

2.5 WHEN কুইট ডেট ভবিষ্যতে থাকে THEN সিস্টেম "এখনো শুরু হয়নি" বার্তা দেখাবে

2.6 WHEN কুইট ডেট ভবিষ্যতে থাকে THEN countdown টাইমার দেখাবে কত দিন/ঘণ্টা বাকি

#### BUG-10: Proper Reset Flow

2.7 WHEN `RESET_PLAN` হয় THEN `activatedAt` সংরক্ষিত থাকবে বা নতুন তারিখ সেট করার অপশন থাকবে

2.8 WHEN প্ল্যান রিসেট হয় THEN ব্যবহারকারী সরাসরি quit-date পেজে যেতে পারবে, পুরো অনবোর্ডিং নয়

#### BUG-11: No Auto-Correction

2.9 WHEN ব্যবহারকারী যেকোনো বৈধ মূল্য ইনপুট দেয় THEN সিস্টেম সেটি গ্রহণ করবে, কোনো অটো-কারেকশন ছাড়া

2.10 WHEN migration হয় THEN মূল্য অপরিবর্তিত থাকবে যদি না স্পষ্টভাবে ভুল ফরম্যাট হয়

#### BUG-13: Positive Hours Display

2.11 WHEN ভবিষ্যতের কুইট ডেট থাকে THEN `hoursSinceActivation` শূন্য বা পজিটিভ দেখাবে

2.12 WHEN countdown প্রদর্শিত হয় THEN "X দিন বাকি" ফরম্যাটে দেখাবে

#### BUG-16: Footer Inside Modal

2.13 WHEN `selectedContent` সেট হয় THEN সম্পর্কিত কন্টেন্ট Modal-এর ভেতরে দেখাবে

2.14 WHEN Modal বন্ধ থাকে THEN footer-এ সম্পর্কিত কন্টেন্ট দেখাবে না

#### সমস্যা ১: Single Milestone Detection

2.15 WHEN ব্যবহারকারী ধাপ সম্পূর্ণ করে THEN মাইলস্টোন ডিটেকশন শুধু `MilestoneDetector`-এ হবে

2.16 WHEN মাইলস্টোন ডিটেক্ট হয় THEN শুধু একবার navigation হবে

---

### Unchanged Behavior (Regression Prevention)

3.1 WHEN ব্যবহারকারী অনবোর্ডিং সম্পন্ন করে THEN সিস্টেম আগের মতোই কাজ করবে

3.2 WHEN ব্যবহারকারী ট্র্যাকার ব্যবহার করে THEN ১-ধাপ-প্রতি-দিন rule অপরিবর্তিত থাকবে

3.3 WHEN ব্যবহারকারী স্লিপ-আপ রিপোর্ট করে THEN streak reset হবে কিন্তু মোট সাশ্রয় থেকে শুধু ওই সিগারেট বাদ যাবে

3.4 WHEN ব্যবহারকারী প্রোফাইল সেট করে THEN validation rules (upper bounds) অপরিবর্তিত থাকবে

3.5 WHEN ব্যবহারকারী ডার্ক মোড ব্যবহার করে THEN UI সঠিকভাবে কাজ করবে

3.6 WHEN মাইলস্টোন অর্জিত হয় THEN notification এবং UI আগের মতোই কাজ করবে

3.7 WHEN ব্যবহারকারী কুইট ডেট বর্তমান বা অতীতে সেট করে THEN স্ট্যাটিস্টিক্স সঠিকভাবে গণনা হবে

3.8 WHEN ব্যবহারকারী বুকমার্ক টগল করে THEN animation শুধু actual toggle-এ চলবে, মাউন্টে নয়

3.9 WHEN টাইমার pause/resume হয় THEN drift হবে না (absolute time-based calculation)

3.10 WHEN NavigationGuard চলে THEN সব বৈধ রুট (craving, tracker/[step], slip-up, etc.) অ্যাক্সেসযোগ্য থাকবে
