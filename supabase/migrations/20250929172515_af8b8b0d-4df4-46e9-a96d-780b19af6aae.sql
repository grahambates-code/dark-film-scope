-- Create storage bucket for location images
INSERT INTO storage.buckets (id, name, public)
VALUES ('location-images', 'location-images', true);

-- Create policies for location images bucket
CREATE POLICY "Anyone can view location images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'location-images');

CREATE POLICY "Authenticated users can upload location images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'location-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own location images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'location-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own location images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'location-images' AND auth.uid()::text = (storage.foldername(name))[1]);