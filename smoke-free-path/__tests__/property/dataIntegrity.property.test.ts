import * as fc from "fast-check";

// ─── JSON Data Imports ────────────────────────────────────────────────────────
import duas from "@/assets/data/duas.json";
import islamicContent from "@/assets/data/islamic_content.json";
import healthTimeline from "@/assets/data/health_timeline.json";
import stepPlans from "@/assets/data/step_plans.json";
import milestones from "@/assets/data/milestones.json";

// ─── Helper Sets ──────────────────────────────────────────────────────────────
const islamicContentIds = new Set(islamicContent.map((ic: any) => ic.id));
const duaIds = new Set(duas.map((d: any) => d.id));
const duaById = new Map(duas.map((d: any) => [d.id, d]));

// ─── Property 1: duas.json Cross-linking Validity ─────────────────────────────
// Feature: data-content-enrichment, Property 1: duas.json cross-linking validity
describe("Property 1: duas.json Cross-linking Validity", () => {
  it("প্রতিটি দোয়ার relatedContentIds-এর সব ID islamic_content.json-এ থাকতে হবে", () => {
    fc.assert(
      fc.property(fc.constantFrom(...duas), (dua: any) => {
        return dua.relatedContentIds.every((id: string) =>
          islamicContentIds.has(id),
        );
      }),
      { numRuns: 100 },
    );
  });
});

// ─── Property 2: stepAssignment Range Validity ────────────────────────────────
// Feature: data-content-enrichment, Property 2: stepAssignment range validity
describe("Property 2: stepAssignment Range Validity", () => {
  it("non-null stepAssignment মান ১–৪১ range-এর মধ্যে থাকতে হবে", () => {
    fc.assert(
      fc.property(fc.constantFrom(...duas), (dua: any) => {
        if (dua.stepAssignment === null) return true;
        return dua.stepAssignment >= 1 && dua.stepAssignment <= 41;
      }),
      { numRuns: 100 },
    );
  });
});

// ─── Property 3: health_timeline Ascending Order ──────────────────────────────
// Feature: data-content-enrichment, Property 3: health_timeline ascending order
describe("Property 3: health_timeline Ascending Order", () => {
  it("health_timeline entries timeMinutes অনুযায়ী strictly ascending order-এ থাকতে হবে", () => {
    const timeline = healthTimeline as any[];
    for (let i = 0; i < timeline.length - 1; i++) {
      expect(timeline[i].timeMinutes).toBeLessThan(timeline[i + 1].timeMinutes);
    }
  });

  it("কোনো duplicate timeMinutes থাকবে না", () => {
    const timeline = healthTimeline as any[];
    const minutes = timeline.map((e: any) => e.timeMinutes);
    expect(new Set(minutes).size).toBe(minutes.length);
  });
});

// ─── Property 4: step_plans islamicContentId Validity ────────────────────────
// Feature: data-content-enrichment, Property 4: step_plans islamicContentId validity
describe("Property 4: step_plans islamicContentId Validity", () => {
  it("প্রতিটি step plan-এর islamicContentId islamic_content.json-এ থাকতে হবে", () => {
    fc.assert(
      fc.property(fc.constantFrom(...stepPlans), (plan: any) => {
        return islamicContentIds.has(plan.islamicContentId);
      }),
      { numRuns: 100 },
    );
  });
});

// ─── Property 5: milestones duaId Validity ───────────────────────────────────
// Feature: data-content-enrichment, Property 5: milestones duaId validity
describe("Property 5: milestones duaId Validity", () => {
  it("non-null duaId duas.json-এ থাকতে হবে এবং milestone_dua category-র হতে হবে", () => {
    fc.assert(
      fc.property(fc.constantFrom(...milestones), (milestone: any) => {
        if (!milestone.duaId) return true;
        if (!duaIds.has(milestone.duaId)) return false;
        const dua = duaById.get(milestone.duaId);
        return dua?.duaCategory === "milestone_dua";
      }),
      { numRuns: 100 },
    );
  });
});

// ─── Property 6: Unique IDs within each file ─────────────────────────────────
// Feature: data-content-enrichment, Property 6: unique IDs within each file
describe("Property 6: Unique IDs within each file", () => {
  it("duas.json-এ সব ID unique হতে হবে", () => {
    const ids = duas.map((d: any) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("islamic_content.json-এ সব ID unique হতে হবে", () => {
    const ids = islamicContent.map((ic: any) => ic.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("step_plans.json-এ সব step number unique হতে হবে", () => {
    const steps = stepPlans.map((p: any) => p.step);
    expect(new Set(steps).size).toBe(steps.length);
  });

  it("milestones.json-এ সব steps value unique হতে হবে", () => {
    const steps = milestones.map((m: any) => m.steps);
    expect(new Set(steps).size).toBe(steps.length);
  });
});

// ─── Property 7: social_pressure_dua practicalPhrase Presence ────────────────
// Feature: data-content-enrichment, Property 7: social_pressure_dua practicalPhrase presence
describe("Property 7: social_pressure_dua practicalPhrase Presence", () => {
  it("social_pressure_dua category-র প্রতিটি দোয়ায় non-empty practicalPhrase থাকতে হবে", () => {
    const socialPressureDuas = duas.filter(
      (d: any) => d.duaCategory === "social_pressure_dua",
    );

    fc.assert(
      fc.property(
        fc.constantFrom(
          ...(socialPressureDuas.length > 0
            ? socialPressureDuas
            : [{ practicalPhrase: "placeholder" }]),
        ),
        (dua: any) => {
          if (dua.duaCategory !== "social_pressure_dua") return true;
          return (
            typeof dua.practicalPhrase === "string" &&
            dua.practicalPhrase.trim().length > 0
          );
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ─── Property 8: No self-referencing in relatedContentIds ────────────────────
// Feature: data-content-enrichment, Property 8: no self-referencing in relatedContentIds
describe("Property 8: No self-referencing in relatedContentIds", () => {
  it("islamic_content.json-এর কোনো entry নিজের ID নিজের relatedContentIds-এ রাখবে না", () => {
    fc.assert(
      fc.property(fc.constantFrom(...islamicContent), (content: any) => {
        return !content.relatedContentIds.includes(content.id);
      }),
      { numRuns: 100 },
    );
  });
});
