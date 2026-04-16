# Requirements Document: Data Content Enrichment

## Introduction

"Smoke-Free Path" (ধোঁয়া-মুক্ত পথ) অ্যাপের `assets/data` ফোল্ডারে পাঁচটি JSON ফাইল রয়েছে যা অ্যাপের সমস্ত ইসলামিক কন্টেন্ট, দোয়া, স্বাস্থ্য তথ্য, মাইলস্টোন এবং ধাপ পরিকল্পনা ধারণ করে। বর্তমানে এই ফাইলগুলোতে বেশ কিছু ঘাটতি রয়েছে: `duas.json`-এ সব `relatedContentIds` খালি এবং `stepAssignment` null, `health_timeline.json`-এ মাত্র ১০টি entry, `step_plans.json`-এ প্রতিটি ধাপে মাত্র ৩টি tips, এবং কোনো ফাইলেই `reflection_prompt` বা `islamicInsight` field নেই।

এই feature-এর লক্ষ্য হলো সব JSON ফাইলের content সমৃদ্ধ করা, cross-linking সম্পূর্ণ করা, নতুন content categories যোগ করা, এবং প্রতিটি ধাপের জন্য আরও গভীর ইসলামিক guidance প্রদান করা — যাতে ব্যবহারকারী আরও অনুপ্রাণিত ও সহায়তাপ্রাপ্ত অনুভব করেন।

---

## Glossary

- **ContentEnrichmentSystem**: এই feature-এর সামগ্রিক data enrichment প্রক্রিয়া
- **duas.json**: দোয়া ও জিকিরের JSON ডেটা ফাইল (বর্তমানে ১৭টি entry)
- **islamic_content.json**: কুরআনের আয়াত ও হাদিসের JSON ডেটা ফাইল (বর্তমানে ৪১টি entry)
- **health_timeline.json**: ধূমপান ত্যাগের পর স্বাস্থ্য পুনরুদ্ধারের টাইমলাইন ফাইল (বর্তমানে ১০টি entry)
- **milestones.json**: মাইলস্টোন উদযাপনের ডেটা ফাইল (৭টি milestone)
- **step_plans.json**: ৪১-ধাপের পরিকল্পনার ডেটা ফাইল
- **Dua**: ইসলামিক প্রার্থনা বা দোয়া
- **Dhikr**: আল্লাহর স্মরণে পাঠ করা জিকির
- **relatedContentIds**: একটি content item-এর সাথে সম্পর্কিত অন্য content item-এর ID তালিকা
- **stepAssignment**: একটি দোয়া বা content কোন ধাপের সাথে বিশেষভাবে সম্পর্কিত তার নম্বর
- **duaCategory**: দোয়ার বিভাগ (morning_adhkar, evening_adhkar, craving_dua, tawbah_dua, shukr_dua, milestone_dua, slip_up_dua, social_pressure_dua, family_dua, night_craving_dua, ramadan_dua)
- **reflection_prompt**: ব্যবহারকারীকে আত্মচিন্তায় উৎসাহিত করার প্রশ্ন বা বাক্য — এমন ভাষায় যা একজন অশিক্ষিত মানুষও বুঝতে পারেন
- **islamicInsight**: একটি ধাপের ইসলামিক থিমের গভীর ব্যাখ্যা — সহজ বাংলায়, জটিল পরিভাষা ছাড়া
- **Cross-linking**: বিভিন্ন content item-এর মধ্যে পারস্পরিক সম্পর্ক স্থাপন
- **Milestone_Dua**: মাইলস্টোন অর্জনের সময় পাঠ করার বিশেষ দোয়া
- **Slip_Up_Dua**: স্লিপ-আপের পর তাওবা ও পুনরুদ্ধারের জন্য দোয়া
- **family_dua**: পরিবারের সুস্বাস্থ্য ও সুখের জন্য দোয়া — সন্তান, স্ত্রী ও পরিবারের কল্যাণ কামনায়
- **social_pressure_dua**: সামাজিক চাপের মুহূর্তে (যেমন বন্ধু সিগারেট দিলে) পাঠ করার দোয়া
- **night_craving_dua**: রাতের একাকীত্বে বা ঘুম না হলে ক্র্যাভিং মোকাবেলার জন্য বিশেষ দোয়া
- **ramadan_dua**: রমজান মাসে ধূমপান ত্যাগের নিয়তকে শক্তিশালী করার দোয়া
- **WithdrawalNote**: withdrawal symptoms-এর সহজ বাংলা ব্যাখ্যা — medical terminology ছাড়া, সাধারণ মানুষের ভাষায়
- **moneySavedContext**: সাশ্রয়কৃত অর্থের emotional context বার্তা — concrete ব্যবহার উল্লেখ করে (যেমন: সন্তানের বই, মায়ের ওষুধ)
- **familyMotivation**: পরিবারকে সম্পৃক্ত করার নির্দিষ্ট guidance — সন্তান, স্ত্রী বা পরিবারের কথা উল্লেখ করে একটি কাজ বলা
- **ramadanTip**: রমজানে রোজার সাথে ধূমপান ত্যাগের সংযোগ ব্যাখ্যাকারী বিশেষ পরামর্শ

---

## Requirements

### Requirement 1: duas.json — Cross-linking সম্পূর্ণ করা

**User Story:** একজন Developer হিসেবে, আমি চাই `duas.json`-এর প্রতিটি দোয়ার `relatedContentIds` field পূরণ করা হোক, যাতে অ্যাপ সম্পর্কিত ইসলামিক কন্টেন্ট সুপারিশ করতে পারে।

#### Acceptance Criteria

1. THE ContentEnrichmentSystem SHALL `duas.json`-এর প্রতিটি entry-তে `relatedContentIds` array-এ কমপক্ষে ২টি প্রাসঙ্গিক `islamic_content.json` ID যোগ করবে।
2. WHEN একটি দোয়ার `topic` হয় `tawakkul`, THE ContentEnrichmentSystem SHALL সেই দোয়ার `relatedContentIds`-এ `tawakkul` topic-এর `islamic_content.json` entry-র ID অন্তর্ভুক্ত করবে।
3. WHEN একটি দোয়ার `topic` হয় `self_control`, THE ContentEnrichmentSystem SHALL সেই দোয়ার `relatedContentIds`-এ `self_control` topic-এর `islamic_content.json` entry-র ID অন্তর্ভুক্ত করবে।
4. WHEN একটি দোয়ার `topic` হয় `tawbah`, THE ContentEnrichmentSystem SHALL সেই দোয়ার `relatedContentIds`-এ `tawbah` topic-এর `islamic_content.json` entry-র ID অন্তর্ভুক্ত করবে।
5. WHEN একটি দোয়ার `topic` হয় `health`, THE ContentEnrichmentSystem SHALL সেই দোয়ার `relatedContentIds`-এ `health` topic-এর `islamic_content.json` entry-র ID অন্তর্ভুক্ত করবে।
6. THE ContentEnrichmentSystem SHALL নিশ্চিত করবে যে `relatedContentIds`-এ উল্লিখিত প্রতিটি ID `islamic_content.json`-এ বিদ্যমান।

---

### Requirement 2: duas.json — stepAssignment পূরণ করা

**User Story:** একজন Developer হিসেবে, আমি চাই নির্দিষ্ট দোয়াগুলো নির্দিষ্ট ধাপের সাথে সংযুক্ত হোক, যাতে অ্যাপ প্রতিটি ধাপে প্রাসঙ্গিক দোয়া দেখাতে পারে।

#### Acceptance Criteria

1. THE ContentEnrichmentSystem SHALL `craving_dua` category-র দোয়াগুলোতে `stepAssignment` হিসেবে ধাপ ১–৭ (তাওয়াক্কুল পর্যায়) assign করবে, কারণ প্রথম সপ্তাহে craving সবচেয়ে তীব্র থাকে।
2. THE ContentEnrichmentSystem SHALL `tawbah_dua` category-র দোয়াগুলোতে `stepAssignment` হিসেবে ধাপ ৩১–৪১ (তাওবা/ইস্তেকামাত পর্যায়) assign করবে।
3. THE ContentEnrichmentSystem SHALL `shukr_dua` category-র দোয়াগুলোতে `stepAssignment` হিসেবে ধাপ ২২–৩০ (শুকর পর্যায়) assign করবে।
4. THE ContentEnrichmentSystem SHALL `morning_adhkar` ও `evening_adhkar` category-র দোয়াগুলোতে `stepAssignment: null` রাখবে, কারণ এগুলো সব ধাপে প্রযোজ্য।
5. WHEN একটি দোয়ার `stepAssignment` নির্ধারিত হয়, THE ContentEnrichmentSystem SHALL নিশ্চিত করবে যে সেই step number ১ থেকে ৪১-এর মধ্যে।

---

### Requirement 3: duas.json — নতুন দোয়া categories যোগ করা

**User Story:** একজন মুসলিম User হিসেবে, আমি চাই মাইলস্টোন অর্জনের সময়, স্লিপ-আপের পর, সামাজিক চাপের মুহূর্তে, পরিবারের জন্য এবং রাতের একাকীত্বে বিশেষ দোয়া পাই, যাতে আমি সেই মুহূর্তে আল্লাহর সাহায্য চাইতে পারি।

#### Acceptance Criteria

1. THE ContentEnrichmentSystem SHALL `duas.json`-এ `milestone_dua` category-তে কমপক্ষে ৩টি নতুন দোয়া যোগ করবে যা মাইলস্টোন অর্জনের কৃতজ্ঞতা প্রকাশ করে।
2. THE ContentEnrichmentSystem SHALL `duas.json`-এ `slip_up_dua` category-তে কমপক্ষে ৩টি নতুন দোয়া যোগ করবে যা স্লিপ-আপের পর তাওবা ও পুনরুদ্ধারের জন্য।
3. THE ContentEnrichmentSystem SHALL `craving_dua` category-তে কমপক্ষে ২টি নতুন দোয়া যোগ করবে যা ক্র্যাভিং মোকাবেলায় বিশেষভাবে কার্যকর।
4. THE ContentEnrichmentSystem SHALL `duas.json`-এ `social_pressure_dua` category-তে কমপক্ষে ৩টি নতুন দোয়া যোগ করবে যা বন্ধু বা সহকর্মীর সিগারেটের প্রস্তাব প্রত্যাখ্যানের মুহূর্তে পাঠ করা যায়।
5. THE ContentEnrichmentSystem SHALL `duas.json`-এ `family_dua` category-তে কমপক্ষে ৩টি নতুন দোয়া যোগ করবে যা সন্তানের সুস্বাস্থ্য, স্ত্রীর সুখ এবং পরিবারের কল্যাণের জন্য।
6. THE ContentEnrichmentSystem SHALL `duas.json`-এ `night_craving_dua` category-তে কমপক্ষে ২টি নতুন দোয়া যোগ করবে যা রাতের একাকীত্বে বা ঘুম না হলে ক্র্যাভিং মোকাবেলায় সাহায্য করে।
7. THE ContentEnrichmentSystem SHALL `duas.json`-এ `ramadan_dua` category-তে কমপক্ষে ২টি নতুন দোয়া যোগ করবে যা রমজানে ধূমপান ত্যাগের নিয়তকে শক্তিশালী করে।
8. THE ContentEnrichmentSystem SHALL প্রতিটি নতুন দোয়ায় `arabicText`, `banglaTransliteration`, `banglaTranslation`, `source`, `duaCategory`, `topic`, `relatedContentIds` এবং `stepAssignment` field অন্তর্ভুক্ত করবে।
9. THE ContentEnrichmentSystem SHALL `social_pressure_dua` category-র প্রতিটি দোয়ার পাশে একটি `practicalPhrase` field যোগ করবে — বাংলায় একটি বিনয়ী বাক্য যা বলা যাবে (যেমন: "ভাই, আমি এখন ছাড়ার চেষ্টা করছি")।
10. THE ContentEnrichmentSystem SHALL প্রতিটি নতুন দোয়ার ID unique format অনুসরণ করবে: `dua_018`, `dua_019` ইত্যাদি।
11. IF একটি নতুন দোয়ার `source` কুরআনের আয়াত হয়, THEN THE ContentEnrichmentSystem SHALL সূরার নাম ও আয়াত নম্বর সঠিকভাবে উল্লেখ করবে।

---

### Requirement 4: health_timeline.json — Granular Timeline সমৃদ্ধ করা

**User Story:** একজন User হিসেবে, আমি ধূমপান ত্যাগের পর প্রতিটি পর্যায়ে আমার শরীরে কী পরিবর্তন হচ্ছে তা সহজ ভাষায় বিস্তারিত জানতে চাই, এবং withdrawal-এর কষ্টগুলো স্বাভাবিক বলে জানতে চাই, যাতে আমি ভয় না পেয়ে অনুপ্রাণিত থাকতে পারি।

#### Acceptance Criteria

1. THE ContentEnrichmentSystem SHALL `health_timeline.json`-এ বর্তমান ১০টি entry-র পাশাপাশি কমপক্ষে ৬টি নতুন entry যোগ করবে।
2. THE ContentEnrichmentSystem SHALL নতুন entries-এ নিম্নলিখিত সময়কাল অন্তর্ভুক্ত করবে: ৩ দিন, ৫ দিন, ২ সপ্তাহ (যদি না থাকে), ১ মাস (যদি না থাকে), ৬ মাস, এবং ৫ বছর।
3. THE ContentEnrichmentSystem SHALL প্রতিটি নতুন entry-তে `timeLabel`, `timeMinutes`, `benefit` এবং `icon` field অন্তর্ভুক্ত করবে।
4. THE ContentEnrichmentSystem SHALL `benefit` field-এ বৈজ্ঞানিকভাবে প্রমাণিত স্বাস্থ্য উপকারিতা বাংলায় বর্ণনা করবে।
5. THE ContentEnrichmentSystem SHALL প্রতিটি entry-তে একটি প্রাসঙ্গিক `islamicNote` field যোগ করবে যেখানে সেই স্বাস্থ্য পরিবর্তনের সাথে সম্পর্কিত একটি সংক্ষিপ্ত ইসলামিক দৃষ্টিভঙ্গি থাকবে।
6. THE ContentEnrichmentSystem SHALL প্রতিটি entry-তে একটি `withdrawalNote` field যোগ করবে — সেই সময়ে সম্ভাব্য withdrawal symptoms-এর সহজ বাংলা ব্যাখ্যা, medical terminology ছাড়া (যেমন: "এই সময়ে মাথাব্যথা বা রাগ হওয়া স্বাভাবিক — এটি শরীর সুস্থ হওয়ার লক্ষণ")।
7. THE ContentEnrichmentSystem SHALL প্রতিটি entry-তে একটি `encouragement` field যোগ করবে — সেই মুহূর্তের জন্য একটি উৎসাহমূলক বাক্য যা ব্যবহারকারীকে এগিয়ে যেতে অনুপ্রাণিত করে।
8. THE ContentEnrichmentSystem SHALL entries গুলো `timeMinutes` অনুযায়ী ascending order-এ সাজাবে।
9. IF দুটি entry-র `timeMinutes` একই হয়, THEN THE ContentEnrichmentSystem SHALL একটি error report করবে এবং duplicate entry যোগ করবে না।

---

### Requirement 5: step_plans.json — Tips সমৃদ্ধ করা

**User Story:** একজন User হিসেবে, আমি প্রতিটি ধাপে আরও বেশি ও বৈচিত্র্যময় practical tips পেতে চাই, পরিবারকে সম্পৃক্ত করার guidance পেতে চাই, এবং সাশ্রয়কৃত অর্থের concrete ব্যবহার জানতে চাই, যাতে আমি বিভিন্ন পরিস্থিতিতে সঠিক পদক্ষেপ নিতে পারি।

#### Acceptance Criteria

1. THE ContentEnrichmentSystem SHALL `step_plans.json`-এর প্রতিটি step-এ `tips` array-এ বর্তমান ৩টি থেকে কমপক্ষে ৫টি tips-এ উন্নীত করবে।
2. THE ContentEnrichmentSystem SHALL প্রতিটি step-এর নতুন tips-এ সেই ধাপের `theme`-এর সাথে সামঞ্জস্যপূর্ণ ইসলামিক পরামর্শ অন্তর্ভুক্ত করবে।
3. THE ContentEnrichmentSystem SHALL প্রতিটি step-এ একটি `islamicInsight` field যোগ করবে যেখানে সেই ধাপের থিমের উপর ৩–৫ বাক্যের গভীর ইসলামিক ব্যাখ্যা থাকবে।
4. THE ContentEnrichmentSystem SHALL প্রতিটি step-এ একটি `reflection_prompt` field যোগ করবে যেখানে ব্যবহারকারীকে আত্মচিন্তায় উৎসাহিত করার একটি প্রশ্ন থাকবে।
5. THE ContentEnrichmentSystem SHALL প্রতিটি step-এ একটি `hadith` field যোগ করবে যেখানে সেই ধাপের থিমের সাথে প্রাসঙ্গিক একটি হাদিস (আরবি ও বাংলা অনুবাদ সহ) থাকবে।
6. THE ContentEnrichmentSystem SHALL প্রতিটি step-এ একটি `familyMotivation` field যোগ করবে — পরিবারকে সম্পৃক্ত করার একটি নির্দিষ্ট কাজ, সন্তান, স্ত্রী বা পরিবারের কথা উল্লেখ করে (যেমন: "আজ সন্তানকে বলুন আপনি তার জন্য ধূমপান ছাড়ছেন")।
7. THE ContentEnrichmentSystem SHALL প্রতিটি step-এ একটি `moneySavedContext` field যোগ করবে — সেই ধাপ পর্যন্ত সাশ্রয়কৃত অর্থের emotional context, concrete ব্যবহার উল্লেখ করে (যেমন: "এই টাকায় সন্তানের একটি বই কিনতে পারতেন")।
8. THE ContentEnrichmentSystem SHALL ধাপ ১–৭-এ একটি `ramadanTip` field যোগ করবে — রমজানে রোজার সাথে ধূমপান ত্যাগের সংযোগ ব্যাখ্যা করে।
9. WHILE একটি step-এর `theme` হয় "তাওয়াক্কুল" (ধাপ ১–৭), THE ContentEnrichmentSystem SHALL সেই ধাপের `islamicInsight`-এ তাওয়াক্কুলের ধারণা ও ধূমপান ত্যাগের সাথে এর সম্পর্ক ব্যাখ্যা করবে।
10. WHILE একটি step-এর `theme` হয় "সবর" (ধাপ ৮–১৪), THE ContentEnrichmentSystem SHALL সেই ধাপের `islamicInsight`-এ সবরের ফজিলত ও নিকোটিন withdrawal-এর সাথে এর সম্পর্ক ব্যাখ্যা করবে।
11. WHILE একটি step-এর `theme` হয় "নিয়ত" (ধাপ ১৫–২১), THE ContentEnrichmentSystem SHALL সেই ধাপের `islamicInsight`-এ নিয়তের গুরুত্ব ও অভ্যাস পরিবর্তনের সাথে এর সম্পর্ক ব্যাখ্যা করবে।
12. WHILE একটি step-এর `theme` হয় "শুকর" (ধাপ ২২–৩০), THE ContentEnrichmentSystem SHALL সেই ধাপের `islamicInsight`-এ শুকরের ধারণা ও স্বাস্থ্য পুনরুদ্ধারের সাথে এর সম্পর্ক ব্যাখ্যা করবে।
13. WHILE একটি step-এর `theme` হয় "তাওবা" বা "ইস্তেকামাত" (ধাপ ৩১–৪১), THE ContentEnrichmentSystem SHALL সেই ধাপের `islamicInsight`-এ তাওবা ও দীর্ঘমেয়াদী পরিবর্তনের সাথে এর সম্পর্ক ব্যাখ্যা করবে।

---

### Requirement 6: islamic_content.json — relatedContentIds সম্পূর্ণ করা

**User Story:** একজন Developer হিসেবে, আমি চাই `islamic_content.json`-এর সব entry-তে `relatedContentIds` পূরণ থাকুক, যাতে Library screen-এ সম্পর্কিত কন্টেন্ট সুপারিশ কাজ করে।

#### Acceptance Criteria

1. THE ContentEnrichmentSystem SHALL `islamic_content.json`-এর প্রতিটি entry-তে `relatedContentIds` array-এ কমপক্ষে ২টি ID নিশ্চিত করবে।
2. WHEN একটি `islamic_content` entry-র `relatedContentIds` খালি থাকে, THE ContentEnrichmentSystem SHALL একই `topic`-এর অন্য entry-র ID দিয়ে সেটি পূরণ করবে।
3. THE ContentEnrichmentSystem SHALL নিশ্চিত করবে যে `relatedContentIds`-এ কোনো entry নিজের ID অন্তর্ভুক্ত করে না।
4. THE ContentEnrichmentSystem SHALL নিশ্চিত করবে যে cross-topic linking-এও প্রাসঙ্গিকতা বজায় থাকে — যেমন `tawakkul` ও `sabr` topic-এর মধ্যে linking যুক্তিসঙ্গত।
5. THE ContentEnrichmentSystem SHALL প্রতিটি entry-তে `duas.json`-এর সম্পর্কিত দোয়ার ID-ও `relatedContentIds`-এ অন্তর্ভুক্ত করার বিকল্প রাখবে।

---

### Requirement 7: milestones.json — Content সমৃদ্ধ করা

**User Story:** একজন User হিসেবে, আমি মাইলস্টোন অর্জনের সময় আরও বিস্তারিত ইসলামিক বার্তা ও স্বাস্থ্য তথ্য পেতে চাই, যাতে সেই মুহূর্তটি আরও অর্থবহ হয়।

#### Acceptance Criteria

1. THE ContentEnrichmentSystem SHALL `milestones.json`-এর প্রতিটি entry-তে একটি `duaId` field যোগ করবে যা `duas.json`-এর `milestone_dua` category-র একটি দোয়ার ID নির্দেশ করবে।
2. THE ContentEnrichmentSystem SHALL প্রতিটি milestone entry-তে একটি `nextMilestoneMotivation` field যোগ করবে যেখানে পরবর্তী মাইলস্টোনের দিকে এগিয়ে যাওয়ার উৎসাহমূলক বার্তা থাকবে।
3. THE ContentEnrichmentSystem SHALL প্রতিটি milestone entry-তে একটি `achievementBadge` field যোগ করবে যেখানে সেই মাইলস্টোনের জন্য একটি emoji badge থাকবে।
4. THE ContentEnrichmentSystem SHALL ৪১তম ধাপের milestone-এ একটি বিশেষ `completionMessage` field যোগ করবে যা পুরো যাত্রা সম্পন্ন করার অভিনন্দন জানাবে।
5. IF একটি milestone-এর `islamicContentId` `islamic_content.json`-এ বিদ্যমান না থাকে, THEN THE ContentEnrichmentSystem SHALL সেটি একটি valid ID দিয়ে প্রতিস্থাপন করবে।

---

### Requirement 8: Data Integrity ও Consistency

**User Story:** একজন Developer হিসেবে, আমি চাই সব JSON ফাইলের মধ্যে cross-reference সঠিক থাকুক, যাতে অ্যাপ runtime-এ কোনো broken link বা missing data-র সম্মুখীন না হয়।

#### Acceptance Criteria

1. THE ContentEnrichmentSystem SHALL নিশ্চিত করবে যে `step_plans.json`-এর প্রতিটি `islamicContentId` `islamic_content.json`-এ বিদ্যমান।
2. THE ContentEnrichmentSystem SHALL নিশ্চিত করবে যে `milestones.json`-এর প্রতিটি `islamicContentId` `islamic_content.json`-এ বিদ্যমান।
3. THE ContentEnrichmentSystem SHALL নিশ্চিত করবে যে `duas.json`-এর `relatedContentIds`-এ উল্লিখিত প্রতিটি ID `islamic_content.json`-এ বিদ্যমান।
4. THE ContentEnrichmentSystem SHALL নিশ্চিত করবে যে `islamic_content.json`-এর `relatedContentIds`-এ উল্লিখিত প্রতিটি ID একই ফাইলে বিদ্যমান।
5. THE ContentEnrichmentSystem SHALL নিশ্চিত করবে যে সব JSON ফাইলে ID গুলো unique।
6. IF কোনো cross-reference broken থাকে, THEN THE ContentEnrichmentSystem SHALL সেটি সঠিক valid ID দিয়ে প্রতিস্থাপন করবে।
7. THE ContentEnrichmentSystem SHALL নিশ্চিত করবে যে `health_timeline.json`-এর entries `timeMinutes` অনুযায়ী ascending order-এ থাকে।

---

### Requirement 9: Existing App Compatibility

**User Story:** একজন Developer হিসেবে, আমি চাই JSON ফাইলের পরিবর্তনগুলো বিদ্যমান TypeScript types ও ContentService-এর সাথে সামঞ্জস্যপূর্ণ হোক, যাতে অ্যাপ break না হয়।

#### Acceptance Criteria

1. THE ContentEnrichmentSystem SHALL বিদ্যমান JSON field গুলো (`id`, `type`, `arabicText`, `banglaTransliteration`, `banglaTranslation`, `source`, `topic`, `duaCategory`, `stepAssignment`, `relatedContentIds`) অপরিবর্তিত রাখবে।
2. THE ContentEnrichmentSystem SHALL নতুন field গুলো (`islamicInsight`, `reflection_prompt`, `hadith`, `islamicNote`, `withdrawalNote`, `encouragement`, `duaId`, `nextMilestoneMotivation`, `achievementBadge`, `familyMotivation`, `moneySavedContext`, `ramadanTip`, `practicalPhrase`) optional হিসেবে যোগ করবে যাতে বিদ্যমান code break না হয়।
3. THE ContentEnrichmentSystem SHALL `step_plans.json`-এর বিদ্যমান `checklistItems` structure অপরিবর্তিত রাখবে।
4. THE ContentEnrichmentSystem SHALL `health_timeline.json`-এর বিদ্যমান `timeLabel`, `timeMinutes`, `benefit`, `icon` fields অপরিবর্তিত রাখবে।
5. WHEN নতুন দোয়া যোগ করা হয়, THE ContentEnrichmentSystem SHALL বিদ্যমান `dua_001` থেকে `dua_017` ID গুলো অপরিবর্তিত রাখবে।
6. THE ContentEnrichmentSystem SHALL `types/index.ts`-এ নতুন optional fields-এর জন্য TypeScript interface update করার নির্দেশনা প্রদান করবে।

---

### Requirement 10: Content Quality Standards

**User Story:** একজন মুসলিম User হিসেবে, আমি চাই সব ইসলামিক content সঠিক, প্রামাণিক এবং ধূমপান ত্যাগের প্রসঙ্গে প্রাসঙ্গিক হোক।

#### Acceptance Criteria

1. THE ContentEnrichmentSystem SHALL নিশ্চিত করবে যে সব আরবি টেক্সট সঠিক হরকত ও বানান সহ লেখা হয়েছে।
2. THE ContentEnrichmentSystem SHALL নিশ্চিত করবে যে সব হাদিসের `source` field-এ কিতাবের নাম ও হাদিস নম্বর সঠিকভাবে উল্লেখ আছে।
3. THE ContentEnrichmentSystem SHALL নিশ্চিত করবে যে সব কুরআনের আয়াতের `source` field-এ সূরার নাম ও আয়াত নম্বর সঠিকভাবে উল্লেখ আছে।
4. THE ContentEnrichmentSystem SHALL নিশ্চিত করবে যে `banglaTransliteration` field-এ বাংলা হরফে সঠিক উচ্চারণ লেখা আছে।
5. THE ContentEnrichmentSystem SHALL নিশ্চিত করবে যে `islamicInsight` ও `reflection_prompt` field-এর content বাংলায় লেখা এবং ধূমপান ত্যাগের প্রসঙ্গে প্রাসঙ্গিক।
6. THE ContentEnrichmentSystem SHALL নিশ্চিত করবে যে `slip_up_dua` category-র দোয়াগুলো ব্যবহারকারীকে নিরুৎসাহিত না করে বরং তাওবা ও পুনরুদ্ধারে উৎসাহিত করে।
7. THE ContentEnrichmentSystem SHALL নিশ্চিত করবে যে `withdrawalNote` field-এ কোনো medical terminology ব্যবহার করা হয়নি — সহজ বাংলায় লেখা হয়েছে।
8. THE ContentEnrichmentSystem SHALL নিশ্চিত করবে যে `familyMotivation` field-এ সন্তান, স্ত্রী বা মায়ের কথা উল্লেখ করে emotional connection তৈরি করা হয়েছে।
9. THE ContentEnrichmentSystem SHALL নিশ্চিত করবে যে `social_pressure_dua` category-র `practicalPhrase` field-এ বিনয়ী ও সহজ বাংলা বাক্য রয়েছে যা বাস্তব পরিস্থিতিতে বলা যাবে।

---

### Requirement 11: Content Tone ও Language Standard

**User Story:** একজন সাধারণ বাংলাদেশি মুসলিম হিসেবে, আমি চাই অ্যাপের সব content সহজ, উষ্ণ ও আন্তরিক ভাষায় লেখা হোক — যেন একজন বিশ্বস্ত বড় ভাই বা মসজিদের ইমাম কথা বলছেন।

#### Acceptance Criteria

1. THE ContentEnrichmentSystem SHALL নিশ্চিত করবে যে সব `islamicInsight` field-এর ভাষা সহজ বাংলায় হবে — জটিল আরবি পরিভাষা এড়িয়ে চলতে হবে।
2. THE ContentEnrichmentSystem SHALL নিশ্চিত করবে যে সব `tips` array-এর প্রতিটি tip সর্বোচ্চ ২ বাক্যে লেখা হবে।
3. THE ContentEnrichmentSystem SHALL নিশ্চিত করবে যে `reflection_prompt` field-এর প্রশ্ন এমন হবে যা একজন অশিক্ষিত মানুষও বুঝতে পারেন।
4. THE ContentEnrichmentSystem SHALL নিশ্চিত করবে যে `withdrawalNote` field-এ medical terminology ব্যবহার করা যাবে না — সহজ বাংলায় লিখতে হবে।
5. THE ContentEnrichmentSystem SHALL নিশ্চিত করবে যে `familyMotivation` field-এ সন্তান, স্ত্রী বা মায়ের কথা উল্লেখ করে emotional connection তৈরি করতে হবে।
6. THE ContentEnrichmentSystem SHALL নিশ্চিত করবে যে `social_pressure_dua` category-র দোয়াগুলোর পাশে `practicalPhrase` field-এ practical বাংলা বাক্য থাকবে যা বলা যাবে (যেমন: "ভাই, আমি এখন ছাড়ার চেষ্টা করছি")।

---

### Requirement 12: রমজান ও বিশেষ ইসলামিক মৌসুম

**User Story:** একজন মুসলিম User হিসেবে, আমি চাই রমজান মাসে ধূমপান ত্যাগের বিশেষ guidance পাই, কারণ রমজান আমার জন্য সবচেয়ে বড় সুযোগ।

#### Acceptance Criteria

1. THE ContentEnrichmentSystem SHALL `duas.json`-এ `ramadan_dua` category-তে কমপক্ষে ২টি দোয়া যোগ করবে যা রমজানে ধূমপান ত্যাগের নিয়তকে শক্তিশালী করে।
2. THE ContentEnrichmentSystem SHALL `step_plans.json`-এর ধাপ ১–৭-এ `ramadanTip` field যোগ করবে যেখানে রমজানে রোজার সাথে ধূমপান ত্যাগের সংযোগ ব্যাখ্যা করা হবে।
3. THE ContentEnrichmentSystem SHALL নিশ্চিত করবে যে রমজানের দোয়াগুলোতে রোজার ফজিলত ও ধূমপান ত্যাগের সম্পর্ক উল্লেখ থাকবে।
4. THE ContentEnrichmentSystem SHALL নিশ্চিত করবে যে `ramadanTip` field-এ উল্লেখ থাকবে যে রোজা রাখলে দিনে ধূমপান করা যায় না — এটি ধূমপান ত্যাগের সবচেয়ে বড় সুযোগ।

---

### Requirement 13: পরিবার-কেন্দ্রিক Motivation

**User Story:** একজন বাবা/স্বামী হিসেবে, আমি চাই অ্যাপ আমাকে মনে করিয়ে দিক যে আমার পরিবারের জন্য সুস্থ থাকা আমার দায়িত্ব।

#### Acceptance Criteria

1. THE ContentEnrichmentSystem SHALL `duas.json`-এ `family_dua` category-তে কমপক্ষে ৩টি দোয়া যোগ করবে — পরিবারের সুস্বাস্থ্য ও সুখের জন্য।
2. THE ContentEnrichmentSystem SHALL `step_plans.json`-এর প্রতিটি step-এ `familyMotivation` field যোগ করবে।
3. THE ContentEnrichmentSystem SHALL নিশ্চিত করবে যে `familyMotivation` field-এ সন্তান, স্ত্রী বা পরিবারের কথা উল্লেখ করে একটি নির্দিষ্ট কাজ বলা হবে (যেমন: "আজ সন্তানকে বলুন আপনি তার জন্য ধূমপান ছাড়ছেন")।
4. THE ContentEnrichmentSystem SHALL নিশ্চিত করবে যে `moneySavedContext` field-এ সাশ্রয়কৃত অর্থের concrete ব্যবহার উল্লেখ করা হবে (যেমন: "এই টাকায় সন্তানের একটি বই কিনতে পারতেন")।
5. THE ContentEnrichmentSystem SHALL নিশ্চিত করবে যে `family_dua` category-র দোয়াগুলো সন্তানের সুস্বাস্থ্য, স্ত্রীর সুখ এবং পরিবারের কল্যাণের জন্য হবে।

---

## মূল নকশা নীতিমালা (Core Design Principles)

### ১. Backward Compatibility

সব নতুন field optional হবে। বিদ্যমান field-এর নাম, type বা structure পরিবর্তন করা যাবে না। এতে বিদ্যমান TypeScript code ও ContentService কোনো পরিবর্তন ছাড়াই কাজ করবে।

### ২. Cross-linking Strategy

```
duas.json ←→ islamic_content.json (topic-based linking)
step_plans.json → islamic_content.json (islamicContentId)
milestones.json → islamic_content.json (islamicContentId)
milestones.json → duas.json (duaId — নতুন)
duas.json (social_pressure_dua) → practicalPhrase (বাস্তব পরিস্থিতির guidance)
step_plans.json → familyMotivation (পরিবার-কেন্দ্রিক motivation)
step_plans.json → moneySavedContext (আর্থিক emotional anchor)
step_plans.json (ধাপ ১–৭) → ramadanTip (রমজান-বিশেষ guidance)
health_timeline.json → withdrawalNote (withdrawal symptoms-এর সহজ ব্যাখ্যা)
```

### ৩. Content Enrichment Priority

| Priority | ফাইল | পরিবর্তন |
|----------|------|----------|
| ১ (Critical) | `duas.json` | relatedContentIds, stepAssignment পূরণ |
| ২ (Critical) | `duas.json` | milestone_dua, slip_up_dua, social_pressure_dua, family_dua, night_craving_dua, ramadan_dua categories যোগ |
| ৩ (High) | `step_plans.json` | islamicInsight, reflection_prompt, hadith যোগ |
| ৪ (High) | `step_plans.json` | familyMotivation, moneySavedContext, ramadanTip যোগ |
| ৫ (High) | `step_plans.json` | tips ৩ → ৫-এ বৃদ্ধি |
| ৬ (Medium) | `health_timeline.json` | নতুন entries, islamicNote, withdrawalNote, encouragement যোগ |
| ৭ (Medium) | `milestones.json` | duaId, nextMilestoneMotivation যোগ |
| ৮ (Low) | `islamic_content.json` | খালি relatedContentIds পূরণ |

### ৪. নতুন Field Schema

```json
// step_plans.json-এ নতুন fields:
{
  "islamicInsight": "string (৩-৫ বাক্য, সহজ বাংলায়)",
  "reflection_prompt": "string (একটি প্রশ্ন, সহজ বাংলায় — অশিক্ষিত মানুষও বুঝবেন)",
  "hadith": {
    "arabicText": "string",
    "banglaTranslation": "string",
    "source": "string"
  },
  "familyMotivation": "string (সন্তান/স্ত্রী/পরিবারের কথা উল্লেখ করে একটি নির্দিষ্ট কাজ)",
  "moneySavedContext": "string (সাশ্রয়কৃত অর্থের concrete emotional context)",
  "ramadanTip": "string (ধাপ ১–৭ এ, রমজানে রোজার সাথে ধূমপান ত্যাগের সংযোগ)"
}

// health_timeline.json-এ নতুন fields:
{
  "islamicNote": "string (১-২ বাক্য, বাংলায়)",
  "withdrawalNote": "string (সহজ বাংলায়, medical terminology ছাড়া)",
  "encouragement": "string (উৎসাহমূলক একটি বাক্য)"
}

// milestones.json-এ নতুন fields:
{
  "duaId": "string (duas.json-এর ID)",
  "nextMilestoneMotivation": "string (বাংলায়)",
  "achievementBadge": "string (emoji)"
}

// duas.json-এ নতুন field (social_pressure_dua category-র জন্য):
{
  "practicalPhrase": "string (বাংলায় বিনয়ী বাক্য যা বলা যাবে)"
}
```

### ৫. বাংলাদেশি মুসলিম ব্যবহারকারীর বাস্তবতা

বাংলাদেশের সাধারণ মুসলিম ব্যবহারকারীর জন্য content তৈরিতে নিচের বাস্তবতাগুলো মাথায় রাখতে হবে:

- **পরিবার সবচেয়ে বড় motivation**: "আমার সন্তানের সামনে ধূমপান করব না" — এই আবেগ সবচেয়ে শক্তিশালী। প্রতিটি ধাপে পরিবারকে সম্পৃক্ত করতে হবে।
- **সামাজিক চাপ সবচেয়ে কঠিন মুহূর্ত**: বন্ধু সিগারেট দিলে "না" বলা বাংলাদেশে সবচেয়ে কঠিন। এই মুহূর্তের জন্য বিশেষ guidance দরকার।
- **রমজান বিশেষ সুযোগ**: অনেকে রমজানে ধূমপান ছাড়ার চেষ্টা করেন। রোজার সাথে ধূমপান ত্যাগের সংযোগ তৈরি করতে হবে।
- **আর্থিক সাশ্রয়ের concrete connection**: শুধু "টাকা জমছে" নয়, "এই টাকায় সন্তানের বই কিনতে পারতাম" — এই concrete connection দরকার।
- **সহজ ভাষা অপরিহার্য**: সব content এমন ভাষায় হতে হবে যা একজন অশিক্ষিত মানুষও বুঝতে পারেন — যেন একজন বিশ্বস্ত বড় ভাই বা মসজিদের ইমাম কথা বলছেন।
