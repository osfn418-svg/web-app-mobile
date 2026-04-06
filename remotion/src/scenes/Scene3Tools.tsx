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
      {/* Title */}
      <div style={{ position: "absolute", top: 100, textAlign: "center" }}>
        <div style={{
          fontFamily, fontSize: 22, color: "#00D4FF", letterSpacing: 4,
          opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }), marginBottom: 12,
        }}>
          محرك متعدد النماذج
        </div>
        <div style={{
          fontFamily, fontSize: 42, fontWeight: 700, color: "white", lineHeight: 1.3,
          opacity: interpolate(frame, [10, 35], [0, 1], { extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(spring({ frame: frame - 10, fps, config: { damping: 20 } }), [0, 1], [-30, 0])}px)`,
        }}>
          منصة واحدة،<br /><span style={{ color: "#8B5CF6" }}>نماذج AI متعددة</span>
        </div>
        <div style={{
          fontFamily, fontSize: 20, color: "rgba(255,255,255,0.5)", marginTop: 15,
          opacity: interpolate(frame, [30, 50], [0, 1], { extrapolateRight: "clamp" }), lineHeight: 1.6,
        }}>
          الوصول لأقوى نماذج الذكاء الاصطناعي<br />من واجهة واحدة موحدة
        </div>
      </div>

      {/* Orbital visualization - centered */}
      <div style={{ position: "relative", marginTop: 200 }}>
        <div style={{
          width: 100, height: 100, borderRadius: "50%",
          background: "linear-gradient(135deg, #00D4FF, #8B5CF6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transform: `scale(${hubScale})`,
          boxShadow: `0 0 ${40 * hubGlow}px rgba(0,212,255,0.5)`,
          fontFamily, fontSize: 14, fontWeight: 700, color: "white",
        }}>
          NEXUS
        </div>

        {models.map((model, i) => {
          const angle = orbitAngle + (i * Math.PI * 2) / models.length;
          const radius = 160;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const delay = i * 10;
          const badgeOpacity = interpolate(frame, [delay + 15, delay + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={i} style={{
              position: "absolute", left: 50 + x - 45, top: 50 + y - 18,
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(0,212,255,0.3)",
              borderRadius: 12, padding: "8px 18px",
              fontFamily, fontSize: 15, fontWeight: 600, color: "#00D4FF",
              opacity: badgeOpacity, whiteSpace: "nowrap",
            }}>
              {model}
            </div>
          );
        })}

        <svg style={{ position: "absolute", left: -110, top: -110, width: 320, height: 320, pointerEvents: "none" }}>
          {models.map((_, i) => {
            const angle = orbitAngle + (i * Math.PI * 2) / models.length;
            const x2 = 160 + Math.cos(angle) * 160;
            const y2 = 160 + Math.sin(angle) * 160;
            const lineOpacity = interpolate(frame, [20 + i * 10, 35 + i * 10], [0, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return <line key={i} x1={160} y1={160} x2={x2} y2={y2} stroke="#00D4FF" strokeWidth={1} opacity={lineOpacity} />;
          })}
        </svg>
      </div>
    </AbsoluteFill>
  );
};
