# FX Video Editor

## Current State
New project, no existing application files.

## Requested Changes (Diff)

### Add
- Video upload functionality (upload local video files)
- Video preview player with playback controls (play/pause, scrub, timecode, volume)
- Special effects panel with categorized visual effects: Cinematic (Teal & Orange, Moody, Film Grain), Glitch (VHS Noise, RGB Split, Scanlines), Transitions (Dissolve, Crossfade, Wipe)
- Real-time effect preview applied to video using Canvas API and WebGL filters
- Multi-layer timeline at bottom showing video/audio tracks with colored clip blocks
- Media library sidebar for uploaded files
- Effects applied via CSS filters and Canvas 2D transforms on video frames
- Export/download edited video (canvas-recorded output)
- Project persistence: store uploaded video metadata and applied effects in backend

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: store project data (video references, applied effects list, project name/timestamp)
2. Frontend: 3-column layout — Media Library (left), Video Preview + Canvas (center), Effects Panel (right), Timeline (bottom)
3. Video playback via HTML5 <video> element + Canvas frame rendering for effects
4. Apply effects using CSS filter strings and Canvas pixel manipulation
5. Timeline shows uploaded clips with colored blocks
6. Export via MediaRecorder API capturing canvas stream
7. Blob storage integration for video file uploads
