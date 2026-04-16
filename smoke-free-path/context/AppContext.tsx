import React, {
  createContext,
  useContext,
  useReducer,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { AppState as RNAppState } from 'react-native';
import type {
  AppState,
  UserProfile,
  TriggerLog,
  CravingSession,
  SlipUp,
  PlanState,
  StepProgress,
} from '@/types';
import { loadAppState, saveAppState, clearOldTriggerLogs } from '@/services/StorageService';
import { scheduleReEngagementNotification } from '@/services/NotificationService';

// ─── Initial State ────────────────────────────────────────────────────────────

export const INITIAL_PLAN_STATE: PlanState = {
  isActive: false,
  activatedAt: null,
  currentStep: 0,
  completedSteps: [],
  lastCompletedAt: null,
  totalResets: 0,
  lastSlipUpAt: null,
};

export const INITIAL_APP_STATE: AppState = {
  userProfile: null,
  planState: INITIAL_PLAN_STATE,
  stepProgress: {},
  triggerLogs: [],
  cravingSessions: [],
  slipUps: [],
  bookmarks: [],
  milestones: {},
  lastOpenedAt: '',
  dailyStreak: 0,
  lastStreakDate: null,
};

// ─── Action Types ─────────────────────────────────────────────────────────────

export type AppAction =
  | { type: 'SET_USER_PROFILE'; payload: UserProfile }
  | { type: 'ACTIVATE_PLAN' }
  | { type: 'ACTIVATE_PLAN_WITH_DATE'; payload: string } // ISO datetime — quit date from onboarding
  | { type: 'RESET_PLAN' }
  | { type: 'COMPLETE_STEP'; payload: number }
  | { type: 'TOGGLE_CHECKLIST_ITEM'; payload: { step: number; itemId: string } }
  | { type: 'ADD_TRIGGER_LOG'; payload: TriggerLog }
  | { type: 'ADD_CRAVING_SESSION'; payload: CravingSession }
  | { type: 'RECORD_SLIP_UP'; payload: SlipUp }
  | { type: 'ACHIEVE_MILESTONE'; payload: { steps: number; achievedAt: string } }
  | { type: 'TOGGLE_BOOKMARK'; payload: string }
  | { type: 'UPDATE_LAST_OPENED'; payload: string }
  | { type: 'HYDRATE'; payload: AppState }
  | { type: 'CLEANUP_OLD_DATA'; payload: Pick<AppState, 'triggerLogs' | 'cravingSessions' | 'slipUps'> };

// ─── Migration ────────────────────────────────────────────────────────────────

function migrateAppState(raw: any): AppState {
  // ─── dailyProgress → stepProgress migration ───────────────
  const stepProgress: Record<number, StepProgress> = {};
  if (raw.dailyProgress && !raw.stepProgress) {
    for (const [key, val] of Object.entries(raw.dailyProgress)) {
      const old = val as Record<string, unknown>;
      stepProgress[Number(key)] = {
        step: (old.day as number) ?? Number(key),
        completedItems: (old.completedItems as string[]) ?? [],
        isComplete: (old.isComplete as boolean) ?? false,
        completedAt: (old.completedAt as string | null) ?? null,
        startedAt: null,
      };
    }
  }

  // ─── quitDate → planActivatedAt migration ─────────────────
  let planState: PlanState = raw.planState ?? INITIAL_PLAN_STATE;
  if (!raw.planState && raw.userProfile?.quitDate) {
    const completedStepsFromOld = Object.entries(
      raw.stepProgress ?? stepProgress
    )
      .filter(([, v]: [string, any]) => v.isComplete)
      .map(([k]) => Number(k));
    planState = {
      isActive: true,
      activatedAt: new Date(raw.userProfile.quitDate).toISOString(),
      currentStep:
        completedStepsFromOld.length > 0
          ? Math.min(Math.max(...completedStepsFromOld) + 1, 41)
          : 1,
      completedSteps: completedStepsFromOld,
      lastCompletedAt: null,
      totalResets: 0,
      lastSlipUpAt: raw.planState?.lastSlipUpAt ?? null,
    };
  }

  // ─── Remove quitDate from userProfile ─────────────────────
  let userProfile = raw.userProfile ?? null;
  if (userProfile && 'quitDate' in userProfile) {
    const { quitDate, ...rest } = userProfile;
    userProfile = rest;
  }

  // ─── Fix old incorrect cigarettePricePerPack default ──────
  // Migration: Update old default value of 15 to realistic 300
  if (userProfile && userProfile.cigarettePricePerPack === 15) {
    userProfile = {
      ...userProfile,
      cigarettePricePerPack: 300, // Realistic Bangladesh market price
    };
  }

  const rawCompletedSteps = Array.isArray(planState.completedSteps)
    ? planState.completedSteps
    : [];
  const validCompletedSteps = rawCompletedSteps.filter(
    (step) => typeof step === 'number' && !isNaN(step) && step >= 1 && step <= 41
  );

  return {
    userProfile,
    planState: {
      ...planState,
      completedSteps: Array.from(new Set(validCompletedSteps)),
    },
    stepProgress: raw.stepProgress ?? stepProgress,
    triggerLogs: raw.triggerLogs ?? [],
    cravingSessions: raw.cravingSessions ?? [],
    slipUps: raw.slipUps ?? [],
    bookmarks: raw.bookmarks ?? [],
    milestones: raw.milestones ?? {},
    lastOpenedAt: raw.lastOpenedAt ?? '',
    dailyStreak: raw.dailyStreak ?? 0,
    lastStreakDate: raw.lastStreakDate ?? null,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER_PROFILE':
      return { ...state, userProfile: action.payload };

    case 'ACTIVATE_PLAN': {
      if (state.planState.isActive) return state; // idempotent
      return {
        ...state,
        planState: {
          ...state.planState,
          isActive: true,
          activatedAt: new Date().toISOString(),
          currentStep: 1,
        },
      };
    }

    case 'ACTIVATE_PLAN_WITH_DATE': {
      if (state.planState.isActive) return state; // idempotent
      return {
        ...state,
        planState: {
          ...state.planState,
          isActive: true,
          activatedAt: action.payload,
          currentStep: 1,
        },
      };
    }

    case 'RESET_PLAN': {
      return {
        ...state,
        planState: {
          ...INITIAL_PLAN_STATE,
          totalResets: state.planState.totalResets + 1,
        },
        stepProgress: {},
        milestones: {},
        // triggerLogs and cravingSessions preserved
      };
    }

    case 'COMPLETE_STEP': {
      const step = action.payload;
      if (step < 1 || step > 41) return state;
      if (!state.planState.isActive) return state;
      const alreadyCompleted = state.planState.completedSteps.includes(step);
      if (alreadyCompleted) return state; // idempotent
      const now = new Date().toISOString();
      const isJourneyComplete = step === 41;
      
      const newCompletedSteps = Array.from(new Set([...state.planState.completedSteps, step]));
      const nextStep = isJourneyComplete ? 41 : Math.max(state.planState.currentStep, step + 1);
      
      return {
        ...state,
        planState: {
          ...state.planState,
          currentStep: nextStep,
          isActive: true, // Always keep true to allow revisiting steps
          completedSteps: newCompletedSteps,
          lastCompletedAt: now,
        },
        stepProgress: {
          ...state.stepProgress,
          [step]: {
            ...state.stepProgress[step],
            step,
            isComplete: true,
            completedAt: now,
            completedItems: state.stepProgress[step]?.completedItems ?? [],
            startedAt: state.stepProgress[step]?.startedAt ?? now,
          },
        },
      };
    }

    case 'TOGGLE_CHECKLIST_ITEM': {
      const { step, itemId } = action.payload;
      const existing = state.stepProgress[step] ?? {
        step,
        completedItems: [],
        isComplete: false,
        completedAt: null,
        startedAt: new Date().toISOString(),
      };
      const alreadyDone = existing.completedItems.includes(itemId);
      const completedItems = alreadyDone
        ? existing.completedItems.filter((id) => id !== itemId)
        : [...existing.completedItems, itemId];
      return {
        ...state,
        stepProgress: {
          ...state.stepProgress,
          [step]: { ...existing, completedItems },
        },
      };
    }

    case 'ADD_TRIGGER_LOG':
      return { ...state, triggerLogs: [...state.triggerLogs, action.payload] };

    case 'ADD_CRAVING_SESSION':
      return {
        ...state,
        cravingSessions: [...state.cravingSessions, action.payload],
      };

    case 'RECORD_SLIP_UP':
      return { 
        ...state, 
        slipUps: [...state.slipUps, action.payload],
        planState: {
          ...state.planState,
          lastSlipUpAt: action.payload.reportedAt
        }
      };

    case 'ACHIEVE_MILESTONE': {
      const { steps, achievedAt } = action.payload;
      return {
        ...state,
        milestones: { ...state.milestones, [steps]: achievedAt },
      };
    }

    case 'TOGGLE_BOOKMARK': {
      const contentId = action.payload;
      const isBookmarked = state.bookmarks.includes(contentId);
      const bookmarks = isBookmarked
        ? state.bookmarks.filter((id) => id !== contentId)
        : [...state.bookmarks, contentId];
      return { ...state, bookmarks };
    }

    case 'UPDATE_LAST_OPENED': {
      // Get local date carefully to avoid UTC timezone issues
      const d = action.payload ? new Date(action.payload) : new Date();
      const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const last = state.lastStreakDate;

      let dailyStreak = state.dailyStreak;
      let lastStreakDate = state.lastStreakDate;

      if (last === null) {
        // First time — start streak
        dailyStreak = 1;
        lastStreakDate = today;
      } else if (last === today) {
        // Already counted today — idempotent
        // no change
      } else {
        const [lastYear, lastMonth, lastDay] = last.split('-').map(Number);
        const [todayYear, todayMonth, todayDay] = today.split('-').map(Number);
        const lastDateUtc = Date.UTC(lastYear, lastMonth - 1, lastDay);
        const todayDateUtc = Date.UTC(todayYear, todayMonth - 1, todayDay);
        const diffDays = Math.floor(
          (todayDateUtc - lastDateUtc) / (24 * 60 * 60 * 1000)
        );

        if (diffDays === 1) {
          // Consecutive day — increment streak
          dailyStreak = dailyStreak + 1;
        } else {
          // Gap — reset streak
          dailyStreak = 1;
        }
        lastStreakDate = today;
      }

      return { ...state, lastOpenedAt: action.payload, dailyStreak, lastStreakDate };
    }

    case 'HYDRATE':
      try {
        return migrateAppState(action.payload);
      } catch (error) {
        console.error('State migration failed:', error);
        return state;
      }

    case 'CLEANUP_OLD_DATA':
      return {
        ...state,
        triggerLogs: action.payload.triggerLogs,
        cravingSessions: action.payload.cravingSessions,
        slipUps: action.payload.slipUps,
      };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  hydrated: boolean;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, INITIAL_APP_STATE);
  const [hydrated, setHydrated] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef<AppState>(state);

  // Keep stateRef in sync with latest state to avoid stale closures
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // AppState lifecycle: flush on background, refresh on active
  useEffect(() => {
    const subscription = RNAppState.addEventListener('change', (nextState) => {
      if (nextState === 'background' || nextState === 'inactive') {
        // Immediate flush — cancel pending debounce and save now
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveAppState(stateRef.current);
      } else if (nextState === 'active') {
        dispatch({ type: 'UPDATE_LAST_OPENED', payload: new Date().toISOString() });
        scheduleReEngagementNotification();
        // Cleanup old data
        const cleaned = clearOldTriggerLogs(stateRef.current, 90);
        if (cleaned !== stateRef.current) {
          dispatch({
            type: 'CLEANUP_OLD_DATA',
            payload: {
              triggerLogs: cleaned.triggerLogs,
              cravingSessions: cleaned.cravingSessions,
              slipUps: cleaned.slipUps,
            },
          });
        }
      }
    });
    return () => subscription.remove();
  }, []);

  // Load persisted state on mount — Promise-based, sets hydrated exactly once
  useEffect(() => {
    loadAppState()
      .then((saved) => {
        if (saved) dispatch({ type: 'HYDRATE', payload: saved });
        dispatch({ type: 'UPDATE_LAST_OPENED', payload: new Date().toISOString() });
      })
      .catch(() => {
        // Error → treat as new user
      })
      .finally(() => {
        setHydrated(true); // exactly once
      });
  }, []);

  // Persist state with debounce (300ms) to avoid excessive AsyncStorage writes
  const saveFailureCountRef = useRef(0);
  useEffect(() => {
    if (state === INITIAL_APP_STATE) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const success = await saveAppState(state);
      if (success) {
        saveFailureCountRef.current = 0;
      } else {
        saveFailureCountRef.current += 1;
        if (saveFailureCountRef.current >= 3) {
          if (RNAppState.currentState === 'active') {
            const { Alert } = require('react-native');
            Alert.alert(
              'সতর্কতা',
              'আপনার অগ্রগতি সংরক্ষণ করতে সমস্যা হচ্ছে। ডিভাইসের স্টোরেজ পরীক্ষা করুন।',
            );
          }
          saveFailureCountRef.current = 0; // reset to avoid repeated alerts
        }
      }
    }, 300);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch, hydrated }}>
      {children}
    </AppContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return ctx;
}
