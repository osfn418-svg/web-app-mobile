import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Bell, Mail, Smartphone, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Preferences {
  notifications_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<Preferences>({
    notifications_enabled: true,
    email_notifications: true,
    push_notifications: false,
  });

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_preferences')
      .select('notifications_enabled, email_notifications, push_notifications')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setPrefs(data);
    }
  };

  const togglePref = async (key: keyof Preferences) => {
    if (!user) return;
    
    setLoading(key);
    const newValue = !prefs[key];
    
    try {
      const { data: existing } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('user_preferences')
          .update({ [key]: newValue })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('user_preferences')
          .insert({ user_id: user.id, [key]: newValue });
      }

      setPrefs(prev => ({ ...prev, [key]: newValue }));
      toast.success('تم حفظ الإعدادات');
    } catch (error) {
      toast.error('حدث خطأ');
    } finally {
      setLoading(null);
    }
  };

  const settings = [
    {
      key: 'notifications_enabled' as const,
      icon: Bell,
      title: 'الإشعارات',
      description: 'تلقي إشعارات داخل التطبيق',
    },
    {
      key: 'email_notifications' as const,
      icon: Mail,
      title: 'إشعارات البريد',
      description: 'تلقي إشعارات عبر البريد الإلكتروني',
    },
    {
      key: 'push_notifications' as const,
      icon: Smartphone,
      title: 'إشعارات الهاتف',
      description: 'تلقي إشعارات على هاتفك',
    },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="glass sticky top-0 z-40 px-4 py-3 safe-top">
        <div className="flex items-center gap-3">
          <Link to="/profile" className="p-2 hover:bg-muted rounded-xl transition-colors">
            <ArrowRight className="w-5 h-5 text-foreground" />
          </Link>
          <h1 className="font-semibold text-foreground">الإشعارات</h1>
        </div>
      </header>

      <main className="px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          {settings.map((setting, index) => (
            <div
              key={setting.key}
              className={`flex items-center gap-4 p-4 ${
                index !== settings.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <setting.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{setting.title}</p>
                <p className="text-sm text-muted-foreground">{setting.description}</p>
              </div>
              <button
                onClick={() => togglePref(setting.key)}
                disabled={loading === setting.key}
                className={`w-14 h-8 rounded-full relative transition-colors ${
                  prefs[setting.key] ? 'bg-primary' : 'bg-muted'
                }`}
              >
                {loading === setting.key ? (
                  <Loader2 className="w-4 h-4 animate-spin absolute top-2 left-5" />
                ) : (
                  <motion.div
                    className="absolute top-1.5 w-5 h-5 bg-foreground rounded-full"
                    animate={{
                      right: prefs[setting.key] ? 6 : 'auto',
                      left: prefs[setting.key] ? 'auto' : 6
                    }}
                  />
                )}
              </button>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
