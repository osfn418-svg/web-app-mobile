import { AbsoluteFill } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { slide } from "@remotion/transitions/slide";
import { Scene0Credits } from "./scenes/Scene0Credits";
import { Scene1Intro } from "./scenes/Scene1Intro";
import { SceneChat } from "./scenes/SceneChat";
import { SceneImageGen } from "./scenes/SceneImageGen";
import { SceneVideoMusic } from "./scenes/SceneVideoMusic";
import { SceneCodeDoc } from "./scenes/SceneCodeDoc";
import { SceneVoice } from "./scenes/SceneVoice";
import { Scene3Tools } from "./scenes/Scene3Tools";
import { Scene4Tech } from "./scenes/Scene4Tech";
import { Scene5Closing } from "./scenes/Scene5Closing";
import { PersistentBackground } from "./components/PersistentBackground";

const T = 20;

// 10 scenes: 210+170+190+185+185+185+185+170+160+185 = 1825
// 9 transitions: 8×20 + 25 = 185
// Effective: 1825 - 185 = 1640 ≈ 1650 frames (~55s)

export const MainVideo = () => {
  return (
    <AbsoluteFill>
      <PersistentBackground />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={210}>
          <Scene0Credits />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={170}>
          <Scene1Intro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={190}>
          <SceneChat />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={185}>
          <SceneImageGen />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={185}>
          <SceneVideoMusic />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={185}>
          <SceneCodeDoc />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-left" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={185}>
          <SceneVoice />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={170}>
          <Scene3Tools />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={160}>
          <Scene4Tech />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={springTiming({ config: { damping: 200 }, durationInFrames: 25 })} />

        <TransitionSeries.Sequence durationInFrames={185}>
          <Scene5Closing />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
