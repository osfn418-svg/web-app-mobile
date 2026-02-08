import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Play,
  Download, 
  Sparkles,
  Loader2,
  Video
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { db, AITool } from '@/lib/database';
import { toast } from 'sonner';

interface GeneratedVideo {
  id: string;
  prompt: string;
  thumbnail: string;
  duration: string;
  timestamp: Date;
}

export default function VideoGeneratorPage() {
  const { toolId } = useParams();
  const { user, isPro } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [tool, setTool] = useState<AITool | null>(null);
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [duration, setDuration] = useState('5');

  useEffect(() => {
    const loadTool = async () => {
      const tools = await db.ai_tools.toArray();
      const foundTool = tools.find(t => t.tool_url === `/tools/${toolId}`);
      if (foundTool) {
        setTool(foundTool);
      }
    };
    loadTool();
  }, [toolId]);

  const generateVideo = async () => {
    if (!prompt.trim() || loading) return;
    
    if (!isPro) {
      toast.error('هذه الميزة متاحة فقط لمشتركي Pro');
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulate AI video generation
      await new Promise(resolve => setTimeout(resolve, 3500));
      
      const thumbnails = [
        'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=300&fit=crop',
      ];
      
      const newVideo: GeneratedVideo = {
        id: Date.now().toString(),
        prompt: prompt,
        thumbnail: thumbnails[Math.floor(Math.random() * thumbnails.length)],
        duration: `${duration}s`,
        timestamp: new Date(),
      };
      
      setVideos(prev => [newVideo, ...prev]);
      setPrompt('');
      toast.success('تم توليد الفيديو بنجاح!');
    } catch (error) {
      toast.error('حدث خطأ أثناء توليد الفيديو');
    } finally {
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
              {tool?.logo_url || '🎬'}
            </div>
            <div>
              <h1 className="font-semibold text-foreground">{tool?.tool_name || 'توليد الفيديو'}</h1>
              <p className="text-xs text-muted-foreground">نص إلى فيديو سينمائي</p>
            </div>
          </div>
          <span className="pro-badge">PRO</span>
        </div>
      </header>

      {/* Duration Selector */}
      <div className="px-4 py-3">
        <p className="text-sm text-muted-foreground mb-2">مدة الفيديو:</p>
        <div className="flex gap-2">
          {['5', '10', '15'].map((d) => (
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
                <p className="text-sm text-muted-foreground">جاري توليد الفيديو... قد يستغرق هذا بعض الوقت</p>
                <div className="w-full h-2 bg-muted rounded-full mt-4 overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '90%' }}
                    transition={{ duration: 3 }}
                  />
                </div>
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
                  <img 
                    src={video.thumbnail} 
                    alt={video.prompt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-background/30">
                    <button className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
                      <Play className="w-8 h-8 text-primary-foreground fill-current" />
                    </button>
                  </div>
                  <span className="absolute bottom-3 right-3 px-2 py-1 bg-background/80 rounded-lg text-xs text-foreground">
                    {video.duration}
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-sm text-foreground line-clamp-2 mb-3">{video.prompt}</p>
                  <button
                    className="w-full py-2 bg-muted text-muted-foreground rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-muted/80 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    تحميل الفيديو
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
