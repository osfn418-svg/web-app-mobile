import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import NeonButton from '@/components/ui/NeonButton';
import NeonInput from '@/components/ui/NeonInput';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function LoginPage() {
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
