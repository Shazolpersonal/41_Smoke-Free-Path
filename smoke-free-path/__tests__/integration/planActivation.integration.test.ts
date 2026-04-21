/**
 * Integration Test: Plan Activation Flow
 * Validates: Requirements 22.2
 */

import { appReducer, INITIAL_APP_STATE } from "../../context/AppContext";

const QUIT_DATE = "2024-06-01T08:00:00.000Z";

describe("Plan Activation Flow", () => {
  it("starts with an inactive plan", () => {
    expect(INITIAL_APP_STATE.planState.isActive).toBe(false);
    expect(INITIAL_APP_STATE.planState.activatedAt).toBeNull();
    expect(INITIAL_APP_STATE.planState.currentStep).toBe(0);
  });

  it("ACTIVATE_PLAN_WITH_DATE sets isActive to true", () => {
    const state = appReducer(INITIAL_APP_STATE, {
      type: "ACTIVATE_PLAN_WITH_DATE",
      payload: QUIT_DATE,
    });

    expect(state.planState.isActive).toBe(true);
  });

  it("ACTIVATE_PLAN_WITH_DATE stores the provided date as activatedAt", () => {
    const state = appReducer(INITIAL_APP_STATE, {
      type: "ACTIVATE_PLAN_WITH_DATE",
      payload: QUIT_DATE,
    });

    expect(state.planState.activatedAt).toBe(QUIT_DATE);
  });

  it("ACTIVATE_PLAN_WITH_DATE sets currentStep to 1", () => {
    const state = appReducer(INITIAL_APP_STATE, {
      type: "ACTIVATE_PLAN_WITH_DATE",
      payload: QUIT_DATE,
    });

    expect(state.planState.currentStep).toBe(1);
  });

  it("ACTIVATE_PLAN_WITH_DATE is idempotent — second dispatch has no effect", () => {
    const afterFirst = appReducer(INITIAL_APP_STATE, {
      type: "ACTIVATE_PLAN_WITH_DATE",
      payload: QUIT_DATE,
    });

    const afterSecond = appReducer(afterFirst, {
      type: "ACTIVATE_PLAN_WITH_DATE",
      payload: "2025-01-01T00:00:00.000Z",
    });

    // Second dispatch should not change the already-active plan
    expect(afterSecond.planState.activatedAt).toBe(QUIT_DATE);
    expect(afterSecond.planState.currentStep).toBe(1);
  });

  it("ACTIVATE_PLAN_WITH_DATE does not affect other state fields", () => {
    const state = appReducer(INITIAL_APP_STATE, {
      type: "ACTIVATE_PLAN_WITH_DATE",
      payload: QUIT_DATE,
    });

    expect(state.triggerLogs).toEqual([]);
    expect(state.cravingSessions).toEqual([]);
    expect(state.planState.completedSteps).toEqual([]);
  });
});
