import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, Check, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const languages = [
  { code: 'ar', name: 'العربية', flag: '🇸🇦', native: 'العربية' },
  { code: 'en', name: 'English', flag: '🇺🇸', native: 'English' },
];

export default function LanguagePage() {
  const { user } = useAuth();
  const [selectedLang, setSelectedLang] = useState('ar');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_preferences')
      .select('language')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setSelectedLang(data.language);
    }
  };

  const selectLanguage = async (code: string) => {
    if (!user || code === selectedLang) return;
    
    setLoading(true);
    try {
      const { data: existing } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('user_preferences')
          .update({ language: code })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('user_preferences')
          .insert({ user_id: user.id, language: code });
      }

      setSelectedLang(code);
      toast.success('تم تغيير اللغة');
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
          <h1 className="font-semibold text-foreground">اللغة</h1>
        </div>
      </header>

      <main className="px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          {languages.map((lang, index) => (
            <button
              key={lang.code}
              onClick={() => selectLanguage(lang.code)}
              disabled={loading}
              className={`w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors ${
                index !== languages.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <span className="text-2xl">{lang.flag}</span>
              <div className="flex-1 text-right">
                <p className="font-medium text-foreground">{lang.native}</p>
                <p className="text-sm text-muted-foreground">{lang.name}</p>
              </div>
              {selectedLang === lang.code && (
                loading ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : (
                  <Check className="w-5 h-5 text-primary" />
                )
              )}
            </button>
          ))}
        </motion.div>

        <p className="text-sm text-muted-foreground text-center mt-4">
          سيتم تطبيق اللغة الجديدة على التطبيق
        </p>
      </main>
    </div>
  );
}
