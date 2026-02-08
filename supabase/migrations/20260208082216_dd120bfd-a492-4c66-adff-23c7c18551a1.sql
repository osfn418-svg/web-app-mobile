-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    username TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

-- Create categories table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    requires_subscription BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_tools table
CREATE TABLE public.ai_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    url TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    logo_url TEXT,
    requires_subscription BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    rating DECIMAL(2,1) DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscription_plans table
CREATE TABLE public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    duration_days INTEGER NOT NULL,
    max_tools_access INTEGER DEFAULT -1,
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_subscriptions table
CREATE TABLE public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE CASCADE NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    granted_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_conversations table
CREATE TABLE public.chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tool_id UUID REFERENCES public.ai_tools(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved_items table (for user favorites)
CREATE TABLE public.saved_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tool_id UUID REFERENCES public.ai_tools(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tool_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

-- Create has_role function for RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Categories policies
CREATE POLICY "Anyone can view active categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- AI Tools policies
CREATE POLICY "Anyone can view active tools" ON public.ai_tools FOR SELECT USING (is_active = true AND is_approved = true);
CREATE POLICY "Admins can manage tools" ON public.ai_tools FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Subscription plans policies
CREATE POLICY "Anyone can view active plans" ON public.subscription_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage plans" ON public.subscription_plans FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- User subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage subscriptions" ON public.user_subscriptions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Chat conversations policies
CREATE POLICY "Users can view own conversations" ON public.chat_conversations FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create own conversations" ON public.chat_conversations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own conversations" ON public.chat_conversations FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own conversations" ON public.chat_conversations FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Chat messages policies
CREATE POLICY "Users can view messages in own conversations" ON public.chat_messages FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.chat_conversations WHERE id = conversation_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert messages in own conversations" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.chat_conversations WHERE id = conversation_id AND user_id = auth.uid()));

-- Saved items policies
CREATE POLICY "Users can view own saved items" ON public.saved_items FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can manage own saved items" ON public.saved_items FOR ALL TO authenticated USING (user_id = auth.uid());

-- Create trigger function for profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, username, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)), COALESCE(NEW.raw_user_meta_data->>'full_name', 'مستخدم جديد'));
    
    -- Add default user role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Apply updated_at trigger to tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ai_tools_updated_at BEFORE UPDATE ON public.ai_tools FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chat_conversations_updated_at BEFORE UPDATE ON public.chat_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_tools;
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscription_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_subscriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Insert default categories
INSERT INTO public.categories (name, description, icon, requires_subscription) VALUES
('توليد الصور', 'أدوات إنشاء الصور بالذكاء الاصطناعي', '🖼️', true),
('توليد النصوص', 'أدوات الكتابة والمحادثة الذكية', '📝', false),
('توليد الفيديو', 'أدوات إنشاء الفيديو', '🎬', true),
('توليد الصوت', 'أدوات الصوت والموسيقى', '🎵', true),
('البرمجة', 'أدوات مساعدة البرمجة', '💻', false),
('تحليل المستندات', 'أدوات تحليل الملفات', '📄', true);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price, duration_days, max_tools_access, features) VALUES
('مجاني', 'الخطة المجانية الأساسية', 0, 0, 3, '["الوصول لـ 3 أدوات", "100 رسالة يومياً", "دعم أساسي"]'),
('Nexus Pro', 'خطة احترافية مع ميزات متقدمة', 19.99, 30, -1, '["وصول غير محدود", "رسائل غير محدودة", "أولوية الدعم", "ميزات حصرية"]'),
('للشركات', 'خطة الشركات والفرق', 99.00, 30, -1, '["جميع ميزات Pro", "API مخصص", "دعم 24/7", "تخصيص كامل"]');

-- Insert default AI tools
INSERT INTO public.ai_tools (name, description, url, category_id, logo_url, requires_subscription, rating) 
SELECT 'الذكاء المساعد', 'محادثة وتلخيص مع ذكاء اصطناعي متقدم', '/tools/assistant', id, '🤖', false, 4.8 FROM public.categories WHERE name = 'توليد النصوص';

INSERT INTO public.ai_tools (name, description, url, category_id, logo_url, requires_subscription, rating)
SELECT 'توليد الصور', 'حول خيالك لواقع بصور مذهلة', '/tools/images', id, '🖼️', true, 4.7 FROM public.categories WHERE name = 'توليد الصور';

INSERT INTO public.ai_tools (name, description, url, category_id, logo_url, requires_subscription, rating)
SELECT 'توليد الفيديو', 'نص إلى فيديو سينمائي بجودة عالية', '/tools/video', id, '🎬', true, 4.9 FROM public.categories WHERE name = 'توليد الفيديو';

INSERT INTO public.ai_tools (name, description, url, category_id, logo_url, requires_subscription, rating)
SELECT 'المحادثة الصوتية', 'تفاعل صوتي طبيعي وسلس', '/tools/voice-chat', id, '🎙️', true, 4.6 FROM public.categories WHERE name = 'توليد الصوت';

INSERT INTO public.ai_tools (name, description, url, category_id, logo_url, requires_subscription, rating)
SELECT 'محرر الأكواد', 'بناء وتصحيح البرمجيات بذكاء', '/tools/code', id, '💻', true, 4.8 FROM public.categories WHERE name = 'البرمجة';

INSERT INTO public.ai_tools (name, description, url, category_id, logo_url, requires_subscription, rating)
SELECT 'توليد الصوت', 'موسيقى ومؤثرات صوتية احترافية', '/tools/audio', id, '🎵', true, 4.5 FROM public.categories WHERE name = 'توليد الصوت';

INSERT INTO public.ai_tools (name, description, url, category_id, logo_url, requires_subscription, rating)
SELECT 'صانع الأوامر', 'إنشاء prompts احترافية للنماذج', '/tools/prompt-maker', id, '✨', false, 4.4 FROM public.categories WHERE name = 'توليد النصوص';

INSERT INTO public.ai_tools (name, description, url, category_id, logo_url, requires_subscription, rating)
SELECT 'محلل المستندات', 'استخراج وتحليل البيانات من الملفات', '/tools/document', id, '📄', true, 4.7 FROM public.categories WHERE name = 'تحليل المستندات';