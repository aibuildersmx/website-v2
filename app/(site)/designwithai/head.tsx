export default function Head() {
  return (
    <>
      {/* Only preload the first video — others load on scroll */}
      <link rel="preload" href="/demovideos/demo1.mp4" as="video" type="video/mp4" />
    </>
  );
}
