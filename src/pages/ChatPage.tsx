import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Send, 
  Copy, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { streamChat } from '@/lib/chatService';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const toolInfo: Record<string, { name: string; icon: string; type: string }> = {
  assistant: { name: 'الذكاء المساعد', icon: '🤖', type: 'assistant' },
  code: { name: 'محرر الأكواد', icon: '💻', type: 'code' },
  document: { name: 'محلل المستندات', icon: '📄', type: 'document' },
  'prompt-maker': { name: 'صانع الأوامر', icon: '✨', type: 'prompt' },
};

export default function ChatPage() {
  const { toolId } = useParams();
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const tool = toolInfo[toolId || 'assistant'] || toolInfo.assistant;

  useEffect(() => {
    // Welcome message
    setMessages([{
      id: '1',
      role: 'assistant',
      content: `مرحباً ${profile?.full_name || ''}! 👋 أنا ${tool.name}. كيف يمكنني مساعدتك اليوم؟`,
    }]);
  }, [toolId, profile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        return [...prev, { id: 'streaming', role: 'assistant', content: assistantContent }];
      });
    };

    try {
      await streamChat({
        messages: messages.filter(m => m.id !== '1').concat(userMessage).map(m => ({
          role: m.role,
          content: m.content
        })),
        toolType: tool.type,
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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('تم النسخ');
  };

  const handleRegenerate = async (messageIndex: number) => {
    const previousMessages = messages.slice(0, messageIndex);
    const userMessage = previousMessages[previousMessages.length - 1];
    
    if (userMessage?.role !== 'user') return;

    setMessages(previousMessages);
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
        return [...prev, { id: 'streaming', role: 'assistant', content: assistantContent }];
      });
    };

    try {
      await streamChat({
        messages: previousMessages.filter(m => m.id !== '1').map(m => ({
          role: m.role,
          content: m.content
        })),
        toolType: tool.type,
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
      toast.error('حدث خطأ');
      setLoading(false);
    }
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
              {tool.icon}
            </div>
            <div>
              <h1 className="font-semibold text-foreground">{tool.name}</h1>
              <p className="text-xs text-success flex items-center gap-1">
                <span className="w-2 h-2 bg-success rounded-full pulse-dot"></span>
                متصل بـ AI حقيقي
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-sm font-medium">
              Gemini 3
            </span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-sm'
                  : 'glass-card rounded-tl-sm'
              }`}
            >
              {message.role === 'assistant' ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              )}

              {message.role === 'assistant' && message.id !== '1' && message.id !== 'streaming' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <button
                    onClick={() => handleCopy(message.content)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    title="نسخ"
                  >
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button 
                    onClick={() => handleRegenerate(index)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    title="إعادة التوليد"
                  >
                    <RefreshCw className="w-4 h-4 text-muted-foreground" />
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
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-sm text-muted-foreground">جاري التفكير...</span>
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
              placeholder="اكتب رسالتك هنا..."
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
