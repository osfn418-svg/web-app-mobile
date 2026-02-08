import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight, CreditCard, Sparkles, Zap, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import MobileLayout from '@/components/layout/MobileLayout';
import NeonButton from '@/components/ui/NeonButton';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const plans = [
  {
    id: 'free',
    name: 'الباقة المجانية',
    price: 0,
    period: 'مجاني',
    description: 'للمبتدئين والأفراد',
    features: [
      '50 محادثة يومياً',
      'سرعة استجابة قياسية',
      'وصول محدود لأدوات الذكاء',
      'دعم المجتمع',
    ],
    current: true,
  },
  {
    id: 'pro',
    name: 'Nexus Pro',
    price: 19.99,
    period: '/ شهر',
    description: 'للمحترفين وصناع المحتوى',
    popular: true,
    features: [
      'موديلات GPT-4 غير محدودة',
      'توليد صور عالية الدقة',
      'توليد صور بجودة 4K',
      'أولوية في الدعم الفني',
      'بدون علامة مائية',
    ],
  },
  {
    id: 'enterprise',
    name: 'باقة الشركات',
    price: 99,
    period: '/ شهر',
    description: 'للفرق الكبيرة والشركات',
    features: [
      'كل مميزات Pro',
      'وصول كامل لواجهة API',
      'مدير حساب مخصص',
      'تدريب مخصص للنموذج',
      'لوحة تحكم تحليلية متقدمة',
    ],
  },
];

export default function SubscriptionPage() {
  const { isPro } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success('تم الاشتراك بنجاح! 🎉');
    setLoading(false);
  };

  return (
    <MobileLayout>
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-2xl font-bold text-foreground mb-2">خطط الاشتراك</h1>
          <p className="text-muted-foreground text-sm">اختر الخطة المناسبة لاحتياجاتك</p>
        </motion.div>

        {/* Student Offer Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-4 neon-border relative overflow-hidden"
        >
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 bg-gradient-pro rounded-full text-xs font-bold text-primary-foreground">
              عرض خاص
            </span>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Sparkles className="w-8 h-8 text-warning" />
            <div>
              <h3 className="font-bold text-foreground">عرض الطلاب الحصري</h3>
              <p className="text-sm text-muted-foreground">
                سجل ببريدك الجامعي واحصل على سنة كاملة مجاناً
              </p>
            </div>
          </div>
        </motion.div>

        {/* Billing Cycle Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-4"
        >
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            شهري
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors relative ${
              billingCycle === 'yearly'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            سنوي
            <span className="absolute -top-2 -left-2 px-2 py-0.5 bg-success text-success-foreground text-xs rounded-full">
              وفر 20%
            </span>
          </button>
        </motion.div>

        {/* Plans */}
        <div className="space-y-4">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 3) }}
              onClick={() => setSelectedPlan(plan.id)}
              className={`glass-card rounded-2xl p-5 cursor-pointer transition-all relative ${
                selectedPlan === plan.id ? 'neon-border' : 'border border-border'
              } ${plan.popular ? 'ring-2 ring-primary' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 right-4">
                  <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                    الأكثر شيوعاً
                  </span>
                </div>
              )}
              
              {plan.current && !isPro && (
                <div className="absolute -top-3 right-4">
                  <span className="px-3 py-1 bg-muted text-muted-foreground text-xs font-bold rounded-full">
                    الخطة الحالية
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                    {plan.id === 'pro' && <Crown className="w-5 h-5 text-warning" />}
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                <div className="text-left">
                  <span className="text-2xl font-bold text-foreground">
                    ${billingCycle === 'yearly' ? (plan.price * 0.8 * 12).toFixed(0) : plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {billingCycle === 'yearly' ? '/ سنة' : plan.period}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success flex-shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {selectedPlan === plan.id && (
                <div className="absolute top-4 left-4">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3">طريقة الدفع</h3>
          <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
            <div className="flex gap-2">
              <div className="w-12 h-8 bg-muted rounded flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="w-12 h-8 bg-muted rounded flex items-center justify-center text-xs font-bold text-muted-foreground">
                PayPal
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground mr-auto rotate-180" />
          </div>
        </motion.div>

        {/* Subscribe Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <NeonButton
            variant={selectedPlan === 'pro' ? 'pro' : 'primary'}
            className="w-full"
            onClick={handleSubscribe}
            loading={loading}
            disabled={selectedPlan === 'free'}
          >
            <Zap className="w-5 h-5 ml-2" />
            {selectedPlan === 'free' ? 'الخطة الحالية' : `اشترك الآن - $${
              billingCycle === 'yearly' 
                ? ((plans.find(p => p.id === selectedPlan)?.price || 0) * 0.8 * 12).toFixed(0)
                : plans.find(p => p.id === selectedPlan)?.price
            }`}
          </NeonButton>
        </motion.div>

        {/* Footer Links */}
        <div className="flex justify-center gap-6 text-sm text-muted-foreground">
          <Link to="#" className="hover:text-foreground transition-colors">
            استعادة المشتريات
          </Link>
          <Link to="#" className="hover:text-foreground transition-colors">
            الشروط والأحكام
          </Link>
        </div>
      </div>
    </MobileLayout>
  );
}
