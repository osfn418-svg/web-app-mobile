import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Download, 
  Sparkles,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface GeneratedImage {
  id: string;
  prompt: string;
  url: string;
  timestamp: Date;
}

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [style, setStyle] = useState('realistic');

  const styles = [
    { id: 'realistic', label: 'واقعي', emoji: '📷' },
    { id: 'anime', label: 'أنمي', emoji: '🎨' },
    { id: 'digital-art', label: 'فن رقمي', emoji: '🖼️' },
    { id: '3d', label: 'ثلاثي الأبعاد', emoji: '🎮' },
  ];

  const generateImage = async () => {
    if (!prompt.trim() || loading) return;
    
    setLoading(true);
    
    try {
      // Simulate AI image generation
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Use placeholder images for demo
      const placeholderImages = [
        'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=512&h=512&fit=crop',
        'https://images.unsplash.com/photo-1686191128892-3b37add4ab0e?w=512&h=512&fit=crop',
        'https://images.unsplash.com/photo-1675271591211-126ad94e495d?w=512&h=512&fit=crop',
        'https://images.unsplash.com/photo-1681412332858-babcc52ac25c?w=512&h=512&fit=crop',
      ];
      
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        prompt: prompt,
        url: placeholderImages[Math.floor(Math.random() * placeholderImages.length)],
        timestamp: new Date(),
      };
      
      setImages(prev => [newImage, ...prev]);
      setPrompt('');
      toast.success('تم توليد الصورة بنجاح!');
    } catch (error) {
      toast.error('حدث خطأ أثناء توليد الصورة');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nexus-ai-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('جاري تحميل الصورة...');
    } catch (error) {
      toast.error('فشل تحميل الصورة');
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
              🖼️
            </div>
            <div>
              <h1 className="font-semibold text-foreground">توليد الصور</h1>
              <p className="text-xs text-muted-foreground">حوّل خيالك إلى صور مذهلة</p>
            </div>
          </div>
        </div>
      </header>

      {/* Style Selector */}
      <div className="px-4 py-3">
        <p className="text-sm text-muted-foreground mb-2">نمط الصورة:</p>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {styles.map((s) => (
            <button
              key={s.id}
              onClick={() => setStyle(s.id)}
              className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
                style === s.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <span>{s.emoji}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Generated Images */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        {images.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center text-4xl mb-4">
              🖼️
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">ابدأ بتوليد صورتك الأولى</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              اكتب وصفاً تفصيلياً لما تريد رؤيته وسيقوم الذكاء الاصطناعي بتوليده لك
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="aspect-square glass-card rounded-2xl flex items-center justify-center"
              >
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">جاري التوليد...</p>
                </div>
              </motion.div>
            )}
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative aspect-square rounded-2xl overflow-hidden group"
              >
                <img 
                  src={image.url} 
                  alt={image.prompt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-xs text-foreground line-clamp-2 mb-2">{image.prompt}</p>
                    <button
                      onClick={() => handleDownload(image.url)}
                      className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      تحميل
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
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && generateImage()}
              placeholder="صف الصورة التي تريد توليدها..."
              className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={generateImage}
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
