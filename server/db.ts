import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, groups, groupMembers, updates, feedback, weeks, metrics } from "../drizzle/schema";
import type { InsertUpdate, InsertFeedback } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ GROUPS ============
export async function getGroupById(groupId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserGroups(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select()
    .from(groups)
    .innerJoin(groupMembers, eq(groups.id, groupMembers.groupId))
    .where(eq(groupMembers.userId, userId));
  return result.map((r) => r.groups);
}

export async function getGroupMembers(groupId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select()
    .from(groupMembers)
    .innerJoin(users, eq(groupMembers.userId, users.id))
    .where(eq(groupMembers.groupId, groupId));
  return result.map((r) => ({ ...r.group_members, user: r.users }));
}

// ============ UPDATES ============
export async function createUpdate(update: InsertUpdate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(updates).values(update);
  return result;
}

export async function getUserUpdates(userId: number, limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select()
    .from(updates)
    .where(eq(updates.userId, userId))
    .orderBy((u) => desc(u.submittedAt))
    .limit(limit)
    .offset(offset);
  return result;
}

export async function getGroupUpdates(groupId: number, weekId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (weekId) {
    return await db
      .select()
      .from(updates)
      .where(and(eq(updates.groupId, groupId), eq(updates.weekId, weekId)))
      .orderBy((u) => desc(u.submittedAt));
  }
  return await db
    .select()
    .from(updates)
    .where(eq(updates.groupId, groupId))
    .orderBy((u) => desc(u.submittedAt));
}

export async function getUpdateById(updateId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(updates).where(eq(updates.id, updateId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ FEEDBACK ============
export async function createFeedback(fb: InsertFeedback) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(feedback).values(fb);
  return result;
}

export async function getUpdateFeedback(updateId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select()
    .from(feedback)
    .where(eq(feedback.updateId, updateId))
    .orderBy((f) => desc(f.createdAt));
  return result;
}

export async function getUserReceivedFeedback(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select()
    .from(feedback)
    .where(eq(feedback.toUserId, userId))
    .orderBy((f) => desc(f.createdAt))
    .limit(limit);
  return result;
}

// ============ WEEKS ============
export async function getCurrentWeek(groupId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(weeks)
    .where(eq(weeks.groupId, groupId))
    .orderBy((w) => desc(w.weekNumber))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getWeekById(weekId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(weeks).where(eq(weeks.id, weekId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ METRICS ============
export async function getUserMetrics(userId: number, groupId: number, limit: number = 18) {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select()
    .from(metrics)
    .where(and(eq(metrics.userId, userId), eq(metrics.groupId, groupId)))
    .orderBy((m) => desc(m.createdAt))
    .limit(limit);
  return result.reverse();
}
