import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/Cairo";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["arabic"] });

export const SceneVideoMusic = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const playerOpacity = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" });
  const playerScale = spring({ frame: frame - 10, fps, config: { damping: 15 } });

  const bars = Array.from({ length: 20 }, (_, i) => {
    const phase = (i / 20) * Math.PI * 4 + frame * 0.15;
    return 30 + Math.sin(phase) * 25 + Math.cos(phase * 0.7) * 15;
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", direction: "rtl" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 50 }}>
        {/* Video section */}
        <div style={{ opacity: playerOpacity, transform: `scale(${playerScale})` }}>
          <div style={{ fontFamily, fontSize: 20, color: "#00D4FF", letterSpacing: 4, marginBottom: 15, textAlign: "center" }}>
            🎬 مولّد الفيديو
          </div>
          <div style={{
            width: 500, height: 280, borderRadius: 16,
            background: "linear-gradient(135deg, rgba(15,20,35,0.9), rgba(20,25,45,0.9))",
            border: "1px solid rgba(0,212,255,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 30px rgba(0,212,255,0.1)",
          }}>
            <div style={{
              width: 70, height: 70, borderRadius: "50%",
              background: "linear-gradient(135deg, #00D4FF, #8B5CF6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 30px rgba(0,212,255,0.4)",
              transform: `scale(${interpolate(frame, [30, 45, 60, 75], [1, 1.1, 1, 1.05])})`,
            }}>
              <div style={{ width: 0, height: 0, borderTop: "15px solid transparent", borderBottom: "15px solid transparent",
                borderLeft: "25px solid white", marginLeft: 5 }} />
            </div>
          </div>
        </div>

        {/* Music section */}
        <div style={{ opacity: interpolate(frame, [30, 50], [0, 1], { extrapolateRight: "clamp" }) }}>
          <div style={{ fontFamily, fontSize: 20, color: "#8B5CF6", letterSpacing: 4, marginBottom: 15, textAlign: "center" }}>
            🎵 مولّد الموسيقى
          </div>
          <div style={{
            width: 500, height: 200, borderRadius: 16,
            background: "linear-gradient(135deg, rgba(15,20,35,0.9), rgba(25,15,40,0.9))",
            border: "1px solid rgba(139,92,246,0.3)",
            display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 6,
            padding: "0 30px 40px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 30px rgba(139,92,246,0.1)",
          }}>
            {bars.map((h, i) => {
              const barOpacity = interpolate(frame, [40 + i, 55 + i], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={i} style={{
                  width: 14, height: h, borderRadius: 7,
                  background: "linear-gradient(180deg, #8B5CF6, #00D4FF)",
                  opacity: barOpacity,
                }} />
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
