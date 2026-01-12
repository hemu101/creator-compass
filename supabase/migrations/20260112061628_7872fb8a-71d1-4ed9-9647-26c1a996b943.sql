-- Add extended filter columns to creators table
ALTER TABLE public.creators ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.creators ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.creators ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE public.creators ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE public.creators ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE public.creators ADD COLUMN IF NOT EXISTS age_range text;
ALTER TABLE public.creators ADD COLUMN IF NOT EXISTS language text;
ALTER TABLE public.creators ADD COLUMN IF NOT EXISTS ethnicity text;
ALTER TABLE public.creators ADD COLUMN IF NOT EXISTS price_range text;
ALTER TABLE public.creators ADD COLUMN IF NOT EXISTS min_price numeric DEFAULT 0;
ALTER TABLE public.creators ADD COLUMN IF NOT EXISTS max_price numeric DEFAULT 0;
ALTER TABLE public.creators ADD COLUMN IF NOT EXISTS platform text DEFAULT 'Instagram';
ALTER TABLE public.creators ADD COLUMN IF NOT EXISTS niche text;
ALTER TABLE public.creators ADD COLUMN IF NOT EXISTS content_type text;
ALTER TABLE public.creators ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false;

-- Create indexes for faster filtering
CREATE INDEX IF NOT EXISTS idx_creators_country ON public.creators(country);
CREATE INDEX IF NOT EXISTS idx_creators_platform ON public.creators(platform);
CREATE INDEX IF NOT EXISTS idx_creators_niche ON public.creators(niche);
CREATE INDEX IF NOT EXISTS idx_creators_gender ON public.creators(gender);
CREATE INDEX IF NOT EXISTS idx_creators_language ON public.creators(language);
CREATE INDEX IF NOT EXISTS idx_creators_is_premium ON public.creators(is_premium);

-- Create analytics events table for tracking
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on analytics_events
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policy for analytics_events
CREATE POLICY "Allow all access to analytics_events" 
ON public.analytics_events 
FOR ALL 
USING (true) 
WITH CHECK (true);