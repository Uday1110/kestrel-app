# Kestrel Finance — Corporate Lending Intake & Application Preparation Workspace

A secure, full-stack corporate lending intake and application preparation platform built for commercial banks and corporate credit divisions. Kestrel Finance streamlines the intake pipeline between front-office **Relationship Managers (RMs)** and middle-office **Credit Analysts**, accelerating multi-crore credit applications while enforcing strict regulatory governance boundaries.

---

## 🏛️ Governance & Regulatory Decision Boundary

> **IMPORTANT COMPLIANCE DIRECTIVE**  
> Under internal credit governance guidelines (Cycle Governance Directive 2026.Q1), Kestrel Finance **strictly organizes information, runs automated technical completeness & checksum validations, and presents factual arithmetic summaries**.  
>  
> The system **does not make, recommend, or imply automated credit decisions, algorithmic risk ratings, loan sanctions, or exposure approvals**. All underwriting decisions, facility sanctions, document waivers, and case rejections belong exclusively to authorized human Credit Analysts.

---

## 🚀 Key Features by Role

### 1. Relationship Manager (RM)
- **Application Assembly & 8-Gate Checklist:** Create and track business lending packages across 8 standardized corporate credit intake gates (Audited Financials, GST Returns, Bank Statements, MoA/AoA, Board Resolutions, Promoters KYC, Debt Schedule, Sanction Letters).
- **Intake Readiness Scoring:** Dynamic 0–100% readiness indicator that reflects document verification progress in real-time.
- **Document Ingestion & 4-Directive Validation:** Upload supporting documents with instantaneous 4-step intake analysis:
  1. *File Readability & Text Legibility* (DPI scan & skew check)
  2. *Duplicate Check against Repository* (SHA-256 cryptographic collision detection)
  3. *Document Type Specification* (structure & signature anchor verification)
  4. *Page Limit & Integrity Validation* (threshold checks & binary stream validation)
- **Outstanding Items & Multi-Channel Chase:** Filter missing or flagged requirements by criticality, dispatch borrower reminders across WhatsApp, Email, SMS, or Phone, and trigger 1-click batch automated pings.
- **Formal Submission Workflow:** Lock and transition validated packages to the Underwriting Desk with audit trails and optional waiver memos.

### 2. Credit Analyst
- **Triage Intake Queue:** Real-time intake queue with facility filtering (Working Capital, Term Loan, Machinery Loan), priority tagging, and readiness telemetry.
- **50/50 Dual-Pane Case Review:** High-efficiency analyst interface featuring an interactive PDF document inspector (zoom, pan, page jumps) side-by-side with verified dossier data.
- **Factual Financial Assistant:** Review extracted financial figures (Total Revenue, EBITDA, Bank Balance, DSCR, Current Ratio, Debt-to-EBITDA) with inline citations to source files and page numbers. Analysts can accept, edit, or challenge extractions with complete audit logging.
- **Human Underwriting Decision Hub:** Execute authoritative case transitions:
  - `Acknowledge & Proceed` (move to formal review)
  - `Request Documents / Information` (bounce back to RM with itemized requirements)
  - `Recommend Sanction` (escalate to Sanction Committee)
  - `Reject Application` (formal credit decline with recorded justification)

### 3. System Owner & Governance Stakeholders
- **Independent Oversight Portal (`/owner`):** Strictly restricted to authorized system owners under server-enforced least privilege (`requireRole(["OWNER"])`). Non-owner roles (RM, Analyst) are denied access with HTTP 403 Forbidden.
- **Urgent Governance Exceptions First:** High-priority alerts for overdue model risk reviews, missing board approval records, unresolved critical borrower outreach (>5 days), and checksum conflicts.
- **Key Operational Telemetry:** Real-time tracking of throughput, straight-through processing (STP) rate, manual handling rate, document defect rate, average cycle time (15.2 days vs 20.8d baseline), and active pipeline exposure (₹ Cr).
- **Model & Policy Registry:** Complete catalog of production models and directives (4-Directive Validation Engine, 8-Gate Corporate Lending Checklist, Cycle Governance Directive 2026.Q1, Borrower Chasing SLA Policy) with approving authority, review due dates, and threshold modification history.
- **End-to-End Case Traces with PII Masking:** Comprehensive lifecycle timeline from RM intake to final sanction committee decision with per-step latency, confidence scores, and strict PII minimization (names, emails, phones, PAN, and CIN are masked).
- **Structured Logs & Configurable Alerts:** System logs grouped by source system with statutory audit retention policy (RBI Master Direction 2025/WC-4: 8-year archival) and on-call alerting rules.
- **Cost Analytics & Vendor Tolerance:** Itemized breakdown across cloud compute, measured encrypted storage, third-party vendor APIs, and support effort with transparency labels distinguishing measured facts from benchmark models, plus vendor unit-cost tolerance checks.
- **Cryptographic Export Hub:** One-click CSV and PDF/Text formal governance reports with immutable audit commit logging.

### 4. Baseline Analytics & Telemetry
- **Role-Aware Dashboards:** Track aggregate cycle duration (18.0 working days vs 24.5-day pre-Kestrel baseline), active pipeline exposure (₹ Cr), clean checksum integrity rates, and intake readiness.
- **5-Gate Stage Duration Breakdown:** Interactive visualizer toggling between days and percentages across:
  - *Gate 1: RM Intake* (4.5 days)
  - *Gate 2: AI Checksum* (0.5 days)
  - *Gate 3: Borrower Chasing* (3.0 days)
  - *Gate 4: Underwriting Desk* (6.0 days)
  - *Gate 5: Sanction Committee* (4.0 days)

---

## 🛠️ Technology Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server Actions, Route Handlers)
- **Language:** Strict TypeScript (100% type-checked, zero TS errors)
- **Styling & Design System:** [Tailwind CSS](https://tailwindcss.com/) implementing the **Digital Kinetic** design tokens:
  - Surfaces: Dark Charcoal/Navy (`#10131a`, `#0b0e14`, `#121722`, `#1A202E`)
  - Primary Accent: Kinetic Emerald (`#02F576`, `#003916`)
  - Secondary Accent: Hyper Violet (`#5F2CFF`, `#c9beff`)
  - Typography: Montserrat (`font-sans`)
- **Database:** [SQLite](https://sqlite.org/) with [Prisma ORM](https://www.prisma.io/) (Zero-cloud-dependency, instant local setup)
- **Validation:** [Zod](https://zod.dev/) schemas protecting all API routes, server mutations, and form boundaries
- **File Storage:** Private local filesystem adapter (`LocalFileSystemStorageAdapter`) storing files in `./storage/documents/` behind an access-controlled download endpoint (`/api/documents/[id]/download`)
- **Testing:** [Vitest](https://vitest.dev/) automated test suite covering authorization, document validation, lifecycle transitions, and governance boundaries

---

## 🏁 Quickstart Guide

### Prerequisites
- Node.js `v18+` or `v20+` or `v22+` (Tested on Node `v26.13.0`)
- npm `v9+` or `v10+` or `v11+`

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Database Initialization & Seeding
Push the Prisma schema to the local SQLite database (`dev.db`) and seed realistic enterprise lending data:
```bash
npm run db:setup
```
*(Alternative manual commands: `npx prisma db push && npx tsx prisma/seed.ts`)*

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Test Suite
```bash
npm test
```
Runs 21 comprehensive integration tests verifying:
- Server-side role authorization (RM prevented from underwriting; Analyst execution permitted; Owner portal protected)
- Removal of in-app profile/role switching (HTTP 403 Forbidden with audit refusal commit)
- Document validation directives (file formats, 25MB limits, SHA-256 duplicate collision detection)
- PII data masking (names, corporate emails, phones, and statutory identifiers masked in traces and exports)
- Owner telemetry, urgent exception prioritization, and model registry overdue review tracking
- Cost analytics and vendor tolerance overage detection
- Data freshness status tracking and hourly recalculation
- Governance report exports (CSV & formal dossier with actor audit attribution)
- Application lifecycle & readiness scoring (8-gate initialization, status transitions, blocker waivers)
- Financial governance boundaries (factual mathematical collations without automated credit scores)

---

## 👥 Seeded Demo Credentials

Authentication is strictly server-enforced. In accordance with Institutional Governance & Segregation of Duties (SoD), in-app role switching has been disabled; users must sign out and authenticate with the designated role credentials:

| Role | Name | Staff ID / Email | OTP Token | Default Destination |
| :--- | :--- | :--- | :--- | :--- |
| **System Owner & Governance** | Vikram Mehta | `owner.governance@corporate.kestrel.internal` | `71940285` | `/owner` |
| **Relationship Manager (RM)** | Naveen Sharma | `rm.sharma@corporate.kestrel.internal` | `94821034` | `/dashboard` |
| **Credit Analyst** | Arunachalam V. | `analyst.williams@corporate.kestrel.internal` | `88219401` | `/queue` |
| **Relationship Manager 2** | Priya Deshmukh | `priya.deshmukh@corporate.kestrel.internal` | `94821034` | `/dashboard` |

*Note: Clicking the role cards on `/login` automatically pre-fills the respective credentials for 1-click access.*

---

## 📂 Seeded Applications for Demo Workflows

The SQLite database comes pre-seeded with real-world corporate lending cases:

1. **`APP-2026-0001` — Sample Applicant Pvt Ltd**
   - Facility: ₹18.00 Lakhs (Working Capital)
   - Status: `DOCS_IN_PROGRESS` (Readiness: 62.5%)
   - Contains: Active 8-gate checklist with cleared, attention, and missing items; financial extractions; open borrower chase items.
2. **`APP-2026-8841` — Bharat Heavy Forge Pvt Ltd**
   - Facility: ₹142.50 Crores (Working Capital & Capex)
   - Status: `SUBMITTED` / `UNDER_REVIEW` (Readiness: 87.5%)
   - Perfect for testing the **Analyst 50/50 Dual-Pane Case Review** at `/analyst/review/cmwi6b0s50004ku6l0g30h8u9`.
3. **`APP-2026-0007` — Bharat Biotech Innovations Ltd**
   - Facility: ₹75.00 Lakhs (Machinery Loan)
   - Status: `UNDER_REVIEW`
4. **`APP-2026-9042` — Apex Zenith Logistics Corp**
   - Facility: ₹2.50 Crores (Term Loan)
   - Status: `INFO_REQUESTED` (Critical outstanding borrower chase)

---

## 🗄️ Document Storage Architecture

- Uploaded files are stored in the local development storage directory:  
  `./storage/documents/<hash>-<filename>`
- **Zero Unrestricted Public Access:** Files are never exposed via Next.js `/public` folder.
- **Private Stream Download:** All document retrieval requests must pass through `/api/documents/[id]/download`, which validates user session role clearance before streaming the binary buffer.
- **Storage Adapter Boundary:** Implemented via `src/lib/storage.ts` with the `StorageAdapter` interface, allowing plug-and-play replacement with AWS S3, Google Cloud Storage, or Azure Blob in enterprise deployments.

---

## 🗺️ Application Sitemap & Screen Mapping

| Stitch Screen Prototype | Next.js Page Route | Description |
| :--- | :--- | :--- |
| `login_role_switch` | `/login` & `/` | Dual role clearance gateway, pre-filled demo accounts, session authentication. |
| `baseline_dashboard` | `/dashboard` & `/metrics` | Telemetry dashboard, 5-gate cycle durations, SLA benchmarks, Days vs % toggle. |
| `rm_application_checklist` | `/applications/[id]` & `/checklist` | 8-gate RM checklist table, blocker warnings, application readiness score, submit modal. |
| `upload_validation_drawer` | Modal Drawer in `/applications/[id]` | Real-time 4-step validation drawer, SHA-256 checksums, replace/remove document actions. |
| `rm_outstanding_items` | `/outstanding-items` | Missing & rejected items queue, multi-channel chase dispatch modal, 1-click batch ping. |
| `analyst_intake_queue` | `/queue` | Underwriting intake queue, facility type tabs, search & filtering, priority triage badges. |
| `analyst_application_review`| `/analyst/review/[id]` | 50/50 split layout, interactive document viewer (zoom/pan), analyst notes, human decision actions. |
| `financial_preparation_assistant` | `/financial-assistant` | Arithmetic collation workbench, revenue/EBITDA/DSCR metrics, source citations, edit extractions. |
| `owner_governance_dashboard` | `/owner` | System owner & governance oversight portal: urgent exceptions, policy registry, traces, logs, costs. |
| *Enterprise Document Store* | `/documents` | Centralized repository of all corporate documents with validation statuses and quick preview drawers. |

---

## 🔒 Security & Verification Summary

- **TypeScript:** Strict type checking (`npx tsc --noEmit`) passes with zero errors.
- **Server Role Authorization:** Checked on every API endpoint and server action (`requireRole(["ANALYST", "ADMIN"])`).
- **Input Sanitization:** All payload structures validated via Zod schemas (`src/lib/validators.ts`).
- **Audit Logging:** Every status change, document upload, borrower chase, and analyst note writes an immutable `AuditEvent` with author attribution and timestamp.
