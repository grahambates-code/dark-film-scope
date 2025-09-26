-- Create profiles for any existing authenticated users who don't have profiles yet
INSERT INTO public.profiles (user_id, display_name, email)
SELECT 
  u.id as user_id,
  COALESCE(
    u.raw_user_meta_data->>'display_name', 
    u.raw_user_meta_data->>'name', 
    split_part(u.email, '@', 1)
  ) as display_name,
  u.email
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;