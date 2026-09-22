# Lesson Content Model

What a lesson can contain and how content delivery works.

---

## Content Types

A lesson has a primary content type. This determines the default view and player behavior.

| Type | Description | MVP |
|------|-------------|-----|
| **Text** | Rich text content, the primary medium | YES |
| **Video** | Video as the primary content, with optional text | YES |
| **Mixed** | Combination of text, video, and other elements | YES |
| **Exercise** | Programming exercise (see separate model) | NO - POST-MVP |
| **Quiz** | Quiz/assessment (see separate model) | NO - POST-MVP |

---

## Content Blocks

A lesson is composed of content blocks. Each block is one type of content. Blocks are ordered and rendered sequentially.

### Available Block Types

| Block Type | Description | MVP |
|------------|-------------|-----|
| **Rich Text** | Formatted text, headings, lists, bold, italic, links, inline code | YES |
| **Code Snippet** | Syntax-highlighted code block with language selection | YES |
| **Video** | Embedded video player with controls | YES |
| **Image** | Uploaded or linked image with alt text | YES |
| **File Download** | Link to downloadable file (PDF, ZIP, etc.) | YES |
| **External Link** | Clickable link to external resource | YES |
| **Embedded Content** | Iframe or embed from external service (CodePen, etc.) | POST-MVP |

### Why Block-Based?

- **Flexibility**: Instructors compose lessons from blocks, not rigid templates.
- **Simplicity**: Each block has one purpose. No complex nested structures.
- **Extensibility**: New block types can be added without changing existing ones.
- **Preview**: Blocks can be individually previewed during creation.

---

## Content Fields Per Block

### Rich Text Block
- Formatted text content
- Supports: headings, paragraphs, bold, italic, underline, lists (ordered/unordered), links, inline code, blockquotes, horizontal rule

### Code Snippet Block
- Code content (raw text)
- Programming language (for syntax highlighting)
- Optional: filename label, whether to show line numbers

### Video Block
- Video reference (uploaded file or external URL)
- Title/label
- Auto-play preference
- Associated timestamp markers (optional)

### Image Block
- Image reference (uploaded file or URL)
- Alt text (accessibility)
- Caption (optional)
- Size hint (small/medium/full-width)

### File Download Block
- File reference
- Display name
- File size (auto-detected)

### External Link Block
- URL
- Display text
- Description (optional)

---

## Lesson Completeness

A lesson is "complete" when the student has satisfied ALL of the following:

1. **Viewed all content blocks** — The student has scrolled through or played all content. Auto-detected via scroll/video progress.
2. **Completed any required interactions** — If the lesson has an exercise or quiz, the student must submit. (POST-MVP)
3. **Marked as complete** — Manual confirmation button the student clicks.

### Why Both Auto and Manual?

- **Auto-detection** prevents marking complete without engagement (e.g., just clicking through).
- **Manual confirmation** gives students agency and ensures they consciously acknowledge completion.
- **Combination** is the standard in quality LMS platforms.

---

## Video Within Lessons

Video is a first-class citizen. Covered in detail in the Video Model.

Key functional points:
- Video progress is tracked independently
- Resume from last position
- Video completion = watched sufficient percentage (configurable, default 90%)
- Subtitles/captions supported

---

## Code Snippets in Lessons

Critical for a programming platform.

- **Syntax highlighting** for all major programming languages
- **Copy to clipboard** button
- **Line numbers** (optional)
- **Filename display** (optional, e.g., "main.py")
- **Run in editor** (POST-MVP — links to code editor)

---

## Content Editing

Instructors compose lessons using a block-based editor.

**MVP editing capabilities:**
- Add/remove/reorder blocks
- Write rich text with formatting toolbar
- Upload files for video/image/file blocks
- Paste code for code blocks
- Add URLs for links/embeds
- Preview lesson as student would see it

**POST-MVP editing:**
- Markdown support as alternative to rich text
- Collaborative editing (multiple instructors)
- Version history
- Templates for common lesson structures
- Drag-and-drop file upload

---

## Content Rendering

Students view lessons in a clean, focused reader.

**MVP rendering:**
- Blocks rendered in order
- Video player with standard controls
- Code blocks with syntax highlighting
- Images responsive to screen size
- Download links functional
- Clean, distraction-free layout

**POST-MVP rendering:**
- Dark mode for code-heavy content
- Customizable reading width
- Keyboard navigation between blocks
- Print/export to PDF
