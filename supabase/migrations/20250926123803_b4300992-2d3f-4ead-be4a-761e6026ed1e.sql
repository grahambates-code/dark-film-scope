-- Create location_camera_position table
CREATE TABLE public.location_camera_position (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
    viewstate JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(location_id)
);

-- Enable Row Level Security
ALTER TABLE public.location_camera_position ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Camera positions are viewable by everyone" 
ON public.location_camera_position 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_location_camera_position_updated_at
BEFORE UPDATE ON public.location_camera_position
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert camera positions for existing locations
INSERT INTO public.location_camera_position (location_id, viewstate)
SELECT 
    l.id,
    jsonb_build_object(
        'longitude', COALESCE(l.longitude, -74.0060),
        'latitude', COALESCE(l.latitude, 40.7128),
        'zoom', 15,
        'pitch', 0,
        'bearing', 0
    )
FROM public.locations l;