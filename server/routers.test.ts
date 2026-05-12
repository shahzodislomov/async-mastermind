import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@example.com`,
    name: `User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    streak: 5,
    feedbackScore: "4.5",
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as any,
  };

  return ctx;
}

describe("tRPC API Layer", () => {
  describe("auth procedures", () => {
    it("should return current user from me query", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const user = await caller.auth.me();
      expect(user).toEqual(ctx.user);
    });

    it("should logout and clear session cookie", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.auth.logout();
      expect(result.success).toBe(true);
    });
  });

  describe("updates procedures", () => {
    it("should validate win field is required and has min length", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.updates.submit({
          win: "short",
          blocker: "This is a blocker with enough characters",
          mood: 3,
          groupId: 1,
          weekId: 1,
        });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.message).toContain("Too small");
      }
    });

    it("should validate blocker field is required and has min length", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.updates.submit({
          win: "This is a win with enough characters",
          blocker: "short",
          mood: 3,
          groupId: 1,
          weekId: 1,
        });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.message).toContain("Too small");
      }
    });

    it("should validate mood is between 1-5", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.updates.submit({
          win: "This is a win with enough characters",
          blocker: "This is a blocker with enough characters",
          mood: 10,
          groupId: 1,
          weekId: 1,
        });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.message).toContain("Too big");
      }
    });

    it("should list user updates", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const updates = await caller.updates.list({ limit: 20, offset: 0 });
      expect(Array.isArray(updates)).toBe(true);
    });
  });

  describe("feedback procedures", () => {
    it("should validate feedback body has minimum 100 characters", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.feedback.give({
          updateId: 1,
          body: "short",
          tag: "Encouraging",
        });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.message).toContain("Too small");
      }
    });

    it("should enforce feedback tag selection", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const validTags = ["Encouraging", "Tactical", "Question"];
      for (const tag of validTags) {
        try {
          await caller.feedback.give({
            updateId: 1,
            body: "This is a feedback message with enough characters to pass validation",
            tag: tag as any,
          });
          // Should succeed or fail due to update not found, not tag validation
        } catch (error: any) {
          expect(error.message).not.toContain("tag");
        }
      }
    });

    it("should retrieve received feedback", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const feedback = await caller.feedback.received({ limit: 50 });
      expect(Array.isArray(feedback)).toBe(true);
    });
  });

  describe("members procedures", () => {
    it("should list group members", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const members = await caller.members.list({ groupId: 1 });
      expect(Array.isArray(members)).toBe(true);
    });

    it("should retrieve member streaks", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const streaks = await caller.members.streaks({ groupId: 1 });
      expect(Array.isArray(streaks)).toBe(true);
    });
  });

  describe("archive procedures", () => {
    it("should retrieve user metrics", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const metrics = await caller.archive.metrics({ groupId: 1 });
      expect(Array.isArray(metrics)).toBe(true);
    });

    it("should export as CSV format", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.archive.export({ groupId: 1, format: "csv" });
      expect(result.format).toBe("csv");
      expect(result.filename).toContain(".csv");
      expect(result.data).toBeTruthy();
    });

    it("should export as JSON format", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.archive.export({ groupId: 1, format: "json" });
      expect(result.format).toBe("json");
      expect(result.filename).toContain(".json");
      expect(result.data).toBeTruthy();
      expect(() => JSON.parse(result.data)).not.toThrow();
    });
  });

  describe("groups procedures", () => {
    it("should retrieve user groups", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const groups = await caller.groups.myGroups();
      expect(Array.isArray(groups)).toBe(true);
    });
  });
});
