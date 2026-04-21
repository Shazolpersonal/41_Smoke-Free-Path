import {
  getIslamicContentById,
  getAllIslamicContent,
  getRelatedContent,
} from "../../services/ContentService";

describe("ContentService Performance", () => {
  it("measures getRelatedContent performance", () => {
    const content = getAllIslamicContent();
    const ids = content.map((c) => c.id);

    const start = Date.now();
    const iterations = 10000;
    for (let i = 0; i < iterations; i++) {
      const id = ids[i % ids.length];
      getRelatedContent(id);
    }
    const end = Date.now();
    console.log(
      `[BENCHMARK] Time taken for ${iterations} getRelatedContent lookups: ${end - start}ms`,
    );
  });

  it("measures getIslamicContentById performance", () => {
    const content = getAllIslamicContent();
    const ids = content.map((c) => c.id);

    const start = Date.now();
    const iterations = 10000;
    for (let i = 0; i < iterations; i++) {
      const id = ids[i % ids.length];
      getIslamicContentById(id);
    }
    const end = Date.now();
    console.log(
      `[BENCHMARK] Time taken for ${iterations} getIslamicContentById lookups: ${end - start}ms`,
    );
  });

  it("verifies getIslamicContentById returns correct content", () => {
    const content = getAllIslamicContent();
    for (const item of content) {
      const found = getIslamicContentById(item.id);
      expect(found).toEqual(item);
    }
  });

  it("returns null for non-existent id", () => {
    expect(getIslamicContentById("non-existent")).toBeNull();
  });
});
