1. **Add `CLEANUP_OLD_DATA` action**
   - Update `AppAction` in `smoke-free-path/context/AppContext.tsx` to include `CLEANUP_OLD_DATA`.
   - Implement the action in `appReducer` to only update the `triggerLogs`, `cravingSessions`, and `slipUps` arrays.
   - Update the `active` AppState listener to dispatch `CLEANUP_OLD_DATA` instead of `HYDRATE`.

2. **Add Data Integrity Check to `HYDRATE` action**
   - In `migrateAppState`, validate and sanitize `planState.completedSteps`. Ensure it is an array and filter its elements to only include valid step numbers (1 to 41).

3. **Complete pre commit steps**
   - Run verification and tests to ensure everything is functioning correctly.

4. **Submit changes**
   - Commit the fix to a new branch and push.
