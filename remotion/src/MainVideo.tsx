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

const T = 20; // transition duration

export const MainVideo = () => {
  return (
    <AbsoluteFill>
      <PersistentBackground />
      <TransitionSeries>
        {/* 1. Credits - 6s */}
        <TransitionSeries.Sequence durationInFrames={180}>
          <Scene0Credits />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        {/* 2. Logo Intro - 4.5s */}
        <TransitionSeries.Sequence durationInFrames={135}>
          <Scene1Intro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        {/* 3. Chat UI - 5s */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <SceneChat />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        {/* 4. Image Generator - 5s */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <SceneImageGen />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        {/* 5. Video & Music - 5s */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <SceneVideoMusic />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        {/* 6. Code & Docs - 5s */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <SceneCodeDoc />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-left" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        {/* 7. Voice & Speech - 5s */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <SceneVoice />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        {/* 8. Multi-model - 5s */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene3Tools />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        {/* 9. Performance Stats - 4.5s */}
        <TransitionSeries.Sequence durationInFrames={135}>
          <Scene4Tech />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={springTiming({ config: { damping: 200 }, durationInFrames: 25 })} />

        {/* 10. Closing - 5s */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene5Closing />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
