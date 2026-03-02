import { relations } from "drizzle-orm";
import { users, profiles, sessions, communityPosts, communityAnswers } from "./schema";

export const usersRelations = relations(users, ({ one }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
  mentorSessions: many(sessions, { relationName: "mentorSessions" }),
  studentSessions: many(sessions, { relationName: "studentSessions" }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  mentor: one(profiles, {
    fields: [sessions.mentorId],
    references: [profiles.userId],
    relationName: "mentorSessions",
  }),
  student: one(profiles, {
    fields: [sessions.studentId],
    references: [profiles.userId],
    relationName: "studentSessions",
  }),
}));

export const communityPostsRelations = relations(communityPosts, ({ one, many }) => ({
  author: one(profiles, {
    fields: [communityPosts.authorId],
    references: [profiles.userId],
  }),
  answers: many(communityAnswers),
}));

export const communityAnswersRelations = relations(communityAnswers, ({ one }) => ({
  post: one(communityPosts, {
    fields: [communityAnswers.postId],
    references: [communityPosts.id],
  }),
  author: one(profiles, {
    fields: [communityAnswers.authorId],
    references: [profiles.userId],
  }),
}));
