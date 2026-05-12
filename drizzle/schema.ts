import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar,
  decimal,
  tinyint,
  json
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with streak and feedback_score for accountability tracking.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  streak: int("streak").default(0).notNull(),
  feedbackScore: decimal("feedbackScore", { precision: 3, scale: 1 }).default("5.0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Groups table for accountability groups (5-8 members per group)
 */
export const groups = mysqlTable("groups", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  tag: varchar("tag", { length: 100 }),
  captainId: int("captainId").notNull(),
  maxMembers: int("maxMembers").default(8).notNull(),
  metricLabel: varchar("metricLabel", { length: 100 }),
  metricUnit: varchar("metricUnit", { length: 50 }),
  streak: int("streak").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Group = typeof groups.$inferSelect;
export type InsertGroup = typeof groups.$inferInsert;

/**
 * Group members junction table with streak tracking per member
 */
export const groupMembers = mysqlTable("group_members", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  groupId: int("groupId").notNull(),
  streak: int("streak").default(0).notNull(),
  status: mysqlEnum("status", ["active", "paused", "removed"]).default("active").notNull(),
  role: mysqlEnum("role", ["member", "captain"]).default("member").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GroupMember = typeof groupMembers.$inferSelect;
export type InsertGroupMember = typeof groupMembers.$inferInsert;

/**
 * Weeks table tracking submission and feedback deadlines
 */
export const weeks = mysqlTable("weeks", {
  id: int("id").autoincrement().primaryKey(),
  groupId: int("groupId").notNull(),
  weekNumber: int("weekNumber").notNull(),
  opensAt: timestamp("opensAt").notNull(),
  submissionDeadline: timestamp("submissionDeadline").notNull(),
  feedbackDeadline: timestamp("feedbackDeadline").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Week = typeof weeks.$inferSelect;
export type InsertWeek = typeof weeks.$inferInsert;

/**
 * Updates table - the core content unit
 * Immutable after submission (no editing)
 */
export const updates = mysqlTable("updates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  groupId: int("groupId").notNull(),
  weekId: int("weekId").notNull(),
  win: text("win").notNull(),
  blocker: text("blocker").notNull(),
  target: text("target"),
  reflection: text("reflection"),
  mood: tinyint("mood").notNull(), // 1-5 scale
  metricValue: decimal("metricValue", { precision: 12, scale: 2 }),
  voiceUrl: varchar("voiceUrl", { length: 512 }),
  voiceTranscript: text("voiceTranscript"),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Update = typeof updates.$inferSelect;
export type InsertUpdate = typeof updates.$inferInsert;

/**
 * Feedback table - peer feedback on updates
 * Enforced minimum length and tag selection
 */
export const feedback = mysqlTable("feedback", {
  id: int("id").autoincrement().primaryKey(),
  updateId: int("updateId").notNull(),
  fromUserId: int("fromUserId").notNull(),
  toUserId: int("toUserId").notNull(),
  body: text("body").notNull(),
  tag: mysqlEnum("tag", ["Encouraging", "Tactical", "Question"]).notNull(),
  fieldRef: varchar("fieldRef", { length: 50 }), // "win", "blocker", "target", etc.
  rating: tinyint("rating"), // 1-5 scale, optional
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = typeof feedback.$inferInsert;

/**
 * Metrics history for tracking progress over time
 */
export const metrics = mysqlTable("metrics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  groupId: int("groupId").notNull(),
  weekId: int("weekId").notNull(),
  value: decimal("value", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Metric = typeof metrics.$inferSelect;
export type InsertMetric = typeof metrics.$inferInsert;

/**
 * Webhooks for Pro tier integrations
 */
export const webhooks = mysqlTable("webhooks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  url: varchar("url", { length: 512 }).notNull(),
  secret: varchar("secret", { length: 255 }).notNull(),
  events: json("events").$type<string[]>().notNull(),
  active: tinyint("active").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = typeof webhooks.$inferInsert;

/**
 * API keys for Pro tier programmatic access
 */
export const apiKeys = mysqlTable("api_keys", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  keyHash: varchar("keyHash", { length: 255 }).notNull().unique(),
  scopes: json("scopes").$type<string[]>().notNull(),
  lastUsedAt: timestamp("lastUsedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;
