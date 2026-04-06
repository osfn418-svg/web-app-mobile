import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/Cairo";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700", "800"], subsets: ["arabic"] });

const stats = [
  { value: "10+", label: "نموذج ذكاء اصطناعي" },
  { value: "8", label: "أدوات ذكية" },
  { value: "24/7", label: "متاح دائماً" },
  { value: "∞", label: "إمكانيات لا محدودة" },
];

export const Scene4Tech = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", direction: "rtl" }}>
      <div style={{
        fontFamily, fontSize: 42, fontWeight: 700, color: "white", marginBottom: 60, textAlign: "center",
        opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
        transform: `translateY(${interpolate(spring({ frame, fps, config: { damping: 20 } }), [0, 1], [-30, 0])}px)`,
      }}>
        مصمم <span style={{ color: "#8B5CF6" }}>للأداء</span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 40, justifyContent: "center", maxWidth: 600 }}>
        {stats.map((stat, i) => {
          const delay = 15 + i * 15;
          const s = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 100 } });
          const scale = interpolate(s, [0, 1], [0, 1]);
          const opacity = interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={i} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
              transform: `scale(${scale})`, opacity, width: 220,
            }}>
              <div style={{
                fontFamily, fontSize: 64, fontWeight: 800,
                background: "linear-gradient(135deg, #00D4FF, #8B5CF6)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                {stat.value}
              </div>
              <div style={{ fontFamily, fontSize: 18, color: "rgba(255,255,255,0.6)" }}>{stat.label}</div>
              <div style={{
                width: interpolate(frame, [delay + 15, delay + 35], [0, 80], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                height: 2, background: "linear-gradient(90deg, #00D4FF, #8B5CF6)", borderRadius: 1,
              }} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
