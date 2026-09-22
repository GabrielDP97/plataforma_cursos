# Live Classes

Real-time synchronous learning sessions. The most complex feature. The most expensive to build and maintain.

---

## Why Live Classes Matter

- Personal connection between instructor and students
- Real-time Q&A and discussion
- Accountability (scheduled time = commitment)
- Community building
- Clarification of difficult concepts

## Why Live Classes Are Dangerous

- **Complexity**: Real-time = race conditions, connection issues, browser compatibility
- **Cost**: Video infrastructure is expensive (bandwidth, storage, compute)
- **Scaling**: 1:many is hard. 1:1000 is very hard.
- **Reliability**: Downtime during live class = terrible experience
- **Support**: Troubleshooting live issues in real-time is stressful

---

## Core Components

### 1. Scheduling

**What gets scheduled:**
- Live class session
- Associated with: instructor, course, date/time, duration
- Optional: recurrence pattern (weekly, biweekly)
- Optional: max attendees

**Scheduling flow (instructor):**
1. Select course
2. Choose date and time
3. Set duration
4. Add title and description
5. Optional: set recurrence
6. Confirm → class appears on calendar

**Scheduling flow (student):**
1. See upcoming live classes on course page
2. See on personal calendar
3. Optional: register for specific session (if limited spots)

### 2. During Class

**Core capabilities:**
- Video/audio from instructor
- Screen sharing from instructor
- Chat text channel
- Student audio (when enabled by instructor)
- Student video (when enabled by instructor)

**Instructor controls:**
- Start/stop class
- Enable/disable student audio/video
- Share screen
- Mute individual students
- End class for everyone

**Student experience:**
- Join class at scheduled time
- Watch instructor's video/screen
- Type in chat
- Ask to speak (raise hand) — POST-MVP
- View other participants

### 3. After Class

- Recording available for replay
- Attendance recorded
- Chat log saved
- Class materials shared (if any)

---

## Live Class Data Model (Functional)

### LiveClass

- Title
- Description
- Associated course
- Instructor (who hosts)
- Scheduled start time
- Scheduled duration (minutes)
- Recurrence pattern (optional)
- Status (scheduled / live / ended / cancelled)
- Recording URL (after class)
- Attendance list

### Attendance

- Student
- LiveClass
- Join time
- Leave time
- Duration attended
- Status (present / absent / late)

### ClassRecording

- LiveClass reference
- Recording URL
- Duration
- Processing status (processing / ready / failed)
- Available to students (yes/no)

---

## MVP Recommendation: NO LIVE CLASSES

**Live classes should NOT be in MVP. Here's why:**

### Reason 1: Complexity

Building a reliable real-time video system is one of the hardest problems in software. Even experienced teams struggle with it. Don't tackle it until the core platform is solid.

### Reason 2: Cost

Video infrastructure (WebRTC, SFU servers, TURN servers, bandwidth) costs thousands per month. For an MVP, that money is better spent on core features.

### Reason 3: Dependency on External Services

No team builds video infrastructure from scratch. You depend on:
- Twilio, Daily.co, Agora, LiveKit, or similar
- Each has different APIs, pricing, limitations
- Integrating one is significant work
- Switching later is expensive

### Reason 4: Validation First

Before investing in live classes, validate that:
- Students actually want courses with live components
- Instructors are willing to teach live
- The core platform delivers value without live classes
- There's demand for synchronous learning

### Reason 5: Simpler Alternatives Exist

- **Asynchronous Q&A** — Students post questions, instructor answers
- **Office hours** — Simple video call link (no platform integration needed)
- **Forum discussions** — Community support
- **Pre-recorded Q&A** — Instructor records answers to common questions

---

## When to Add Live Classes

**Phase 3 or later.** After:
- Core platform is stable
- Content creation flow is proven
- Student engagement is validated
- Revenue model is established
- Infrastructure costs are covered

---

## If You Must Have Live Classes: MVP Minimum

If live classes are absolutely required for MVP (not recommended), here's the absolute minimum:

### MVP Minimum Live Class

**External tool integration, not platform-native:**
1. Instructor creates a live class entry (schedule only)
2. Platform stores the meeting link (provided by external tool)
3. Students see the link on the class page
4. Clicking the link opens the external tool (Zoom, Google Meet, etc.)
5. After class, instructor can mark recording URL (optional)
6. Attendance is manual (instructor marks who attended)

**Why this approach?**
- Minimal platform complexity
- Uses existing reliable tools
- No video infrastructure needed
- Validates demand before building native solution

### What This Does NOT Include

- In-platform video
- In-platform chat
- Screen sharing
- Recording management
- Automatic attendance
- Participant management

---

## Native Live Classes: POST-MVP

When building native live classes, consider:

### Architecture Options

1. **Peer-to-peer (WebRTC)** — Simple, doesn't scale beyond ~4 participants
2. **SFU (Selective Forwarding Unit)** — Standard for 1:many. LiveKit, mediasoup, Janus
3. **MCU (Multipoint Control Unit)** — Traditional, resource-intensive
4. **Third-party service** — Twilio, Daily.co, Agora, Vonage

### Functional Requirements

1. **Reliability** — 99.9% uptime during scheduled classes
2. **Low latency** — Under 500ms for interactive sessions
3. **Scalability** — Support 50+ participants per session
4. **Recording** — Reliable recording with minimal delay
5. **Chat** — Real-time text chat alongside video
6. **Screen sharing** — Instructor can share screen
7. **Quality adaptation** — Adjust to bandwidth constraints

### Cost Considerations

- Bandwidth: ~1GB per hour per participant for video
- Storage: ~500MB per hour for recordings
- Compute: SFU servers for routing
- CDN: For recording delivery

---

## Live Class Accessibility

When live classes are implemented:

- **Captions** — Real-time captions for hearing impaired
- **Recording** — For those who can't attend live
- **Chat** — Alternative to audio for those who prefer text
- **Screen reader** — Chat and controls accessible
- **Low bandwidth mode** — Audio-only option

---

## Alternative: Asynchronous "Live" Experience

Instead of real-time live classes, consider:

1. **Scheduled announcements** — Instructor posts at specific times
2. **Weekly challenges** — Timed exercises that create urgency
3. **Cohort-based progression** — Students move through course together
4. **Discussion deadlines** — Respond to discussion by end of week
5. **Office hours via async** — Instructor answers questions daily

These create the engagement of live classes without the complexity.
