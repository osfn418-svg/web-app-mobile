import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/Cairo";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["arabic"] });

const codeLines = [
  { text: 'function analyzeData(input) {', color: "#8B5CF6" },
  { text: '  const result = AI.process(input);', color: "#00D4FF" },
  { text: '  return result.optimize();', color: "#4ADE80" },
  { text: '}', color: "#8B5CF6" },
];

export const SceneCodeDoc = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", direction: "rtl" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        {/* Code Assistant */}
        <div style={{
          opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(spring({ frame, fps, config: { damping: 18 } }), [0, 1], [-40, 0])}px)`,
        }}>
          <div style={{ fontFamily, fontSize: 22, color: "#4ADE80", marginBottom: 15, textAlign: "center" }}>
            💻 مساعد البرمجة
          </div>
          <div style={{
            width: 520, padding: 25, borderRadius: 16,
            background: "rgba(10,14,26,0.9)", border: "1px solid rgba(74,222,128,0.2)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)", direction: "ltr",
          }}>
            {codeLines.map((line, i) => {
              const lineOpacity = interpolate(frame, [15 + i * 10, 28 + i * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={i} style={{
                  fontFamily: "monospace", fontSize: 16, color: line.color,
                  opacity: lineOpacity, height: 30, lineHeight: "30px",
                }}>
                  {line.text}
                  {i === codeLines.length - 1 && frame > 65 && (
                    <span style={{ opacity: interpolate(frame % 30, [0, 15, 30], [1, 0, 1]), color: "#00D4FF" }}>|</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Document Analyzer */}
        <div style={{
          opacity: interpolate(frame, [35, 55], [0, 1], { extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(spring({ frame: frame - 35, fps, config: { damping: 18 } }), [0, 1], [40, 0])}px)`,
        }}>
          <div style={{ fontFamily, fontSize: 22, color: "#F59E0B", marginBottom: 15, textAlign: "center" }}>
            📄 محلل المستندات
          </div>
          <div style={{
            width: 520, height: 220, padding: 25, borderRadius: 16,
            background: "rgba(10,14,26,0.9)", border: "1px solid rgba(245,158,11,0.2)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          }}>
            <div style={{ textAlign: "center", marginBottom: 15 }}>
              <div style={{ fontSize: 50, opacity: interpolate(frame, [45, 58], [0, 1], { extrapolateRight: "clamp" }) }}>📋</div>
            </div>
            {[
              { label: "الدقة", width: 0.85 },
              { label: "الصلة", width: 0.72 },
              { label: "الثقة", width: 0.93 },
            ].map((bar, i) => {
              const barWidth = interpolate(frame, [60 + i * 12, 80 + i * 12], [0, bar.width * 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ fontFamily, fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 4, textAlign: "right" }}>{bar.label}</div>
                  <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                    <div style={{ width: `${barWidth}%`, height: "100%", borderRadius: 4, background: "linear-gradient(90deg, #F59E0B, #EF4444)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
