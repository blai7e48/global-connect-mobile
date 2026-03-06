import { eq, desc, and, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  profiles, InsertProfile,
  sessions, InsertSession,
  communityPosts, InsertCommunityPost,
  communityAnswers, InsertCommunityAnswer,
  conversations, InsertConversation,
  messages, InsertMessage, Message,
} from "../drizzle/schema";

import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

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

// ─── User Helpers ────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
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
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Profile Helpers ─────────────────────────────────────────────

export async function getProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function upsertProfile(data: InsertProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(profiles).where(eq(profiles.userId, data.userId)).limit(1);
  if (existing.length > 0) {
    const { userId, ...updateData } = data;
    await db.update(profiles).set(updateData).where(eq(profiles.userId, userId));
    return existing[0].id;
  } else {
    const result = await db.insert(profiles).values(data);
    return result[0].insertId;
  }
}

export async function getMentors(filters?: { industry?: string; location?: string; search?: string }) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [
    eq(profiles.appRole, "mentor"),
    eq(profiles.openToStudents, true),
    eq(profiles.onboardingCompleted, true),
  ];

  if (filters?.industry) conditions.push(eq(profiles.industry, filters.industry));
  if (filters?.location) conditions.push(like(profiles.location, `%${filters.location}%`));
  if (filters?.search) {
    conditions.push(
      or(
        like(profiles.fullName, `%${filters.search}%`),
        like(profiles.jobTitle, `%${filters.search}%`),
        like(profiles.company, `%${filters.search}%`),
      )!,
    );
  }

  return db.select().from(profiles).where(and(...conditions)).orderBy(desc(profiles.updatedAt));
}

export async function getStudents() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(profiles)
    .where(and(eq(profiles.appRole, "student"), eq(profiles.onboardingCompleted, true)))
    .orderBy(desc(profiles.updatedAt));
}

export async function getProfileById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// ─── Session Helpers ─────────────────────────────────────────────

export async function createSession(data: InsertSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(sessions).values(data);
  return result[0].insertId;
}

export async function getUserSessions(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const allSessions = await db.select().from(sessions)
    .where(or(eq(sessions.mentorId, userId), eq(sessions.studentId, userId)))
    .orderBy(desc(sessions.createdAt));

  const enriched = [];
  for (const s of allSessions) {
    const mentorProfile = await db.select().from(profiles).where(eq(profiles.userId, s.mentorId)).limit(1);
    const studentProfile = await db.select().from(profiles).where(eq(profiles.userId, s.studentId)).limit(1);
    enriched.push({
      ...s,
      mentor: mentorProfile[0] || null,
      student: studentProfile[0] || null,
    });
  }
  return enriched;
}

export async function updateSession(id: number, data: Partial<InsertSession>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(sessions).set(data).where(eq(sessions.id, id));
}

export async function getSessionById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
  if (result.length === 0) return null;
  const s = result[0];
  const mentorProfile = await db.select().from(profiles).where(eq(profiles.userId, s.mentorId)).limit(1);
  const studentProfile = await db.select().from(profiles).where(eq(profiles.userId, s.studentId)).limit(1);
  return { ...s, mentor: mentorProfile[0] || null, student: studentProfile[0] || null };
}

// ─── Community Helpers ───────────────────────────────────────────

export async function createPost(data: InsertCommunityPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(communityPosts).values(data);
  return result[0].insertId;
}

export async function getPosts(sort: "new" | "popular" = "new", search?: string) {
  const db = await getDb();
  if (!db) return [];

  const conditions: any[] = [];
  if (search) {
    conditions.push(
      or(
        like(communityPosts.title, `%${search}%`),
        like(communityPosts.content, `%${search}%`),
      )!,
    );
  }

  const baseQuery = conditions.length > 0
    ? db.select().from(communityPosts).where(and(...conditions))
    : db.select().from(communityPosts);

  const posts = sort === "popular"
    ? await baseQuery.orderBy(desc(communityPosts.upvotes))
    : await baseQuery.orderBy(desc(communityPosts.createdAt));

  const enriched = [];
  for (const p of posts) {
    const author = await db.select().from(profiles).where(eq(profiles.userId, p.authorId)).limit(1);
    const answerCount = await db.select({ count: sql<number>`count(*)` }).from(communityAnswers).where(eq(communityAnswers.postId, p.id));
    enriched.push({
      ...p,
      author: author[0] || null,
      answerCount: Number(answerCount[0]?.count || 0),
    });
  }
  return enriched;
}

export async function getPostById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(communityPosts).where(eq(communityPosts.id, id)).limit(1);
  if (result.length === 0) return null;
  const p = result[0];
  const author = await db.select().from(profiles).where(eq(profiles.userId, p.authorId)).limit(1);
  const answers = await db.select().from(communityAnswers)
    .where(eq(communityAnswers.postId, id))
    .orderBy(desc(communityAnswers.upvotes));

  const enrichedAnswers = [];
  for (const a of answers) {
    const ansAuthor = await db.select().from(profiles).where(eq(profiles.userId, a.authorId)).limit(1);
    enrichedAnswers.push({ ...a, author: ansAuthor[0] || null });
  }

  return { ...p, author: author[0] || null, answers: enrichedAnswers };
}

export async function createAnswer(data: InsertCommunityAnswer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(communityAnswers).values(data);
  return result[0].insertId;
}

export async function upvotePost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(communityPosts).set({ upvotes: sql`${communityPosts.upvotes} + 1` }).where(eq(communityPosts.id, id));
}

export async function upvoteAnswer(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(communityAnswers).set({ upvotes: sql`${communityAnswers.upvotes} + 1` }).where(eq(communityAnswers.id, id));
}

// ─── Messaging Helpers ──────────────────────────────────────────

export async function getOrCreateConversation(user1Id: number, user2Id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Normalize user IDs so order doesn't matter
  const [minId, maxId] = user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id];

  // Check if conversation exists
  const existing = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.user1Id, minId), eq(conversations.user2Id, maxId)))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Create new conversation
  const result = await db.insert(conversations).values({
    user1Id: minId,
    user2Id: maxId,
    lastMessageAt: new Date(),
  });

  return {
    id: result[0].insertId,
    user1Id: minId,
    user2Id: maxId,
    lastMessageAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function listConversations(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const convs = await db
    .select()
    .from(conversations)
    .where(or(eq(conversations.user1Id, userId), eq(conversations.user2Id, userId)))
    .orderBy(desc(conversations.lastMessageAt));

  // Enrich with other user profile and last message
  const enriched = [];
  for (const conv of convs) {
    const otherUserId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;
    const otherProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, otherUserId))
      .limit(1);

    const lastMsg = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conv.id))
      .orderBy(desc(messages.createdAt))
      .limit(1);

    enriched.push({
      ...conv,
      otherUser: otherProfile[0] || null,
      lastMessage: lastMsg[0] || null,
    });
  }

  return enriched;
}

export async function getMessages(conversationId: number, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(limit);
}

export async function sendMessage(data: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(messages).values(data);

  // Update conversation lastMessageAt
  await db
    .update(conversations)
    .set({ lastMessageAt: new Date() })
    .where(eq(conversations.id, data.conversationId));

  return result[0].insertId;
}

export async function markMessagesAsRead(conversationId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(messages)
    .set({ isRead: true })
    .where(and(eq(messages.conversationId, conversationId), eq(messages.senderId, userId)));
}
