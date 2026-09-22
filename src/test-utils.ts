import { vi } from "vitest";

/**
 * Test utilities for the LMS platform.
 * Provides helpers and mocks for infrastructure adapters.
 */

export interface TestContext {
  db: {
    select: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
}

/**
 * Creates a mock test context with stubbed infrastructure adapters.
 */
export function createTestContext(): TestContext {
  return {
    db: {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
    },
  };
}
