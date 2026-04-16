/**
 * Integration Test: Milestone Achievement Flow
 * Validates: Requirements 22.4
 */

import { appReducer, INITIAL_APP_STATE } from '../../context/AppContext';

const QUIT_DATE = '2024-06-01T08:00:00.000Z';
const ACHIEVED_AT = '2024-06-02T10:00:00.000Z';

// Helper: build an active plan state
function withActivePlan() {
  return appReducer(INITIAL_APP_STATE, {
    type: 'ACTIVATE_PLAN_WITH_DATE',
    payload: QUIT_DATE,
  });
}

describe('Milestone Achievement Flow', () => {
  it('starts with an active plan at step 1', () => {
    const state = withActivePlan();
    expect(state.planState.isActive).toBe(true);
    expect(state.planState.currentStep).toBe(1);
    expect(state.planState.completedSteps).toEqual([]);
  });

  it('COMPLETE_STEP for step 1 adds it to completedSteps', () => {
    let state = withActivePlan();
    state = appReducer(state, { type: 'COMPLETE_STEP', payload: 1 });

    expect(state.planState.completedSteps).toContain(1);
  });

  it('COMPLETE_STEP for step 1 advances currentStep to 2', () => {
    let state = withActivePlan();
    state = appReducer(state, { type: 'COMPLETE_STEP', payload: 1 });

    expect(state.planState.currentStep).toBe(2);
  });

  it('ACHIEVE_MILESTONE records the achievement in milestones', () => {
    let state = withActivePlan();
    state = appReducer(state, { type: 'COMPLETE_STEP', payload: 1 });
    state = appReducer(state, {
      type: 'ACHIEVE_MILESTONE',
      payload: { steps: 1, achievedAt: ACHIEVED_AT },
    });

    expect(state.milestones[1]).toBe(ACHIEVED_AT);
  });

  it('milestones record uses steps count as key', () => {
    let state = withActivePlan();
    state = appReducer(state, { type: 'COMPLETE_STEP', payload: 1 });
    state = appReducer(state, {
      type: 'ACHIEVE_MILESTONE',
      payload: { steps: 1, achievedAt: ACHIEVED_AT },
    });

    expect(Object.keys(state.milestones)).toContain('1');
  });

  it('COMPLETE_STEP is idempotent — completing same step twice has no effect', () => {
    let state = withActivePlan();
    state = appReducer(state, { type: 'COMPLETE_STEP', payload: 1 });
    const afterFirst = state;
    state = appReducer(state, { type: 'COMPLETE_STEP', payload: 1 });

    expect(state.planState.completedSteps).toEqual(afterFirst.planState.completedSteps);
    expect(state.planState.currentStep).toBe(afterFirst.planState.currentStep);
  });

  it('COMPLETE_STEP does not work when plan is inactive', () => {
    const state = appReducer(INITIAL_APP_STATE, { type: 'COMPLETE_STEP', payload: 1 });

    expect(state.planState.completedSteps).toEqual([]);
  });
});
