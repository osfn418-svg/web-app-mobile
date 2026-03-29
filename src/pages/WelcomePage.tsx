import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import NeonButton from '@/components/ui/NeonButton';
import { Sparkles, Brain, Wand2 } from 'lucide-react';
import logoImg from '@/assets/logo.png';

export default function WelcomePage() {
  const navigate = useNavigate();

  const features = [
    { icon: Brain, label: 'ذكاء اصطناعي متقدم' },
    { icon: Wand2, label: 'توليد صور وفيديو' },
    { icon: Sparkles, label: 'أدوات إبداعية' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6" dir="rtl">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center max-w-md"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-40 h-40 mx-auto mb-6"
        >
          <img src={logoImg} alt="Nexus AI Hub Logo" className="w-full h-full object-contain" />
        </motion.div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-foreground mb-3 text-glow">
          Nexus AI Hub
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          منصتك الشاملة لأدوات الذكاء الاصطناعي
        </p>

        {/* Features */}
        <div className="flex justify-center gap-6 mb-10">
          {features.map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">{feature.label}</span>
            </motion.div>
          ))}
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <NeonButton
            onClick={() => navigate('/login')}
            className="w-full"
          >
            تسجيل الدخول
          </NeonButton>
          <NeonButton
            variant="outline"
            onClick={() => navigate('/register')}
            className="w-full"
          >
            إنشاء حساب جديد
          </NeonButton>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-sm text-muted-foreground"
        >
          بالتسجيل، أنت توافق على{' '}
          <Link to="#" className="text-primary hover:underline">
            الشروط والأحكام
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
