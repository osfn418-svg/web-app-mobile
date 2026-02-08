import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Upload,
  FileText,
  Sparkles,
  MessageSquare,
  Send,
  Loader2,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function DocumentAnalyzerPage() {
  const { isPro } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!isPro) {
        toast.error('هذه الميزة متاحة فقط لمشتركي Pro');
        return;
      }
      setFile(selectedFile);
    }
  };

  const analyzeDocument = async () => {
    if (!file) return;
    
    setAnalyzing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      setAnalyzed(true);
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `تم تحليل المستند "${file.name}" بنجاح! 📄\n\n**ملخص المستند:**\nهذا المستند يتضمن معلومات مهمة حول الموضوع المحدد. تم استخراج النقاط الرئيسية والبيانات الهامة.\n\n**إحصائيات:**\n• عدد الصفحات: ${Math.floor(Math.random() * 20) + 5}\n• عدد الكلمات: ${Math.floor(Math.random() * 5000) + 1000}\n• اللغة: العربية\n\nيمكنك الآن طرح أي سؤال حول محتوى المستند!`,
      }]);
      toast.success('تم تحليل المستند بنجاح!');
    } catch (error) {
      toast.error('حدث خطأ أثناء التحليل');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const responses = [
        `بناءً على تحليل المستند، يمكنني الإجابة على سؤالك:\n\n${input.slice(0, 30)}...\n\nالإجابة هي أن المستند يتضمن معلومات تتعلق بهذا الموضوع في القسم الثاني والرابع. هل تريد المزيد من التفاصيل؟`,
        `وجدت المعلومات التالية في المستند:\n\n• النقطة الأولى المتعلقة بسؤالك\n• تفاصيل إضافية من الصفحة 3\n• ملاحظات هامة من الملحق\n\nهل هناك شيء آخر تريد معرفته؟`,
        `بعد مراجعة المستند، إليك الإجابة:\n\nالمستند يوضح هذه النقطة بشكل تفصيلي في الفصل الثاني. يمكنني تلخيص المحتوى أو اقتباس الجزء المحدد إذا أردت.`,
      ];
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error('حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setAnalyzed(false);
    setMessages([]);
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
              📄
            </div>
            <div>
              <h1 className="font-semibold text-foreground">محلل المستندات</h1>
              <p className="text-xs text-muted-foreground">استخراج وتحليل البيانات</p>
            </div>
          </div>
          <span className="pro-badge">PRO</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6">
        {!file ? (
          /* Upload Area */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full min-h-[400px]"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-sm glass-card rounded-2xl p-8 border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center gap-4"
            >
              <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
                <Upload className="w-10 h-10 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">ارفع مستندك</h3>
                <p className="text-sm text-muted-foreground">
                  PDF, Word, أو ملف نصي
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  الحد الأقصى: 10 ميجابايت
                </p>
              </div>
            </button>
          </motion.div>
        ) : !analyzed ? (
          /* File Preview & Analyze */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{file.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={removeFile}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={analyzeDocument}
              disabled={analyzing}
              className="w-full py-4 bg-gradient-pro text-primary-foreground rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري التحليل...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>تحليل المستند</span>
                </>
              )}
            </motion.button>
          </motion.div>
        ) : (
          /* Chat with Document */
          <div className="space-y-4">
            {/* File Info */}
            <div className="glass-card rounded-xl p-3 flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <span className="text-sm text-foreground truncate flex-1">{file.name}</span>
              <button
                onClick={removeFile}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                تغيير
              </button>
            </div>

            {/* Messages */}
            <div className="space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'glass-card rounded-tl-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-end"
                >
                  <div className="glass-card rounded-2xl rounded-tl-sm p-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary animate-pulse" />
                      <span className="text-sm text-muted-foreground">جاري البحث في المستند...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </main>

      {/* Input - Only show when analyzed */}
      {analyzed && (
        <footer className="glass sticky bottom-0 px-4 py-4 safe-bottom">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="اسأل عن محتوى المستند..."
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-3 bg-primary text-primary-foreground rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </footer>
      )}
    </div>
  );
}
