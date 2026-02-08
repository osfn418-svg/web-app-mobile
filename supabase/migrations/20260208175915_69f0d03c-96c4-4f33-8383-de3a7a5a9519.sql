-- Fix 1: Restrict profiles table visibility to own profile + admins
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a safer policy - users can only view their own profile, admins can view all
CREATE POLICY "Users can view own profile" ON public.profiles 
FOR SELECT USING (
  auth.uid() = user_id OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Fix 2: Create a public view for admin_notifications that excludes created_by
CREATE OR REPLACE VIEW public.public_notifications 
WITH (security_invoker = on) AS
SELECT id, title, message, type, created_at, expires_at, is_active
FROM public.admin_notifications
WHERE is_active = true AND (expires_at IS NULL OR expires_at > now());

-- Grant select on the view to authenticated and anon users
GRANT SELECT ON public.public_notifications TO authenticated;
GRANT SELECT ON public.public_notifications TO anon;