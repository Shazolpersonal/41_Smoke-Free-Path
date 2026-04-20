/**
 * Basic setup verification test
 * Ensures the project foundation is correctly configured
 */

describe("Project Setup", () => {
  it("should have fast-check available for property-based testing", () => {
    const fc = require("fast-check");
    expect(fc).toBeDefined();
    expect(typeof fc.property).toBe("function");
    expect(typeof fc.assert).toBe("function");
  });

  it("should run a basic fast-check property", () => {
    const fc = require("fast-check");
    fc.assert(
      fc.property(fc.integer(), (n: number) => {
        return typeof n === "number";
      }),
      { numRuns: 10 },
    );
  });
});
