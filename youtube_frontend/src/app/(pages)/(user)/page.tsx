import Navbar from "./_component/Navbar";
import VideoFetch from "./_component/VideoFetch";

export default function Home() {
  return (
    <div className="px-7 space-y-10">
      <Navbar />
      <VideoFetch />
    </div>
  );
}
