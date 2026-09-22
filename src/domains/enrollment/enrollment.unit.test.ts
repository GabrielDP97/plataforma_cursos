import { describe, it, expect } from "vitest";

// ============================================================================
// Enrollment Domain Unit Tests — Pure validation/transition logic
// ============================================================================

type EnrollmentStatus = "active" | "completed" | "dropped";

const VALID_ENROLLMENT_TRANSITIONS: Record<EnrollmentStatus, EnrollmentStatus[]> = {
  active: ["completed", "dropped"],
  completed: [],
  dropped: ["active"],
};

function isValidEnrollmentTransition(from: EnrollmentStatus, to: EnrollmentStatus): boolean {
  return VALID_ENROLLMENT_TRANSITIONS[from]?.includes(to) ?? false;
}

function validateEnrollInput(input: { userId: string; courseId: string; source?: string }) {
  const errors: string[] = [];
  if (!input.userId?.trim()) errors.push("userId is required");
  if (!input.courseId?.trim()) errors.push("courseId is required");
  if (
    input.source &&
    !["free", "purchase", "admin", "invitation", "subscription"].includes(input.source)
  ) {
    errors.push(`Invalid source: ${input.source}`);
  }
  return errors;
}

describe("Enrollment Domain Unit Tests", () => {
  describe("Enrollment status transitions", () => {
    it("should allow active → completed", () => {
      expect(isValidEnrollmentTransition("active", "completed")).toBe(true);
    });

    it("should allow active → dropped", () => {
      expect(isValidEnrollmentTransition("active", "dropped")).toBe(true);
    });

    it("should allow dropped → active (re-enroll)", () => {
      expect(isValidEnrollmentTransition("dropped", "active")).toBe(true);
    });

    it("should reject completed → active", () => {
      expect(isValidEnrollmentTransition("completed", "active")).toBe(false);
    });

    it("should reject completed → dropped", () => {
      expect(isValidEnrollmentTransition("completed", "dropped")).toBe(false);
    });

    it("should reject active → active (no-op)", () => {
      expect(isValidEnrollmentTransition("active", "active")).toBe(false);
    });

    it("should reject completed → completed (no-op)", () => {
      expect(isValidEnrollmentTransition("completed", "completed")).toBe(false);
    });

    it("should reject dropped → dropped (no-op)", () => {
      expect(isValidEnrollmentTransition("dropped", "dropped")).toBe(false);
    });
  });

  describe("Enroll input validation", () => {
    it("should accept valid input", () => {
      const errors = validateEnrollInput({ userId: "u1", courseId: "c1" });
      expect(errors).toHaveLength(0);
    });

    it("should reject missing userId", () => {
      const errors = validateEnrollInput({ userId: "", courseId: "c1" });
      expect(errors).toContain("userId is required");
    });

    it("should reject missing courseId", () => {
      const errors = validateEnrollInput({ userId: "u1", courseId: "" });
      expect(errors).toContain("courseId is required");
    });

    it("should reject whitespace-only userId", () => {
      const errors = validateEnrollInput({ userId: "   ", courseId: "c1" });
      expect(errors).toContain("userId is required");
    });

    it("should reject invalid source", () => {
      const errors = validateEnrollInput({
        userId: "u1",
        courseId: "c1",
        source: "invalid",
      });
      expect(errors).toContain("Invalid source: invalid");
    });

    it("should accept valid source values", () => {
      for (const source of ["free", "purchase", "admin", "invitation", "subscription"]) {
        const errors = validateEnrollInput({
          userId: "u1",
          courseId: "c1",
          source,
        });
        expect(errors).toHaveLength(0);
      }
    });

    it("should accept undefined source (defaults to free)", () => {
      const errors = validateEnrollInput({ userId: "u1", courseId: "c1" });
      expect(errors).toHaveLength(0);
    });
  });

  describe("Pagination", () => {
    function paginate(total: number, page: number, limit: number) {
      const offset = (page - 1) * limit;
      const items = Array.from({ length: Math.min(limit, total - offset) }, (_, i) => ({
        id: String(offset + i + 1),
      }));
      return {
        items,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }

    it("should return first page with correct limit", () => {
      const result = paginate(100, 1, 10);
      expect(result.items).toHaveLength(10);
      expect(result.meta.page).toBe(1);
    });

    it("should return partial last page", () => {
      const result = paginate(25, 3, 10);
      expect(result.items).toHaveLength(5);
    });

    it("should handle zero total", () => {
      const result = paginate(0, 1, 10);
      expect(result.items).toHaveLength(0);
      expect(result.meta.totalPages).toBe(0);
    });
  });
});
