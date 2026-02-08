import { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Mic,
  MicOff,
  Copy,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface Transcription {
  id: string;
  text: string;
  timestamp: Date;
  language: string;
}

export default function SpeechToTextPage() {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('ar-SA');
  const [liveTranscript, setLiveTranscript] = useState('');
  
  const recognitionRef = useRef<any>(null);

  const languages = [
    { code: 'ar-SA', label: 'العربية' },
    { code: 'en-US', label: 'English' },
    { code: 'fr-FR', label: 'Français' },
    { code: 'es-ES', label: 'Español' },
  ];

  // Check browser support
  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = useCallback(() => {
    if (!isSupported) {
      toast.error('المتصفح لا يدعم التعرف على الصوت');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = selectedLanguage;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsRecording(true);
      setLiveTranscript('');
      toast.message('جاري التسجيل... تحدث الآن');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setLiveTranscript(interimTranscript || finalTranscript);

      if (finalTranscript) {
        const newTranscription: Transcription = {
          id: Date.now().toString(),
          text: finalTranscript,
          timestamp: new Date(),
          language: languages.find(l => l.code === selectedLanguage)?.label || selectedLanguage,
        };
        setTranscriptions(prev => [newTranscription, ...prev]);
        setLiveTranscript('');
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        toast.error('يرجى السماح بالوصول للميكروفون');
      } else if (event.error === 'no-speech') {
        toast.message('لم يتم اكتشاف صوت');
      } else {
        toast.error('حدث خطأ في التعرف على الصوت');
      }
      setIsRecording(false);
      setIsProcessing(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setIsProcessing(false);
      if (liveTranscript) {
        const newTranscription: Transcription = {
          id: Date.now().toString(),
          text: liveTranscript,
          timestamp: new Date(),
          language: languages.find(l => l.code === selectedLanguage)?.label || selectedLanguage,
        };
        setTranscriptions(prev => [newTranscription, ...prev]);
        setLiveTranscript('');
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, selectedLanguage, liveTranscript]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      setIsProcessing(true);
      recognitionRef.current.stop();
    }
  }, []);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('تم نسخ النص');
  };

  const deleteTranscription = (id: string) => {
    setTranscriptions(prev => prev.filter(t => t.id !== id));
    toast.success('تم حذف النص');
  };

  const copyAllText = () => {
    const allText = transcriptions.map(t => t.text).join('\n\n');
    navigator.clipboard.writeText(allText);
    toast.success('تم نسخ جميع النصوص');
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
              🎤
            </div>
            <div>
              <h1 className="font-semibold text-foreground">تحويل الصوت إلى نص</h1>
              <p className="text-xs text-success flex items-center gap-1">
                <span className="w-2 h-2 bg-success rounded-full pulse-dot"></span>
                تعرف صوتي مباشر
              </p>
            </div>
          </div>
          {transcriptions.length > 0 && (
            <button
              onClick={copyAllText}
              className="p-2 hover:bg-muted rounded-xl transition-colors"
              title="نسخ الكل"
            >
              <Copy className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>
      </header>

      {/* Language Selector */}
      <div className="px-4 py-3 border-b border-border">
        <p className="text-sm text-muted-foreground mb-2">لغة الصوت:</p>
        <div className="flex gap-2 flex-wrap">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLanguage(lang.code)}
              disabled={isRecording}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50 ${
                selectedLanguage === lang.code
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Transcript */}
      {(isRecording || liveTranscript) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-3 bg-primary/10 border-b border-primary/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
            <span className="text-sm text-primary font-medium">جاري التسجيل...</span>
          </div>
          {liveTranscript && (
            <p className="text-foreground">{liveTranscript}</p>
          )}
        </motion.div>
      )}

      {/* Transcriptions */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        {!isSupported ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-20 h-20 rounded-2xl bg-destructive/20 flex items-center justify-center text-4xl mb-4">
              ⚠️
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">المتصفح غير مدعوم</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              يرجى استخدام متصفح Chrome أو Edge أو Safari للاستفادة من ميزة التعرف على الصوت
            </p>
          </div>
        ) : transcriptions.length === 0 && !isRecording ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center text-4xl mb-4">
              🎤
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">حوّل الصوت إلى نص</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              اضغط على زر الميكروفون وابدأ بالتحدث، سيتم تحويل كلامك إلى نص مكتوب في الوقت الفعلي
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transcriptions.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card rounded-2xl p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {item.language}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => copyText(item.text)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      title="نسخ"
                    >
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => deleteTranscription(item.id)}
                      className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
                <p className="text-foreground leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Controls */}
      <footer className="glass sticky bottom-0 px-4 py-4 safe-bottom">
        <div className="flex items-center justify-center">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing || !isSupported}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors ${
              isRecording
                ? 'bg-destructive text-destructive-foreground animate-pulse'
                : 'bg-primary text-primary-foreground'
            } disabled:opacity-50`}
          >
            {isProcessing ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : isRecording ? (
              <MicOff className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </motion.button>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-3">
          {isRecording ? 'اضغط لإيقاف التسجيل' : 'اضغط للتسجيل'}
        </p>
      </footer>
    </div>
  );
}

export {};
