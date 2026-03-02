# Global Connect — Mobile App Interface Design

## Overview

Global Connect is a professional networking mobile app that connects university students with industry mentors for career growth. The app follows Apple Human Interface Guidelines (HIG) to deliver a native iOS-quality experience with fluid animations, haptic feedback, and intuitive one-handed navigation.

## Color System

The brand palette uses a deep indigo-blue primary color to convey trust and professionalism, paired with warm accent tones for engagement.

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| Primary | #4F46E5 (Indigo 600) | #818CF8 (Indigo 400) | Buttons, links, active tab icons |
| Background | #FFFFFF | #0F0F14 | Screen backgrounds |
| Surface | #F8F8FC | #1A1A24 | Cards, elevated surfaces |
| Foreground | #1A1A2E | #F0F0F5 | Primary text |
| Muted | #6B7280 | #9CA3AF | Secondary text, placeholders |
| Border | #E5E7EB | #2D2D3A | Dividers, card borders |
| Success | #10B981 | #34D399 | Accepted sessions, verified badges |
| Warning | #F59E0B | #FBBF24 | Pending states |
| Error | #EF4444 | #F87171 | Declined, destructive actions |

## Screen List

The app has 5 tab bar items and several modal/stack screens:

### Tab Bar Screens (Bottom Navigation)
1. **Home** — Role-based dashboard (Student or Mentor)
2. **Discover** — Browse and search mentors (students) / View student requests (mentors)
3. **Sessions** — Session lifecycle management
4. **Community** — Q&A feed with posts and answers
5. **Profile** — User profile and settings

### Stack/Modal Screens
6. **Welcome** — Onboarding welcome screen (shown before auth)
7. **Login** — Authentication screen with Manus OAuth
8. **Onboarding** — Post-signup profile setup (role selection + profile fields)
9. **Mentor Detail** — Full mentor profile with session request
10. **Session Detail** — Session details with accept/decline actions
11. **Post Detail** — Community post with answers
12. **Create Post** — New community question form
13. **Edit Profile** — Edit profile fields
14. **Settings** — Account settings, notifications, privacy

## Primary Content and Functionality

### Home Screen (Dashboard)
**Student Dashboard:** Welcome greeting with user name, quick stats (pending sessions, upcoming sessions), featured mentors carousel (horizontal scroll), recent community posts preview, and a "Find a Mentor" CTA button.

**Mentor Dashboard:** Welcome greeting, incoming request count badge, upcoming sessions list, recent community activity, and a toggle for "Open to Students" availability.

### Discover Screen
**For Students:** A search bar at the top with filter chips (Industry, Location, Availability). Below, a grid/list of mentor cards showing avatar, name, job title, company, industry tag, location, and an AI match score badge. Tapping a card navigates to the Mentor Detail screen.

**For Mentors:** A list of student profiles who have shown interest or requested sessions, with basic info cards.

### Sessions Screen
Three segment tabs: **Upcoming**, **Pending**, **Past**. Each tab shows a FlatList of session cards with status badges (color-coded), mentor/student name, session title, date/time, and action buttons. Mentors see Accept/Decline buttons on pending sessions. Students see Cancel on pending sessions.

### Community Screen
A feed of Q&A posts sorted by "New" or "Popular" (toggle). Each post card shows title, tags (as colored pills), upvote count, answer count, author name, and relative time. A floating action button (FAB) opens the "Create Post" modal. A search bar filters posts by title or tags.

### Profile Screen
Displays the user's avatar, name, role badge, and bio at the top in a hero section. Below, role-specific fields are shown in grouped sections (iOS-style grouped table view). An "Edit Profile" button navigates to the edit form. A "Settings" link at the bottom.

### Settings Screen
iOS-style grouped list with sections: Account (email, display name), Notifications (toggle switches for email, push), Privacy (open-to-students toggle for mentors), and a Sign Out button at the bottom with confirmation alert.

## Key User Flows

### Student Flow: Find and Book a Mentor
1. Student opens app → Home tab (Dashboard)
2. Taps "Find a Mentor" or Discover tab
3. Browses mentor cards, uses search/filters
4. Taps a mentor card → Mentor Detail screen
5. Taps "Request Session" → Bottom sheet modal with title, description, preferred date
6. Submits → Session created with "pending" status
7. Receives notification when mentor accepts/declines
8. If accepted, sees meeting link in Session Detail

### Mentor Flow: Accept a Session
1. Mentor opens app → Home tab shows incoming request badge
2. Taps Sessions tab → Pending segment
3. Taps a pending session card → Session Detail
4. Reviews student info and session details
5. Taps "Accept" → Prompted to add meeting link
6. Session status changes to "accepted"

### Community Flow: Ask a Question
1. User taps Community tab
2. Taps FAB "+" button → Create Post modal
3. Fills in title, content, tags
4. Submits → Post appears in feed
5. Other users can tap to view, upvote, and answer

## Navigation Architecture

The app uses Expo Router with file-based routing:

```
app/
  _layout.tsx          ← Root layout (providers, auth guard)
  (tabs)/
    _layout.tsx        ← Tab bar with 5 tabs
    index.tsx          ← Home/Dashboard
    discover.tsx       ← Mentor discovery / Student requests
    sessions.tsx       ← Session management
    community.tsx      ← Q&A feed
    profile.tsx        ← User profile
  welcome.tsx          ← Welcome/onboarding intro
  login.tsx            ← Auth screen
  onboarding.tsx       ← Profile setup after signup
  mentor/[id].tsx      ← Mentor detail
  session/[id].tsx     ← Session detail
  post/[id].tsx        ← Community post detail
  create-post.tsx      ← New post form
  edit-profile.tsx     ← Edit profile form
  settings.tsx         ← Settings screen
  oauth/callback.tsx   ← OAuth callback handler
```

## Typography

The app uses the system font (San Francisco on iOS, Roboto on Android) with the following scale:

| Style | Size | Weight | Usage |
|-------|------|--------|-------|
| Large Title | 34px | Bold | Screen headers (collapsible) |
| Title 1 | 28px | Bold | Section headers |
| Title 2 | 22px | Bold | Card titles |
| Headline | 17px | Semibold | List item titles |
| Body | 17px | Regular | Body text |
| Callout | 16px | Regular | Secondary info |
| Subhead | 15px | Regular | Subtitles |
| Footnote | 13px | Regular | Timestamps, metadata |
| Caption | 12px | Regular | Labels, badges |
