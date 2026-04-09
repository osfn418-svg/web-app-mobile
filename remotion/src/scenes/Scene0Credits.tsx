import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile } from "remotion";
import { loadFont } from "@remotion/google-fonts/Cairo";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700", "800"], subsets: ["arabic"] });

const students = [
  "أسامة سفيان",
  "أشرف عبد الله الشرعبي",
  "أمين علي عبده فرحان",
  "إلياس الحميدي",
  "أنس عبده المجيدي",
];

export const Scene0Credits = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const prepOpacity = interpolate(frame, [30, 45], [0, 1], { extrapolateRight: "clamp" });
  const supOpacity = interpolate(frame, [140, 160], [0, 1], { extrapolateRight: "clamp" });
  const supY = interpolate(spring({ frame: frame - 140, fps, config: { damping: 20 } }), [0, 1], [30, 0]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", direction: "rtl" }}>
      <div style={{ transform: `scale(${logoScale})`, marginBottom: 25 }}>
        <Img src={staticFile("images/logo.png")} style={{ width: 150, height: 150, objectFit: "contain" }} />
      </div>

      <div style={{
        fontFamily, fontSize: 42, fontWeight: 800, color: "#00D4FF",
        opacity: titleOpacity, textShadow: "0 0 25px rgba(0,212,255,0.3)",
        letterSpacing: 2, marginBottom: 8,
      }}>
        الذكاء الشامل
      </div>
      <div style={{
        fontFamily, fontSize: 20, color: "rgba(255,255,255,0.5)",
        opacity: titleOpacity, letterSpacing: 4, marginBottom: 35,
      }}>
        AI HUB
      </div>

      <div style={{
        fontFamily, fontSize: 20, color: "#8B5CF6", letterSpacing: 4,
        opacity: prepOpacity, marginBottom: 22,
      }}>
        إعداد الطلاب
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        {students.map((name, i) => {
          const delay = 45 + i * 14;
          const nameOpacity = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const nameX = interpolate(
            spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 120 } }),
            [0, 1], [i % 2 === 0 ? -60 : 60, 0]
          );
          return (
            <div key={i} style={{
              fontFamily, fontSize: 24, fontWeight: 600,
              color: "rgba(255,255,255,0.85)", opacity: nameOpacity,
              transform: `translateX(${nameX}px)`,
            }}>
              {name}
            </div>
          );
        })}
      </div>

      <div style={{
        width: interpolate(frame, [125, 145], [0, 250], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        height: 2,
        background: "linear-gradient(90deg, transparent, #8B5CF6, #00D4FF, transparent)",
        marginTop: 30, marginBottom: 18,
      }} />

      <div style={{
        fontFamily, fontSize: 18, color: "#8B5CF6", letterSpacing: 4,
        opacity: supOpacity, marginBottom: 8,
      }}>
        إشراف
      </div>
      <div style={{
        fontFamily, fontSize: 26, fontWeight: 700, color: "#00D4FF",
        opacity: supOpacity, transform: `translateY(${supY}px)`,
        textShadow: "0 0 15px rgba(0,212,255,0.25)",
      }}>
        د. ياسمين المخلافي
      </div>
    </AbsoluteFill>
  );
};
