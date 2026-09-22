# Payments (Functional Only)

How money flows through the platform. Functional requirements, not implementation.

---

## Payment Models

### 1. Free Courses

**How it works:**
- Instructor makes course free
- Students enroll without payment
- No transaction
- Platform bears all costs

**Use cases:**
- Marketing courses (free intro to attract students)
- Community courses (free for community benefit)
- Preview courses (sample content to upsell)

### 2. One-Time Purchase

**How it works:**
- Instructor sets price for course
- Student pays once
- Lifetime access to course
- Platform takes commission

**Use cases:**
- Complete courses with full content
- Premium content with high production value
- Specialized courses with unique value

### 3. Subscriptions

**How it works:**
- Student pays recurring fee (monthly/yearly)
- Access to all courses (or subset)
- Access stops when subscription ends
- Platform manages billing

**Use cases:**
- Platform-wide access (Netflix for courses)
- Category-specific access (all Python courses)
- Instructor-specific access (all courses by one instructor)

### 4. Bundles

**How it works:**
- Multiple courses sold together
- Discounted price vs buying individually
- One-time purchase for the bundle

**Use cases:**
- Learning paths (beginner → intermediate → advanced)
- Related courses (Python + Django + Deployment)
- Seasonal promotions

### 5. Coupons

**How it works:**
- Discount codes for courses or bundles
- Percentage or fixed amount off
- Time-limited or usage-limited

**Use cases:**
- Promotions
- Affiliates
- Student discounts
- Early bird pricing

---

## Commission Structure

### Platform Revenue

For each paid transaction, the platform takes a commission.

**Standard model:**
- Platform: 20-30% commission
- Instructor: 70-80% of revenue

**Alternative models:**
- Flat monthly fee to instructor
- Subscription revenue shared proportionally
- No commission (instructor keeps 100%) — for own academy model

### Instructor Payouts

**When instructors get paid:**
- Monthly payout cycle
- Minimum payout threshold (e.g., $50)
- Payment methods: bank transfer, PayPal, etc.

**What affects payout:**
- Refunds reduce payout
- Chargebacks reduce payout
- Currency conversion fees

---

## Payment States

### Enrollment States

| State | Description |
|-------|-------------|
| **Free** | No payment required |
| **Paid (pending)** | Payment initiated, not completed |
| **Paid (completed)** | Payment successful, access granted |
| **Paid (refunded)** | Payment refunded, access revoked |
| **Paid (disputed)** | Chargeback in progress |

### Transaction Records

Every payment creates a transaction record:
- Student reference
- Course reference
- Amount
- Currency
- Payment method
- Status
- Timestamp
- Reference ID (from payment provider)
- Commission amount
- Instructor payout amount

---

## Refund Policy

### MVP Refund Policy

- No automatic refunds (manual process)
- Admin can process refunds
- Refund within 30 days of purchase (configurable)
- Refund revokes course access

### POST-MVP Refund Policy

- Automated refund window
- Self-service refund request
- Partial refunds (for bundles)
- Refund reason tracking
- Refund analytics

---

## Payment Provider Integration

### Functional Requirements

The platform must:
1. Process payments (credit card, debit card, PayPal)
2. Handle currency (at least USD, EUR, BRL)
3. Generate receipts
4. Handle refunds
5. Report transactions
6. Comply with tax regulations

### Provider Options (Not Implementation)

- Stripe (most common)
- PayPal
- Mercado Pago (Latin America)
- Paddle (handles taxes)
- LemonSqueezy (digital products)

---

## MVP Recommendation: FREE COURSES ONLY

**Payments should NOT be in MVP. Here's why:**

### Reason 1: No Content to Sell Yet

MVP is about building the platform and validating the model. There are no courses worth paying for until the platform is proven.

### Reason 2: Payment Complexity

Payment systems require:
- Legal compliance (taxes, regulations)
- Financial infrastructure (merchant accounts)
- Security (PCI compliance)
- Support (refunds, disputes)
- Accounting (revenue tracking, payouts)

This is significant operational overhead.

### Reason 3: Validation First

Before adding payments, validate:
- Do students want these courses?
- Do instructors want to teach here?
- Is the platform reliable?
- Is there genuine demand?

### Reason 4: Free Courses Attract Users

Free courses attract students. Students attract instructors. Instructors create more courses. More courses attract more students. This flywheel is more valuable than early revenue.

---

## When to Add Payments

Add payments when:
1. Platform has 10+ quality courses
2. Active student base (1000+)
3. Instructors requesting payment capability
4. Legal/tax structure in place
5. Payment provider integration is straightforward

**Estimated phase:** POST-MVP (Phase 4-5)

---

## Payment Security

### Critical Requirements

- **PCI compliance** — Never store card numbers
- **Secure transmission** — All payment data encrypted
- **Fraud detection** — Flag suspicious transactions
- **Audit trail** — Log all financial events
- **Access control** — Only authorized users see financial data

### What NOT to Build

- Custom payment processing
- Card number storage
- Custom fraud detection
- Custom tax calculation

Use established payment providers. They handle security and compliance.

---

## Revenue Tracking (POST-MVP)

When payments exist, track:

- Total revenue per course
- Revenue per instructor
- Revenue per time period
- Refund rate
- Average order value
- Conversion rate (enrollment / payment)
- Revenue by payment method
- Tax obligations

---

## Tax Considerations

### What the Platform Must Handle

- Sales tax (varies by jurisdiction)
- VAT (European Union)
- Withholding tax (for instructor payouts)
- Tax reporting (1099 forms in US)

### What Providers Handle

- Tax calculation
- Tax collection
- Tax remittance
- Tax reporting

**Recommendation:** Use a provider that handles taxes (Paddle, LemonSqueezy). Simplifies compliance dramatically.
