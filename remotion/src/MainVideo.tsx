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

// Scene durations (frames at 30fps)
// Total sequences: 210+180+200+195+195+195+195+180+165+195 = 1910
// Transitions: 9×20 + 0 = 180  (last transition is 25 so 8×20+25=185)
// Effective: 1910 - 185 = 1725 frames = ~57.5s

export const MainVideo = () => {
  return (
    <AbsoluteFill>
      <PersistentBackground />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={210}>
          <Scene0Credits />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={180}>
          <Scene1Intro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={200}>
          <SceneChat />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={195}>
          <SceneImageGen />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={195}>
          <SceneVideoMusic />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={195}>
          <SceneCodeDoc />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-left" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={195}>
          <SceneVoice />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={180}>
          <Scene3Tools />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={165}>
          <Scene4Tech />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={springTiming({ config: { damping: 200 }, durationInFrames: 25 })} />

        <TransitionSeries.Sequence durationInFrames={195}>
          <Scene5Closing />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
