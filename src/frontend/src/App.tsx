import { Toaster } from "@/components/ui/sonner";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { EffectsPanel } from "./components/EffectsPanel";
import { Header } from "./components/Header";
import { MediaLibrary } from "./components/MediaLibrary";
import { VideoPreview } from "./components/VideoPreview";
import { VideoTimeline } from "./components/VideoTimeline";
import { useListProjects, useUpdateProject } from "./hooks/useQueries";
import type { EffectConfig, VideoFile } from "./types/editor";

let videoIdCounter = 0;

export default function App() {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [selectedEffect, setSelectedEffect] = useState<EffectConfig | null>(
    null,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [uploadProgress, setUploadProgress] = useState<number | undefined>(
    undefined,
  );

  const { data: projects } = useListProjects();
  const { mutateAsync: updateProject, isPending: isSaving } =
    useUpdateProject();

  const activeVideo = videos.find((v) => v.id === activeVideoId) ?? null;

  const generateThumbnail = useCallback((src: string): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.src = src;
      video.currentTime = 0.5;
      video.crossOrigin = "anonymous";
      video.onloadeddata = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 160;
        canvas.height = 90;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(video, 0, 0, 160, 90);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      video.onerror = () => resolve("");
    });
  }, []);

  const handleUpload = useCallback(
    async (file: File) => {
      const src = URL.createObjectURL(file);
      setUploadProgress(10);

      const thumbnail = await generateThumbnail(src);
      setUploadProgress(60);

      const dur = await new Promise<number>((resolve) => {
        const v = document.createElement("video");
        v.src = src;
        v.onloadedmetadata = () => resolve(v.duration);
        v.onerror = () => resolve(0);
      });

      setUploadProgress(90);

      const id = `video-${++videoIdCounter}`;
      const newVideo: VideoFile = {
        id,
        name: file.name,
        src,
        duration: dur,
        thumbnail,
      };

      setVideos((prev) => [...prev, newVideo]);
      setActiveVideoId(id);
      setCurrentTime(0);
      setDuration(dur);
      setIsPlaying(false);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(undefined), 800);
      toast.success(`"${file.name}" loaded successfully`);
    },
    [generateThumbnail],
  );

  const handleSelectVideo = useCallback((video: VideoFile) => {
    setActiveVideoId(video.id);
    setCurrentTime(0);
    setDuration(video.duration);
    setIsPlaying(false);
  }, []);

  const handleTimeUpdate = useCallback((time: number, dur: number) => {
    setCurrentTime(time);
    if (dur && !Number.isNaN(dur)) setDuration(dur);
  }, []);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const handleSeek = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleSave = useCallback(async () => {
    if (!activeVideo) {
      toast.error("No video selected");
      return;
    }
    try {
      const effects = selectedEffect
        ? [
            {
              name: selectedEffect.name,
              parameters: selectedEffect.filter,
              category: selectedEffect.category,
            },
          ]
        : [];
      await updateProject({ name: activeVideo.name, effects });
      toast.success("Project saved");
    } catch {
      toast.error("Failed to save project");
    }
  }, [activeVideo, selectedEffect, updateProject]);

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: "#12151A" }}
    >
      <Toaster position="top-right" />

      <Header
        onSave={handleSave}
        isSaving={isSaving}
        projectName={activeVideo?.name}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <MediaLibrary
          videos={videos}
          activeVideoId={activeVideoId}
          onUpload={handleUpload}
          onSelect={handleSelectVideo}
          uploadProgress={uploadProgress}
        />

        <main className="flex-1 min-w-0 flex flex-col">
          <VideoPreview
            videoSrc={activeVideo?.src ?? null}
            selectedEffect={selectedEffect}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            onTogglePlay={handleTogglePlay}
            onSeek={handleSeek}
            onTimeUpdate={handleTimeUpdate}
            onVolumeChange={setVolume}
            onPlayStateChange={setIsPlaying}
          />
        </main>

        <EffectsPanel
          selectedEffectId={selectedEffect?.id ?? null}
          onSelectEffect={(effect) => setSelectedEffect(effect)}
        />
      </div>

      <VideoTimeline
        duration={duration}
        currentTime={currentTime}
        onSeek={handleSeek}
        videoName={activeVideo?.name}
      />

      <footer
        className="flex items-center justify-center px-4 py-1.5 text-xs shrink-0"
        style={{
          background: "#0F1115",
          borderTop: "1px solid #2A3342",
          color: "#4a5568",
        }}
      >
        &copy; {new Date().getFullYear()}. Built with &hearts; using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="ml-1 hover:text-primary transition-colors"
          style={{ color: "#2F7DFF" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          caffeine.ai
        </a>
      </footer>

      {projects && projects.length > 0 && (
        <div className="hidden" aria-hidden="true">
          {projects.length} projects
        </div>
      )}
    </div>
  );
}
