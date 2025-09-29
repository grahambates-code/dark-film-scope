-- Add card_type column to map_cards table to distinguish between map and image cards
ALTER TABLE public.map_cards
ADD COLUMN card_type TEXT CHECK (card_type IN ('map', 'image'));