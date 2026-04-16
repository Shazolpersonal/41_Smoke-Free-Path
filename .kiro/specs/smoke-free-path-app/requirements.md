# Requirements Document

## Introduction

"Smoke-Free Path" (ধোঁয়া-মুক্ত পথ) হলো একটি Expo React Native মোবাইল অ্যাপ্লিকেশন যা ইসলামিক দৃষ্টিকোণ থেকে ধূমপান ত্যাগে সহায়তা করে। অ্যাপটি "Smoke-Free Path" ওয়ার্কবুকের উপর ভিত্তি করে তৈরি এবং কুরআন, হাদিস, দোয়া, জিকির ও ইসলামিক জীবনদর্শনকে CBT, NRT এবং মাইন্ডফুলনেস কৌশলের সাথে একত্রিত করে।

অ্যাপটি বাংলা ভাষায় পরিচালিত হবে এবং আরবি (কুরআন/হাদিস) টেক্সট সমর্থন করবে। মূল ফিচারগুলোর মধ্যে রয়েছে **৪১-ধাপের ট্র্যাকার** (step-based, calendar-based নয়), দৈনিক ইসলামিক অনুপ্রেরণা, ক্র্যাভিং ম্যানেজমেন্ট, প্রগ্রেস ট্র্যাকিং, দোয়া ও জিকির সেকশন, ট্রিগার লগ এবং মাইলস্টোন উদযাপন।

**মূল পরিবর্তন**: অ্যাপটি calendar-based (তারিখ-নির্ভর) মডেল থেকে step-based (ধাপ-নির্ভর) মডেলে রূপান্তরিত হয়েছে। ব্যবহারকারী নিজের গতিতে প্রতিটি ধাপ সম্পন্ন করবেন — কোনো ধাপ skip হবে না।

---

## Glossary

- **App**: Smoke-Free Path মোবাইল অ্যাপ্লিকেশন
- **User**: অ্যাপ ব্যবহারকারী ধূমপান ত্যাগে আগ্রহী ব্যক্তি
- **Tracker**: ৪১-ধাপের ধূমপানমুক্ত যাত্রা ট্র্যাকিং মডিউল
- **StepPlan**: প্রতিটি ধাপের কর্ম পরিকল্পনা ও চেকলিস্ট (পূর্বে DailyPlan)
- **StepProgress**: একটি ধাপের অগ্রগতি ডেটা (পূর্বে DailyPlanProgress)
- **PlanState**: প্ল্যানের সামগ্রিক অবস্থা — inactive/active/completed
- **IslamicContent**: কুরআনের আয়াত, হাদিস, দোয়া ও জিকির সম্বলিত কন্টেন্ট
- **CravingTool**: ক্র্যাভিং (ধূমপানের তীব্র আকাঙ্ক্ষা) মোকাবেলার ইন্টারেক্টিভ টুল
- **TriggerLog**: ধূমপানের প্ররোচনা সৃষ্টিকারী পরিস্থিতি লগ করার মডিউল
- **ProgressDashboard**: ব্যবহারকারীর সামগ্রিক অগ্রগতি প্রদর্শনের ড্যাশবোর্ড
- **Milestone**: নির্দিষ্ট ধাপ সংখ্যা অর্জনের উপলক্ষ (যেমন ৭ম ধাপ, ৪১তম ধাপ)
- **SlipUp**: ধূমপান ত্যাগের প্রচেষ্টায় ক্ষণিকের পুনরায় ধূমপান
- **LocalStorage**: ডিভাইসে স্থানীয়ভাবে সংরক্ষিত ব্যবহারকারীর ডেটা
- **Notification**: অ্যাপ থেকে পাঠানো পুশ নোটিফিকেশন
- **planActivatedAt**: প্ল্যান সক্রিয় করার ISO datetime (পূর্বে quitDate)
- **currentStep**: ব্যবহারকারীর বর্তমান ধাপ নম্বর (১–৪১), user-driven
- **StepStatus**: একটি ধাপের অবস্থা — complete / incomplete / future (পূর্বে DayStatus)

---

## Requirements

### Requirement 1: অ্যাপ অনবোর্ডিং ও প্রোফাইল সেটআপ

**User Story:** একজন ধূমপায়ী হিসেবে, আমি অ্যাপে প্রথমবার প্রবেশ করে আমার ধূমপানের অভ্যাস ও লক্ষ্য নির্ধারণ করতে চাই, যাতে অ্যাপটি আমার জন্য ব্যক্তিগতকৃত পরিকল্পনা তৈরি করতে পারে।

#### Acceptance Criteria

1. WHEN একজন User প্রথমবার App চালু করেন, THE App SHALL একটি স্বাগত স্ক্রিন প্রদর্শন করবে যেখানে অ্যাপের উদ্দেশ্য ও ইসলামিক দৃষ্টিভঙ্গি সংক্ষেপে উপস্থাপন করা হবে।
2. WHEN অনবোর্ডিং শুরু হয়, THE App SHALL User-এর নাম, দৈনিক গড় সিগারেটের সংখ্যা এবং ধূমপানের বছর ইনপুট নেবে।
3. THE App SHALL অনবোর্ডিং সম্পন্ন হওয়ার পর User-কে হোম স্ক্রিনে নিয়ে যাবে যেখানে প্ল্যান activation-এর বিকল্প থাকবে।
4. THE App SHALL User-এর ইনপুট করা ডেটা LocalStorage-এ সংরক্ষণ করবে।
5. IF User অনবোর্ডিং অসম্পূর্ণ রেখে অ্যাপ বন্ধ করেন, THEN THE App SHALL পরবর্তী চালুতে অনবোর্ডিং থেকে পুনরায় শুরু করবে।

---

### Requirement 2: প্ল্যান অ্যাক্টিভেশন

**User Story:** একজন User হিসেবে, আমি যেকোনো সময় আমার ৪১-ধাপের যাত্রা শুরু করতে চাই, যাতে আমি নিজের প্রস্তুতি অনুযায়ী শুরু করতে পারি।

#### Acceptance Criteria

1. WHEN User অনবোর্ডিং সম্পন্ন করেন এবং প্ল্যান inactive থাকে, THE App SHALL হোম স্ক্রিনে একটি বিশিষ্ট "যাত্রা শুরু করুন" বাটন প্রদর্শন করবে।
2. WHEN User "যাত্রা শুরু করুন" বাটনে ট্যাপ করেন, THE App SHALL PlanState-এ `isActive: true`, `activatedAt: <current ISO datetime>` এবং `currentStep: 1` সেট করবে।
3. WHEN প্ল্যান activate হয়, THE App SHALL planActivatedAt LocalStorage-এ সংরক্ষণ করবে।
4. WHILE প্ল্যান active থাকে, THE App SHALL হোম স্ক্রিনে বর্তমান ধাপের সারসংক্ষেপ প্রদর্শন করবে।
5. THE App SHALL প্ল্যান activation-এর পর ধূমপান-মুক্ত দিনের সংখ্যা planActivatedAt থেকে calendar-based হিসাবে প্রদর্শন করবে।

---

### Requirement 3: ৪১-ধাপের স্টেপ ট্র্যাকার

**User Story:** একজন User হিসেবে, আমি প্রতিটি ধাপের কর্ম পরিকল্পনা দেখতে ও সম্পন্ন করতে চাই, যাতে আমি নিজের গতিতে ধাপে ধাপে ধূমপান ত্যাগের যাত্রায় এগিয়ে যেতে পারি।

#### Acceptance Criteria

1. THE Tracker SHALL ৪১টি ধাপের জন্য পৃথক StepPlan প্রদর্শন করবে, যেখানে প্রতিটি ধাপের নির্দিষ্ট কাজ, নিশ্চিতকরণ (affirmations) ও চেকলিস্ট থাকবে।
2. WHEN User একটি StepPlan-এর চেকলিস্ট আইটেম ট্যাপ করেন, THE Tracker SHALL সেটি toggle করবে — checked হলে unchecked এবং unchecked হলে checked — এবং LocalStorage-এ সংরক্ষণ করবে।
3. WHEN User বর্তমান ধাপের সব চেকলিস্ট আইটেম সম্পন্ন করেন, THE App SHALL "ধাপ সম্পূর্ণ করুন" বাটন সক্রিয় করবে।
4. WHEN User "ধাপ সম্পূর্ণ করুন" বাটনে ট্যাপ করেন, THE Tracker SHALL বর্তমান ধাপকে complete চিহ্নিত করবে, পরবর্তী ধাপ unlock করবে এবং currentStep বৃদ্ধি করবে।
5. THE Tracker SHALL শুধুমাত্র বর্তমান ধাপ এবং পূর্ববর্তী ধাপগুলো অ্যাক্সেসযোগ্য রাখবে; পরবর্তী ধাপগুলো locked থাকবে যতক্ষণ না আগের ধাপ সম্পূর্ণ হয়।
6. IF User প্ল্যান activate না করে Tracker অ্যাক্সেস করার চেষ্টা করেন, THEN THE App SHALL User-কে প্ল্যান activation স্ক্রিনে redirect করবে।
7. THE Tracker SHALL ধাপ সম্পূর্ণ হওয়ার সময় (completedAt) এবং শুরু হওয়ার সময় (startedAt) LocalStorage-এ সংরক্ষণ করবে।

---

### Requirement 4: ধাপ নেভিগেশন ও বিস্তারিত ভিউ

**User Story:** একজন User হিসেবে, আমি ধাপের বিস্তারিত দেখতে এবং পূর্ববর্তী ও পরবর্তী ধাপে navigate করতে চাই।

#### Acceptance Criteria

1. WHEN User একটি ধাপে প্রবেশ করেন, THE App SHALL সেই ধাপের শিরোনাম, থিম, affirmation, চেকলিস্ট এবং ইসলামিক কন্টেন্ট প্রদর্শন করবে।
2. THE App SHALL ধাপ বিস্তারিত স্ক্রিনে "← পূর্ববর্তী ধাপ" এবং "পরবর্তী ধাপ →" নেভিগেশন বাটন প্রদর্শন করবে।
3. WHEN User ধাপ ১-এ থাকেন, THE App SHALL "পূর্ববর্তী ধাপ" বাটন নিষ্ক্রিয় বা লুকানো রাখবে।
4. WHEN User ধাপ ৪১-এ থাকেন এবং সেটি সম্পূর্ণ হয়, THE App SHALL "পরবর্তী ধাপ" বাটনের পরিবর্তে "যাত্রা সম্পূর্ণ" বার্তা প্রদর্শন করবে।
5. WHEN User একটি সম্পূর্ণ ধাপ পুনরায় দেখেন, THE App SHALL সেটি read-only মোডে প্রদর্শন করবে এবং চেকলিস্ট toggle করার সুবিধা দেবে।

---

### Requirement 5: প্ল্যান রিসেট

**User Story:** একজন User হিসেবে, আমি প্রয়োজনে সম্পূর্ণ অগ্রগতি মুছে নতুন করে শুরু করতে চাই।

#### Acceptance Criteria

1. THE App SHALL Settings স্ক্রিনে একটি "প্ল্যান রিসেট করুন" বাটন প্রদান করবে।
2. WHEN User "প্ল্যান রিসেট করুন" বাটনে ট্যাপ করেন, THE App SHALL একটি multi-step confirmation dialog প্রদর্শন করবে যেখানে স্পষ্টভাবে সতর্ক করা হবে যে সমস্ত অগ্রগতি মুছে যাবে।
3. WHEN User reset নিশ্চিত করেন, THE App SHALL PlanState, stepProgress এবং milestones সম্পূর্ণ clear করবে এবং totalResets কাউন্টার বৃদ্ধি করবে।
4. WHEN reset সম্পন্ন হয়, THE App SHALL User-কে হোম স্ক্রিনে নিয়ে যাবে যেখানে "যাত্রা শুরু করুন" বাটন দেখাবে।
5. THE App SHALL reset-এর পরেও triggerLogs এবং cravingSessions historical data হিসেবে সংরক্ষণ করবে।
6. IF User reset confirmation dialog-এ "বাতিল" নির্বাচন করেন, THEN THE App SHALL কোনো পরিবর্তন না করে dialog বন্ধ করবে।

---

### Requirement 6: প্রগ্রেস বার ও ধাপ-ভিত্তিক অগ্রগতি প্রদর্শন

**User Story:** একজন User হিসেবে, আমি আমার ৪১-ধাপের যাত্রায় কতটুকু এগিয়েছি তা স্পষ্টভাবে দেখতে চাই।

#### Acceptance Criteria

1. THE ProgressDashboard SHALL একটি প্রগ্রেস বার প্রদর্শন করবে যেখানে "X/৪১ ধাপ সম্পূর্ণ" এবং সামগ্রিক সম্পন্নতার শতাংশ দেখানো হবে।
2. THE ProgressDashboard SHALL ধূমপান-মুক্ত দিনের সংখ্যা (planActivatedAt থেকে calendar-based), বাঁচানো সিগারেটের সংখ্যা এবং আনুমানিক সাশ্রয়কৃত অর্থ প্রদর্শন করবে।
3. THE ProgressDashboard SHALL ৪১-ধাপের একটি ভিজ্যুয়াল গ্রিড ভিউ প্রদর্শন করবে যেখানে সম্পূর্ণ, বর্তমান এবং locked ধাপগুলো আলাদাভাবে চিহ্নিত থাকবে।
4. THE ProgressDashboard SHALL স্বাস্থ্য পুনরুদ্ধারের টাইমলাইন প্রদর্শন করবে (যেমন: ২০ মিনিট পর রক্তচাপ স্বাভাবিক, ২৪ ঘণ্টা পর কার্বন মনোক্সাইড মুক্তি)।
5. WHEN User ProgressDashboard দেখেন, THE App SHALL বর্তমান পর্যায়ের (ধাপ ১–৭, ৮–১৪, ইত্যাদি) সাথে প্রাসঙ্গিক একটি ইসলামিক অনুপ্রেরণামূলক বার্তা প্রদর্শন করবে।
6. THE ProgressDashboard SHALL ক্র্যাভিং লগের একটি সাপ্তাহিক চার্ট প্রদর্শন করবে।

---

### Requirement 7: দৈনিক ইসলামিক অনুপ্রেরণা

**User Story:** একজন মুসলিম User হিসেবে, আমি প্রতিদিন কুরআনের আয়াত, হাদিস বা দোয়া দেখতে চাই, যাতে আমি আধ্যাত্মিকভাবে অনুপ্রাণিত থাকতে পারি।

#### Acceptance Criteria

1. THE App SHALL প্রতিদিন একটি নতুন IslamicContent (আয়াত, হাদিস বা দোয়া) হোম স্ক্রিনে প্রদর্শন করবে।
2. THE App SHALL IslamicContent-এ আরবি টেক্সট, বাংলা অনুবাদ এবং উৎস (সূরা/আয়াত নম্বর বা হাদিসের রেফারেন্স) একসাথে প্রদর্শন করবে।
3. WHEN User IslamicContent-এ ট্যাপ করেন, THE App SHALL সম্পূর্ণ বিস্তারিত বিবরণ সহ একটি বিস্তারিত ভিউ প্রদর্শন করবে।
4. THE App SHALL কমপক্ষে ৪১টি অনন্য IslamicContent এন্ট্রি ধারণ করবে যা ধূমপান ত্যাগের বিভিন্ন পর্যায়ের সাথে প্রাসঙ্গিক।
5. WHERE User Notification সক্রিয় রেখেছেন, THE App SHALL প্রতিদিন সকালে দৈনিক IslamicContent সহ একটি Notification পাঠাবে।

---

### Requirement 8: ক্র্যাভিং ম্যানেজমেন্ট টুল

**User Story:** একজন User হিসেবে, যখন আমার ধূমপানের তীব্র আকাঙ্ক্ষা হয়, আমি তাৎক্ষণিক সহায়তা পেতে চাই, যাতে আমি সেই মুহূর্তটি কাটিয়ে উঠতে পারি।

#### Acceptance Criteria

1. THE CravingTool SHALL একটি "আমার এখন ক্র্যাভিং হচ্ছে" বাটন প্রদান করবে যা হোম স্ক্রিন থেকে সরাসরি অ্যাক্সেসযোগ্য।
2. WHEN User CravingTool সক্রিয় করেন, THE App SHALL একটি ৫-মিনিটের কাউন্টডাউন টাইমার প্রদর্শন করবে এবং ক্র্যাভিং কাটানোর কৌশল দেখাবে।
3. THE CravingTool SHALL নিম্নলিখিত কৌশলগুলো প্রদান করবে: গভীর শ্বাস-প্রশ্বাস গাইড, জিকির (সুবহানাল্লাহ, আলহামদুলিল্লাহ, আল্লাহু আকবার), দোয়া পাঠ, এবং বিকল্প কার্যকলাপের তালিকা।
4. WHEN কাউন্টডাউন শেষ হয়, THE App SHALL User-কে জিজ্ঞেস করবে ক্র্যাভিং কাটিয়ে উঠতে পেরেছেন কিনা এবং ফলাফল TriggerLog-এ সংরক্ষণ করবে।
5. THE CravingTool SHALL প্রতিটি ক্র্যাভিং সেশনের সময়, তীব্রতা (১–১০ স্কেল) এবং ব্যবহৃত কৌশল LocalStorage-এ লগ করবে।

---

### Requirement 9: ট্রিগার লগ

**User Story:** একজন User হিসেবে, আমি আমার ধূমপানের প্ররোচনা সৃষ্টিকারী পরিস্থিতিগুলো লগ করতে চাই, যাতে আমি সেগুলো চিহ্নিত করে এড়িয়ে চলতে পারি।

#### Acceptance Criteria

1. THE TriggerLog SHALL User-কে ট্রিগারের ধরন (মানসিক চাপ, সামাজিক পরিস্থিতি, একঘেয়েমি, পরিবেশগত সংকেত, অভ্যাসগত) নির্বাচন করার সুবিধা দেবে।
2. WHEN User একটি ট্রিগার লগ করেন, THE TriggerLog SHALL তারিখ, সময়, ট্রিগারের ধরন এবং ঐচ্ছিক নোট সংরক্ষণ করবে।
3. THE TriggerLog SHALL একটি সাপ্তাহিক সারসংক্ষেপ প্রদর্শন করবে যেখানে সবচেয়ে সাধারণ ট্রিগারগুলো চিহ্নিত থাকবে।
4. THE App SHALL প্রতিটি ট্রিগার ধরনের জন্য ইসলামিক মোকাবেলা কৌশল সুপারিশ করবে।
5. IF User একই ধরনের ট্রিগার সপ্তাহে ৩ বারের বেশি লগ করেন, THEN THE App SHALL সেই নির্দিষ্ট ট্রিগার মোকাবেলার জন্য বিশেষ পরামর্শ প্রদর্শন করবে।

---

### Requirement 10: দোয়া ও জিকির সেকশন

**User Story:** একজন মুসলিম User হিসেবে, আমি ধূমপান ত্যাগ সম্পর্কিত দোয়া ও জিকির সহজে খুঁজে পেতে চাই, যাতে আমি আল্লাহর সাহায্য প্রার্থনা করতে পারি।

#### Acceptance Criteria

1. THE App SHALL একটি পৃথক দোয়া ও জিকির সেকশন প্রদান করবে যেখানে ধূমপান ত্যাগের বিভিন্ন পরিস্থিতির জন্য দোয়া সংগৃহীত থাকবে।
2. THE App SHALL প্রতিটি দোয়া ও জিকিরের আরবি টেক্সট, বাংলা উচ্চারণ এবং বাংলা অর্থ প্রদর্শন করবে।
3. WHEN User একটি দোয়া বা জিকির ট্যাপ করেন, THE App SHALL সেটি বড় ফন্টে পূর্ণ স্ক্রিনে প্রদর্শন করবে।
4. THE App SHALL নিম্নলিখিত বিভাগে দোয়া ও জিকির সংগঠিত করবে: সকালের আজকার, সন্ধ্যার আজকার, ক্র্যাভিং মোকাবেলার দোয়া, তাওবার দোয়া এবং শুকরিয়ার দোয়া।
5. WHERE User ক্র্যাভিং অনুভব করছেন, THE CravingTool SHALL সরাসরি দোয়া ও জিকির সেকশনে লিঙ্ক প্রদান করবে।

---

### Requirement 11: মাইলস্টোন উদযাপন

**User Story:** একজন User হিসেবে, আমি আমার ধূমপানমুক্ত যাত্রার গুরুত্বপূর্ণ মাইলস্টোনগুলো উদযাপন করতে চাই, যাতে আমি অনুপ্রাণিত থাকতে পারি।

#### Acceptance Criteria

1. THE App SHALL নিম্নলিখিত Milestone-এ বিশেষ উদযাপন স্ক্রিন প্রদর্শন করবে: ১ম ধাপ, ৩য় ধাপ, ৭ম ধাপ, ১৪তম ধাপ, ২১তম ধাপ, ৩০তম ধাপ এবং ৪১তম ধাপ সম্পূর্ণ।
2. WHEN User একটি Milestone অর্জন করেন, THE App SHALL একটি অ্যানিমেটেড উদযাপন স্ক্রিন, ইসলামিক অভিনন্দন বার্তা এবং প্রাসঙ্গিক কুরআনের আয়াত বা হাদিস প্রদর্শন করবে।
3. THE App SHALL প্রতিটি Milestone-এ User-এর স্বাস্থ্যগত উন্নতির একটি সংক্ষিপ্ত বিবরণ প্রদর্শন করবে।
4. WHEN User একটি Milestone অর্জন করেন এবং অ্যাপে সক্রিয় না থাকেন, THE App SHALL একটি Notification পাঠাবে।
5. THE App SHALL অর্জিত সকল Milestone-এর একটি তালিকা ProgressDashboard-এ প্রদর্শন করবে।
6. THE App SHALL Milestone detection-এ completedSteps.length ব্যবহার করবে — calendar-based smokeFreeDays নয়।

---

### Requirement 12: স্লিপ-আপ ম্যানেজমেন্ট

**User Story:** একজন User হিসেবে, যদি আমি ভুলবশত ধূমপান করে ফেলি, আমি নিরুৎসাহিত না হয়ে পুনরায় শুরু করতে চাই।

#### Acceptance Criteria

1. THE App SHALL একটি "স্লিপ-আপ রিপোর্ট করুন" বিকল্প প্রদান করবে যা ProgressDashboard থেকে অ্যাক্সেসযোগ্য।
2. WHEN User একটি SlipUp রিপোর্ট করেন, THE App SHALL তাওবার দোয়া, ইসলামিক অনুপ্রেরণামূলক বার্তা এবং পুনরায় শুরু করার উৎসাহ প্রদর্শন করবে।
3. WHEN User একটি SlipUp রিপোর্ট করেন, THE App SHALL User-কে জিজ্ঞেস করবে কোন ট্রিগার কারণ ছিল এবং সেটি TriggerLog-এ সংরক্ষণ করবে।
4. WHEN User একটি SlipUp রিপোর্ট করেন, THE App SHALL User-কে "প্ল্যান রিসেট করুন" অথবা "বর্তমান ধাপ থেকে চালিয়ে যান" বিকল্প দেবে।
5. IF User SlipUp-এর পর "প্ল্যান রিসেট করুন" নির্বাচন করেন, THEN THE App SHALL RESET_PLAN action dispatch করবে এবং সমস্ত stepProgress ও PlanState clear করবে।
6. IF User SlipUp-এর পর "বর্তমান ধাপ থেকে চালিয়ে যান" নির্বাচন করেন, THEN THE App SHALL কোনো progress পরিবর্তন না করে SlipUp রেকর্ড করবে।

---

### Requirement 13: ডেটা মডেল ও স্টেট ম্যানেজমেন্ট

**User Story:** একজন Developer হিসেবে, আমি step-based আর্কিটেকচারের জন্য সঠিক ডেটা মডেল ও state management চাই, যাতে অ্যাপটি নির্ভরযোগ্যভাবে কাজ করে।

#### Acceptance Criteria

1. THE App SHALL নিম্নলিখিত PlanState interface ব্যবহার করবে: `isActive`, `activatedAt`, `currentStep`, `completedSteps`, `lastCompletedAt`, `totalResets`।
2. THE App SHALL `dailyProgress` এর পরিবর্তে `stepProgress: Record<number, StepProgress>` ব্যবহার করবে যেখানে key হবে step number।
3. THE App SHALL `DayStatus` enum-এর পরিবর্তে `StepStatus` enum ব্যবহার করবে।
4. THE App SHALL `TOGGLE_CHECKLIST_ITEM` action সমর্থন করবে যা checklist item-কে add ও remove উভয়ই করতে পারবে।
5. THE App SHALL `ACTIVATE_PLAN`, `RESET_PLAN`, এবং `COMPLETE_STEP` action সমর্থন করবে।
6. THE App SHALL `COMPLETE_STEP` action dispatch হলে `completedSteps` array-এ step number যোগ করবে এবং `currentStep` পরবর্তী ধাপে বৃদ্ধি করবে।
7. THE App SHALL `isStepAccessible(step, planState)` function ব্যবহার করবে যা শুধুমাত্র তখনই true রিটার্ন করবে যখন planState.completedSteps-এ (step - 1) অন্তর্ভুক্ত থাকবে অথবা step === 1 এবং plan active থাকবে।

---

### Requirement 14: Backward Compatibility ও ডেটা মাইগ্রেশন

**User Story:** একজন বিদ্যমান User হিসেবে, আমি অ্যাপ আপডেটের পরেও আমার পুরনো ডেটা হারাতে চাই না।

#### Acceptance Criteria

1. WHEN App চালু হয় এবং LocalStorage-এ পুরনো format-এর ডেটা পাওয়া যায়, THE App SHALL পুরনো `dailyProgress` ডেটাকে নতুন `stepProgress` format-এ auto-migrate করবে।
2. WHEN App চালু হয় এবং LocalStorage-এ পুরনো `quitDate` পাওয়া যায়, THE App SHALL সেটিকে `planActivatedAt` হিসেবে migrate করবে এবং PlanState active সেট করবে।
3. THE App SHALL migration সম্পন্ন হওয়ার পর পুরনো format-এর key গুলো LocalStorage থেকে মুছে ফেলবে।
4. IF migration-এর সময় কোনো error ঘটে, THEN THE App SHALL পুরনো ডেটা অক্ষত রেখে User-কে একটি error বার্তা প্রদর্শন করবে।
5. THE App SHALL migration-এর পর সমস্ত ডেটার integrity verify করবে এবং inconsistent state detect হলে User-কে জানাবে।

---

### Requirement 15: নোটিফিকেশন ব্যবস্থাপনা

**User Story:** একজন User হিসেবে, আমি প্রাসঙ্গিক সময়ে অনুপ্রেরণামূলক নোটিফিকেশন পেতে চাই, যাতে আমি ধূমপানমুক্ত থাকার কথা মনে রাখতে পারি।

#### Acceptance Criteria

1. THE App SHALL User-কে Notification পাঠানোর অনুমতি চাইবে অনবোর্ডিং প্রক্রিয়ায়।
2. WHERE User Notification সক্রিয় রেখেছেন, THE App SHALL প্রতিদিন সকাল ৮টায় দৈনিক অনুপ্রেরণা Notification পাঠাবে।
3. WHERE User Notification সক্রিয় রেখেছেন, THE App SHALL প্রতিদিন রাত ৯টায় "আজকের ধাপ সম্পূর্ণ করুন" reminder Notification পাঠাবে।
4. THE App SHALL Notification সেটিংস পরিবর্তন করার সুবিধা প্রদান করবে যেখানে User সময় ও ধরন কাস্টমাইজ করতে পারবেন।
5. IF User ৩ দিন অ্যাপ না খোলেন, THEN THE App SHALL একটি বিশেষ উৎসাহমূলক Notification পাঠাবে।
6. THE App SHALL Notification message-এ "দিন ধূমপান-মুক্ত" এর পরিবর্তে "ধাপ সম্পূর্ণ" এবং "ধূমপান-মুক্ত দিন" উভয় তথ্য অন্তর্ভুক্ত করবে।

---

### Requirement 16: ইসলামিক কন্টেন্ট লাইব্রেরি

**User Story:** একজন মুসলিম User হিসেবে, আমি ধূমপান ত্যাগ সম্পর্কিত ইসলামিক জ্ঞান ও শিক্ষা একটি কেন্দ্রীয় স্থানে পেতে চাই।

#### Acceptance Criteria

1. THE App SHALL একটি ইসলামিক কন্টেন্ট লাইব্রেরি প্রদান করবে যেখানে ধূমপান ত্যাগের বিভিন্ন দিক সম্পর্কিত কুরআনের আয়াত ও হাদিস সংগৃহীত থাকবে।
2. THE App SHALL কন্টেন্টকে বিষয়ভিত্তিক বিভাগে সংগঠিত করবে: তাওয়াক্কুল, সবর, তাওবা, স্বাস্থ্য রক্ষা এবং আত্ম-নিয়ন্ত্রণ।
3. WHEN User একটি কন্টেন্ট আইটেম পড়েন, THE App SHALL সম্পর্কিত অন্যান্য কন্টেন্ট সুপারিশ করবে।
4. THE App SHALL প্রতিটি IslamicContent-এর জন্য আরবি টেক্সট সঠিক RTL (right-to-left) ফরম্যাটে প্রদর্শন করবে।
5. THE App SHALL User-কে পছন্দের IslamicContent বুকমার্ক করার সুবিধা দেবে।

---

### Requirement 17: অফলাইন কার্যকারিতা ও ডেটা সংরক্ষণ

**User Story:** একজন User হিসেবে, আমি ইন্টারনেট সংযোগ ছাড়াও অ্যাপের সকল মূল ফিচার ব্যবহার করতে চাই।

#### Acceptance Criteria

1. THE App SHALL ইন্টারনেট সংযোগ ছাড়াই সকল মূল ফিচার (Tracker, CravingTool, TriggerLog, দোয়া সেকশন) সম্পূর্ণরূপে কার্যকর রাখবে।
2. THE App SHALL সকল IslamicContent, StepPlan এবং দোয়া ডেটা অ্যাপের সাথে বান্ডেল করে রাখবে।
3. THE App SHALL User-এর সকল অগ্রগতি ডেটা LocalStorage-এ সংরক্ষণ করবে।
4. THE App SHALL iOS এবং Android উভয় প্ল্যাটফর্মে সমানভাবে কার্যকর থাকবে।
5. IF ডিভাইসের স্টোরেজ পূর্ণ হয়ে যায়, THEN THE App SHALL User-কে একটি সতর্কবার্তা প্রদর্শন করবে এবং পুরনো TriggerLog ডেটা মুছে ফেলার বিকল্প দেবে।

---

## মূল নকশা নীতিমালা (Core Design Principles)

### ১. Step-based Paradigm

অ্যাপটি calendar-based মডেল থেকে সম্পূর্ণ step-based মডেলে রূপান্তরিত হবে। মূল পার্থক্য:

- **আগে**: `quitDate` সেট করলে সময়ের সাথে স্বয়ংক্রিয়ভাবে দিন এগিয়ে যেত — ব্যবহারকারী অ্যাপ না খুললেও দিন "হারিয়ে" যেত।
- **এখন**: ব্যবহারকারী নিজে প্রতিটি ধাপ সম্পন্ন করলে পরের ধাপ unlock হবে — কোনো ধাপ কখনো skip হবে না।

### ২. User-driven Progress

```
isStepAccessible(step, planState):
  step 1  → plan active থাকলেই accessible
  step N  → step (N-1) completedSteps-এ থাকলে accessible
```

### ৩. চিহ্নিত সমস্যাগুলো যা সমাধান করতে হবে

নিচের critical bugs বর্তমান codebase-এ বিদ্যমান এবং এই spec-এর implementation-এ সমাধান করতে হবে:

| সমস্যা | অবস্থান | সমাধান |
|--------|----------|--------|
| দিন skip হওয়া | `computeTrackerDay()` | ফাংশনটি সরিয়ে `planState.currentStep` ব্যবহার |
| Checklist un-toggle অসম্ভব | `COMPLETE_CHECKLIST_ITEM` reducer | `TOGGLE_CHECKLIST_ITEM` দিয়ে replace — two-way toggle |
| `isComplete` কখনো `true` হয় না | `AppContext.tsx` reducer | `COMPLETE_STEP` action দিয়ে explicitly set করা |
| Reset শুধু `quitDate` পরিবর্তন করে | `RESET_QUIT_DATE` action | `RESET_PLAN` action — সম্পূর্ণ progress clear |

### ৪. নতুন Data Model সংক্ষেপ

| Layer | পুরনো | নতুন |
|-------|-------|------|
| Plan tracking | `quitDate` + `computeTrackerDay()` | `PlanState` (`isActive`, `currentStep`, `completedSteps`) |
| Step data | `DailyPlan` (`day` field) | `StepPlan` (`step` field) |
| Progress data | `dailyProgress: Record<number, DailyPlanProgress>` | `stepProgress: Record<number, StepProgress>` |
| Status enum | `DayStatus` | `StepStatus` |
| Milestone trigger | `smokeFreeDays` (calendar) | `completedSteps.length` (step count) |
| Slip-up action | `reset_quit_date` | `reset_plan` |

### ৫. ধূমপান-মুক্ত দিন গণনা

প্ল্যান step-based হলেও **ধূমপান-মুক্ত দিনের সংখ্যা** এখনও `planActivatedAt` থেকে calendar-based হিসাবে দেখানো হবে — এটি motivation-এর জন্য গুরুত্বপূর্ণ।

```
ধূমপান-মুক্ত দিন = floor((Date.now() - planActivatedAt) / 86400000)
```

### ৬. Backward Compatibility নীতি

- পুরনো `dailyProgress` → নতুন `stepProgress`-এ auto-migrate
- পুরনো `quitDate` → `planActivatedAt` হিসেবে migrate, PlanState active সেট
- `triggerLogs` ও `cravingSessions` reset-এর পরেও historical data হিসেবে সংরক্ষিত থাকবে
