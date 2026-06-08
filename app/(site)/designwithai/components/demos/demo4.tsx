import DemoVideo from './demo-video';

export default function Demo4({ active }: { active?: boolean }) {
  return (
    <DemoVideo
      mp4Src="/demovideos/demo4.mp4"
      title="Demo 4"
      active={active}
    />
  );
}
