# Legal & Regulatory Posture Blueprint (Republic of India)

**Platform:** TerraMatrix Academy (Engineering Intelligence Platform)  
**Legal Entity:** TerraMatrix Engineering Private Limited (or designated Indian operating entity)  
**Jurisdiction:** Republic of India (Governing Law: Information Technology Act, 2000 · DPDP Act, 2023 · Copyright Act, 1957)  
**Document Purpose:** Prepared for Founder & Legal Counsel Review  
**Date:** October 2026  

---

> [!IMPORTANT]
> **Legal Scaffold Disclaimer:** This document outlines the technical and operational compliance architecture developed for TerraMatrix Academy. It is specifically structured for your legal counsel to review, adjust, and formalize prior to commercial launch.

---

## 1. Audience Age Demographics & 13+ Hard Gate

### 1.1 Demographic Stance
- **Current Target Audience:** Undergraduate and postgraduate engineering students, competitive exam aspirants (GATE, ESE, State AE/JE, ISRO, BARC), and practicing engineering professionals.
- **Future Expansion:** Pre-University (PU) / Higher Secondary (11th & 12th science) students seeking foundational STEM & engineering mechanics modules.
- **Statutory Gate:** **Strict 13-Year Age Gate.**

### 1.2 Technical & Statutory Implementation
1. **Neutral Age Verification at Signup (`src/components/NeutralAgeGateModal.tsx`):**
   - Unbiased dropdowns for Month, Day, and Year with zero default values.
   - No leading prompts or hints indicating that "13" is the required threshold.
2. **Under-13 Hard Rejection:**
   - Anyone inputting a birth date resulting in an age < 13 is immediately blocked from account creation.
   - An encrypted, 24-hour client-side tombstone (`tma_age_gate_blocked`) prevents immediate replay attempts with a false older birth date.
3. **Data Minimization:**
   - Under the **Digital Personal Data Protection Act, 2023 (DPDP Act) Section 9** and international COPPA standards, the platform stores **zero PII** (no name, email, or exact birth date) for any rejected minor.
   - For permitted users (13+), the exact date of birth is discarded from memory immediately after age verification, storing only `is_age_verified = true` and `age_bracket = '13_plus'`.
4. **Prohibition of Behavioral Tracking:**
   - The platform operates with **zero third-party advertising pixels**, zero social media trackers (no Meta Pixel, no Google Remarketing), and zero behavioral profiling of students.

---

## 2. Indian Copyright & Intermediary Protection (Replacing U.S. DMCA)

Because TerraMatrix Academy operates primarily within the Indian jurisdiction, U.S. DMCA provisions are replaced by the statutory intermediary protections under Indian law:

### 2.1 Statutory Safe Harbor Framework
- **Information Technology Act, 2000 — Section 79:**
  - Provides statutory immunity from liability for third-party user-generated content (e.g. instructor course uploads, slides, question papers, video reels) provided TerraMatrix Academy complies with statutory due diligence.
- **IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 — Rule 3:**
  - **Grievance Redressal Mechanism:** TerraMatrix Academy must publish the name and contact details of a designated **Grievance Officer** on its website and mobile portal (`src/pages/TermsOfService.tsx` and `src/pages/PrivacyPolicy.tsx`).
  - **Acknowledgment SLA:** Complaints regarding alleged copyright infringement or objectionable content must be acknowledged within **24 hours**.
  - **Takedown SLA:** Access to content must be removed or disabled within **36 hours** of receiving actual knowledge via court order or appropriate government agency notice.
- **Indian Copyright Act, 1957 — Section 52(1)(a) & (i):**
  - **Educational Fair Dealing:** Reproduction of academic materials by a teacher or pupil in the course of instruction or as part of examination question papers/answers is protected under statutory fair dealing exemptions.

### 2.2 Technical Notice & Takedown Architecture
1. **Public Intake Page (`#/grievance` & `#/copyright`):**
   - Enables copyright holders or authorized representatives to submit sworn infringement notices with description of copyrighted work, URL of allegedly infringing content, and digital affirmation.
2. **Instant Administrative Kill-Switch:**
   - When verified, administrators can set content status to `status = 'takedown_hidden'`, immediately unpublishing the module from public feeds, search, and student dashboards within < 500ms while preserving database records for audit and dispute resolution.
3. **Counter-Notice & Opportunity to be Heard:**
   - The uploader is notified with details of the complaint and given an opportunity to submit an explanation or counter-declaration.

---

## 3. Indian Payment & Recurring Subscription Roadmap

### 3.1 Architecture Overview
- **Phase 1 (Current / Exploration):** Free open access to Knowledge Hub, model CBT practice questions, calculators, and webinars.
- **Phase 2 (Indian Commercial Launch):** Integration of domestic payment aggregators (e.g., **Razorpay** or **Cashfree**) supporting:
  - UPI Instant Payments (Google Pay, PhonePe, Paytm, BHIM).
  - Net Banking & RuPay / Visa / Mastercard debit & credit cards.
  - **UPI Autopay & Recurring E-Mandates** for academy monthly/annual subscriptions.

### 3.2 Compliance with RBI E-Mandate Directives
Under the **Reserve Bank of India (RBI) Circular on Recurring Transactions (RBI/2020-21/74)**:
1. **Upfront AFA (Additional Factor of Authentication):**
   - Initial e-mandate registration requires two-factor authentication (OTP / PIN) by the user.
2. **Pre-Debit Notification (Mandatory 24–48 Hours Prior):**
   - The payment gateway must dispatch an SMS/email pre-debit notice to the student at least 24 hours before any recurring subscription charge is processed.
3. **Self-Serve Revocation & Cancellation:**
   - Students must have an immediate self-serve mechanism in their Student Portal settings to pause or revoke their recurring mandate at any time with zero friction.

---

## 4. Key Items for Legal Review Checklist `[⚖️ REQUIRES LAWYER REVIEW]`

Keep this checklist for discussion with your legal advisor:

- [ ] **`[⚖️ LAWYER REVIEW]` Grievance Officer Designation & Details:**
  - Verify official corporate email (`grievance@terramatrix.in`), physical address in India, and name of designated officer to be published in website footer.
- [ ] **`[⚖️ LAWYER REVIEW]` Terms of Service Clickwrap Agreement:**
  - Enforceability of affirmative registration checkbox under Indian Contract Act, 1872 and IT Act Section 10A.
  - Jurisdiction clause: Exclusive jurisdiction of Courts in Bengaluru / Kolkata / Mumbai.
  - Intellectual property clause: Platform ownership of curriculum vs. instructor rights in self-authored video lessons and lecture notes.
- [ ] **`[⚖️ LAWYER REVIEW]` DPDP Act, 2023 Notice & Consent Charter:**
  - Consent wording in `src/components/ConsentBanner.tsx` itemizing purposes: authentication, course progress tracking, and certificate issuance.
  - Review of data principal rights: right to access summary of personal data, right to correction/erasure, and right to grievance redressal.
- [ ] **`[⚖️ LAWYER REVIEW]` 13+ Age Verification Policy:**
  - Formal approval of neutral age gate methodology and verification that no parental consent mechanism is legally mandated if under-13 users are strictly barred.
- [ ] **`[⚖️ LAWYER REVIEW]` Refund & Cancellation Policy:**
  - Mandatory refund windows (if any) under the Consumer Protection (E-Commerce) Rules, 2020 for digital academic subscriptions and downloadable technical content.
