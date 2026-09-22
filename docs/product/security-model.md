# Threat Model (Security Audit)

LMS-specific threats. Classified by priority.

---

## Threat Classification

### Priority Levels

| Priority | Description | Response |
|----------|-------------|----------|
| **CRITICAL** | Immediate security risk. Must be prevented. | Fix before launch |
| **HIGH** | Significant risk. Should be prevented. | Fix in MVP |
| **MEDIUM** | Moderate risk. Can be addressed post-launch. | Fix in POST-MVP |
| **LOW** | Minor risk. Address when practical. | Fix when convenient |

---

## Threats by Category

### 1. Data Access Violations

#### T1: Student accessing another student's data

**Priority:** CRITICAL

**Scenario:** Student A can see Student B's:
- Progress
- Quiz scores
- Submissions
- Personal information

**Impact:** Privacy violation, trust destruction, legal liability

**Prevention:**
- Every data request checks: is this user authorized to see this data?
- Students can only see their own data
- Instructors can only see data for students in their courses
- Admins can see all data (by role requirement)

---

#### T2: Student accessing unenrolled courses

**Priority:** CRITICAL

**Scenario:** Student can access course content without enrollment.

**Impact:** Content theft, revenue loss (if paid), instructor trust violation

**Prevention:**
- Every content request checks: is this student enrolled in this course?
- API boundaries enforce enrollment verification
- File URLs are signed and temporary
- No direct file access without authentication

---

#### T3: Student accessing paid material without enrollment

**Priority:** CRITICAL

**Scenario:** Student accesses paid course content without paying.

**Impact:** Revenue loss, unfair advantage, instructor trust violation

**Prevention:**
- Enrollment requires payment verification (POST-MVP)
- Content access checks enrollment status
- No content previews that reveal paid material
- Signed URLs for file access

---

#### T4: Instructor accessing other instructors' courses

**Priority:** HIGH

**Scenario:** Instructor A can see/edit Instructor B's course content.

**Impact:** Content theft, intellectual property violation, competitive harm

**Prevention:**
- Course access checks: is this user the author?
- Instructors can only manage their own courses
- Admin override for legitimate reasons (support)

---

#### T5: Instructor escalating to admin

**Priority:** HIGH

**Scenario:** Instructor gains admin privileges through vulnerability.

**Impact:** Full platform compromise, data breach, malicious actions

**Prevention:**
- Role changes require admin authorization
- Role is verified on every request
- No client-side role modification
- Admin actions logged

---

### 2. Content Access Violations

#### T6: Unauthorized file downloads

**Priority:** HIGH

**Scenario:** Students download files they shouldn't have access to.

**Impact:** Content theft, intellectual property violation

**Prevention:**
- File access requires enrollment verification
- Signed URLs with expiration
- No direct file URLs in client
- Download logging (POST-MVP)

---

#### T7: Unauthorized video access

**Priority:** HIGH

**Scenario:** Students stream videos from courses they're not enrolled in.

**Impact:** Content theft, bandwidth costs, instructor trust violation

**Prevention:**
- Video streaming requires enrollment verification
- Token-based video access
- No embeddable video URLs
- Referrer checking

---

#### T8: Content scraping

**Priority:** MEDIUM

**Scenario:** Automated tools scrape course content at scale.

**Impact:** Content theft, competitive harm, bandwidth costs

**Prevention:**
- Rate limiting
- Bot detection (POST-MVP)
- Watermarking (POST-MVP)
- Legal deterrent (Terms of Service)

---

### 3. Assessment Integrity

#### T9: Progress manipulation

**Priority:** HIGH

**Scenario:** Student artificially inflates their progress (marking complete without engaging).

**Impact:** False completion records, certificate fraud, learning outcome compromise

**Prevention:**
- Video progress tracking (can't mark complete without watching)
- Content engagement verification (scroll detection)
- Manual confirmation required
- Suspicious pattern detection (POST-MVP)

---

#### T10: Quiz score manipulation

**Priority:** HIGH

**Scenario:** Student modifies quiz scores or answers after submission.

**Impact:** Assessment integrity compromised, certificates失去意义

**Prevention:**
- Server-side scoring (never trust client)
- Quiz answers stored server-side only
- Score calculation on server
- Attempt history immutable

---

#### T11: Exercise solution sharing

**Priority:** MEDIUM

**Scenario:** Students share exercise solutions with other students.

**Impact:** Academic dishonesty, reduced learning

**Prevention:**
- Exercise solutions not visible to students
- Unique solution requirements (POST-MVP: variable inputs)
- Plagiarism detection (FUTURE)
- Honor code emphasis

---

### 4. Authentication & Session

#### T12: Account takeover

**Priority:** CRITICAL

**Scenario:** Attacker gains access to student/instructor/admin account.

**Impact:** Data breach, content theft, malicious actions

**Prevention:**
- Strong password requirements
- Rate limiting on login attempts
- Account lockout after failures
- Secure password reset flow
- Session management (expiration, invalidation)

---

#### T13: Session hijacking

**Priority:** HIGH

**Scenario:** Attacker steals session token and impersonates user.

**Impact:** Account compromise, data access

**Prevention:**
- Secure session tokens (HttpOnly, Secure cookies)
- Session expiration
- Token rotation
- IP-based session validation (POST-MVP)

---

#### T14: Weak password attacks

**Priority:** HIGH

**Scenario:** Attacker guesses or brute-forces passwords.

**Impact:** Account compromise

**Prevention:**
- Minimum password length (8+ characters)
- Password complexity requirements
- Rate limiting on login
- Account lockout
- Password breach database checking (POST-MVP)

---

### 5. Platform Abuse

#### T15: Spam courses

**Priority:** MEDIUM

**Scenario:** Bad actors create spam courses to game the system.

**Impact:** Platform quality degradation, student trust erosion

**Prevention:**
- Course review process (POST-MVP)
- Report button (POST-MVP)
- Quality standards enforcement
- Admin moderation

---

#### T16: Harassment via comments/messages

**Priority:** MEDIUM

**Scenario:** Students or instructors use platform communication to harass.

**Impact:** Toxic environment, user loss, legal liability

**Prevention:**
- Comment moderation (POST-MVP)
- Report mechanism (POST-MVP)
- Block user (FUTURE)
- Content policies

---

#### T17: Fake enrollments

**Priority:** LOW

**Scenario:** Bots create fake accounts and enrollments.

**Impact:** Inflated metrics, potential for abuse

**Prevention:**
- Email verification
- CAPTCHA (POST-MVP)
- Rate limiting on registration

---

### 6. Infrastructure

#### T18: Denial of Service

**Priority:** MEDIUM

**Scenario:** Platform is overwhelmed by traffic.

**Impact:** Downtime, user frustration, revenue loss

**Prevention:**
- CDN for static content
- Rate limiting
- Auto-scaling (POST-MVP)
- DDoS protection service (POST-MVP)

---

#### T19: Data breach

**Priority:** CRITICAL

**Scenario:** Attacker gains access to user data.

**Impact:** Legal liability, trust destruction, regulatory fines

**Prevention:**
- Data encryption at rest
- Data encryption in transit
- Access controls
- Security audit logging
- Incident response plan

---

#### T20: Supply chain attack

**Priority:** MEDIUM

**Scenario:** Compromised dependency or third-party service.

**Impact:** Platform compromise, data theft

**Prevention:**
- Dependency auditing
- Version pinning
- Minimal dependencies
- Security monitoring

---

## Priority Summary

### CRITICAL (Must prevent before launch)

1. Student accessing another student's data (T1)
2. Student accessing unenrolled courses (T2)
3. Student accessing paid material without enrollment (T3)
4. Account takeover (T12)
5. Data breach (T19)

### HIGH (Must prevent in MVP)

6. Instructor accessing other instructors' courses (T4)
7. Instructor escalating to admin (T5)
8. Unauthorized file downloads (T6)
9. Unauthorized video access (T7)
10. Progress manipulation (T9)
11. Quiz score manipulation (T10)
12. Session hijacking (T13)
13. Weak password attacks (T14)

### MEDIUM (Fix in POST-MVP)

14. Content scraping (T8)
15. Exercise solution sharing (T11)
16. Spam courses (T15)
17. Harassment (T16)
18. Denial of Service (T18)
19. Supply chain attack (T20)

### LOW (Fix when practical)

20. Fake enrollments (T17)

---

## Security Principles for MVP

1. **Never trust the client** — All authorization checks on server
2. **Least privilege** — Users get minimum access needed
3. **Defense in depth** — Multiple layers of protection
4. **Secure by default** — Deny access unless explicitly granted
5. **Audit logging** — Record security-relevant events
6. **Encrypt everything** — Data in transit and at rest
7. **Validate input** — Never trust user input
8. **Fail securely** — Errors don't leak information

---

## MVP Security Checklist

Before launch, verify:

- [ ] All API endpoints check authentication
- [ ] All data access checks authorization
- [ ] Passwords are hashed (not stored)
- [ ] Sessions expire appropriately
- [ ] File access requires enrollment
- [ ] Video streaming requires enrollment
- [ ] Progress updates are server-validated
- [ ] Quiz scores are server-calculated
- [ ] Role changes require admin
- [ ] Sensitive data is encrypted
- [ ] Error messages don't leak info
- [ ] Rate limiting is in place
- [ ] Email verification works
- [ ] Password reset is secure
