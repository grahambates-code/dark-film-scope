-- Create comments table
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create policies for comments
CREATE POLICY "Comments are viewable by everyone" 
ON public.comments 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create comments" 
ON public.comments 
FOR INSERT 
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert mock data for existing locations
INSERT INTO public.comments (location_id, content, author, created_at) 
SELECT 
  l.id,
  'Amazing filming location! The scenery was breathtaking during production.',
  'Film Crew Member',
  now() - interval '10 days'
FROM public.locations l
LIMIT 3;

INSERT INTO public.comments (location_id, content, author, created_at) 
SELECT 
  l.id,
  'This place has such great lighting conditions for outdoor scenes.',
  'Location Scout',
  now() - interval '9 days'
FROM public.locations l
LIMIT 3;

INSERT INTO public.comments (location_id, content, author, created_at) 
SELECT 
  l.id,
  'Perfect acoustics for dialogue recording. Highly recommend this spot.',
  'Sound Engineer',
  now() - interval '5 days'
FROM public.locations l
LIMIT 2;