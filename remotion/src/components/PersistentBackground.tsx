import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export const PersistentBackground = () => {
  const frame = useCurrentFrame();
  const hueShift = interpolate(frame, [0, 2000], [0, 25]);
  const gradientAngle = interpolate(frame, [0, 2000], [135, 200]);

  return (
    <AbsoluteFill>
      <div style={{
        width: "100%", height: "100%",
        background: `linear-gradient(${gradientAngle}deg, 
          hsl(${215 + hueShift}, 25%, 14%), 
          hsl(${225 + hueShift}, 22%, 18%), 
          hsl(${235 + hueShift}, 20%, 12%))`,
      }} />
      {[0, 1, 2].map((i) => {
        const x = interpolate(frame, [0, 2000], [100 + i * 300, 200 + i * 250]);
        const y = interpolate(frame, [0, 600, 1200], [100 + i * 300, 700 - i * 150, 400 + i * 200]);
        const scale = interpolate(frame, [0, 600, 1200], [0.8, 1.2, 0.9]);
        return (
          <div key={i} style={{
            position: "absolute", left: x, top: y, width: 400, height: 400, borderRadius: "50%",
            background: i === 0
              ? "radial-gradient(circle, rgba(0,212,255,0.12), transparent 70%)"
              : i === 1
              ? "radial-gradient(circle, rgba(139,92,246,0.10), transparent 70%)"
              : "radial-gradient(circle, rgba(56,189,248,0.08), transparent 70%)",
            transform: `scale(${scale})`, filter: "blur(80px)",
          }} />
        );
      })}
    </AbsoluteFill>
  );
};
