import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });

const models = ["GPT-5", "Gemini Pro", "Claude", "DeepSeek"];

export const Scene3Tools = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Central hub animation
  const hubScale = spring({ frame, fps, config: { damping: 15 } });
  const hubGlow = interpolate(frame, [0, 40, 80, 120], [0, 1, 0.6, 1]);

  // Orbiting dots
  const orbitAngle = interpolate(frame, [0, 130], [0, Math.PI * 2]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Left side - text */}
      <div style={{
        position: "absolute",
        left: 120,
        top: "50%",
        transform: "translateY(-50%)",
        maxWidth: 600,
      }}>
        <div style={{
          fontFamily,
          fontSize: 20,
          color: "#00D4FF",
          letterSpacing: 6,
          opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
          marginBottom: 20,
        }}>
          MULTI-MODEL ENGINE
        </div>
        <div style={{
          fontFamily,
          fontSize: 56,
          fontWeight: 700,
          color: "white",
          lineHeight: 1.2,
          opacity: interpolate(frame, [10, 35], [0, 1], { extrapolateRight: "clamp" }),
          transform: `translateX(${interpolate(spring({ frame: frame - 10, fps, config: { damping: 20 } }), [0, 1], [-60, 0])}px)`,
        }}>
          One Platform,<br />
          <span style={{ color: "#8B5CF6" }}>Multiple AI Models</span>
        </div>
        <div style={{
          fontFamily,
          fontSize: 20,
          color: "rgba(255,255,255,0.5)",
          marginTop: 25,
          opacity: interpolate(frame, [30, 50], [0, 1], { extrapolateRight: "clamp" }),
          lineHeight: 1.6,
        }}>
          Access the world's most powerful AI models<br />through a single, unified interface.
        </div>
      </div>

      {/* Right side - orbital visualization */}
      <div style={{
        position: "absolute",
        right: 200,
        top: "50%",
        transform: "translateY(-50%)",
      }}>
        {/* Central hub */}
        <div style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #00D4FF, #8B5CF6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${hubScale})`,
          boxShadow: `0 0 ${40 * hubGlow}px rgba(0,212,255,0.5)`,
          fontFamily,
          fontSize: 16,
          fontWeight: 700,
          color: "white",
        }}>
          NEXUS
        </div>

        {/* Orbiting model badges */}
        {models.map((model, i) => {
          const angle = orbitAngle + (i * Math.PI * 2) / models.length;
          const radius = 200;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const delay = i * 10;
          const badgeOpacity = interpolate(frame, [delay + 15, delay + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

          return (
            <div key={i} style={{
              position: "absolute",
              left: 60 + x - 50,
              top: 60 + y - 20,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(0,212,255,0.3)",
              borderRadius: 12,
              padding: "10px 20px",
              fontFamily,
              fontSize: 16,
              fontWeight: 600,
              color: "#00D4FF",
              opacity: badgeOpacity,
              whiteSpace: "nowrap",
            }}>
              {model}
            </div>
          );
        })}

        {/* Connecting lines */}
        <svg style={{ position: "absolute", left: -140, top: -140, width: 400, height: 400, pointerEvents: "none" }}>
          {models.map((_, i) => {
            const angle = orbitAngle + (i * Math.PI * 2) / models.length;
            const x2 = 200 + Math.cos(angle) * 200;
            const y2 = 200 + Math.sin(angle) * 200;
            const lineOpacity = interpolate(frame, [20 + i * 10, 35 + i * 10], [0, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <line key={i} x1={200} y1={200} x2={x2} y2={y2}
                stroke="#00D4FF" strokeWidth={1} opacity={lineOpacity} />
            );
          })}
        </svg>
      </div>
    </AbsoluteFill>
  );
};
