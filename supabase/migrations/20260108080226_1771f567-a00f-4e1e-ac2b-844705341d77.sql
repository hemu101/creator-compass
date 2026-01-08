-- Create table to store Instagram creators/profiles
CREATE TABLE public.creators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  full_name TEXT,
  profile_url TEXT,
  pk TEXT,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  media_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_business BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,
  category TEXT,
  bio TEXT,
  external_url TEXT,
  profile_pic_url TEXT,
  profile_pic_local TEXT,
  bio_hashtags TEXT,
  bio_mentions TEXT,
  engagement_rate NUMERIC(5,2) DEFAULT 0,
  source_keyword TEXT,
  search_score INTEGER DEFAULT 0,
  profile_type TEXT,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table to store database configurations (for external PostgreSQL)
CREATE TABLE public.database_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Default',
  host TEXT NOT NULL,
  port INTEGER DEFAULT 5432,
  database_name TEXT NOT NULL,
  username TEXT NOT NULL,
  password_encrypted TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_connected TIMESTAMP WITH TIME ZONE
);

-- Create table to store session configurations
CREATE TABLE public.session_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT now(),
  success_rate NUMERIC(5,2) DEFAULT 100,
  total_requests INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for scraping jobs/history
CREATE TABLE public.scraping_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  search_query TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  total_found INTEGER DEFAULT 0,
  total_saved INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_creators_username ON public.creators(username);
CREATE INDEX idx_creators_follower_count ON public.creators(follower_count);
CREATE INDEX idx_creators_category ON public.creators(category);
CREATE INDEX idx_creators_is_verified ON public.creators(is_verified);
CREATE INDEX idx_creators_source_keyword ON public.creators(source_keyword);

-- Enable RLS (but allow public access for this app since no auth)
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.database_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraping_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow all access to creators" ON public.creators FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to database_configs" ON public.database_configs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to session_configs" ON public.session_configs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to scraping_jobs" ON public.scraping_jobs FOR ALL USING (true) WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_creators_updated_at
BEFORE UPDATE ON public.creators
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();