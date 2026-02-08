import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Phone,
  PhoneOff,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { streamChat } from '@/lib/chatService';
import { useTTS } from '@/hooks/useTTS';

// TypeScript declarations for Web Speech API
interface SpeechRecognitionType extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognitionType, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionType, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognitionType, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognitionType, ev: Event) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionType;
    webkitSpeechRecognition: new () => SpeechRecognitionType;
  }
}

export default function VoiceChatPage() {
  const { isPro } = useAuth();
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [userTranscript, setUserTranscript] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const isProcessingRef = useRef(false);
  
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

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isMuted || isProcessingRef.current) return;
    
    try {
      recognitionRef.current.start();
      setIsListening(true);
      console.log('Started listening...');
    } catch (e) {
      console.log('Recognition already started or error:', e);
    }
  }, [isMuted]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
      setIsListening(false);
      console.log('Stopped listening...');
    } catch (e) {
      console.log('Recognition stop error:', e);
    }
  }, []);

  const handleUserMessage = useCallback(async (text: string) => {
    if (!text.trim() || isProcessingRef.current) return;

    console.log('Processing user message:', text);
    isProcessingRef.current = true;
    setIsProcessing(true);
    stopListening();

    const userMsg = { role: 'user' as const, content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setUserTranscript('');

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
          console.log('AI response complete:', assistantContent);
          setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);
          
          if (isSpeakerOn && assistantContent) {
            speak(assistantContent);
          }
          
          isProcessingRef.current = false;
          setIsProcessing(false);
          
          // Resume listening after a delay
          setTimeout(() => {
            if (isCallActive && !isMuted) {
              startListening();
            }
          }, 500);
        },
        onError: (error) => {
          console.error('Chat error:', error);
          toast.error(error);
          isProcessingRef.current = false;
          setIsProcessing(false);
          
          setTimeout(() => {
            if (isCallActive && !isMuted) {
              startListening();
            }
          }, 500);
        }
      });
    } catch (error) {
      console.error('Stream error:', error);
      toast.error('حدث خطأ');
      isProcessingRef.current = false;
      setIsProcessing(false);
      
      setTimeout(() => {
        if (isCallActive && !isMuted) {
          startListening();
        }
      }, 500);
    }
  }, [messages, isSpeakerOn, speak, isCallActive, isMuted, startListening, stopListening]);

  // Initialize speech recognition
  const initSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error('التعرف على الصوت غير مدعوم في هذا المتصفح');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        
        if (result.isFinal) {
          finalTranscript += text;
        } else {
          interimTranscript += text;
        }
      }

      console.log('Interim:', interimTranscript, 'Final:', finalTranscript);

      if (interimTranscript) {
        setUserTranscript(interimTranscript);
      }

      if (finalTranscript) {
        setUserTranscript(finalTranscript);
        handleUserMessage(finalTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error, event.message);
      setIsListening(false);
      
      if (event.error === 'no-speech') {
        // No speech detected, restart listening
        setTimeout(() => {
          if (isCallActive && !isMuted && !isProcessingRef.current) {
            startListening();
          }
        }, 300);
      } else if (event.error !== 'aborted') {
        toast.error('خطأ في التعرف على الصوت: ' + event.error);
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
      
      // Auto-restart if call is active and not processing
      if (isCallActive && !isMuted && !isProcessingRef.current) {
        setTimeout(() => {
          startListening();
        }, 300);
      }
    };

    return recognition;
  }, [isCallActive, isMuted, handleUserMessage, startListening]);

  const startCall = async () => {
    // Allow for testing without Pro requirement
    // if (!isPro) {
    //   toast.error('هذه الميزة متاحة فقط لمشتركي Pro');
    //   return;
    // }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Just for permission
    } catch (error) {
      toast.error('يرجى السماح بالوصول للميكروفون');
      return;
    }

    setIsCallActive(true);
    setMessages([]);
    setTranscript('');
    setUserTranscript('');
    toast.success('تم بدء المكالمة');
    
    // AI greeting
    const greeting = 'مرحباً! أنا المساعد الصوتي. كيف يمكنني مساعدتك اليوم؟';
    setTranscript(greeting);
    setMessages([{ role: 'assistant', content: greeting }]);
    
    if (isSpeakerOn) {
      speak(greeting);
    }

    // Initialize and start listening after greeting
    setTimeout(() => {
      const recognition = initSpeechRecognition();
      if (recognition) {
        recognitionRef.current = recognition;
        startListening();
      }
    }, 2000);
  };

  const endCall = () => {
    stopListening();
    if (recognitionRef.current) {
      recognitionRef.current = null;
    }
    stopSpeaking();
    setIsCallActive(false);
    setIsListening(false);
    setIsProcessing(false);
    isProcessingRef.current = false;
    setTranscript('');
    setUserTranscript('');
    setMessages([]);
    toast.info('تم إنهاء المكالمة');
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      toast.info('تم تشغيل الميكروفون');
      setTimeout(() => startListening(), 300);
    } else {
      setIsMuted(true);
      stopListening();
      toast.info('تم كتم الميكروفون');
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    if (isSpeakerOn) {
      stopSpeaking();
    }
    toast.info(isSpeakerOn ? 'تم إيقاف السماعة' : 'تم تشغيل السماعة');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopSpeaking();
    };
  }, [stopSpeaking]);

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
                animate={isSpeaking || isProcessing ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-4 rounded-full bg-primary/30"
                animate={isSpeaking || isProcessing ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
              />
              <div className="absolute inset-8 rounded-full bg-gradient-pro flex items-center justify-center">
                {isProcessing ? (
                  <Loader2 className="w-12 h-12 text-primary-foreground animate-spin" />
                ) : isSpeaking ? (
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
                {isProcessing ? 'جاري التفكير...' : isSpeaking ? 'المساعد يتحدث...' : isListening ? 'جاري الاستماع... تحدث الآن' : 'متصل'}
              </p>
              <p className="text-sm text-muted-foreground">{formatDuration(callDuration)}</p>
            </div>

            {/* User transcript */}
            <AnimatePresence mode="wait">
              {userTranscript && (
                <motion.div
                  key="user-transcript"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="bg-primary/20 rounded-xl p-3 mb-3"
                >
                  <p className="text-xs text-muted-foreground mb-1">أنت:</p>
                  <p className="text-sm text-foreground">{userTranscript}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Transcript */}
            <AnimatePresence mode="wait">
              {transcript && (
                <motion.div
                  key="ai-transcript"
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