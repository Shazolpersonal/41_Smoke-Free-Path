// Unit tests for data enrichment validation
import duas from "@/assets/data/duas.json";
import stepPlans from "@/assets/data/step_plans.json";
import milestones from "@/assets/data/milestones.json";

describe("Data Enrichment Unit Tests", () => {
  describe("social_pressure_dua entries have practicalPhrase", () => {
    it("সব social_pressure_dua entries-এ practicalPhrase থাকতে হবে", () => {
      const socialDuas = duas.filter(
        (d: any) => d.duaCategory === "social_pressure_dua",
      );
      expect(socialDuas.length).toBeGreaterThanOrEqual(3);
      socialDuas.forEach((dua: any) => {
        expect(dua.practicalPhrase).toBeDefined();
        expect(typeof dua.practicalPhrase).toBe("string");
        expect(dua.practicalPhrase.trim().length).toBeGreaterThan(0);
      });
    });
  });

  describe("ramadanTip present in steps 1-7 only", () => {
    it("ধাপ ১–৭-এ ramadanTip থাকতে হবে", () => {
      const stepsWithRamadan = stepPlans.filter(
        (p: any) => p.step >= 1 && p.step <= 7,
      );
      stepsWithRamadan.forEach((plan: any) => {
        expect(plan.ramadanTip).toBeDefined();
        expect(typeof plan.ramadanTip).toBe("string");
        expect(plan.ramadanTip.trim().length).toBeGreaterThan(0);
      });
    });

    it("ধাপ ৮+-এ ramadanTip থাকবে না", () => {
      const stepsWithoutRamadan = stepPlans.filter((p: any) => p.step >= 8);
      stepsWithoutRamadan.forEach((plan: any) => {
        expect(plan.ramadanTip).toBeUndefined();
      });
    });
  });

  describe("41st milestone has completionMessage", () => {
    it("৪১তম milestone-এ completionMessage থাকতে হবে", () => {
      const finalMilestone = milestones.find((m: any) => m.steps === 41);
      expect(finalMilestone).toBeDefined();
      expect(finalMilestone!.completionMessage).toBeDefined();
      expect(typeof (finalMilestone as any).completionMessage).toBe("string");
      expect(
        (finalMilestone as any).completionMessage.trim().length,
      ).toBeGreaterThan(0);
    });

    it("৪১তম ছাড়া অন্য milestone-এ completionMessage থাকবে না", () => {
      const otherMilestones = milestones.filter((m: any) => m.steps !== 41);
      otherMilestones.forEach((m: any) => {
        expect(m.completionMessage).toBeUndefined();
      });
    });
  });

  describe("milestone_dua entries referenced in milestones.json", () => {
    it("milestones.json-এর duaId গুলো milestone_dua category-র হতে হবে", () => {
      const duaMap = new Map(duas.map((d: any) => [d.id, d]));
      milestones.forEach((m: any) => {
        if (m.duaId) {
          const dua = duaMap.get(m.duaId);
          expect(dua).toBeDefined();
          expect((dua as any).duaCategory).toBe("milestone_dua");
        }
      });
    });
  });

  describe("All steps have required new fields", () => {
    it("সব ৪১টি step-এ islamicInsight থাকতে হবে", () => {
      stepPlans.forEach((plan: any) => {
        expect(plan.islamicInsight).toBeDefined();
        expect(plan.islamicInsight.trim().length).toBeGreaterThan(0);
      });
    });

    it("সব ৪১টি step-এ familyMotivation থাকতে হবে", () => {
      stepPlans.forEach((plan: any) => {
        expect(plan.familyMotivation).toBeDefined();
        expect(plan.familyMotivation.trim().length).toBeGreaterThan(0);
      });
    });

    it("সব ৪১টি step-এ কমপক্ষে ৫টি tips থাকতে হবে", () => {
      stepPlans.forEach((plan: any) => {
        expect(plan.tips.length).toBeGreaterThanOrEqual(5);
      });
    });
  });

  describe("milestones have achievementBadge", () => {
    it("সব milestone-এ achievementBadge থাকতে হবে", () => {
      milestones.forEach((m: any) => {
        expect(m.achievementBadge).toBeDefined();
        expect(m.achievementBadge.trim().length).toBeGreaterThan(0);
      });
    });
  });
});
