# TerraMatrix Academy — Institutional Handout

**Document Type:** Academy Orientation, Academic Syllabus & Operations Manual  
**Target Audience:** Enrolled Students, Faculty Instructors, Industry Partners, and Academic Auditors  
**Academic Year:** 2026–2027  
**Version:** 4.3  
**Publication Date:** 14 October 2026  

---

## 1. Institutional Overview & Vision

**TerraMatrix Academy** is an applied engineering education and computational research initiative founded by **TerraMatrix Engineering**.

Traditional civil and geotechnical engineering curricula often suffer from a persistent disconnect between idealized classroom formulas and complex, heterogeneous field ground conditions. TerraMatrix Academy bridges this chasm by delivering an **Engineering Intelligence Platform** grounded in three core pillars:

```
  ┌────────────────────────────────────────────────────────┐
  │                   THE TRIAD PEDAGOGY                   │
  ├───────────────────┬───────────────────┬────────────────┤
  │    PILLAR 1:      │    PILLAR 2:      │   PILLAR 3:    │
  │ RIGOROUS THEORY   │   COMPUTATIONAL   │   FIELD CODE   │
  │                   │     MODELING      │   VALIDATION   │
  │ Continuum Mech,   │ FEA / FEM, Python,│ IS Codes, ASTM,│
  │ Mohr-Coulomb,     │ PLAXIS, GeoStudio,│ Eurocodes, Case│
  │ Terzaghi Theory   │ GIS Spatial Data  │ Forensic Audits│
  └───────────────────┴───────────────────┴────────────────┘
```

---

## 2. Participant Roles & Orientation

### 2.1 The Learner (Student / Working Engineer)
- **Enrollment:** Access structured programmes via the Course Catalogue (`#/student`).
- **Learning Classroom (`#/student-classroom/:courseId`):** Stream structured lecture modules, view companion computational notes, and execute guided Jupyter / Python snippets.
- **Progress Tracking:** Real-time visibility into module milestones, completed quizzes, and pending capstone submissions.
- **Certification:** Earn cryptographically signed certificates verifiable by prospective employers and academic institutions.

### 2.2 The Faculty Instructor
- **Curriculum Stewardship:** Structure sequential modules, upload video lectures, and publish lab assignments.
- **Cohort Monitoring:** View enrolled student rosters and track cohort completion statistics.
- **Assessment & Feedback:** Grade capstone projects, provide qualitative reviews, and host interactive live webinars.

### 2.3 The Administrator & Operations Lead
- **Course Lifecycle Management:** Review, approve, and publish course offerings.
- **Role & Access Governance:** Enforce Row-Level Security, manage student enrollments, and administer instructor credentials.
- **System Health:** Direct telemetry monitoring over Supabase PostgreSQL database connections and Vercel edge delivery.

---

## 3. Curriculum Pathways & Domain Matrix

| Domain Code | Specialization Track | Focus Areas | Applied Tools | Typical Duration |
| :---: | :--- | :--- | :--- | :---: |
| **GEO-101** | **Foundational Soil Mechanics** | Phase relations, effective stress, consolidation, shear strength. | Python, Excel Sheets | 6 Weeks |
| **GEO-201** | **Advanced Slope Stability** | Limit equilibrium, Bishop, Spencer, seismic slope stability. | Slide, GeoStudio (SLOPE/W) | 8 Weeks |
| **GEO-301** | **Deep Foundations & Retaining Systems** | Bored piles, diaphragm walls, ground anchors, lateral earth pressure. | PLAXIS 2D, Python | 10 Weeks |
| **GEO-401** | **Computational Geotechnics & FEM** | Non-linear elastoplasticity, Hardening Soil model, jointed rock. | PLAXIS 3D, ABAQUS | 12 Weeks |
| **GEO-501** | **Geotechnical Forensic Investigation** | Embankment failure analysis, liquefaction mitigation, ground improvement. | Case Data, GIS | 6 Weeks |

---

## 4. Assessment, Grading & Capstone Framework

To maintain international academic rigor, course grades are determined through continuous, multi-dimensional assessment:

```
┌────────────────────────────────────────────────────────┐
│               ASSESSMENT WEIGHTAGE SYSTEM              │
├─────────────────────────┬────────────┬─────────────────┤
│ Component               │ Weightage  │ Threshold       │
├─────────────────────────┼────────────┼─────────────────┤
│ Module Quiz Checks      │ 20%        │ min 70% average │
│ Computational Labs      │ 30%        │ min 60% average │
│ Mid-Term Evaluation     │ 20%        │ min 65% score   │
│ Final Capstone Project  │ 30%        │ min 75% score   │
├─────────────────────────┼────────────┼─────────────────┤
│ Cumulative Qualifying   │ 100%       │ >= 75% Overall  │
└─────────────────────────┴────────────┴─────────────────┘
```

---

## 5. Verifiable Certification & Anti-Fraud Architecture

Every certificate issued by TerraMatrix Academy contains a permanent digital verification hash:

1. **Unique Alphanumeric Code:** e.g., `TM-GEO-2026-89421`
2. **SHA-256 Digest:** Cryptographic digest generated from student ID, course ID, issue date, and grade.
3. **Public Verification Link:** Anyone (e.g., hiring managers, university admissions) can visit `https://terramatrix-academy.vercel.app/#/verify` to validate:
   - Recipient Name
   - Course Title and Syllabus Coverage
   - Issue Date and Accreditation Status
   - Integrity of the original digital credential

---

## 6. Code of Conduct & Academic Honesty

1. **Independent Work:** All submitted calculation models and design reports must be the authentic work of the enrolled student.
2. **Citation Standards:** External datasets, research papers, and software libraries must be properly cited using standard academic conventions.
3. **Respectful Discourse:** Community forums, workshop Q&A sessions, and live chat must remain professional, respectful, and focused on technical excellence.

---

## 7. Institutional Contacts & Office Hours

- **Dean of Academic Affairs:** `academic-dean@terramatrix.in`
- **Technical Platform Support:** `support@terramatrix.in`
- **Registrar & Certification Office:** `registrar@terramatrix.in`
- **Official Portal:** [https://github.com/PradhanArpan/TerraMatrix-Academy](https://github.com/PradhanArpan/TerraMatrix-Academy)
- **Campus Address:** TerraMatrix Academy, Technology Innovation Hub, Bengaluru / Kolkata, India.
