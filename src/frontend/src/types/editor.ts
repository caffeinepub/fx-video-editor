export interface EffectConfig {
  id: string;
  name: string;
  category: "cinematic" | "glitch" | "transitions";
  filter: string;
  special?:
    | "filmgrain"
    | "vhs"
    | "rgbsplit"
    | "scanlines"
    | "wipe"
    | "dissolve";
  swatch: string;
  description: string;
}

export interface VideoFile {
  id: string;
  name: string;
  src: string;
  duration: number;
  thumbnail: string;
}

export const EFFECTS: EffectConfig[] = [
  // Cinematic
  {
    id: "teal-orange",
    name: "Teal & Orange",
    category: "cinematic",
    filter: "sepia(0.3) saturate(1.5) hue-rotate(10deg) contrast(1.1)",
    swatch: "#2dd4bf",
    description: "Hollywood blockbuster color grade",
  },
  {
    id: "moody",
    name: "Moody",
    category: "cinematic",
    filter: "brightness(0.8) contrast(1.3) saturate(0.7)",
    swatch: "#6b7280",
    description: "Dark cinematic atmosphere",
  },
  {
    id: "film-grain",
    name: "Film Grain",
    category: "cinematic",
    filter: "none",
    special: "filmgrain",
    swatch: "#d97706",
    description: "Classic analog film texture",
  },
  // Glitch
  {
    id: "vhs-noise",
    name: "VHS Noise",
    category: "glitch",
    filter: "none",
    special: "vhs",
    swatch: "#84cc16",
    description: "Retro VHS tape distortion",
  },
  {
    id: "rgb-split",
    name: "RGB Split",
    category: "glitch",
    filter: "none",
    special: "rgbsplit",
    swatch: "#f43f5e",
    description: "Chromatic aberration effect",
  },
  {
    id: "scanlines",
    name: "Scanlines",
    category: "glitch",
    filter: "none",
    special: "scanlines",
    swatch: "#8b5cf6",
    description: "CRT monitor scanline overlay",
  },
  // Transitions
  {
    id: "dissolve",
    name: "Dissolve",
    category: "transitions",
    filter: "none",
    special: "dissolve",
    swatch: "#3b82f6",
    description: "Soft opacity fade",
  },
  {
    id: "crossfade",
    name: "Crossfade",
    category: "transitions",
    filter: "brightness(0.6) opacity(0.8)",
    swatch: "#06b6d4",
    description: "Gradual luminance crossfade",
  },
  {
    id: "wipe",
    name: "Wipe",
    category: "transitions",
    filter: "none",
    special: "wipe",
    swatch: "#f59e0b",
    description: "Left-to-right reveal wipe",
  },
];

export const EFFECT_CATEGORIES = [
  { id: "cinematic", label: "Cinematic" },
  { id: "glitch", label: "Glitch" },
  { id: "transitions", label: "Transitions" },
] as const;
