CREATE TABLE wearable_event_raw (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  received_at timestamptz NOT NULL DEFAULT now(),
  payload jsonb NOT NULL
);

-- Enable row level security (service_role key bypasses automatically)
ALTER TABLE wearable_event_raw ENABLE ROW LEVEL SECURITY;

-- No policies for regular users yet (admin-only) 