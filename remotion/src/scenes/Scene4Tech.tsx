import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });

const stats = [
  { value: "10+", label: "AI Models" },
  { value: "8", label: "Smart Tools" },
  { value: "24/7", label: "Available" },
  { value: "∞", label: "Possibilities" },
];

export const Scene4Tech = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Section title */}
      <div style={{
        position: "absolute",
        top: 160,
        fontFamily,
        fontSize: 48,
        fontWeight: 700,
        color: "white",
        opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
        transform: `translateY(${interpolate(spring({ frame, fps, config: { damping: 20 } }), [0, 1], [-30, 0])}px)`,
      }}>
        Built for <span style={{ color: "#8B5CF6" }}>Performance</span>
      </div>

      {/* Stats grid */}
      <div style={{
        display: "flex",
        gap: 60,
        marginTop: 40,
      }}>
        {stats.map((stat, i) => {
          const delay = 15 + i * 15;
          const s = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 100 } });
          const scale = interpolate(s, [0, 1], [0, 1]);
          const opacity = interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

          return (
            <div key={i} style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 15,
              transform: `scale(${scale})`,
              opacity,
            }}>
              <div style={{
                fontFamily,
                fontSize: 72,
                fontWeight: 700,
                background: "linear-gradient(135deg, #00D4FF, #8B5CF6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                {stat.value}
              </div>
              <div style={{
                fontFamily,
                fontSize: 20,
                color: "rgba(255,255,255,0.6)",
                letterSpacing: 2,
              }}>
                {stat.label}
              </div>
              {/* Underline */}
              <div style={{
                width: interpolate(frame, [delay + 15, delay + 35], [0, 80], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                height: 2,
                background: "linear-gradient(90deg, #00D4FF, #8B5CF6)",
                borderRadius: 1,
              }} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
