import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Copy,
  RefreshCw,
  Check,
  Wand2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function PromptMakerPage() {
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('creative');
  const [generatedPrompts, setGeneratedPrompts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const styles = [
    { id: 'creative', label: 'إبداعي', emoji: '🎨' },
    { id: 'professional', label: 'احترافي', emoji: '💼' },
    { id: 'simple', label: 'بسيط', emoji: '✨' },
    { id: 'detailed', label: 'تفصيلي', emoji: '📝' },
  ];

  const generatePrompts = async () => {
    if (!topic.trim() || loading) return;
    
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const prompts: Record<string, string[]> = {
        creative: [
          `أنشئ صورة خيالية تجمع بين ${topic} وعناصر سريالية، بألوان نابضة بالحياة وإضاءة درامية`,
          `تخيل ${topic} في عالم موازٍ حيث تختلط التكنولوجيا بالطبيعة، بأسلوب فني معاصر`,
          `صمم مشهداً إبداعياً يظهر ${topic} بطريقة لم يرها أحد من قبل، مع تفاصيل دقيقة ومبهرة`,
        ],
        professional: [
          `صورة احترافية عالية الجودة لـ ${topic}، بإضاءة استوديو وخلفية نظيفة`,
          `تصميم أنيق ومحترف لـ ${topic}، مناسب للاستخدام التجاري والتسويقي`,
          `عرض تقديمي راقٍ لـ ${topic}، بأسلوب عصري وألوان متناسقة`,
        ],
        simple: [
          `${topic} بأسلوب بسيط وأنيق`,
          `رسم توضيحي واضح لـ ${topic}`,
          `تصميم مبسط ومميز لـ ${topic}`,
        ],
        detailed: [
          `صورة فائقة الدقة لـ ${topic}، تظهر كل التفاصيل الدقيقة، مع ملمس واقعي وإضاءة طبيعية، دقة 8K، تصوير احترافي`,
          `مشهد سينمائي لـ ${topic}، بعمق ميداني ضحل، تدرجات لونية سينمائية، تفاصيل مذهلة في كل ركن، إضاءة ذهبية`,
          `تصوير ماكرو دقيق لـ ${topic}، يكشف عن تفاصيل غير مرئية بالعين المجردة، بدقة فائقة وألوان نابضة`,
        ],
      };

      setGeneratedPrompts(prompts[style] || prompts.creative);
      toast.success('تم توليد الأوامر بنجاح!');
    } catch (error) {
      toast.error('حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('تم النسخ');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* Header */}
      <header className="glass sticky top-0 z-40 px-4 py-3 safe-top">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-2 hover:bg-muted rounded-xl transition-colors">
            <ArrowRight className="w-5 h-5 text-foreground" />
          </Link>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl">
              ✨
            </div>
            <div>
              <h1 className="font-semibold text-foreground">صانع الأوامر</h1>
              <p className="text-xs text-muted-foreground">إنشاء prompts احترافية</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Topic Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <label className="text-sm font-medium text-foreground">ما الموضوع الذي تريد إنشاء prompt له؟</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="مثال: غروب الشمس على الشاطئ"
            className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </motion.div>

        {/* Style Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <label className="text-sm font-medium text-foreground">اختر نمط الأمر:</label>
          <div className="grid grid-cols-2 gap-3">
            {styles.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={`p-4 rounded-xl text-sm transition-colors flex flex-col items-center gap-2 ${
                  style === s.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <span className="text-2xl">{s.emoji}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Generate Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileTap={{ scale: 0.98 }}
          onClick={generatePrompts}
          disabled={!topic.trim() || loading}
          className="w-full py-4 bg-gradient-pro text-primary-foreground rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>جاري التوليد...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              <span>توليد الأوامر</span>
            </>
          )}
        </motion.button>

        {/* Generated Prompts */}
        {generatedPrompts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-medium text-foreground">الأوامر المُولدة:</h3>
            {generatedPrompts.map((prompt, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="glass-card rounded-xl p-4"
              >
                <p className="text-sm text-foreground mb-3 leading-relaxed">{prompt}</p>
                <button
                  onClick={() => handleCopy(prompt, index)}
                  className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>نسخ الأمر</span>
                    </>
                  )}
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
