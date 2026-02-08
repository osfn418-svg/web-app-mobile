import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Upload,
  FileText,
  Sparkles,
  Send,
  Loader2,
  X,
  ClipboardPaste,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { streamDocumentAnalysis, readFileAsText } from '@/lib/documentService';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

type InputMode = 'upload' | 'paste';

export default function DocumentAnalyzerPage() {
  const { isPro } = useAuth();
  const [inputMode, setInputMode] = useState<InputMode>('paste');
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [documentText, setDocumentText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file type - only text files for now
      if (!selectedFile.type.includes('text') && !selectedFile.name.endsWith('.txt')) {
        toast.error('حالياً يدعم الملفات النصية فقط (.txt)');
        return;
      }
      if (selectedFile.size > 1024 * 1024) {
        toast.error('الحد الأقصى للملف 1 ميجابايت');
        return;
      }
      setFile(selectedFile);
      try {
        const text = await readFileAsText(selectedFile);
        setDocumentText(text);
      } catch {
        toast.error('فشل قراءة الملف');
      }
    }
  };

  const analyzeDocument = async () => {
    const textToAnalyze = inputMode === 'paste' ? pastedText : documentText;
    
    if (!textToAnalyze.trim()) {
      toast.error('يرجى إدخال نص للتحليل');
      return;
    }
    
    if (textToAnalyze.trim().length < 50) {
      toast.error('النص قصير جداً، يرجى إدخال نص أطول للتحليل');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setDocumentText(textToAnalyze);

    // Create initial assistant message
    const assistantId = Date.now().toString();
    setMessages([{
      id: assistantId,
      role: 'assistant',
      content: '',
    }]);

    try {
      await streamDocumentAnalysis({
        action: 'analyze',
        documentText: textToAnalyze,
        onDelta: (delta) => {
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.role === 'assistant') {
              return prev.map((m, i) => 
                i === prev.length - 1 ? { ...m, content: m.content + delta } : m
              );
            }
            return prev;
          });
        },
        onDone: () => {
          setAnalyzed(true);
          setAnalyzing(false);
          toast.success('تم تحليل المستند بنجاح!');
        },
        onError: (err) => {
          setError(err);
          setAnalyzing(false);
          toast.error(err);
        },
      });
    } catch {
      setAnalyzing(false);
      toast.error('حدث خطأ أثناء التحليل');
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

    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

    try {
      await streamDocumentAnalysis({
        action: 'chat',
        documentText,
        question: input,
        messages: messages.filter(m => m.content.trim()),
        onDelta: (delta) => {
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.role === 'assistant') {
              return prev.map((m, i) => 
                i === prev.length - 1 ? { ...m, content: m.content + delta } : m
              );
            }
            return prev;
          });
        },
        onDone: () => {
          setLoading(false);
        },
        onError: (err) => {
          setLoading(false);
          toast.error(err);
        },
      });
    } catch {
      setLoading(false);
      toast.error('حدث خطأ');
    }
  };

  const removeDocument = () => {
    setFile(null);
    setPastedText('');
    setDocumentText('');
    setAnalyzed(false);
    setMessages([]);
    setError(null);
  };

  const showUploadOrPaste = !analyzed && !analyzing;

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* Header */}
      <header className="glass sticky top-0 z-40 px-4 py-3 safe-top border-b border-border/50">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-2 hover:bg-muted rounded-xl transition-colors">
            <ArrowRight className="w-5 h-5 text-foreground" />
          </Link>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xl border border-primary/30">
              📄
            </div>
            <div>
              <h1 className="font-semibold text-foreground">محلل المستندات</h1>
              <p className="text-xs text-success flex items-center gap-1">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
                متصل بـ AI حقيقي
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6">
        {showUploadOrPaste ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Mode Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setInputMode('paste')}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  inputMode === 'paste'
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <ClipboardPaste className="w-4 h-4" />
                لصق النص
              </button>
              <button
                onClick={() => setInputMode('upload')}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  inputMode === 'upload'
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Upload className="w-4 h-4" />
                رفع ملف
              </button>
            </div>

            {inputMode === 'paste' ? (
              /* Paste Text Area */
              <div className="space-y-4">
                <div className="glass-card rounded-2xl p-4 border border-border/50">
                  <textarea
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="الصق النص هنا للتحليل...

مثال: مقال، تقرير، محتوى صفحة ويب، ملاحظات، أو أي نص تريد تحليله واستخلاص المعلومات منه."
                    className="w-full h-64 bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none text-sm leading-relaxed"
                    dir="rtl"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {pastedText.length} حرف • الحد الأدنى 50 حرف
                </p>
              </div>
            ) : (
              /* Upload Area */
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {!file ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full glass-card rounded-2xl p-8 border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center gap-4"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/30">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-base font-semibold text-foreground mb-1">ارفع ملف نصي</h3>
                      <p className="text-sm text-muted-foreground">
                        ملفات .txt فقط حالياً
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        الحد الأقصى: 1 ميجابايت
                      </p>
                    </div>
                  </button>
                ) : (
                  <div className="glass-card rounded-2xl p-4 border border-border/50">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                        <FileText className="w-7 h-7 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{file.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB • {documentText.length} حرف
                        </p>
                      </div>
                      <button
                        onClick={removeDocument}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Analyze Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={analyzeDocument}
              disabled={analyzing || (inputMode === 'paste' ? !pastedText.trim() : !file)}
              className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
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
            {/* Document Info */}
            <div className="glass-card rounded-xl p-3 flex items-center gap-3 border border-border/50">
              <FileText className="w-5 h-5 text-primary" />
              <span className="text-sm text-foreground truncate flex-1">
                {file?.name || 'نص ملصوق'}
                <span className="text-muted-foreground text-xs mr-2">({documentText.length} حرف)</span>
              </span>
              <button
                onClick={removeDocument}
                className="text-xs text-primary hover:underline transition-colors"
              >
                مستند جديد
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
            )}

            {/* Messages */}
            <div className="space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl p-4 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'glass-card rounded-tl-sm border border-border/50'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                        <ReactMarkdown>{message.content || '...'}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
                  <div className="glass-card rounded-2xl rounded-tl-sm p-4 border border-border/50">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
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
        <footer className="glass sticky bottom-0 px-4 py-4 safe-bottom border-t border-border/50">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="اسأل عن محتوى المستند..."
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-3 bg-primary text-primary-foreground rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </footer>
      )}
    </div>
  );
}
