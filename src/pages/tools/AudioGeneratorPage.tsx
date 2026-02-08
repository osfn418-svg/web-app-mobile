import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Play,
  Pause,
  Download, 
  Sparkles,
  Loader2,
  Music,
  Volume2,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface GeneratedAudio {
  id: string;
  prompt: string;
  duration: string;
  timestamp: Date;
  isPlaying: boolean;
  status: 'generating' | 'completed' | 'failed';
  audioUrl: string | null;
  generationId?: string;
}

const MUSIC_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-music`;

export default function AudioGeneratorPage() {
  const { isPro } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [audios, setAudios] = useState<GeneratedAudio[]>([]);
  const [genre, setGenre] = useState('ambient');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const genres = [
    { id: 'ambient', label: 'أمبينت', emoji: '🌊' },
    { id: 'electronic', label: 'إلكتروني', emoji: '🎛️' },
    { id: 'classical', label: 'كلاسيكي', emoji: '🎻' },
    { id: 'pop', label: 'بوب', emoji: '🎤' },
  ];

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const checkAudioStatus = async (generationId: string, audioId: string) => {
    try {
      const response = await fetch(MUSIC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          action: 'check',
          generationId,
        }),
      });

      const data = await response.json();
      
      if (data.status === 'completed' && data.audio_url) {
        setAudios(prev => prev.map(a => 
          a.id === audioId 
            ? { ...a, status: 'completed', audioUrl: data.audio_url }
            : a
        ));
        toast.success('تم الانتهاء من توليد الموسيقى!');
        return true;
      } else if (data.status === 'failed') {
        setAudios(prev => prev.map(a => 
          a.id === audioId 
            ? { ...a, status: 'failed' }
            : a
        ));
        toast.error('فشل في توليد الموسيقى');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Status check error:', error);
      return false;
    }
  };

  const generateAudio = async () => {
    if (!prompt.trim() || loading) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(MUSIC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          prompt,
          genre,
          duration: 30,
        }),
      });

      if (response.status === 429) {
        toast.error('تم تجاوز حد الاستخدام، يرجى المحاولة لاحقاً');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate audio');
      }

      const newAudio: GeneratedAudio = {
        id: Date.now().toString(),
        prompt: prompt,
        duration: '0:30',
        timestamp: new Date(),
        isPlaying: false,
        status: 'generating',
        audioUrl: null,
        generationId: data.generationId,
      };
      
      setAudios(prev => [newAudio, ...prev]);
      setPrompt('');
      toast.success('بدأ توليد الموسيقى! سيتم إكمالها قريباً...');

      // Start polling for status
      const pollInterval = setInterval(async () => {
        const isDone = await checkAudioStatus(data.generationId, newAudio.id);
        if (isDone) {
          clearInterval(pollInterval);
        }
      }, 10000);

      pollingRef.current = pollInterval;

    } catch (error) {
      console.error('Audio generation error:', error);
      toast.error('حدث خطأ أثناء توليد الصوت');
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = (audio: GeneratedAudio) => {
    if (!audio.audioUrl) {
      toast.error('الموسيقى غير جاهزة بعد');
      return;
    }

    // Stop current audio
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const wasPlaying = audio.isPlaying;
    
    // Update all audios to not playing
    setAudios(prev => prev.map(a => ({ ...a, isPlaying: false })));

    if (!wasPlaying) {
      const newAudioElement = new Audio(audio.audioUrl);
      audioRef.current = newAudioElement;

      newAudioElement.onplay = () => {
        setAudios(prev => prev.map(a => ({
          ...a,
          isPlaying: a.id === audio.id,
        })));
      };

      newAudioElement.onended = () => {
        setAudios(prev => prev.map(a => ({ ...a, isPlaying: false })));
      };

      newAudioElement.play();
    }
  };

  const handleDownload = async (audio: GeneratedAudio) => {
    if (!audio.audioUrl) {
      toast.error('الموسيقى غير جاهزة بعد');
      return;
    }

    try {
      const response = await fetch(audio.audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `music-${audio.id}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('جاري تحميل الموسيقى...');
    } catch (error) {
      toast.error('فشل تحميل الموسيقى');
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
              🎵
            </div>
            <div>
              <h1 className="font-semibold text-foreground">توليد الموسيقى</h1>
              <p className="text-xs text-success flex items-center gap-1">
                <span className="w-2 h-2 bg-success rounded-full pulse-dot"></span>
                متصل بـ AI حقيقي
              </p>
            </div>
          </div>
          <span className="pro-badge">PRO</span>
        </div>
      </header>

      {/* Genre Selector */}
      <div className="px-4 py-3">
        <p className="text-sm text-muted-foreground mb-2">نوع الموسيقى:</p>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {genres.map((g) => (
            <button
              key={g.id}
              onClick={() => setGenre(g.id)}
              className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
                genre === g.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <span>{g.emoji}</span>
              <span>{g.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Generated Audios */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        {audios.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center text-4xl mb-4">
              🎵
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">ابدأ بتوليد موسيقى</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              اكتب وصفاً للموسيقى أو المؤثرات الصوتية التي تريدها
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
                    <Music className="w-6 h-6 text-primary animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">جاري بدء التوليد...</p>
                    <div className="w-full h-1 bg-muted rounded-full mt-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: '80%' }}
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
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-2xl p-4"
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => togglePlay(audio)}
                    disabled={audio.status !== 'completed'}
                    className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
                      audio.status === 'generating' 
                        ? 'bg-muted/50'
                        : audio.isPlaying 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {audio.status === 'generating' ? (
                      <RefreshCw className="w-6 h-6 animate-spin" />
                    ) : audio.isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{audio.prompt}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Volume2 className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{audio.duration}</span>
                      {audio.status === 'generating' && (
                        <span className="text-xs text-primary">قيد التوليد...</span>
                      )}
                      {audio.status === 'failed' && (
                        <span className="text-xs text-destructive">فشل</span>
                      )}
                    </div>
                    {audio.isPlaying && (
                      <div className="flex gap-1 mt-2">
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
                  <button 
                    onClick={() => handleDownload(audio)}
                    disabled={audio.status !== 'completed'}
                    className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Download className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Input */}
      <footer className="glass sticky bottom-0 px-4 py-4 safe-bottom">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && generateAudio()}
              placeholder="صف الموسيقى التي تريد توليدها..."
              className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              disabled={loading}
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={generateAudio}
            disabled={!prompt.trim() || loading}
            className="p-3 bg-primary text-primary-foreground rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
          </motion.button>
        </div>
      </footer>
    </div>
  );
}
