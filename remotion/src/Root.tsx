import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";

// 13 scenes total raw: 200+160+130+130+170+130+170+130+170+130+155+150+170 = 1995
// 12 transitions: 11×20 + 25 = 245
// Effective: 1995 - 245 = 1750 frames ≈ 58.3s

export const RemotionRoot = () => (
  <>
    <Composition
      id="main"
      component={MainVideo}
      durationInFrames={1750}
      fps={30}
      width={1080}
      height={1350}
    />
  </>
);
