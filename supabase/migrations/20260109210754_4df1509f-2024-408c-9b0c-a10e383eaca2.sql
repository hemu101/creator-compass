-- Create creator_notes table for storing notes on creators
CREATE TABLE public.creator_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.creator_notes ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (internal tool)
CREATE POLICY "Allow all access to creator_notes" 
ON public.creator_notes 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_creator_notes_creator_id ON public.creator_notes(creator_id);

-- Add trigger for updated_at
CREATE TRIGGER update_creator_notes_updated_at
BEFORE UPDATE ON public.creator_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();