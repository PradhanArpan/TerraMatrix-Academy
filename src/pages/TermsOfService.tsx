import { FileText, ArrowLeft, Scale, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function TermsOfService() {
  return (
    <div className="tm3-legal-container">
      <Link to="/" className="tm3-auth-back">
        <ArrowLeft size={16} /> Return to Academy
      </Link>

      <header className="tm3-legal-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--tm3-green-700)" }}>
          <FileText size={28} />
          <span style={{ fontWeight: 800, textTransform: "uppercase", fontSize: 12, letterSpacing: "0.08em" }}>
            Institutional Terms of Service
          </span>
        </div>
        <h1>Terms of Service & Academic Code of Conduct</h1>
        <div className="tm3-legal-meta">
          <span>Effective Date: 14 October 2026</span>
          <span>Version: 3.2</span>
          <span>Governing Law: Republic of India</span>
        </div>
      </header>

      <div className="tm3-legal-body">
        <div className="tm3-legal-highlight">
          <strong>Important Notice:</strong> By accessing or using TerraMatrix Academy, enrolling in courses,
          attending webinars, or utilizing engineering simulation tools, you agree to be bound by these Terms of Service
          and our Academic Integrity standards.
        </div>

        <h2>1. Scope of Service & Platform Purpose</h2>
        <p>
          TerraMatrix Academy is an engineering intelligence platform offering continuous learning, applied geotechnics,
          computational earth modeling, GIS workflows, and industrial certification. Services include structured curriculum
          pathways, interactive workshops, code sandboxes, and verified competency certificates.
        </p>

        <h2>2. User Accounts & Security</h2>
        <ul>
          <li><strong>Account Integrity:</strong> You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.</li>
          <li><strong>Role-Based Access:</strong> Access is divided into Learner, Instructor, and Administrator roles. Unauthorized attempts to escalate privileges or bypass Row-Level Security (RLS) will result in immediate suspension.</li>
          <li><strong>Accuracy of Information:</strong> Profile credentials, academic records, and institutional affiliations must be accurate to ensure the validity of issued certificates.</li>
        </ul>

        <h2>3. Academic Integrity & Certification Standards</h2>
        <p>To uphold the professional value of TerraMatrix credentials in industry and research:</p>
        <div style={{ display: "grid", gap: 12, margin: "18px 0" }}>
          <div style={{ display: "flex", gap: 10 }}>
            <CheckCircle2 size={18} color="var(--tm3-green-700)" style={{ flexShrink: 0, marginTop: 3 }} />
            <span><strong>Originality:</strong> All project assignments, design calculations, and capstone submissions must represent your own authentic work.</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <CheckCircle2 size={18} color="var(--tm3-green-700)" style={{ flexShrink: 0, marginTop: 3 }} />
            <span><strong>Anti-Plagiarism:</strong> Automated code and text similarity detection may be run on submitted models. Submissions found in breach of ethics will be nullified.</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <CheckCircle2 size={18} color="var(--tm3-green-700)" style={{ flexShrink: 0, marginTop: 3 }} />
            <span><strong>Cryptographic Verification:</strong> Each verified certificate contains a unique cryptographic ID and public verification URL. Any alteration of digital certificates is illegal and renders the credential permanently void.</span>
          </div>
        </div>

        <h2>4. Intellectual Property Rights</h2>
        <p>
          All course lectures, proprietary geotechnical dataset benchmarks, engineering calculators, interactive visuals,
          and educational materials available on TerraMatrix Academy are the intellectual property of TerraMatrix Technologies
          or its affiliated instructors, protected under the <strong>Indian Copyright Act, 1957</strong> and international copyright treaties.
        </p>
        <p>
          Learners are granted a limited, personal, non-exclusive, non-transferable license to access the materials for personal educational use. Unauthorized redistribution, recording, or commercial syndication is strictly prohibited.
        </p>

        <h2>5. Acceptable Use & Prohibited Conduct</h2>
        <p>Users shall not:</p>
        <ul>
          <li>Decompile, reverse-engineer, or attempt to extract source code from proprietary engineering calculation engines.</li>
          <li>Introduce malware, automated bots, scrapers, or attempt Denial of Service (DoS) attacks against platform APIs.</li>
          <li>Post or transmit unlawful, defamatory, infringing, or harmful content in community discussion rooms or workshop chats.</li>
        </ul>

        <h2>6. Limitation of Liability & Engineering Disclaimer</h2>
        <p>
          TerraMatrix Academy provides educational curricula and computational models for instructional purposes. While models adhere to industry engineering standards (IS codes, Eurocode, ASTM), the platform calculations are not guaranteed for direct commercial structural certification without independent validation by a licensed Professional Engineer (PE / Chartered Engineer).
        </p>

        <h2>7. Governing Law & Dispute Resolution</h2>
        <p>
          These Terms of Service are governed by and construed in accordance with the laws of India. Any dispute or claim
          arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts
          located in Bengaluru or Kolkata, India.
        </p>
      </div>
    </div>
  );
}
