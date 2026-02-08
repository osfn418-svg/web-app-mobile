import { motion } from 'framer-motion';
import { ArrowRight, HelpCircle, MessageCircle, Mail, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'ما هو Nexus AI Hub؟',
    answer: 'Nexus AI Hub هو منصة متكاملة تجمع أدوات الذكاء الاصطناعي المختلفة في مكان واحد، بما في ذلك توليد الصور والفيديو والصوت، ومساعد البرمجة، وتحليل المستندات.',
  },
  {
    question: 'كيف أحصل على اشتراك Pro؟',
    answer: 'يمكنك الترقية إلى اشتراك Pro من صفحة الاشتراكات. الاشتراك يمنحك وصولاً غير محدود لجميع الأدوات والميزات الحصرية.',
  },
  {
    question: 'هل يمكنني استخدام التطبيق مجاناً؟',
    answer: 'نعم! يمكنك استخدام العديد من الأدوات مجاناً مع بعض القيود. للحصول على تجربة كاملة بدون قيود، ننصح بالترقية إلى Pro.',
  },
  {
    question: 'كيف أحفظ محادثاتي؟',
    answer: 'جميع محادثاتك تُحفظ تلقائياً في حسابك. يمكنك الوصول إليها من صفحة "السجلات" في أي وقت.',
  },
  {
    question: 'هل بياناتي آمنة؟',
    answer: 'نعم، نحن نستخدم أحدث تقنيات التشفير والحماية لضمان أمان بياناتك ومحادثاتك.',
  },
];

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="glass sticky top-0 z-40 px-4 py-3 safe-top">
        <div className="flex items-center gap-3">
          <Link to="/profile" className="p-2 hover:bg-muted rounded-xl transition-colors">
            <ArrowRight className="w-5 h-5 text-foreground" />
          </Link>
          <h1 className="font-semibold text-foreground">مركز المساعدة</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Quick Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-medium text-foreground">كيف يمكننا مساعدتك؟</h2>
              <p className="text-sm text-muted-foreground">اختر من الخيارات أدناه</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <a 
              href="mailto:support@nexus.ai"
              className="flex items-center gap-3 p-3 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
            >
              <Mail className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-foreground">راسلنا</span>
            </a>
            <Link 
              to="/tools/assistant"
              className="flex items-center gap-3 p-3 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
            >
              <MessageCircle className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-foreground">الدردشة</span>
            </Link>
          </div>
        </motion.div>

        {/* FAQs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-medium text-foreground mb-4">الأسئلة الشائعة</h3>
          <div className="glass-card rounded-2xl overflow-hidden">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-border">
                  <AccordionTrigger className="px-4 py-3 text-foreground text-right hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
