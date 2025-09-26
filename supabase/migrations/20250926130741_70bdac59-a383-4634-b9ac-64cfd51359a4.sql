-- Update RLS policies for location_camera_position table to allow INSERT and UPDATE operations
CREATE POLICY "Anyone can insert camera positions" 
ON public.location_camera_position 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update camera positions" 
ON public.location_camera_position 
FOR UPDATE 
USING (true);

-- Create missing camera position records for locations that don't have them
-- Insert default camera positions for locations without them
INSERT INTO public.location_camera_position (location_id, viewstate)
SELECT 
    l.id as location_id,
    jsonb_build_object(
        'longitude', COALESCE(l.longitude, -74.0060),
        'latitude', COALESCE(l.latitude, 40.7128),
        'zoom', 15,
        'pitch', 0,
        'bearing', 0
    ) as viewstate
FROM public.locations l
LEFT JOIN public.location_camera_position lcp ON l.id = lcp.location_id
WHERE lcp.location_id IS NULL;