# Video Model

Functional video handling for programming courses.

---

## Video as Primary Content

Video is the dominant content type in online courses. A programming platform must handle video well.

---

## Video Per Lesson

Each lesson can have one primary video. This is the main content delivery mechanism.

**Why one video per lesson?**
- Keeps lessons focused (5-20 minutes is ideal)
- Simplifies progress tracking (one video = one completion criteria)
- Reduces complexity in the player
- Encourages instructors to break content into digestible chunks

**What if a lesson needs multiple videos?**
Split into multiple lessons. A lesson with 3 videos is really 3 lessons.

---

## Video Metadata

Every video has associated metadata:

| Field | Description | MVP |
|-------|-------------|-----|
| Duration | Total length in seconds | YES |
| Thumbnail | Auto-generated or custom image | YES |
| Title | Video title | YES |
| Description | Optional description | POST-MVP |
| Quality variants | Multiple resolutions available | YES |
| Subtitles | Available subtitle tracks | YES |

---

## Video Progress Tracking

**Core requirement:** Track how much of a video the student has watched.

### Progress Data Per Video

- **Current position** — Where the student left off (in seconds)
- **Total watched** — Cumulative seconds watched
- **Percentage watched** — total watched / duration
- **Last watched at** — Timestamp of last viewing session

### Resume from Last Position

When a student returns to a video:
1. Platform loads their last position
2. Video starts from that position
3. "Continue from where you left off" prompt (optional)

**Why this matters:** Students don't always finish in one sitting. Resume is essential for retention.

### Completion Detection

A video is considered "completed" when:
- Student has watched at least 90% of total duration (configurable)
- OR student has reached the end of the video

**Why 90% not 100%?** Students often skip the last few seconds (outro, preview of next lesson). Requiring 100% creates unnecessary friction.

---

## Video Playback

### Player Capabilities

**MVP:**
- Play/pause
- Seek (scrubbing through timeline)
- Volume control
- Fullscreen mode
- Playback speed (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x)
- Progress bar showing watched portion
- Time display (current / total)
- Keyboard shortcuts (space=play/pause, arrows=seek)

**POST-MVP:**
- Picture-in-picture
- Chromecast support
- Keyboard shortcut overlay
- Chapter markers (in-video navigation)
- Quality selector (auto/1080p/720p/480p)

**FUTURE:**
- Interactive video (code popups within video)
- Annotation system
- Collaborative notes on video

---

## Subtitles

Subtitles are critical for accessibility and non-native speakers.

**MVP:**
- Upload subtitle files (SRT, VTT)
- Display subtitles during playback
- Toggle subtitles on/off
- One subtitle track per language

**POST-MVP:**
- Multiple subtitle tracks (languages)
- Auto-generated subtitles (via speech-to-text)
- Subtitle styling (font, size, color)

---

## Video Thumbnails

First thing students see. Must be clear and informative.

**MVP:**
- Auto-generated from video at specific timestamp
- Custom upload by instructor
- Displayed in lesson list and course player

**POST-MVP:**
- Auto-generated options (multiple frames to choose from)
- AI-suggested thumbnail

---

## Associated Resources

Each video can have resources associated with it.

**Resources shown alongside video:**
- Code files used in the lesson
- Slide decks
- Reference documents
- Links to external resources
- Exercise files (if lesson has an exercise)

**Display:** Resources panel next to or below the video player. Students can download while watching.

---

## Video Quality

Students need smooth playback on various connections.

**MVP:**
- Adaptive streaming (quality adjusts to bandwidth)
- Minimum quality: 360p
- Maximum quality: 1080p (or 4K if provided)
- Auto-quality selection

**POST-MVP:**
- Manual quality selector
- Bandwidth indicator
- Data saver mode

---

## Video Accessibility

- **Keyboard navigation** — All player controls accessible via keyboard
- **Screen reader support** — Player controls have proper labels
- **Subtitles** — As described above
- **Transcript** — POST-MVP: Auto-generated text transcript displayed alongside video

---

## Video in Course Context

### In the Course Player
- Video is the main content area
- Resources panel on the side
- Navigation (prev/next lesson) at bottom
- Progress indicator in header

### In the Course Builder
- Instructor uploads video
- Preview before publishing
- Replace video without losing progress data

### In the Catalog
- Thumbnail displayed
- Duration shown
- Preview clip (first 30 seconds) — POST-MVP

---

## Video Hosting (Functional Requirements)

These are functional requirements, not technology choices.

1. **Videos must stream** — Not download-then-play. Progressive/streaming playback.
2. **Videos must be fast** — CDN-backed delivery. No buffering on standard connections.
3. **Videos must be secure** — No direct URLs. Authentication required. Prevent downloading (or make it difficult).
4. **Videos must be reliable** — 99.9% uptime. No random failures.
5. **Videos must be affordable** — Storage and bandwidth costs must be predictable.
