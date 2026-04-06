import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { loadFont } from "@remotion/google-fonts/Cairo";
import { PersistentBackground } from "./components/PersistentBackground";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700", "800"], subsets: ["arabic"] });

const T = 20;

/* ─── Intro Scene ─── */
const IntroScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 12 } });
  const titleY = interpolate(spring({ frame: frame - 10, fps, config: { damping: 18 } }), [0, 1], [60, 0]);
  const titleOp = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" });
  const subOp = interpolate(frame, [30, 50], [0, 1], { extrapolateRight: "clamp" });
  const lineW = interpolate(frame, [40, 70], [0, 600], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Floating particles
  const particles = Array.from({ length: 12 }, (_, i) => ({
    x: 100 + (i * 73) % 880,
    y: 200 + (i * 137) % 950,
    size: 3 + (i % 4) * 2,
    speed: 0.02 + (i % 3) * 0.01,
    delay: i * 8,
  }));

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", direction: "rtl" }}>
      {particles.map((p, i) => (
        <div key={i} style={{
          position: "absolute", left: p.x, top: p.y + Math.sin(frame * p.speed + i) * 30,
          width: p.size, height: p.size, borderRadius: "50%",
          background: i % 2 === 0 ? "rgba(0,212,255,0.3)" : "rgba(139,92,246,0.3)",
          opacity: interpolate(frame, [p.delay, p.delay + 20], [0, 0.6], { extrapolateRight: "clamp" }),
        }} />
      ))}

      <div style={{ transform: `scale(${logoScale})`, marginBottom: 30 }}>
        <Img src={staticFile("images/logo.png")} style={{ width: 180, height: 180, objectFit: "contain" }} />
      </div>

      <div style={{
        fontFamily, fontSize: 56, fontWeight: 800, color: "#00D4FF",
        opacity: titleOp, transform: `translateY(${titleY}px)`,
        textShadow: "0 0 40px rgba(0,212,255,0.5)", letterSpacing: 4,
      }}>
        NEXUS AI HUB
      </div>

      <div style={{
        fontFamily, fontSize: 28, fontWeight: 600, color: "rgba(255,255,255,0.8)",
        opacity: subOp, marginTop: 15,
      }}>
        عرض واجهات التطبيق
      </div>

      <div style={{
        width: lineW, height: 3, marginTop: 30,
        background: "linear-gradient(90deg, transparent, #00D4FF, #8B5CF6, #00D4FF, transparent)",
        borderRadius: 2,
      }} />

      <div style={{
        fontFamily, fontSize: 20, color: "rgba(255,255,255,0.5)",
        opacity: interpolate(frame, [60, 80], [0, 1], { extrapolateRight: "clamp" }),
        marginTop: 25, letterSpacing: 6,
      }}>
        UI / UX DESIGN
      </div>
    </AbsoluteFill>
  );
};

/* ─── Screen Showcase Component ─── */
const ScreenShowcase = ({ image, title, subtitle, accentColor = "#00D4FF" }: {
  image: string; title: string; subtitle: string; accentColor?: string;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phoneScale = spring({ frame: frame - 5, fps, config: { damping: 14 } });
  const phoneY = interpolate(spring({ frame: frame - 5, fps, config: { damping: 16 } }), [0, 1], [100, 0]);
  const labelOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const titleOp = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: "clamp" });

  // Subtle phone float
  const floatY = Math.sin(frame * 0.04) * 6;

  // Glow pulse
  const glowIntensity = 0.15 + Math.sin(frame * 0.06) * 0.1;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", direction: "rtl" }}>
      {/* Section label */}
      <div style={{
        position: "absolute", top: 80, textAlign: "center", opacity: labelOp,
      }}>
        <div style={{
          fontFamily, fontSize: 18, color: accentColor, letterSpacing: 6,
          textTransform: "uppercase", marginBottom: 12,
        }}>
          {subtitle}
        </div>
        <div style={{
          fontFamily, fontSize: 40, fontWeight: 700, color: "white",
          opacity: titleOp,
          transform: `translateY(${interpolate(spring({ frame: frame - 15, fps, config: { damping: 20 } }), [0, 1], [30, 0])}px)`,
        }}>
          {title}
        </div>
      </div>

      {/* Phone frame with screenshot */}
      <div style={{
        transform: `scale(${phoneScale}) translateY(${phoneY + floatY}px)`,
        marginTop: 80,
      }}>
        {/* Glow behind phone */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 380, height: 700,
          background: `radial-gradient(ellipse, ${accentColor}${Math.round(glowIntensity * 255).toString(16).padStart(2, '0')}, transparent 70%)`,
          filter: "blur(40px)",
        }} />

        {/* Phone body */}
        <div style={{
          width: 320, height: 660, borderRadius: 36,
          border: `2px solid ${accentColor}40`,
          overflow: "hidden", position: "relative",
          boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 40px ${accentColor}20`,
          background: "#0a0e1a",
        }}>
          {/* Status bar mock */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 8,
            background: "linear-gradient(180deg, rgba(0,0,0,0.5), transparent)",
            zIndex: 2,
          }} />
          
          <Img src={staticFile(`images/${image}`)} style={{
            width: "100%", height: "100%", objectFit: "cover",
          }} />
        </div>

        {/* Notch */}
        <div style={{
          position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)",
          width: 100, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.15)",
        }} />
      </div>
    </AbsoluteFill>
  );
};

/* ─── Dual Screen Scene ─── */
const DualScreenScene = ({ image1, image2, title, subtitle, accentColor = "#00D4FF" }: {
  image1: string; image2: string; title: string; subtitle: string; accentColor?: string;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  const phone1X = interpolate(spring({ frame: frame - 10, fps, config: { damping: 14 } }), [0, 1], [-300, -175]);
  const phone1Op = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" });
  const phone2X = interpolate(spring({ frame: frame - 25, fps, config: { damping: 14 } }), [0, 1], [300, 175]);
  const phone2Op = interpolate(frame, [25, 45], [0, 1], { extrapolateRight: "clamp" });

  const float1 = Math.sin(frame * 0.04) * 5;
  const float2 = Math.sin(frame * 0.04 + 1.5) * 5;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", direction: "rtl" }}>
      <div style={{ position: "absolute", top: 70, textAlign: "center", opacity: labelOp }}>
        <div style={{ fontFamily, fontSize: 18, color: accentColor, letterSpacing: 6, marginBottom: 12 }}>
          {subtitle}
        </div>
        <div style={{
          fontFamily, fontSize: 36, fontWeight: 700, color: "white",
          transform: `translateY(${interpolate(spring({ frame: frame - 10, fps, config: { damping: 20 } }), [0, 1], [30, 0])}px)`,
        }}>
          {title}
        </div>
      </div>

      {/* Two phones side by side */}
      <div style={{ display: "flex", gap: 25, marginTop: 60 }}>
        {[{ img: image1, x: phone1X, op: phone1Op, f: float1 }, { img: image2, x: phone2X, op: phone2Op, f: float2 }].map((p, i) => (
          <div key={i} style={{
            opacity: p.op, transform: `translateY(${p.f}px)`,
          }}>
            <div style={{
              width: 240, height: 500, borderRadius: 28,
              border: `2px solid ${accentColor}30`,
              overflow: "hidden", position: "relative",
              boxShadow: `0 25px 60px rgba(0,0,0,0.5), 0 0 30px ${accentColor}15`,
              background: "#0a0e1a",
            }}>
              <Img src={staticFile(`images/${p.img}`)} style={{
                width: "100%", height: "100%", objectFit: "cover",
              }} />
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* ─── Ending Scene ─── */
const EndingScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame: frame - 10, fps, config: { damping: 12 } });
  const titleOp = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", direction: "rtl" }}>
      <div style={{ transform: `scale(${logoScale})`, marginBottom: 30 }}>
        <Img src={staticFile("images/logo.png")} style={{ width: 160, height: 160, objectFit: "contain" }} />
      </div>
      <div style={{
        fontFamily, fontSize: 48, fontWeight: 800, color: "#00D4FF",
        opacity: titleOp, textShadow: "0 0 40px rgba(0,212,255,0.5)",
        letterSpacing: 3, marginBottom: 20,
      }}>
        NEXUS AI HUB
      </div>
      <div style={{
        fontFamily, fontSize: 24, color: "rgba(255,255,255,0.6)",
        opacity: interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp" }),
      }}>
        منصتك الشاملة لأدوات الذكاء الاصطناعي
      </div>
      <div style={{
        width: interpolate(frame, [50, 80], [0, 400], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        height: 2, marginTop: 30,
        background: "linear-gradient(90deg, transparent, #00D4FF, #8B5CF6, transparent)",
      }} />
      <div style={{
        fontFamily, fontSize: 18, color: "#8B5CF6",
        opacity: interpolate(frame, [70, 90], [0, 1], { extrapolateRight: "clamp" }),
        marginTop: 25, letterSpacing: 4,
      }}>
        مشروع تخرج ٢٠٢٦
      </div>
    </AbsoluteFill>
  );
};

/* ─── Main Composition ─── */
// 9 scenes: 150+140+140+140+140+140+140+140+130 = 1260
// 8 transitions: 8×20 = 160
// Effective: 1260 - 160 = 1100 frames (~36.7s)

export const UIShowcaseVideo = () => {
  return (
    <AbsoluteFill>
      <PersistentBackground />
      <TransitionSeries>
        {/* 1. Intro */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <IntroScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        {/* 2. Welcome Screen */}
        <TransitionSeries.Sequence durationInFrames={140}>
          <ScreenShowcase image="welcome.jpg" title="شاشة الترحيب" subtitle="واجهة البداية" accentColor="#00D4FF" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-left" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        {/* 3. Login Screen */}
        <TransitionSeries.Sequence durationInFrames={140}>
          <ScreenShowcase image="login.jpg" title="تسجيل الدخول" subtitle="المصادقة والأمان" accentColor="#8B5CF6" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        {/* 4. Home + Tools Menu (dual) */}
        <TransitionSeries.Sequence durationInFrames={140}>
          <DualScreenScene image1="home.jpg" image2="tools-menu.jpg" title="الرئيسية والأدوات" subtitle="لوحة التحكم" accentColor="#00D4FF" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        {/* 5. Explore */}
        <TransitionSeries.Sequence durationInFrames={140}>
          <ScreenShowcase image="explore.jpg" title="صفحة الاستكشاف" subtitle="اكتشف الأدوات" accentColor="#43e97b" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        {/* 6. Chat + Image Gen (dual) */}
        <TransitionSeries.Sequence durationInFrames={140}>
          <DualScreenScene image1="chat.jpg" image2="image-gen.jpg" title="المحادثة وتوليد الصور" subtitle="أدوات الذكاء الاصطناعي" accentColor="#8B5CF6" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        {/* 7. Voice + Admin (dual) */}
        <TransitionSeries.Sequence durationInFrames={140}>
          <DualScreenScene image1="voice.jpg" image2="admin.jpg" title="المحادثة الصوتية ولوحة التحكم" subtitle="إدارة متقدمة" accentColor="#f5576c" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        {/* 8. Subscription */}
        <TransitionSeries.Sequence durationInFrames={140}>
          <ScreenShowcase image="subscription.jpg" title="خطط الاشتراك" subtitle="باقات مرنة" accentColor="#f5a623" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-left" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        {/* 9. Ending */}
        <TransitionSeries.Sequence durationInFrames={130}>
          <EndingScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
