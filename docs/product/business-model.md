# Business Model Comparison

Three models. Each affects platform complexity differently.

---

## Model A: Own Academy

### Description

Only we publish courses. The platform is our academy. We control all content.

### How It Works

- We create courses (or hire instructors as contractors)
- Students enroll and pay us
- We handle everything: content, marketing, support
- Instructors are employees or contractors, not platform users

### Complexity Impact

| Aspect | Complexity | Why |
|--------|------------|-----|
| User roles | LOW | Only students + admins. No instructor role needed. |
| Content management | LOW | We control the CMS. No public-facing builder. |
| Payments | LOW | Simple: student pays us. No revenue sharing. |
| Quality control | LOW | We ensure quality before publishing. No moderation needed. |
| Support | LOW | We support our own courses. Known content. |
| Growth | LOW | Linear: hire more instructors, create more courses. |

### Advantages

- **Full control** — Quality, branding, pricing
- **Simple architecture** — Fewer user types, simpler flows
- **No moderation** — We publish everything
- **Clear accountability** — We're responsible for content
- **Faster to build** — Less complexity

### Disadvantages

- **Limited content** — constrained by our team size
- **Limited revenue** — can't scale without hiring
- **No network effects** — growth is linear
- **High fixed costs** — instructors are salaries
- **Risk** — if courses don't sell, we eat the cost

### When This Makes Sense

- Starting out, validating the platform
- Small team, limited resources
- Focus on quality over quantity
- Niche topic with dedicated audience

---

## Model B: Internal Instructors

### Description

Multiple instructors work for us. They create courses on our platform. We manage them.

### How It Works

- We hire/contract instructors
- Instructors create courses using the platform
- We review and approve content
- Revenue shared between platform and instructor
- We handle marketing, support, infrastructure

### Complexity Impact

| Aspect | Complexity | Why |
|--------|------------|-----|
| User roles | MEDIUM | Need instructor role with course management |
| Content management | MEDIUM | Instructor-facing course builder |
| Payments | MEDIUM | Revenue sharing, instructor payouts |
| Quality control | MEDIUM | Review process before publishing |
| Support | MEDIUM | Support instructors AND students |
| Growth | MEDIUM | Can scale by adding instructors |

### Advantages

- **More content** — multiple creators
- **Scalable** — add instructors to add courses
- **Diverse expertise** — different instructors, different topics
- **Shared risk** — instructors invested in their courses
- **Revenue sharing** — incentivizes quality

### Disadvantages

- **Quality inconsistency** — different instructors, different standards
- **Management overhead** — coordinating instructors
- **Higher complexity** — instructor tools, payouts, moderation
- **Instructor churn** — instructors may leave
- **Brand risk** — instructor reflects on platform

### When This Makes Sense

- Validated platform with demand
- Need more content than team can produce
- Want diverse perspectives
- Can manage instructor relationships

---

## Model C: Marketplace

### Description

External instructors publish and sell courses. Platform is a marketplace. We take a commission.

### How It Works

- Anyone can sign up as instructor
- Instructors create and publish courses
- Platform reviews content (or not)
- Students browse and purchase
- Revenue shared (platform takes commission)
- Platform handles infrastructure, payments, discovery

### Complexity Impact

| Aspect | Complexity | Why |
|--------|------------|-----|
| User roles | HIGH | Instructor role, admin moderation, support |
| Content management | HIGH | Public course builder, submission, review |
| Payments | HIGH | Complex payments, revenue sharing, payouts, refunds |
| Quality control | HIGH | Moderation, reviews, content policies |
| Support | HIGH | Support students, instructors, and handle disputes |
| Growth | HIGH | Can scale infinitely, but so can problems |

### Advantages

- **Unlimited content** — anyone can create
- **Network effects** — more instructors → more courses → more students → more instructors
- **Low fixed costs** — instructors bear creation costs
- **Marketplace dynamics** — competition improves quality
- **Revenue scale** — commission on every sale

### Disadvantages

- **Quality control nightmare** — can't ensure quality at scale
- **Moderation burden** — spam, low-quality, inappropriate content
- **Complex payments** — payouts, refunds, disputes, taxes
- **Support burden** — thousands of instructors needing help
- **Brand dilution** — bad courses hurt platform reputation
- **Race to the bottom** — price competition kills quality

### When This Makes Sense

- Proven platform with significant traffic
- Strong moderation infrastructure
- Legal/financial infrastructure for payouts
- Community management capabilities
- Can afford quality control at scale

---

## Complexity Comparison

| Aspect | Model A | Model B | Model C |
|--------|---------|---------|---------|
| User types | 2 | 3 | 3+ |
| Content creation | Internal | Internal team | Public |
| Payment complexity | None | Revenue sharing | Marketplace |
| Quality control | Internal review | Instructor review | Public moderation |
| Support scope | Students | Students + instructors | Everyone |
| Scalability | Linear | Linear+ | Exponential |
| Time to build | Weeks | Months | Months+ |
| Operational cost | High (salaries) | Medium | Low (but support costs) |

---

## Recommendation: Model A → Model B

### Start with Model A (Own Academy)

**Why:**
1. **Fastest to build** — Fewest features, simplest flows
2. **Quality controlled** — We ensure every course is excellent
3. **Validate demand** — Do students want these courses?
4. **Learn the platform** — Find bugs, improve UX before opening up
5. **Build reputation** — Establish brand before marketplace

### Evolve to Model B (Internal Instructors)

**When:**
1. Platform is stable and proven
2. Demand exceeds our content creation capacity
3. We have quality control processes
4. We can manage instructor relationships
5. Revenue supports instructor payouts

**Why not jump to Model C?**
- Marketplace requires significant moderation infrastructure
- Quality control at scale is expensive
- Support burden grows exponentially
- Brand risk from unknown instructors
- Legal/financial complexity of payouts

### Consider Model C (Marketplace) Only When:

- Platform has strong brand recognition
- Significant traffic and user base
- Automated quality control systems
- Robust moderation infrastructure
- Legal/financial infrastructure for global payouts
- Community management capabilities

**Estimated timeline:** Model A (MVP) → Model B (Phase 3-4) → Model C (Phase 6+, if ever)

---

## Hybrid Considerations

### Model A + B Hybrid

Start with own courses, gradually invite select instructors. Best of both worlds:
- Control quality while scaling content
- Test instructor model with limited risk
- Build instructor tools incrementally

### Why Not Full Marketplace?

Marketplaces are tempting but dangerous:
- **Winner-take-all dynamics** — Top instructors dominate, rest struggle
- **Platform becomes commodity** — Just a hosting service
- **Race to the bottom** — Price competition kills quality
- **Moderation costs** — Staff needed to review content
- **Support explosion** — Thousands of instructors need help

**Better to be a premium academy than a commodity marketplace.**
