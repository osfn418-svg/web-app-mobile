import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/Cairo";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["arabic"] });

const models = ["GPT-5", "Gemini Pro", "Claude", "DeepSeek"];

export const Scene3Tools = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const hubScale = spring({ frame, fps, config: { damping: 15 } });
  const hubGlow = interpolate(frame, [0, 40, 80, 120], [0, 1, 0.6, 1]);
  const orbitAngle = interpolate(frame, [0, 150], [0, Math.PI * 2]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", direction: "rtl" }}>
      <div style={{ position: "absolute", top: 100, textAlign: "center" }}>
        <div style={{
          fontFamily, fontSize: 20, color: "#00D4FF", letterSpacing: 4,
          opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }), marginBottom: 12,
        }}>
          محرك متعدد النماذج
        </div>
        <div style={{
          fontFamily, fontSize: 38, fontWeight: 700, color: "white", lineHeight: 1.3,
          opacity: interpolate(frame, [10, 35], [0, 1], { extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(spring({ frame: frame - 10, fps, config: { damping: 20 } }), [0, 1], [-30, 0])}px)`,
        }}>
          منصة واحدة،<br /><span style={{ color: "#8B5CF6" }}>نماذج AI متعددة</span>
        </div>
      </div>

      <div style={{ position: "relative", marginTop: 200 }}>
        <div style={{
          width: 90, height: 90, borderRadius: "50%",
          background: "linear-gradient(135deg, #00D4FF, #8B5CF6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transform: `scale(${hubScale})`,
          boxShadow: `0 0 ${30 * hubGlow}px rgba(0,212,255,0.4)`,
          fontFamily, fontSize: 13, fontWeight: 700, color: "white",
        }}>
          AI HUB
        </div>

        {models.map((model, i) => {
          const angle = orbitAngle + (i * Math.PI * 2) / models.length;
          const radius = 155;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const delay = i * 10;
          const badgeOpacity = interpolate(frame, [delay + 15, delay + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={i} style={{
              position: "absolute", left: 45 + x - 42, top: 45 + y - 16,
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(0,212,255,0.25)",
              borderRadius: 12, padding: "7px 16px",
              fontFamily, fontSize: 14, fontWeight: 600, color: "#00D4FF",
              opacity: badgeOpacity, whiteSpace: "nowrap",
            }}>
              {model}
            </div>
          );
        })}

        <svg style={{ position: "absolute", left: -110, top: -110, width: 320, height: 320, pointerEvents: "none" }}>
          {models.map((_, i) => {
            const angle = orbitAngle + (i * Math.PI * 2) / models.length;
            const x2 = 160 + Math.cos(angle) * 155;
            const y2 = 160 + Math.sin(angle) * 155;
            const lineOpacity = interpolate(frame, [20 + i * 10, 35 + i * 10], [0, 0.25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return <line key={i} x1={160} y1={160} x2={x2} y2={y2} stroke="#00D4FF" strokeWidth={1} opacity={lineOpacity} />;
          })}
        </svg>
      </div>
    </AbsoluteFill>
  );
};
