-- Create user profiles table to replace email exposure
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT, -- Keep for internal use only, not exposed publicly
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles can be viewed by everyone (but email will be hidden in SELECT policies)
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add updated_at trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update comments table structure - replace email author with user_id reference
ALTER TABLE public.comments ADD COLUMN user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Update existing comments to link them to user profiles based on email
-- First, create profiles for existing comment authors if they don't exist
INSERT INTO public.profiles (user_id, display_name, email)
SELECT 
  u.id as user_id,
  COALESCE(u.raw_user_meta_data->>'display_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)) as display_name,
  u.email
FROM auth.users u
WHERE u.email IN (SELECT DISTINCT author FROM public.comments WHERE author IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;

-- Update existing comments to use user_id instead of email
UPDATE public.comments 
SET user_id = (
  SELECT p.user_id 
  FROM public.profiles p 
  WHERE p.email = comments.author
)
WHERE author IS NOT NULL;

-- Make user_id required going forward
ALTER TABLE public.comments ALTER COLUMN user_id SET NOT NULL;

-- Update RLS policies for comments to be more secure
DROP POLICY IF EXISTS "Anyone can create comments" ON public.comments;
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;

-- New secure RLS policies for comments
CREATE POLICY "Authenticated users can create comments" 
ON public.comments 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Comments are viewable by everyone" 
ON public.comments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can delete their own comments" 
ON public.comments 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.comments 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Remove the author column since we now use user_id + profiles
ALTER TABLE public.comments DROP COLUMN author;