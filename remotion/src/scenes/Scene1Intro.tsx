import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile } from "remotion";
import { loadFont } from "@remotion/google-fonts/Cairo";

const { fontFamily } = loadFont("normal", { weights: ["700", "800"], subsets: ["arabic"] });

export const Scene1Intro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });
  const logoRotate = interpolate(spring({ frame: frame - 5, fps, config: { damping: 20 } }), [0, 1], [-10, 0]);
  const titleY = interpolate(spring({ frame: frame - 20, fps, config: { damping: 18, stiffness: 150 } }), [0, 1], [80, 0]);
  const titleOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" });
  const subtitleOpacity = interpolate(frame, [45, 65], [0, 1], { extrapolateRight: "clamp" });
  const subtitleY = interpolate(spring({ frame: frame - 45, fps, config: { damping: 20 } }), [0, 1], [40, 0]);
  const lineWidth = interpolate(frame, [35, 70], [0, 350], { extrapolateRight: "clamp" });
  const ringScale = interpolate(frame, [0, 60, 120], [0.5, 1.1, 1.05]);
  const ringOpacity = interpolate(frame, [0, 30, 120], [0, 0.5, 0.25]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", direction: "rtl" }}>
      <div style={{
        position: "absolute", width: 280, height: 280, borderRadius: "50%",
        border: "2px solid rgba(0,212,255,0.3)",
        boxShadow: "0 0 50px rgba(0,212,255,0.2), inset 0 0 50px rgba(139,92,246,0.15)",
        transform: `scale(${ringScale})`, opacity: ringOpacity,
      }} />

      <div style={{ transform: `scale(${logoScale}) rotate(${logoRotate}deg)`, marginBottom: 25 }}>
        <Img src={staticFile("images/logo.png")} style={{ width: 180, height: 180, objectFit: "contain" }} />
      </div>

      <div style={{
        fontFamily, fontSize: 58, fontWeight: 800, color: "white",
        transform: `translateY(${titleY}px)`, opacity: titleOpacity,
        textShadow: "0 0 30px rgba(0,212,255,0.35)", letterSpacing: 2,
      }}>
        الذكاء الشامل
      </div>

      <div style={{
        width: lineWidth, height: 3,
        background: "linear-gradient(90deg, transparent, #00D4FF, #8B5CF6, transparent)",
        margin: "18px 0", borderRadius: 2,
      }} />

      <div style={{
        fontFamily, fontSize: 26, fontWeight: 700, color: "rgba(255,255,255,0.65)",
        transform: `translateY(${subtitleY}px)`, opacity: subtitleOpacity,
      }}>
        منصتك الذكية للذكاء الاصطناعي
      </div>
    </AbsoluteFill>
  );
};
