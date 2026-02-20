CREATE TABLE webinar_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL,
  question TEXT,
  webinar_slug TEXT NOT NULL DEFAULT 'midjourney',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE webinar_leads ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (form submissions from anonymous users)
CREATE POLICY "Allow public inserts" ON webinar_leads
  FOR INSERT WITH CHECK (true);
