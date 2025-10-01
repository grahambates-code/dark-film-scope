-- Update sub_cards to use percentage-based positioning
-- Change position columns to store percentages (0-100)
-- Change width/height to store percentages as well for better responsiveness

COMMENT ON COLUMN public.sub_cards.position_x IS 'X position as percentage (0-100) of parent card width';
COMMENT ON COLUMN public.sub_cards.position_y IS 'Y position as percentage (0-100) of parent card height';
COMMENT ON COLUMN public.sub_cards.width IS 'Width as percentage (0-100) of parent card width';
COMMENT ON COLUMN public.sub_cards.height IS 'Height as percentage (0-100) of parent card height';