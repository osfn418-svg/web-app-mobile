import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Smartphone, Loader2, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function TwoFactorPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_preferences')
      .select('two_factor_enabled')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setIs2FAEnabled(data.two_factor_enabled);
    }
  };

  const toggle2FA = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Check if preferences exist
      const { data: existing } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('user_preferences')
          .update({ two_factor_enabled: !is2FAEnabled })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('user_preferences')
          .insert({ user_id: user.id, two_factor_enabled: !is2FAEnabled });
      }

      setIs2FAEnabled(!is2FAEnabled);
      toast.success(is2FAEnabled ? 'تم تعطيل المصادقة الثنائية' : 'تم تفعيل المصادقة الثنائية');
    } catch (error) {
      toast.error('حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="glass sticky top-0 z-40 px-4 py-3 safe-top">
        <div className="flex items-center gap-3">
          <Link to="/profile" className="p-2 hover:bg-muted rounded-xl transition-colors">
            <ArrowRight className="w-5 h-5 text-foreground" />
          </Link>
          <h1 className="font-semibold text-foreground">المصادقة الثنائية</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="font-medium text-foreground">المصادقة الثنائية (2FA)</h2>
              <p className="text-sm text-muted-foreground">طبقة حماية إضافية لحسابك</p>
            </div>
            <button
              onClick={toggle2FA}
              disabled={loading}
              className={`w-14 h-8 rounded-full relative transition-colors ${
                is2FAEnabled ? 'bg-primary' : 'bg-muted'
              }`}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin absolute top-2 left-5" />
              ) : (
                <motion.div
                  className="absolute top-1.5 w-5 h-5 bg-foreground rounded-full"
                  animate={{
                    right: is2FAEnabled ? 6 : 'auto',
                    left: is2FAEnabled ? 'auto' : 6
                  }}
                />
              )}
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-5 space-y-4"
        >
          <h3 className="font-medium text-foreground">كيف تعمل؟</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-foreground">رمز تحقق عند كل تسجيل دخول</p>
                <p className="text-xs text-muted-foreground">سيُطلب منك إدخال رمز يُرسل لهاتفك</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-foreground">حماية من الاختراق</p>
                <p className="text-xs text-muted-foreground">حتى لو سُرقت كلمة مرورك</p>
              </div>
            </div>
          </div>
        </motion.div>

        {is2FAEnabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-success/10 border border-success/20 rounded-xl p-4 flex items-center gap-3"
          >
            <Check className="w-5 h-5 text-success" />
            <span className="text-success text-sm">المصادقة الثنائية مُفعّلة</span>
          </motion.div>
        )}
      </main>
    </div>
  );
}
