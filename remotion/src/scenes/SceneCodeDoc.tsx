import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });

const codeLines = [
  { text: 'function analyzeData(input) {', color: "#8B5CF6" },
  { text: '  const result = AI.process(input);', color: "#00D4FF" },
  { text: '  return result.optimize();', color: "#4ADE80" },
  { text: '}', color: "#8B5CF6" },
  { text: '', color: "transparent" },
  { text: '// AI-powered code assistance', color: "#666" },
  { text: 'const output = analyzeData(data);', color: "#F59E0B" },
];

export const SceneCodeDoc = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", gap: 80, alignItems: "center" }}>
        {/* Code Assistant */}
        <div style={{
          opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
          transform: `translateX(${interpolate(spring({ frame, fps, config: { damping: 18 } }), [0, 1], [-60, 0])}px)`,
        }}>
          <div style={{ fontFamily, fontSize: 18, color: "#4ADE80", letterSpacing: 4, marginBottom: 20 }}>
            💻 CODE ASSISTANT
          </div>
          <div style={{
            width: 500, padding: 30, borderRadius: 16,
            background: "rgba(10,14,26,0.9)", border: "1px solid rgba(74,222,128,0.2)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          }}>
            {codeLines.map((line, i) => {
              const lineOpacity = interpolate(frame, [15 + i * 8, 25 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={i} style={{
                  fontFamily: "monospace", fontSize: 16, color: line.color,
                  opacity: lineOpacity, height: 28, lineHeight: "28px",
                }}>
                  {line.text}
                  {i === codeLines.length - 1 && frame > 70 && (
                    <span style={{ opacity: interpolate(frame % 30, [0, 15, 30], [1, 0, 1]), color: "#00D4FF" }}>|</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Document Analyzer */}
        <div style={{
          opacity: interpolate(frame, [30, 50], [0, 1], { extrapolateRight: "clamp" }),
          transform: `translateX(${interpolate(spring({ frame: frame - 30, fps, config: { damping: 18 } }), [0, 1], [60, 0])}px)`,
        }}>
          <div style={{ fontFamily, fontSize: 18, color: "#F59E0B", letterSpacing: 4, marginBottom: 20 }}>
            📄 DOCUMENT ANALYZER
          </div>
          <div style={{
            width: 400, height: 280, padding: 30, borderRadius: 16,
            background: "rgba(10,14,26,0.9)", border: "1px solid rgba(245,158,11,0.2)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          }}>
            {/* Doc icon */}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 60, opacity: interpolate(frame, [40, 55], [0, 1], { extrapolateRight: "clamp" }) }}>📋</div>
            </div>
            {/* Analysis bars */}
            {[0.85, 0.72, 0.93].map((width, i) => {
              const barWidth = interpolate(frame, [55 + i * 12, 75 + i * 12], [0, width * 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={i} style={{ marginBottom: 15 }}>
                  <div style={{ fontFamily, fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 5 }}>
                    {["Accuracy", "Relevance", "Confidence"][i]}
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                    <div style={{
                      width: `${barWidth}%`, height: "100%", borderRadius: 4,
                      background: `linear-gradient(90deg, #F59E0B, #EF4444)`,
                    }} />
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
