# Implementation Plan: Data Content Enrichment

## Overview

এই plan-টি সম্পূর্ণ data-only enrichment — কোনো নতুন UI component বা service তৈরি হবে না। TypeScript types আপডেট করা হবে, property tests TDD approach-এ আগে লেখা হবে, তারপর পাঁচটি JSON ফাইল সমৃদ্ধ করা হবে।

## Tasks

- [x] 1. TypeScript Types আপডেট
  - [x] 1.1 `types/enums.ts`-এ `DuaCategory` type আপডেট করুন
    - নতুন ৬টি category যোগ করুন: `milestone_dua`, `slip_up_dua`, `social_pressure_dua`, `family_dua`, `night_craving_dua`, `ramadan_dua`
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.6, 3.7_

  - [x] 1.2 `types/index.ts`-এ `IslamicContent` interface আপডেট করুন
    - `practicalPhrase?: string` optional field যোগ করুন (শুধু `social_pressure_dua` category-র জন্য)
    - _Requirements: 3.9, 9.2_

  - [x] 1.3 `types/index.ts`-এ `HealthTimelineEntry` interface আপডেট করুন
    - `islamicNote?: string`, `withdrawalNote?: string`, `encouragement?: string` যোগ করুন
    - _Requirements: 4.5, 4.6, 4.7, 9.2_

  - [x] 1.4 `types/index.ts`-এ `StepPlan` interface আপডেট করুন
    - `islamicInsight?: string`, `reflection_prompt?: string` যোগ করুন
    - `hadith?: { arabicText: string; banglaTranslation: string; source: string }` যোগ করুন
    - `familyMotivation?: string`, `moneySavedContext?: string`, `ramadanTip?: string` যোগ করুন
    - _Requirements: 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 9.2_

  - [x] 1.5 `types/index.ts`-এ `Milestone` interface আপডেট করুন
    - `duaId?: string`, `nextMilestoneMotivation?: string`, `achievementBadge?: string`, `completionMessage?: string` যোগ করুন
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 9.2_

- [x] 2. Property Tests তৈরি (TDD — data changes-এর আগে)
  - [x] 2.1 `__tests__/property/dataIntegrity.property.test.ts` ফাইল তৈরি করুন এবং test infrastructure setup করুন
    - `fast-check` import করুন, সব JSON ফাইল import করুন
    - Helper sets তৈরি করুন: `islamicContentIds`, `duaIds`
    - _Requirements: 8.1, 8.3, 8.5_

  - [x] 2.2 Property 1 implement করুন: duas.json cross-linking validity
    - **Property 1: duas.json Cross-linking Validity**
    - `relatedContentIds`-এর প্রতিটি ID `islamic_content.json`-এ আছে কিনা verify করুন
    - **Validates: Requirements 1.6, 8.3**

  - [x] 2.3 Property 2 implement করুন: stepAssignment range validity
    - **Property 2: stepAssignment Range Validity**
    - non-null `stepAssignment` মান ১–৪১ range-এর মধ্যে কিনা verify করুন
    - **Validates: Requirements 2.5**

  - [x] 2.4 Property 3 implement করুন: health_timeline ascending order
    - **Property 3: health_timeline Ascending Order**
    - consecutive entries-এর `timeMinutes` strictly ascending কিনা verify করুন
    - **Validates: Requirements 4.8, 4.9, 8.7**

  - [x] 2.5 Property 4 implement করুন: step_plans islamicContentId validity
    - **Property 4: step_plans islamicContentId Validity**
    - প্রতিটি step-এর `islamicContentId` `islamic_content.json`-এ আছে কিনা verify করুন
    - **Validates: Requirements 8.1**

  - [x] 2.6 Property 5 implement করুন: milestones duaId validity
    - **Property 5: milestones duaId Validity**
    - non-null `duaId` `duas.json`-এ আছে এবং `duaCategory === 'milestone_dua'` কিনা verify করুন
    - **Validates: Requirements 7.1**

  - [x] 2.7 Property 6 implement করুন: unique IDs within each file
    - **Property 6: Unique IDs within each file**
    - `duas.json`, `islamic_content.json`, `step_plans.json`, `milestones.json` প্রতিটিতে ID unique কিনা verify করুন
    - **Validates: Requirements 8.5**

  - [x] 2.8 Property 7 implement করুন: social_pressure_dua practicalPhrase presence
    - **Property 7: social_pressure_dua practicalPhrase presence**
    - `duaCategory === 'social_pressure_dua'` হলে `practicalPhrase` non-empty কিনা verify করুন
    - **Validates: Requirements 3.9, 10.9, 11.6**

  - [x] 2.9 Property 8 implement করুন: no self-referencing in relatedContentIds
    - **Property 8: No self-referencing in relatedContentIds**
    - `islamic_content.json`-এর কোনো entry নিজের ID নিজের `relatedContentIds`-এ রাখছে না কিনা verify করুন
    - **Validates: Requirements 6.3**

- [x] 3. Checkpoint — Property tests চালান
  - সব property tests চালান: `cd smoke-free-path && npx jest __tests__/property/dataIntegrity --run`
  - এই পর্যায়ে tests fail করবে (TDD) — এটি স্বাভাবিক। কোনো প্রশ্ন থাকলে জিজ্ঞেস করুন।

- [x] 4. duas.json সমৃদ্ধ করা
  - [x] 4.1 বিদ্যমান ১৭টি entry-তে `relatedContentIds` পূরণ করুন
    - `tawakkul` topic → `ic_001`–`ic_005` range থেকে ২টি ID
    - `self_control` topic → `ic_006`–`ic_014` range থেকে ২টি ID
    - `tawbah` topic → `ic_030`–`ic_041` range থেকে ২টি ID
    - `health` topic → `ic_022`–`ic_029` range থেকে ২টি ID
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [x] 4.2 বিদ্যমান ১৭টি entry-তে `stepAssignment` যোগ করুন
    - `craving_dua` → ১–৭, `social_pressure_dua` → ১–৭, `night_craving_dua` → ১–১৪
    - `tawbah_dua` → ৩১–৪১, `shukr_dua` → ২২–৩০
    - `morning_adhkar`, `evening_adhkar`, `family_dua`, `ramadan_dua`, `milestone_dua`, `slip_up_dua` → null
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 4.3 `milestone_dua` category-তে `dua_018`–`dua_020` যোগ করুন (৩টি)
    - প্রতিটিতে: `arabicText`, `banglaTransliteration`, `banglaTranslation`, `source`, `duaCategory`, `topic`, `relatedContentIds`, `stepAssignment: null`
    - _Requirements: 3.1, 3.8, 3.10_

  - [x] 4.4 `slip_up_dua` category-তে `dua_021`–`dua_023` যোগ করুন (৩টি)
    - তাওবা ও পুনরুদ্ধারে উৎসাহিত করে এমন দোয়া — নিরুৎসাহিত করবে না
    - _Requirements: 3.2, 3.8, 3.10, 10.6_

  - [x] 4.5 `craving_dua` category-তে `dua_024`–`dua_025` যোগ করুন (২টি)
    - `stepAssignment: 1` (ধাপ ১–৭ range)
    - _Requirements: 3.3, 3.8, 3.10_

  - [x] 4.6 `social_pressure_dua` category-তে `dua_026`–`dua_028` যোগ করুন (৩টি)
    - প্রতিটিতে `practicalPhrase` field যোগ করুন (বিনয়ী বাংলা বাক্য)
    - `stepAssignment: 1` (ধাপ ১–৭ range)
    - _Requirements: 3.4, 3.8, 3.9, 3.10, 10.9, 11.6_

  - [x] 4.7 `family_dua` category-তে `dua_029`–`dua_031` যোগ করুন (৩টি)
    - সন্তানের সুস্বাস্থ্য, স্ত্রীর সুখ, পরিবারের কল্যাণের জন্য দোয়া
    - `stepAssignment: null`
    - _Requirements: 3.5, 3.8, 3.10, 13.1, 13.5_

  - [x] 4.8 `night_craving_dua` category-তে `dua_032`–`dua_033` যোগ করুন (২টি)
    - রাতের একাকীত্বে ক্র্যাভিং মোকাবেলার জন্য
    - `stepAssignment: 1` (ধাপ ১–১৪ range)
    - _Requirements: 3.6, 3.8, 3.10_

  - [x] 4.9 `ramadan_dua` category-তে `dua_034`–`dua_035` যোগ করুন (২টি)
    - রমজানে ধূমপান ত্যাগের নিয়ত শক্তিশালী করার দোয়া
    - রোজার ফজিলত ও ধূমপান ত্যাগের সম্পর্ক উল্লেখ
    - `stepAssignment: null`
    - _Requirements: 3.7, 3.8, 3.10, 12.1, 12.3_

- [x] 5. health_timeline.json সমৃদ্ধ করা
  - [x] 5.1 বিদ্যমান ১০টি entry-তে `islamicNote`, `withdrawalNote`, `encouragement` যোগ করুন
    - `islamicNote`: ১-২ বাক্যে ইসলামিক দৃষ্টিভঙ্গি
    - `withdrawalNote`: সহজ বাংলায়, medical terminology ছাড়া
    - `encouragement`: উৎসাহমূলক একটি বাক্য
    - _Requirements: 4.5, 4.6, 4.7, 10.7_

  - [x] 5.2 ৬টি নতুন entry যোগ করুন এবং ascending order নিশ্চিত করুন
    - ৫ দিন (7200 min), ৬ মাস (259200 min), ৫ বছর (2628000 min), ১০ বছর (5256000 min), ১৫ বছর (7884000 min) — এবং বিদ্যমান না থাকলে ২ সপ্তাহ/১ মাস
    - প্রতিটিতে `timeLabel`, `timeMinutes`, `benefit`, `icon`, `islamicNote`, `withdrawalNote`, `encouragement` থাকবে
    - Final order: `20 → 480 → 1440 → 2880 → 4320 → 7200 → 10080 → 20160 → 43200 → 129600 → 259200 → 525600 → 2628000 → 5256000 → 7884000`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.8, 4.9_

- [x] 6. step_plans.json সমৃদ্ধ করা — তাওয়াক্কুল পর্যায় (ধাপ ১–৭)
  - [x] 6.1 ধাপ ১–৭-এ `islamicInsight` ও `reflection_prompt` যোগ করুন
    - `islamicInsight`: তাওয়াক্কুলের ধারণা ও ধূমপান ত্যাগের সাথে সম্পর্ক (৩-৫ বাক্য, সহজ বাংলায়)
    - `reflection_prompt`: আত্মচিন্তার প্রশ্ন — অশিক্ষিত মানুষও বুঝবেন
    - _Requirements: 5.3, 5.4, 5.9, 11.1, 11.3_

  - [x] 6.2 ধাপ ১–৭-এ `hadith` যোগ করুন
    - তাওয়াক্কুল theme-এর সাথে প্রাসঙ্গিক হাদিস (আরবি ও বাংলা অনুবাদ সহ, source সহ)
    - _Requirements: 5.5, 10.1, 10.2_

  - [x] 6.3 ধাপ ১–৭-এ `familyMotivation`, `moneySavedContext`, `ramadanTip` যোগ করুন
    - `familyMotivation`: সন্তান/স্ত্রী/পরিবারের কথা উল্লেখ করে নির্দিষ্ট কাজ
    - `moneySavedContext`: সাশ্রয়কৃত অর্থের concrete emotional context
    - `ramadanTip`: রমজানে রোজার সাথে ধূমপান ত্যাগের সংযোগ
    - _Requirements: 5.6, 5.7, 5.8, 12.2, 12.4, 13.2, 13.3, 13.4_

  - [x] 6.4 ধাপ ১–৭-এ `tips` array ৩ → ৫-এ বৃদ্ধি করুন
    - নতুন ২টি tip তাওয়াক্কুল theme-এর সাথে সামঞ্জস্যপূর্ণ ইসলামিক পরামর্শ
    - প্রতিটি tip সর্বোচ্চ ২ বাক্যে
    - _Requirements: 5.1, 5.2, 11.2_

- [x] 7. step_plans.json সমৃদ্ধ করা — সবর পর্যায় (ধাপ ৮–১৪)
  - [x] 7.1 ধাপ ৮–১৪-এ `islamicInsight` ও `reflection_prompt` যোগ করুন
    - `islamicInsight`: সবরের ফজিলত ও নিকোটিন withdrawal-এর সাথে সম্পর্ক
    - _Requirements: 5.3, 5.4, 5.10, 11.1, 11.3_

  - [x] 7.2 ধাপ ৮–১৪-এ `hadith`, `familyMotivation`, `moneySavedContext` যোগ করুন
    - সবর theme-এর সাথে প্রাসঙ্গিক হাদিস
    - _Requirements: 5.5, 5.6, 5.7, 13.2, 13.3, 13.4_

  - [x] 7.3 ধাপ ৮–১৪-এ `tips` array ৩ → ৫-এ বৃদ্ধি করুন
    - _Requirements: 5.1, 5.2, 11.2_

- [x] 8. step_plans.json সমৃদ্ধ করা — নিয়ত পর্যায় (ধাপ ১৫–২১)
  - [x] 8.1 ধাপ ১৫–২১-এ `islamicInsight` ও `reflection_prompt` যোগ করুন
    - `islamicInsight`: নিয়তের গুরুত্ব ও অভ্যাস পরিবর্তনের সাথে সম্পর্ক
    - _Requirements: 5.3, 5.4, 5.11, 11.1, 11.3_

  - [x] 8.2 ধাপ ১৫–২১-এ `hadith`, `familyMotivation`, `moneySavedContext` যোগ করুন
    - নিয়ত theme-এর সাথে প্রাসঙ্গিক হাদিস
    - _Requirements: 5.5, 5.6, 5.7, 13.2, 13.3, 13.4_

  - [x] 8.3 ধাপ ১৫–২১-এ `tips` array ৩ → ৫-এ বৃদ্ধি করুন
    - _Requirements: 5.1, 5.2, 11.2_

- [x] 9. step_plans.json সমৃদ্ধ করা — শুকর পর্যায় (ধাপ ২২–৩০)
  - [x] 9.1 ধাপ ২২–৩০-এ `islamicInsight` ও `reflection_prompt` যোগ করুন
    - `islamicInsight`: শুকরের ধারণা ও স্বাস্থ্য পুনরুদ্ধারের সাথে সম্পর্ক
    - _Requirements: 5.3, 5.4, 5.12, 11.1, 11.3_

  - [x] 9.2 ধাপ ২২–৩০-এ `hadith`, `familyMotivation`, `moneySavedContext` যোগ করুন
    - শুকর theme-এর সাথে প্রাসঙ্গিক হাদিস
    - _Requirements: 5.5, 5.6, 5.7, 13.2, 13.3, 13.4_

  - [x] 9.3 ধাপ ২২–৩০-এ `tips` array ৩ → ৫-এ বৃদ্ধি করুন
    - _Requirements: 5.1, 5.2, 11.2_

- [x] 10. step_plans.json সমৃদ্ধ করা — তাওবা/ইস্তেকামাত পর্যায় (ধাপ ৩১–৪১)
  - [x] 10.1 ধাপ ৩১–৪১-এ `islamicInsight` ও `reflection_prompt` যোগ করুন
    - `islamicInsight`: তাওবা ও দীর্ঘমেয়াদী পরিবর্তনের সাথে সম্পর্ক
    - _Requirements: 5.3, 5.4, 5.13, 11.1, 11.3_

  - [x] 10.2 ধাপ ৩১–৪১-এ `hadith`, `familyMotivation`, `moneySavedContext` যোগ করুন
    - তাওবা/ইস্তেকামাত theme-এর সাথে প্রাসঙ্গিক হাদিস
    - _Requirements: 5.5, 5.6, 5.7, 13.2, 13.3, 13.4_

  - [x] 10.3 ধাপ ৩১–৪১-এ `tips` array ৩ → ৫-এ বৃদ্ধি করুন
    - _Requirements: 5.1, 5.2, 11.2_

- [x] 11. milestones.json সমৃদ্ধ করা
  - [x] 11.1 ৭টি milestone-এ `duaId` যোগ করুন
    - প্রতিটি milestone-এ `duas.json`-এর `milestone_dua` category-র একটি ID assign করুন
    - `dua_018`, `dua_019`, `dua_020` rotate করে ব্যবহার করুন
    - _Requirements: 7.1_

  - [x] 11.2 ৭টি milestone-এ `nextMilestoneMotivation` ও `achievementBadge` যোগ করুন
    - Badge mapping: ১→🌱, ৩→💪, ৭→⭐, ১৪→🌟, ২১→🏆, ৩০→🎖️, ৪১→👑
    - `nextMilestoneMotivation`: পরবর্তী মাইলস্টোনের দিকে উৎসাহমূলক বার্তা
    - _Requirements: 7.2, 7.3_

  - [x] 11.3 ৪১তম milestone-এ `completionMessage` যোগ করুন
    - পুরো যাত্রা সম্পন্ন করার বিশেষ অভিনন্দন বার্তা
    - _Requirements: 7.4_

- [x] 12. islamic_content.json — খালি `relatedContentIds` পূরণ করুন
  - [x] 12.1 একই `topic`-এর entries-এর মধ্যে cross-linking করুন
    - প্রতিটি entry-তে কমপক্ষে ২টি ID নিশ্চিত করুন
    - কোনো entry নিজের ID নিজের `relatedContentIds`-এ রাখবে না
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 12.2 Cross-topic linking যোগ করুন (প্রাসঙ্গিকতা বজায় রেখে)
    - `tawakkul` ↔ `sabr` topic-এর মধ্যে যুক্তিসঙ্গত linking
    - _Requirements: 6.4_

- [x] 13. Verification — সব tests চালান ও TypeScript check করুন
  - [x] 13.1 Property tests চালান
    - `cd smoke-free-path && npx jest __tests__/property/dataIntegrity --run`
    - সব ৮টি property test pass করতে হবে
    - _Requirements: 8.1, 8.3, 8.5, 8.7_

  - [x] 13.2 Unit tests তৈরি ও চালান (`__tests__/unit/dataEnrichment.test.ts`)
    - `social_pressure_dua` entries-এ `practicalPhrase` আছে কিনা
    - ধাপ ১–৭-এ `ramadanTip` আছে এবং ধাপ ৮+-এ নেই কিনা
    - ৪১তম milestone-এ `completionMessage` আছে কিনা
    - `milestone_dua` entries `milestones.json`-এর `duaId`-এ referenced কিনা
    - _Requirements: 3.9, 5.8, 7.4, 7.1_

  - [x] 13.3 TypeScript compilation check করুন
    - `cd smoke-free-path && npx tsc --noEmit`
    - কোনো type error থাকলে fix করুন
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 14. Final Checkpoint — সব tests pass করুন
  - সব property tests ও unit tests pass করতে হবে, TypeScript compile হতে হবে। কোনো প্রশ্ন থাকলে জিজ্ঞেস করুন।

## Notes

- প্রতিটি task specific requirements reference করে traceability নিশ্চিত করে
- Phase 2 (property tests) Phase 3+ (data changes)-এর আগে লেখা হয়েছে — TDD approach
- step_plans.json-এর tasks theme-ভিত্তিক ভাগ করা হয়েছে (৬, ৭, ৮, ৯, ১০ নম্বর tasks)
- সব নতুন field optional (`?`) — বিদ্যমান code break হবে না
