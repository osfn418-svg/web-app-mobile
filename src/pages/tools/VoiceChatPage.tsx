import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Phone,
  PhoneOff
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { db, AITool } from '@/lib/database';
import { toast } from 'sonner';

export default function VoiceChatPage() {
  const { toolId } = useParams();
  const { user, isPro } = useAuth();
  const [tool, setTool] = useState<AITool | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    if (isCallActive) {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setCallDuration(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isCallActive]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = () => {
    if (!isPro) {
      toast.error('هذه الميزة متاحة فقط لمشتركي Pro');
      return;
    }
    setIsCallActive(true);
    toast.success('تم بدء المكالمة');
    
    // Simulate AI greeting
    setTimeout(() => {
      setIsSpeaking(true);
      setTranscript('مرحباً! أنا المساعد الصوتي. كيف يمكنني مساعدتك اليوم؟');
      setTimeout(() => {
        setIsSpeaking(false);
        setIsListening(true);
      }, 3000);
    }, 1000);
  };

  const endCall = () => {
    setIsCallActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setTranscript('');
    toast.info('تم إنهاء المكالمة');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast.info(isMuted ? 'تم تشغيل الميكروفون' : 'تم كتم الميكروفون');
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    toast.info(isSpeakerOn ? 'تم إيقاف السماعة' : 'تم تشغيل السماعة');
  };

  // Simulate voice interaction
  useEffect(() => {
    if (isCallActive && isListening && !isSpeaking) {
      const responses = [
        'أفهم ما تقصده. هل تريد المزيد من التفاصيل؟',
        'هذا سؤال مثير للاهتمام. دعني أفكر...',
        'يمكنني مساعدتك في ذلك. ما الذي تحتاجه بالتحديد؟',
        'رائع! لدي بعض الاقتراحات لك.',
      ];

      const interval = setInterval(() => {
        if (Math.random() > 0.7) {
          setIsListening(false);
          setIsSpeaking(true);
          setTranscript(responses[Math.floor(Math.random() * responses.length)]);
          
          setTimeout(() => {
            setIsSpeaking(false);
            setIsListening(true);
          }, 3000);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isCallActive, isListening, isSpeaking]);

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
              {tool?.logo_url || '🎙️'}
            </div>
            <div>
              <h1 className="font-semibold text-foreground">{tool?.tool_name || 'المحادثة الصوتية'}</h1>
              <p className="text-xs text-muted-foreground">تفاعل صوتي طبيعي</p>
            </div>
          </div>
          <span className="pro-badge">PRO</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {!isCallActive ? (
          /* Start Call View */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-32 h-32 rounded-full bg-gradient-pro mx-auto mb-8 flex items-center justify-center">
              <Mic className="w-16 h-16 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">المحادثة الصوتية</h2>
            <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
              تحدث مباشرة مع المساعد الذكي بصوتك واحصل على إجابات فورية
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={startCall}
              className="px-8 py-4 bg-success text-success-foreground rounded-full font-medium flex items-center gap-3 mx-auto"
            >
              <Phone className="w-6 h-6" />
              <span>بدء المكالمة</span>
            </motion.button>
          </motion.div>
        ) : (
          /* Active Call View */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center w-full max-w-sm"
          >
            {/* Avatar with animation */}
            <div className="relative w-40 h-40 mx-auto mb-8">
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/20"
                animate={isSpeaking ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-4 rounded-full bg-primary/30"
                animate={isSpeaking ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
              />
              <div className="absolute inset-8 rounded-full bg-gradient-pro flex items-center justify-center">
                {isSpeaking ? (
                  <Volume2 className="w-12 h-12 text-primary-foreground" />
                ) : isListening ? (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Mic className="w-12 h-12 text-primary-foreground" />
                  </motion.div>
                ) : (
                  <Mic className="w-12 h-12 text-primary-foreground" />
                )}
              </div>
            </div>

            {/* Status */}
            <div className="mb-4">
              <p className="text-lg font-semibold text-foreground">
                {isSpeaking ? 'المساعد يتحدث...' : isListening ? 'جاري الاستماع...' : 'متصل'}
              </p>
              <p className="text-sm text-muted-foreground">{formatDuration(callDuration)}</p>
            </div>

            {/* Transcript */}
            <AnimatePresence mode="wait">
              {transcript && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-card rounded-2xl p-4 mb-8 min-h-[80px]"
                >
                  <p className="text-sm text-foreground">{transcript}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleMute}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                  isMuted ? 'bg-destructive text-destructive-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={endCall}
                className="w-16 h-16 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
              >
                <PhoneOff className="w-7 h-7" />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleSpeaker}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                  !isSpeakerOn ? 'bg-destructive text-destructive-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
              </motion.button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
