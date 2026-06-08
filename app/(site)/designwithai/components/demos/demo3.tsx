import DemoVideo from './demo-video';

export default function Demo3({ active }: { active?: boolean }) {
  return (
    <DemoVideo
      mp4Src="/demovideos/demo3.mp4"
      title="Demo 3"
      active={active}
    />
  );
}
