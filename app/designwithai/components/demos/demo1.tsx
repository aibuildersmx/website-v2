import DemoVideo from './demo-video';

export default function Demo1() {
  return (
    <DemoVideo
      mp4Src="/demovideos/demo1.mp4"
      movFallbackSrc="/demovideos/demo1.mov"
      title="Demo 1"
    />
  );
}
