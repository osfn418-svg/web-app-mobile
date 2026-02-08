import { useState, useEffect, useRef, useCallback } from 'react';
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
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { streamChat } from '@/lib/chatService';
import { useTTS } from '@/hooks/useTTS';

export default function VoiceChatPage() {
  const { isPro } = useAuth();
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [userTranscript, setUserTranscript] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  
  const { speak, stop: stopSpeaking, isSpeaking } = useTTS({ lang: 'ar-SA', rate: 1 });

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

  // Initialize speech recognition
  const initSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('التعرف على الصوت غير مدعوم في هذا المتصفح');
      return null;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setUserTranscript(finalTranscript);
        handleUserMessage(finalTranscript);
      } else {
        setUserTranscript(interimTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        toast.error('خطأ في التعرف على الصوت');
      }
    };

    recognition.onend = () => {
      if (isCallActive && !isMuted && !isSpeaking) {
        try {
          recognition.start();
        } catch (e) {
          // Already started
        }
      }
    };

    return recognition;
  }, [isCallActive, isMuted, isSpeaking]);

  const handleUserMessage = async (text: string) => {
    if (!text.trim()) return;

    setIsListening(false);
    const userMsg = { role: 'user' as const, content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    let assistantContent = '';

    try {
      await streamChat({
        messages: newMessages,
        toolType: 'assistant',
        onDelta: (chunk) => {
          assistantContent += chunk;
          setTranscript(assistantContent);
        },
        onDone: () => {
          setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);
          // Speak the response
          if (isSpeakerOn && assistantContent) {
            speak(assistantContent);
          }
          setUserTranscript('');
          // Resume listening after speaking
          setTimeout(() => {
            if (isCallActive && !isMuted) {
              setIsListening(true);
            }
          }, assistantContent.length * 50); // Approximate speaking time
        },
        onError: (error) => {
          toast.error(error);
          setIsListening(true);
        }
      });
    } catch (error) {
      toast.error('حدث خطأ');
      setIsListening(true);
    }
  };

  const startCall = async () => {
    if (!isPro) {
      toast.error('هذه الميزة متاحة فقط لمشتركي Pro');
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      toast.error('يرجى السماح بالوصول للميكروفون');
      return;
    }

    setIsCallActive(true);
    setMessages([]);
    toast.success('تم بدء المكالمة');
    
    // AI greeting
    const greeting = 'مرحباً! أنا المساعد الصوتي. كيف يمكنني مساعدتك اليوم؟';
    setTranscript(greeting);
    speak(greeting);
    setMessages([{ role: 'assistant', content: greeting }]);

    // Start listening after greeting
    setTimeout(() => {
      const recognition = initSpeechRecognition();
      if (recognition) {
        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
      }
    }, 3000);
  };

  const endCall = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    stopSpeaking();
    setIsCallActive(false);
    setIsListening(false);
    setTranscript('');
    setUserTranscript('');
    setMessages([]);
    toast.info('تم إنهاء المكالمة');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (recognitionRef.current) {
      if (!isMuted) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
    toast.info(isMuted ? 'تم تشغيل الميكروفون' : 'تم كتم الميكروفون');
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    if (isSpeakerOn) {
      stopSpeaking();
    }
    toast.info(isSpeakerOn ? 'تم إيقاف السماعة' : 'تم تشغيل السماعة');
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
              <h1 className="font-semibold text-foreground">المحادثة الصوتية</h1>
              <p className="text-xs text-muted-foreground">تفاعل صوتي مع AI</p>
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

            {/* User transcript */}
            {userTranscript && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary/20 rounded-xl p-3 mb-3"
              >
                <p className="text-xs text-muted-foreground mb-1">أنت:</p>
                <p className="text-sm text-foreground">{userTranscript}</p>
              </motion.div>
            )}

            {/* AI Transcript */}
            <AnimatePresence mode="wait">
              {transcript && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-card rounded-2xl p-4 mb-8 min-h-[80px]"
                >
                  <p className="text-xs text-muted-foreground mb-1">المساعد:</p>
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
