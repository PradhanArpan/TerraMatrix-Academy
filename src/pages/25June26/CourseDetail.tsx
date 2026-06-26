import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { CSSProperties, ReactNode } from "react";

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
  cvName?: string;
  cvData?: string;
};

type Course = {
  id: number;
  title: string;
  shortTitle: string;
  category: string;
  duration: string;
  level: string;
  mode: string;
  imageUrl: string;
  instructorName: string;
  instructorDesignation: string;
  instructorIds: number[];
  startDate: string;
  fee: string;
  certificate: string;
  description: string;
  outcomes: string;
  brochureName: string;
  brochureData: string;
  status: "Draft" | "Published";
  onlineSessionLink: string;
  onlineSessionDate: string;
  onlineSessionTime: string;
  recordingLink: string;
  materialTitle: string;
  materialDescription: string;
  materialFileName: string;
  materialFileData: string;
  assignmentTitle: string;
  assignmentInstructions: string;
};

type EnquiryForm = {
  name: string;
  email: string;
  phone: string;
  organisation: string;
  message: string;
};

type EnquiryErrors = {
  name?: string;
  email?: string;
  phone?: string;
};

const emptyEnquiryForm: EnquiryForm = {
  name: "",
  email: "",
  phone: "",
  organisation: "",
  message: "",
};

function normalizeCourse(course: Partial<Course>): Course {
  return {
    id: course.id || Date.now(),
    title: course.title || "Untitled Course",
    shortTitle: course.shortTitle || "",
    category: course.category || "Industry-Oriented Training",
    duration: course.duration || "To be updated",
    level: course.level || "Open",
    mode: course.mode || "Offline",
    imageUrl: normalizePublicAssetPath(course.imageUrl || "") || "/hero-dam.jpg",
    instructorName: course.instructorName || "TerraMatrix Faculty",
    instructorDesignation: course.instructorDesignation || "Course Instructor",
    instructorIds: Array.isArray(course.instructorIds) ? course.instructorIds : [],
    startDate: course.startDate || "To be announced",
    fee: course.fee || "To be announced",
    certificate: normalizeCertification(course.certificate || ""),
    description: course.description || "Course description will be updated soon.",
    outcomes: course.outcomes || "Learning outcomes will be updated soon.",
    brochureName: course.brochureName || "",
    brochureData: normalizePublicAssetPath(course.brochureData || ""),
    status: course.status === "Draft" ? "Draft" : "Published",
    onlineSessionLink: course.onlineSessionLink || "",
    onlineSessionDate: course.onlineSessionDate || "",
    onlineSessionTime: course.onlineSessionTime || "",
    recordingLink: course.recordingLink || "",
    materialTitle: course.materialTitle || "",
    materialDescription: course.materialDescription || "",
    materialFileName: course.materialFileName || "",
    materialFileData: normalizePublicAssetPath(course.materialFileData || ""),
    assignmentTitle: course.assignmentTitle || "",
    assignmentInstructions: course.assignmentInstructions || "",
  };
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
    bio: instructor.bio || "",
    photoUrl: normalizePublicAssetPath(instructor.photoUrl || "") || "/hero-dam.jpg",
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
    .join(", ");
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim().toLowerCase());
}

function cleanPhone(phone: string) {
  let cleaned = phone.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("+91")) cleaned = cleaned.slice(3);
  else if (cleaned.startsWith("91") && cleaned.length === 12) cleaned = cleaned.slice(2);
  else if (cleaned.startsWith("0") && cleaned.length === 11) cleaned = cleaned.slice(1);
  return /^[6-9]\d{9}$/.test(cleaned) ? cleaned : null;
}

function validateEnquiryForm(form: EnquiryForm) {
  const errors: EnquiryErrors = {};
  const name = form.name.trim();
  const email = form.email.trim();
  const phone = form.phone.trim();

  if (!name) errors.name = "Please enter your name.";
  if (!email) errors.email = "Please enter your email address.";
  else if (!isValidEmail(email)) errors.email = "Please enter a valid email address.";

  const validPhone = cleanPhone(phone);
  if (!phone) errors.phone = "Please enter your phone number.";
  else if (!validPhone) errors.phone = "Enter a valid Indian mobile number starting with 6, 7, 8 or 9.";

  return { errors, validPhone, hasErrors: Object.keys(errors).length > 0 };
}

function formatDisplayDate(value: string) {
  if (!value) return "To be announced";
  const parts = value.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (!Number.isNaN(date.getTime())) {
      const monthName = date.toLocaleString("en-IN", { month: "long" });
      return `${day}-${monthName}-${year}`;
    }
  }
  return value;
}

function formatFee(value: string) {
  if (!value) return "To be announced";
  if (value.toLowerCase().includes("free") || value.toLowerCase().includes("tba")) return value;
  return value.replace(/^₹\s*/, "");
}


function normalizeCertification(value: string) {
  const clean = String(value || "").trim().toLowerCase();

  if (
    clean === "participation certificate" ||
    clean === "certificate of participation" ||
    clean === "participation" ||
    clean === "no" ||
    clean === "to be announced"
  ) {
    return "Participation Certificate";
  }

  return "Completion Certificate";
}
function getOutcomeItems(value: string) {
  return String(value || "")
    .split(/\r?\n|;/)
    .map((item) =>
      item
        .replace(/^\s*(?:\d+[.)-]?|[-•])\s*/, "")
        .trim()
    )
    .filter(Boolean)
    .filter((item) => {
      const lower = item.toLowerCase();
      return (
        lower !== "learning outcomes will be updated soon." &&
        lower !== "by the end of this programme, students will be able to:" &&
        lower !== "by the end of this program, students will be able to:"
      );
    })
    .slice(0, 5);
}

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

export default function CourseDetail() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [pdfViewer, setPdfViewer] = useState<{ title: string; url: string; error?: string } | null>(null);
  const [enquiryForm, setEnquiryForm] = useState<EnquiryForm>(emptyEnquiryForm);
  const [enquiryErrors, setEnquiryErrors] = useState<EnquiryErrors>({});

  useEffect(() => {
    const savedCourses = localStorage.getItem("terramatrix_courses");
    const savedInstructors = localStorage.getItem("terramatrix_instructors");

    if (savedCourses) {
      try {
        const allCourses: Course[] = JSON.parse(savedCourses).map(
          (item: Partial<Course>) => normalizeCourse(item)
        );

        const matchedCourse = allCourses.find(
          (item) => item.id === Number(courseId) && item.status === "Published"
        );

        setCourse(matchedCourse || null);
      } catch {
        setCourse(null);
      }
    }

    if (savedInstructors) {
      try {
        setInstructors(
          JSON.parse(savedInstructors).map((item: Partial<Instructor>) =>
            normalizeInstructor(item)
          )
        );
      } catch {
        setInstructors([]);
      }
    }
  }, [courseId]);

  const linkedInstructors =
    course && course.instructorIds.length > 0
      ? instructors.filter((instructor) =>
          course.instructorIds.includes(instructor.id)
        )
      : [];

  const fallbackInstructors =
    course && linkedInstructors.length === 0
      ? [
          {
            id: 0,
            name: course.instructorName || "TerraMatrix Faculty",
            designation: course.instructorDesignation || "Course Instructor",
            company: "TerraMatrix Academy",
            expertise: "",
            email: "",
            phone: "",
            bio: "",
            photoUrl: "/hero-dam.jpg",
            cvName: "",
            cvData: "",
          },
        ]
      : [];

  const courseInstructors =
    linkedInstructors.length > 0 ? linkedInstructors : fallbackInstructors;

  const outcomeItems = course ? getOutcomeItems(course.outcomes) : [];

  const submitEnquiry = () => {
    if (!course) return;

    const { errors, validPhone, hasErrors } = validateEnquiryForm(enquiryForm);
    setEnquiryErrors(errors);

    if (hasErrors || !validPhone) {
      alert("Please correct the highlighted email / phone details before submitting.");
      return;
    }

    const existing = localStorage.getItem("terramatrix_enquiries");
    const enquiries = existing ? JSON.parse(existing) : [];

    const newEnquiry = {
      id: Date.now(),
      courseId: course.id,
      courseTitle: course.title,
      name: enquiryForm.name.trim(),
      email: enquiryForm.email.trim().toLowerCase(),
      phone: validPhone,
      organisation: enquiryForm.organisation.trim(),
      message: enquiryForm.message.trim(),
      submittedAt: new Date().toLocaleString(),
      status: "New Enquiry",
      paymentLink: "",
    };

    localStorage.setItem(
      "terramatrix_enquiries",
      JSON.stringify([newEnquiry, ...enquiries])
    );

    setShowEnquiry(false);
    setEnquiryForm(emptyEnquiryForm);
    setEnquiryErrors({});
    alert("Your interest has been registered. The admin team will send payment details.");
  };

  const openPdf = async (title: string, value: string, missingMessage: string) => {
    const previewUrl = getPdfPreviewUrl(value);
    const baseUrl = getBasePdfUrl(value);

    if (!previewUrl) {
      setPdfViewer({
        title,
        url: "",
        error: missingMessage,
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

  if (!course) {
    return (
      <main style={notFoundPage}>
        <div style={notFoundCard}>
          <h1>Course not found</h1>
          <p>The course may be unpublished or removed.</p>
          <Link to="/student" style={primaryLink}>Back to Courses</Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <section style={{ ...hero, backgroundImage: `linear-gradient(90deg, rgba(7,45,37,0.94), rgba(7,45,37,0.72), rgba(7,45,37,0.15)), url('${course.imageUrl}')` }}>
        <div style={heroContent}>
          <div style={heroTopRow}>
            <Link to="/student" style={backLink}>← Back to Courses</Link>

            <div style={badgeRow}>
              <span style={categoryBadge}>{course.category}</span>
              <span style={levelBadge}>{course.level}</span>
            </div>
          </div>

          <h1 style={heroTitle}>{course.title}</h1>
          <div style={heroButtonRow}>
            <button onClick={() => setShowEnquiry(true)} style={heroButton}>
              Register Interest
            </button>

            {course.brochureData ? (
              <button
                type="button"
                onClick={() =>
                  openPdf(
                    "Course Content",
                    course.brochureData,
                    "Course content file path is not added."
                  )
                }
                style={courseContentButton}
              >
                Course Content
              </button>
            ) : (
              <button
                type="button"
                disabled
                style={courseContentDisabledButton}
              >
                Course Content
              </button>
            )}
          </div>
        </div>
      </section>

      <section style={contentLayout}>
        <div style={mainColumn}>
          <Section title="Course Overview">
            <p style={bodyText}>{course.description}</p>
          </Section>

          <Section title="Learning Outcomes">
            <p style={outcomeIntro}>By the end of this programme, students will be able to:</p>
            {outcomeItems.length > 0 ? (
              <ol style={outcomeList}>
                {outcomeItems.map((outcome, index) => (
                  <li key={`${outcome}-${index}`}>{outcome}</li>
                ))}
              </ol>
            ) : (
              <p style={bodyText}>Learning outcomes will be updated soon.</p>
            )}
          </Section>

          <Section title="Access After Enrollment">
            <ul style={accessList}>
              <li><strong>Live Sessions</strong></li>
              <li><strong>Course Materials</strong></li>
              <li><strong>Session Recordings</strong></li>
              <li><strong>Assignments</strong></li>
              <li><strong>Completion Certificate</strong></li>
            </ul>
          </Section>

          <Section title="Instructor(s)">
            <div style={instructorList}>
              {courseInstructors.map((instructor) => (
                <article key={instructor.id} style={instructorCard}>
                  <div style={{ ...instructorPhoto, backgroundImage: `url('${instructor.photoUrl}')` }} />
                  <div style={instructorInfo}>
                    <h3 style={instructorName}>{instructor.name}</h3>
                    <p style={instructorDesignation}>{instructor.designation}</p>
                    <p style={instructorCompany}>{instructor.company}</p>
                    {instructor.expertise && (
                      <p style={instructorExpertise}><strong>Tool Expertise:</strong> {formatExpertiseKeywords(instructor.expertise)}</p>
                    )}
                  </div>

                  {instructor.cvData ? (
                    <button
                      type="button"
                      onClick={() =>
                        openPdf(
                          `${instructor.name} Resume`,
                          instructor.cvData || "",
                          "Resume file path is not added for this instructor."
                        )
                      }
                      style={resumeButton}
                    >
                      Resume
                    </button>
                  ) : (
                    <button type="button" disabled style={resumeButtonDisabled}>
                      Resume
                    </button>
                  )}
                </article>
              ))}
            </div>
          </Section>
        </div>

        <aside style={sidePanel}>
          <h2 style={sideTitle}>Course Details</h2>
          <Info label="Duration" value={course.duration} />
          <Info label="Mode" value={course.mode} />
          <Info label="Start Date" value={formatDisplayDate(course.startDate)} />
          <Info label="Fee (in Rs.)" value={formatFee(course.fee)} />
          <Info label="Certificate" value={normalizeCertification(course.certificate)} />
          <button onClick={() => setShowEnquiry(true)} style={sideButton}>Register Interest</button>
        </aside>
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
                <strong>File could not be displayed.</strong>
                <span>{pdfViewer.error}</span>
                <span>Use a path like /uploads/documents/file.pdf or /uploads/instructors/file.pdf.</span>
              </div>
            ) : (
              <iframe src={pdfViewer.url} title={pdfViewer.title} style={pdfFrame} />
            )}
          </div>
        </div>
      )}

      {showEnquiry && (
        <div style={modalBackdrop}>
          <div style={modal}>
            <button onClick={() => setShowEnquiry(false)} style={closeButton}>×</button>
            <div style={eyebrow}>REGISTER INTEREST</div>
            <h2 style={modalTitle}>{course.title}</h2>

            <div style={formGrid}>
              <Field label="Name">
                <input value={enquiryForm.name} onChange={(e) => { setEnquiryForm({ ...enquiryForm, name: e.target.value }); setEnquiryErrors({ ...enquiryErrors, name: "" }); }} style={enquiryErrors.name ? inputErrorStyle : inputStyle} placeholder="Your name" />
                <ErrorMessage message={enquiryErrors.name} />
              </Field>

              <Field label="Email">
                <input type="email" inputMode="email" value={enquiryForm.email} onChange={(e) => { setEnquiryForm({ ...enquiryForm, email: e.target.value }); setEnquiryErrors({ ...enquiryErrors, email: "" }); }} style={enquiryErrors.email ? inputErrorStyle : inputStyle} placeholder="email@example.com" />
                <ErrorMessage message={enquiryErrors.email} />
              </Field>

              <Field label="Phone">
                <input type="tel" inputMode="numeric" value={enquiryForm.phone} onChange={(e) => { setEnquiryForm({ ...enquiryForm, phone: e.target.value }); setEnquiryErrors({ ...enquiryErrors, phone: "" }); }} style={enquiryErrors.phone ? inputErrorStyle : inputStyle} placeholder="10-digit Indian mobile number" />
                <ErrorMessage message={enquiryErrors.phone} />
              </Field>

              <Field label="Organisation / Institution">
                <input value={enquiryForm.organisation} onChange={(e) => setEnquiryForm({ ...enquiryForm, organisation: e.target.value })} style={inputStyle} placeholder="Institution / company" />
              </Field>
            </div>

            <Field label="Message / Requirement">
              <textarea value={enquiryForm.message} onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })} style={textareaStyle} placeholder="Any specific requirement or question?" />
            </Field>

            <button onClick={submitEnquiry} style={sideButton}>Submit Interest</button>
          </div>
        </div>
      )}
    </main>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={sectionBox}>
      <h2 style={sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div style={infoBox}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={fieldBlock}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function ErrorMessage({ message }: { message?: string }) {
  if (!message) return null;
  return <span style={errorText}>{message}</span>;
}

const hero: CSSProperties = { minHeight: "210px", backgroundSize: "cover", backgroundPosition: "center 45%" };
const heroContent: CSSProperties = { maxWidth: "1220px", margin: "0 auto", padding: "24px 48px", color: "#FFFFFF", textAlign: "left", display: "flex", flexDirection: "column", alignItems: "flex-start" };
const heroTopRow: CSSProperties = { width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", marginBottom: "10px" };
const backLink: CSSProperties = { color: "#F0E6CF", textDecoration: "none", fontWeight: 900, display: "inline-block", marginBottom: 0 };
const badgeRow: CSSProperties = { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: 0, justifyContent: "flex-end" };
const categoryBadge: CSSProperties = { background: "#F0E6CF", color: "#173F35", padding: "6px 11px", borderRadius: "999px", fontSize: "13px", fontWeight: 900 };
const levelBadge: CSSProperties = { background: "#EAF3EE", color: "#35584D", padding: "6px 11px", borderRadius: "999px", fontSize: "13px", fontWeight: 900 };
const heroTitle: CSSProperties = { color: "#FFFFFF", fontSize: "34px", lineHeight: "1.1", margin: "0 0 6px", maxWidth: "850px", textShadow: "0 4px 18px rgba(0,0,0,0.35)" };
const heroText: CSSProperties = { color: "#F3F7F4", fontSize: "15px", lineHeight: "1.4", maxWidth: "790px", margin: "0 0 12px" };
const heroButtonRow: CSSProperties = { width: "100%", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" };
const heroButton: CSSProperties = { background: "#D8B25C", color: "#173F35", border: "none", padding: "10px 16px", borderRadius: "9px", cursor: "pointer", fontWeight: 900 };
const courseContentButton: CSSProperties = { background: "#D8B25C", color: "#173F35", border: "none", padding: "10px 16px", borderRadius: "9px", textDecoration: "none", fontWeight: 900, cursor: "pointer", font: "inherit" };
const courseContentDisabledButton: CSSProperties = { background: "rgba(255,255,255,0.22)", color: "#F0E6CF", border: "1px solid rgba(255,255,255,0.45)", padding: "10px 16px", borderRadius: "9px", fontWeight: 900, cursor: "not-allowed" };
const contentLayout: CSSProperties = { maxWidth: "1220px", margin: "0 auto", padding: "22px 48px 64px", display: "grid", gridTemplateColumns: "1fr 300px", gap: "22px", alignItems: "start", textAlign: "left" };
const mainColumn: CSSProperties = { display: "grid", gap: "12px" };
const sectionBox: CSSProperties = { background: "#FFFFFF", border: "1px solid #E8E1D2", borderRadius: "12px", padding: "12px 16px", boxShadow: "0 6px 16px rgba(23,63,53,0.035)", textAlign: "left" };
const sectionTitle: CSSProperties = { color: "#173F35", margin: "0 0 6px", fontSize: "22px", lineHeight: "1.2", textAlign: "left" };
const bodyText: CSSProperties = { color: "#53665E", fontSize: "15.5px", lineHeight: "1.5", margin: 0, textAlign: "justify" };
const outcomeIntro: CSSProperties = { color: "#53665E", fontSize: "15.5px", lineHeight: "1.5", margin: "0 0 8px", textAlign: "justify" };
const outcomeList: CSSProperties = { margin: 0, paddingLeft: "22px", color: "#53665E", fontSize: "15.5px", lineHeight: "1.6", textAlign: "justify", display: "grid", gap: "6px" };
const accessList: CSSProperties = { margin: 0, paddingLeft: "22px", color: "#173F35", fontSize: "16px", lineHeight: "1.75", textAlign: "left", display: "grid", gap: "3px" };
const sidePanel: CSSProperties = { position: "sticky", top: "104px", background: "#FFFFFF", border: "1px solid #E8E1D2", borderRadius: "12px", padding: "14px", boxShadow: "0 8px 20px rgba(23,63,53,0.045)", display: "grid", gap: "7px", textAlign: "left" };
const sideTitle: CSSProperties = { color: "#173F35", margin: "0 0 4px", fontSize: "22px", textAlign: "left" };
const infoBox: CSSProperties = { background: "#FBFAF6", border: "1px solid #E8E1D2", borderRadius: "9px", padding: "7px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", color: "#173F35", minHeight: "30px", flexWrap: "wrap", textAlign: "left", lineHeight: "1.25" };
const sideButton: CSSProperties = { background: "#173F35", color: "#FFFFFF", border: "none", padding: "9px 14px", borderRadius: "9px", cursor: "pointer", fontWeight: 900 };
const instructorList: CSSProperties = { display: "grid", gap: "10px" };
const instructorCard: CSSProperties = { display: "grid", gridTemplateColumns: "88px 1fr auto", gap: "14px", alignItems: "center", background: "#FBFAF6", border: "1px solid #E8E1D2", borderRadius: "10px", padding: "10px 12px", textAlign: "left" };
const instructorPhoto: CSSProperties = { width: "88px", height: "88px", borderRadius: "10px", backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#DDE9E2" };
const instructorInfo: CSSProperties = { display: "grid", gap: "2px", textAlign: "left", justifyItems: "start", alignContent: "center" };
const instructorName: CSSProperties = { color: "#173F35", fontSize: "17px", margin: 0, textAlign: "left", lineHeight: "1.2" };
const instructorDesignation: CSSProperties = { color: "#53665E", fontWeight: 900, margin: 0, textAlign: "left", lineHeight: "1.2" };
const instructorCompany: CSSProperties = { color: "#8A661E", fontWeight: 900, margin: 0, textAlign: "left", lineHeight: "1.2" };
const instructorExpertise: CSSProperties = { color: "#53665E", margin: "2px 0 0", textAlign: "left", lineHeight: "1.25", display: "block", overflow: "visible", whiteSpace: "normal", wordBreak: "break-word" };
const resumeButton: CSSProperties = { background: "#DEB552", color: "#173F35", border: "none", borderRadius: "999px", padding: "10px 16px", fontWeight: 900, textDecoration: "none", whiteSpace: "nowrap", justifySelf: "end", cursor: "pointer", font: "inherit" };
const resumeButtonDisabled: CSSProperties = { ...resumeButton, background: "#E6E0D2", color: "#8A7A5C", cursor: "not-allowed" };
const notFoundPage: CSSProperties = { minHeight: "calc(100vh - 90px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" };
const notFoundCard: CSSProperties = { background: "#FFFFFF", border: "1px solid #E8E1D2", borderRadius: "18px", padding: "34px", textAlign: "center" };
const primaryLink: CSSProperties = { display: "inline-block", marginTop: "12px", background: "#173F35", color: "#FFFFFF", textDecoration: "none", padding: "12px 18px", borderRadius: "10px", fontWeight: 900 };
const modalBackdrop: CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 5000, display: "flex", alignItems: "center", justifyContent: "center", padding: "30px" };
const modal: CSSProperties = { background: "#FFFFFF", borderRadius: "22px", maxWidth: "760px", width: "100%", maxHeight: "88vh", overflow: "auto", position: "relative", padding: "34px", textAlign: "left" };
const pdfModal: CSSProperties = { background: "#FFFFFF", borderRadius: "18px", width: "min(1120px, 92vw)", maxHeight: "90vh", overflow: "hidden", position: "relative", padding: "18px", textAlign: "left" };
const pdfHeader: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "10px", paddingRight: "46px" };
const pdfTitle: CSSProperties = { color: "#173F35", margin: 0, fontSize: "22px", lineHeight: "1.2" };
const pdfFrame: CSSProperties = { width: "100%", height: "74vh", border: "1px solid #E8E1D2", borderRadius: "10px", background: "#F7F7F4" };
const pdfErrorBox: CSSProperties = { minHeight: "260px", border: "1px solid #E8E1D2", borderRadius: "12px", background: "#FBFAF6", padding: "28px", display: "grid", alignContent: "center", gap: "10px", color: "#173F35", fontSize: "16px", lineHeight: "1.45" };
const closeButton: CSSProperties = { position: "absolute", top: "14px", right: "16px", background: "#FFFFFF", border: "1px solid #E8E1D2", borderRadius: "50%", width: "36px", height: "36px", fontSize: "24px", cursor: "pointer", color: "#173F35" };
const eyebrow: CSSProperties = { color: "#8A661E", fontSize: "14px", fontWeight: 900, letterSpacing: "1.6px", marginBottom: "12px" };
const modalTitle: CSSProperties = { color: "#173F35", fontSize: "30px", margin: "0 0 20px" };
const formGrid: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" };
const fieldBlock: CSSProperties = { display: "grid", gap: "7px", color: "#35584D", fontSize: "14px", fontWeight: 800, marginBottom: "14px", textAlign: "left" };
const inputStyle: CSSProperties = { width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: "11px", border: "1px solid #D8D2C3", fontSize: "15px", outline: "none", background: "#FFFFFF" };
const inputErrorStyle: CSSProperties = { ...inputStyle, border: "1px solid #B42318", background: "#FFF7F7" };
const textareaStyle: CSSProperties = { ...inputStyle, minHeight: "96px", resize: "vertical" };
const errorText: CSSProperties = { color: "#B42318", fontSize: "13px", fontWeight: 700, lineHeight: "1.4" };
