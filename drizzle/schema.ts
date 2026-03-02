import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User profiles with role-specific fields for students and mentors.
 */
export const profiles = mysqlTable("profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  appRole: mysqlEnum("appRole", ["student", "mentor"]).notNull(),
  fullName: varchar("fullName", { length: 255 }),
  bio: text("bio"),
  avatarUrl: text("avatarUrl"),
  // Student fields
  fieldOfInterest: varchar("fieldOfInterest", { length: 255 }),
  skills: json("skills").$type<string[]>(),
  careerGoals: text("careerGoals"),
  graduationYear: int("graduationYear"),
  educationStatus: varchar("educationStatus", { length: 100 }),
  // Mentor fields
  jobTitle: varchar("jobTitle", { length: 255 }),
  company: varchar("company", { length: 255 }),
  industry: varchar("industry", { length: 255 }),
  location: varchar("location", { length: 255 }),
  yearsExperience: int("yearsExperience"),
  mentoringAreas: json("mentoringAreas").$type<string[]>(),
  availabilityPreference: varchar("availabilityPreference", { length: 100 }),
  openToStudents: boolean("openToStudents").default(true),
  isVerified: boolean("isVerified").default(false),
  onboardingCompleted: boolean("onboardingCompleted").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

/**
 * Mentoring sessions between students and mentors.
 */
export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  mentorId: int("mentorId").notNull(),
  studentId: int("studentId").notNull(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "accepted", "declined", "cancelled"]).default("pending").notNull(),
  scheduledAt: timestamp("scheduledAt"),
  durationMinutes: int("durationMinutes").default(60),
  meetingLink: text("meetingLink"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

/**
 * Community Q&A posts.
 */
export const communityPosts = mysqlTable("communityPosts", {
  id: int("id").autoincrement().primaryKey(),
  authorId: int("authorId").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content").notNull(),
  tags: json("tags").$type<string[]>(),
  upvotes: int("upvotes").default(0).notNull(),
  isResolved: boolean("isResolved").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = typeof communityPosts.$inferInsert;

/**
 * Answers to community posts.
 */
export const communityAnswers = mysqlTable("communityAnswers", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  authorId: int("authorId").notNull(),
  content: text("content").notNull(),
  upvotes: int("upvotes").default(0).notNull(),
  isAccepted: boolean("isAccepted").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CommunityAnswer = typeof communityAnswers.$inferSelect;
export type InsertCommunityAnswer = typeof communityAnswers.$inferInsert;
