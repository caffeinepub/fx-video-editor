import { Slider } from "@/components/ui/slider";
import {
  Maximize2,
  MonitorPlay,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { EffectConfig } from "../types/editor";

interface VideoPreviewProps {
  videoSrc: string | null;
  selectedEffect: EffectConfig | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onTimeUpdate: (time: number, duration: number) => void;
  onVolumeChange: (vol: number) => void;
  onPlayStateChange: (playing: boolean) => void;
}

function formatTime(secs: number) {
  if (Number.isNaN(secs)) return "00:00:00";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function applySpecialEffect(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  special: EffectConfig["special"],
  currentTime: number,
  duration: number,
) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.filter = "none";

  if (special === "filmgrain") {
    ctx.drawImage(video, 0, 0, w, h);
    const idata = ctx.getImageData(0, 0, w, h);
    const d = idata.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() - 0.5) * 50;
      d[i] = Math.max(0, Math.min(255, d[i] + n));
      d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
      d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
    }
    ctx.putImageData(idata, 0, 0);
  } else if (special === "vhs") {
    ctx.filter = "saturate(1.4) contrast(1.1)";
    ctx.drawImage(video, 0, 0, w, h);
    ctx.filter = "none";
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
    if (Math.random() < 0.15) {
      const bandY = Math.random() * h;
      ctx.fillStyle = `rgba(255,255,255,${0.03 + Math.random() * 0.05})`;
      ctx.fillRect(0, bandY, w, 2 + Math.random() * 6);
    }
  } else if (special === "rgbsplit") {
    const tmp = document.createElement("canvas");
    tmp.width = w;
    tmp.height = h;
    const tmpCtx = tmp.getContext("2d");
    if (!tmpCtx) return;
    tmpCtx.drawImage(video, 0, 0, w, h);
    const src = tmpCtx.getImageData(0, 0, w, h);
    const out = ctx.createImageData(w, h);
    const sd = src.data;
    const od = out.data;
    const offset = 6;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const ri = (y * w + Math.max(0, x - offset)) * 4;
        const bi = (y * w + Math.min(w - 1, x + offset)) * 4;
        od[i] = sd[ri];
        od[i + 1] = sd[i + 1];
        od[i + 2] = sd[bi + 2];
        od[i + 3] = 255;
      }
    }
    ctx.putImageData(out, 0, 0);
  } else if (special === "scanlines") {
    ctx.drawImage(video, 0, 0, w, h);
    ctx.fillStyle = "rgba(0,0,0,0.32)";
    for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 2);
  } else if (special === "dissolve") {
    const progress = duration > 0 ? currentTime / duration : 0;
    const fade = Math.abs(Math.sin(progress * Math.PI * 2));
    ctx.globalAlpha = 0.5 + fade * 0.5;
    ctx.drawImage(video, 0, 0, w, h);
    ctx.globalAlpha = 1;
  } else if (special === "wipe") {
    ctx.drawImage(video, 0, 0, w, h);
    const progress = duration > 0 ? currentTime / duration : 0;
    const wipeX = w * ((progress * 2) % 1);
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(wipeX, 0, w - wipeX, h);
  } else {
    ctx.drawImage(video, 0, 0, w, h);
  }
}

export function VideoPreview({
  videoSrc,
  selectedEffect,
  isPlaying,
  currentTime,
  duration,
  volume,
  onTogglePlay,
  onSeek,
  onTimeUpdate,
  onVolumeChange,
  onPlayStateChange,
}: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const selectedEffectRef = useRef(selectedEffect);
  const [isMuted, setIsMuted] = useState(false);

  // Keep ref in sync for use inside RAF callback
  useEffect(() => {
    selectedEffectRef.current = selectedEffect;
  });

  const drawFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const effect = selectedEffectRef.current;

    if (video.readyState >= 2) {
      if (effect?.special) {
        applySpecialEffect(
          ctx,
          video,
          effect.special,
          video.currentTime,
          video.duration || 1,
        );
      } else {
        ctx.filter = effect?.filter || "none";
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.filter = "none";
      }
    }

    if (!video.paused && !video.ended) {
      rafRef.current = requestAnimationFrame(drawFrame);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;
    if (isPlaying) {
      video.play().catch(() => {});
      rafRef.current = requestAnimationFrame(drawFrame);
    } else {
      video.pause();
      cancelAnimationFrame(rafRef.current);
      drawFrame();
    }
  }, [isPlaying, videoSrc, drawFrame]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: selectedEffect accessed via ref inside drawFrame
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;
    if (video.paused) drawFrame();
  }, [selectedEffect, drawFrame, videoSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;
    if (Math.abs(video.currentTime - currentTime) > 0.5) {
      video.currentTime = currentTime;
    }
  }, [currentTime, videoSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleVideoLoaded = () => {
    const video = videoRef.current;
    if (!video) return;
    onTimeUpdate(0, video.duration);
    drawFrame();
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    onTimeUpdate(video.currentTime, video.duration);
  };

  const handleEnded = () => {
    onPlayStateChange(false);
    cancelAnimationFrame(rafRef.current);
  };

  const handleScrubClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    onSeek(ratio * duration);
  };

  const handleScrubKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") onSeek(Math.max(0, currentTime - 5));
    if (e.key === "ArrowRight") onSeek(Math.min(duration, currentTime + 5));
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "#0F1115" }}
      data-ocid="video_preview.panel"
    >
      <div className="flex-1 flex items-center justify-center p-3 min-h-0">
        {videoSrc ? (
          <div
            className="relative w-full max-h-full"
            style={{ aspectRatio: "16/9", maxWidth: "100%" }}
          >
            {/* biome-ignore lint/a11y/useMediaCaption: canvas renders video with visual effects */}
            <video
              ref={videoRef}
              src={videoSrc}
              className="hidden"
              onLoadedData={handleVideoLoaded}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              playsInline
            />
            <canvas
              ref={canvasRef}
              width={854}
              height={480}
              className="w-full h-full rounded-lg"
              style={{
                background: "#000",
                boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              }}
              data-ocid="video_preview.canvas_target"
            />
            {selectedEffect && (
              <div
                className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium"
                style={{
                  background: "rgba(0,0,0,0.7)",
                  color: selectedEffect.swatch,
                }}
              >
                {selectedEffect.name}
              </div>
            )}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center gap-4 rounded-xl"
            style={{
              width: "min(100%, 640px)",
              aspectRatio: "16/9",
              background: "#1A1F27",
              border: "2px dashed #2A3342",
            }}
            data-ocid="video_preview.empty_state"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "#2A3342" }}
            >
              <MonitorPlay className="w-8 h-8" style={{ color: "#2F7DFF" }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: "#E6EAF2" }}>
                Drop a video to start
              </p>
              <p className="text-xs mt-1" style={{ color: "#A6AFBF" }}>
                Upload from the Media Library to begin editing
              </p>
            </div>
          </div>
        )}
      </div>

      <div
        className="px-4 pb-3 pt-1 shrink-0"
        style={{ borderTop: "1px solid #2A3342" }}
      >
        {/* Scrub bar */}
        <div
          className="relative mb-2 cursor-pointer"
          role="slider"
          aria-label="Video timeline"
          aria-valuenow={currentTime}
          aria-valuemin={0}
          aria-valuemax={duration}
          tabIndex={0}
          onClick={handleScrubClick}
          onKeyDown={handleScrubKey}
          data-ocid="video_preview.scrub_input"
        >
          <div
            className="h-1 rounded-full overflow-hidden"
            style={{ background: "#2A3342" }}
          >
            <div
              className="h-full rounded-full transition-none"
              style={{ width: `${progressPercent}%`, background: "#2F7DFF" }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onTogglePlay}
            disabled={!videoSrc}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-40"
            style={{ background: videoSrc ? "#2F7DFF" : "#2A3342" }}
            data-ocid="video_preview.play_button"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white ml-0.5" />
            )}
          </button>

          <span
            className="text-xs font-mono tabular-nums"
            style={{ color: "#E6EAF2", minWidth: 80 }}
          >
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMuted((m) => !m)}
              className="p-1 rounded transition-colors hover:bg-white/5"
              style={{ color: "#A6AFBF" }}
              data-ocid="video_preview.mute_toggle"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <div className="w-20" data-ocid="video_preview.volume_input">
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                min={0}
                max={100}
                step={1}
                onValueChange={([v]) => {
                  onVolumeChange(v / 100);
                  setIsMuted(false);
                }}
              />
            </div>
          </div>

          <button
            type="button"
            className="p-1 rounded hover:bg-white/5 transition-colors"
            style={{ color: "#A6AFBF" }}
            data-ocid="video_preview.fullscreen_button"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
