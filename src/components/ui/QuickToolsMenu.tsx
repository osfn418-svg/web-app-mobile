import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Image, 
  Video, 
  Music, 
  Code, 
  Wand2, 
  FileText, 
  Mic,
  X,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const tools = [
  { 
    id: 'assistant', 
    name: 'المساعد الذكي', 
    icon: MessageSquare, 
    path: '/tools/assistant',
    color: 'from-cyan-500 to-blue-500',
    isPro: false
  },
  { 
    id: 'images', 
    name: 'توليد الصور', 
    icon: Image, 
    path: '/tools/images',
    color: 'from-purple-500 to-pink-500',
    isPro: true
  },
  { 
    id: 'video', 
    name: 'توليد الفيديو', 
    icon: Video, 
    path: '/tools/video',
    color: 'from-red-500 to-orange-500',
    isPro: true
  },
  { 
    id: 'audio', 
    name: 'توليد الصوت', 
    icon: Music, 
    path: '/tools/audio',
    color: 'from-green-500 to-teal-500',
    isPro: true
  },
  { 
    id: 'code', 
    name: 'محرر الأكواد', 
    icon: Code, 
    path: '/tools/code',
    color: 'from-yellow-500 to-amber-500',
    isPro: true
  },
  { 
    id: 'prompt-maker', 
    name: 'صانع الأوامر', 
    icon: Wand2, 
    path: '/tools/prompt-maker',
    color: 'from-indigo-500 to-purple-500',
    isPro: false
  },
  { 
    id: 'document', 
    name: 'محلل المستندات', 
    icon: FileText, 
    path: '/tools/document',
    color: 'from-blue-500 to-cyan-500',
    isPro: true
  },
  { 
    id: 'voice-chat', 
    name: 'المحادثة الصوتية', 
    icon: Mic, 
    path: '/tools/voice-chat',
    color: 'from-pink-500 to-rose-500',
    isPro: true
  },
];

export default function QuickToolsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { isPro } = useAuth();

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-28 left-4 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-primary to-secondary shadow-lg flex items-center justify-center"
        style={{ boxShadow: '0 0 20px hsl(186 100% 50% / 0.4)' }}
      >
        <Sparkles className="w-6 h-6 text-primary-foreground" />
      </motion.button>

      {/* Overlay and Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-w-[430px] mx-auto"
            >
              <div className="bg-card border-t border-border rounded-t-3xl p-6 pb-10 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-foreground">أدوات الذكاء الاصطناعي</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                {/* Tools Grid */}
                <div className="grid grid-cols-4 gap-4">
                  {tools.map((tool, index) => {
                    const Icon = tool.icon;
                    const isLocked = tool.isPro && !isPro;

                    return (
                      <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          to={isLocked ? '/subscription' : tool.path}
                          onClick={() => setIsOpen(false)}
                          className="flex flex-col items-center gap-2"
                        >
                          <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-lg`}>
                            <Icon className="w-6 h-6 text-white" />
                            {isLocked && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
                                <span className="text-[8px] font-bold text-black">PRO</span>
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-center text-foreground line-clamp-1">
                            {tool.name}
                          </span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
