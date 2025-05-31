# **Rooted Pilot Platform: Product Requirements Document (PRD)**

## **1\. Project Overview**

### **1.1 Objective**

Develop a scalable, production-ready community platform for Rooted™, delivering personalized, modular insights across six pillars (Breathing, Sleep Optimization, Nutrition, Movement and Training, Mindset and Focus, Relaxation and Joy) to enhance metabolic reset, sleep, movement, joy, and leadership. The MVP supports 2–3 day micro-retreats (July 2025\) for 10–20 participants, with subscription access for non-retreat users ($10/month, assumed) to offset hosting costs. Insights include supplement and nutrition suggestions, leveraging direct wearable APIs (Garmin, Apple Health) for a broader community (retreats, micro-events, mobile events).

### **1.2 Scope**

* **MVP**: Supports 20 users (10–20 micro-retreat participants, initial subscribers) with Garmin Health API and Apple Health (HealthKit) data, targeting July 2025 micro-retreats. Expandable to Android Health Connect, Whoop, Fitbit. No 6–7 day retreats or mobile events for MVP.  
* **Features**: Supabase authentication (supabase-ssr), onboarding, wearable integration, modular insights with supplements/nutrition, HRV/sleep charts, dynamic content (retreat schedules, tips), discussion board, in-app feedback, coach feedback.  
* **Out of Scope**: Payment processing, CGM integration, advanced Tribe features (e.g., event RSVPs, messaging), multi-language support, HIPAA compliance.

### **1.3 Success Metrics**

* **Technical**: 95% data sync success (wearables → Supabase → xAI → dashboard).  
* **User Engagement**: 80% of users view insights, post in discussion board, or submit feedback.  
* **Outcomes**: Positive feedback on sleep, leadership, and nutrition insights (per 97% clarity ROI, 34% fatigue, “Survey Analysis”).  
* **Business**: Team approval (Ash, Andrew, Zeger) for pilot expansion by July 2025, with 50–100 users by year-end.

## **2\. User Personas**

* **Participants**:  
  * **Profile**: High-performing leaders (“High-Velocity Expert,” 41–50, $300–800k income, per “Survey Analysis”).  
  * **Needs**: Deep, pillar-specific insights, community engagement, biometric tracking.  
  * **Access**: View dashboard, insights, charts, content; post in discussion board; submit feedback. Authenticated via Supabase (supabase-ssr).  
* **Coaches** (e.g., Ash, Andrew, Zeger):  
  * **Needs**: Monitor participant biometrics/insights, provide feedback.  
  * **Access**: View participant data, add private comments. Supabase auth with coach role.  
* **Admins**:  
  * **Needs**: Manage content, troubleshoot data.  
  * **Access**: Full Supabase/Next.js admin panel. Supabase auth with admin role.

## **3\. Functional Requirements**

### **3.1 Authentication**

* **Description**: Secure user access using Supabase Authentication with supabase-ssr.  
* **Details**:  
  * **Supabase API**:  
    * **URL**: https://bwlahjirjvlfxxiicfnj.supabase.co  
    * **Anon Public Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3bGFoamlyanZsZnh4aWljZm5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MTg1NTUsImV4cCI6MjA2NDE5NDU1NX0.SfURGItaGHNdWsv6QqVBRZxgQFeUGssnH5tyrZbM8wc  
    * **Service Role Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3bGFoamlyanZsZnh4aWljZm5qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODYxODU1NSwiZXhwIjoyMDY0MTk0NTU1fQ.d6TVVanboag-nStj4ZO5pm8D-9E5ROJsgpddrMtuXjo  
  * **Methods**: Email/password, OAuth (Google, Apple) for participants, coaches, admins.  
  * **Roles**: Participant (view/post), Coach (view/comment), Admin (full access).  
  * **Implementation**: supabase-ssr for server-side auth in Next.js (per supabase.com/docs/guides/auth/server-side/nextjs).  
  * **Storage**: User data in Supabase auth.users table, linked to users table.  
* **User Story**: As a user, I want to log in securely so I can access my dashboard.

### **3.2 Onboarding**

* **Description**: Participants create profiles and connect wearables.  
* **Details**:  
  * Form fields: email, password (Supabase auth), name, age, gender, stress level, energy level, mood (daily sliders, 1–10 scale, per “Daily”).  
  * Wearable connection via Garmin OAuth 2.0 and Apple Health (HealthKit) permissions (react-native-health).  
  * Stored in Supabase users table (user\_id, profile\_json, wearable\_id).  
  * No manual biometric entry for MVP.  
* **User Story**: As a participant, I want to input my profile and connect my wearable to receive insights.

### **3.3 Wearable Integration**

* **Description**: Fetch biometric data from Garmin and Apple Health, expandable to Android Health Connect, Whoop, Fitbit.  
* **Details**:  
  * **APIs**:  
    * **Garmin Health API** (free, OAuth 2.0): HRV, RHR, sleep (stages, duration), steps, workouts, stress, calories (per developer.garmin.com).  
    * **Apple Health (HealthKit, $8/month)**: HRV, RHR, sleep, steps, workouts, active energy (via react-native-health).  
  * **Data**: Daily sync (webhooks for Garmin, polling for HealthKit).  
  * **Storage**: Supabase biometrics table (user\_id, timestamp, metric\_type, value).  
  * **Modularity**: WearableClient interface in Next.js (e.g., GarminClient, HealthKitClient) for extensible API integration.  
  * **Wearables**: Garmin, Apple Health for MVP; Android Health Connect, Whoop, Fitbit post-MVP.  
* **User Story**: As a participant, I want my wearable data synced daily to track biometrics.

### **3.4 Insights Generation**

* **Description**: Deliver modular, pillar-specific insights with supplement/nutrition suggestions using xAI API.  
* **Details**:  
  * **Pillars and Insights** (initial set, extensible):  
    * **Breathing**: “High stress (HRV 40); try 4-7-8 breathing, take ashwagandha 300mg” (HRV, stress).  
    * **Sleep Optimization**: “Low REM (15% below norm); try 10 min yin yoga, take magnesium 200mg” (sleep stages, per 49% racing mind, “Survey Analysis”).  
    * **Nutrition**: “High workout intensity; consume 30g protein shake, add omega-3 1g” (workouts, calories, per 34% fatigue).  
    * **Movement and Training**: “High strain; switch to Tai-chi, take BCAA 5g post-workout” (workouts, HRV).  
    * **Mindset and Focus**: “Poor sleep; meditate 10 min, take L-theanine 100mg for clarity” (sleep, HRV, per 97% clarity ROI).  
    * **Relaxation and Joy**: “Elevated stress; join Tribe campfire, try lavender tea” (stress, HRV, per 46% emotional volatility).  
  * **Modularity**: Insights as Node.js modules (e.g., BreathingInsight.js) in Next.js API routes (/api/insights/\[pillar\]), triggered by Zapier on new data.  
  * **Inputs**: Wearable data (Supabase biometrics), subjective inputs (stress, energy, mood sliders, users table).  
  * **Delivery**: Dashboard notifications, daily email (via Zapier/Mailchimp).  
  * **Storage**: Supabase insights table (user\_id, pillar, text, timestamp).  
* **User Story**: As a participant, I want deep insights with supplement/nutrition suggestions to optimize my wellness.

### **3.5 Data Visualization**

* **Description**: Display biometric trends for engagement.  
* **Details**:  
  * HRV and sleep duration charts (Chart.js, static for MVP).  
  * Responsive (ShadCN components, mobile/desktop).  
  * Data from Supabase biometrics.  
* **User Story**: As a participant, I want to see HRV/sleep trends to track progress.

### **3.6 Content Delivery**

* **Description**: Serve dynamic retreat schedules and wellness tips.  
* **Details**:  
  * Dynamic content: Micro-retreat schedules (e.g., WHM breathing, HIIT, per “Madeira retreat”), wellness tips (e.g., breathwork, per “90-Day Habit Kit”).  
  * Stored in Supabase content table (id, title, body, type: schedule/tip).  
  * Displayed in dashboard (ShadCN cards, no hardcoding).  
  * Admin upload via Next.js admin panel.  
* **User Story**: As a participant, I want to access dynamic schedules and tips to follow Rooted’s program.

### **3.7 Community and Coaching**

* **Description**: Enable peer-to-peer engagement and coach feedback.  
* **Details**:  
  * **Discussion Board**: Threaded replies, likes (Supabase posts, comments tables).  
  * **Coach Feedback**: Private comments on insights (Supabase feedback table, linked to insights).  
  * **Access**: Participants post/view; coaches view biometrics/insights, add comments via dashboard.  
* **User Story**: As a participant, I want to engage with peers and receive coach feedback.

### **3.8 Feedback Collection**

* **Description**: Collect user input to refine platform.  
* **Details**:  
  * In-app form: Rating (1–5), comments (post-session, per “Survey”).  
  * Stored in Supabase feedback table.  
* **User Story**: As a participant, I want to submit feedback to improve the platform.

## **4\. Non-Functional Requirements**

* **Performance**: Page load \< 2s (Vercel CDN, per). API calls \< 500ms (Supabase).  
* **Scalability**: Handle 20 users for MVP, designed for 100+ (Supabase/Vercel Pro, $45/month post-MVP).  
* **Security**:  
  * Encrypt biometric/subjective data in Supabase (AES-256, per).  
  * GDPR compliance (Madeira): Consent via onboarding form.  
  * Supabase auth (supabase-ssr) with JWT, Garmin OAuth 2.0, HealthKit permissions.  
* **Reliability**: 99.9% uptime (Vercel, Supabase, per).  
* **UI/UX**:  
  * Mobile/desktop support (React.js, responsive).  
  * ShadCN components, OriginUI styling.  
  * **Color Palette**:  
    * Emerald Green: \#317039 (RGB: 49, 112, 57\)  
    * Maximum Yellow: \#F1BE49 (RGB: 241, 190, 73\)  
    * Antique White: \#FBEDD9 (RGB: 248, 237, 217\)  
    * Dark Pastel Red: \#CC4824 (RGB: 204, 75, 36\)  
    * Papaya Whip: \#FFF1D4 (RGB: 255, 241, 212\)  
    * Cosmic Latte: \#FFF8EB (RGB: 255, 251, 235\)  
* **Modularity**:  
  * Wearable APIs via WearableClient interface (Next.js).  
  * Insights as Node.js modules (/api/insights/\[pillar\]).  
  * Dynamic content in Supabase, no hardcoding.  
* **Development**: Node.js/Next.js prioritized over Python (e.g., insights in API routes, not Python scripts).

## **5\. Technical Architecture**

* **Frontend**: Next.js/React.js (Vercel, free tier), ShadCN components, OriginUI styling.  
* **Backend**: Supabase (free tier, PostgreSQL) with tables:  
  * auth.users: Supabase auth data.  
  * users: Profile, subjective inputs (stress, energy, mood).  
  * biometrics: Wearable data (HRV, sleep, etc.).  
  * insights: xAI-generated insights.  
  * content: Schedules, tips.  
  * posts, comments: Discussion board.  
  * feedback: User/coach feedback.  
* **APIs**:  
  * **Garmin Health API** (free, OAuth 2.0): /v1/health/dailies for HRV, sleep, activity.  
  * **Apple Health (HealthKit, $8/month)**: HKQuantityType for HRV, sleep, workouts (react-native-health).  
  * **xAI API** (\~$20/month): Insights via Next.js API routes.  
* **Authentication**: Supabase (supabase-ssr) with email/password, Google/Apple OAuth.  
* **Automation**: Zapier (free tier) triggers insights on new wearable data (webhooks for Garmin, polling for HealthKit).  
* **Data Flow**: Wearable → API client → Supabase → xAI → Dashboard/Email.

## **6\. User Stories**

* **Participant**:  
  * “I want to log in with Supabase auth to access my dashboard.”  
  * “I want to connect Garmin/Apple Health for biometric tracking.”  
  * “I want pillar-specific insights with supplement suggestions to optimize wellness.”  
  * “I want to post in the discussion board to connect with peers.”  
* **Coach**:  
  * “I want to view participant biometrics/insights to provide private feedback.”  
* **Admin**:  
  * “I want to upload dynamic content (schedules, tips) with no hardcoding.”

## **7\. Prioritization**

* **Must-Have** (MVP, July 2025):  
  * Supabase auth (supabase-ssr), onboarding, Garmin/Apple Health integration, 6 modular insights (1 per pillar with supplements), HRV/sleep chart, dynamic content, discussion board, feedback form, coach view/comments.  
* **Nice-to-Have** (Post-MVP):  
  * Android Health Connect, Whoop, Fitbit integration.  
  * Predictive insights (e.g., fatigue risk).  
  * Stripe for subscriptions ($10/month).  
  * Event RSVPs, direct messaging.

## **8\. Timeline and Milestones**

* **Duration**: 4–6 weeks (June 2–July 11, 2025, flexible).  
* **Week 1 (June 2–8)**:  
  * Initialize Next.js (dev server), Vercel, Supabase.  
  * Set up supabase-ssr auth (email, Google, Apple).  
  * Configure Garmin OAuth 2.0, Apple Health (react-native-health).  
* **Week 2 (June 9–15)**:  
  * Integrate wearable APIs, sync data to Supabase.  
  * Develop 6 modular insights (Node.js, /api/insights/\[pillar\]).  
* **Week 3 (June 16–22)**:  
  * Build dashboard (ShadCN, Chart.js), discussion board, feedback form.  
  * Set up Zapier triggers, coach view.  
* **Week 4 (June 23–29)**:  
  * Test with your Garmin/Apple Health data (3–5 days).  
  * Polish UI (OriginUI, palette), debug with Grok/Cursor.  
* **Week 5–6 (June 30–July 11, optional)**:  
  * Demo to team (Ash, Andrew, Zeger).  
  * Prepare for July micro-retreats.

## **9\. Assumptions and Risks**

* **Assumptions**:  
  * Garmin API access approved by June 5, 2025 (2 days, per developer.garmin.com).  
  * Your Garmin/Apple Health data sufficient for MVP testing.  
  * xAI API supports modular insights (\~$20/month).  
  * Supabase/Vercel free tiers handle 20 users.  
  * $10/month subscription offsets future costs (Vercel/Supabase Pro, $45/month).  
* **Risks**:  
  * **Garmin Approval Delay**: Mitigate with Apple Health focus.  
  * **Zapier Limits**: Free tier (100 tasks) may restrict triggers; use Next.js API routes if needed.  
  * **xAI Costs**: Unclear pricing; confirm at x.ai/api.  
  * **Timeline Slippage**: Flexible 4–6 weeks; prioritize sleep/nutrition insights if delayed.

## **10\. Appendix**

* **Color Palette**:  
  * Emerald Green: \#317039 (RGB: 49, 112, 57\)  
  * Maximum Yellow: \#F1BE49 (RGB: 241, 190, 73\)  
  * Antique White: \#FBEDD9 (RGB: 248, 237, 217\)  
  * Dark Pastel Red: \#CC4824 (RGB: 204, 75, 36\)  
  * Papaya Whip: \#FFF1D4 (RGB: 255, 241, 212\)  
  * Cosmic Latte: \#FFF8EB (RGB: 255, 251, 235\)  
* **API Endpoints** (examples):  
  * Garmin: /v1/health/dailies (HRV, sleep, activity).  
  * Apple Health: HKQuantityType (HRV, sleep, workouts).  
  * Supabase: https://bwlahjirjvlfxxiicfnj.supabase.co (auth, REST).  
* **References**:  
  * “Onepager Rooted”: Pillars, insights, outcomes (12% HRV rise).  
  * “Survey Analysis”: Needs (49% racing mind, 34% fatigue, 46% emotional volatility).  
  * “Madeira retreat”: Schedule (WHM breathing, HIIT).

rooted-platform/  
├── app/  
│   ├── api/  
│   │   ├── insights/  
│   │   │   ├── \[pillar\]/  
│   │   │   │   └── route.ts        \# Modular insight routes (Node.js)  
│   │   └── auth/  
│   │       └── route.ts            \# Supabase auth endpoints  
│   ├── dashboard/  
│   │   ├── page.tsx                \# Main dashboard (insights, charts)  
│   │   └── layout.tsx              \# Dashboard layout  
│   ├── onboarding/  
│   │   └── page.tsx                \# Onboarding form  
│   ├── community/  
│   │   └── page.tsx                \# Discussion board  
│   ├── globals.css                 \# Tailwind/OriginUI styles  
│   ├── layout.tsx                  \# Root layout (auth, nav)  
│   └── page.tsx                    \# Home page  
├── components/  
│   ├── ui/                         \# ShadCN components (e.g., button, card)  
│   ├── Dashboard.tsx               \# Dashboard component  
│   ├── OnboardingForm.tsx          \# Onboarding form  
│   ├── DiscussionBoard.tsx         \# Community board  
│   └── InsightCard.tsx             \# Insight display  
├── lib/  
│   ├── supabase.ts                 \# Supabase client (supabase-ssr)  
│   ├── wearableClient.ts           \# Wearable API interface (Garmin, Apple)  
│   └── xaiClient.ts                \# xAI API client  
├── types/  
│   └── index.ts                    \# TypeScript types (user, biometrics)  
├── utils/  
│   └── constants.ts                \# Color palette, configs  
├── public/  
│   ├── favicon.ico  
│   └── logo.png                    \# Rooted™ logo (add later)  
├── package.json  
├── tsconfig.json  
├── tailwind.config.ts  
├── next.config.mjs  
└── .env.local                      \# Environment variables

