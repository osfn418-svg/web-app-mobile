import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('كلمات المرور غير متطابقة');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('تم تغيير كلمة المرور بنجاح');
      navigate('/profile');
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء تغيير كلمة المرور');
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
          <h1 className="font-semibold text-foreground">تغيير كلمة المرور</h1>
        </div>
      </header>

      <main className="px-4 py-6">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-medium text-foreground">تغيير كلمة المرور</h2>
                <p className="text-xs text-muted-foreground">أدخل كلمة المرور الجديدة</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">كلمة المرور الجديدة</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                    placeholder="أدخل كلمة المرور الجديدة"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">تأكيد كلمة المرور</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                  placeholder="أعد إدخال كلمة المرور"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !newPassword || !confirmPassword}
            className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            حفظ التغييرات
          </button>
        </motion.form>
      </main>
    </div>
  );
}
