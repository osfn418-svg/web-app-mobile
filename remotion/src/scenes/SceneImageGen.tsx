import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/Cairo";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["arabic"] });

export const SceneImageGen = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const images = [
    { color: "linear-gradient(135deg, #667eea, #764ba2)", label: "فن خيالي", delay: 20 },
    { color: "linear-gradient(135deg, #f093fb, #f5576c)", label: "بورتريه", delay: 35 },
    { color: "linear-gradient(135deg, #4facfe, #00f2fe)", label: "منظر طبيعي", delay: 50 },
    { color: "linear-gradient(135deg, #43e97b, #38f9d7)", label: "فن تجريدي", delay: 65 },
  ];

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", direction: "rtl" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontFamily, fontSize: 22, color: "#8B5CF6", letterSpacing: 4, marginBottom: 15,
          opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }) }}>
          مولّد الصور
        </div>
        <div style={{ fontFamily, fontSize: 44, fontWeight: 700, color: "white",
          opacity: interpolate(frame, [5, 25], [0, 1], { extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(spring({ frame: frame - 5, fps, config: { damping: 20 } }), [0, 1], [40, 0])}px)` }}>
          أنشئ صوراً <span style={{ color: "#8B5CF6" }}>مذهلة</span>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "center", maxWidth: 700 }}>
        {images.map((img, i) => {
          const s = spring({ frame: frame - img.delay, fps, config: { damping: 12 } });
          const scale = interpolate(s, [0, 1], [0.5, 1]);
          const opacity = interpolate(frame, [img.delay, img.delay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const rotate = interpolate(s, [0, 1], [10, 0]);
          return (
            <div key={i} style={{
              width: 220, height: 260, borderRadius: 20, background: img.color,
              transform: `scale(${scale}) rotate(${rotate}deg)`, opacity,
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
