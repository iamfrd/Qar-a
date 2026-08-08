# Qarğa Revenue Model — Option Matrix for Decision

- **Date:** 2026-08-08
- **Work OS:** QW-0002 / QW-0002-S01, revised under QW-0002-S02
- **Lane:** Standard (business model design; no live payment and no code change)
- **Author agent:** `qarga-revenue-strategist`
- **Independent reviewer:** `qarga-product-manager`
- **Status:** REVISED AFTER INDEPENDENT REVIEW — awaiting re-review; no percentage, rate, package, or payment step has been approved

> **What this document is not:** no commission percentage, subscription price, market size, conversion rate, or margin is **approved or proposed** here. This document only builds the decision frame. Every figure is either measured in this repository (with the source shown) or explicitly marked **UNKNOWN**.

> **Revision note (QW-0002-S02, 2026-08-08).** The independent review by `qarga-product-manager` returned PARTIAL with two HIGH findings, and both were verified against current code before this revision. (1) The shipped frontend does not send registration, login, or trial data to the server, so the pilot as originally designed would have produced **zero** data — section 3.8 now discloses the integration status and section 7 switches to manual, offline data capture. (2) Provider concentration was unguarded — sections 7.5, 7.6, and 8 now carry a concentration rule and a proposed participant floor, feeding decision D-03. Four smaller findings are also addressed: student price sensitivity in the option matrix (5.1), the invoicing-capability unknown U-16 (4.2), a direct B-versus-C readiness comparison (5.8), and a pre-commitment warning on the decision thresholds (7.7). The option matrix, the recommendation in section 6, and every section number are unchanged. The registration-flow frontend migration is explicitly **not** part of this round.

---

## 1. Decision problem

For which **value event**, from **whom**, and with **which collection model** should Qarğa earn revenue — and which part of that decision can actually be measured today?

The decision is constrained by three structural facts (all three shown with evidence below):

1. **Online payment does not exist and is forbidden at the database level.** Therefore the "commission on payment" option cannot be selected today — it can only be planned as a future phase.
2. **Every post-registration event is written by the party that would pay.** The provider sets the `confirmed` / `completed` / `attended` statuses itself. In other words, the commission base today is the provider's own declaration.
3. **There is no provider self-service write endpoint.** Course, branch, group, price — all of it enters only through `server/seed.mjs`. In other words, supply is currently managed manually.

Together, these three facts show that the real decision is not "what commission percentage". The real decision is this: **how will Qarğa prove which event it can trust before it starts taking money?**

---

## 2. Scope

**In scope:** definition of value events, revenue model options, provider/student/support/technical impact, assumption registry, payment-free pilot design, project-owner decisions.

**Out of scope:** approval of the commission percentage or price, payment gateway architecture, legal text, commercial negotiation with a real provider, marketing spend, code changes.

**Files changed:** only this document (`docs/plans/`). `src/**`, `server/**`, `.claude/**`, `CLAUDE.md`, and `package.json` were not touched.

---

## 3. Evidence of the current state (REQ-1)

### 3.1 Files read

**First pass (QW-0002-S01):** `CLAUDE.md`, `server/schema.sql`, `server/index.mjs`, `server/catalog.mjs`, `server/booking.mjs`, `server/test.mjs`, `src/components/CourseCard.tsx`, `src/components/CourseMap.tsx`, `src/lib/api.ts`, `.claude/project-memory/decisions.jsonl`.

**Revision pass (QW-0002-S02), to answer "is any of this reachable from the shipped app?":** `src/App.tsx`, `src/store/useAppStore.ts`, `src/pages/student/RegistrationFlow.tsx`, `src/pages/student/CourseDetail.tsx`, `src/pages/student/TrialBooking.tsx`, `src/pages/Login.tsx`, `src/pages/provider/ProviderRegistrations.tsx`, `src/lib/legacyCourseAdapter.ts`. Result in 3.8 — the answer is no.

### 3.2 Value-event map — for what is it **technically** possible to charge?

| # | Candidate value event | Exists? | Evidence (file:line) | Who writes it? |
|---|---|---|---|---|
| V1 | Appearance in search results (impression) | **NO** | `searchOfferings` writes nothing — `server/catalog.mjs:149-207` only reads | — |
| V2 | Lead / click on provider contact | **NO** | `GET /api/providers/:id` returns phone/email (`server/index.mjs:111-117`), but the click event is not stored | — |
| V3 | Trial lesson reservation (`requested`) | **YES** | `trial_reservations` table `server/schema.sql:185`; `bookTrial` `server/booking.mjs:29`; audit `trial.requested` `server/booking.mjs:55`; idempotent `server/booking.mjs:32-35` | Student |
| V4 | Attendance at the trial lesson (`attended` / `no_show`) | **YES** | `TRIAL_TRANSITIONS` `server/booking.mjs:61-70`; history `trial_status_history` `server/schema.sql:202` | **Provider** (`requireProviderAccess`, `server/booking.mjs:87`) |
| V5 | Registration submitted (`submitted`) | **YES** | `registrations` `server/schema.sql:214`; `createRegistration` `server/booking.mjs:167`; audit `server/booking.mjs:208` | Student |
| V6 | Registration confirmed (`confirmed`) | **YES** | `REG_TRANSITIONS` `server/booking.mjs:218-224`; history with actor + timestamp `server/booking.mjs:253-254` | **Provider** (`server/booking.mjs:241`) |
| V7 | Course completion (`completed`) | **YES** (as a status) | `server/booking.mjs:221` | **Provider** |
| V8 | Lesson attendance (for a registration) | **NO** | `REG_TRANSITIONS` has no `attended` status; there is no lesson-level attendance model | — |
| V9 | Payment (`paid`) | **NO and blocked** | The `payment_method` CHECK allows only `'pay_at_center'` (`server/schema.sql:227`); `createRegistration` writes a hard-coded `'pay_at_center','pay_at_center'` (`server/booking.mjs:201`); no code path sets `paid`; a test protects this (`server/test.mjs:160-169`) | — |

**Conclusion:** the only real events measurable today are **V3, V5** (written by the student) and **V4, V6, V7** (written by the provider). Payment and attendance do not exist.

> **Read this table together with 3.8.** Every "YES" above means the **server** is capable of recording that event. It does **not** mean the event is being produced. The shipped browser application does not call these endpoints for registration, login, or trial booking, so today no real user traffic reaches any of them. Read 3.2 as backend capability, not as live data.

### 3.3 Accounting infrastructure — which part is ready?

**Ready (a trail sufficient to calculate commission):**

- `registration_status_history` — `registration_id, status, actor_user_id, note, at` (`server/schema.sql:239-247`). Stores who made every status change and when.
- `audit_log` — `actor_user_id, action, entity, entity_id, meta, at` (`server/schema.sql:307-316`); events such as `registration.confirmed` land here (`server/booking.mjs:255`).
- `GET /api/provider/:id/registrations` — returns `ref, status, finalPriceMinor, studentName, createdAt, title` (`server/index.mjs:172-184`).
- `GET /api/admin/audit` — behind the `course.moderate` permission (`server/index.mjs:188-192`).
- `registrations.final_price_minor` — calculated on the server; the amount sent by the browser is ignored (`server/booking.mjs:189-193`; test `server/test.mjs:171-183`).

**Missing (required before taking money):**

- There is no commission / invoice / settlement table (no such table exists in `server/schema.sql`).
- There is no per-provider revenue aggregation — `GET /api/admin/overview` returns only overall counts (`server/index.mjs:194-208`).
- There is no admin billing report filtered by date range or status.
- There is no money object: `disputed` and `refunded` are only registration statuses (`server/booking.mjs:223`), with no amount movement.
- There is no table for provider bank/payout details.

### 3.4 Commercial elements that already exist but are **not operable**

This section matters: several revenue elements already exist in the schema, but none of them can be managed.

| Element | In schema | Read | Written | Real effect |
|---|---|---|---|---|
| `providers.plan` (`basic`/`professional`/`premium`) | `server/schema.sql:56` | `server/index.mjs:106,112` | **Seed only** (`server/seed.mjs:75-77`) | **Affects behavior nowhere** — no limit or benefit is tied to the plan |
| `course_offerings.promoted` | `server/schema.sql:142` | `server/catalog.mjs:33,119` | **Seed only** (`server/seed.mjs:106,113`) | **+0.5** to the relevance score (`server/catalog.mjs:140`), only when `sort=relevance` (`server/catalog.mjs:196`) |
| `course_offerings.qarga_exclusive` | `server/schema.sql:141` | `server/catalog.mjs:32,118` | **Seed only** | **+0.3** to the relevance score (`server/catalog.mjs:136`) and a filter (`server/catalog.mjs:165`) |
| `course_offerings.registration_fee_minor` | `server/schema.sql:133` | Returned by the API (`server/catalog.mjs:28,103`), SELECTed in `createRegistration` (`server/booking.mjs:179`) | — | **Not added to the price** — `finalMinor` is computed only from `discount_price ?? price` (`server/booking.mjs:190-193`) |
| `QARGA10` promo code | — | `server/booking.mjs:191-192` | Hard-coded **10%** discount | Reduces `final_price_minor`; **who funds the discount is undefined** |
| `lelek_ledger` | `server/schema.sql:290-303` | — | **No server code touches this table** (grep: only in `schema.sql`) | `registrations.lelek_used` (`server/schema.sql:226`) is never written (`server/booking.mjs:197-204`) — Lələk is a promise with no funding source |

**Conclusion:** the concept for a package (plan) model is already in the schema and does not need to be reinvented — it simply has no write path and no entitlement logic. Sponsored placement, by contrast, **cannot be sold**, because nothing other than the seed can set `promoted`.

### 3.5 Three structural risks (with evidence)

**R-A — The party that would pay writes its own bill.**
In `updateRegistrationStatus`, only `cancelled` belongs to the student; every other transition requires `requireProviderAccess` (`server/booking.mjs:240-241`). That means `confirmed`, `completed`, and for trials `attended`/`no_show` are all the provider's declaration. If commission is tied to these events, the provider gains a **direct financial incentive to under-declare**.

**R-B — The path for off-platform leakage is open.**
The `REG_TRANSITIONS.submitted` list includes `cancelled`, and the student can perform it (`server/booking.mjs:219,240`). A provider can tell the student "cancel through Qarğa and come to us directly"; in the system this is indistinguishable from an ordinary cancellation. No signal currently detects it.

**R-C — Unlabeled sponsorship advantage on the map.**
The comment at `src/lib/api.ts:93` requires that `promoted` be shown in the UI **with a mandatory visible label**. In the list this is done correctly: `CourseCard.tsx:30-35` renders the `Sponsorlu` label. But **there is no label on the map**: `CourseMap.tsx:14-26` draws sponsored pins larger (40px vs 34px) with a gold border, and `CourseMap.tsx:102` selects the sponsored offering as the primary one in a cluster — the user does not see that this is a paid advantage.

### 3.6 The supply gap

A full read of `server/index.mjs` shows that **there is no write endpoint for the catalog**: no POST/PATCH route exists to create or edit a provider, branch, course, offering, group, or trial slot. `verification_status` is likewise not changed by any endpoint. The only existing write operations are: OTP/session, profile (`PATCH /api/auth/me`), trial reservation and its status, registration and its status, and reviews.

**This is decisive for the revenue model:** a provider cannot list itself today. Therefore any initial model will be **concierge (manually operated)** — that is not bad news and it suits a pilot, but it rules out the "sell a subscription and give self-service" scenario for today.

### 3.7 Project memory

`.claude/project-memory/decisions.jsonl` is **empty**. There is therefore no previously approved decision constraining the revenue model; this choice will be one of Qarğa's first material decisions worth recording.

### 3.8 Current frontend integration status — the value events in 3.2 are backend-capable, not live

Section 3.2 describes what `server/` can record. It does not describe what the shipped application does. A read of the routed screens shows that every money-relevant flow still runs against the local client store:

| Flow | Screen | What it actually calls | Evidence |
|---|---|---|---|
| Registration | `/app/register/:courseId` -> `RegistrationFlow` | The local store action `createRegistration` — **not** `api.createRegistration` | `src/App.tsx:21,74`; `src/pages/student/RegistrationFlow.tsx:3,32,55-59`; the unused client method sits at `src/lib/api.ts:216` |
| Login / OTP | `Login` | Store actions `loginAsRole` / `registerStudent`; there is no `api.requestOtp` or `api.verifyOtp` call anywhere in `src/` | `src/pages/Login.tsx:19-20,29,36,41`; unused client methods `src/lib/api.ts:201-202` |
| Course detail | `CourseDetail` | `useAppStore((s) => s.courses)` — not `api.offering()` | `src/pages/student/CourseDetail.tsx:3,22`; unused client method `src/lib/api.ts:194` |
| Trial booking | `TrialBooking` | Store action `bookTrial` | `src/pages/student/TrialBooking.tsx:3,22,38` |
| Provider registration queue | `ProviderRegistrations` | Store data through `useProviderScope` — not `api.providerRegistrations` | `src/pages/provider/ProviderRegistrations.tsx:2,19-20`; unused client method `src/lib/api.ts:230` |

Only discovery is on the real backend. Eight modules reference `src/lib/api.ts` at all, and only three of them call the `api` HTTP client: `src/pages/student/SearchPage.tsx:5`, `src/pages/student/HomeMap.tsx:4`, and `src/components/FilterSheet.tsx:6`. The rest (`CourseCard`, `CourseMap`, `legacyCourseAdapter`, `filterAdapter`) import only types or the `formatMinor` helper. By contrast, a repository search returns 49 files referencing `useAppStore`, including the store module itself.

Two consequences matter for revenue design:

1. **The accounting tables in 3.3 stay empty in practice.** `registrations`, `registration_status_history`, and `audit_log` are populated only by direct API calls and by `server/seed.mjs`. Real activity in the shipped app never reaches them.
2. **The client store is per-browser, so no shared record of a registration exists anywhere.** State is persisted through `persist(...)` under the key `qarga-storage` (`src/store/useAppStore.ts:154,413`), i.e. browser local storage. A registration created in a student's browser is therefore invisible in a provider's browser on a different device. The provider queue screen shows that provider's own local data, not the student's.

This is a known, in-progress migration rather than a newly discovered defect. `src/lib/legacyCourseAdapter.ts:1-9` documents the partial cut-over of discovery to the real backend while other screens still read the legacy shape from `useAppStore`, and `CLAUDE.md:23` states strategic priority #1: "Complete the application technically and finish server-authoritative frontend integration."

**Effect on this document.** It does **not** change the options in section 5 or the recommendation in section 6 — those rest on the server-side facts K-01 to K-20, which were re-checked and remain accurate. It **does** change section 7: automatic measurement of the pilot is unavailable until the frontend migration lands, so the pilot must capture its data manually and offline. This constraint is recorded as **K-21** in 4.1.

---

## 4. Assumption registry (REQ-3)

### 4.1 KNOWN — verified in this repository

| ID | Fact | Evidence |
|---|---|---|
| K-01 | There is no online payment; `payment_method` can only be `pay_at_center` | `server/schema.sql:227` |
| K-02 | A registration cannot be made "paid" from the browser | `server/test.mjs:160-169` |
| K-03 | Price is calculated on the server | `server/booking.mjs:189-193`; `server/test.mjs:171-183` |
| K-04 | Registration is idempotent | `server/booking.mjs:170-173`; `server/test.mjs:140-158` |
| K-05 | Capacity is not exceeded under concurrent requests | `server/booking.mjs:46,186`; `server/test.mjs:116-138` |
| K-06 | Status transitions are rule-based | `server/booking.mjs:61-70,218-224`; `server/test.mjs:195-207` |
| K-07 | Status changes are stored with actor + timestamp | `server/schema.sql:202,239`; `server/booking.mjs:253-254` |
| K-08 | Sensitive operations land in the audit log | `server/booking.mjs:55,208,255` |
| K-09 | `confirmed`/`completed`/`attended` are written by the provider | `server/booking.mjs:87,240-241` |
| K-10 | A student can cancel a `submitted` registration | `server/booking.mjs:219,240` |
| K-11 | `providers.plan` exists but affects no behavior | `server/schema.sql:56`; `server/index.mjs:106,112` |
| K-12 | `promoted` adds +0.5 to the relevance score | `server/catalog.mjs:140` |
| K-13 | `promoted` is set only by the seed; there is no write path for selling it | `server/seed.mjs:106,113` |
| K-14 | The list shows the `Sponsorlu` label, the map does not | `src/components/CourseCard.tsx:30-35`; `src/components/CourseMap.tsx:14-26,102` |
| K-15 | `registration_fee_minor` is displayed but not charged | `server/booking.mjs:190-193` |
| K-16 | `QARGA10` = 10% discount, hard-coded, with no financial owner | `server/booking.mjs:191-192` |
| K-17 | The `lelek_ledger` table exists; no server code touches it | `server/schema.sql:290`; grep result |
| K-18 | There is no provider write endpoint for the catalog | `server/index.mjs` (read in full) |
| K-19 | There is no commission/invoice/settlement table | `server/schema.sql` (read in full) |
| K-20 | There is no previously approved revenue decision | `.claude/project-memory/decisions.jsonl` is empty |

### 4.2 UNKNOWN — not measured, must not be guessed

| ID | Unknown | Why it matters | How it can be learned |
|---|---|---|---|
| U-01 | The number of real providers and which of them have agreed | The basis of every model | Concierge recruitment |
| U-02 | The provider's margin per student | How much commission is tolerable | Provider interview (under NDA) |
| U-03 | The provider's current customer-acquisition cost | The alternative value frame | Interview |
| U-04 | Willingness to pay (commission or subscription) | Price selection | Non-binding LOI test |
| U-05 | Search to trial to registration conversion | The value of each event | Analytics (does not exist today) |
| U-06 | What share of registrations become real registrations | Reliability of the commission base | **The pilot's primary metric** |
| U-07 | The provider's status-update discipline | Whether commission can be measured at all | Pilot |
| U-08 | The off-platform leakage rate | The death risk of the commission model | Pilot + student call |
| U-09 | Cancellation/complaint frequency | Support load | Pilot |
| U-10 | Support time per registration | Unit economics | Pilot log |
| U-11 | Real rates of competitors/alternatives | Comparison base | External research (not performed in this task) |
| U-12 | Tax/legal requirements in Azerbaijan | Choice of collection model | `legal-advisor` |
| U-13 | Payment gateway fee and settlement cycle | Future margin | `payment-integration` |
| U-14 | Student price sensitivity | Passing cost through to the student | Test |
| U-15 | The real value and funding source of Lələk | Hidden liability | Project-owner decision |

> **Rule:** in every option analysis below, no U-* value has been replaced with a number.

---

## 5. Option matrix (REQ-2)

### 5.1 Overall comparison

| | **A — Commission on confirmed registration** | **B — Provider package / subscription** | **C — Fixed fee per lead/trial** | **D — Sponsored placement** | **E — Hybrid (package + performance fee)** | **F — Phase 0: free + measured** |
|---|---|---|---|---|---|---|
| Value event | V6 `confirmed` | Time (monthly availability) | V3 trial / V5 registration | Impression | V6 + time | None (no money taken) |
| Payer | Provider | Provider | Provider | Provider | Provider | Nobody |
| Qarğa's money role | Calculates + invoices (does not hold money) | Invoices | Invoices | Invoices | Invoices | None |
| Measurable today? | **Partly** — the event exists but is the provider's declaration (K-09) | **Yes** — time is objective | Partly (V3 is a student event, more objective) | **No** — `promoted` cannot be written (K-13) | Partly | **Yes** |
| Requires a payment gateway? | No (invoice-based) | No | No | No | No | No |
| Risk for the provider | High (variable cost) | Low (predictable) | Medium | Low | Medium | None |
| Revenue risk for Qarğa | Leakage and under-declaration | Churn if value is not proven | Dispute over fake/low-quality leads | Worthless if the catalog is small | A mix of both | No revenue |
| Support load | **High** (every invoice can become a dispute) | Low | Medium | Low | Medium-high | Low |
| Legal complexity | High | Medium | Medium | Medium (labeling obligation) | High | Low |
| Primary failure mode | Provider does not update statuses, so revenue is invisible | Provider sees no value, so monthly churn | "This lead was low quality" dispute | Unlabeled advantage, so loss of trust (K-14) | Complexity scares the provider off | The model is never tested |

### 5.2 Option A — Commission on confirmed registration

**Benefit:** aligns directly with value; the provider pays only for outcomes; the entry barrier is low for a small provider.

**Primary risk (K-09):** the commission base is the provider's own declaration. The provider sets the `confirmed` status; if it does not, no bill is created. This is the classic "the party that pays the bill writes the bill" problem.

**Secondary risk (K-10, R-B):** the student can cancel a `submitted` registration. A provider can steer the student off Qarğa and have the registration cancelled; in the system this looks like an ordinary cancellation.

**What breaks if the provider disengages:** everything. If the provider simply stops updating statuses, Qarğa can neither see revenue nor report on it. On top of that, the statuses also drive `review_eligibility` (`server/booking.mjs:257-261`) — so when status discipline breaks down, the review system weakens too. This is the most fragile point of the commission model.

**Technical prerequisites:** a commission event table; a per-provider report endpoint with a date range (does not exist today, K-19); an invoice object; a dispute flow; a leakage signal.

**Unit economics:** cannot be calculated without U-02, U-06, U-08, U-10.

### 5.3 Option B — Provider package / subscription

**Benefit:** the value event does not depend on the provider (time is objective), which removes R-A entirely. Revenue is predictable. The schema already has the `providers.plan` field (K-11) — the concept is not reinvented.

**Primary risk:** if the provider does not see the value (U-05 is unknown), the subscription is cancelled after the first months. Selling a package on a small catalog can look like "charging for traffic that does not exist yet".

**Critical prerequisite (K-18):** the package must have real content. Today a provider cannot even edit its own course. What would a "professional package" promise? To sell a package, the provider first needs **something that can be given**: self-service catalog management, a statistics panel, multiple branches, priority support. None of that is ready.

**What breaks if the provider disengages:** revenue stops, but **data integrity does not break** — unlike commission, a provider not updating statuses does not distort the bill. This is B's most important advantage over A.

**Support load:** low — a fixed monthly invoice, with no event-level disputes.

### 5.4 Option C — Fixed fee per lead / trial

**Benefit:** the value event is created **by the student** (V3 `trial.requested`, `server/booking.mjs:55`), so it does not depend on the provider's declaration. R-A is partly solved.

**Primary risk:** quality disputes. "This student did not show up, why should I pay?" The trial has a `no_show` status (`server/booking.mjs:63`), but that too is written by the **provider** — so the exception mechanism is once again in the provider's hands.

**Fraud risk:** the same user cannot book the same slot twice (`server/schema.sql:198`), but there is no defense against mass fake reservations from different users. A competitor or malicious actor could artificially inflate the provider's cost.

**What breaks if the provider disengages:** the provider would want to delete trial slots — but there is no slot create/delete endpoint either (K-18), so today the provider cannot escape the cost. That is an artificial advantage and it will disappear as soon as self-service arrives.

### 5.5 Option D — Sponsored placement

**Benefit:** part of the infrastructure already exists: the relevance score is transparent and `scoreParts` is returned in the response (`server/catalog.mjs:141-142,197`), and the list shows the `Sponsorlu` label (K-14).

**Blocking problem 1 (K-13):** `promoted` is set only by the seed. There is no write path, duration, limit, or audit for fulfilling sold sponsorship. In other words, this product **cannot be delivered** today.

**Blocking problem 2 (K-14):** on the map a sponsored pin is larger with a gold border and is chosen as the cluster primary — **without a label**. The comment at `src/lib/api.ts:93` itself requires that the label always be visible. This must be fixed before sponsorship is sold; otherwise Qarğa becomes a platform that hides paid advantage.

**Blocking problem 3:** sponsorship only works when `sort=relevance` (`server/catalog.mjs:196`). If the user sorts by price/distance/rating, the provider does not receive the advantage it paid for — a direct source of post-sale disputes.

**What breaks if the provider disengages:** little. Sponsorship is voluntary and stopping it does not break the system. However, when the catalog is small (U-01 is unknown) sponsorship has no value — being first among five results is not a product.

### 5.6 Option E — Hybrid (low package + performance fee)

**Benefit:** predictable base revenue (from B) plus growth-linked upside (from A).

**Risk:** it accumulates the operational load of both models — both monthly invoicing and event-level disputes. Since the infrastructure exists today for neither A nor B, E is the heaviest choice.

**Assessment:** E may be the right **end point**, but it cannot be the **starting point**. Building a hybrid before A's reliability (U-06) is proven makes the untested part mandatory.

### 5.7 Option F — Phase 0: no money taken, only measurement

**Benefit:** the only option that **can be fully executed today**, and it closes the U-06, U-07, U-08, U-09, and U-10 unknowns. It creates no legal, payment, or dispute risk.

**Risk:** it creates a "free" expectation. Introducing a price later becomes harder. This risk must be reduced **with contract language**: the pilot must be explicitly time-bounded and announced as "will be paid in the future" (`legal-advisor` work).

**Risk 2:** if the pilot is run without a measurement plan, it is simply wasted time. That is why section 7 is mandatory.

---

## 6. Recommended model

### 6.1 Recommendation

**Phase 0 (now): Option F — a measured free pilot with a "shadow commission" calculation.**
**Phase 1 (after the pilot): Option B (package) as the primary commercial instrument, with commission added only if V6's reliability is proven, leading to Option E.**

### 6.2 Reasoning

1. Payment is closed (K-01, K-02) — every payment-linked model is already deferred regardless.
2. The commission base is the provider's declaration (K-09) and the leakage path is open (K-10). Choosing a commission percentage without measuring these two unknowns (U-06, U-08) is **inventing a number**.
3. The package model does not depend on the provider's declaration and schema support already exists (K-11) — but today there is no real value to put inside the package (K-18). So B cannot be sold immediately either.
4. Sponsorship (D) cannot be delivered today for three separate reasons (K-13, K-14, `catalog.mjs:196`).
5. Therefore the only honest sequence is: **measure first, price second.**

### 6.3 Devil's advocate — the strongest argument against my own recommendation

> **"Phase 0 delays revenue. The project's #2 strategic priority is the revenue model. You are saying 'let us measure' and deferring the decision — that is a polite form of inaction."**

This is a serious objection and it is partly right. My answer:

| # | Objection | Status | Basis |
|---|---|---|---|
| O-1 | Phase 0 delays revenue | **ACCEPTED RISK** | True. But the alternative — choosing a commission percentage now — would be built on unmeasured U-02/U-06, and `CLAUDE.md` forbids invented metrics. To reduce the risk, the pilot has a **stop condition** (7.6), so it cannot turn into drift. |
| O-2 | Providers will refuse to pay after a free pilot | **NEEDS EVIDENCE** | This is tested directly in the pilot's second track: a non-binding LOI (7.4). If nobody signs an LOI, that is not a pilot failure — it is a **valuable negative result**. |
| O-3 | Commission is fair; if the provider under-declares, the student will complain | **NEEDS EVIDENCE** | This is exactly the U-06 hypothesis. The pilot's primary metric measures it. If agreement is high, I must change my recommendation and move to A/E. |
| O-4 | Selling a package requires self-service first — so B is not ready either | **RESOLVED (accepted)** | True, and I showed it myself in 5.3. That is why B is **Phase 1**, not Phase 0, and why the self-service requirement is handed off to `qarga-product-manager`. |
| O-5 | Sell sponsorship now — the infrastructure is almost ready | **BLOCKING** | No. `promoted` cannot be written (K-13), the map has no label (K-14), and when `sort` is not `relevance` the paid advantage is not delivered. Selling unlabeled paid advantage is both a trust risk and a consumer-rights risk. D cannot be sold until these are fixed. |
| O-6 | `QARGA10` and Lələk are already financial concessions — so Qarğa is already "spending" money | **RESOLVED (surfaced)** | True, and this is a real problem that was surfaced (K-16, K-17). A financial owner must be assigned for both — project-owner decision D-06. |

**Conclusion:** my recommendation is sensitive to the O-3 evidence. If the pilot shows that the provider's declaration agrees with student confirmation to a high degree, the commission model (A/E) becomes possible earlier.

---

## 7. Manual pilot and measurement plan (REQ-4)

> **Requires no payment. No real money moves. Requires no code change** (for the first track).

### 7.1 Hypotheses (primary)

**H1:** The registration status recorded by the provider on Qarğa **agrees to a reliable degree** with the student's independent confirmation — that is, the `confirmed` event (V6) can be used as a commission base.

**H2 (second track):** Providers are willing to pay for the value Qarğa creates — measured with a non-binding letter of intent (LOI).

### 7.2 Primary metric and its source

**Metric:** *Declaration agreement rate* = (number of sampled registrations where the provider's status matches the student's independent confirmation) / (number of sampled registrations checked).

**Source:**
- Platform side: `registration_status_history` (`server/schema.sql:239`) and `audit_log` (`server/schema.sql:307`) — via admin `GET /api/admin/audit` (`server/index.mjs:188`) and the provider report `GET /api/provider/:id/registrations` (`server/index.mjs:172`).
- Independent side: confirmation with the student by call/message. This log is kept **outside the repository**, in a personal-data-minimized form (only the registration `ref` plus an outcome code).

**Baseline: UNKNOWN** — this metric has never been measured.

### 7.3 Guardrail metrics

| Metric | Source | Why |
|---|---|---|
| Leakage signal: the student says "I registered" but the record remains `cancelled`/`submitted` | Call log + `registration_status_history` | Measures risk R-B |
| Status update lag (time between `submitted` and the next status) | `registration_status_history.at` | Provider discipline (U-07) |
| Share of registrations whose status is never updated | Same | Risk that commission is unmeasurable |
| Number and category of student complaints | Support log | Harm to the student experience |
| Manual work minutes per registration | Pilot log | U-10, operational cost of service |
| Trial `no_show` share | `trial_status_history` | Viability of option C |

**Kill guardrail:** if student complaints increase, or if it is confirmed that a provider steered a student off the platform, the pilot is stopped immediately and escalated to the project owner.

### 7.4 Second track — willingness to pay (free)

Pilot providers are presented with a **non-binding letter of intent**: "If Qarğa applies a fee in the future under model X, would you in principle be willing to continue?"

- No money moves and no binding obligation is created.
- The text is prepared by `legal-advisor` and **approved by the project owner**.
- Measured: how many providers sign, which model they choose (A/B/C/D), and which objections they raise.
- **This is not price approval** — it is only a directional signal.

### 7.5 Audience and coverage

- A small, manually selected group of providers (the exact number is a **project-owner decision**, D-03).
- Only providers already in the catalog (because of K-18, a new provider would have to be added manually).
- No change on the student side: the price does not change, there is no new fee, and the UI does not change.
- **No student is a subject of the pilot** — a student only receives a confirmation call and may decline it.

### 7.6 Duration and stop condition

- The duration or the minimum sample size is **set by the project owner** (D-04). My recommendation: a time limit **and** a minimum number of verified registrations — whichever comes first.
- **Anti-spin stop:** if the number of verifiable registrations does not reach the minimum threshold within the defined period, the pilot is declared inconclusive and the matter is re-routed as a **supply problem**, not a revenue decision.

### 7.7 Decision rule

| Outcome | Decision |
|---|---|
| High agreement **and** low leakage signal | The commission base is reliable, so move toward **E (hybrid)**; run separate pricing research for the percentage |
| High agreement **but** noticeable leakage signal | Commission is risky, so **B (package)** is the primary instrument and commission is deferred |
| Low agreement, or statuses are not updated | **A and E are excluded**, so use B and address status discipline as a product problem |
| Verified volume below the minimum threshold | **Inconclusive**, so supply and self-service move to priority |

### 7.8 Rollback

The pilot requires no code, schema, price, or contract change. To stop it, it is enough to stop the manual verification process. There is **no** technical rollback risk.

---

## 8. Risks and guardrails

| ID | Risk | Evidence | Guardrail |
|---|---|---|---|
| G-01 | The commission base is written by the paying party | K-09 | Independent student confirmation in the pilot; commission only if agreement is proven |
| G-02 | Off-platform leakage | K-10 | Leakage signal metric; an explicit contract clause (`legal-advisor`) |
| G-03 | Unlabeled sponsorship on the map | K-14 | **Blocking fix before D is sold**; `qarga-product-manager` + frontend work |
| G-04 | Sponsorship does not work when `sort` is not `relevance` | `server/catalog.mjs:196` | Define the promise precisely before sale; otherwise disputes |
| G-05 | `registration_fee_minor` is displayed but not charged | K-15 | Either include it in the price or remove it from the UI — project-owner decision D-05 |
| G-06 | The `QARGA10` discount has no financial owner | K-16 | The commission base (gross/net) must be defined — D-06 |
| G-07 | Lələk is an unfunded liability | K-17 | Lələk rules require project-owner approval (`CLAUDE.md` human approval gates) |
| G-08 | The pilot creates a "free" expectation | — | Time-bounded pilot language + LOI |
| G-09 | Personal data: the student confirmation call | `registrations.student_phone` `server/schema.sql:220` | Only `ref` + outcome code is stored; no raw conversation is stored; `legal-advisor` review |
| G-10 | If Qarğa itself accepts money, its legal status changes | K-01 | In Phase 0 and Phase 1 Qarğa **holds no money** — it only calculates and invoices |

---

## 9. Handoffs to other agents (supporting REQ-5)

> None of the items below is an **approved requirement**. All of them can be executed only after a project-owner decision.

| Agent | What is needed | Dependency |
|---|---|---|
| `qarga-product-manager` | (a) PRD for provider self-service catalog management (the K-18 gap) — a prerequisite for real package content; (b) provider statistics panel requirements; (c) independent review of this document | Before Phase 1 |
| `qarga-architect` | Boundaries of the commission/invoice/settlement data model; the write path and entitlement points for `providers.plan` | After model approval |
| `qarga-backend-engineer` | Per-provider billing report endpoint with a date range (does not exist today, K-19); an audited write path for `promoted` | After model approval |
| frontend / `qarga-product-manager` | **G-03: sponsorship label on the map** — blocking for option D | Before D |
| `legal-advisor` | (a) Pilot participation letter; (b) non-binding LOI text; (c) provider contract draft: commission base, leakage, cancellation, dispute ownership; (d) privacy review for the student confirmation call | Before the pilot (a, d) |
| `qarga-support-operating-model` | Flow for invoice disputes, leakage complaints, and provider escalation; a log template for U-09/U-10 | In parallel with the pilot |
| `payment-integration` | **Not engaged yet.** Only in Phase 2, after the model is approved | Model approval |
| future `qarga-data-analyst` | Measurement for U-05 (funnel), U-06, U-07, U-08; no analytics events exist today | After analytics is built |

---

## 10. Decisions required from the project owner (REQ-5)

| # | Decision | Why now | What evidence is needed | Blocks |
|---|---|---|---|---|
| **D-01** | Should Phase 0 (the measured free pilot) be approved? | Every other decision depends on it | This document | Everything |
| **D-02** | Is contacting real providers permitted? | The pilot requires real providers; `CLAUDE.md` requires approval for external contact | D-01 | The pilot |
| **D-03** | Number of pilot providers and the selection criteria | Volume determines the reliability of the result | U-01 (unknown) | The pilot |
| **D-04** | The pilot's duration and minimum sample size | For the stop condition | — | The pilot |
| **D-05** | `registration_fee_minor` is displayed but not charged (K-15) — include it in the price or remove it from the UI? | The student is shown an incorrect price | K-15 | Price correctness |
| **D-06** | Who funds the `QARGA10` 10% discount (K-16)? Is the commission base the gross or the net price? | It defines the commission base; it is hard-coded today | K-16 | Model design |
| **D-07** | The financial owner and rules for Lələk (K-17) | The ledger exists, the code does not — an unfunded promise | K-17 | Activation of Lələk |
| **D-08** | Can sponsorship (D) be sold — and are the G-03/G-04 fixes a priority? | It cannot be delivered today and there is an unlabeled advantage | K-13, K-14 | Option D |
| **D-09** | Is provider self-service (K-18) accepted as a prerequisite for Phase 1? | The package model is empty inside | K-18 | Phase 1 |
| **D-10** | Will Qarğa ever accept money itself, or only issue invoices? | It completely changes the legal and technical path | U-12, U-13 | Phase 2 |

> **D-01 through D-04 unlock the pilot. D-05 through D-07 close existing code inconsistencies and do not depend on the pilot — they can be resolved in parallel.**

---

## 11. Acceptance criteria (for this document)

| REQ | Criterion | State | Evidence |
|---|---|---|---|
| REQ-1 | Every value event is tied to an existing endpoint/table or marked as a gap | Done | Sections 3.2, 3.3, 3.4 |
| REQ-2 | At least three models compared (including commission, package, hybrid) | Done — six options | Section 5 |
| REQ-3 | Assumption registry with a known/unknown separation | Done — 20 known, 15 unknown | Section 4 |
| REQ-4 | Payment-free pilot: hypothesis, metric, guardrails, baseline, audience, stop condition, decision rule | Done | Section 7 |
| REQ-5 | Prioritized project-owner decisions | Done — D-01 through D-10 | Section 10 |
| — | Devil's advocate analysis | Done — O-1 through O-6 | Section 6.3 |

---

## 12. Decision log

| Date | Decision | Reason |
|---|---|---|
| 2026-08-08 | "Commission on payment" excluded at this stage | K-01, K-02 — technically impossible |
| 2026-08-08 | Sponsorship (D) removed from the "sellable" list | K-13, K-14, `catalog.mjs:196` |
| 2026-08-08 | A measured pilot recommended as Phase 0 rather than immediate commission | K-09, K-10 — the commission base is not proven |
| 2026-08-08 | The package (B) deferred to Phase 1, not Phase 0 | K-18 — the package has no real content |
| 2026-08-08 | No percentage or price proposed | U-02, U-04, U-11 are unknown; `CLAUDE.md` forbids invented metrics |

---

## 13. Signals for project memory

**Material decision to be recorded (after project-owner approval, by the coordinator):**
- The revenue model direction (Phase 0, then B, then E) and the rejected alternatives.

**Concrete technical debt surfaced (the coordinator should record it):**
- `registration_fee_minor` is displayed but not included in `final_price_minor` (K-15, `server/booking.mjs:190-193`).
- The `QARGA10` 10% discount is hard-coded with no assigned financial owner (K-16, `server/booking.mjs:191-192`).
- The `lelek_ledger` table exists, no server code touches it, and `registrations.lelek_used` is never written (K-17).
- Sponsored offerings receive an unlabeled visual advantage on the map (K-14, `src/components/CourseMap.tsx:14-26,102`), even though `src/lib/api.ts:93` requires the label.
- There is no write path for `providers.plan` or `course_offerings.promoted` (K-11, K-13).

**Experiment candidate (after project-owner approval):**
- The H1 declaration agreement pilot — baseline UNKNOWN, decision rule in 7.7.
