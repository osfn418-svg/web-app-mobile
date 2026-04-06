import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/Cairo";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["arabic"] });

export const SceneChat = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phoneScale = spring({ frame, fps, config: { damping: 15 } });
  const phoneY = interpolate(spring({ frame, fps, config: { damping: 18 } }), [0, 1], [80, 0]);

  const messages = [
    { role: "user", text: "ما هي أفضل لغة برمجة للمبتدئين؟", delay: 25 },
    { role: "ai", text: "Python هي الخيار الأمثل! سهلة التعلم وقوية جداً.", delay: 55 },
    { role: "user", text: "شكراً! هل يمكنك كتابة كود بسيط؟", delay: 85 },
  ];

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", direction: "rtl" }}>
      {/* Title */}
      <div style={{ position: "absolute", top: 100, textAlign: "center" }}>
        <div style={{ fontFamily, fontSize: 22, color: "#00D4FF", letterSpacing: 4, marginBottom: 15,
          opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }) }}>
          محادثة ذكية
        </div>
        <div style={{ fontFamily, fontSize: 44, fontWeight: 700, color: "white", lineHeight: 1.3,
          opacity: interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(spring({ frame: frame - 10, fps, config: { damping: 20 } }), [0, 1], [-30, 0])}px)` }}>
          تحدث مع <span style={{ color: "#00D4FF" }}>نماذج AI</span> متعددة
        </div>
      </div>

      {/* Phone mockup - centered for 4:5 */}
      <div style={{
        transform: `scale(${phoneScale}) translateY(${phoneY}px)`,
        width: 380, height: 650, marginTop: 120,
        background: "linear-gradient(180deg, rgba(15,20,35,0.95), rgba(10,14,26,0.98))",
        borderRadius: 40, border: "2px solid rgba(0,212,255,0.2)",
        boxShadow: "0 30px 80px rgba(0,0,0,0.5), 0 0 40px rgba(0,212,255,0.1)",
        padding: "60px 20px 20px", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: 15, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div style={{ width: 80, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.3)" }} />
        </div>
        <div style={{ fontFamily, fontSize: 18, fontWeight: 700, color: "#00D4FF", textAlign: "center", marginBottom: 20 }}>
          💬 محادثة AI
        </div>
        {messages.map((msg, i) => {
          const msgOpacity = interpolate(frame, [msg.delay, msg.delay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const msgY = interpolate(spring({ frame: frame - msg.delay, fps, config: { damping: 15 } }), [0, 1], [20, 0]);
          return (
            <div key={i} style={{
              display: "flex", justifyContent: msg.role === "user" ? "flex-start" : "flex-end",
              marginBottom: 12, opacity: msgOpacity, transform: `translateY(${msgY}px)`,
            }}>
              <div style={{
                maxWidth: "80%", padding: "10px 14px", borderRadius: 16,
                background: msg.role === "user"
                  ? "linear-gradient(135deg, rgba(0,212,255,0.3), rgba(139,92,246,0.3))"
                  : "rgba(255,255,255,0.08)",
                border: `1px solid ${msg.role === "user" ? "rgba(0,212,255,0.3)" : "rgba(255,255,255,0.1)"}`,
                fontFamily, fontSize: 14, color: "rgba(255,255,255,0.85)", direction: "rtl", textAlign: "right",
              }}>
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
