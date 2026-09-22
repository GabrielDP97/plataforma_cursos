import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAdminDashboard,
  getPlatformSettings,
} from "./service";

// Mock the database module - vi.mock is hoisted, so we use factory function
vi.mock("../../infra/db", () => {
  // Create a mock that returns an array when awaited
  const createMockChain = (returnValue: any[] = []) => {
    const chain: any = {};
    chain.select = vi.fn().mockReturnValue(chain);
    chain.from = vi.fn().mockReturnValue(chain);
    chain.where = vi.fn().mockReturnValue(chain);
    chain.orderBy = vi.fn().mockReturnValue(chain);
    chain.limit = vi.fn().mockReturnValue(chain);
    chain.offset = vi.fn().mockReturnValue(chain);
    chain.groupBy = vi.fn().mockReturnValue(chain);
    chain.insert = vi.fn().mockReturnValue(chain);
    chain.update = vi.fn().mockReturnValue(chain);
    chain.delete = vi.fn().mockReturnValue(chain);
    chain.set = vi.fn().mockReturnValue(chain);
    chain.values = vi.fn().mockReturnValue(chain);
    chain.returning = vi.fn().mockResolvedValue(returnValue);
    // Make the chain thenable (so await works)
    chain.then = (resolve: any) => resolve(returnValue);
    return chain;
  };

  return {
    db: createMockChain([{ total: 0 }]),
  };
});

describe("Administration (M13)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Admin Dashboard", () => {
    it("should return platform overview stats", async () => {
      const dashboard = await getAdminDashboard();
      expect(dashboard).toHaveProperty("stats");
      expect(dashboard).toHaveProperty("recentActivity");
    });
  });

  describe("Platform Settings", () => {
    it("should return platform settings", async () => {
      const settings = await getPlatformSettings();
      expect(settings).toHaveProperty("platformName");
      expect(settings).toHaveProperty("platformLogo");
      expect(settings).toHaveProperty("termsVersion");
    });
  });
});
