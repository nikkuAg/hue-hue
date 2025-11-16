-- Create blessings table
CREATE TABLE public.blessings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.blessings ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access
CREATE POLICY "Anyone can view blessings" 
ON public.blessings 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create blessings" 
ON public.blessings 
FOR INSERT 
WITH CHECK (
  -- Validate message length
  length(trim(message)) >= 3 AND 
  length(trim(message)) <= 500
);

-- Create index for better performance
CREATE INDEX idx_blessings_created_at ON public.blessings(created_at DESC);