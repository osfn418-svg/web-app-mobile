import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Send, 
  Copy, 
  Code,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { streamChat } from '@/lib/chatService';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isCode?: boolean;
}

export default function CodeAssistantPage() {
  const { profile, isPro } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('javascript');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const languages = [
    { id: 'javascript', label: 'JavaScript', emoji: '🟨' },
    { id: 'python', label: 'Python', emoji: '🐍' },
    { id: 'typescript', label: 'TypeScript', emoji: '🔷' },
    { id: 'html', label: 'HTML/CSS', emoji: '🌐' },
  ];

  useEffect(() => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: `مرحباً ${profile?.full_name || ''}! 👨‍💻 أنا مساعد البرمجة. يمكنني مساعدتك في:\n\n• كتابة الأكواد\n• تصحيح الأخطاء\n• شرح المفاهيم البرمجية\n• تحسين الأداء\n\nكيف يمكنني مساعدتك اليوم؟`,
    }]);
  }, [profile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `[لغة البرمجة: ${language}]\n${input}`,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    let assistantContent = '';

    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && last.id === 'streaming') {
          return prev.map((m, i) => 
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { id: 'streaming', role: 'assistant', content: assistantContent, isCode: true }];
      });
    };

    try {
      await streamChat({
        messages: messages.filter(m => m.id !== '1').concat(userMessage).map(m => ({
          role: m.role,
          content: m.content
        })),
        toolType: 'code',
        onDelta: updateAssistant,
        onDone: () => {
          setMessages(prev => 
            prev.map(m => m.id === 'streaming' ? { ...m, id: Date.now().toString() } : m)
          );
          setLoading(false);
        },
        onError: (error) => {
          toast.error(error);
          setLoading(false);
        }
      });
    } catch (error) {
      toast.error('حدث خطأ أثناء معالجة الطلب');
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    const codeMatch = text.match(/```[\s\S]*?\n([\s\S]*?)```/);
    const codeToCopy = codeMatch ? codeMatch[1].trim() : text;
    
    navigator.clipboard.writeText(codeToCopy);
    setCopiedId(id);
    toast.success('تم النسخ');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatMessage = (content: string) => {
    return content.split('```').map((part, index) => {
      if (index % 2 === 1) {
        const [lang, ...code] = part.split('\n');
        return (
          <div key={index} className="my-3 rounded-xl overflow-hidden bg-[#1e1e1e]">
            <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-border">
              <span className="text-xs text-muted-foreground">{lang || 'code'}</span>
            </div>
            <pre className="p-4 overflow-x-auto text-sm">
              <code className="text-green-400">{code.join('\n')}</code>
            </pre>
          </div>
        );
      }
      return <span key={index} className="whitespace-pre-wrap">{part}</span>;
    });
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
              💻
            </div>
            <div>
              <h1 className="font-semibold text-foreground">محرر الأكواد</h1>
              <p className="text-xs text-success flex items-center gap-1">
                <span className="w-2 h-2 bg-success rounded-full pulse-dot"></span>
                متصل بـ AI حقيقي
              </p>
            </div>
          </div>
          <span className="pro-badge">PRO</span>
        </div>
        
        {/* Language Selector */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setLanguage(lang.id)}
              className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors flex items-center gap-1 ${
                language === lang.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <span>{lang.emoji}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[90%] rounded-2xl p-4 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-sm'
                  : 'glass-card rounded-tl-sm'
              }`}
            >
              <div className="text-sm">{formatMessage(message.content)}</div>

              {message.role === 'assistant' && message.isCode && message.id !== '1' && message.id !== 'streaming' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <button
                    onClick={() => handleCopy(message.content, message.id)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors flex items-center gap-1"
                  >
                    {copiedId === message.id ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-xs text-muted-foreground">نسخ الكود</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {loading && messages[messages.length - 1]?.role !== 'assistant' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-end"
          >
            <div className="glass-card rounded-2xl rounded-tl-sm p-4">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-sm text-muted-foreground">جاري كتابة الكود...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <footer className="glass sticky bottom-0 px-4 py-4 safe-bottom">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="اكتب سؤالك البرمجي هنا..."
              className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              disabled={loading}
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
    </div>
  );
}
