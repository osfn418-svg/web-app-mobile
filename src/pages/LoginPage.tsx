import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import NeonButton from '@/components/ui/NeonButton';
import NeonInput from '@/components/ui/NeonInput';
import { useAuth } from '@/contexts/AuthContext';
import { lovable } from '@/integrations/lovable';
import { toast } from 'sonner';

export default function LoginPage() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success('تم تسجيل الدخول بنجاح');
        navigate('/home');
      } else {
        toast.error(result.error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* Header with gradient */}
      <div className="relative h-[40vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-secondary/10 to-background" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold text-foreground mb-2 text-glow">
              Nexus AI Hub
            </h1>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              مرحباً بعودتك!
            </h2>
            <p className="text-muted-foreground">
              سجل الدخول للمتابعة في عالم الذكاء الاصطناعي
            </p>
          </motion.div>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 px-6 -mt-8"
      >
        {/* Student offer banner */}
        <div className="glass-card rounded-2xl p-4 mb-6 neon-border">
          <p className="text-sm text-center text-foreground">
            هل أنت طالب؟ استخدم بريدك الجامعي عند التسجيل واحصل على اشتراك{' '}
            <span className="pro-badge">Pro</span> مجاني لمدة سنة!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <NeonInput
            label="البريد الإلكتروني"
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-5 h-5" />}
            required
          />

          <div className="relative">
            <NeonInput
              label="كلمة المرور"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          <div className="text-left">
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              نسيت كلمة المرور؟
            </Link>
          </div>

          <NeonButton type="submit" className="w-full" loading={loading}>
            تسجيل الدخول
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
                  toast.error('فشل تسجيل الدخول بجوجل');
                }
              } catch (err) {
                toast.error('حدث خطأ أثناء تسجيل الدخول بجوجل');
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
            تسجيل الدخول بـ Google
          </NeonButton>
        </form>

        {/* Register link */}
        <p className="text-center mt-6 text-muted-foreground">
          ليس لديك حساب بعد؟{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">
            سجل الآن
          </Link>
        </p>

        {/* Info */}
        <div className="mt-6 p-4 rounded-xl bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">
            🚀 تطبيق متصل بـ AI حقيقي - سجل حساب جديد للبدء!
          </p>
        </div>
      </motion.div>
    </div>
  );
}
