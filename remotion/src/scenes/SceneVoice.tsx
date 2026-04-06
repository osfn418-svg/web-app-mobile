import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/Cairo";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["arabic"] });

export const SceneVoice = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const wavePoints = Array.from({ length: 50 }, (_, i) => {
    const x = (i / 49) * 700;
    const wave1 = Math.sin((i / 49) * Math.PI * 6 + frame * 0.1) * 40;
    const wave2 = Math.sin((i / 49) * Math.PI * 3 + frame * 0.08) * 25;
    const y = 120 + wave1 + wave2;
    return `${x},${y}`;
  }).join(" ");

  const waveOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", direction: "rtl" }}>
      <div style={{ textAlign: "center", maxWidth: 800 }}>
        <div style={{ fontFamily, fontSize: 22, color: "#00D4FF", letterSpacing: 4, marginBottom: 15,
          opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }) }}>
          الصوت والكلام
        </div>
        <div style={{ fontFamily, fontSize: 44, fontWeight: 700, color: "white", marginBottom: 40,
          opacity: interpolate(frame, [5, 25], [0, 1], { extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(spring({ frame: frame - 5, fps, config: { damping: 20 } }), [0, 1], [40, 0])}px)` }}>
          تحويل النص إلى <span style={{ color: "#00D4FF" }}>كلام</span>
        </div>

        <svg width={700} height={240} style={{ opacity: waveOpacity }}>
          <polyline points={wavePoints} fill="none" stroke="url(#waveGrad)" strokeWidth={3} strokeLinecap="round" />
          <defs>
            <linearGradient id="waveGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00D4FF" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#00D4FF" />
            </linearGradient>
          </defs>
          <polyline points={wavePoints} fill="none" stroke="url(#waveGrad)" strokeWidth={8} strokeLinecap="round" opacity={0.2} filter="url(#glow)" />
          <defs>
            <filter id="glow"><feGaussianBlur stdDeviation="8" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
        </svg>

        <div style={{ display: "flex", gap: 15, justifyContent: "center", marginTop: 25, flexWrap: "wrap" }}>
          {["🎙️ تحويل الكلام لنص", "🔊 تحويل النص لكلام", "💬 محادثة صوتية"].map((label, i) => {
            const pillOpacity = interpolate(frame, [50 + i * 12, 65 + i * 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const pillScale = spring({ frame: frame - 50 - i * 12, fps, config: { damping: 12 } });
            return (
              <div key={i} style={{
                fontFamily, fontSize: 17, color: "white", padding: "10px 22px", borderRadius: 25,
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(0,212,255,0.3)",
                opacity: pillOpacity, transform: `scale(${pillScale})`,
              }}>
                {label}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
