import { useState, useRef, useEffect } from 'react';
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

interface GeneratedAudio {
  id: string;
  text: string;
  timestamp: Date;
  isPlaying: boolean;
  voice: string;
}

export default function TextToSpeechPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [audios, setAudios] = useState<GeneratedAudio[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Try to find Arabic voice first
      const arabicVoice = availableVoices.find(v => v.lang.startsWith('ar'));
      if (arabicVoice) {
        setSelectedVoice(arabicVoice);
      } else if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0]);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const generateSpeech = async () => {
    if (!text.trim() || loading) return;
    
    if (!('speechSynthesis' in window)) {
      toast.error('المتصفح لا يدعم تحويل النص إلى صوت');
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newAudio: GeneratedAudio = {
        id: Date.now().toString(),
        text: text.trim(),
        timestamp: new Date(),
        isPlaying: false,
        voice: selectedVoice?.name || 'Default',
      };
      
      setAudios(prev => [newAudio, ...prev]);
      setText('');
      toast.success('تم إنشاء الصوت بنجاح!');
    } catch (error) {
      toast.error('حدث خطأ أثناء إنشاء الصوت');
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (audio: GeneratedAudio) => {
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    if (currentPlayingId === audio.id) {
      setCurrentPlayingId(null);
      setAudios(prev => prev.map(a => ({ ...a, isPlaying: false })));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(audio.text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      setCurrentPlayingId(audio.id);
      setAudios(prev => prev.map(a => ({
        ...a,
        isPlaying: a.id === audio.id,
      })));
    };

    utterance.onend = () => {
      setCurrentPlayingId(null);
      setAudios(prev => prev.map(a => ({ ...a, isPlaying: false })));
    };

    utterance.onerror = () => {
      setCurrentPlayingId(null);
      setAudios(prev => prev.map(a => ({ ...a, isPlaying: false })));
      toast.error('حدث خطأ أثناء تشغيل الصوت');
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const downloadAsTextFile = (audio: GeneratedAudio) => {
    // Since Web Speech API doesn't support direct audio download,
    // we'll create a text file with instructions
    const content = `النص: ${audio.text}\n\nالصوت: ${audio.voice}\nالسرعة: ${rate}\nالنبرة: ${pitch}\n\nملاحظة: لتحميل الصوت كملف MP3، يمكنك استخدام برامج تسجيل الصوت أثناء التشغيل.`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `speech-${audio.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.info('تم تحميل ملف النص. للحصول على ملف صوتي، استخدم برنامج تسجيل.');
  };

  const deleteAudio = (id: string) => {
    if (currentPlayingId === id) {
      window.speechSynthesis.cancel();
      setCurrentPlayingId(null);
    }
    setAudios(prev => prev.filter(a => a.id !== id));
    toast.success('تم حذف الصوت');
  };

  // Group voices by language
  const arabicVoices = voices.filter(v => v.lang.startsWith('ar'));
  const englishVoices = voices.filter(v => v.lang.startsWith('en'));
  const otherVoices = voices.filter(v => !v.lang.startsWith('ar') && !v.lang.startsWith('en'));

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
              <p className="text-xs text-muted-foreground">اكتب النص واستمع إليه</p>
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
              <select
                value={selectedVoice?.name || ''}
                onChange={(e) => {
                  const voice = voices.find(v => v.name === e.target.value);
                  setSelectedVoice(voice || null);
                }}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm"
              >
                {arabicVoices.length > 0 && (
                  <optgroup label="العربية">
                    {arabicVoices.map(voice => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name}
                      </option>
                    ))}
                  </optgroup>
                )}
                {englishVoices.length > 0 && (
                  <optgroup label="English">
                    {englishVoices.map(voice => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name}
                      </option>
                    ))}
                  </optgroup>
                )}
                {otherVoices.length > 0 && (
                  <optgroup label="لغات أخرى">
                    {otherVoices.map(voice => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Speed Control */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                السرعة: {rate.toFixed(1)}x
              </label>
              <Slider
                value={[rate]}
                onValueChange={(v) => setRate(v[0])}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Pitch Control */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                النبرة: {pitch.toFixed(1)}
              </label>
              <Slider
                value={[pitch]}
                onValueChange={(v) => setPitch(v[0])}
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
              اكتب أي نص في المربع أدناه وسيتم تحويله إلى صوت يمكنك الاستماع إليه
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
                        transition={{ duration: 0.5 }}
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
                    className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${
                      audio.isPlaying 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {audio.isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground line-clamp-2">{audio.text}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {audio.voice}
                      </span>
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
                      onClick={() => downloadAsTextFile(audio)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      title="تحميل"
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
                <span>تحويل إلى صوت</span>
              </>
            )}
          </motion.button>
        </div>
      </footer>
    </div>
  );
}
