/**
 * Integration Test: Craving Session Flow
 * Validates: Requirements 22.3
 */

import { appReducer, INITIAL_APP_STATE } from '../../context/AppContext';
import type { CravingSession, TriggerLog } from '../../types';

const mockSession: CravingSession = {
  id: 'session-001',
  startTime: '2024-06-01T10:00:00.000Z',
  endTime: '2024-06-01T10:05:00.000Z',
  intensity: 7,
  outcome: 'overcome',
  strategiesUsed: ['breathing'],
  triggerId: 'stress',
};

const mockTrigger: TriggerLog = {
  id: 'trigger-001',
  type: 'stress',
  timestamp: '2024-06-01T10:00:00.000Z',
  note: 'Work deadline pressure',
  cravingSessionId: 'session-001',
  isSlipUp: false,
};

describe('Craving Session Flow', () => {
  it('ADD_CRAVING_SESSION adds the session to cravingSessions', () => {
    const state = appReducer(INITIAL_APP_STATE, {
      type: 'ADD_CRAVING_SESSION',
      payload: mockSession,
    });

    expect(state.cravingSessions).toHaveLength(1);
    expect(state.cravingSessions[0]).toEqual(mockSession);
  });

  it('ADD_CRAVING_SESSION preserves session fields', () => {
    const state = appReducer(INITIAL_APP_STATE, {
      type: 'ADD_CRAVING_SESSION',
      payload: mockSession,
    });

    const saved = state.cravingSessions[0];
    expect(saved.id).toBe('session-001');
    expect(saved.intensity).toBe(7);
    expect(saved.outcome).toBe('overcome');
    expect(saved.triggerId).toBe('stress');
  });

  it('ADD_TRIGGER_LOG adds the trigger to triggerLogs', () => {
    const state = appReducer(INITIAL_APP_STATE, {
      type: 'ADD_TRIGGER_LOG',
      payload: mockTrigger,
    });

    expect(state.triggerLogs).toHaveLength(1);
    expect(state.triggerLogs[0]).toEqual(mockTrigger);
  });

  it('ADD_TRIGGER_LOG preserves trigger fields', () => {
    const state = appReducer(INITIAL_APP_STATE, {
      type: 'ADD_TRIGGER_LOG',
      payload: mockTrigger,
    });

    const saved = state.triggerLogs[0];
    expect(saved.id).toBe('trigger-001');
    expect(saved.type).toBe('stress');
    expect(saved.cravingSessionId).toBe('session-001');
    expect(saved.isSlipUp).toBe(false);
  });

  it('session and trigger can be added together in sequence', () => {
    let state = appReducer(INITIAL_APP_STATE, {
      type: 'ADD_CRAVING_SESSION',
      payload: mockSession,
    });
    state = appReducer(state, {
      type: 'ADD_TRIGGER_LOG',
      payload: mockTrigger,
    });

    expect(state.cravingSessions).toHaveLength(1);
    expect(state.triggerLogs).toHaveLength(1);
    expect(state.cravingSessions[0].id).toBe('session-001');
    expect(state.triggerLogs[0].cravingSessionId).toBe('session-001');
  });

  it('multiple sessions accumulate correctly', () => {
    const session2: CravingSession = { ...mockSession, id: 'session-002' };

    let state = appReducer(INITIAL_APP_STATE, {
      type: 'ADD_CRAVING_SESSION',
      payload: mockSession,
    });
    state = appReducer(state, {
      type: 'ADD_CRAVING_SESSION',
      payload: session2,
    });

    expect(state.cravingSessions).toHaveLength(2);
  });
});
