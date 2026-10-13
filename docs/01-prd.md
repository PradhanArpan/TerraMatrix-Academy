# 01 · Product Requirements Document (PRD)

**Project:** TerraMatrix Academy — Engineering Intelligence Platform  
**Target Stack:** React 19 + TypeScript + Vite + Supabase + Vercel  
**Status:** Active Production Specification  
**Version:** 4.3  
**Date:** 14 October 2026  

---

## 1. Executive Summary & Product Goal

TerraMatrix Academy is an engineering intelligence and applied learning platform designed for students, practicing geotechnical engineers, researchers, and infrastructure professionals. The platform bridges the gap between academic civil/geotechnical theory and field engineering practice.

### The Core Job to be Done
Provide an intuitive, responsive, and rigorous engineering learning environment where learners can explore geotechnical curricula, participate in computational modeling workshops, review accredited lecture materials, track personalized learning progress, and obtain cryptographically verifiable certificates of completion.

---

## 2. Target User Personas

| Persona | Role | Key Needs & Pain Points | Primary Actions on Portal |
| :--- | :--- | :--- | :--- |
| **P1: Engineering Student** | Civil / Geotechnical undergraduate or postgraduate | Needs structured, industry-aligned foundational courses, lab demonstrations, and verified certificates. | Browse catalogue, enroll, stream video lectures, take module quizzes, access assignments, download certificates. |
| **P2: Practicing Professional** | Infrastructure / Geotechnical site engineer | Needs specialized CPD (Continuous Professional Development), deep-dive workshops (PLAXIS, GeoStudio, GIS), and rapid reference calculations. | Attend live webinars, register for intensive workshops, review technical literature and field case studies. |
| **P3: Faculty / Course Instructor** | Domain expert / Senior geotechnical engineer | Needs an authoring portal to manage syllabi, review student submissions, schedule office hours, and broadcast announcements. | Instructor Portal: update course modules, upload lecture recordings, review learner progress and grade capstone projects. |
| **P4: Academy Administrator** | Academic Director / Operations Lead | Needs total visibility into academy operations, enrollment metrics, financial reconciliation, and database synchronization. | Admin Dashboard: system configuration, instructor approvals, batch certifications, catalogue management. |

---

## 3. Product Features & Expected Behaviour

| Module | Feature | Expected Behaviour |
| :--- | :--- | :--- |
| **Public Showcase** | Hero & Mission Showcase | Displays dynamic engineering imagery, institutional credentials, live metrics, and category navigation. |
| **Course Discovery** | Multi-faceted Search & Filter | Instant client-side filtering by domain (Geotechnical, Rock Mechanics, Earth Structures), level (Foundational, Intermediate, Advanced), and format. |
| **Course Curriculum** | Interactive Course Detail | Comprehensive syllabus breakdown, prerequisites, learning outcomes, instructor credentials, and single-click enrollment trigger. |
| **Learning Library** | Video Lectures & Explainers | Categorized video archive with search, playback duration, companion computational notes, and transcript references. |
| **Events & Workshops** | Webinars & Hands-on Workshops | Detailed schedules, speaker profiles, timezone-aware calendar dates, and registration links. |
| **Learner Workspace** | Student Dashboard & Classroom | Track enrolled courses, module completion percentages, interactive quiz submission, and project download links. |
| **Faculty Workspace** | Instructor Portal | Course overview, learner enrollment rosters, grading queues, and video lecture publishing controls. |
| **Operations Engine** | Admin Management Workspace | Tabbed operational control center: metrics, user management, course catalog management, certificate generation, database health check. |
| **Verification & Trust** | Certificate Verification | Public lookup verifying certificate hashes, issuance date, student identity, and course syllabus tamper-proofing. |
| **Compliance & Privacy** | Consent & Data Rights Portal | Granular DPDP Act 2023 / GDPR consent banner, detailed privacy notice, terms of service, and direct grievance officer contacts. |

---

## 4. Responsive & Device Requirements

- **Desktop (1200px+)**: Multi-column expansive layouts with fixed sticky sidebars in workspace views.
- **Tablet (768px - 1199px)**: Two-column grid with collapsible workspace navigation and high-density information tables.
- **Mobile (320px - 767px)**: Single-column flow, 48px minimum touch targets, zero horizontal scroll, off-canvas navigation with accessible modal focus traps.
- **Dark Mode Support**: Native dynamic theme switcher (`light` / `dark`) with zero flash on initial page load (persisted via `localStorage`).

---

## 5. Success Metrics & Key Performance Indicators (KPIs)

1. **Zero Dashboard Failures:** Seamless loading of administrative and student workspace views without reliance on legacy bridge scripts.
2. **Page Load Speed:** First Contentful Paint (FCP) < 1.0s; Largest Contentful Paint (LCP) < 1.8s on Vercel Edge Network.
3. **Accessibility (a11y):** WCAG 2.1 AA conformity across color contrast, focus rings, ARIA landmarks, and keyboard navigation.
4. **Data Protection Compliance:** 100% adherence to India's DPDP Act 2023, IT Act 2000, and GDPR principles.
