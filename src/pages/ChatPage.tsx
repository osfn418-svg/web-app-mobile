import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Send, 
  Image as ImageIcon, 
  Mic, 
  Download, 
  Copy, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { saveChat, db, AITool } from '@/lib/database';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  image?: string;
}

export default function ChatPage() {
  const { toolId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [tool, setTool] = useState<AITool | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadTool = async () => {
      const tools = await db.ai_tools.toArray();
      const foundTool = tools.find(t => t.tool_url === `/tools/${toolId}`);
      if (foundTool) {
        setTool(foundTool);
        // Welcome message
        setMessages([{
          id: '1',
          role: 'assistant',
          content: `مرحباً ${user?.full_name || ''}! 👋 أنا ${foundTool.tool_name}. يمكنك سؤالي عن أي شيء أو طلب توليد صورة إبداعية.`,
          timestamp: new Date(),
        }]);
      }
    };
    loadTool();
  }, [toolId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI response - In production, connect to real AI API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const responses = [
      `شكراً على سؤالك! بناءً على طلبك "${userMessage.slice(0, 30)}..."، إليك إجابتي:\n\nيمكنني مساعدتك في هذا الموضوع. هل تريد المزيد من التفاصيل؟`,
      `هذا سؤال رائع! 🌟\n\nبخصوص "${userMessage.slice(0, 20)}..."، أقترح عليك:\n\n1. البدء بتحديد الهدف الأساسي\n2. جمع المعلومات اللازمة\n3. وضع خطة عمل واضحة`,
      `أفهم ما تحتاجه! 💡\n\nبناءً على طلبك، إليك بعض الأفكار المفيدة:\n\n• النقطة الأولى: التخطيط الجيد\n• النقطة الثانية: التنفيذ المرحلي\n• النقطة الثالثة: المراجعة والتحسين`,
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await generateResponse(input);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save to database
      if (user?.user_id && tool?.tool_id) {
        await saveChat({
          user_id: user.user_id,
          tool_id: tool.tool_id,
          user_message: input,
          ai_response: response,
          created_at: new Date(),
        });
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء معالجة الطلب');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('تم النسخ');
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
              {tool?.logo_url || '🤖'}
            </div>
            <div>
              <h1 className="font-semibold text-foreground">{tool?.tool_name || 'المساعد'}</h1>
              <p className="text-xs text-success flex items-center gap-1">
                <span className="w-2 h-2 bg-success rounded-full pulse-dot"></span>
                متصل
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-sm font-medium">
              GPT-4
            </button>
          </div>
        </div>
        
        {/* Mode Toggle */}
        <div className="flex gap-2 mt-3">
          <button className="flex-1 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium">
            محادثة ذكية
          </button>
          <button className="flex-1 py-2 bg-muted text-muted-foreground rounded-xl text-sm font-medium">
            توليد صور
          </button>
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
              className={`max-w-[85%] rounded-2xl p-4 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-sm'
                  : 'glass-card rounded-tl-sm'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              
              {message.image && (
                <div className="mt-3 rounded-xl overflow-hidden">
                  <img src={message.image} alt="Generated" className="w-full" />
                </div>
              )}

              {message.role === 'assistant' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <button
                    onClick={() => handleCopy(message.content)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <Download className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <RefreshCw className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              )}
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
          <button className="p-3 hover:bg-muted rounded-xl transition-colors">
            <ImageIcon className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="p-3 hover:bg-muted rounded-xl transition-colors">
            <Mic className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="اكتب رسالتك هنا..."
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
    </div>
  );
}
