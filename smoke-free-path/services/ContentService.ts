import type {
  StepPlan,
  IslamicContent,
  Milestone,
  HealthTimelineEntry,
  DuaCategory,
  LibraryTopic,
  TriggerType,
} from '@/types';

// ─── Module-level cache variables ─────────────────────────────────────────────

let _stepPlans: StepPlan[] | null = null;
let _islamicContent: IslamicContent[] | null = null;
let _duas: IslamicContent[] | null = null;
let _contentMap: Map<string, IslamicContent> | null = null;
let _milestones: Milestone[] | null = null;
let _healthTimeline: HealthTimelineEntry[] | null = null;

// ─── Lazy loaders ─────────────────────────────────────────────────────────────

function getStepPlans(): StepPlan[] {
  if (_stepPlans === null) {
    try {
      _stepPlans = require('../assets/data/step_plans.json');
    } catch (e) {
      return [];
    }
  }
  return _stepPlans!;
}

function getIslamicContentData(): IslamicContent[] {
  if (_islamicContent === null) {
    try {
      _islamicContent = require('../assets/data/islamic_content.json');
    } catch (e) {
      return [];
    }
  }
  return _islamicContent!;
}

function getDuasData(): IslamicContent[] {
  if (_duas === null) {
    try {
      _duas = require('../assets/data/duas.json');
    } catch (e) {
      return [];
    }
  }
  return _duas!;
}

function getMilestonesData(): Milestone[] {
  if (_milestones === null) {
    try {
      _milestones = require('../assets/data/milestones.json');
    } catch (e) {
      return [];
    }
  }
  return _milestones!;
}

function getHealthTimelineData(): HealthTimelineEntry[] {
  if (_healthTimeline === null) {
    try {
      _healthTimeline = require('../assets/data/health_timeline.json');
    } catch (e) {
      return [];
    }
  }
  return _healthTimeline!;
}

function getContentMap(): Map<string, IslamicContent> {
  if (_contentMap === null) {
    _contentMap = new Map();
    getIslamicContentData().forEach((c) => _contentMap!.set(c.id, c));
    getDuasData().forEach((d) => _contentMap!.set(d.id, d));
  }
  return _contentMap!;
}

// ─── Step Plans ───────────────────────────────────────────────────────────────

export function getStepPlan(step: number): StepPlan | null {
  return getStepPlans().find((p) => p.step === step) ?? null;
}

// ─── Islamic Content ──────────────────────────────────────────────────────────

/** Returns the IslamicContent assigned to a specific step (stepAssignment). */
export function getStepContent(step: number): IslamicContent | null {
  return getIslamicContentData().find((c) => c.stepAssignment === step) ?? null;
}

export function getDuasByCategory(category: DuaCategory): IslamicContent[] {
  return getDuasData().filter((d) => d.duaCategory === category);
}

export function getLibraryByTopic(topic: LibraryTopic): IslamicContent[] {
  return getIslamicContentData().filter((c) => c.topic === topic);
}

export function getAllIslamicContent(): IslamicContent[] {
  return getIslamicContentData();
}

export function getIslamicContentById(id: string): IslamicContent | null {
  return getContentMap().get(id) ?? null;
}

export function getRelatedContent(contentId: string): IslamicContent[] {
  const item = getContentMap().get(contentId);
  if (!item || item.relatedContentIds.length === 0) return [];
  return item.relatedContentIds
    .map((id) => getContentMap().get(id))
    .filter((c): c is IslamicContent => c !== undefined);
}

// ─── Milestones ───────────────────────────────────────────────────────────────

export function getMilestoneContent(steps: number): Milestone | null {
  return getMilestonesData().find((m) => m.steps === steps) ?? null;
}

// ─── Health Timeline ──────────────────────────────────────────────────────────

export function getHealthTimeline(): HealthTimelineEntry[] {
  return getHealthTimelineData();
}

// ─── Trigger Coping Strategies ────────────────────────────────────────────────

const TRIGGER_COPING_STRATEGIES: Record<TriggerType, string[]> = {
  stress: [
    'আস্তাগফিরুল্লাহ পড়ুন এবং গভীর শ্বাস নিন — আল্লাহ বলেন: "নিশ্চয়ই কষ্টের সাথে স্বস্তি আছে।" (সূরা ইনশিরাহ)',
    'দুই রাকাত নফল নামাজ পড়ুন — নামাজ মানসিক চাপ কমানোর সর্বোত্তম উপায়।',
    '"লা হাওলা ওয়ালা কুওয়াতা ইল্লা বিল্লাহ" ১০ বার পড়ুন — এটি কঠিন পরিস্থিতিতে শক্তি দেয়।',
  ],
  social: [
    'সঙ্গীদের আপনার সিদ্ধান্তের কথা জানান এবং সাহায্য চান — "তোমরা সৎকাজে একে অপরকে সাহায্য করো।" (সূরা মায়িদা)',
    'ধূমপানের পরিবেশ থেকে সরে গিয়ে অজু করুন এবং দোয়া পড়ুন।',
    '"রাব্বি ইন্নি মাগলুবুন ফানতাসির" পড়ুন — আল্লাহর কাছে সাহায্য চান।',
  ],
  boredom: [
    'কুরআন তিলাওয়াত করুন — এটি মন ও আত্মাকে প্রশান্ত করে এবং সময় কাটানোর সর্বোত্তম উপায়।',
    'তাসবিহ পড়ুন: সুবহানাল্লাহ, আলহামদুলিল্লাহ, আল্লাহু আকবার — প্রতিটি ১০০ বার।',
    'হাঁটতে বের হন এবং আল্লাহর সৃষ্টি নিয়ে চিন্তা করুন — এটি একঘেয়েমি দূর করে।',
  ],
  environmental: [
    'পরিবেশ পরিবর্তন করুন — অন্য ঘরে যান বা বাইরে বের হন এবং "বিসমিল্লাহ" বলুন।',
    'অজু করুন — পানির স্পর্শ মন শান্ত করে এবং ধূমপানের ইচ্ছা কমায়।',
    '"আউজু বিল্লাহি মিনাশ শাইতানির রাজিম" পড়ুন — শয়তানের প্ররোচনা থেকে আল্লাহর আশ্রয় নিন।',
  ],
  habitual: [
    'অভ্যাসের সময়টিতে বিকল্প ইবাদত করুন — যেমন ফজরের পর কুরআন পড়া বা যিকির করা।',
    'নিয়ত নবায়ন করুন: "আমি আল্লাহর সন্তুষ্টির জন্য এই অভ্যাস ত্যাগ করছি।"',
    '"ইন্নামাল আ\'মালু বিন্নিয়্যাত" — নিয়তের শক্তি দিয়ে পুরনো অভ্যাস ভাঙুন।',
  ],
};

export function getTriggerCopingStrategies(triggerType: TriggerType): string[] {
  return TRIGGER_COPING_STRATEGIES[triggerType] ?? [];
}
