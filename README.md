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

Garmin Integration for Health App
Overview
This app integrates with Garmin’s Health API to allow users to connect their Garmin Connect accounts and access health data (e.g., steps, heart rate, sleep). The integration uses OAuth 2.0 with PKCE, managed through an integrations route (/dashboard/integration) with a redirect URL (/integration/garmin-callback/). Data is stored in Supabase for persistence and queried for insights via an insights route (/insights). The system is designed to scale for future wearables (e.g., WHOOP, Muse).
Prerequisites

Garmin Developer Portal Account: Sign up at https://developerportal.garmin.com/user/me/apps?program=829.
Approved App: Obtain Client ID (Consumer Key) and Client Secret (Consumer Secret) after approval.
Example: GARMIN_CLIENT_ID=75485624-8bd5-4f7a-82ae-b61ccfc187aa, GARMIN_CLIENT_SECRET=ShzVQSUfffNM8xRV5arYUGvA6OxbK7kJCOTz0lR9gz8.


Supabase Project: Set up a Supabase instance for storing connection and data records.
Environment Variables: Store credentials in .env.local (see Setup).

Setup
Environment Variables
Add the following to your .env.local file in the project root:
GARMIN_CLIENT_ID=75485624-8bd5-4f7a-82ae-b61ccfc187aa
GARMIN_CLIENT_SECRET=ShzVQSUfffNM8xRV5arYUGvA6OxbK7kJCOTz0lR9gz8


Security: Ensure .env.local is in .gitignore to prevent committing sensitive data.
Usage: Access variables in code (e.g., process.env.GARMIN_CLIENT_ID in Node.js).

Supabase Database
The app uses two Supabase tables to manage Garmin connections and data:

wearable_connections: Stores OAuth tokens, Garmin User ID, and scopes.
wearable_data: Stores normalized health data (e.g., steps, heart rate).

Run the following SQL in the Supabase Dashboard’s SQL Editor to create the tables (to be implemented via Supabase MCP in Cursor):
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: wearable_connections
CREATE TABLE wearable_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_user_id UUID NOT NULL,
    wearable_type VARCHAR(50) NOT NULL,
    wearable_user_id VARCHAR(255) NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    access_token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    refresh_token_expires_at TIMESTAMP WITH TIME ZONE,
    scopes TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_app_user FOREIGN KEY (app_user_id) REFERENCES profiles(id) ON DELETE CASCADE,
    CONSTRAINT valid_wearable_type CHECK (wearable_type IN ('garmin', 'whoop', 'muse'))
);

-- Table: wearable_data
CREATE TABLE wearable_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    connection_id UUID NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    value NUMERIC NOT NULL,
    unit VARCHAR(20),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    source VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_connection FOREIGN KEY (connection_id) REFERENCES wearable_connections(id) ON DELETE CASCADE,
    CONSTRAINT valid_source CHECK (source IN ('garmin', 'whoop', 'muse'))
);

-- Indices
CREATE INDEX idx_wearable_data_connection_id ON wearable_data(connection_id);
CREATE INDEX idx_wearable_data_timestamp ON wearable_data(timestamp);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_wearable_connections_updated_at
    BEFORE UPDATE ON wearable_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

Integration Flow
Integrations Route (/dashboard/integration)

Purpose: A user-facing page listing available wearables (currently only Garmin).
Functionality:
Displays a “Connect Garmin” button.
Initiates the OAuth 2.0 PKCE flow by redirecting to Garmin’s authorization URL: https://connect.garmin.com/oauth2Confirm.


Parameters:
client_id: Your Client ID (e.g., 75485624-8bd5-4f7a-82ae-b61ccfc187aa).
response_type: code.
code_challenge: SHA-256 hashed code verifier (PKCE).
code_challenge_method: S256.
redirect_uri: /integration/garmin-callback/ (e.g., https://yourapp.com/integration/garmin-callback/).
state: Optional unique string to prevent CSRF.


Example URL:https://connect.garmin.com/oauth2Confirm?client_id=75485624-8bd5-4f7a-82ae-b61ccfc187aa&response_type=code&code_challenge=UrJZ-JcnGMxHS8Fnmxf1TbTP22-RymoMZTsa6H1D5ZU&code_challenge_method=S256&redirect_uri=https://yourapp.com/integration/garmin-callback/&state=xyz123



Redirect URL (/integration/garmin-callback/)

Purpose: Handles Garmin’s redirect after user authorization.
Functionality:
Receives code and state parameters (e.g., https://yourapp.com/integration/garmin-callback/?code=abc123&state=xyz123).
Validates state (if used).
Exchanges code for tokens via https://connectapi.garmin.com/di-oauth2-service/oauth/token.
Stores tokens and User ID in wearable_connections.
Redirects user to a success page (e.g., /dashboard/integration/success).


Token Request:
POST to https://connectapi.garmin.com/di-oauth2-service/oauth/token with:
grant_type: authorization_code.
client_id: Your Client ID.
client_secret: Your Client Secret.
code: Authorization code.
code_verifier: Original code verifier.
redirect_uri: /integration/garmin-callback/.


Response includes access_token, refresh_token, expires_in (24 hours), refresh_token_expires_in (3 months), and scopes.


User ID: Fetch via GET https://apis.garmin.com/wellness-api/rest/user/id.

Data Fetching

Method: Use Garmin’s PUSH notifications (JSON data sent to a webhook, e.g., /api/webhooks/garmin) or PING notifications (callbacks to fetch data).
Webhook Setup: Configure in API Tools (https://apis.garmin.com/tools/endpoints).
Storage: Normalize data (e.g., steps, heart rate) and store in wearable_data table with source='garmin'.

Insights Route (/insights)

Purpose: Generate health insights by querying wearable_data.
Functionality:
Query Supabase for normalized data (e.g., SELECT * FROM wearable_data WHERE app_user_id = 'user123' AND source = 'garmin').
Process data for insights (e.g., average steps, sleep trends).
Future: Combine data from multiple wearables (e.g., WHOOP, Muse) when added.



Token Management

Access Token: Expires in ~24 hours. Use refresh_token to get a new one via https://connectapi.garmin.com/di-oauth2-service/oauth/token.
Refresh Token: Expires in ~3 months. Prompt reauthorization if expired.
Storage: Save tokens in wearable_connections with expiration timestamps.

Future Scalability

Additional Wearables: Add WHOOP, Muse, etc., with dedicated routes (e.g., /integration/whoop-callback/) and store in wearable_connections with wearable_type.
Data Normalization: Standardize metrics (e.g., steps, heart rate) across wearables in wearable_data.
Third-Party Platforms: Consider Terra or Validic to simplify multi-wearable integration.

Security

Use HTTPS for all routes and webhooks.
Encrypt tokens in wearable_connections (e.g., using Supabase encryption).
Validate domains in Garmin’s API Tools (24–48 hour security review).
Comply with GDPR/HIPAA for user data.

Testing

Use Garmin’s OAuth tool (https://apis.garmin.com/tools/pauth2/authorizeUser) to test the flow.
Test locally with https://localhost.com/integration/garmin-callback/.
Request a production key via connect-support@developer.garmin.com after testing.

Support

Contact connect-support@developer.garmin.com for issues.
Reference app’s Client ID for support queries.

