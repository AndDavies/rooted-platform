CREATE TYPE IF NOT EXISTS event_registration_status AS ENUM ('confirmed', 'waitlisted', 'canceled');

CREATE TABLE IF NOT EXISTS public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status event_registration_status NOT NULL DEFAULT 'confirmed',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_registration UNIQUE(event_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS event_registrations_event_id_idx ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS event_registrations_user_id_idx ON public.event_registrations(user_id);

-- Trigger function to handle capacity and auto-waitlist
CREATE OR REPLACE FUNCTION public.handle_event_capacity()
RETURNS TRIGGER AS $$
DECLARE
  event_capacity integer;
  confirmed_count integer;
BEGIN
  -- treat NULL capacity as unlimited
  SELECT capacity INTO event_capacity FROM public.events WHERE id = NEW.event_id;
  IF event_capacity IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT count(*) INTO confirmed_count
  FROM public.event_registrations
  WHERE event_id = NEW.event_id AND status = 'confirmed';

  IF confirmed_count >= event_capacity THEN
    NEW.status := 'waitlisted';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_event_capacity ON public.event_registrations;
CREATE TRIGGER trg_event_capacity
BEFORE INSERT ON public.event_registrations
FOR EACH ROW EXECUTE FUNCTION public.handle_event_capacity();

-- Row-Level Security
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Allow owners of the row to select / delete
CREATE POLICY "Users manage own registrations" ON public.event_registrations
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Allow admins full access (relies on helper is_admin(uuid))
CREATE POLICY "Admins full access registrations" ON public.event_registrations FOR ALL
  USING (is_admin(auth.uid()));

-- PUBLIC view published events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published public events" ON public.events
  FOR SELECT USING (status = 'published' AND access = 'public');

-- Community members can view their community events
CREATE POLICY "Members can view community events" ON public.events
  FOR SELECT USING (
    status = 'published' AND (
      access = 'public' OR access = 'private' OR access = 'premium'
    ) AND (
      EXISTS (
        SELECT 1 FROM public.community_members cm
        WHERE cm.community_id = community_id AND cm.user_id = auth.uid()
      )
    )
  );

-- Admins full access to events already exists via other policies; if not, add:
CREATE POLICY "Admins full access events" ON public.events FOR ALL USING (is_admin(auth.uid())); 