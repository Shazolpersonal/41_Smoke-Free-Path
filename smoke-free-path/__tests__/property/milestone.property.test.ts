// Feature: smoke-free-path-v2-upgrade, Property 4: Milestone Share Message Invariant
// For any milestone object m, composeShareMessage(m) output always contains
// m.achievementBadge and m.titleBangla.
// Validates: Requirements 17.2, 17.3

import * as fc from 'fast-check';

import { composeShareMessage } from '@/app/milestone/[id]';
import type { Milestone } from '@/types';

// ─── Arbitrary: Milestone ─────────────────────────────────────────────────────

const milestoneArb = fc.record<Milestone>({
  steps: fc.integer({ min: 1, max: 41 }),
  titleBangla: fc.string({ minLength: 1, maxLength: 50 }),
  islamicMessage: fc.string({ minLength: 1, maxLength: 200 }),
  islamicContentId: fc.string({ minLength: 1, maxLength: 20 }),
  healthBenefit: fc.string({ minLength: 1, maxLength: 200 }),
  achievedAt: fc.option(fc.constant(new Date().toISOString()), { nil: null }),
  achievementBadge: fc.option(
    fc.constantFrom('🌱', '⭐', '🏆', '👑', '🎯', '💪', '🌟'),
    { nil: undefined }
  ),
  completionMessage: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
  nextMilestoneMotivation: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
  duaId: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
});

// ─── Property 4: Milestone Share Message Invariant ───────────────────────────

test('Property 4: Milestone Share Message Invariant', () => {
  fc.assert(
    fc.property(milestoneArb, (milestone) => {
      const message = composeShareMessage(milestone);

      // The message must always contain titleBangla
      expect(message).toContain(milestone.titleBangla);

      // The message must always contain achievementBadge (or fallback '🏆')
      const expectedBadge = milestone.achievementBadge ?? '🏆';
      expect(message).toContain(expectedBadge);

      // The message must always contain islamicMessage
      expect(message).toContain(milestone.islamicMessage);

      // The message must always end with the motivational phrase
      expect(message).toContain('ধোঁয়া-মুক্ত পথ অ্যাপ দিয়ে আমার যাত্রা চলছে। 🌿');
    }),
    { numRuns: 100 }
  );
});
