import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Clock,
  Film,
  FolderOpen,
  Music,
  Search,
  Sparkles,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import type { VideoFile } from "../types/editor";

interface MediaLibraryProps {
  videos: VideoFile[];
  activeVideoId: string | null;
  onUpload: (file: File) => void;
  onSelect: (video: VideoFile) => void;
  uploadProgress?: number;
}

const FOLDERS = [
  { id: "media", label: "Media", icon: Film, count: 0 },
  { id: "audio", label: "Audio", icon: Music, count: 0 },
  { id: "effects", label: "Effects", icon: Sparkles, count: 9 },
];

// Suppress unused import warning - FolderOpen used as fallback
const _FolderOpen = FolderOpen;

function formatDuration(secs: number) {
  if (!secs || Number.isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MediaLibrary({
  videos,
  activeVideoId,
  onUpload,
  onSelect,
  uploadProgress,
}: MediaLibraryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [activeFolder, setActiveFolder] = useState("media");

  const filtered = videos.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = "";
  };

  return (
    <aside
      className="flex flex-col h-full"
      style={{
        background: "#1A1F27",
        borderRight: "1px solid #2A3342",
        width: 240,
        minWidth: 200,
        maxWidth: 280,
      }}
      data-ocid="media_library.panel"
    >
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "#A6AFBF" }}
          >
            Media Library
          </span>
          <Button
            size="sm"
            className="h-6 px-2 text-xs"
            style={{ background: "#2F7DFF", color: "white", border: "none" }}
            onClick={() => fileInputRef.current?.click()}
            data-ocid="media_library.upload_button"
          >
            <Upload className="w-3 h-3 mr-1" />
            Upload
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        <div className="relative">
          <Search
            className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3"
            style={{ color: "#A6AFBF" }}
          />
          <Input
            placeholder="Search media..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 pl-7 text-xs border-0"
            style={{ background: "#0F1115", color: "#E6EAF2" }}
            data-ocid="media_library.search_input"
          />
        </div>
      </div>

      <div className="px-2 pb-2 flex flex-col gap-0.5">
        {FOLDERS.map((folder) => (
          <button
            key={folder.id}
            type="button"
            onClick={() => setActiveFolder(folder.id)}
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors w-full text-left",
              activeFolder === folder.id ? "text-white" : "hover:bg-white/5",
            )}
            style={
              activeFolder === folder.id
                ? { background: "#2F7DFF22", color: "#2F7DFF" }
                : { color: "#A6AFBF" }
            }
            data-ocid={`media_library.${folder.id}.tab`}
          >
            <folder.icon className="w-3.5 h-3.5" />
            <span className="flex-1">{folder.label}</span>
            {folder.count > 0 && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: "#2A3342", color: "#A6AFBF" }}
              >
                {folder.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={{ borderTop: "1px solid #2A3342" }} />

      {uploadProgress !== undefined &&
        uploadProgress > 0 &&
        uploadProgress < 100 && (
          <div className="px-3 py-2">
            <div
              className="flex items-center justify-between text-xs mb-1"
              style={{ color: "#A6AFBF" }}
            >
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-1 rounded-full" style={{ background: "#2A3342" }}>
              <div
                className="h-1 rounded-full transition-all"
                style={{ background: "#2F7DFF", width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

      <ScrollArea className="flex-1">
        <div className="p-2">
          {activeFolder === "media" ? (
            filtered.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center gap-2 py-8 text-center"
                data-ocid="media_library.empty_state"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "#2A3342" }}
                >
                  <Film className="w-5 h-5" style={{ color: "#A6AFBF" }} />
                </div>
                <p className="text-xs" style={{ color: "#A6AFBF" }}>
                  No videos yet
                </p>
                <p className="text-xs" style={{ color: "#4a5568" }}>
                  Click Upload to add media
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                {filtered.map((video, i) => (
                  <button
                    key={video.id}
                    type="button"
                    onClick={() => onSelect(video)}
                    className={cn(
                      "relative rounded-lg overflow-hidden aspect-video transition-all group",
                      activeVideoId === video.id
                        ? "outline outline-2 outline-blue-500"
                        : "hover:outline hover:outline-1 hover:outline-white/20",
                    )}
                    data-ocid={`media_library.item.${i + 1}`}
                  >
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: "#2A3342" }}
                      >
                        <Film
                          className="w-4 h-4"
                          style={{ color: "#A6AFBF" }}
                        />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div
                      className="absolute bottom-1 right-1 flex items-center gap-0.5 px-1 py-0.5 rounded text-xs"
                      style={{ background: "rgba(0,0,0,0.7)", color: "white" }}
                    >
                      <Clock className="w-2.5 h-2.5" />
                      <span>{formatDuration(video.duration)}</span>
                    </div>
                    {activeVideoId === video.id && (
                      <div
                        className="absolute top-1 left-1 w-2 h-2 rounded-full"
                        style={{ background: "#2F7DFF" }}
                      />
                    )}
                  </button>
                ))}
              </div>
            )
          ) : (
            <div
              className="flex flex-col items-center justify-center gap-2 py-8"
              data-ocid={`media_library.${activeFolder}.empty_state`}
            >
              <p className="text-xs" style={{ color: "#A6AFBF" }}>
                No {activeFolder} files
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      <div
        className="px-3 py-2 text-xs"
        style={{ borderTop: "1px solid #2A3342", color: "#4a5568" }}
      >
        {videos.length} video{videos.length !== 1 ? "s" : ""} loaded
      </div>
    </aside>
  );
}
