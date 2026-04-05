import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile } from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";

const { fontFamily } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });

export const Scene1Intro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });
  const logoRotate = interpolate(spring({ frame: frame - 5, fps, config: { damping: 20 } }), [0, 1], [-10, 0]);

  const titleY = interpolate(
    spring({ frame: frame - 20, fps, config: { damping: 18, stiffness: 150 } }),
    [0, 1], [80, 0]
  );
  const titleOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" });

  const subtitleOpacity = interpolate(frame, [45, 65], [0, 1], { extrapolateRight: "clamp" });
  const subtitleY = interpolate(
    spring({ frame: frame - 45, fps, config: { damping: 20 } }),
    [0, 1], [40, 0]
  );

  const lineWidth = interpolate(frame, [35, 70], [0, 400], { extrapolateRight: "clamp" });

  // Glowing ring around logo
  const ringScale = interpolate(frame, [0, 60, 120], [0.5, 1.1, 1.05]);
  const ringOpacity = interpolate(frame, [0, 30, 120], [0, 0.6, 0.3]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Glow ring */}
      <div style={{
        position: "absolute",
        width: 320,
        height: 320,
        borderRadius: "50%",
        border: "2px solid rgba(0,212,255,0.4)",
        boxShadow: "0 0 60px rgba(0,212,255,0.3), inset 0 0 60px rgba(139,92,246,0.2)",
        transform: `scale(${ringScale})`,
        opacity: ringOpacity,
      }} />

      {/* Logo */}
      <div style={{
        transform: `scale(${logoScale}) rotate(${logoRotate}deg)`,
        marginBottom: 30,
      }}>
        <Img src={staticFile("images/logo.png")} style={{ width: 200, height: 200, objectFit: "contain" }} />
      </div>

      {/* Title */}
      <div style={{
        fontFamily,
        fontSize: 82,
        fontWeight: 700,
        color: "white",
        transform: `translateY(${titleY}px)`,
        opacity: titleOpacity,
        textShadow: "0 0 40px rgba(0,212,255,0.5)",
        letterSpacing: 4,
      }}>
        NEXUS AI HUB
      </div>

      {/* Decorative line */}
      <div style={{
        width: lineWidth,
        height: 3,
        background: "linear-gradient(90deg, transparent, #00D4FF, #8B5CF6, transparent)",
        margin: "20px 0",
        borderRadius: 2,
      }} />

      {/* Subtitle */}
      <div style={{
        fontFamily,
        fontSize: 28,
        color: "rgba(255,255,255,0.7)",
        transform: `translateY(${subtitleY}px)`,
        opacity: subtitleOpacity,
        letterSpacing: 8,
      }}>
        YOUR INTELLIGENT AI PLATFORM
      </div>
    </AbsoluteFill>
  );
};
