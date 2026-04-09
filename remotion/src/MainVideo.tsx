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
import { DualScreenScene, SingleScreenScene } from "./scenes/SceneUIScreens";
import { PersistentBackground } from "./components/PersistentBackground";

const T = 20;

// Merged video: promo + UI showcase
// 15 scenes with transitions

export const MainVideo = () => {
  return (
    <AbsoluteFill>
      <PersistentBackground />
      <TransitionSeries>
        {/* 1. Credits */}
        <TransitionSeries.Sequence durationInFrames={200}>
          <Scene0Credits />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        {/* 2. Intro */}
        <TransitionSeries.Sequence durationInFrames={160}>
          <Scene1Intro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        {/* 3. UI: Login + Signup */}
        <TransitionSeries.Sequence durationInFrames={130}>
          <DualScreenScene image1="ui-login.jpg" image2="ui-signup.jpg" title="المصادقة والأمان" subtitle="تسجيل الدخول" accentColor="#8B5CF6" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        {/* 4. UI: Home + Tools */}
        <TransitionSeries.Sequence durationInFrames={130}>
          <DualScreenScene image1="ui-home.jpg" image2="ui-tools.jpg" title="الرئيسية والأدوات" subtitle="لوحة التحكم" accentColor="#00D4FF" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        {/* 5. Chat feature */}
        <TransitionSeries.Sequence durationInFrames={170}>
          <SceneChat />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        {/* 6. UI: Image Gen + Video Gen */}
        <TransitionSeries.Sequence durationInFrames={130}>
          <DualScreenScene image1="ui-image-gen.jpg" image2="ui-video-gen.jpg" title="توليد الصور والفيديو" subtitle="أدوات إبداعية" accentColor="#8B5CF6" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-left" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        {/* 7. Code & Doc */}
        <TransitionSeries.Sequence durationInFrames={170}>
          <SceneCodeDoc />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        {/* 8. UI: Code + Prompt */}
        <TransitionSeries.Sequence durationInFrames={130}>
          <DualScreenScene image1="ui-code.jpg" image2="ui-prompt.jpg" title="مساعد البرمجة والبرومبت" subtitle="أدوات ذكية" accentColor="#4ADE80" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        {/* 9. Voice */}
        <TransitionSeries.Sequence durationInFrames={170}>
          <SceneVoice />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        {/* 10. UI: Settings + Subscription */}
        <TransitionSeries.Sequence durationInFrames={130}>
          <DualScreenScene image1="ui-settings.jpg" image2="ui-subscription.jpg" title="الإعدادات والاشتراك" subtitle="إدارة الحساب" accentColor="#F59E0B" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        {/* 11. Multi-model */}
        <TransitionSeries.Sequence durationInFrames={155}>
          <Scene3Tools />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        {/* 12. Stats */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene4Tech />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={springTiming({ config: { damping: 200 }, durationInFrames: 25 })} />

        {/* 13. Closing */}
        <TransitionSeries.Sequence durationInFrames={170}>
          <Scene5Closing />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
