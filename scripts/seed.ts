/**
 * Seed script for Global Connect demo database.
 * Populates realistic mentors, students, sessions, community posts, and answers.
 *
 * Run: npx tsx scripts/seed.ts
 */
import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
import {
  users,
  profiles,
  sessions,
  communityPosts,
  communityAnswers,
} from "../drizzle/schema";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const db = drizzle(DATABASE_URL);

// ─── Avatar URLs (randomuser.me) ────────────────────────────────
const maleAvatars = Array.from({ length: 30 }, (_, i) => `https://randomuser.me/api/portraits/men/${i + 10}.jpg`);
const femaleAvatars = Array.from({ length: 30 }, (_, i) => `https://randomuser.me/api/portraits/women/${i + 10}.jpg`);

// ─── Mentor Data ────────────────────────────────────────────────
const mentorData = [
  {
    openId: "demo_mentor_001", name: "Dr. Priya Sharma", email: "priya.sharma@example.com",
    fullName: "Dr. Priya Sharma", bio: "Former Google AI Research Lead with 15+ years in machine learning and natural language processing. I love helping students navigate the complex world of AI careers. Published 40+ papers in top conferences.",
    avatarUrl: femaleAvatars[0], jobTitle: "AI Research Director", company: "Google DeepMind", industry: "Technology",
    location: "San Francisco, CA", yearsExperience: 15, mentoringAreas: ["Machine Learning", "Research Careers", "PhD Applications", "AI Ethics"],
    availabilityPreference: "Weekday evenings",
  },
  {
    openId: "demo_mentor_002", name: "Marcus Thompson", email: "marcus.t@example.com",
    fullName: "Marcus Thompson", bio: "VP of Engineering at Stripe. Built engineering teams from 5 to 200+. Passionate about mentoring underrepresented students in tech. Stanford CS alum.",
    avatarUrl: maleAvatars[0], jobTitle: "VP of Engineering", company: "Stripe", industry: "FinTech",
    location: "New York, NY", yearsExperience: 18, mentoringAreas: ["Engineering Leadership", "System Design", "Career Growth", "Startup Culture"],
    availabilityPreference: "Weekends",
  },
  {
    openId: "demo_mentor_003", name: "Elena Rodriguez", email: "elena.r@example.com",
    fullName: "Elena Rodriguez", bio: "Product Design Lead at Apple. 12 years crafting intuitive user experiences for millions. I help aspiring designers build portfolios that stand out and land dream roles.",
    avatarUrl: femaleAvatars[1], jobTitle: "Senior Design Lead", company: "Apple", industry: "Design",
    location: "Cupertino, CA", yearsExperience: 12, mentoringAreas: ["UX Design", "Portfolio Review", "Design Systems", "Career Transitions"],
    availabilityPreference: "Flexible",
  },
  {
    openId: "demo_mentor_004", name: "James Chen", email: "james.chen@example.com",
    fullName: "James Chen", bio: "Partner at Andreessen Horowitz focused on early-stage B2B SaaS. Previously co-founded two startups (one acquired by Salesforce). Happy to help students thinking about entrepreneurship.",
    avatarUrl: maleAvatars[1], jobTitle: "General Partner", company: "Andreessen Horowitz", industry: "Venture Capital",
    location: "Menlo Park, CA", yearsExperience: 20, mentoringAreas: ["Fundraising", "Startup Strategy", "Product-Market Fit", "Pitch Decks"],
    availabilityPreference: "Weekday mornings",
  },
  {
    openId: "demo_mentor_005", name: "Amara Okafor", email: "amara.o@example.com",
    fullName: "Amara Okafor", bio: "Data Science Manager at Netflix. I specialize in recommendation systems and A/B testing at scale. Mentored 30+ junior data scientists into senior roles.",
    avatarUrl: femaleAvatars[2], jobTitle: "Data Science Manager", company: "Netflix", industry: "Entertainment",
    location: "Los Angeles, CA", yearsExperience: 10, mentoringAreas: ["Data Science", "A/B Testing", "Python", "Interview Prep"],
    availabilityPreference: "Weekday evenings",
  },
  {
    openId: "demo_mentor_006", name: "David Park", email: "david.park@example.com",
    fullName: "David Park", bio: "Staff Software Engineer at Meta working on React Native core. Open source contributor and conference speaker. Love helping new developers find their path in mobile development.",
    avatarUrl: maleAvatars[2], jobTitle: "Staff Software Engineer", company: "Meta", industry: "Technology",
    location: "Seattle, WA", yearsExperience: 11, mentoringAreas: ["React Native", "Mobile Development", "Open Source", "Technical Interviews"],
    availabilityPreference: "Weekends",
  },
  {
    openId: "demo_mentor_007", name: "Sarah Mitchell", email: "sarah.m@example.com",
    fullName: "Sarah Mitchell", bio: "Chief Marketing Officer at HubSpot. 16 years in B2B marketing, from content strategy to growth hacking. I help students understand the intersection of marketing and technology.",
    avatarUrl: femaleAvatars[3], jobTitle: "Chief Marketing Officer", company: "HubSpot", industry: "Marketing",
    location: "Boston, MA", yearsExperience: 16, mentoringAreas: ["Digital Marketing", "Content Strategy", "Growth Hacking", "Brand Building"],
    availabilityPreference: "Flexible",
  },
  {
    openId: "demo_mentor_008", name: "Robert Williams", email: "robert.w@example.com",
    fullName: "Robert Williams", bio: "Managing Director at Goldman Sachs. 22 years in investment banking and asset management. Committed to helping first-generation college students break into finance.",
    avatarUrl: maleAvatars[3], jobTitle: "Managing Director", company: "Goldman Sachs", industry: "Finance",
    location: "New York, NY", yearsExperience: 22, mentoringAreas: ["Investment Banking", "Financial Modeling", "Networking", "Career Planning"],
    availabilityPreference: "Weekday mornings",
  },
  {
    openId: "demo_mentor_009", name: "Lisa Nakamura", email: "lisa.n@example.com",
    fullName: "Lisa Nakamura", bio: "Head of Product at Figma. Previously PM at Airbnb and Uber. I'm passionate about helping aspiring PMs develop their product sense and land their first PM role.",
    avatarUrl: femaleAvatars[4], jobTitle: "Head of Product", company: "Figma", industry: "Technology",
    location: "San Francisco, CA", yearsExperience: 13, mentoringAreas: ["Product Management", "User Research", "Roadmapping", "PM Interviews"],
    availabilityPreference: "Weekday evenings",
  },
  {
    openId: "demo_mentor_010", name: "Ahmed Hassan", email: "ahmed.h@example.com",
    fullName: "Ahmed Hassan", bio: "Principal Cloud Architect at AWS. Built infrastructure serving billions of requests. I help students understand cloud computing, DevOps, and how to architect systems at scale.",
    avatarUrl: maleAvatars[4], jobTitle: "Principal Cloud Architect", company: "Amazon Web Services", industry: "Cloud Computing",
    location: "Austin, TX", yearsExperience: 14, mentoringAreas: ["Cloud Architecture", "DevOps", "System Design", "AWS Certifications"],
    availabilityPreference: "Weekends",
  },
  {
    openId: "demo_mentor_011", name: "Dr. Michelle Lee", email: "michelle.l@example.com",
    fullName: "Dr. Michelle Lee", bio: "Biotech researcher turned startup founder. CEO of GenomicsAI, a Series B startup using AI for drug discovery. I bridge the gap between science and entrepreneurship.",
    avatarUrl: femaleAvatars[5], jobTitle: "CEO & Co-Founder", company: "GenomicsAI", industry: "Biotech",
    location: "Cambridge, MA", yearsExperience: 17, mentoringAreas: ["Biotech Careers", "Science Entrepreneurship", "Fundraising", "PhD to Industry"],
    availabilityPreference: "Flexible",
  },
  {
    openId: "demo_mentor_012", name: "Carlos Mendez", email: "carlos.m@example.com",
    fullName: "Carlos Mendez", bio: "Creative Director at Nike. 14 years shaping brand identities for global companies. I help students develop their creative voice and build compelling brand narratives.",
    avatarUrl: maleAvatars[5], jobTitle: "Creative Director", company: "Nike", industry: "Consumer Goods",
    location: "Portland, OR", yearsExperience: 14, mentoringAreas: ["Brand Design", "Creative Direction", "Visual Storytelling", "Portfolio Building"],
    availabilityPreference: "Weekday evenings",
  },
];

// ─── Student Data ───────────────────────────────────────────────
const studentData = [
  {
    openId: "demo_student_001", name: "Alex Rivera", email: "alex.r@university.edu",
    fullName: "Alex Rivera", bio: "Junior CS student at MIT. Interested in AI/ML and building products that make a difference. Looking for mentorship in transitioning from academia to industry.",
    avatarUrl: maleAvatars[10], fieldOfInterest: "Artificial Intelligence", skills: ["Python", "TensorFlow", "React", "SQL"],
    careerGoals: "Become an ML engineer at a top tech company and eventually lead an AI research team.", graduationYear: 2026, educationStatus: "Undergraduate",
  },
  {
    openId: "demo_student_002", name: "Jordan Taylor", email: "jordan.t@university.edu",
    fullName: "Jordan Taylor", bio: "MBA candidate at Wharton focusing on tech entrepreneurship. Previously worked as a software engineer for 3 years. Looking to start my own company.",
    avatarUrl: maleAvatars[11], fieldOfInterest: "Entrepreneurship", skills: ["Business Strategy", "JavaScript", "Product Management", "Financial Analysis"],
    careerGoals: "Launch a B2B SaaS startup in the EdTech space.", graduationYear: 2026, educationStatus: "Graduate",
  },
  {
    openId: "demo_student_003", name: "Maya Patel", email: "maya.p@university.edu",
    fullName: "Maya Patel", bio: "Senior Design student at RISD. Passionate about creating accessible digital experiences. Currently building my UX portfolio for full-time roles.",
    avatarUrl: femaleAvatars[10], fieldOfInterest: "UX Design", skills: ["Figma", "User Research", "Prototyping", "Design Systems", "HTML/CSS"],
    careerGoals: "Land a product design role at a company that values accessibility and inclusive design.", graduationYear: 2026, educationStatus: "Undergraduate",
  },
  {
    openId: "demo_student_004", name: "Ethan Brooks", email: "ethan.b@university.edu",
    fullName: "Ethan Brooks", bio: "Sophomore studying Data Science at UC Berkeley. Love working with large datasets and finding patterns. Active in the campus data science club.",
    avatarUrl: maleAvatars[12], fieldOfInterest: "Data Science", skills: ["Python", "R", "Pandas", "Machine Learning", "Tableau"],
    careerGoals: "Become a data scientist at a company solving real-world problems with data.", graduationYear: 2027, educationStatus: "Undergraduate",
  },
  {
    openId: "demo_student_005", name: "Sophia Kim", email: "sophia.k@university.edu",
    fullName: "Sophia Kim", bio: "First-gen college student at NYU Stern studying Finance. Eager to break into investment banking. Active in the Women in Finance club.",
    avatarUrl: femaleAvatars[11], fieldOfInterest: "Finance", skills: ["Financial Modeling", "Excel", "Bloomberg Terminal", "Valuation"],
    careerGoals: "Secure a summer analyst position at a bulge bracket bank and eventually become a portfolio manager.", graduationYear: 2027, educationStatus: "Undergraduate",
  },
  {
    openId: "demo_student_006", name: "Liam O'Connor", email: "liam.o@university.edu",
    fullName: "Liam O'Connor", bio: "Graduate student in Computer Science at Stanford. Focused on distributed systems and cloud infrastructure. Looking for guidance on transitioning to a cloud architect role.",
    avatarUrl: maleAvatars[13], fieldOfInterest: "Cloud Computing", skills: ["AWS", "Kubernetes", "Go", "Terraform", "Docker"],
    careerGoals: "Become a senior cloud architect and contribute to open-source infrastructure projects.", graduationYear: 2026, educationStatus: "Graduate",
  },
  {
    openId: "demo_student_007", name: "Zara Ahmed", email: "zara.a@university.edu",
    fullName: "Zara Ahmed", bio: "Junior studying Marketing and Computer Science at Northwestern. Interested in the intersection of technology and brand strategy.",
    avatarUrl: femaleAvatars[12], fieldOfInterest: "Marketing Technology", skills: ["Google Analytics", "SEO", "Content Marketing", "Python", "Social Media"],
    careerGoals: "Lead digital marketing strategy at a high-growth tech startup.", graduationYear: 2027, educationStatus: "Undergraduate",
  },
  {
    openId: "demo_student_008", name: "Noah Washington", email: "noah.w@university.edu",
    fullName: "Noah Washington", bio: "Senior studying Biomedical Engineering at Johns Hopkins. Fascinated by the potential of AI in healthcare. Published a paper on medical image analysis.",
    avatarUrl: maleAvatars[14], fieldOfInterest: "Biotech", skills: ["MATLAB", "Python", "Bioinformatics", "Machine Learning", "Lab Research"],
    careerGoals: "Work at the intersection of AI and drug discovery, potentially pursuing a PhD.", graduationYear: 2026, educationStatus: "Undergraduate",
  },
];

// ─── Community Posts ────────────────────────────────────────────
const postData = [
  {
    title: "How do you prepare for system design interviews at FAANG?",
    content: "I have a system design interview coming up at Google in 3 weeks. I've been reading 'Designing Data-Intensive Applications' but I'm not sure if that's enough. What resources and strategies have worked for you? I'm particularly struggling with estimating capacity and choosing between different database types.",
    tags: ["interviews", "system-design", "career"],
    upvotes: 47,
    isResolved: true,
  },
  {
    title: "Is a Master's degree worth it for breaking into Data Science?",
    content: "I'm a self-taught data analyst with 2 years of experience. I can do SQL, Python, and basic ML. I'm considering a Master's in Data Science but the cost is significant. For those who made the transition — was the degree necessary, or could I break in through bootcamps and portfolio projects?",
    tags: ["data-science", "education", "career-advice"],
    upvotes: 35,
    isResolved: false,
  },
  {
    title: "Best resources for learning React Native in 2026?",
    content: "I'm a web developer (React/Next.js) looking to transition into mobile development. React Native seems like the natural choice. What are the best up-to-date resources? I've seen Expo has changed a lot recently. Any recommended courses, YouTube channels, or project ideas for building a portfolio?",
    tags: ["react-native", "mobile-dev", "learning"],
    upvotes: 28,
    isResolved: true,
  },
  {
    title: "How to negotiate your first tech salary — lessons learned",
    content: "Just finished negotiating my first offer and wanted to share what I learned. I got a 25% increase from the initial offer by: 1) Having competing offers, 2) Researching Levels.fyi data, 3) Focusing on total comp not just base, 4) Being willing to walk away. The hardest part was overcoming the fear of losing the offer entirely. Happy to answer questions!",
    tags: ["salary", "negotiation", "career"],
    upvotes: 92,
    isResolved: false,
  },
  {
    title: "Transitioning from academia to industry — what I wish I knew",
    content: "After 5 years in a PhD program, I just made the jump to industry as an ML engineer. Here are things I wish someone told me: 1) Your research skills are more valuable than you think, 2) Learn to communicate without jargon, 3) Production code is very different from research code, 4) Networking matters more than publications for industry roles.",
    tags: ["academia", "career-transition", "machine-learning"],
    upvotes: 64,
    isResolved: false,
  },
  {
    title: "What does a typical day look like for a Product Manager?",
    content: "I'm a CS student considering PM roles instead of engineering. I understand the theory but I'm curious about the day-to-day reality. PMs out there — what does your typical week look like? How much of it is meetings vs. strategy vs. data analysis? And do you miss coding?",
    tags: ["product-management", "career", "day-in-the-life"],
    upvotes: 41,
    isResolved: true,
  },
  {
    title: "Building a personal brand on LinkedIn as a student — tips?",
    content: "I've heard that having a strong LinkedIn presence can help with job hunting. But as a student with limited experience, I'm not sure what to post about. Those of you who've built a following — what kind of content resonates? How often should I post? Any tips for standing out without seeming inauthentic?",
    tags: ["linkedin", "personal-brand", "networking"],
    upvotes: 23,
    isResolved: false,
  },
  {
    title: "Open source contributions — where to start as a beginner?",
    content: "I want to start contributing to open source to build my resume and skills, but most projects seem overwhelming. Where did you start? Are there specific projects or programs (like Google Summer of Code) that are beginner-friendly? I know JavaScript/TypeScript and Python.",
    tags: ["open-source", "beginner", "programming"],
    upvotes: 56,
    isResolved: true,
  },
];

// ─── Community Answers ──────────────────────────────────────────
const answerData: { postIndex: number; content: string; upvotes: number; isAccepted: boolean }[] = [
  // Answers to post 0 (system design)
  { postIndex: 0, content: "The best approach I found was: 1) Study the 'System Design Interview' book by Alex Xu, 2) Practice on Excalidraw drawing architectures, 3) Watch mock interviews on YouTube (especially the Gaurav Sen channel). For capacity estimation, just memorize the common numbers (QPS for different services, storage sizes). Good luck!", upvotes: 31, isAccepted: true },
  { postIndex: 0, content: "I'd add that doing 2-3 mock interviews with friends is invaluable. The real challenge isn't knowledge — it's communicating your thought process clearly under time pressure. Also, don't forget to ask clarifying questions at the start. That's what interviewers look for.", upvotes: 18, isAccepted: false },
  // Answers to post 1 (Master's degree)
  { postIndex: 1, content: "I broke into DS without a Master's, but it took longer. The degree gives you structured learning and a network. If you can afford it and get into a good program (Georgia Tech's online MSCS is affordable), I'd recommend it. But if cost is a concern, a strong portfolio with Kaggle competitions and real projects can work too.", upvotes: 22, isAccepted: false },
  { postIndex: 1, content: "Honestly, it depends on the company. Many startups don't care about degrees, but larger companies and finance firms often filter for Master's/PhD. Consider what type of company you want to work at and decide accordingly.", upvotes: 15, isAccepted: false },
  // Answers to post 2 (React Native)
  { postIndex: 2, content: "The official Expo docs are honestly the best starting point now. They've improved massively. After that, check out William Candillon's YouTube channel for animations and Catalin Miron for beautiful UI implementations. For a project, try building a full CRUD app with authentication — that covers most patterns you'll need.", upvotes: 19, isAccepted: true },
  // Answers to post 3 (salary negotiation)
  { postIndex: 3, content: "This is gold! I'd add one more tip: always negotiate via email, not phone. It gives you time to think and creates a paper trail. Also, don't reveal your current salary — in many states it's actually illegal for them to ask.", upvotes: 44, isAccepted: false },
  { postIndex: 3, content: "25% increase is impressive! For anyone reading this — the key insight is that companies expect you to negotiate. The initial offer is almost never the best they can do. I've been on the hiring side and we always have a buffer built in.", upvotes: 38, isAccepted: false },
  // Answers to post 4 (academia to industry)
  { postIndex: 4, content: "This resonates so much. I'd add: learn Git properly (not just basic commits), get comfortable with code reviews, and understand CI/CD pipelines. These are things academia never teaches but industry assumes you know from day one.", upvotes: 29, isAccepted: false },
  // Answers to post 5 (PM day-to-day)
  { postIndex: 5, content: "Typical week for me: ~40% meetings (standups, stakeholder syncs, user interviews), ~25% writing specs and analyzing data, ~20% strategy and roadmap planning, ~15% ad-hoc fires and cross-team coordination. I do miss coding sometimes, but I love the breadth of impact. The best PMs I know still code on side projects to stay sharp.", upvotes: 26, isAccepted: true },
  { postIndex: 5, content: "It varies hugely by company. At a startup, you'll wear many hats and might still code. At a big company, it's more about influence without authority and navigating politics. Both have their merits. I'd suggest doing a PM internship before committing.", upvotes: 17, isAccepted: false },
  // Answers to post 7 (open source)
  { postIndex: 7, content: "Start with 'good first issue' labels on GitHub. Some great beginner-friendly projects: freeCodeCamp, Exercism, and Gatsby. Also, documentation contributions count! Many maintainers are grateful for docs improvements. Google Summer of Code and Hacktoberfest are excellent structured programs to get started.", upvotes: 33, isAccepted: true },
  { postIndex: 7, content: "I started by fixing typos in docs, then moved to small bug fixes, and now I'm a regular contributor to a mid-size project. The key is consistency — even 1 PR per week builds up. Also, join the project's Discord/Slack. Maintainers are usually very helpful to newcomers.", upvotes: 21, isAccepted: false },
];

// ─── Session Data ───────────────────────────────────────────────
// Sessions reference mentor/student by their userId (which we'll know after insert)
const sessionTemplates = [
  { mentorIdx: 0, studentIdx: 0, title: "ML Career Path Discussion", description: "Discuss transitioning from academic ML research to industry. Cover resume tips, interview prep, and team selection.", status: "accepted" as const, daysFromNow: 3, durationMinutes: 60 },
  { mentorIdx: 2, studentIdx: 2, title: "UX Portfolio Review", description: "Review Maya's current portfolio pieces and provide feedback on case study structure, visual presentation, and storytelling.", status: "accepted" as const, daysFromNow: 5, durationMinutes: 45 },
  { mentorIdx: 3, studentIdx: 1, title: "Startup Fundraising 101", description: "Walk through the basics of seed fundraising: pitch deck structure, valuation, term sheets, and investor outreach strategy.", status: "pending" as const, daysFromNow: 7, durationMinutes: 60 },
  { mentorIdx: 4, studentIdx: 3, title: "Data Science Interview Prep", description: "Practice SQL and Python coding questions commonly asked in DS interviews. Review probability and statistics concepts.", status: "accepted" as const, daysFromNow: -2, durationMinutes: 90 },
  { mentorIdx: 7, studentIdx: 4, title: "Breaking into Investment Banking", description: "Discuss the IB recruiting timeline, networking strategies, and how to prepare for superday interviews.", status: "accepted" as const, daysFromNow: 1, durationMinutes: 60 },
  { mentorIdx: 9, studentIdx: 5, title: "AWS Architecture Deep Dive", description: "Review Liam's cloud architecture project and discuss best practices for designing highly available distributed systems.", status: "pending" as const, daysFromNow: 10, durationMinutes: 60 },
  { mentorIdx: 6, studentIdx: 6, title: "Digital Marketing Strategy Session", description: "Explore growth marketing frameworks and how to build a data-driven marketing strategy for tech companies.", status: "accepted" as const, daysFromNow: -5, durationMinutes: 45 },
  { mentorIdx: 10, studentIdx: 7, title: "AI in Healthcare — Career Paths", description: "Discuss career options at the intersection of AI and biotech. Cover PhD vs. industry, startup vs. big pharma.", status: "pending" as const, daysFromNow: 14, durationMinutes: 60 },
  { mentorIdx: 5, studentIdx: 0, title: "React Native Best Practices", description: "Review Alex's mobile app project and discuss React Native performance optimization, state management, and testing strategies.", status: "declined" as const, daysFromNow: -10, durationMinutes: 60 },
  { mentorIdx: 1, studentIdx: 1, title: "Engineering Leadership Fundamentals", description: "Discuss what it takes to transition from IC to engineering manager. Cover 1:1s, team building, and technical decision-making.", status: "accepted" as const, daysFromNow: 8, durationMinutes: 60 },
];

// ─── Main Seed Function ─────────────────────────────────────────
async function seed() {
  console.log("🌱 Starting database seed...\n");

  // Clear existing demo data (keep real users)
  console.log("🧹 Clearing existing demo data...");
  await db.delete(communityAnswers).where(sql`1=1`);
  await db.delete(communityPosts).where(sql`1=1`);
  await db.delete(sessions).where(sql`1=1`);
  await db.delete(profiles).where(sql`1=1`);
  // Only delete demo users (openId starting with 'demo_')
  await db.delete(users).where(sql`openId LIKE 'demo_%'`);
  console.log("  ✓ Cleared\n");

  // Insert mentor users
  console.log("👨‍🏫 Inserting mentors...");
  const mentorUserIds: number[] = [];
  for (const m of mentorData) {
    const result = await db.insert(users).values({
      openId: m.openId,
      name: m.name,
      email: m.email,
      loginMethod: "google",
      role: "user",
    });
    mentorUserIds.push(result[0].insertId);
    console.log(`  ✓ ${m.fullName} (userId: ${result[0].insertId})`);
  }

  // Insert mentor profiles
  console.log("\n📋 Creating mentor profiles...");
  for (let i = 0; i < mentorData.length; i++) {
    const m = mentorData[i];
    await db.insert(profiles).values({
      userId: mentorUserIds[i],
      appRole: "mentor",
      fullName: m.fullName,
      bio: m.bio,
      avatarUrl: m.avatarUrl,
      jobTitle: m.jobTitle,
      company: m.company,
      industry: m.industry,
      location: m.location,
      yearsExperience: m.yearsExperience,
      mentoringAreas: m.mentoringAreas,
      availabilityPreference: m.availabilityPreference,
      openToStudents: true,
      isVerified: i < 8, // First 8 mentors are verified
      onboardingCompleted: true,
    });
    console.log(`  ✓ ${m.fullName} — ${m.jobTitle} at ${m.company}`);
  }

  // Insert student users
  console.log("\n🎓 Inserting students...");
  const studentUserIds: number[] = [];
  for (const s of studentData) {
    const result = await db.insert(users).values({
      openId: s.openId,
      name: s.name,
      email: s.email,
      loginMethod: "google",
      role: "user",
    });
    studentUserIds.push(result[0].insertId);
    console.log(`  ✓ ${s.fullName} (userId: ${result[0].insertId})`);
  }

  // Insert student profiles
  console.log("\n📋 Creating student profiles...");
  for (let i = 0; i < studentData.length; i++) {
    const s = studentData[i];
    await db.insert(profiles).values({
      userId: studentUserIds[i],
      appRole: "student",
      fullName: s.fullName,
      bio: s.bio,
      avatarUrl: s.avatarUrl,
      fieldOfInterest: s.fieldOfInterest,
      skills: s.skills,
      careerGoals: s.careerGoals,
      graduationYear: s.graduationYear,
      educationStatus: s.educationStatus,
      onboardingCompleted: true,
    });
    console.log(`  ✓ ${s.fullName} — ${s.fieldOfInterest}`);
  }

  // Insert sessions
  console.log("\n📅 Creating mentoring sessions...");
  for (const st of sessionTemplates) {
    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + st.daysFromNow);
    scheduledAt.setHours(10 + Math.floor(Math.random() * 8), 0, 0, 0);

    await db.insert(sessions).values({
      mentorId: mentorUserIds[st.mentorIdx],
      studentId: studentUserIds[st.studentIdx],
      title: st.title,
      description: st.description,
      status: st.status,
      scheduledAt,
      durationMinutes: st.durationMinutes,
      meetingLink: st.status === "accepted" ? `https://meet.google.com/abc-${Math.random().toString(36).slice(2, 6)}-xyz` : null,
      notes: st.status === "accepted" && st.daysFromNow < 0 ? "Great session! Covered all planned topics. Follow-up action items shared via email." : null,
    });
    console.log(`  ✓ ${st.title} (${st.status})`);
  }

  // Insert community posts (authored by mix of students and mentors)
  console.log("\n💬 Creating community posts...");
  const postAuthorIds = [
    studentUserIds[0], studentUserIds[3], studentUserIds[0], mentorUserIds[1],
    mentorUserIds[0], studentUserIds[2], studentUserIds[6], studentUserIds[5],
  ];
  const postIds: number[] = [];
  for (let i = 0; i < postData.length; i++) {
    const p = postData[i];
    // Stagger creation dates for realism
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - (postData.length - i) * 3 - Math.floor(Math.random() * 5));

    const result = await db.insert(communityPosts).values({
      authorId: postAuthorIds[i],
      title: p.title,
      content: p.content,
      tags: p.tags,
      upvotes: p.upvotes,
      isResolved: p.isResolved,
    });
    postIds.push(result[0].insertId);
    console.log(`  ✓ "${p.title.slice(0, 50)}..." (${p.upvotes} upvotes)`);
  }

  // Insert community answers
  console.log("\n💡 Creating community answers...");
  // Assign answer authors (mix of mentors and students)
  const answerAuthorPool = [
    mentorUserIds[5], mentorUserIds[1], mentorUserIds[4], studentUserIds[1],
    mentorUserIds[5], studentUserIds[4], mentorUserIds[7], mentorUserIds[0],
    mentorUserIds[8], studentUserIds[3], mentorUserIds[5], studentUserIds[5],
  ];
  for (let i = 0; i < answerData.length; i++) {
    const a = answerData[i];
    await db.insert(communityAnswers).values({
      postId: postIds[a.postIndex],
      authorId: answerAuthorPool[i % answerAuthorPool.length],
      content: a.content,
      upvotes: a.upvotes,
      isAccepted: a.isAccepted,
    });
    console.log(`  ✓ Answer to post #${a.postIndex + 1} (${a.upvotes} upvotes${a.isAccepted ? ", accepted" : ""})`);
  }

  console.log("\n✅ Seed complete!");
  console.log(`   📊 Summary:`);
  console.log(`   • ${mentorData.length} mentors`);
  console.log(`   • ${studentData.length} students`);
  console.log(`   • ${sessionTemplates.length} sessions`);
  console.log(`   • ${postData.length} community posts`);
  console.log(`   • ${answerData.length} community answers`);
  console.log(`   • Total: ${mentorData.length + studentData.length + sessionTemplates.length + postData.length + answerData.length} records\n`);

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
