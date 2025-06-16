# **Product Requirements Document (PRD): The ROOTED Way Platform**

## **1\. Product Overview**

### **1.1 Purpose**

The ROOTED Way is a tailored digital platform to foster community, engagement, and personal growth for Rooted™ members, aligning with the mission to redefine modern leadership through wellness, connection, and embodied practices. It serves as a hub for community interaction, event planning (details and schedules, not bookings), content delivery, and personalized wellness insights. The platform integrates wearable data, provides AI-driven recommendations, and enables feedback loops for facilitators. Authentication is implemented using Supabase's Server-Side Rendering (SSR) library (@supabase/ssr), not Auth.js, with a trigger to create an entry in a public users table upon user signup, secured by Row-Level Security (RLS) policies.

### **1.2 Target Audience**

* **Community Members**: Individuals in the Rooted™ community, including retreat attendees and online participants, seeking connection, wellness resources, and leadership growth.  
* **Facilitators**: Rooted™ coaches and practitioners who guide members and monitor progress.  
* **Admins**: Rooted™ team members managing the platform, content, and settings.

### **1.3 Key Features**

1. **Community Platform for Events and Engagement**:  
   * Spaces for discussions, polls, and real-time chat.  
   * Event planning (e.g., Madeira retreat schedules) with RSVP tracking.  
   * Dynamic activity feed for updates.  
2. **Wearable Data Integration**:  
   * Sync with wearables (e.g., Oura Ring, Whoop) for HRV, sleep, and activity.  
   * Secure storage in Supabase.  
3. **Personalized Insights Supported by AI**:  
   * AI recommendations based on biometrics, surveys, and engagement.  
   * Tailored wellness and leadership plans.  
4. **Feedback Loop to Rooted Way Facilitators**:  
   * Member progress reports and coaching tools.  
   * Real-time feedback submission.  
5. **Supabase Authentication with SSR (Not Auth.js)**:  
   * SSR-based authentication with email, Google, and Apple login using @supabase/ssr.  
   * Trigger to create public.users\_public entry on user signup.  
   * RLS policies for secure data access.  
6. **Data Storage and Feedback in Supabase**:  
   * Centralized storage for user data, biometrics, and feedback.  
   * Public users\_public table for member metadata.  
7. **Event and Content Delivery**:  
   * Content library for videos, articles, and meditations.  
   * Event schedules with Zoom integration.  
8. **Security and Privacy**:  
   * GDPR/CCPA compliance.  
   * End-to-end encryption for sensitive data.  
   * Secure RLS policies.

## **2\. Functional Requirements**

### **2.1 User Roles and Permissions**

* **Member**:  
  * Access spaces, events, content, and insights.  
  * Sync wearables and submit feedback.  
  * View public member directory (users\_public).  
* **Facilitator**:  
  * View member progress and biometrics (with RLS).  
  * Provide coaching via messages/comments.  
  * Moderate spaces.  
* **Admin**:  
  * Full back-office control panel.  
  * Manage platform settings, content, and users.  
  * Create, edit, and delete events (including agenda, Zoom link, and capacity).  
  * Create and manage communities, spaces, and groups; assign or move members between them.  
  * Bulk invite or import new members.  
  * Access analytics and feedback logs.  
  * Moderate or remove inappropriate content.

### **2.2 Core Modules**

#### **2.2.1 Community Platform for Events and Engagement**

* **Spaces**:  
  * Custom spaces (e.g., "Rooted Tribe™," "Unleash Series") for discussions and polls.  
  * Real-time chat via Supabase Realtime.  
  * Public/private visibility.  
* **Activity Feed**:  
  * Aggregates posts, event announcements, and content.  
  * Filterable by theme (e.g., "Release Series").  
* **Event Planning**:  
  * Admins create event pages (e.g., "Madeira Retreat Day 1: WHM Breathing").  
  * Details include agenda, Zoom link, and RSVP tracking.  
  * Redirect to external platform for bookings.  
  * Post-event content (e.g., recordings) in library.

#### **2.2.2 Wearable Data Integration**

* **Devices**: Oura Ring, Whoop, Fitbit, Apple Health.  
* **Sync**: OAuth-based, daily or on-demand to Supabase Storage.  
* **UI**: Dashboard with HRV, sleep, and activity trends.

#### **2.2.3 Personalized Insights Supported by AI**

* **AI Model**: Rule-based or ML, hosted on Vercel Edge Functions.  
* **Inputs**: Biometrics, survey responses (e.g., stress levels), engagement.  
* **Outputs**: Suggestions (e.g., "Try breathwork for low HRV").  
* **Delivery**: In-app notifications, dashboard, weekly emails.

#### **2.2.4 Feedback Loop to Rooted Way Facilitators**

* **Member Feedback**: Forms for progress (e.g., energy, stress).  
* **Facilitator Tools**: Dashboard with biometric summaries and messaging.  
* **Alerts**: Notify facilitators of critical feedback (e.g., chronic fatigue).

#### **2.2.5 Supabase Authentication with SSR (Not Auth.js)**

* **Implementation**:  
  * Use @supabase/ssr for Next.js App Router, not Auth.js.  
  * Clients: Browser (createBrowserClient) and server (createServerClient).  
  * Login: Email/password, Google, Apple OAuth, magic links.

Environment variables:  
NEXT\_PUBLIC\_SUPABASE\_URL=https://auqyngiwrzjwylzylxtb.supabase.co

* NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1cXluZ2l3cnpqd3lsenlseHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg3NzUzNTMsImV4cCI6MjA1NDM1MTM1M30.J7CENq7oxqazR2eM6ots5mfc-CITULKjmCDGHcWz\_fs  
* **Middleware**:  
  * Refreshes auth tokens using supabase.auth.getUser().  
  * Stores tokens in cookies via request.cookies.set and response.cookies.set.  
  * Excludes static routes (e.g., \_next/static).  
* **Trigger**:  
  * On auth.users insert, trigger creates entry in public.users\_public.  
  * Fields: user\_id, username, joined\_at.  
  * Secured by RLS for public read-only access.  
* **RLS Policies**:  
  * Restrict biometrics to owner or assigned facilitator.  
  * Allow public read on users\_public for member directory.  
* **Confirmation**:  
  * Email confirmation links to /auth/confirm?token\_hash={{ .TokenHash }}\&type=email.  
  * Route handler verifies OTP and redirects.

#### **2.2.6 Data Storage and Feedback in Supabase**

* **Storage**:  
  * PostgreSQL: Users, events, feedback.  
  * Storage: Biometrics (biometrics/:user\_id), content (content/:event\_id).  
* **Public Table**:  
  * users\_public for member directory (e.g., username, join date).  
  * Populated via trigger on auth.users insert.  
* **Feedback**:  
  * Stored in feedback table with user\_id, facilitator\_id, content.  
  * Real-time submission via forms.

#### **2.2.7 Event and Content Delivery**

* **Content Library**:  
  * Videos, articles, PDFs (e.g., "Release Series" yoga).  
  * Free/premium access tiers.  
* **Event Delivery**:  
  * Virtual events via Zoom links.  
  * Retreat schedules (e.g., "Day 3: Kickboxing Workshop").  
  * Offline content downloads.

#### **2.2.8 Security and Privacy**

* **Data Protection**:  
  * End-to-end encryption for biometrics/chat.  
  * Signed URLs for Storage.  
* **Compliance**:  
  * GDPR/CCPA (e.g., data deletion).  
  * Consent for wearables.  
* **RLS**:  
  * biometrics: Readable by owner or facilitator.  
  * users\_public: Readable by all authenticated users.

### **2.3 Non-Functional Requirements**

* **Performance**: Page loads \< 2s, chat latency \< 100ms.  
* **Scalability**: 5,000 concurrent users.  
* **Security**: OWASP Top 10 compliance, penetration testing.  
* **Reliability**: 99.9% uptime, daily backups.  
* **Accessibility**: WCAG 2.1 compliance.

## **3\. Technical Architecture**

### **3.1 Tech Stack**

* **Frontend**: Next.js (App Router)  
  * SSR/SSG for performance.  
  * Vercel for deployment.  
  * Tailwind CSS for styling.  
* **Backend**: Supabase  
  * PostgreSQL for data.  
  * Realtime for chat/notifications.  
  * Storage for biometrics/content.  
  * Authentication via @supabase/ssr.  
* **APIs**:  
  * REST for CRUD.  
  * WebSocket for real-time.  
* **Integrations**:  
  * Wearables (Oura, Whoop, Fitbit).  
  * Zoom for events.  
  * SendGrid for emails.  
* **AI**: Vercel Edge Functions for recommendations.

### **3.2 Database Schema**

\-- Users public table (populated by trigger)  
CREATE TABLE public.users\_public (  
  user\_id UUID PRIMARY KEY REFERENCES auth.users(id),  
  username TEXT NOT NULL,  
  joined\_at TIMESTAMP DEFAULT NOW()  
);

\-- Trigger to populate users\_public  
CREATE FUNCTION public.create\_public\_user()  
RETURNS TRIGGER AS $$  
BEGIN  
  INSERT INTO public.users\_public (user\_id, username, joined\_at)  
  VALUES (NEW.id, COALESCE(NEW.raw\_user\_meta\_data-\>\>'username', NEW.email), NOW())  
  ON CONFLICT (user\_id) DO NOTHING;  
  RETURN NEW;  
END;  
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on\_user\_created  
AFTER INSERT ON auth.users  
FOR EACH ROW EXECUTE FUNCTION public.create\_public\_user();

\-- Biometrics table  
CREATE TABLE public.biometrics (  
  id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
  user\_id UUID REFERENCES auth.users(id),  
  data JSONB, \-- HRV, sleep, etc.  
  source TEXT, \-- Oura, Whoop  
  created\_at TIMESTAMP DEFAULT NOW()  
);

\-- Feedback table  
CREATE TABLE public.feedback (  
  id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
  user\_id UUID REFERENCES auth.users(id),  
  facilitator\_id UUID REFERENCES auth.users(id),  
  content JSONB,  
  created\_at TIMESTAMP DEFAULT NOW()  
);

\-- Spaces table  
CREATE TABLE public.spaces (  
  id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
  community\_id UUID REFERENCES public.communities(id),  
  name TEXT NOT NULL,  
  visibility TEXT CHECK (visibility IN ('public', 'private')) DEFAULT 'public',  
  created\_at TIMESTAMP DEFAULT NOW()  
);

\-- Posts table  
CREATE TABLE public.posts (  
  id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
  space\_id UUID REFERENCES public.spaces(id),  
  user\_id UUID REFERENCES auth.users(id),  
  content JSONB, \-- Text, media  
  type TEXT CHECK (type IN ('post', 'poll', 'article')) NOT NULL,  
  created\_at TIMESTAMP DEFAULT NOW()  
);

\-- Events table  
CREATE TABLE public.events (  
  id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
  community\_id UUID REFERENCES public.communities(id),  
  title TEXT NOT NULL,  
  start\_time TIMESTAMP NOT NULL,  
  end\_time TIMESTAMP,  
  details JSONB, \-- Agenda, Zoom link  
  created\_at TIMESTAMP DEFAULT NOW()  
);

\-- Content table  
CREATE TABLE public.content (  
  id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
  community\_id UUID REFERENCES public.communities(id),  
  title TEXT NOT NULL,  
  type TEXT CHECK (type IN ('video', 'article', 'pdf')) NOT NULL,  
  url TEXT, \-- Supabase Storage path  
  access TEXT CHECK (access IN ('free', 'premium')) DEFAULT 'free',  
  created\_at TIMESTAMP DEFAULT NOW()  
);

\-- Communities table  
CREATE TABLE public.communities (  
  id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
  name TEXT NOT NULL DEFAULT 'Rooted Tribe',  
  settings JSONB, \-- Branding, privacy  
  created\_at TIMESTAMP DEFAULT NOW()  
);

\-- RLS policies  
CREATE POLICY "Public read users\_public" ON public.users\_public  
  FOR SELECT  
  USING (true);

CREATE POLICY "Facilitators view biometrics" ON public.biometrics  
  FOR SELECT  
  USING (  
    EXISTS (  
      SELECT 1  
      FROM auth.users u  
      WHERE u.id \= auth.uid()  
      AND u.raw\_user\_meta\_data-\>\>'role' \= 'facilitator'  
      AND biometrics.user\_id IN (  
        SELECT id FROM auth.users WHERE raw\_user\_meta\_data-\>\>'assigned\_facilitator' \= u.id::text  
      )  
    )  
  );

CREATE POLICY "Owner view biometrics" ON public.biometrics  
  FOR SELECT  
  USING (auth.uid() \= user\_id);

CREATE POLICY "Feedback access by owner" ON public.feedback  
  FOR SELECT  
  USING (auth.uid() \= user\_id OR auth.uid() \= facilitator\_id);

### **3.3 API Endpoints**

* **Auth**: /api/auth/login, /api/auth/confirm.  
* **Users**: GET /api/users/:id, PUT /api/users/:id.  
* **Biometrics**: POST /api/biometrics, GET /api/biometrics/:user\_id.  
* **Feedback**: POST /api/feedback, GET /api/feedback/:user\_id.  
* **Events**: POST /api/events, GET /api/events/:id.  
* **Spaces**: POST /api/spaces, GET /api/spaces/:id/posts.  
* **Posts**: POST /api/posts, POST /api/posts/:id/comments.  
* **Content**: POST /api/content, GET /api/content/:id.

### **3.4 Authentication Setup**

* **Supabase SSR**:  
  * Install: npm install @supabase/supabase-js @supabase/ssr.

Env:  
NEXT\_PUBLIC\_SUPABASE\_URL=https://auqyngiwrzjwylzylxtb.supabase.co

* NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1cXluZ2l3cnpqd3lsenlseHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg3NzUzNTMsImV4cCI6MjA1NDM1MTM1M30.J7CENq7oxqazR2eM6ots5mfc-CITULKjmCDGHcWz\_fs

Clients:  
// utils/supabase/client.ts  
import { createBrowserClient } from '@supabase/ssr';  
export function createClient() {  
  return createBrowserClient(  
    process.env.NEXT\_PUBLIC\_SUPABASE\_URL\!,  
    process.env.NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY\!  
  );  
}

// utils/supabase/server.ts  
'use server';  
import { createServerClient } from '@supabase/ssr';  
import { cookies } from 'next/headers';  
export async function createClient() {  
  return createServerClient(  
    process.env.NEXT\_PUBLIC\_SUPABASE\_URL\!,  
    process.env.NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY\!,  
    {  
      cookies: {  
        get(name: string) {  
          return cookies().get(name)?.value;  
        },  
        set(name: string, value: string, options: any) {  
          cookies().set(name, value, options);  
        },  
        remove(name: string, options: any) {  
          cookies().set(name, '', { ...options, maxAge: 0 });  
        },  
      },  
    }  
  );

* }

**Middleware**:  
// middleware.ts  
import { NextRequest, NextResponse } from 'next/server';  
import { createClient } from '@/utils/supabase/server';

export async function middleware(request: NextRequest) {  
  const response \= NextResponse.next();  
  const supabase \= await createClient();

  const { data: { user }, error } \= await supabase.auth.getUser();

  if (error || \!user) {  
    // Optionally redirect to login for protected routes  
    if (request.nextUrl.pathname.startsWith('/dashboard')) {  
      return NextResponse.redirect(new URL('/login', request.url));  
    }  
  }

  return response;  
}

export const config \= {  
  matcher: \['/((?\!\_next/static|\_next/image|.\*\\\\.(?:svg|png|jpg|jpeg|gif|webp)$).\*)'\],

* };

**Login Page**:  
// app/login/page.tsx  
'use client';  
import { login, signup } from './actions';  
export default function LoginPage() {  
  return (  
    \<form\>  
      \<label htmlFor="email"\>Email:\</label\>  
      \<input id="email" name="email" type="email" required /\>  
      \<label htmlFor="password"\>Password:\</label\>  
      \<input id="password" name="password" type="password" required /\>  
      \<label htmlFor="username"\>Username:\</label\>  
      \<input id="username" name="username" type="text" required /\>  
      \<button formAction={login}\>Log in\</button\>  
      \<button formAction={signup}\>Sign up\</button\>  
    \</form\>  
  );  
}

// app/login/actions.ts  
'use server';  
import { revalidatePath } from 'next/cache';  
import { redirect } from 'next/navigation';  
import { createClient } from '@/utils/supabase/server';

export async function login(formData: FormData) {  
  const supabase \= await createClient();  
  const data \= {  
    email: formData.get('email') as string,  
    password: formData.get('password') as string,  
  };  
  const { error } \= await supabase.auth.signInWithPassword(data);  
  if (error) redirect('/error');  
  revalidatePath('/', 'layout');  
  redirect('/dashboard');  
}

export async function signup(formData: FormData) {  
  const supabase \= await createClient();  
  const data \= {  
    email: formData.get('email') as string,  
    password: formData.get('password') as string,  
    options: {  
      data: {  
        username: formData.get('username') as string,  
        role: 'member', // Default role  
      },  
    },  
  };  
  const { error } \= await supabase.auth.signUp(data);  
  if (error) redirect('/error');  
  revalidatePath('/', 'layout');  
  redirect('/auth/confirm-instructions');

* }

**Confirmation Handler**:  
// app/auth/confirm/route.ts  
import { type EmailOtpType } from '@supabase/supabase-js';  
import { NextRequest, NextResponse } from 'next/server';  
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {  
  const { searchParams } \= new URL(request.url);  
  const token\_hash \= searchParams.get('token\_hash');  
  const type \= searchParams.get('type') as EmailOtpType | null;  
  const next \= searchParams.get('next') ?? '/dashboard';

  if (token\_hash && type) {  
    const supabase \= await createClient();  
    const { error } \= await supabase.auth.verifyOtp({  
      type,  
      token\_hash,  
    });  
    if (\!error) return NextResponse.redirect(new URL(next, request.url));  
  }  
  return NextResponse.redirect(new URL('/error', request.url));

* }

**Protected Page Example**:  
// app/dashboard/page.tsx  
import { createClient } from '@/utils/supabase/server';  
import { redirect } from 'next/navigation';

export default async function Dashboard() {  
  const supabase \= await createClient();  
  const { data: { user } } \= await supabase.auth.getUser();

  if (\!user) {  
    redirect('/login');  
  }

  return \<div\>Welcome, {user.email}\</div\>;

* }

## **4\. User Flows**

* **Member Signup**:  
  1. Sign up via email/Google/Apple, providing username.  
  2. Trigger adds entry to users\_public (e.g., { user\_id, username, joined\_at }).  
  3. Confirm email via /auth/confirm.  
  4. Complete profile, connect wearable, join spaces.  
* **Member Feedback**:  
  1. Submit progress via form (e.g., stress levels).  
  2. Facilitator receives alert and responds.  
* **Facilitator**:  
  1. View member biometrics (via RLS).  
  2. Provide coaching or moderate spaces.  
* **Admin**:  
  1. Create event (e.g., "Day 1: Cardio").  
  2. Share in feed, track RSVPs.

## **5\. UI/UX Considerations**

* **Design**: Nature-inspired (greens, blues).  
* **Screens**:  
  * Home: Feed with posts/events.  
  * Insights: Biometric trends/AI suggestions.  
  * Events: Calendar/details.  
  * Facilitator Dashboard: Member summaries.  
* **Tools**: Figma, Tailwind CSS.

## **6\. Implementation Plan**

* **Phase 1 (MVP, 3 months)**:  
  * SSR auth with trigger and RLS.  
  * Spaces, posts, wearable integration.  
  * Basic AI insights, feedback forms.  
* **Phase 2 (6 months)**:  
  * Event planning, content library.  
  * Real-time chat, advanced AI.  
  * PWA for mobile.  
* **Phase 3 (9 months)**:  
  * Analytics, offline access.  
  * Enhanced facilitator tools.

### **6.1 Team**

* Frontend Developer (Next.js).  
* Backend Developer (Supabase).  
* UI/UX Designer.  
* Data Scientist (AI).  
* DevOps (Vercel, Supabase).

## **7\. Success Metrics**

* **Engagement**: 80% weekly active members.  
* **Insights**: 70% engage with AI.  
* **Feedback**: 50% monthly submissions.  
* **Performance**: API latency \< 200ms, 99.9% uptime.  
* **Satisfaction**: NPS \> 60\.

## **8\. Risks and Mitigation**

* **Risk**: Trigger failures in users\_public.  
  * **Mitigation**: Add ON CONFLICT clause, test extensively.  
* **Risk**: RLS misconfiguration.  
  * **Mitigation**: Audit policies pre-launch.  
* **Risk**: Privacy concerns.  
  * **Mitigation**: Transparent consent, GDPR compliance.

## **9\. Conclusion**

The ROOTED Way platform, built with Next.js and Supabase's SSR authentication, delivers a secure, scalable hub for Rooted™ community engagement, event planning, and personalized wellness. The trigger and RLS policies ensure robust user management, aligning with Rooted™'s mission to foster embodied leadership.

