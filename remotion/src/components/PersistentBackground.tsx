import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export const PersistentBackground = () => {
  const frame = useCurrentFrame();
  const hueShift = interpolate(frame, [0, 1650], [0, 30]);
  const gradientAngle = interpolate(frame, [0, 1650], [135, 225]);

  return (
    <AbsoluteFill>
      <div style={{
        width: "100%", height: "100%",
        background: `linear-gradient(${gradientAngle}deg, 
          hsl(${220 + hueShift}, 30%, 5%), 
          hsl(${240 + hueShift}, 25%, 8%), 
          hsl(${260 + hueShift}, 20%, 6%))`,
      }} />
      {[0, 1, 2].map((i) => {
        const x = interpolate(frame, [0, 1650], [100 + i * 300, 200 + i * 250]);
        const y = interpolate(frame, [0, 500, 1000], [100 + i * 300, 700 - i * 150, 400 + i * 200]);
        const scale = interpolate(frame, [0, 500, 1000], [0.8, 1.2, 0.9]);
        return (
          <div key={i} style={{
            position: "absolute", left: x, top: y, width: 350, height: 350, borderRadius: "50%",
            background: i === 0
              ? "radial-gradient(circle, rgba(0,212,255,0.15), transparent 70%)"
              : i === 1
              ? "radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)"
              : "radial-gradient(circle, rgba(0,212,255,0.08), transparent 70%)",
            transform: `scale(${scale})`, filter: "blur(60px)",
          }} />
        );
      })}
    </AbsoluteFill>
  );
};
