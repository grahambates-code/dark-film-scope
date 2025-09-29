-- Add images column to map_cards table to store image URLs
ALTER TABLE public.map_cards
ADD COLUMN images JSONB DEFAULT '[]'::jsonb;