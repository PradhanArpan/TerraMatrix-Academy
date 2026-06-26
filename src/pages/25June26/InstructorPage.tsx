import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

type Instructor = {
  id: number;
  name: string;
  designation: string;
  company: string;
  expertise: string;
  email: string;
  phone: string;
  bio: string;
  photoUrl: string;
  cvName: string;
  cvData: string;
};

const defaultPhoto = "/hero-dam.jpg";

const sampleInstructors: Instructor[] = [
  {
    id: 1,
    name: "TerraMatrix Faculty",
    designation: "Course Instructor",
    company: "TerraMatrix Academy",
    expertise: "Engineering Training, GIS, Applied Learning",
    email: "",
    phone: "",
    bio: "Instructor profile will be updated by the admin.",
    photoUrl: defaultPhoto,
    cvName: "",
    cvData: "",
  },
];

function normalizePublicAssetPath(value: string) {
  let clean = String(value || "").trim();

  clean = clean.replace(/^[\"']|[\"']$/g, "").trim();
  clean = clean.replace(/\\/g, "/");

  if (clean.startsWith("file:///")) {
    clean = clean.replace("file:///", "");
  }

  const publicUploadsIndex = clean.toLowerCase().indexOf("/public/uploads/");
  if (publicUploadsIndex >= 0) {
    clean = clean.slice(publicUploadsIndex + "/public".length);
  }

  const uploadsIndex = clean.toLowerCase().indexOf("/uploads/");
  if (uploadsIndex >= 0) {
    clean = clean.slice(uploadsIndex);
  }

  if (clean.toLowerCase().startsWith("public/uploads/")) {
    clean = "/" + clean.slice("public/".length);
  }

  if (clean.toLowerCase().startsWith("uploads/")) {
    clean = "/" + clean;
  }

  return clean;
}

function normalizeInstructor(instructor: Partial<Instructor>): Instructor {
  return {
    id: instructor.id || Date.now(),
    name: instructor.name || "Instructor",
    designation: instructor.designation || "Course Instructor",
    company: instructor.company || "TerraMatrix Academy",
    expertise: instructor.expertise || "Engineering Training",
    email: instructor.email || "",
    phone: instructor.phone || "",
    bio: instructor.bio || "Instructor profile will be updated soon.",
    photoUrl: normalizePublicAssetPath(instructor.photoUrl || "") || defaultPhoto,
    cvName: instructor.cvName || "",
    cvData: normalizePublicAssetPath(instructor.cvData || ""),
  };
}

function formatExpertiseKeywords(value: string) {
  return value
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const lower = item.toLowerCase();
      if (lower === "hec-ras") return "RAS";
      if (lower === "hec-hms") return "HMS";
      return item;
    })
    .slice(0, 6)
    .join(", ");
}

function getPdfPreviewUrl(value: string) {
  const url = normalizePublicAssetPath(value);

  const driveFileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveFileMatch?.[1]) {
    return `https://drive.google.com/file/d/${driveFileMatch[1]}/preview`;
  }

  const driveIdMatch = url.match(/[?&]id=([^&]+)/);
  if (url.includes("drive.google.com") && driveIdMatch?.[1]) {
    return `https://drive.google.com/file/d/${driveIdMatch[1]}/preview`;
  }

  if (url.startsWith("/") && !url.includes("#")) {
    return `${url}#toolbar=0&navpanes=0&scrollbar=0`;
  }

  return url;
}

function getBasePdfUrl(value: string) {
  return getPdfPreviewUrl(value).split("#")[0];
}

export default function InstructorPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [pdfViewer, setPdfViewer] = useState<{ title: string; url: string; error?: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("terramatrix_instructors");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setInstructors(
          parsed.map((instructor: Partial<Instructor>) =>
            normalizeInstructor(instructor)
          )
        );
      } catch {
        setInstructors(sampleInstructors);
        localStorage.setItem(
          "terramatrix_instructors",
          JSON.stringify(sampleInstructors)
        );
      }
    } else {
      setInstructors(sampleInstructors);
      localStorage.setItem(
        "terramatrix_instructors",
        JSON.stringify(sampleInstructors)
      );
    }
  }, []);

  const openResume = async (instructor: Instructor) => {
    const previewUrl = getPdfPreviewUrl(instructor.cvData);
    const baseUrl = getBasePdfUrl(instructor.cvData);
    const title = `${instructor.name} Resume`;

    if (!previewUrl) {
      setPdfViewer({
        title,
        url: "",
        error: "Resume file path is not added for this instructor.",
      });
      return;
    }

    if (baseUrl.startsWith("/")) {
      try {
        const response = await fetch(baseUrl, { method: "HEAD" });
        const contentType = response.headers.get("content-type") || "";

        if (!response.ok || contentType.includes("text/html")) {
          setPdfViewer({
            title,
            url: "",
            error: `PDF not found. Check the exact file name and path: ${baseUrl}`,
          });
          return;
        }
      } catch {
        setPdfViewer({
          title,
          url: "",
          error: `PDF could not be opened. Check the exact file name and path: ${baseUrl}`,
        });
        return;
      }
    }

    setPdfViewer({ title, url: previewUrl });
  };

  return (
    <main>
      <section style={heroSection}>
        <h1 style={pageTitle}>Instructor Network</h1>
      </section>

      <section style={contentSection}>
        {instructors.length === 0 ? (
          <div style={emptyState}>No instructors have been added yet.</div>
        ) : (
          <div style={instructorList}>
            {instructors.map((instructor) => (
              <article key={instructor.id} style={instructorCard}>
                <div style={photoColumn}>
                  <div
                    style={{
                      ...passportPhoto,
                      backgroundImage: `linear-gradient(rgba(23,63,53,0.05), rgba(23,63,53,0.05)), url('${instructor.photoUrl}')`,
                    }}
                  />
                </div>

                <div style={infoColumn}>
                  <div style={titleBlock}>
                    <h2 style={instructorName}>{instructor.name}</h2>
                    <p style={designation}>{instructor.designation}</p>
                    <p style={company}>{instructor.company}</p>
                  </div>

                  <div style={expertiseBox}>
                    <span>Tool Expertise</span>
                    <strong style={expertiseKeywordsText}>{formatExpertiseKeywords(instructor.expertise)}</strong>
                  </div>

                  <div style={contactTextBlock}>
                    <span>{instructor.email || "Email not listed"}</span>
                    <span>{instructor.phone || "Phone not listed"}</span>
                  </div>

                  {instructor.cvData ? (
                    <button
                      type="button"
                      onClick={() => openResume(instructor)}
                      style={cvButton}
                    >
                      Resume
                    </button>
                  ) : (
                    <button type="button" disabled style={noCvBadge}>
                      Resume
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {pdfViewer && (
        <div style={modalBackdrop}>
          <div style={pdfModal}>
            <button onClick={() => setPdfViewer(null)} style={closeButton}>×</button>
            <div style={pdfHeader}>
              <h2 style={pdfTitle}>{pdfViewer.title}</h2>
            </div>

            {pdfViewer.error ? (
              <div style={pdfErrorBox}>
                <strong>Resume could not be displayed.</strong>
                <span>{pdfViewer.error}</span>
                <span>Use a path like /uploads/instructors/filename.pdf and ensure the PDF is inside public/uploads/instructors.</span>
              </div>
            ) : (
              <iframe src={pdfViewer.url} title={pdfViewer.title} style={pdfFrame} />
            )}
          </div>
        </div>
      )}
    </main>
  );
}

const heroSection: CSSProperties = {
  maxWidth: "1220px",
  margin: "0 auto",
  padding: "34px 48px 16px",
};

const pageTitle: CSSProperties = {
  color: "#173F35",
  fontSize: "38px",
  lineHeight: "1.12",
  margin: 0,
};

const contentSection: CSSProperties = {
  maxWidth: "1220px",
  margin: "0 auto",
  padding: "14px 48px 70px",
};

const instructorList: CSSProperties = {
  display: "grid",
  gap: "12px",
};

const instructorCard: CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E8E1D2",
  borderRadius: "14px",
  boxShadow: "0 8px 20px rgba(23,63,53,0.045)",
  textAlign: "left",
  display: "grid",
  gridTemplateColumns: "110px 1fr",
  gap: "14px",
  padding: "14px 140px 14px 14px",
  alignItems: "center",
  position: "relative",
};

const photoColumn: CSSProperties = {
  display: "flex",
  justifyContent: "center",
};

const passportPhoto: CSSProperties = {
  width: "92px",
  height: "92px",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundColor: "#DDE9E2",
  borderRadius: "10px",
  border: "1px solid #D8D2C3",
  boxShadow: "0 6px 14px rgba(23,63,53,0.07)",
};

const infoColumn: CSSProperties = {
  minWidth: 0,
  display: "grid",
  gridTemplateColumns: "270px 245px 220px",
  gap: "16px",
  alignItems: "center",
};

const titleBlock: CSSProperties = {
  minWidth: 0,
  alignSelf: "center",
};

const instructorName: CSSProperties = {
  color: "#173F35",
  fontSize: "21px",
  lineHeight: "1.08",
  margin: "0 0 5px",
};

const designation: CSSProperties = {
  color: "#53665E",
  fontWeight: 800,
  margin: "0 0 9px",
  fontSize: "14px",
  lineHeight: "1.1",
};

const company: CSSProperties = {
  color: "#8A661E",
  fontWeight: 800,
  margin: 0,
  fontSize: "14px",
  lineHeight: "1.1",
};

const cvButton: CSSProperties = {
  background: "#D8B25C",
  color: "#173F35",
  textDecoration: "none",
  padding: "8px 13px",
  borderRadius: "999px",
  fontWeight: 850,
  whiteSpace: "nowrap",
  fontSize: "14px",
  position: "absolute",
  top: "50%",
  right: "18px",
  transform: "translateY(-50%)",
};

const noCvBadge: CSSProperties = {
  background: "rgba(216,178,92,0.25)",
  color: "#8A661E",
  border: "1px solid #E8D8B6",
  padding: "8px 13px",
  borderRadius: "999px",
  fontWeight: 850,
  whiteSpace: "nowrap",
  fontSize: "14px",
  cursor: "not-allowed",
  position: "absolute",
  top: "50%",
  right: "18px",
  transform: "translateY(-50%)",
};

const expertiseBox: CSSProperties = {
  background: "transparent",
  border: "none",
  borderRadius: 0,
  padding: 0,
  display: "grid",
  gap: "2px",
  minWidth: 0,
  lineHeight: "1.2",
  justifySelf: "start",
  textAlign: "left",
  width: "245px",
};

const expertiseKeywordsText: CSSProperties = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  color: "#173F35",
  fontSize: "17px",
  lineHeight: "1.2",
  fontWeight: 900,
  maxWidth: "245px",
};

const contactTextBlock: CSSProperties = {
  color: "#173F35",
  fontWeight: 850,
  fontSize: "14px",
  lineHeight: "1.35",
  display: "grid",
  gap: "1px",
  justifyItems: "start",
  textAlign: "left",
  wordBreak: "break-word",
  justifySelf: "start",
  maxWidth: "220px",
};

const emptyState: CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E8E1D2",
  borderRadius: "22px",
  padding: "48px",
  textAlign: "center",
  color: "#53665E",
};

const modalBackdrop: CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.58)", zIndex: 5000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" };
const pdfModal: CSSProperties = { background: "#FFFFFF", borderRadius: "18px", width: "min(980px, 96vw)", height: "min(760px, 90vh)", position: "relative", padding: "18px", display: "grid", gridTemplateRows: "auto 1fr", gap: "12px", boxShadow: "0 22px 70px rgba(0,0,0,0.32)" };
const closeButton: CSSProperties = { position: "absolute", top: "12px", right: "14px", background: "#FFFFFF", border: "1px solid #E8E1D2", borderRadius: "50%", width: "36px", height: "36px", fontSize: "24px", cursor: "pointer", color: "#173F35" };
const pdfHeader: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", paddingRight: "42px" };
const pdfTitle: CSSProperties = { color: "#173F35", fontSize: "22px", margin: 0 };
const pdfFrame: CSSProperties = { width: "100%", height: "100%", border: "1px solid #E8E1D2", borderRadius: "12px", background: "#F7F4EC" };
