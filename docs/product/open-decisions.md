# Decisions Needing Human Approval

Table format. Each decision with options, recommendation, and impact.

---

## Decisions

| DECISION | OPTIONS | RECOMMENDATION | WHY | IMPACT | NEEDS HUMAN APPROVAL |
|----------|---------|----------------|-----|--------|----------------------|
| **Business Model** | A: Own Academy, B: Internal Instructors, C: Marketplace | Model A → Model B | Start simple, validate, then scale | Affects user roles, complexity, growth | YES |
| **Live Classes in MVP** | Yes, No | No | Too complex, too expensive, unvalidated | Saves months of development | YES |
| **Assignments in MVP** | Yes, No | No | Can launch without, validate course content first | Simplifies MVP significantly | YES |
| **Quizzes in MVP** | Yes, No | No | Can launch without, validate demand first | Simplifies MVP significantly | YES |
| **Code Editor** | In-platform, External only | External only (Level 1) | Simple, real-world workflow, validates demand | Affects exercise complexity | YES |
| **Automatic Code Execution** | Yes, No | No (Level 1-2) | Complex, risky, expensive, unvalidated | Saves infrastructure complexity | YES |
| **Payments in MVP** | Yes, No | No | Free courses validate demand first | Eliminates financial complexity | YES |
| **Subscriptions** | Yes, No | No | Too complex for MVP | Simplifies payment model | YES |
| **Certificates** | Yes, No | No | No meaningful completion criteria yet | Simplifies MVP | YES |
| **AI Features** | In MVP, Later | Later | No data, no demand, expensive | Saves AI complexity | YES |
| **Calendar** | In MVP, Later | Later | No events to show in MVP | Simplifies MVP | YES |
| **Comments/Discussion** | In MVP, Later | Later | Can launch without, validate need first | Simplifies communication | YES |
| **Direct Messages** | In MVP, Later | Later | Can launch without | Simplifies communication | YES |
| **User Roles** | 2 (Student/Admin), 3 (Student/Instructor/Admin) | 3 roles | Instructor role essential for content creation | Affects all user flows | YES |
| **Course Categories** | Flat, Hierarchical | Flat initially | Simpler, hierarchical adds complexity | Affects course organization | YES |
| **Content Editor** | Rich text, Markdown, Both | Rich text | Easier for non-technical instructors | Affects content creation UX | YES |
| **Video Hosting** | Self-hosted, Third-party | Third-party | Simpler, more reliable, scalable | Affects video infrastructure | YES |
| **File Storage** | Local, Cloud | Cloud | Scalable, reliable, CDN-ready | Affects file management | YES |

---

## Decision Details

### Business Model

**Options:**
- **A: Own Academy** — We publish all courses
- **B: Internal Instructors** — Multiple teachers, same org
- **C: Marketplace** — External teachers publish/sell

**Recommendation:** Start with A, evolve to B.

**Why:**
- A is simplest to build and validate
- B adds instructor tools but keeps quality control
- C requires moderation infrastructure we don't have
- Validate demand before scaling content creation

**Impact:** Affects user roles, content management, payments, quality control.

---

### Live Classes in MVP

**Options:**
- **Yes** — Include live class scheduling and basic integration
- **No** — Skip entirely, add in POST-MVP

**Recommendation:** No.

**Why:**
- Live video is one of the hardest problems in software
- Requires external service integration
- Expensive infrastructure
- Unvalidated demand (do students want live classes?)
- Better to validate core platform first

**Impact:** Saves months of development. Delays real-time features.

---

### Assignments in MVP

**Options:**
- **Yes** — Include exercise creation and submission
- **No** — Skip, add in POST-MVP

**Recommendation:** No.

**Why:**
- Assignments require review workflow
- Students can still learn without formal assignments
- Validate course content effectiveness first
- Instructor workflow can be simpler initially

**Impact:** Simplifies instructor and student workflows significantly.

---

### Code Editor

**Options:**
- **In-platform** — Code editor built into the platform
- **External only** — Students work in their own IDE

**Recommendation:** External only (Level 1).

**Why:**
- Simpler to build
- Real-world workflow (developers use local IDEs)
- No editor integration complexity
- Validates demand before investing

**Impact:** Students work outside platform for exercises.

---

### Automatic Code Execution

**Options:**
- **Yes** — Run student code in sandboxed environment
- **No** — Students run code locally

**Recommendation:** No (Level 1-2).

**Why:**
- Sandboxed execution is complex and risky
- Security concerns (malicious code)
- Resource-intensive
- Expensive infrastructure
- Unvalidated need

**Impact:** No in-browser code execution. Students run locally.

---

### Payments in MVP

**Options:**
- **Yes** — Include payment processing
- **No** — Start with free courses only

**Recommendation:** No.

**Why:**
- Free courses validate demand without financial friction
- Payment systems require legal/compliance infrastructure
- Better to prove platform value before monetizing
- Simplifies MVP dramatically

**Impact:** No revenue initially. Focus on user acquisition.

---

### Certificates

**Options:**
- **Yes** — Generate certificates on course completion
- **No** — Skip, add in POST-MVP

**Recommendation:** No.

**Why:**
- No meaningful completion criteria yet (no exercises/quizzes)
- Certificate for watching videos isn't meaningful
- Design work better spent elsewhere
- Can show completion status without formal certificates

**Impact:** No formal credentials initially.

---

### User Roles

**Options:**
- **2 roles** — Student + Admin (instructors are admins)
- **3 roles** — Student + Instructor + Admin

**Recommendation:** 3 roles.

**Why:**
- Instructor role is essential for content creation
- Separates concerns clearly
- Instructors need different permissions than admins
- Standard for LMS platforms

**Impact:** Affects all user management and access control.

---

### Content Editor

**Options:**
- **Rich text** — WYSIWYG editor
- **Markdown** — Text-based formatting
- **Both** — Support both

**Recommendation:** Rich text.

**Why:**
- Easier for non-technical instructors
- Visual feedback during editing
- Lower learning curve
- Markdown can be added later if needed

**Impact:** Affects content creation UX.

---

## Decision Timeline

### Before MVP Development

1. Business Model (A → B)
2. User Roles (3 roles)
3. Live Classes (No)
4. Assignments (No)
5. Quizzes (No)
6. Payments (No)
7. Code Editor (External only)
8. Code Execution (No)
9. Certificates (No)

### During MVP Development

10. Content Editor (Rich text)
11. Course Categories (Flat)
12. Video Hosting (Third-party)
13. File Storage (Cloud)

### After MVP Launch

14. AI Features (Later)
15. Calendar (Later)
16. Comments/Discussion (Later)
17. Direct Messages (Later)
18. Subscriptions (Later)
