# AI Agent Team — plataforma_cursos

## Architecture

```
                    USER
                      │
                      ▼
             GENTLE ORCHESTRATOR
                      │
          ┌───────────┼───────────────────────────┐
          │           │                           │
          ▼           ▼                           ▼
      SDD AGENTS   ENGINEERING                 MARKETING
          │           │                           │
          │     ┌─────┼─────┬─────┐        ┌─────┼─────┐
          │     │     │     │     │        │     │     │
          │    code  test  doc  sec    X    IG    TT    YT
          │    -rev  -ing  -um  -audit  mkt  mkt  mkt  mkt
          │     │     │     │     │
          │    db   perf  deploy uiux
          │                    │
          │                  api
          │                  design
          │                    │
          │                 refact
          │
          ▼
    sdd-explore
    sdd-propose
    sdd-spec
    sdd-design
    sdd-tasks
    sdd-apply
    sdd-verify
    sdd-archive
    sdd-init
    sdd-onboard
```

## Gentle Orchestrator

The orchestrator is the primary agent. It:
- Receives user requests
- Routes to the appropriate specialist or SDD phase
- Manages delegation and context
- Never does work inline (coordinates only)

## SDD Agents

Spec-Driven Development agents handle the structured planning and implementation pipeline:

| Phase | Purpose |
|-------|---------|
| `sdd-init` | Bootstrap project context and testing capabilities |
| `sdd-explore` | Investigate ideas before committing |
| `sdd-propose` | Create change proposals |
| `sdd-spec` | Write delta specifications |
| `sdd-design` | Create technical designs |
| `sdd-tasks` | Break down into implementation tasks |
| `sdd-apply` | Implement code changes |
| `sdd-verify` | Validate implementation against specs |
| `sdd-archive` | Close and persist change state |
| `sdd-onboard` | Guided walkthrough of SDD cycle |

## Engineering Specialists

| Agent | Responsibility | Read | Write | Execute |
|-------|---------------|------|-------|---------|
| `code-review` | Independent code review | ✅ | ❌ | ❌ |
| `testing` | Test design and implementation | ✅ | ✅ | ✅ |
| `documentation` | Project documentation | ✅ | ✅ | ❌ |
| `security-audit` | Security vulnerability analysis | ✅ | ❌ | ❌ |
| `database` | Data modeling and optimization | ✅ | ✅ | ✅ |
| `performance` | Performance profiling and optimization | ✅ | ✅ | ✅ |
| `deployment-release` | CI/CD and release management | ✅ | ✅ | ✅ |
| `ui-ux` | UI/UX design and review | ✅ | ✅ | ❌ |
| `api-design` | API contract design | ✅ | ✅ | ❌ |
| `refactoring` | Code structure improvement | ✅ | ✅ | ✅ |

## Marketing Specialists

All marketing agents operate in **DRAFT MODE**:
- CAN: research, ideate, write content, create calendars
- CANNOT: publish, schedule, delete, modify accounts

| Agent | Platform | Content Types |
|-------|----------|---------------|
| `x-marketing` | X (Twitter) | Posts, threads, launches |
| `instagram-marketing` | Instagram | Posts, carousels, reels, stories |
| `tiktok-marketing` | TikTok | Vertical video scripts, hooks |
| `youtube-marketing` | YouTube | Video ideas, scripts, shorts |

### DRAFT vs EXECUTION Mode

**DRAFT MODE** (current):
- Content creation and ideation
- Calendar planning
- Script writing
- Metadata preparation

**EXECUTION MODE** (future):
- Requires official API integration
- X API, Meta/Instagram API, TikTok API, YouTube Data API
- No browser automation when official APIs exist

## Skills

Each agent has a corresponding skill in `.opencode/skills/`:

```
.opencode/skills/
├── code-review/SKILL.md
├── testing/SKILL.md
├── documentation/SKILL.md
├── security-audit/SKILL.md
├── database/SKILL.md
├── performance/SKILL.md
├── deployment-release/SKILL.md
├── ui-ux/SKILL.md
├── api-design/SKILL.md
├── refactoring/SKILL.md
├── x-marketing/SKILL.md
├── instagram-marketing/SKILL.md
├── tiktok-marketing/SKILL.md
└── youtube-marketing/SKILL.md
```

## Skill Registry

Skills are indexed in `.atl/skill-registry.md` via `gentle-ai skill-registry refresh`.

The registry is an **index** — not a summary. Delegators pass exact `SKILL.md` paths to sub-agents.

## Permissions (Minimum Privilege)

Agents follow the principle of least privilege:
- `code-review`: READ only
- `security-audit`: READ only
- `testing`: READ + WRITE + EXECUTE
- `documentation`: READ + WRITE
- `database`: READ + WRITE
- `performance`: READ + WRITE + EXECUTE
- `deployment-release`: READ + WRITE (no prod deploy without auth)
- `ui-ux`: READ + WRITE
- `api-design`: READ + WRITE
- `refactoring`: READ + WRITE + EXECUTE
- Marketing: READ + WRITE (draft content only)

## Collaboration Patterns

```
api-design
 ├── security-audit
 └── testing

database
 ├── performance
 └── security-audit

refactoring
 └── testing

deployment-release
 ├── testing
 ├── security-audit
 └── documentation

youtube-marketing
       ↓
 ┌─────┼──────┐
 ↓     ↓      ↓
TikTok Instagram X
```

## How to Create a New Agent

1. Create `.opencode/agents/{name}.md` with description, mode, prompt, and tools
2. Create `.opencode/skills/{name}/SKILL.md` with frontmatter and sections
3. Add agent entry to `opencode.json` under `agent` section
4. Add delegation permission to `gentle-orchestrator` permissions
5. Run `gentle-ai skill-registry refresh` to update the registry
6. Verify with `tools/verify-ai-agents.ps1`

## How to Modify an Existing Agent

1. Edit the agent file in `.opencode/agents/{name}.md`
2. Edit the skill file in `.opencode/skills/{name}/SKILL.md`
3. Update `opencode.json` if permissions changed
4. Run `gentle-ai skill-registry refresh` if skill changed

## How to Verify Gentle Detects Agents

1. Run `tools/verify-ai-agents.ps1` for full validation
2. Check `.atl/skill-registry.md` for skill entries
3. Test delegation routing with smoke test prompts

## SDD Integration

Specialists complement SDD phases, not replace them:

```
sdd-design + api-design + database + ui-ux + security-audit
    ↓
sdd-apply + necessary specialists
    ↓
sdd-verify + testing + code-review + security-audit
```

Specialists are NOT mandatory SDD phases. They are invoked when their expertise adds value.
