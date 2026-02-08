-- Create admin notifications table
CREATE TABLE public.admin_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, warning, success, error
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create user notification reads to track who has seen which notification
CREATE TABLE public.notification_reads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID NOT NULL REFERENCES public.admin_notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(notification_id, user_id)
);

-- Create user preferences table for settings
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  language TEXT NOT NULL DEFAULT 'ar',
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  push_notifications BOOLEAN NOT NULL DEFAULT false,
  two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Admin notifications policies
CREATE POLICY "Anyone can view active notifications"
ON public.admin_notifications FOR SELECT
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Admins can manage notifications"
ON public.admin_notifications FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Notification reads policies
CREATE POLICY "Users can view own notification reads"
ON public.notification_reads FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can mark notifications as read"
ON public.notification_reads FOR INSERT
WITH CHECK (user_id = auth.uid());

-- User preferences policies
CREATE POLICY "Users can view own preferences"
ON public.user_preferences FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own preferences"
ON public.user_preferences FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own preferences"
ON public.user_preferences FOR UPDATE
USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();