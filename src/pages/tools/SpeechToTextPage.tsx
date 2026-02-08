import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Mic,
  MicOff,
  Upload,
  Copy,
  Trash2,
  Loader2,
  FileAudio
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface Transcription {
  id: string;
  text: string;
  timestamp: Date;
  language: string;
  source: 'recording' | 'upload';
}

const STT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/speech-to-text`;

export default function SpeechToTextPage() {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('ar');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const languages = [
    { code: 'ar', label: 'العربية' },
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'es', label: 'Español' },
  ];

  const transcribeAudio = async (audioBlob: Blob, source: 'recording' | 'upload') => {
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      formData.append('language', selectedLanguage);

      const response = await fetch(STT_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: formData,
      });

      if (response.status === 429) {
        toast.error('تم تجاوز حد الاستخدام، يرجى المحاولة لاحقاً');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to transcribe audio');
      }

      const data = await response.json();

      if (!data.success || !data.text) {
        throw new Error(data.error || 'No transcription received');
      }

      const newTranscription: Transcription = {
        id: Date.now().toString(),
        text: data.text,
        timestamp: new Date(),
        language: languages.find(l => l.code === selectedLanguage)?.label || selectedLanguage,
        source,
      };

      setTranscriptions(prev => [newTranscription, ...prev]);
      toast.success('تم تحويل الصوت إلى نص بنجاح!');
    } catch (error) {
      console.error('STT error:', error);
      toast.error('حدث خطأ أثناء تحويل الصوت');
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        await transcribeAudio(audioBlob, 'recording');
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.message('جاري التسجيل... اضغط مرة أخرى للإيقاف');
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('فشل في بدء التسجيل. تأكد من إعطاء صلاحية الميكروفون');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.error('يرجى اختيار ملف صوتي');
      return;
    }

    await transcribeAudio(file, 'upload');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('تم نسخ النص');
  };

  const deleteTranscription = (id: string) => {
    setTranscriptions(prev => prev.filter(t => t.id !== id));
    toast.success('تم حذف النص');
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
                متصل بـ AI حقيقي
              </p>
            </div>
          </div>
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
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
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

      {/* Transcriptions */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        {transcriptions.length === 0 && !isProcessing ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center text-4xl mb-4">
              🎤
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">حوّل الصوت إلى نص</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              سجّل صوتك أو ارفع ملف صوتي وسيتم تحويله إلى نص مكتوب
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">جاري تحويل الصوت إلى نص...</p>
                  </div>
                </div>
              </motion.div>
            )}
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
                    <span className="text-xs text-muted-foreground">
                      {item.source === 'recording' ? '🎙️ تسجيل' : '📁 ملف'}
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
        <div className="flex items-center justify-center gap-4">
          {/* File Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={isRecording || isProcessing}
            className="p-4 bg-muted text-muted-foreground rounded-xl disabled:opacity-50"
          >
            <Upload className="w-6 h-6" />
          </motion.button>

          {/* Record Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors ${
              isRecording
                ? 'bg-destructive text-destructive-foreground animate-pulse'
                : 'bg-primary text-primary-foreground'
            } disabled:opacity-50`}
          >
            {isRecording ? (
              <MicOff className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </motion.button>

          {/* Placeholder for symmetry */}
          <div className="w-14 h-14" />
        </div>
        <p className="text-center text-xs text-muted-foreground mt-3">
          {isRecording ? 'اضغط لإيقاف التسجيل' : 'اضغط للتسجيل أو ارفع ملف صوتي'}
        </p>
      </footer>
    </div>
  );
}
