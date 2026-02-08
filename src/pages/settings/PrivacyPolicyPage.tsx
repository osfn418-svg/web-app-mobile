import { motion } from 'framer-motion';
import { ArrowRight, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="glass sticky top-0 z-40 px-4 py-3 safe-top">
        <div className="flex items-center gap-3">
          <Link to="/profile" className="p-2 hover:bg-muted rounded-xl transition-colors">
            <ArrowRight className="w-5 h-5 text-foreground" />
          </Link>
          <h1 className="font-semibold text-foreground">سياسة الخصوصية</h1>
        </div>
      </header>

      <main className="px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-5 space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-medium text-foreground">سياسة الخصوصية</h2>
              <p className="text-sm text-muted-foreground">آخر تحديث: فبراير 2025</p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <section>
              <h3 className="font-medium text-foreground mb-2">1. جمع المعلومات</h3>
              <p>
                نجمع المعلومات التي تقدمها لنا مباشرة عند إنشاء حساب أو استخدام خدماتنا، 
                بما في ذلك الاسم والبريد الإلكتروني ومعلومات الملف الشخصي.
              </p>
            </section>

            <section>
              <h3 className="font-medium text-foreground mb-2">2. استخدام المعلومات</h3>
              <p>
                نستخدم المعلومات المجمعة لتوفير وتحسين خدماتنا، والتواصل معك بشأن حسابك، 
                وإرسال إشعارات مهمة عن التحديثات.
              </p>
            </section>

            <section>
              <h3 className="font-medium text-foreground mb-2">3. حماية البيانات</h3>
              <p>
                نحن ملتزمون بحماية بياناتك. نستخدم تقنيات تشفير متقدمة وإجراءات أمنية 
                صارمة لحماية معلوماتك الشخصية.
              </p>
            </section>

            <section>
              <h3 className="font-medium text-foreground mb-2">4. مشاركة المعلومات</h3>
              <p>
                لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك المعلومات فقط 
                مع مقدمي الخدمات الموثوقين الذين يساعدوننا في تشغيل خدماتنا.
              </p>
            </section>

            <section>
              <h3 className="font-medium text-foreground mb-2">5. حقوقك</h3>
              <p>
                لديك الحق في الوصول إلى بياناتك الشخصية وتصحيحها أو حذفها. يمكنك أيضاً 
                طلب نسخة من بياناتك أو الاعتراض على معالجتها.
              </p>
            </section>

            <section>
              <h3 className="font-medium text-foreground mb-2">6. ملفات تعريف الارتباط</h3>
              <p>
                نستخدم ملفات تعريف الارتباط لتحسين تجربتك. يمكنك التحكم في إعدادات 
                ملفات تعريف الارتباط من خلال متصفحك.
              </p>
            </section>

            <section>
              <h3 className="font-medium text-foreground mb-2">7. التواصل معنا</h3>
              <p>
                إذا كانت لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا عبر 
                البريد الإلكتروني: privacy@nexus.ai
              </p>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
