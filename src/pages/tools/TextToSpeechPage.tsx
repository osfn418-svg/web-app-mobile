import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Play,
  Pause,
  Download, 
  Volume2,
  Loader2,
  Trash2,
  Settings2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useTtsPolling } from '@/hooks/useTtsPolling';

interface GeneratedAudio {
  id: string;
  text: string;
  timestamp: Date;
  isPlaying: boolean;
  voice: string;
  status: 'generating' | 'completed' | 'failed';
  /** data:audio/... when completed */
  audioUrl: string;
  /** Remote URL returned by backend when status is pending */
  remoteAudioUrl?: string;
}

const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`;

export default function TextToSpeechPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [audios, setAudios] = useState<GeneratedAudio[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [speed, setSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);

  const poller = useTtsPolling({
    ttsUrl: TTS_URL,
    authToken: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    intervalMs: 4000,
    timeoutMs: 4 * 60 * 1000,
  });

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const voices = [
    { id: 'alloy', label: 'Alloy', description: 'متوازن' },
    { id: 'echo', label: 'Echo', description: 'ذكوري' },
    { id: 'fable', label: 'Fable', description: 'بريطاني' },
    { id: 'onyx', label: 'Onyx', description: 'عميق' },
    { id: 'nova', label: 'Nova', description: 'أنثوي' },
    { id: 'shimmer', label: 'Shimmer', description: 'ناعم' },
  ];

  const generateSpeech = async () => {
    if (!text.trim() || loading) return;

    const requestText = text.trim();
    const audioId = Date.now().toString();
    const voiceLabel = voices.find((v) => v.id === selectedVoice)?.label || selectedVoice;

    setLoading(true);

    try {
      const response = await fetch(TTS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          action: 'generate',
          text: requestText,
          voice: selectedVoice,
          speed: speed,
        }),
      });

      if (response.status === 429) {
        toast.error('تم تجاوز حد الاستخدام، يرجى المحاولة لاحقاً');
        return;
      }

      if (response.status === 402) {
        toast.error('يرجى إضافة رصيد ثم المحاولة مجدداً');
        return;
      }

      if (response.status === 403) {
        toast.error('تم الوصول لحد الخدمة (403) — يلزم تحديث مفتاح الخدمة/زيادة الحصة');
        return;
      }

      if (response.status === 401) {
        toast.error('غير مصرح (401) — تحقق من إعدادات الخدمة');
        return;
      }

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(errText || 'Failed to generate speech');
      }

      const data = await response.json();

      // New backend: pending/completed/failed
      if (data?.success && data?.status === 'pending' && data?.audioUrl) {
        const pendingAudio: GeneratedAudio = {
          id: audioId,
          text: requestText,
          timestamp: new Date(),
          isPlaying: false,
          voice: voiceLabel,
          status: 'generating',
          audioUrl: '',
          remoteAudioUrl: data.audioUrl,
        };

        setAudios((prev) => [pendingAudio, ...prev]);
        setText('');
        toast.message('جاري تجهيز الصوت...');

        await poller.start({
          id: audioId,
          audioUrl: data.audioUrl,
          onCompleted: (dataUrl) => {
            setAudios((prev) =>
              prev.map((a) =>
                a.id === audioId
                  ? { ...a, status: 'completed', audioUrl: dataUrl, remoteAudioUrl: undefined }
                  : a
              )
            );
            toast.success('تم إنشاء الصوت بنجاح!');
          },
          onFailed: (message) => {
            setAudios((prev) => prev.map((a) => (a.id === audioId ? { ...a, status: 'failed' } : a)));
            toast.error(message);
          },
        });

        return;
      }

      if (data?.success && data?.status === 'failed') {
        const failedAudio: GeneratedAudio = {
          id: audioId,
          text: requestText,
          timestamp: new Date(),
          isPlaying: false,
          voice: voiceLabel,
          status: 'failed',
          audioUrl: '',
        };
        setAudios((prev) => [failedAudio, ...prev]);
        toast.error(data?.error || 'حدث خطأ أثناء إنشاء الصوت');
        return;
      }

      // Backwards-compatible: either {audioData} or {status:"completed", audioData}
      const audioData = data?.audioData;

      if (!data?.success || !audioData) {
        throw new Error(data?.error || 'Invalid TTS response');
      }

      const audioUrl = `data:audio/mpeg;base64,${audioData}`;

      const newAudio: GeneratedAudio = {
        id: audioId,
        text: requestText,
        timestamp: new Date(),
        isPlaying: false,
        voice: voiceLabel,
        status: 'completed',
        audioUrl,
      };

      setAudios((prev) => [newAudio, ...prev]);
      setText('');
      toast.success('تم إنشاء الصوت بنجاح!');
    } catch (error) {
      console.error('TTS error:', error);
      toast.error('حدث خطأ أثناء إنشاء الصوت');
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (audio: GeneratedAudio) => {
    if (audio.status !== 'completed' || !audio.audioUrl) {
      toast.message('الصوت قيد التجهيز...');
      return;
    }

    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (currentPlayingId === audio.id) {
      setCurrentPlayingId(null);
      setAudios((prev) => prev.map((a) => ({ ...a, isPlaying: false })));
      return;
    }

    const newAudio = new Audio(audio.audioUrl);
    audioRef.current = newAudio;

    newAudio.onplay = () => {
      setCurrentPlayingId(audio.id);
      setAudios((prev) =>
        prev.map((a) => ({
          ...a,
          isPlaying: a.id === audio.id,
        }))
      );
    };

    newAudio.onended = () => {
      setCurrentPlayingId(null);
      setAudios((prev) => prev.map((a) => ({ ...a, isPlaying: false })));
    };

    newAudio.onerror = () => {
      setCurrentPlayingId(null);
      setAudios((prev) => prev.map((a) => ({ ...a, isPlaying: false })));
      toast.error('حدث خطأ أثناء تشغيل الصوت');
    };

    newAudio.play();
  };

  const downloadAudio = async (audio: GeneratedAudio) => {
    if (audio.status !== 'completed' || !audio.audioUrl) {
      toast.message('الصوت غير جاهز بعد');
      return;
    }

    try {
      // Data-URL audio (base64) — download directly
      if (audio.audioUrl.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = audio.audioUrl;
        a.download = `speech-${audio.id}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success('جاري تحميل الملف الصوتي...');
        return;
      }

      // Remote URL audio
      const response = await fetch(audio.audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `speech-${audio.id}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('جاري تحميل الملف الصوتي...');
    } catch (error) {
      toast.error('فشل تحميل الملف الصوتي');
    }
  };

  const deleteAudio = (id: string) => {
    poller.stop(id);

    if (currentPlayingId === id && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setCurrentPlayingId(null);
    }
    setAudios((prev) => prev.filter((a) => a.id !== id));
    toast.success('تم حذف الصوت');
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
              🎙️
            </div>
            <div>
              <h1 className="font-semibold text-foreground">تحويل النص إلى صوت</h1>
              <p className="text-xs text-success flex items-center gap-1">
                <span className="w-2 h-2 bg-success rounded-full pulse-dot"></span>
                متصل بـ AI حقيقي
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-xl transition-colors ${showSettings ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
          >
            <Settings2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-4 py-4 border-b border-border bg-muted/50"
        >
          <div className="space-y-4">
            {/* Voice Selection */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">اختر الصوت:</label>
              <div className="grid grid-cols-3 gap-2">
                {voices.map(voice => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`p-2 rounded-lg text-center transition-colors ${
                      selectedVoice === voice.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border border-border hover:bg-muted'
                    }`}
                  >
                    <p className="text-sm font-medium">{voice.label}</p>
                    <p className="text-xs opacity-70">{voice.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Speed Control */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                السرعة: {speed.toFixed(1)}x
              </label>
              <Slider
                value={[speed]}
                onValueChange={(v) => setSpeed(v[0])}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Generated Audios */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        {audios.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center text-4xl mb-4">
              🎙️
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">حوّل النص إلى صوت</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              اكتب أي نص في المربع أدناه وسيتم تحويله إلى ملف صوتي MP3 يمكنك تحميله
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Volume2 className="w-6 h-6 text-primary animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">جاري إنشاء الصوت...</p>
                    <div className="w-full h-1 bg-muted rounded-full mt-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            {audios.map((audio, index) => (
              <motion.div
                key={audio.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card rounded-2xl p-4"
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => playAudio(audio)}
                    disabled={audio.status === 'generating'}
                    className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 disabled:opacity-60 disabled:cursor-not-allowed ${
                      audio.isPlaying 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {audio.status === 'generating' ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : audio.isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground line-clamp-2">{audio.text}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {audio.voice}
                      </span>
                      {audio.status === 'generating' && audio.remoteAudioUrl && (
                        <a
                          href={audio.remoteAudioUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          فتح رابط الصوت
                        </a>
                      )}
                    </div>
                    {audio.isPlaying && (
                      <div className="flex gap-1 mt-3">
                        {[...Array(20)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-1 bg-primary rounded-full"
                            animate={{ height: [4, Math.random() * 16 + 4, 4] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => downloadAudio(audio)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      title="تحميل MP3"
                    >
                      <Download className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <button 
                      onClick={() => deleteAudio(audio.id)}
                      className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-5 h-5 text-destructive" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Input */}
      <footer className="glass sticky bottom-0 px-4 py-4 safe-bottom">
        <div className="flex flex-col gap-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="اكتب النص الذي تريد تحويله إلى صوت..."
            className="min-h-[80px] bg-muted border-border rounded-xl resize-none"
            dir="rtl"
            disabled={loading}
          />
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={generateSpeech}
            disabled={!text.trim() || loading}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري الإنشاء...</span>
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5" />
                <span>تحويل إلى صوت MP3</span>
              </>
            )}
          </motion.button>
        </div>
      </footer>
    </div>
  );
}
