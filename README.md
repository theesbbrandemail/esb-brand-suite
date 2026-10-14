# ESB Brand Suite — Android Application

A high-performance Android application built with **Kotlin** and **Jetpack Compose (Material 3)**, delivering an executive suite for ESB Brand operations, clinical aesthetics, inventory supply chains, sales management, and AI orchestration.

---

## Ported Features & Dashboards

### 1. Executive Overview & Operations
- **Multi-Branch Switcher**: Real-time switching between Port Harcourt and Abuja branches.
- **Executive KPI Cards**: Real-time inventory status, today's appointments volume, automated AI insights, and 30-day revenue with Canvas sparkline visualization.
- **Orchestrator Actions**: Automated operational queue highlighting auto-executed routines and pending managerial approvals.
- **Sub-Brands Portfolio**: Skincare Kitchen, Derma Aesthetics, and ESB Apothecary revenue targets and market share.

### 2. Departmental Sales Team Dashboard
- **Department Breakdowns**: Dedicated sales targets, actuals, pipeline deal volumes, and conversion metrics for:
  - *Skincare Kitchen* (artisanal serums, bespoke Serum Bar blends)
  - *Derma Aesthetics* (high-ticket clinical packages, laser facials)
  - *ESB Apothecary* (dermatological prescription skincare, mineral SPF)
  - *Dental Studio* (porcelain veneers, laser teeth whitening)
- **High-Value Deal Pipeline**: Interactive stages (*New Lead*, *Consultation Scheduled*, *Proposal Sent*, *Closed Won*) with one-tap stage advancement.

### 3. Departmental Customer Follow-up Dashboard
- **Protocol-Driven Scripts**: Custom post-treatment follow-up messages tailored to each department's medical and aesthetic standards.
- **One-Touch WhatsApp Integration**: Direct WhatsApp launcher prefilled with personalized client name, care guidelines, and clinic contacts.
- **Status Tracking**: Pending, Sent, and Scheduled status updates with priority flags.

### 4. Clinical Suite: Doctor & Nurse Dashboards
- **Doctor Dashboard**:
  - Today's diagnostic reviews and patient cases.
  - Skin AI Health Score integration (0–100 scale).
  - Contraindications warnings (retinoid timeouts, anticoagulant flags, allergies).
  - Protocol approval and clinical sign-off workflow.
- **Nurse Dashboard**:
  - Live Room Queue (Suite A, VIP Suite, Room 2).
  - Procedure Prep Checklists (handpiece sterilization, lidocaine application, solution preparation).
  - Exact dosage specifications (solution percentages, pressure kPa, laser parameters).
  - Patient vitals tracking (blood pressure, heart rate, temperature).

### 5. Enhanced Branch Manager Suite
- **Shift & Staff Attendance Roster**: Real-time tracking of on-duty doctors, aesthetic nurses, clinical estheticians, and front desk personnel.
- **Floor Stock Quick-Adjustment**: Instant `+` and `-` quantity adjustment buttons for floor managers.
- **Daily Operations Checklist**: Compliance audits, autoclave verification, morning register balance, and VIP concierge protocols with interactive task completion.

### 6. Client & Patient 360 CRM
- **VIP Diamond & Tier Management**: Tier badges, lifetime value ($LTV), total visits, and loyalty point balances.
- **Clinical Skin Profiles**: Skin type diagnostics, sensitivity indicators, and contraindications.
- **One-Click Outreach**: Instant phone dialer, WhatsApp templates modal, and clinical observation note logs.
- **Intake Form**: Fast intake wizard for new patients and consultations.

---

## Architecture & Tech Stack

- **Target Framework**: Kotlin + Jetpack Compose
- **Design System**: Material Design 3 with custom ESB Luxury Dark Palette (`NavyBackground`, `GoldPrimary`, `VioletAccent`)
- **State Management**: Reactive `ViewModel` + `StateFlow` / `asStateFlow()`
- **Build System**: Gradle Kotlin DSL (`build.gradle.kts`, `settings.gradle.kts`, `libs.versions.toml`)
- **Application ID**: `com.aistudio.esbbrandsuite.wvkqzp`
