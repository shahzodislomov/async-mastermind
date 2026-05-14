import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { transcribeAudio } from "./_core/voiceTranscription";
import { notifyOwner } from "./_core/notification";
import {
  createUpdate,
  getUserUpdates,
  getGroupUpdates,
  getUpdateById,
  createFeedback,
  getUpdateFeedback,
  getUserReceivedFeedback,
  getUserGroups,
  getGroupMembers,
  getGroupById,
  getCurrentWeek,
  getUserMetrics,
} from "./db";

// ============ SEED DATA ============
// Mock data for demo purposes
const DEMO_GROUP_ID = 1;
const DEMO_WEEK_ID = 1;

async function seedDemoData() {
  // This would be called on first app load to populate demo data
  // For now, we'll rely on manual seeding or API calls
}

// ============ VALIDATION SCHEMAS ============
const submitUpdateSchema = z.object({
  win: z.string().min(10).max(300),
  blocker: z.string().min(10).max(300),
  target: z.string().optional(),
  reflection: z.string().optional(),
  mood: z.number().int().min(1).max(5),
  metricValue: z.number().optional().nullable(),
  voiceUrl: z.string().optional(),
  voiceTranscript: z.string().optional(),
  groupId: z.number(),
  weekId: z.number(),
});

const giveFeedbackSchema = z.object({
  updateId: z.number(),
  body: z.string().min(100),
  tag: z.enum(["Encouraging", "Tactical", "Question"]),
  fieldRef: z.string().optional(),
});

// ============ APP ROUTER ============
export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ UPDATES ============
  updates: router({
    submit: protectedProcedure
      .input(submitUpdateSchema)
      .mutation(async ({ ctx, input }) => {
        await createUpdate({
          userId: ctx.user.id,
          groupId: input.groupId,
          weekId: input.weekId,
          win: input.win,
          blocker: input.blocker,
          target: input.target,
          reflection: input.reflection,
          mood: input.mood,
          metricValue: input.metricValue as any,
          voiceUrl: input.voiceUrl,
          voiceTranscript: input.voiceTranscript,
        });
        return { success: true };
      }),

    list: protectedProcedure
      .input(
        z.object({
          limit: z.number().default(20),
          offset: z.number().default(0),
        })
      )
      .query(async ({ ctx, input }) => {
        const updates = await getUserUpdates(ctx.user.id, input.limit, input.offset);
        return updates;
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const update = await getUpdateById(input.id);
        if (!update) throw new Error("Update not found");
        const updateFeedback = await getUpdateFeedback(input.id);
        return { ...update, feedback: updateFeedback };
      }),

    groupUpdates: protectedProcedure
      .input(z.object({ groupId: z.number(), weekId: z.number().optional() }))
      .query(async ({ input }) => {
        return await getGroupUpdates(input.groupId, input.weekId);
      }),

    transcribeVoice: protectedProcedure
      .input(z.object({ audioUrl: z.string(), language: z.string().optional() }))
      .mutation(async ({ input }) => {
        try {
          const result = await transcribeAudio({
            audioUrl: input.audioUrl,
            language: input.language || "en",
          });
          if ('error' in result) {
            throw new Error(result.error);
          }
          return {
            success: true,
            transcript: result.text || "",
            language: result.language || "en",
          };
        } catch (error) {
          throw new Error(`Transcription failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }),
  }),

  // ============ FEEDBACK ============
  feedback: router({
    give: protectedProcedure
      .input(giveFeedbackSchema)
      .mutation(async ({ ctx, input }) => {
        const update = await getUpdateById(input.updateId);
        if (!update) throw new Error("Update not found");

        await createFeedback({
          updateId: input.updateId,
          fromUserId: ctx.user.id,
          toUserId: update.userId,
          body: input.body,
          tag: input.tag,
          fieldRef: input.fieldRef,
        });

        return { success: true };
      }),

    received: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ ctx, input }) => {
        return await getUserReceivedFeedback(ctx.user.id, input.limit);
      }),

    onUpdate: protectedProcedure
      .input(z.object({ updateId: z.number() }))
      .query(async ({ input }) => {
        return await getUpdateFeedback(input.updateId);
      }),
  }),

  // ============ MEMBERS ============
  members: router({
    list: protectedProcedure
      .input(z.object({ groupId: z.number() }))
      .query(async ({ input }) => {
        const members = await getGroupMembers(input.groupId);
        return members.map((m) => ({
          id: m.user.id,
          name: m.user.name,
          email: m.user.email,
          streak: m.streak,
          feedbackScore: m.user.feedbackScore,
          status: m.status,
          role: m.role,
          joinedAt: m.joinedAt,
        }));
      }),

    streaks: protectedProcedure
      .input(z.object({ groupId: z.number() }))
      .query(async ({ input }) => {
        const members = await getGroupMembers(input.groupId);
        return members.map((m) => ({
          userId: m.user.id,
          name: m.user.name,
          streak: m.streak,
          status: m.status,
        }));
      }),
  }),

  // ============ GROUPS ============
  groups: router({
    myGroups: protectedProcedure.query(async ({ ctx }) => {
      return await getUserGroups(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const group = await getGroupById(input.id);
        if (!group) throw new Error("Group not found");
        const members = await getGroupMembers(input.id);
        return { ...group, members };
      }),
  }),

  // ============ ARCHIVE ============
  archive: router({
    metrics: protectedProcedure
      .input(z.object({ groupId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await getUserMetrics(ctx.user.id, input.groupId, 18);
      }),

    export: protectedProcedure
      .input(z.object({ groupId: z.number(), format: z.enum(["csv", "json"]) }))
      .query(async ({ ctx, input }) => {
        const updates = await getUserUpdates(ctx.user.id, 1000, 0);

        if (input.format === "json") {
          return {
            format: "json",
            data: JSON.stringify(updates, null, 2),
            filename: `archive-${new Date().toISOString().split("T")[0]}.json`,
          };
        }

        // CSV format
        const headers = ["Date", "Win", "Blocker", "Mood", "Metric"];
        const rows = updates.map((u) => [
          new Date(u.submittedAt).toISOString().split("T")[0],
          `"${u.win.replace(/"/g, '""')}"`,
          `"${u.blocker.replace(/"/g, '""')}"`,
          u.mood,
          u.metricValue || "",
        ]);

        const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");

        return {
          format: "csv",
          data: csv,
          filename: `archive-${new Date().toISOString().split("T")[0]}.csv`,
        };
      }),
  }),

  // ============ NOTIFICATIONS ============
  notifications: router({
    sendAlert: protectedProcedure
      .input(z.object({
        title: z.string(),
        content: z.string(),
        type: z.enum(["submission", "feedback", "streak", "milestone"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const result = await notifyOwner({
            title: input.title,
            content: input.content,
          });
          return { success: result };
        } catch (error) {
          throw new Error(`Notification failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }),

    notifyLateSubmission: protectedProcedure
      .input(z.object({ groupId: z.number(), memberName: z.string() }))
      .mutation(async ({ input }) => {
        const result = await notifyOwner({
          title: "Late Submission Alert",
          content: `${input.memberName} hasn't submitted their weekly update yet. Deadline is approaching!`,
        });
        return { success: result };
      }),

    notifyFeedbackReceived: protectedProcedure
      .input(z.object({ fromUser: z.string(), tag: z.string() }))
      .mutation(async ({ input }) => {
        const result = await notifyOwner({
          title: "New Feedback Received",
          content: `${input.fromUser} left ${input.tag} feedback on your update.`,
        });
        return { success: result };
      }),

    notifyStreakMilestone: protectedProcedure
      .input(z.object({ weeks: z.number() }))
      .mutation(async ({ input }) => {
        const result = await notifyOwner({
          title: "🔥 Streak Milestone!",
          content: `You've reached a ${input.weeks}-week submission streak! Keep the momentum going.`,
        });
        return { success: result };
      }),
  }),
});

export type AppRouter = typeof appRouter;
