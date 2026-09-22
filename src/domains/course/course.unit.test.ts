import { describe, it, expect } from "vitest";
import { COURSE_STATUS } from "../../shared/constants";

// ============================================================================
// Course Domain Unit Tests — Pure logic, no DB dependency
// ============================================================================

// ---- Slug generation (extracted from service for unit testing) ----
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function generateCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ---- Course status transition validation (extracted logic) ----
const VALID_TRANSITIONS: Record<string, string[]> = {
  [COURSE_STATUS.DRAFT]: [COURSE_STATUS.PUBLISHED],
  [COURSE_STATUS.PUBLISHED]: [COURSE_STATUS.ARCHIVED, COURSE_STATUS.DRAFT],
  [COURSE_STATUS.ARCHIVED]: [COURSE_STATUS.DRAFT],
};

function isValidTransition(from: string, to: string): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

describe("Course Domain Unit Tests", () => {
  describe("Slug generation", () => {
    it("should generate slug from title", () => {
      expect(generateSlug("TypeScript Fundamentals")).toBe(
        "typescript-fundamentals"
      );
    });

    it("should handle special characters", () => {
      expect(generateSlug("What is C++? A Guide!")).toBe(
        "what-is-c-a-guide"
      );
    });

    it("should handle leading/trailing hyphens", () => {
      expect(generateSlug("  Hello World  ")).toBe("hello-world");
    });

    it("should handle empty string", () => {
      expect(generateSlug("")).toBe("");
    });

    it("should handle multiple consecutive hyphens", () => {
      expect(generateSlug("Learn   Node.js")).toBe("learn-node-js");
    });

    it("should handle unicode characters by stripping them", () => {
      expect(generateSlug("Études Françaises")).toBe("tudes-fran-aises");
    });
  });

  describe("Category slug generation", () => {
    it("should generate slug from category name", () => {
      expect(generateCategorySlug("Web Development")).toBe(
        "web-development"
      );
    });

    it("should handle single word", () => {
      expect(generateCategorySlug("Programming")).toBe("programming");
    });
  });

  describe("Course status transitions", () => {
    it("should allow draft → published", () => {
      expect(isValidTransition("draft", "published")).toBe(true);
    });

    it("should allow published → archived", () => {
      expect(isValidTransition("published", "archived")).toBe(true);
    });

    it("should allow published → draft (unpublish)", () => {
      expect(isValidTransition("published", "draft")).toBe(true);
    });

    it("should allow archived → draft (re-draft)", () => {
      expect(isValidTransition("archived", "draft")).toBe(true);
    });

    it("should reject draft → archived", () => {
      expect(isValidTransition("draft", "archived")).toBe(false);
    });

    it("should reject archived → published", () => {
      expect(isValidTransition("archived", "published")).toBe(false);
    });

    it("should reject draft → draft (no-op)", () => {
      expect(isValidTransition("draft", "draft")).toBe(false);
    });

    it("should reject published → published (no-op)", () => {
      expect(isValidTransition("published", "published")).toBe(false);
    });

    it("should reject archived → archived (no-op)", () => {
      expect(isValidTransition("archived", "archived")).toBe(false);
    });

    it("should reject unknown status transitions", () => {
      expect(isValidTransition("unknown", "published")).toBe(false);
    });
  });

  describe("Search filtering logic", () => {
    const mockCourses = [
      { id: "1", title: "TypeScript Fundamentals", status: "published" },
      { id: "2", title: "React Advanced Patterns", status: "published" },
      { id: "3", title: "TypeScript Design Patterns", status: "draft" },
      { id: "4", title: "Node.js Bootcamp", status: "published" },
    ];

    function filterCourses(
      courses: typeof mockCourses,
      query?: string,
      status?: string
    ) {
      let filtered = courses;
      if (status) {
        filtered = filtered.filter((c) => c.status === status);
      }
      if (query) {
        const lower = query.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.title.toLowerCase().includes(lower)
        );
      }
      return filtered;
    }

    it("should filter by keyword", () => {
      const result = filterCourses(mockCourses, "TypeScript");
      expect(result).toHaveLength(2);
      expect(result.map((c) => c.id)).toEqual(["1", "3"]);
    });

    it("should filter by status", () => {
      const result = filterCourses(mockCourses, undefined, "published");
      expect(result).toHaveLength(3);
    });

    it("should combine keyword and status filters", () => {
      const result = filterCourses(mockCourses, "TypeScript", "published");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("should return all when no filters", () => {
      const result = filterCourses(mockCourses);
      expect(result).toHaveLength(4);
    });

    it("should return empty when no match", () => {
      const result = filterCourses(mockCourses, "Python");
      expect(result).toHaveLength(0);
    });

    it("should handle case-insensitive search", () => {
      const result = filterCourses(mockCourses, "typescript");
      expect(result).toHaveLength(2);
    });
  });

  describe("Pagination meta", () => {
    function computeMeta(page: number, limit: number, total: number) {
      return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      };
    }

    it("should compute correct meta for first page", () => {
      const meta = computeMeta(1, 10, 25);
      expect(meta.totalPages).toBe(3);
      expect(meta.page).toBe(1);
    });

    it("should handle zero results", () => {
      const meta = computeMeta(1, 10, 0);
      expect(meta.totalPages).toBe(0);
    });

    it("should handle exact page boundary", () => {
      const meta = computeMeta(2, 10, 20);
      expect(meta.totalPages).toBe(2);
    });
  });
});
