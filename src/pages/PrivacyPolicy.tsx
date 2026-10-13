import { ShieldCheck, ArrowLeft, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="tm3-legal-container">
      <Link to="/" className="tm3-auth-back">
        <ArrowLeft size={16} /> Return to Academy
      </Link>

      <header className="tm3-legal-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--tm3-green-700)" }}>
          <ShieldCheck size={28} />
          <span style={{ fontWeight: 800, textTransform: "uppercase", fontSize: 12, letterSpacing: "0.08em" }}>
            Regulatory Compliance Notice
          </span>
        </div>
        <h1>Data Privacy Policy & Data Protection Charter</h1>
        <div className="tm3-legal-meta">
          <span>Effective Date: 14 October 2026</span>
          <span>Version: 3.2 (DPDP Act 2023 & GDPR Aligned)</span>
          <span>Jurisdiction: Republic of India</span>
        </div>
      </header>

      <div className="tm3-legal-body">
        <div className="tm3-legal-highlight">
          <strong>Executive Summary:</strong> TerraMatrix Academy is committed to upholding the highest standards
          of data security, privacy, and integrity. This charter sets forth our practices pursuant to the
          <strong> Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>, the <strong>Information Technology Act, 2000</strong>,
          the <strong>SPDI Rules, 2011</strong>, CERT-In directions, and the EU <strong>General Data Protection Regulation (GDPR)</strong>.
        </div>

        <h2>1. Identity of the Data Fiduciary</h2>
        <p>
          The Data Fiduciary responsible for the processing of personal data on this platform is:
        </p>
        <p>
          <strong>TerraMatrix Academy</strong> (Engineering Intelligence Platform)<br />
          Division of TerraMatrix Engineering & Environmental Geotechnics Private Limited<br />
          Registered in India. Contact: <code>compliance@terramatrix.in</code>
        </p>

        <h2>2. Categories of Personal Data Collected</h2>
        <p>We adhere strictly to the principle of <strong>Data Minimisation</strong>. We only process data necessary for engineering education:</p>
        <table className="tm3-legal-table">
          <thead>
            <tr>
              <th>Data Category</th>
              <th>Specific Items</th>
              <th>Purpose & Lawful Basis</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Identity Data</strong></td>
              <td>Full Name, Institutional / Professional affiliation, Email address</td>
              <td>Enrollment, credential issuance, and communications.</td>
            </tr>
            <tr>
              <td><strong>Academic Records</strong></td>
              <td>Course enrollments, quiz responses, workshop submissions, grades</td>
              <td>Fulfillment of educational service and certification generation.</td>
            </tr>
            <tr>
              <td><strong>Technical Diagnostics</strong></td>
              <td>Truncated IP, browser user agent, crash diagnostics</td>
              <td>Platform stability, security incident response, and performance monitoring.</td>
            </tr>
            <tr>
              <td><strong>Session Storage</strong></td>
              <td>Auth JWTs, theme preferences, cached catalogue</td>
              <td>Essential functionality stored locally in browser storage.</td>
            </tr>
          </tbody>
        </table>

        <h2>3. Consent and Student Protection (DPDP Act 2023, Section 9)</h2>
        <p>
          In full conformity with <strong>Section 9 of the DPDP Act 2023</strong>:
        </p>
        <ul>
          <li><strong>No Behavioral Tracking of Minors:</strong> TerraMatrix Academy expressly prohibits the tracking, behavioral monitoring, or targeted advertising directed at enrolled students or minors.</li>
          <li><strong>Verifiable Consent:</strong> Enrollment of students under the age of 18 requires institutional verification or parental/guardian consent.</li>
          <li><strong>No Detrimental Processing:</strong> We do not engage in any automated profiling that could adversely affect student wellbeing or academic prospects.</li>
        </ul>

        <h2>4. Data Principal Rights</h2>
        <p>Under the DPDP Act 2023 and GDPR, you possess the following actionable rights:</p>
        <ul>
          <li><strong>Right to Access:</strong> Request a comprehensive summary of your personal data processed by the Academy.</li>
          <li><strong>Right to Correction & Erasure:</strong> Rectify inaccurate personal records or request complete deletion of your account and learning history.</li>
          <li><strong>Right of Grievance Redressal:</strong> Submit a grievance to our designated Data Protection Officer for prompt resolution.</li>
          <li><strong>Right to Nominate:</strong> Nominate an individual to exercise your privacy rights in the event of death or incapacity.</li>
        </ul>

        <h2>5. Information Security & Technical Safeguards</h2>
        <p>
          TerraMatrix enforces security practices aligned with <strong>IS/ISO/IEC 27001</strong> standards:
        </p>
        <ul>
          <li><strong>Encrypted in Transit & at Rest:</strong> All data transmissions are protected via TLS 1.3. Database volumes are encrypted using AES-256.</li>
          <li><strong>Row-Level Security (RLS):</strong> Supabase PostgreSQL databases enforce granular RLS policies. Students can only read and modify their own assignments; instructors are constrained to their assigned cohorts.</li>
          <li><strong>Credential Hashing:</strong> Authentication passwords and credentials are cryptographically hashed using salted key derivation algorithms (Argon2 / bcrypt). Private credentials are never stored in plain text.</li>
          <li><strong>Tamper-Evident Certification:</strong> Issued credentials and course completion certificates contain verifiable cryptographic SHA-256 checksums to eliminate fraud.</li>
        </ul>

        <h2>6. Sub-processors and Cross-Border Transfers</h2>
        <p>
          To deliver scalable cloud services, TerraMatrix utilizes audited, industry-leading cloud infrastructure:
        </p>
        <ul>
          <li><strong>Database & Authentication:</strong> Supabase Inc. (AWS / Frankfurt or Mumbai region with SOC 2 Type II compliance).</li>
          <li><strong>Application Delivery & CDN:</strong> Vercel Inc. (Global Edge Network with ISO 27001 certification).</li>
        </ul>

        <h2>7. Grievance Officer & Contact Information</h2>
        <p>
          Pursuant to the provisions of the Information Technology Act, 2000 and the DPDP Act, 2023, the details
          of the designated Grievance Officer are set forth below:
        </p>
        <div className="tm3-legal-highlight">
          <p><strong>Designated Grievance Redressal Officer:</strong></p>
          <p style={{ display: "flex", alignItems: "center", gap: 8, margin: "6px 0" }}>
            <Mail size={16} /> <strong>Email:</strong> <code>grievance@terramatrix.in</code>
          </p>
          <p style={{ display: "flex", alignItems: "center", gap: 8, margin: "6px 0" }}>
            <MapPin size={16} /> <strong>Address:</strong> Data Governance Cell, TerraMatrix Academy, Technology Hub, Bengaluru / Kolkata, India.
          </p>
          <p style={{ margin: "6px 0", fontSize: 13, color: "var(--tm3-text-soft)" }}>
            Response Timeline: Acknowledgement within 24 hours; final resolution within 30 days as mandated by law.
          </p>
        </div>
      </div>
    </div>
  );
}
