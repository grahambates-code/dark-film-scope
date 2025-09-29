-- Create map_cards table
CREATE TABLE public.map_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id UUID NOT NULL,
  title TEXT,
  viewstate JSONB,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.map_cards ENABLE ROW LEVEL SECURITY;

-- Create policies for map_cards
CREATE POLICY "Map cards are viewable by everyone" 
ON public.map_cards 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own map cards" 
ON public.map_cards 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own map cards" 
ON public.map_cards 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own map cards" 
ON public.map_cards 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_map_cards_updated_at
BEFORE UPDATE ON public.map_cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add map_card_id to comments table
ALTER TABLE public.comments 
ADD COLUMN map_card_id UUID;

-- Update comments policies to work with map cards
CREATE POLICY "Users can create comments on map cards" 
ON public.comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND (location_id IS NOT NULL OR map_card_id IS NOT NULL));