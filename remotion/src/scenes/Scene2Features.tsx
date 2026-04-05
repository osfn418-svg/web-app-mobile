import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });

const features = [
  { icon: "🤖", title: "AI Chat", desc: "Multi-model conversations" },
  { icon: "🎨", title: "Image Gen", desc: "Create stunning visuals" },
  { icon: "🎬", title: "Video Gen", desc: "AI-powered video creation" },
  { icon: "🎵", title: "Music Gen", desc: "Generate original music" },
  { icon: "📄", title: "Doc Analysis", desc: "Smart document insights" },
  { icon: "💻", title: "Code Assist", desc: "AI programming helper" },
];

const FeatureCard = ({ icon, title, desc, index }: { icon: string; title: string; desc: string; index: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delay = index * 12;

  const s = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 120 } });
  const scale = interpolate(s, [0, 1], [0.3, 1]);
  const opacity = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(s, [0, 1], [60, 0]);

  // Hover-like glow
  const glowOpacity = interpolate(frame, [delay + 30, delay + 50, delay + 70], [0, 0.5, 0.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{
      transform: `scale(${scale}) translateY(${y}px)`,
      opacity,
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(0,212,255,0.2)",
      borderRadius: 20,
      padding: "35px 25px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 12,
      width: 260,
      boxShadow: `0 0 ${30 * glowOpacity}px rgba(0,212,255,${glowOpacity * 0.4})`,
      backdropFilter: "none",
    }}>
      <div style={{ fontSize: 52 }}>{icon}</div>
      <div style={{ fontFamily, fontSize: 24, fontWeight: 700, color: "#00D4FF" }}>{title}</div>
      <div style={{ fontFamily, fontSize: 16, color: "rgba(255,255,255,0.6)", textAlign: "center" }}>{desc}</div>
    </div>
  );
};

export const Scene2Features = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const headerY = interpolate(
    spring({ frame, fps, config: { damping: 20 } }),
    [0, 1], [-50, 0]
  );

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 80 }}>
      <div style={{
        fontFamily,
        fontSize: 52,
        fontWeight: 700,
        color: "white",
        opacity: headerOpacity,
        transform: `translateY(${headerY}px)`,
        marginBottom: 60,
        textAlign: "center",
      }}>
        Powerful <span style={{ color: "#00D4FF" }}>AI Tools</span>
      </div>

      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 30,
        justifyContent: "center",
        maxWidth: 1400,
      }}>
        {features.map((f, i) => (
          <FeatureCard key={i} {...f} index={i} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
