-- Create a secure view for user subscriptions that hides granted_by from non-admins
CREATE OR REPLACE VIEW public.user_subscriptions_public
WITH (security_invoker = on) AS
SELECT 
    id,
    user_id,
    plan_id,
    status,
    start_date,
    end_date,
    created_at
FROM public.user_subscriptions;

-- Update RLS policy on user_subscriptions to only allow admins direct access
-- Regular users should use the view
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.user_subscriptions;

CREATE POLICY "Users view own subscriptions without granted_by"
ON public.user_subscriptions
FOR SELECT
USING (
    (user_id = auth.uid() AND has_role(auth.uid(), 'admin'::app_role) = false)
    OR has_role(auth.uid(), 'admin'::app_role)
);