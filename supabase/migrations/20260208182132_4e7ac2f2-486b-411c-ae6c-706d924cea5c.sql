-- Fix 1: Drop old SELECT policy on admin_notifications that exposes created_by to all users
DROP POLICY IF EXISTS "Anyone can view active notifications" ON public.admin_notifications;

-- Create new policy that restricts regular users from direct table access
-- They should use the public_notifications view instead
CREATE POLICY "Only admins can directly access admin_notifications"
ON public.admin_notifications
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));