// Trigger types for craving/smoking urge causes
export type TriggerType =
  | 'stress'          // মানসিক চাপ
  | 'social'          // সামাজিক পরিস্থিতি
  | 'boredom'         // একঘেয়েমি
  | 'environmental'   // পরিবেশগত সংকেত
  | 'habitual';       // অভ্যাসগত

// Strategies used during a craving session
export type CravingStrategy =
  | 'breathing'       // গভীর শ্বাস-প্রশ্বাস
  | 'dhikr'           // জিকির
  | 'dua'             // দোয়া
  | 'activity'        // বিকল্প কার্যকলাপ
  | 'grounding'       // গ্রাউন্ডিং
  | 'countdown';      // কাউন্টডাউন টাইমার

// Outcome of a craving session
export type CravingOutcome = 'overcome' | 'slipped' | 'abandoned';

// Type of Islamic content
export type ContentType = 'ayah' | 'hadith' | 'dua' | 'dhikr';

// Topic categories for the Islamic library
export type LibraryTopic = 'tawakkul' | 'sabr' | 'tawbah' | 'health' | 'self_control';

// Dua/Adhkar categories
export type DuaCategory =
  | 'morning_adhkar'
  | 'evening_adhkar'
  | 'craving_dua'
  | 'tawbah_dua'
  | 'shukr_dua'
  | 'milestone_dua'        // মাইলস্টোন অর্জনের কৃতজ্ঞতার দোয়া
  | 'slip_up_dua'          // স্লিপ-আপের পর তাওবা ও পুনরুদ্ধারের দোয়া
  | 'social_pressure_dua'  // সামাজিক চাপের মুহূর্তে (বন্ধু সিগারেট দিলে)
  | 'family_dua'           // পরিবারের সুস্বাস্থ্য ও কল্যাণের দোয়া
  | 'night_craving_dua'    // রাতের একাকীত্বে ক্র্যাভিং মোকাবেলার দোয়া
  | 'ramadan_dua';         // রমজানে ধূমপান ত্যাগের নিয়ত শক্তিশালী করার দোয়া

// Notification types
export type NotificationType =
  | 'morning_inspiration'   // সকাল ৮টা — দৈনিক IslamicContent
  | 'evening_progress'      // রাত ৯টা — দিনের অগ্রগতি সারসংক্ষেপ
  | 'milestone'             // মাইলস্টোন অর্জনে
  | 're_engagement';        // ৩ দিন অ্যাপ না খুললে

// Step checklist item types
export type ChecklistItemType = 'prayer' | 'dhikr' | 'activity' | 'reflection';

// Decision after a slip-up
export type SlipUpDecision = 'continue' | 'reset_plan';

// Status of a step in the plan
export type StepStatus = 'complete' | 'incomplete' | 'future';

// Status of a plan
export type PlanStatus = 'inactive' | 'active' | 'completed';
