import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });

const students = [
  "Osama Sufyan — أسامة سفيان",
  "Ashraf Abdullah Al-Sharabi — أشرف عبد الله الشرعبي",
  "Ameen Ali Abdu Farhan — أمين علي عبده فرحان",
  "Elyas Al-Humaidi — إلياس الحميدي",
  "Anas Abdu Al-Mujaidi — أنس عبده المجيدي",
];

export const Scene0Credits = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // App name
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const titleScale = spring({ frame, fps, config: { damping: 15 } });

  // "Prepared by" label
  const prepOpacity = interpolate(frame, [30, 45], [0, 1], { extrapolateRight: "clamp" });

  // Supervisor
  const supOpacity = interpolate(frame, [130, 150], [0, 1], { extrapolateRight: "clamp" });
  const supY = interpolate(spring({ frame: frame - 130, fps, config: { damping: 20 } }), [0, 1], [30, 0]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* App Title */}
      <div style={{
        fontFamily,
        fontSize: 56,
        fontWeight: 700,
        color: "#00D4FF",
        opacity: titleOpacity,
        transform: `scale(${titleScale})`,
        textShadow: "0 0 30px rgba(0,212,255,0.4)",
        letterSpacing: 4,
        marginBottom: 50,
      }}>
        NEXUS AI HUB
      </div>

      {/* Prepared by */}
      <div style={{
        fontFamily,
        fontSize: 22,
        color: "#8B5CF6",
        letterSpacing: 6,
        opacity: prepOpacity,
        marginBottom: 25,
      }}>
        PREPARED BY
      </div>

      {/* Student names */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        {students.map((name, i) => {
          const delay = 40 + i * 15;
          const nameOpacity = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const nameX = interpolate(
            spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 120 } }),
            [0, 1], [i % 2 === 0 ? -80 : 80, 0]
          );
          return (
            <div key={i} style={{
              fontFamily,
              fontSize: 24,
              fontWeight: 600,
              color: "rgba(255,255,255,0.85)",
              opacity: nameOpacity,
              transform: `translateX(${nameX}px)`,
            }}>
              {name}
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div style={{
        width: interpolate(frame, [120, 145], [0, 300], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        height: 2,
        background: "linear-gradient(90deg, transparent, #8B5CF6, #00D4FF, transparent)",
        marginTop: 40,
        marginBottom: 25,
      }} />

      {/* Supervised by */}
      <div style={{
        fontFamily,
        fontSize: 20,
        color: "#8B5CF6",
        letterSpacing: 6,
        opacity: supOpacity,
        marginBottom: 12,
      }}>
        SUPERVISED BY
      </div>
      <div style={{
        fontFamily,
        fontSize: 28,
        fontWeight: 700,
        color: "#00D4FF",
        opacity: supOpacity,
        transform: `translateY(${supY}px)`,
        textShadow: "0 0 20px rgba(0,212,255,0.3)",
      }}>
        Dr. Yasmeen Al-Mekhlafi
      </div>
    </AbsoluteFill>
  );
};
