import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import NeonButton from '@/components/ui/NeonButton';
import NeonInput from '@/components/ui/NeonInput';
import { useAuth } from '@/contexts/AuthContext';
import { lovable } from '@/integrations/lovable';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('كلمات المرور غير متطابقة');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
      });

      if (result.success) {
        toast.success('تم إنشاء الحساب! يرجى التحقق من بريدك الإلكتروني.');
        navigate('/login');
      } else {
        toast.error(result.error || 'حدث خطأ أثناء إنشاء الحساب');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* Header */}
      <div className="relative h-[30vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/20 via-primary/10 to-background" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-2xl font-bold text-foreground mb-2">
              إنشاء حساب جديد
            </h1>
            <p className="text-muted-foreground">
              انضم إلينا لاستكشاف مستقبل الذكاء الاصطناعي
            </p>
          </motion.div>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 px-6 -mt-6"
      >
        {/* Student offer */}
        <div className="glass-card rounded-2xl p-4 mb-6 neon-border-purple">
          <p className="text-sm text-center text-foreground">
            طالب جامعي؟ سجل باستخدام بريدك الجامعي (.edu) واحصل على اشتراك{' '}
            <span className="pro-badge">Pro</span> مجاني لسنة كاملة!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <NeonInput
            label="الاسم الكامل"
            name="full_name"
            placeholder="أدخل اسمك الكامل"
            value={formData.full_name}
            onChange={handleChange}
            icon={<User className="w-5 h-5" />}
            required
          />

          <NeonInput
            label="اسم المستخدم"
            name="username"
            placeholder="أدخل اسم المستخدم"
            value={formData.username}
            onChange={handleChange}
            icon={<User className="w-5 h-5" />}
            required
          />

          <NeonInput
            label="البريد الإلكتروني"
            name="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
            icon={<Mail className="w-5 h-5" />}
            required
          />

          <div className="relative">
            <NeonInput
              label="كلمة المرور"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              icon={<Lock className="w-5 h-5" />}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-10 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <NeonInput
            label="تأكيد كلمة المرور"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            icon={<Lock className="w-5 h-5" />}
            required
          />

          <NeonButton type="submit" className="w-full" loading={loading}>
            تسجيل حساب جديد
          </NeonButton>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">أو</span>
            </div>
          </div>

          <NeonButton 
            type="button" 
            variant="secondary" 
            className="w-full flex items-center justify-center gap-2"
            loading={googleLoading}
            onClick={async () => {
              setGoogleLoading(true);
              try {
                const { error } = await lovable.auth.signInWithOAuth('google', {
                  redirect_uri: window.location.origin,
                });
                if (error) {
                  toast.error('فشل التسجيل بجوجل');
                }
              } catch (err) {
                toast.error('حدث خطأ أثناء التسجيل بجوجل');
              } finally {
                setGoogleLoading(false);
              }
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            التسجيل بـ Google
          </NeonButton>
        </form>

        {/* Login link */}
        <p className="text-center mt-6 mb-8 text-muted-foreground">
          لديك حساب بالفعل؟{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            تسجيل الدخول
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
