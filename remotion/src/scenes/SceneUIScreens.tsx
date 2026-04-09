import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile } from "remotion";
import { loadFont } from "@remotion/google-fonts/Cairo";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["arabic"] });

/* ─── Single Screen ─── */
const PhoneFrame = ({ image, scale, y, accentColor }: { image: string; scale: number; y: number; accentColor: string }) => {
  const frame = useCurrentFrame();
  const floatY = Math.sin(frame * 0.04) * 5;
  const glowIntensity = 0.12 + Math.sin(frame * 0.06) * 0.08;

  return (
    <div style={{ transform: `scale(${scale}) translateY(${y + floatY}px)` }}>
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: 340, height: 650,
        background: `radial-gradient(ellipse, ${accentColor}${Math.round(glowIntensity * 255).toString(16).padStart(2, '0')}, transparent 70%)`,
        filter: "blur(50px)",
      }} />
      <div style={{
        width: 290, height: 600, borderRadius: 32,
        border: `2px solid ${accentColor}35`,
        overflow: "hidden", position: "relative",
        boxShadow: `0 25px 70px rgba(0,0,0,0.45), 0 0 35px ${accentColor}18`,
        background: "#111827",
      }}>
        <Img src={staticFile(`images/${image}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{
        position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)",
        width: 80, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.12)",
      }} />
    </div>
  );
};

/* ─── Dual Screen Scene ─── */
export const DualScreenScene = ({ image1, image2, title, subtitle, accentColor = "#00D4FF" }: {
  image1: string; image2: string; title: string; subtitle: string; accentColor?: string;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const phone1Op = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" });
  const phone1Scale = spring({ frame: frame - 10, fps, config: { damping: 14 } });
  const phone2Op = interpolate(frame, [25, 45], [0, 1], { extrapolateRight: "clamp" });
  const phone2Scale = spring({ frame: frame - 25, fps, config: { damping: 14 } });

  const float1 = Math.sin(frame * 0.04) * 4;
  const float2 = Math.sin(frame * 0.04 + 1.5) * 4;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", direction: "rtl" }}>
      <div style={{ position: "absolute", top: 70, textAlign: "center", opacity: labelOp }}>
        <div style={{ fontFamily, fontSize: 16, color: accentColor, letterSpacing: 5, marginBottom: 10 }}>
          {subtitle}
        </div>
        <div style={{
          fontFamily, fontSize: 34, fontWeight: 700, color: "white",
          transform: `translateY(${interpolate(spring({ frame: frame - 10, fps, config: { damping: 20 } }), [0, 1], [25, 0])}px)`,
        }}>
          {title}
        </div>
      </div>

      <div style={{ display: "flex", gap: 20, marginTop: 60 }}>
        <div style={{ opacity: phone1Op, transform: `translateY(${float1}px)` }}>
          <div style={{
            width: 220, height: 460, borderRadius: 26,
            border: `2px solid ${accentColor}28`,
            overflow: "hidden", position: "relative",
            boxShadow: `0 20px 55px rgba(0,0,0,0.4), 0 0 25px ${accentColor}12`,
            background: "#111827", transform: `scale(${phone1Scale})`,
          }}>
            <Img src={staticFile(`images/${image1}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>
        <div style={{ opacity: phone2Op, transform: `translateY(${float2}px)` }}>
          <div style={{
            width: 220, height: 460, borderRadius: 26,
            border: `2px solid ${accentColor}28`,
            overflow: "hidden", position: "relative",
            boxShadow: `0 20px 55px rgba(0,0,0,0.4), 0 0 25px ${accentColor}12`,
            background: "#111827", transform: `scale(${phone2Scale})`,
          }}>
            <Img src={staticFile(`images/${image2}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ─── Single Screen Scene ─── */
export const SingleScreenScene = ({ image, title, subtitle, accentColor = "#00D4FF" }: {
  image: string; title: string; subtitle: string; accentColor?: string;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phoneScale = spring({ frame: frame - 5, fps, config: { damping: 14 } });
  const phoneY = interpolate(spring({ frame: frame - 5, fps, config: { damping: 16 } }), [0, 1], [80, 0]);
  const labelOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const titleOp = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", direction: "rtl" }}>
      <div style={{ position: "absolute", top: 75, textAlign: "center", opacity: labelOp }}>
        <div style={{ fontFamily, fontSize: 16, color: accentColor, letterSpacing: 5, marginBottom: 10 }}>
          {subtitle}
        </div>
        <div style={{
          fontFamily, fontSize: 36, fontWeight: 700, color: "white", opacity: titleOp,
          transform: `translateY(${interpolate(spring({ frame: frame - 15, fps, config: { damping: 20 } }), [0, 1], [25, 0])}px)`,
        }}>
          {title}
        </div>
      </div>

      <div style={{ marginTop: 70 }}>
        <PhoneFrame image={image} scale={phoneScale} y={phoneY} accentColor={accentColor} />
      </div>
    </AbsoluteFill>
  );
};
