/**
 * Integration Test: Onboarding Flow State Transitions
 * Validates: Requirements 22.1
 */

import { appReducer, INITIAL_APP_STATE } from "../../context/AppContext";
import type { UserProfile } from "../../types";

const mockProfile: UserProfile = {
  id: "test-user-001",
  name: "Test User",
  cigarettesPerDay: 10,
  smokingYears: 5,
  cigarettePricePerPack: 15,
  cigarettesPerPack: 20,
  notificationsEnabled: true,
  morningNotificationTime: "08:00",
  eveningNotificationTime: "21:00",
  onboardingCompleted: true,
  createdAt: "2024-01-01T00:00:00.000Z",
};

describe("Onboarding Flow — State Transitions", () => {
  it("SET_USER_PROFILE stores the profile in state", () => {
    const state = appReducer(INITIAL_APP_STATE, {
      type: "SET_USER_PROFILE",
      payload: mockProfile,
    });

    expect(state.userProfile).not.toBeNull();
    expect(state.userProfile?.id).toBe("test-user-001");
    expect(state.userProfile?.name).toBe("Test User");
    expect(state.userProfile?.onboardingCompleted).toBe(true);
  });

  it("SET_USER_PROFILE preserves all profile fields", () => {
    const state = appReducer(INITIAL_APP_STATE, {
      type: "SET_USER_PROFILE",
      payload: mockProfile,
    });

    expect(state.userProfile?.cigarettesPerDay).toBe(10);
    expect(state.userProfile?.smokingYears).toBe(5);
    expect(state.userProfile?.cigarettePricePerPack).toBe(15);
    expect(state.userProfile?.cigarettesPerPack).toBe(20);
  });

  it("planState remains inactive after profile setup", () => {
    const state = appReducer(INITIAL_APP_STATE, {
      type: "SET_USER_PROFILE",
      payload: mockProfile,
    });

    expect(state.planState.isActive).toBe(false);
    expect(state.planState.activatedAt).toBeNull();
    expect(state.planState.currentStep).toBe(0);
  });

  it("SET_USER_PROFILE does not affect other state fields", () => {
    const state = appReducer(INITIAL_APP_STATE, {
      type: "SET_USER_PROFILE",
      payload: mockProfile,
    });

    expect(state.triggerLogs).toEqual([]);
    expect(state.cravingSessions).toEqual([]);
    expect(state.milestones).toEqual({});
    expect(state.bookmarks).toEqual([]);
  });
});
