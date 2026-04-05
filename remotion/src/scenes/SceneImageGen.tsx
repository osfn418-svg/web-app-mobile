import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });

export const SceneImageGen = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Simulated image generation grid
  const images = [
    { color: "linear-gradient(135deg, #667eea, #764ba2)", label: "Fantasy Art", delay: 20 },
    { color: "linear-gradient(135deg, #f093fb, #f5576c)", label: "Portrait", delay: 35 },
    { color: "linear-gradient(135deg, #4facfe, #00f2fe)", label: "Landscape", delay: 50 },
    { color: "linear-gradient(135deg, #43e97b, #38f9d7)", label: "Abstract", delay: 65 },
  ];

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <div style={{ fontFamily, fontSize: 20, color: "#8B5CF6", letterSpacing: 6, marginBottom: 15,
          opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }) }}>
          IMAGE GENERATOR
        </div>
        <div style={{ fontFamily, fontSize: 52, fontWeight: 700, color: "white",
          opacity: interpolate(frame, [5, 25], [0, 1], { extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(spring({ frame: frame - 5, fps, config: { damping: 20 } }), [0, 1], [40, 0])}px)` }}>
          Create <span style={{ color: "#8B5CF6" }}>Stunning</span> Images
        </div>
      </div>

      <div style={{ display: "flex", gap: 30, marginTop: 20 }}>
        {images.map((img, i) => {
          const s = spring({ frame: frame - img.delay, fps, config: { damping: 12 } });
          const scale = interpolate(s, [0, 1], [0.5, 1]);
          const opacity = interpolate(frame, [img.delay, img.delay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const rotate = interpolate(s, [0, 1], [10, 0]);

          return (
            <div key={i} style={{
              width: 260, height: 300, borderRadius: 20,
              background: img.color,
              transform: `scale(${scale}) rotate(${rotate}deg)`,
              opacity,
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
              display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 20,
              border: "1px solid rgba(255,255,255,0.1)",
            }}>
              <div style={{
                fontFamily, fontSize: 16, fontWeight: 600, color: "white",
                background: "rgba(0,0,0,0.4)", padding: "8px 20px", borderRadius: 12,
              }}>
                {img.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
