-- Add content column for storing Tiptap HTML and update card_type constraint
ALTER TABLE public.map_cards
ADD COLUMN content TEXT;

-- Update the card_type constraint to include 'document'
ALTER TABLE public.map_cards
DROP CONSTRAINT IF EXISTS map_cards_card_type_check;

ALTER TABLE public.map_cards
ADD CONSTRAINT map_cards_card_type_check CHECK (card_type IN ('map', 'image', 'document'));