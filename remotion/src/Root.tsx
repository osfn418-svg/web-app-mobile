import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";
import { UIShowcaseVideo } from "./UIShowcase";

export const RemotionRoot = () => (
  <>
    <Composition
      id="main"
      component={MainVideo}
      durationInFrames={1650}
      fps={30}
      width={1080}
      height={1350}
    />
    <Composition
      id="ui-showcase"
      component={UIShowcaseVideo}
      durationInFrames={1100}
      fps={30}
      width={1080}
      height={1350}
    />
  </>
);
