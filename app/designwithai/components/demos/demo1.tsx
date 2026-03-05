import DemoVideo from './demo-video';

export default function Demo1({ active }: { active?: boolean }) {
  return (
    <DemoVideo
      mp4Src="/demovideos/demo1.mp4"
      title="Demo 1"
      active={active}
    />
  );
}
