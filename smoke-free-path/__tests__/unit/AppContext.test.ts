import { appReducer, INITIAL_APP_STATE } from '../../context/AppContext';
import { AppState } from '../../types';

describe('AppContext Reducer', () => {
  it('should clean up old data on CLEANUP_OLD_DATA', () => {
    const initialState: AppState = {
      ...INITIAL_APP_STATE,
      triggerLogs: [{ id: '1', type: 'STRESS', timestamp: 'old', note: null, cravingSessionId: null, isSlipUp: false }],
      cravingSessions: [{ id: '1', startTime: 'old', endTime: null, intensity: 5, outcome: null, strategiesUsed: [], triggerId: null }],
      slipUps: [{ id: '1', reportedAt: 'old', triggerId: null, decision: 'STAY_STRONG', trackerStep: 1 }],
      bookmarks: ['bookmark1']
    };

    const action = {
      type: 'CLEANUP_OLD_DATA',
      payload: {
        triggerLogs: [],
        cravingSessions: [],
        slipUps: []
      }
    } as any;

    const newState = appReducer(initialState, action);

    expect(newState.triggerLogs).toEqual([]);
    expect(newState.cravingSessions).toEqual([]);
    expect(newState.slipUps).toEqual([]);
    expect(newState.bookmarks).toEqual(['bookmark1']); // unchanged
  });

  it('should filter malformed completedSteps on HYDRATE', () => {
    const malformedState = {
      ...INITIAL_APP_STATE,
      planState: {
        ...INITIAL_APP_STATE.planState,
        completedSteps: [99, -1, 'abc', 5, NaN]
      }
    };

    const action = {
      type: 'HYDRATE',
      payload: malformedState
    } as any;

    const newState = appReducer(INITIAL_APP_STATE, action);

    expect(newState.planState.completedSteps).toEqual([5]);
  });
});
