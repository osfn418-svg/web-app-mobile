import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });

// Mockup of a chat interface
export const SceneChat = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phoneScale = spring({ frame, fps, config: { damping: 15 } });
  const phoneY = interpolate(spring({ frame, fps, config: { damping: 18 } }), [0, 1], [100, 0]);

  const messages = [
    { role: "user", text: "ما هي أفضل لغة برمجة للمبتدئين؟", delay: 25 },
    { role: "ai", text: "Python هي الخيار الأمثل للمبتدئين! سهلة التعلم وقوية.", delay: 55 },
    { role: "user", text: "شكراً! هل يمكنك كتابة كود بسيط؟", delay: 85 },
  ];

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Left text */}
      <div style={{ position: "absolute", left: 120, top: "50%", transform: "translateY(-50%)", maxWidth: 550 }}>
        <div style={{ fontFamily, fontSize: 20, color: "#00D4FF", letterSpacing: 6, marginBottom: 20,
          opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }) }}>
          AI CHAT
        </div>
        <div style={{ fontFamily, fontSize: 52, fontWeight: 700, color: "white", lineHeight: 1.2,
          opacity: interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" }),
          transform: `translateX(${interpolate(spring({ frame: frame - 10, fps, config: { damping: 20 } }), [0, 1], [-40, 0])}px)` }}>
          Smart <span style={{ color: "#00D4FF" }}>Conversations</span>
        </div>
        <div style={{ fontFamily, fontSize: 20, color: "rgba(255,255,255,0.5)", marginTop: 20, lineHeight: 1.6,
          opacity: interpolate(frame, [25, 45], [0, 1], { extrapolateRight: "clamp" }) }}>
          Chat with GPT-5, Gemini, Claude & more<br />in one unified interface
        </div>
      </div>

      {/* Phone mockup */}
      <div style={{
        position: "absolute", right: 180, top: "50%",
        transform: `translateY(-50%) scale(${phoneScale}) translateY(${phoneY}px)`,
        width: 340, height: 620,
        background: "linear-gradient(180deg, rgba(15,20,35,0.95), rgba(10,14,26,0.98))",
        borderRadius: 40, border: "2px solid rgba(0,212,255,0.2)",
        boxShadow: "0 30px 80px rgba(0,0,0,0.5), 0 0 40px rgba(0,212,255,0.1)",
        padding: "60px 20px 20px",
        overflow: "hidden",
      }}>
        {/* Status bar */}
        <div style={{ position: "absolute", top: 15, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div style={{ width: 80, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.3)" }} />
        </div>
        {/* Chat header */}
        <div style={{ fontFamily, fontSize: 16, fontWeight: 700, color: "#00D4FF", textAlign: "center", marginBottom: 20 }}>
          💬 AI Chat
        </div>
        {/* Messages */}
        {messages.map((msg, i) => {
          const msgOpacity = interpolate(frame, [msg.delay, msg.delay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const msgY = interpolate(spring({ frame: frame - msg.delay, fps, config: { damping: 15 } }), [0, 1], [20, 0]);
          return (
            <div key={i} style={{
              display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              marginBottom: 12, opacity: msgOpacity, transform: `translateY(${msgY}px)`,
            }}>
              <div style={{
                maxWidth: "80%", padding: "10px 14px", borderRadius: 16,
                background: msg.role === "user"
                  ? "linear-gradient(135deg, rgba(0,212,255,0.3), rgba(139,92,246,0.3))"
                  : "rgba(255,255,255,0.08)",
                border: `1px solid ${msg.role === "user" ? "rgba(0,212,255,0.3)" : "rgba(255,255,255,0.1)"}`,
                fontFamily, fontSize: 12, color: "rgba(255,255,255,0.85)", direction: "rtl",
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
