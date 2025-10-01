-- Create sub_cards table for moodboard-style cards
CREATE TABLE public.sub_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_card_id UUID NOT NULL REFERENCES public.map_cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('text', 'image', 'color')),
  content TEXT,
  position_x NUMERIC NOT NULL DEFAULT 0,
  position_y NUMERIC NOT NULL DEFAULT 0,
  width NUMERIC NOT NULL DEFAULT 150,
  height NUMERIC NOT NULL DEFAULT 150,
  z_index INTEGER NOT NULL DEFAULT 0,
  background_color TEXT DEFAULT '#ffffff',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sub_cards ENABLE ROW LEVEL SECURITY;

-- Create policies for sub_cards
CREATE POLICY "Sub cards are viewable by everyone" 
ON public.sub_cards 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own sub cards" 
ON public.sub_cards 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sub cards" 
ON public.sub_cards 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sub cards" 
ON public.sub_cards 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_sub_cards_updated_at
BEFORE UPDATE ON public.sub_cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();