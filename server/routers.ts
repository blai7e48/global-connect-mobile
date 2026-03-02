import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Profile Routes ──────────────────────────────────────────
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getProfileByUserId(ctx.user.id);
    }),

    getById: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return db.getProfileByUserId(input.userId);
      }),

    upsert: protectedProcedure
      .input(z.object({
        appRole: z.enum(["student", "mentor"]),
        fullName: z.string().optional(),
        bio: z.string().optional(),
        avatarUrl: z.string().optional(),
        fieldOfInterest: z.string().optional(),
        skills: z.array(z.string()).optional(),
        careerGoals: z.string().optional(),
        graduationYear: z.number().optional(),
        educationStatus: z.string().optional(),
        jobTitle: z.string().optional(),
        company: z.string().optional(),
        industry: z.string().optional(),
        location: z.string().optional(),
        yearsExperience: z.number().optional(),
        mentoringAreas: z.array(z.string()).optional(),
        availabilityPreference: z.string().optional(),
        openToStudents: z.boolean().optional(),
        onboardingCompleted: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.upsertProfile({
          userId: ctx.user.id,
          ...input,
        });
      }),
  }),

  // ─── Mentor Routes ───────────────────────────────────────────
  mentors: router({
    list: protectedProcedure
      .input(z.object({
        industry: z.string().optional(),
        location: z.string().optional(),
        search: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getMentors(input);
      }),

    students: protectedProcedure.query(async () => {
      return db.getStudents();
    }),

    matchScore: protectedProcedure
      .input(z.object({ mentorUserId: z.number() }))
      .query(async ({ ctx, input }) => {
        const studentProfile = await db.getProfileByUserId(ctx.user.id);
        const mentorProfile = await db.getProfileByUserId(input.mentorUserId);

        if (!studentProfile || !mentorProfile) return { score: 0, reasons: [] };

        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `You are an AI matching assistant. Given a student profile and a mentor profile, compute a compatibility score from 0-100 and provide 2-3 short reasons. Return JSON: {"score": number, "reasons": ["string"]}`,
              },
              {
                role: "user",
                content: `Student: ${JSON.stringify({
                  fieldOfInterest: studentProfile.fieldOfInterest,
                  skills: studentProfile.skills,
                  careerGoals: studentProfile.careerGoals,
                })}
Mentor: ${JSON.stringify({
                  industry: mentorProfile.industry,
                  jobTitle: mentorProfile.jobTitle,
                  company: mentorProfile.company,
                  mentoringAreas: mentorProfile.mentoringAreas,
                })}`,
              },
            ],
            response_format: { type: "json_object" },
          });

          const content = response.choices[0]?.message?.content;
          if (typeof content === "string") {
            return JSON.parse(content);
          }
          return { score: 0, reasons: [] };
        } catch (error) {
          console.error("[AI Match] Error:", error);
          return { score: 0, reasons: [] };
        }
      }),
  }),

  // ─── Session Routes ──────────────────────────────────────────
  sessions: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserSessions(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getSessionById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        mentorId: z.number(),
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        scheduledAt: z.string().optional(),
        durationMinutes: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createSession({
          studentId: ctx.user.id,
          mentorId: input.mentorId,
          title: input.title,
          description: input.description,
          scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
          durationMinutes: input.durationMinutes,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "accepted", "declined", "cancelled"]).optional(),
        meetingLink: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateSession(id, data);
      }),
  }),

  // ─── Community Routes ────────────────────────────────────────
  community: router({
    posts: protectedProcedure
      .input(z.object({
        sort: z.enum(["new", "popular"]).optional(),
        search: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getPosts(input?.sort || "new", input?.search);
      }),

    getPost: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getPostById(input.id);
      }),

    createPost: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(500),
        content: z.string().min(1),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createPost({
          authorId: ctx.user.id,
          ...input,
        });
      }),

    createAnswer: protectedProcedure
      .input(z.object({
        postId: z.number(),
        content: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createAnswer({
          authorId: ctx.user.id,
          ...input,
        });
      }),

    upvotePost: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.upvotePost(input.id);
      }),

    upvoteAnswer: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.upvoteAnswer(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
