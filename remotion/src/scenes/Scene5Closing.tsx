import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile } from "remotion";
import { loadFont } from "@remotion/google-fonts/Cairo";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700", "800"], subsets: ["arabic"] });

export const Scene5Closing = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame: frame - 10, fps, config: { damping: 10, stiffness: 80 } });
  const titleOpacity = interpolate(frame, [25, 50], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(spring({ frame: frame - 25, fps, config: { damping: 18 } }), [0, 1], [50, 0]);
  const ctaOpacity = interpolate(frame, [55, 80], [0, 1], { extrapolateRight: "clamp" });
  const ctaScale = spring({ frame: frame - 55, fps, config: { damping: 12 } });
  const pulse = interpolate(frame, [60, 80, 100, 120, 140], [0.3, 0.8, 0.3, 0.8, 0.5]);

  const particles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const distance = interpolate(frame, [0, 40], [0, 250 + (i % 3) * 80], { extrapolateRight: "clamp" });
    const pOpacity = interpolate(frame, [5, 20, 80], [0, 0.5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, opacity: pOpacity, size: 4 + (i % 3) * 3 };
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", direction: "rtl" }}>
      {particles.map((p, i) => (
        <div key={i} style={{
          position: "absolute", left: `calc(50% + ${p.x}px)`, top: `calc(50% + ${p.y}px)`,
          width: p.size, height: p.size, borderRadius: "50%",
          background: i % 2 === 0 ? "#00D4FF" : "#8B5CF6",
          opacity: p.opacity, boxShadow: `0 0 8px ${i % 2 === 0 ? "#00D4FF" : "#8B5CF6"}`,
        }} />
      ))}

      <div style={{ transform: `scale(${logoScale})`, marginBottom: 20 }}>
        <Img src={staticFile("images/logo.png")} style={{
          width: 150, height: 150, objectFit: "contain",
          filter: `drop-shadow(0 0 ${15 * pulse}px rgba(0,212,255,0.4))`,
        }} />
      </div>

      <div style={{
        fontFamily, fontSize: 52, fontWeight: 800, color: "white",
        opacity: titleOpacity, transform: `translateY(${titleY}px)`,
        textShadow: `0 0 ${30 * pulse}px rgba(0,212,255,0.3)`, letterSpacing: 2,
      }}>
        الذكاء الشامل
      </div>

      <div style={{
        fontFamily, fontSize: 24, fontWeight: 700, color: "rgba(255,255,255,0.55)",
        marginTop: 12, opacity: ctaOpacity, transform: `scale(${ctaScale})`,
      }}>
        مستقبل الذكاء الاصطناعي هنا
      </div>

      <div style={{
        width: interpolate(frame, [70, 110], [0, 400], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        height: 3, background: "linear-gradient(90deg, transparent, #00D4FF, #8B5CF6, transparent)",
        marginTop: 25, borderRadius: 2,
      }} />

      <div style={{
        fontFamily, fontSize: 16, color: "#8B5CF6",
        opacity: interpolate(frame, [90, 110], [0, 1], { extrapolateRight: "clamp" }),
        marginTop: 20, letterSpacing: 4,
      }}>
        مشروع تخرج ٢٠٢٦
      </div>
    </AbsoluteFill>
  );
};
