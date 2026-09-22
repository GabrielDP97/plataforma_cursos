# Multi-tenancy Analysis

Do we need it? When would it make sense? Don't introduce by default.

---

## What Is Multi-tenancy?

Multi-tenancy means one platform instance serves multiple organizations (tenants), with data isolation between them.

**Example:** A single platform powers "Code Academy," "Python School," and "Web Dev Bootcamp" — each with their own users, courses, branding, and settings.

---

## Do We Need It?

### For MVP: NO

**Reason 1: Single tenant is simpler**
- One set of users
- One set of courses
- One branding
- One configuration
- Simpler everything

**Reason 2: No business need yet**
- We're building our own academy first
- Not hosting other academies
- No demand for white-labeling

**Reason 3: Premature optimization**
- Adding multi-tenancy later is possible
- Building it now adds unnecessary complexity
- YAGNI (You Aren't Gonna Need It)

### For POST-MVP: MAYBE

Consider multi-tenancy only when:
1. We want to host multiple academies on one platform
2. We want to offer white-label solutions
3. We have paying customers who need isolation
4. The operational cost justifies the complexity

---

## When Would Multi-tenancy Make Sense?

### Scenario 1: Platform as a Service

**What:** Other organizations use our platform to run their academies.

**Example:** A coding bootcamp wants to use our platform for their courses. They want their own branding, their own students, their own courses.

**Multi-tenancy needed:** YES — data isolation required.

**Complexity:** HIGH — every feature must be tenant-aware.

### Scenario 2: White-Label Solution

**What:** We license the platform to other organizations who rebrand it.

**Example:** A university wants to use our platform with their branding.

**Multi-tenancy needed:** YES — separate branding, possibly separate data.

**Complexity:** VERY HIGH — branding, configuration, data isolation.

### Scenario 3: Regional Variations

**What:** Different regions need different configurations (language, currency, compliance).

**Example:** Platform in Brazil vs. platform in Europe.

**Multi-tenancy needed:** MAYBE — could be handled with configuration instead.

**Complexity:** MEDIUM — configuration-based might be simpler.

---

## Multi-tenancy Approaches

### Approach 1: Database per Tenant

**How:** Each tenant has its own database.

**Pros:**
- Complete data isolation
- Easy to backup/restore per tenant
- Simple data deletion

**Cons:**
- High infrastructure cost
- Complex deployment
- Difficult to maintain
- Schema changes affect all tenants

### Approach 2: Schema per Tenant

**How:** Each tenant has its own schema in a shared database.

**Pros:**
- Better resource utilization
- Easier to maintain
- Good data isolation

**Cons:**
- Schema management complexity
- Shared database resources
- Cross-tenant queries difficult

### Approach 3: Tenant ID Column

**How:** All data in shared tables with tenant_id column.

**Pros:**
- Simplest implementation
- Best resource utilization
- Easy to maintain

**Cons:**
- Data isolation by application logic (risky)
- Performance impact (filtering)
- Complex queries
- Hard to debug

### Approach 4: Separate Instances

**How:** Each tenant gets their own platform instance.

**Pros:**
- Complete isolation
- Simplest to implement
- No code changes needed

**Cons:**
- High operational cost
- Difficult to manage at scale
- No shared resources

---

## What Multi-tenancy Affects

### Every Feature Becomes Tenant-Aware

If we implement multi-tenancy, every feature must:
1. Check tenant context
2. Filter data by tenant
3. Apply tenant-specific configuration
4. Respect tenant isolation

**This affects:**
- Authentication (which tenant?)
- User management (users belong to tenants)
- Course management (courses belong to tenants)
- Content (content belongs to tenants)
- Enrollments (enrollments within tenants)
- Progress (progress within tenants)
- Everything

### Data Model Changes

Every entity needs:
- Tenant ID (or tenant reference)
- Tenant-aware queries
- Tenant-aware access control

**Significant change to every data model.**

### Operational Complexity

- Deployment must handle multiple tenants
- Monitoring must be per-tenant
- Support must handle tenant-specific issues
- Billing must track per-tenant usage

---

## Recommendation: Don't Build Multi-tenancy

### For MVP

**Absolutely not.** Build single-tenant. It's simpler, faster, and sufficient.

### For POST-MVP

**Probably not.** Unless there's clear business demand.

### When to Consider

Only when:
1. There's paying demand for multi-tenancy
2. The business model requires it
3. The operational cost is justified
4. Single-tenant is no longer sufficient

### Alternatives to Multi-tenancy

Instead of multi-tenancy, consider:

1. **Multiple instances** — Deploy separate instances for each tenant
2. **Configuration-based** — Use configuration for branding/customization
3. **API-based integration** — Let tenants integrate via API
4. **Partnerships** — Partner with organizations instead of hosting them

These approaches provide flexibility without the complexity of true multi-tenancy.

---

## Impact on Architecture

### If We DON'T Build Multi-tenancy (Recommended)

**Benefits:**
- Simpler data model (no tenant_id everywhere)
- Simpler queries (no tenant filtering)
- Simpler access control (no tenant isolation)
- Simpler deployment (single instance)
- Simpler debugging (no tenant context)
- Faster development (less code)

**Tradeoffs:**
- Can't host multiple organizations on one instance
- Can't white-label without code changes
- Limited scalability for multi-org scenarios

### If We DO Build Multi-tenancy

**Costs:**
- Every entity needs tenant reference
- Every query needs tenant filtering
- Every access control check needs tenant context
- Every feature needs tenant-awareness
- Significant additional complexity
- Slower development
- More bugs (tenant context errors)

**Benefits:**
- Can host multiple organizations
- Can white-label
- Better resource utilization
- Scalable for multi-org scenarios

---

## Conclusion

**Don't build multi-tenancy.** The complexity cost is too high for the benefit. If multi-tenancy is needed later, it can be added. The architecture should be clean enough that adding tenant_id to entities is straightforward.

**Design principle:** Keep entities clean. Don't add tenant_id preemptively. When multi-tenancy is needed, it will be a significant but well-understood refactoring.

**Focus on:** Building a great single-tenant platform first. Multi-tenancy is an optimization for scale, not a requirement for launch.
