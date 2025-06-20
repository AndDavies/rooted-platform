This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Events & Registrations Workflow

### Creating Events (Admin)
1. Sign in as an `admin` user.
2. Navigate to `/admin/events`.
3. Fill in the event form (title, description, start/end, capacity, access, etc.) and click **Create Event**.
4. The event is created with `status = draft` by default; switch to **Published** when ready so members can see it.

### Member / Public View
- Published events automatically appear at `/events`.
- Visibility is controlled by the event's **access** field and Row-Level-Security (RLS):
  - `public` – visible to everyone.
  - `private` / `premium` – visible only to authenticated users who belong to the same community or to admins.

### Registering for an Event
1. Visit `/events` and click **RSVP** next to an event.
2. A row is inserted into `event_registrations`.
   - If the event has **no capacity** set, registration is always **confirmed**.
   - If **capacity** is set, a DB trigger checks how many **confirmed** rows exist.
     - If capacity is full, the new registration is saved with `status = waitlisted`.
3. The button changes to **Cancel RSVP** (or **Leave wait-list** when applicable).

### Canceling / Leaving the Wait-list
- Click **Cancel RSVP** (or **Leave wait-list**) to delete your row.
- If a confirmed attendee cancels and a wait-listed row exists, an **admin** can promote wait-listed users manually (future enhancement).

### Admin Managing Registrations
- A dedicated drawer `/admin/events/[id]/registrations` (coming soon) will list **confirmed** and **wait-listed** users with promote/remove controls.

---
Generated automatically – see `docs/events-flow.md` for the canonical diagram.

## 2025-06-16 – Recent work

### Highlights
- Built full Events workflow (admin creation, public RSVP & auto-wait-list).
- Added `event_registrations` table, trigger, and RLS policies via Supabase migration.
- New pages:
  - `/admin/events` – extended form with all schema fields.
  - `/events` – public list with RSVP / Cancel / Leave wait-list.
- Refactored communities browser & admin pages; pill-button styling everywhere.
- Removed `docs/` from the repo and `.gitignore`d it.
- Fixed all ESLint errors blocking Vercel production build.

### Next steps
1. Admin registrations drawer (`/admin/events/[id]/registrations`) to promote wait-listed users.
2. Email notifications on RSVP / wait-list promotion.
3. Calendar view for events (`@fullcalendar/react`).
4. E2E tests (Playwright) covering RSVP & capacity logic.
5. Polish Members page error handling ("Provide email or user_id").
