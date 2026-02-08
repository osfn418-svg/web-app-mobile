-- Update user_subscriptions policy to allow admins to view all subscriptions
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.user_subscriptions;

CREATE POLICY "Users can view own subscriptions" 
ON public.user_subscriptions 
FOR SELECT 
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

-- Ensure admins can view all user roles for admin dashboard
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Users can view own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));