import DemoVideo from './demo-video';

export default function Demo2({ active }: { active?: boolean }) {
  return (
    <DemoVideo
      mp4Src="/demovideos/demo2.mp4"
      title="Demo 2"
      active={active}
    />
  );
}
