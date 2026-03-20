import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { ChevronRight, Eye, EyeOff, Lock, Unlock } from "lucide-react";
import { useRef, useState } from "react";

interface VideoTimelineProps {
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
  videoName?: string;
}

interface Track {
  id: string;
  label: string;
  type: "video" | "audio";
  color: string;
}

const TRACKS: Track[] = [
  { id: "video1", label: "Video 1", type: "video", color: "#2F7DFF" },
  { id: "video2", label: "Video 2", type: "video", color: "#8B5CF6" },
  { id: "audio1", label: "Audio 1", type: "audio", color: "#22C55E" },
  { id: "audio2", label: "Audio 2", type: "audio", color: "#F59E0B" },
];

const TRACK_HEIGHT = 32;
const LABEL_WIDTH = 96;

function generateTimeMarkers(duration: number, zoom: number) {
  if (duration <= 0) return [];
  const totalWidth = Math.max(600, duration * zoom);
  const targetCount = Math.min(20, Math.floor(totalWidth / 60));
  const interval = Math.ceil(duration / Math.max(1, targetCount));
  const marks: { time: number; x: number }[] = [];
  for (let t = 0; t <= duration; t += interval) {
    marks.push({ time: t, x: (t / duration) * totalWidth });
  }
  return marks;
}

function formatShort(secs: number) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoTimeline({
  duration,
  currentTime,
  onSeek,
  videoName,
}: VideoTimelineProps) {
  const [zoom, setZoom] = useState(40);
  const [trackVisibility, setTrackVisibility] = useState<
    Record<string, boolean>
  >({});
  const [trackLocked, setTrackLocked] = useState<Record<string, boolean>>({});
  const _timelineRef = useRef<HTMLDivElement>(null);

  const totalWidth = Math.max(600, duration * zoom);
  const markers = generateTimeMarkers(duration, zoom);
  const playheadX = duration > 0 ? (currentTime / duration) * totalWidth : 0;

  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const t = (x / totalWidth) * duration;
    onSeek(Math.max(0, Math.min(duration, t)));
  };

  const handleRulerKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") onSeek(Math.max(0, currentTime - 5));
    if (e.key === "ArrowRight") onSeek(Math.min(duration, currentTime + 5));
  };

  return (
    <div
      className="flex flex-col"
      style={{
        background: "#1A1F27",
        borderTop: "1px solid #2A3342",
        height: 180,
      }}
      data-ocid="timeline.panel"
    >
      <div
        className="flex items-center justify-between px-3 py-1.5 shrink-0"
        style={{ borderBottom: "1px solid #2A3342" }}
      >
        <div className="flex items-center gap-2">
          <ChevronRight className="w-3.5 h-3.5" style={{ color: "#A6AFBF" }} />
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "#A6AFBF" }}
          >
            Timeline
          </span>
          {videoName && (
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{ background: "#2A3342", color: "#A6AFBF" }}
            >
              {videoName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: "#A6AFBF" }}>
            Zoom
          </span>
          <div className="w-24" data-ocid="timeline.zoom_input">
            <Slider
              value={[zoom]}
              min={10}
              max={120}
              step={5}
              onValueChange={([v]) => setZoom(v)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div
          className="flex flex-col shrink-0"
          style={{ width: LABEL_WIDTH, borderRight: "1px solid #2A3342" }}
        >
          <div
            className="shrink-0"
            style={{ height: 20, borderBottom: "1px solid #2A3342" }}
          />
          {TRACKS.map((track) => {
            const isVisible = trackVisibility[track.id] !== false;
            const isLocked = trackLocked[track.id] === true;
            return (
              <div
                key={track.id}
                className="flex items-center gap-1 px-2"
                style={{
                  height: TRACK_HEIGHT,
                  borderBottom: "1px solid #2A3342",
                  background: "#1A1F27",
                }}
                data-ocid={`timeline.${track.id}.row`}
              >
                <div
                  className="w-1.5 h-4 rounded-sm"
                  style={{ background: track.color, opacity: 0.6 }}
                />
                <span
                  className="text-xs flex-1 truncate"
                  style={{ color: "#A6AFBF", fontSize: 10 }}
                >
                  {track.label}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setTrackVisibility((p) => ({
                      ...p,
                      [track.id]: !isVisible,
                    }))
                  }
                  className="p-0.5 rounded hover:bg-white/10 transition-colors"
                  style={{ color: isVisible ? "#A6AFBF" : "#4a5568" }}
                  data-ocid={`timeline.${track.id}.toggle`}
                >
                  {isVisible ? (
                    <Eye className="w-3 h-3" />
                  ) : (
                    <EyeOff className="w-3 h-3" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTrackLocked((p) => ({ ...p, [track.id]: !isLocked }))
                  }
                  className="p-0.5 rounded hover:bg-white/10 transition-colors"
                  style={{ color: isLocked ? "#2F7DFF" : "#4a5568" }}
                  data-ocid={`timeline.${track.id}.lock_toggle`}
                >
                  {isLocked ? (
                    <Lock className="w-3 h-3" />
                  ) : (
                    <Unlock className="w-3 h-3" />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <ScrollArea className="flex-1" style={{ overflow: "auto" }}>
          <div
            className="relative"
            style={{ width: totalWidth, minHeight: "100%" }}
          >
            {/* Time ruler */}
            <div
              className="sticky top-0 z-10 cursor-pointer"
              style={{
                height: 20,
                background: "#0F1115",
                borderBottom: "1px solid #2A3342",
              }}
              role="slider"
              aria-label="Timeline ruler"
              aria-valuenow={currentTime}
              aria-valuemin={0}
              aria-valuemax={duration}
              tabIndex={0}
              onClick={handleRulerClick}
              onKeyDown={handleRulerKey}
              data-ocid="timeline.ruler"
            >
              {markers.map((m) => (
                <div
                  key={m.time}
                  className="absolute top-0"
                  style={{ left: m.x }}
                >
                  <div
                    className="h-2"
                    style={{ borderLeft: "1px solid #2A3342" }}
                  />
                  <span
                    className="absolute top-2 left-1"
                    style={{
                      color: "#4a5568",
                      fontSize: 9,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatShort(m.time)}
                  </span>
                </div>
              ))}
            </div>

            {TRACKS.map((track) => {
              const isVisible = trackVisibility[track.id] !== false;
              const isLocked = trackLocked[track.id] === true;
              const hasClip = track.id === "video1" && duration > 0;
              return (
                <div
                  key={track.id}
                  className={cn("relative", !isVisible && "opacity-30")}
                  style={{
                    height: TRACK_HEIGHT,
                    borderBottom: "1px solid #2A3342",
                    background: "#202634",
                  }}
                  data-ocid={`timeline.${track.id}.track`}
                >
                  {hasClip && isVisible && (
                    <div
                      className="absolute top-1 bottom-1 rounded flex items-center px-2 select-none"
                      style={{
                        left: 2,
                        width: totalWidth - 4,
                        background: `${track.color}33`,
                        border: `1px solid ${track.color}88`,
                        cursor: isLocked ? "not-allowed" : "grab",
                      }}
                      data-ocid="timeline.video1.item.1"
                    >
                      <span
                        className="text-xs truncate"
                        style={{ color: track.color, fontSize: 10 }}
                      >
                        {videoName || "Video Clip"}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {duration > 0 && (
              <div
                className="absolute top-0 bottom-0 pointer-events-none z-20"
                style={{ left: playheadX, width: 2 }}
                data-ocid="timeline.playhead"
              >
                <div
                  className="absolute -top-0 left-1/2 -translate-x-1/2 w-0 h-0"
                  style={{
                    borderLeft: "6px solid transparent",
                    borderRight: "6px solid transparent",
                    borderBottom: "8px solid #2F7DFF",
                  }}
                />
                <div
                  className="w-full h-full"
                  style={{ background: "#2F7DFF", opacity: 0.9 }}
                />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
