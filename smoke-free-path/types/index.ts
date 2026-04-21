import type {
  TriggerType,
  CravingStrategy,
  CravingOutcome,
  ContentType,
  LibraryTopic,
  DuaCategory,
  ChecklistItemType,
  SlipUpDecision,
  StepStatus,
  PlanStatus,
} from "./enums";

export type {
  TriggerType,
  CravingStrategy,
  CravingOutcome,
  ContentType,
  LibraryTopic,
  DuaCategory,
  ChecklistItemType,
  SlipUpDecision,
  StepStatus,
  PlanStatus,
} from "./enums";

// ─── User Profile ────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string; // UUID
  name: string; // ব্যবহারকারীর নাম
  cigarettesPerDay: number; // দৈনিক গড় সিগারেট সংখ্যা
  smokingYears: number; // ধূমপানের বছর
  cigarettePricePerPack: number; // প্রতি প্যাকের মূল্য (টাকা), default: 300
  cigarettesPerPack: number; // প্যাকে সিগারেট সংখ্যা, default: 20
  notificationsEnabled: boolean;
  morningNotificationTime: string; // "HH:MM", default: "08:00"
  eveningNotificationTime: string; // "HH:MM", default: "21:00"
  onboardingCompleted: boolean;
  createdAt: string; // ISO datetime
}

// ─── Plan State ───────────────────────────────────────────────────────────────

export interface PlanState {
  isActive: boolean;
  activatedAt: string | null;
  currentStep: number; // 0 = not started, 1-41 = active
  completedSteps: number[];
  lastCompletedAt: string | null;
  totalResets: number;
  lastSlipUpAt: string | null;
}

// ─── Step Plan ────────────────────────────────────────────────────────────────

export interface ChecklistItem {
  id: string;
  text: string; // বাংলা কাজের বিবরণ
  type: ChecklistItemType;
}

export interface StepPlan {
  step: number; // 1–41
  title: string; // বাংলা শিরোনাম
  theme: string; // ধাপের থিম (যেমন: "তাওয়াক্কুল")
  affirmation: string; // ধাপের নিশ্চিতকরণ বাক্য
  checklistItems: ChecklistItem[];
  islamicContentId: string; // সংযুক্ত IslamicContent এর ID
  tips: string[]; // ব্যবহারিক পরামর্শ (কমপক্ষে ৫টি)
  islamicInsight?: string; // থিমের গভীর ইসলামিক ব্যাখ্যা (৩-৫ বাক্য, সহজ বাংলায়)
  reflection_prompt?: string; // আত্মচিন্তার প্রশ্ন — সহজ ভাষায়
  hadith?: {
    // থিম-প্রাসঙ্গিক হাদিস
    arabicText: string;
    banglaTranslation: string;
    source: string;
  };
  familyMotivation?: string; // পরিবারকে সম্পৃক্ত করার নির্দিষ্ট কাজ
  moneySavedContext?: string; // সাশ্রয়কৃত অর্থের emotional context
  ramadanTip?: string; // শুধু ধাপ ১–৭: রমজানে রোজার সাথে সংযোগ
}

export interface StepProgress {
  step: number;
  completedItems: string[]; // ChecklistItem IDs
  isComplete: boolean;
  completedAt: string | null; // ISO datetime
  startedAt: string | null; // ISO datetime — কখন এই ধাপ শুরু হয়েছে
}

// ─── Trigger Log ──────────────────────────────────────────────────────────────

export interface TriggerLog {
  id: string; // UUID
  type: TriggerType;
  timestamp: string; // ISO datetime
  note: string | null; // ঐচ্ছিক নোট
  cravingSessionId: string | null; // সংযুক্ত CravingSession (যদি থাকে)
  isSlipUp: boolean; // স্লিপ-আপের সাথে সম্পর্কিত কিনা
}

// ─── Craving Session ──────────────────────────────────────────────────────────

export interface CravingSession {
  id: string; // UUID
  startTime: string; // ISO datetime
  endTime: string | null;
  intensity: number; // 1–10
  outcome: CravingOutcome | null;
  strategiesUsed: CravingStrategy[];
  triggerId: TriggerType | null;
}

// ─── Islamic Content ──────────────────────────────────────────────────────────

export interface IslamicContent {
  id: string;
  type: ContentType;
  arabicText: string; // আরবি টেক্সট (RTL)
  banglaTransliteration: string; // বাংলা উচ্চারণ
  banglaTranslation: string; // বাংলা অনুবাদ/অর্থ
  source: string; // যেমন: "সূরা বাকারা, আয়াত ২৮৬"
  topic: LibraryTopic;
  duaCategory: DuaCategory | null;
  stepAssignment: number | null; // কোন ধাপের জন্য (1–41), null = general
  relatedContentIds: string[];
  practicalPhrase?: string; // শুধু social_pressure_dua: বাস্তবে বলার বাংলা বাক্য
}

// ─── Milestone ────────────────────────────────────────────────────────────────

export interface Milestone {
  steps: number; // 1, 3, 7, 14, 21, 30, 41
  titleBangla: string;
  islamicMessage: string; // ইসলামিক অভিনন্দন বার্তা
  islamicContentId: string; // প্রাসঙ্গিক আয়াত/হাদিস
  healthBenefit: string; // স্বাস্থ্যগত উন্নতির বিবরণ
  achievedAt: string | null; // ISO datetime (null = not yet achieved)
  duaId?: string; // duas.json-এর milestone_dua category-র ID
  nextMilestoneMotivation?: string; // পরবর্তী মাইলস্টোনের দিকে উৎসাহমূলক বার্তা
  achievementBadge?: string; // emoji badge (যেমন: "🌱", "⭐", "👑")
  completionMessage?: string; // শুধু ৪১তম ধাপে: পুরো যাত্রা সম্পন্নের বিশেষ বার্তা
}

// ─── Slip-Up ──────────────────────────────────────────────────────────────────

export interface SlipUp {
  id: string;
  reportedAt: string; // ISO datetime
  triggerId: TriggerType | null;
  decision: SlipUpDecision;
  trackerStep: number; // কোন ধাপে স্লিপ-আপ হয়েছে
  cigarettesSmoked?: number; // স্লিপ-আপে খাওয়া সিগারেটের সংখ্যা
}

// ─── App State ────────────────────────────────────────────────────────────────

export interface AppState {
  userProfile: UserProfile | null;
  planState: PlanState;
  stepProgress: Record<number, StepProgress>; // key: step number
  triggerLogs: TriggerLog[];
  cravingSessions: CravingSession[];
  slipUps: SlipUp[];
  bookmarks: string[]; // IslamicContent IDs
  milestones: Record<number, string>; // key: days, value: achievedAt datetime
  lastOpenedAt: string; // ISO datetime
  // ─── v2 নতুন fields ───────────────────────────────────────
  dailyStreak: number; // ধারাবাহিক দৈনিক app open count, default: 0
  lastStreakDate: string | null; // ISO date 'YYYY-MM-DD', শেষ streak count-এর তারিখ, default: null
}

// ─── Health Timeline ──────────────────────────────────────────────────────────

export interface HealthTimelineEntry {
  timeLabel: string; // বাংলায় সময় লেবেল (যেমন: "২০ মিনিট", "১ সপ্তাহ")
  timeMinutes: number; // মিনিটে সময় (ascending order-এ)
  benefit: string; // বাংলায় স্বাস্থ্য উপকারিতা
  icon: string; // ইমোজি আইকন
  islamicNote?: string; // সংক্ষিপ্ত ইসলামিক দৃষ্টিভঙ্গি (১-২ বাক্য)
  withdrawalNote?: string; // সহজ বাংলায় withdrawal symptoms — medical terminology ছাড়া
  encouragement?: string; // উৎসাহমূলক একটি বাক্য
}
// ─── Computed / Derived Types ─────────────────────────────────────────────────

export interface ProgressStats {
  smokeFreeDays: number; // মোট ধূমপান-মুক্ত দিন
  totalSmokeFreeDays: number; // স্লিপ-আপ সহ মোট দিন (activatedAt থেকে)
  streakSavedCigarettes: number; // বর্তমান স্ট্রিকে বাঁচানো সিগারেটের সংখ্যা
  streakSavedMoney: number; // বর্তমান স্ট্রিকে বাঁচানো অর্থ (টাকা)
  totalSavedCigarettes: number; // মোট বাঁচানো সিগারেটের সংখ্যা
  totalSavedMoney: number; // মোট বাঁচানো অর্থ (টাকা)
}

export interface WeeklyTriggerSummary {
  topTrigger: TriggerType; // সবচেয়ে বেশি ঘটা ট্রিগার
  count: number; // সেই ট্রিগারের সংখ্যা
  logs: TriggerLog[]; // সেই সপ্তাহের সব ট্রিগার লগ
}
