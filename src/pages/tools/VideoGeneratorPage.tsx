import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Play,
  Download, 
  Sparkles,
  Loader2,
  Video,
  RefreshCw,
  AlertCircle,
  Clock,
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { useAuthToken } from '@/hooks/useAuthToken';

interface GeneratedVideo {
  id: string;
  prompt: string;
  thumbnail: string;
  videoUrl: string | null;
  duration: string;
  timestamp: Date;
  status: 'generating' | 'completed' | 'failed';
  generationId?: string;
  progress?: number;
  startTime?: number;
  errorMessage?: string;
}

const VIDEO_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-video`;
const MAX_GENERATION_TIME = 5 * 60 * 1000; // 5 minutes
const VIDEO_TOOL_ID = '931e0aa8-c3fc-4ace-9ea4-043c1f9fe0d1';

export default function VideoGeneratorPage() {
  const { isPro } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [duration, setDuration] = useState('5');
  const pollingRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const progressRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const { logActivity } = useActivityLogger();

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      pollingRef.current.forEach(interval => clearInterval(interval));
      progressRef.current.forEach(interval => clearInterval(interval));
    };
  }, []);

  const stopPolling = (videoId: string) => {
    const polling = pollingRef.current.get(videoId);
    if (polling) {
      clearInterval(polling);
      pollingRef.current.delete(videoId);
    }
    const progress = progressRef.current.get(videoId);
    if (progress) {
      clearInterval(progress);
      progressRef.current.delete(videoId);
    }
  };

  const checkVideoStatus = async (generationId: string, videoId: string, startTime: number) => {
    // Timeout after 5 minutes
    if (Date.now() - startTime > MAX_GENERATION_TIME) {
      setVideos(prev => prev.map(v => 
        v.id === videoId 
          ? { ...v, status: 'failed', errorMessage: 'استغرق التوليد وقتاً طويلاً' }
          : v
      ));
      stopPolling(videoId);
      toast.error('استغرق التوليد وقتاً طويلاً، حاول مجدداً');
      return true;
    }

    try {
      const response = await fetch(VIDEO_URL, {
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

      if (response.status === 429) {
        toast.error('تم تجاوز حد الاستخدام، يرجى المحاولة لاحقاً');
        setVideos(prev => prev.map(v => v.id === videoId ? { ...v, status: 'failed' } : v));
        return true;
      }

      if (response.status === 402) {
        toast.error('يرجى إضافة رصيد ثم المحاولة مجدداً');
        setVideos(prev => prev.map(v => v.id === videoId ? { ...v, status: 'failed' } : v));
        return true;
      }

      if (response.status === 403) {
        toast.error('تم الوصول لحد الخدمة (403) — يلزم تحديث مفتاح الخدمة/زيادة الحصة');
        setVideos(prev => prev.map(v => v.id === videoId ? { ...v, status: 'failed' } : v));
        return true;
      }

      if (response.status === 401) {
        toast.error('غير مصرح (401) — تحقق من إعدادات الخدمة');
        setVideos(prev => prev.map(v => v.id === videoId ? { ...v, status: 'failed' } : v));
        return true;
      }

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        console.error('Video status check failed:', response.status, errText);
        setVideos(prev => prev.map(v => v.id === videoId ? { ...v, status: 'failed' } : v));
        toast.error('تعذر التحقق من حالة الفيديو');
        return true;
      }

      const data = await response.json();
      console.log('Video status:', data);

      if (data.status === 'completed' && data.video_url) {
        setVideos(prev => prev.map(v => 
          v.id === videoId 
            ? { ...v, status: 'completed', videoUrl: data.video_url, thumbnail: data.video_url }
            : v
        ));
        toast.success('تم توليد الفيديو بنجاح!');
        return true;
      } else if (data.status === 'failed' || data.status === 'error') {
        setVideos(prev => prev.map(v => 
          v.id === videoId 
            ? { ...v, status: 'failed' }
            : v
        ));
        toast.error('فشل في توليد الفيديو');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Status check error:', error);
      // لا نوقف التوليد مباشرة في حال خطأ شبكة مؤقت
      return false;
    }
  };
  const generateVideo = async () => {
    if (!prompt.trim() || loading) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(VIDEO_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          prompt,
          duration,
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
        throw new Error(errText || 'Failed to generate video');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate video');
      }

      const newVideo: GeneratedVideo = {
        id: Date.now().toString(),
        prompt: prompt,
        thumbnail: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400&h=300&fit=crop',
        videoUrl: null,
        duration: `${duration}s`,
        timestamp: new Date(),
        status: 'generating',
        generationId: data.generationId,
        progress: 0,
        startTime: Date.now(),
      };
      
      setVideos(prev => [newVideo, ...prev]);
      setPrompt('');
      toast.success('بدأ توليد الفيديو! سيتم إكماله قريباً...');

      // Log activity
      logActivity({
        toolId: VIDEO_TOOL_ID,
        title: `فيديو: ${prompt.slice(0, 50)}...`,
        type: 'generation'
      });

      // Start progress simulation
      const progressInterval = setInterval(() => {
        setVideos(prev => prev.map(v => {
          if (v.id === newVideo.id && v.status === 'generating') {
            const elapsed = Date.now() - (v.startTime || Date.now());
            const estimatedProgress = Math.min(95, Math.floor((elapsed / MAX_GENERATION_TIME) * 100));
            return { ...v, progress: estimatedProgress };
          }
          return v;
        }));
      }, 3000);
      progressRef.current.set(newVideo.id, progressInterval);

      // Start polling for status with start time for timeout
      const startTime = Date.now();
      const pollInterval = setInterval(async () => {
        const isDone = await checkVideoStatus(data.generationId, newVideo.id, startTime);
        if (isDone) {
          stopPolling(newVideo.id);
        }
      }, 8000); // Check every 8 seconds

      pollingRef.current.set(newVideo.id, pollInterval);

    } catch (error) {
      console.error('Video generation error:', error);
      toast.error('حدث خطأ أثناء توليد الفيديو');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (video: GeneratedVideo) => {
    if (!video.videoUrl) {
      toast.error('الفيديو غير جاهز بعد');
      return;
    }
    
    try {
      const response = await fetch(video.videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `video-${video.id}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('جاري تحميل الفيديو...');
    } catch (error) {
      toast.error('فشل تحميل الفيديو');
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
              🎬
            </div>
            <div>
              <h1 className="font-semibold text-foreground">توليد الفيديو</h1>
              <p className="text-xs text-success flex items-center gap-1">
                <span className="w-2 h-2 bg-success rounded-full pulse-dot"></span>
                متصل بـ AI حقيقي
              </p>
            </div>
          </div>
          <span className="pro-badge">PRO</span>
        </div>
      </header>

      {/* Duration Selector */}
      <div className="px-4 py-3">
        <p className="text-sm text-muted-foreground mb-2">مدة الفيديو:</p>
        <div className="flex gap-2">
          {['5', '10'].map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                duration === d
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {d} ثانية
            </button>
          ))}
        </div>
      </div>

      {/* Generated Videos */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        {videos.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center text-4xl mb-4">
              🎬
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">ابدأ بتوليد فيديو</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              اكتب وصفاً للمشهد الذي تريد إنشاءه وسيقوم الذكاء الاصطناعي بتحويله لفيديو
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6 text-center"
              >
                <Video className="w-12 h-12 text-primary animate-pulse mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">جاري بدء توليد الفيديو...</p>
              </motion.div>
            )}
            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-2xl overflow-hidden"
              >
                <div className="relative aspect-video">
                  {video.status === 'completed' && video.videoUrl ? (
                    <video 
                      src={video.videoUrl}
                      poster={video.thumbnail}
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <img 
                        src={video.thumbnail} 
                        alt={video.prompt}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm">
                        {video.status === 'generating' ? (
                          <div className="text-center px-6 w-full">
                            <RefreshCw className="w-10 h-10 text-primary animate-spin mx-auto mb-3" />
                            <p className="text-sm font-medium text-foreground mb-2">جاري التوليد...</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                              <Clock className="w-3 h-3" />
                              <span>قد يستغرق 2-4 دقائق</span>
                            </div>
                            <Progress value={video.progress || 0} className="h-2 w-full max-w-[200px] mx-auto" />
                            <p className="text-xs text-muted-foreground mt-1">{video.progress || 0}%</p>
                          </div>
                        ) : video.status === 'failed' ? (
                          <div className="text-center px-4">
                            <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-2" />
                            <p className="text-sm text-destructive font-medium">فشل التوليد</p>
                            {video.errorMessage && (
                              <p className="text-xs text-muted-foreground mt-1">{video.errorMessage}</p>
                            )}
                          </div>
                        ) : (
                          <button className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg shadow-primary/30">
                            <Play className="w-8 h-8 text-primary-foreground fill-current" />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                  <span className="absolute bottom-3 right-3 px-2 py-1 bg-background/80 rounded-lg text-xs text-foreground">
                    {video.duration}
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-sm text-foreground line-clamp-2 mb-3">{video.prompt}</p>
                  <button
                    onClick={() => handleDownload(video)}
                    disabled={video.status !== 'completed'}
                    className="w-full py-2 bg-muted text-muted-foreground rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-muted/80 transition-colors disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    {video.status === 'generating' ? 'قيد التوليد...' : 'تحميل الفيديو'}
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
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="صف المشهد الذي تريد توليده..."
              rows={2}
              className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
              disabled={loading}
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={generateVideo}
            disabled={!prompt.trim() || loading}
            className="p-3 bg-primary text-primary-foreground rounded-xl disabled:opacity-50 disabled:cursor-not-allowed self-end"
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
