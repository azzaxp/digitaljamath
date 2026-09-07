# DigitalJamath — Enterprise Design Document & System Architecture (DESIGN.md)

> **Document Version:** 3.0.0  
> **Frameworks:** Enterprise Design Thinking (EDT) & Google Stitch / Material Design 3 (M3)  
> **Target Audience:** Product Managers, Designers, Full-Stack Engineers, Masjids, Jamaths & Muslim NGOs in India  

---

## 🧭 1. Executive Vision & Enterprise Design Thinking (EDT) Framework

DigitalJamath is an open-source, community-trust platform tailored for India's 300,000+ Masjids, Jamaths, and Muslim welfare organizations. This document applies **Enterprise Design Thinking** (User Outcomes, Restless Reinvention, Diverse Empowered Teams) coupled with **Google Stitch / Material Design 3** design token systems to establish the unified product and interface standard.

```
                  ┌──────────────────────────────────────────────────────────┐
                  │                      THE EDT LOOP                        │
                  │             OBSERVE  ──►  REFLECT  ──►  MAKE             │
                  └────────────────────────────┬─────────────────────────────┘
                                               │
               ┌───────────────────────────────┼───────────────────────────────┐
               ▼                               ▼                               ▼
       [ Sponsor Users ]                 [ The 3 Hills ]                 [ Playbacks ]
   Mutawallis, Imams, Widows,      Measurable Wow Outcomes for        Continuous Community
   Youth Volunteers, Auditors       Trustees, Donors, Beneficiaries     & Scholarly Reviews
```

---

### 🏔️ The 3 Core Hills (Measurable User Outcomes)

In Enterprise Design Thinking, **Hills** define clear, measurable human objectives:

* **Hill 1 (The Mutawalli / Trustee):**  
  * *Who:* An elder Mutawalli / Treasurer with no accounting background.  
  * *What:* Can record daily cash/UPI collections and vendor payments in under 60 seconds.  
  * *Wow:* System mathematically guarantees **zero Zakat leakage** into operational expenses without manual ledger reconciliation.
* **Hill 2 (The Donor & Tax Auditor):**  
  * *Who:* A donor contributing ₹50,000+ and the Trust’s Chartered Accountant (CA).  
  * *What:* Can download instant 80G PDF receipts on WhatsApp and export the government-mandated **Form 10BD CSV** on May 31 in 1 click.  
  * *Wow:* Reduces annual audit preparation time from 3 weeks to 10 seconds with zero penalty exposure.
* **Hill 3 (The Welfare Beneficiary):**  
  * *Who:* A Zakat-eligible widow or distressed family seeking medical/ration aid.  
  * *What:* Can apply for emergency welfare via mobile OTP or mosque intake without public exposure.  
  * *Wow:* Receives direct bank/cash grant disbursement with full privacy and dignity preserved across neighboring Jamaths.

---

## 👥 2. User Personas & Empathy Ecosystem

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│   Janab Farooq (62)     │  │   Zainab Begum (44)     │  │      Arshad (26)        │  │   Sameer Ahmed, CA (38) │
│   Traditional Mutawalli │  │   Widow & Beneficiary   │  │   General Secretary     │  │   Trust Auditor / CA    │
├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤  ├─────────────────────────┤
│ • Uses WhatsApp & pen   │  │ • Budget smartphone     │  │ • Tech-savvy volunteer  │  │ • Stressed about 10BD   │
│ • Fears data loss       │  │ • Fears loss of dignity │  │ • Wants automation      │  │ • Needs audit trails   │
│ • Needs ultra-simple UI │  │ • Needs instant relief  │  │ • Drives mobile usage   │  │ • Demands compliance   │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

### Empathy Map: Janab Farooq (Mutawalli / Treasurer)
* **Says:** *"I have been writing this register for 20 years. If your software loses a single rupee, I am answerable to Allah and the Jamaat."*
* **Thinks:** *"I don't understand complex software menus. It must look like my notebook, but with error prevention."*
* **Does:** Collects cash Friday after Jumaah, notes donor names on slips, hands money to the bank on Monday.
* **Feels:** Heavy moral anxiety regarding Zakat mixing and Income Tax Department notices.

---

## 🔄 3. As-Is vs. To-Be Experience Journeys

### Journey 1: Baitul Maal & Friday Jumaah Collections
* **As-Is (Painful):**
  1. Cash counted on prayer mat with 3 witnesses.
  2. Total noted in paper diary with no distinction between Zakat and General donation.
  3. Electricity bill paid from general cash box; sometimes Zakat money inadvertently covers mosque repairs.
  4. End of year: Auditor rejects receipts due to missing donor PAN numbers.
* **To-Be (DigitalJamath + Google Stitch):**
  1. Treasurer opens **Quick Entry** on mobile or tablet.
  2. Enters amount + selects Fund Tag (`[Zakat]`, `[Sadaqah]`, `[Mosque Maintenance]`).
  3. System automatically routes entries to dedicated double-entry sub-ledgers.
  4. If someone attempts to book an AC repair from the Zakat fund, the UI displays a hard **Shariah Violation Lock**: *"Zakat cannot be allocated to physical infrastructure."*

### Journey 2: Welfare Grant Application & Disbursement
* **As-Is (Humiliating):**
  1. Beneficiary stands in queue outside the committee room during monthly meetings.
  2. Personal family tragedies discussed openly in front of 15 committee members.
  3. No cross-verification: same household might collect ration kits from 4 nearby masjids while another starving family receives none.
* **To-Be (Dignified & Deduplicated):**
  1. Applicant submits request via SMS/WhatsApp OTP or private 1-on-1 survey intake.
  2. System auto-calculates **Zakat Eligibility Score (0-100)** based on income, dependents, illness, and housing status.
  3. **Privacy-Preserving Cross-Mosque Check:** System checks anonymized hash to ensure household is not already receiving an active monthly stipend from an adjacent masjid.
  4. Direct, discreet grant disbursement with encrypted activity logging.

---

## 🎨 4. Google Stitch & Material Design 3 (M3) Design System

The visual design system combines Google Stitch tokens, Material You elevation, and traditional Islamic geometric serenity.

### 🎨 Design Tokens (Color Palette)

```css
:root {
  /* Brand / Primary: Ummah Trust Emerald */
  --md-sys-color-primary: #0F5132;
  --md-sys-color-on-primary: #FFFFFF;
  --md-sys-color-primary-container: #D1E7DD;
  --md-sys-color-on-primary-container: #082A1A;

  /* Secondary: Deep Minaret Slate */
  --md-sys-color-secondary: #1E293B;
  --md-sys-color-on-secondary: #FFFFFF;
  --md-sys-color-secondary-container: #E2E8F0;

  /* Shariah Fund Dimension Tokens */
  --fund-zakat-accent: #D97706;        /* Amber/Gold - Sacred & Restricted */
  --fund-zakat-container: #FEF3C7;
  --fund-sadaqah-accent: #059669;      /* Emerald - Flowing Charity */
  --fund-sadaqah-container: #D1FAE5;
  --fund-general-accent: #2563EB;      /* Blue - Operations & Lillah */
  --fund-general-container: #DBEAFE;
  --fund-waqf-accent: #7C3AED;         /* Purple - Endowment & Construction */
  --fund-waqf-container: #EDE9FE;

  /* Surfaces & Backgrounds */
  --md-sys-color-surface: #F8FAFC;
  --md-sys-color-surface-container: #FFFFFF;
  --md-sys-color-surface-container-high: #F1F5F9;
  --md-sys-color-outline: #CBD5E1;
  --md-sys-color-error: #DC2626;

  /* Typography Scale */
  --font-display: 'Plus Jakarta Sans', -apple-system, sans-serif;
  --font-body: 'Inter', -apple-system, sans-serif;
  --font-urdu: 'Noto Nastaliq Urdu', serif;
  --font-arabic: 'Amiri', serif;
}
```

### 📐 Elevation & Surface Architecture (Stitch Glass & Card Elevation)

* **Level 0 (Flat Surface):** `#F8FAFC` — Base viewport background.
* **Level 1 (Default Card):** `#FFFFFF` with `box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)` and `border: 1px solid #E2E8F0`.
* **Level 2 (Interactive Elements & Modals):** `box-shadow: 0 10px 25px -5px rgba(15, 81, 50, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)`.
* **Level 3 (Floating Action Bar / Mobile Nav):** Glassmorphism with `backdrop-filter: blur(16px); background: rgba(255, 255, 255, 0.88)`.

---

## 🏗️ 5. Information Architecture & Wireframe Blueprints

```
                               ┌────────────────────────────────────────────────────────┐
                               │                 DIGITAL JAMATH PLATFORM                │
                               └───────────────────────────┬────────────────────────────┘
                                                           │
              ┌────────────────────────────────────────────┴────────────────────────────────────────────┐
              ▼                                                                                         ▼
   [ 1. Next.js Public & Member Tier ]                                                  [ 2. ERPNext / Frappe Admin Tier ]
   ───────────────────────────────────                                                  ──────────────────────────────────
   • Public Marketing (digitaljamath.com)                                               • Core Desk (app.digitaljamath.com/desk)
   • Public Masjid Trust Profile & Live Kiosk                                           • General Ledger (Baitul Maal Double Entry)
   • Member Portal (Mobile OTP Login):                                                  • Form 10BD & 80G Tax Filing Center
     - Digital ID Card & Active Subscriptions                                           • Census Registry (Households & Afrad)
     - 80G Tax Receipt Vault & PDF Download                                             • Welfare Grants & Scoring Engine
     - Service Intake (Nikaah, Death Cert, NOC)                                         • Role Permissions & Audit Trails
```

### Next.js Landing Page Hierarchy (`digitaljamath-website`)
1. **Hero Section:** Clear value proposition (*"The Free, Open-Source Operating System for Indian Masjids & Jamaths"*), Trust Badges (80G, Form 10BD Ready, Shariah Audited), Live Interactive Demo Button.
2. **The 4 Pillars Grid:**
   * 💰 **Baitul Maal Ledger:** Real double-entry with automated Zakat isolation.
   * 🏠 **Digital Census:** Household & family socio-economic mapping with auto-scoring.
   * 🧾 **1-Click 80G & Form 10BD:** Zero-stress annual compliance for trustees.
   * 📱 **Member Portal:** Mobile-first OTP login, digital ID card, instant WhatsApp receipts.
3. **Interactive Baitul Maal Simulator:** Live widget where trustees can test entering donations and see the ledger balance itself automatically.
4. **Compliance Countdown Widget:** Real-time countdown to the May 31 Form 10BD deadline highlighting penalty risks.
5. **Self-Hosting & Open-Source Guarantee:** 1-line Docker deploy command, GitHub stars, zero data lock-in.

---

## 🛡️ 6. Shariah, Legal & Accessibility Guardrails

### 🕌 Shariah Integrity Guardrails
* **Fund Segregation Guarantee:** Restricted Zakat funds must **never** show a negative balance and cannot be journaled into general asset maintenance accounts.
* **Tamper-Evident Ledger:** Finalized vouchers are cryptographically locked with an immutable audit log.
* **Consent & Dignity:** Aid recipients are never listed on public donor dashboards. Public trust pages only display aggregated anonymized metrics (*"₹4.2L Zakat Distributed to 38 Eligible Families"*).

### 🇮🇳 Indian Compliance (Section 80G / Form 10BD)
* Mandatory PAN collection for cash donations $> ₹2,000$ and online donations $> ₹50,000$.
* Automated validation of 10-character Indian PAN format (`[A-Z]{5}[0-9]{4}[A-Z]{1}`).
* One-click generation of NSDL-compliant Form 10BD CSV ready for upload to the Income Tax Portal.

### ♿ Accessibility & Localization
* **Full RTL / LTR Bi-directional Support:** Seamless UI flipping for Urdu and Arabic script layouts.
* **Regional Indian Language Readiness:** Hindi, Tamil, Malayalam, Bengali, Telugu, and Gujarati string catalogs.
* **Low-Bandwidth Optimization:** Next.js Server Components with compressed static assets designed to load in $< 1.5\text{s}$ on 3G mobile networks.

---

## 🚀 7. Actionable Implementation Milestones

1. **Step 1 (Landing Page Upgrade):** Refactor `digitaljamath-website/app/page.tsx` using Google Stitch M3 tokens and the sections defined in this document.
2. **Step 2 (DocType Blueprints in Frappe):** Generate Frappe DocTypes for `Jamath Household`, `Jamath Member`, `Service Request`, and configure `Fund Type` accounting dimension in ERPNext.
3. **Step 3 (Member Portal Integration):** Connect the Next.js member interface to Frappe REST APIs for mobile OTP authentication and receipt downloads.
4. **Step 4 (Form 10BD & 80G Engine):** Implement the export pipeline and print formats.
