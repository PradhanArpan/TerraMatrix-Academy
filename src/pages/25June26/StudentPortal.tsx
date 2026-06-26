import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { CSSProperties } from "react";

type EnrollmentStatus = "Enrolled" | "Course Completed" | "Certificate Issued";

type Enrollment = {
  id: number;
  courseId: number;
  courseTitle: string;
  name: string;
  email: string;
  phone: string;
  organisation: string;
  enrolledAt: string;
  status: EnrollmentStatus;
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
  startDate: string;
  fee: string;
  certificate: string;
  description: string;
  status: "Draft" | "Published";
};

type EventRegistration = {
  id: number;
  kind: "Webinar" | "Workshop";
  eventId: number;
  eventTitle: string;
  category: string;
  theme: string;
  date: string;
  time: string;
  mode: string;
  certification: string;
  name: string;
  email: string;
  phone: string;
  organisation: string;
  message: string;
  submittedAt: string;
  status:
    | "Registered Interest"
    | "Confirmed"
    | "Attended"
    | "Certificate Issued";
};

type LearningVideo = {
  id: number;
  title: string;
  category: string;
  theme: string;
  description: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  level: string;
  status: "Draft" | "Published";
};

type StudentLogin = {
  email: string;
  phone: string;
};

const activeStatuses: EnrollmentStatus[] = [
  "Enrolled",
  "Course Completed",
  "Certificate Issued",
];

const sampleLearningVideos: LearningVideo[] = [
  {
    id: 1,
    title: "Introduction to QGIS for Civil Engineering",
    category: "Geospatial Tools",
    theme: "QGIS",
    description:
      "A short orientation on QGIS interface, layers and basic map preparation.",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "/hero-dam.jpg",
    level: "Foundation",
    status: "Published",
  },
  {
    id: 2,
    title: "Structural Modelling Workflow",
    category: "Design & Analysis",
    theme: "Structural Analysis",
    description:
      "A brief video explaining modelling, loading and interpretation workflow.",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "/hero-dam.jpg",
    level: "Foundation",
    status: "Published",
  },
];

function getSavedLearningVideos() {
  try {
    const saved = localStorage.getItem("terramatrix_learning_videos");
    const parsed: Partial<LearningVideo>[] = saved
      ? JSON.parse(saved)
      : sampleLearningVideos;

    return parsed
      .map((video, index) => ({
        id: video.id || Date.now() + index,
        title: video.title || "Untitled Learning Video",
        category: video.category || "Learning Video",
        theme: video.theme || video.category || "General",
        description: video.description || "Video description will be updated soon.",
        youtubeUrl: video.youtubeUrl || "",
        thumbnailUrl: video.thumbnailUrl || "/hero-dam.jpg",
        level: video.level || "Open",
        status: video.status === "Draft" ? "Draft" : "Published",
      }))
      .filter((video) => video.status === "Published" && video.youtubeUrl)
      .slice(0, 6);
  } catch {
    return sampleLearningVideos;
  }
}

function getYoutubeEmbedUrl(value: string) {
  const url = String(value || "").trim();
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1`;
    }
  }

  return url;
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

function normalizeCourse(course: Partial<Course>): Course {
  return {
    id: course.id || Date.now(),
    title: course.title || "Course",
    shortTitle: course.shortTitle || "",
    category: course.category || "Industry-Oriented Training",
    duration: course.duration || "To be updated",
    level: course.level || "Open",
    mode: course.mode || "Offline",
    imageUrl: course.imageUrl || "/hero-dam.jpg",
    startDate: course.startDate || "To be announced",
    fee: course.fee || "To be announced",
    certificate: normalizeCertification(course.certificate || ""),
    description: course.description || "",
    status: course.status === "Draft" ? "Draft" : "Published",
  };
}

function deriveCompactCourseTitle(title: string) {
  const cleanTitle = String(title || "").trim();
  const usingMatch = cleanTitle.match(/\busing\s+(.+)$/i);

  if (usingMatch?.[1]) {
    return usingMatch[1].trim();
  }

  if (cleanTitle.length > 46) {
    return `${cleanTitle.slice(0, 46).trim()}…`;
  }

  return cleanTitle || "Course";
}

function getCourseCardTitle(course?: Course | null, fallback = "Course") {
  return course?.shortTitle || deriveCompactCourseTitle(course?.title || fallback);
}

function formatEventDate(value: string) {
  if (!value) return "To be announced";

  const parts = value.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    const date = new Date(Number(year), Number(month) - 1, Number(day));

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    }
  }

  return value;
}

export default function StudentPortal() {
  const navigate = useNavigate();
  const [login, setLogin] = useState<StudentLogin | null>(null);
  const [enrolled, setEnrolled] = useState<Enrollment[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);
  const [learningVideos, setLearningVideos] = useState<LearningVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<LearningVideo | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const savedLogin =
      localStorage.getItem("terramatrix_student_login") ||
      sessionStorage.getItem("terramatrix_student_login");

    if (!savedLogin) {
      navigate("/student-login");
      return;
    }

    localStorage.setItem("terramatrix_student_login", savedLogin);
    sessionStorage.setItem("terramatrix_student_login", savedLogin);

    const parsedLogin = JSON.parse(savedLogin);
    setLogin(parsedLogin);

    const savedEnrollments = localStorage.getItem("terramatrix_enrollments");
    const allEnrollments: Enrollment[] = savedEnrollments
      ? JSON.parse(savedEnrollments)
      : [];

    const matched = allEnrollments.filter(
      (item) =>
        item.email.toLowerCase() === parsedLogin.email &&
        item.phone === parsedLogin.phone &&
        activeStatuses.includes(item.status)
    );

    setEnrolled(matched);

    const savedEventRegistrations = localStorage.getItem("terramatrix_event_registrations");
    const allEventRegistrations: EventRegistration[] = savedEventRegistrations
      ? JSON.parse(savedEventRegistrations)
      : [];

    const matchedEvents = allEventRegistrations.filter(
      (item) =>
        item.email?.toLowerCase() === parsedLogin.email ||
        item.phone === parsedLogin.phone
    );

    setEventRegistrations(matchedEvents);

    const savedCourses = localStorage.getItem("terramatrix_courses");
    const allCourses: Course[] = savedCourses
      ? JSON.parse(savedCourses).map((item: Partial<Course>) =>
          normalizeCourse(item)
        )
      : [];

    setCourses(allCourses);
    setLearningVideos(getSavedLearningVideos());
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("terramatrix_student_login");
    sessionStorage.removeItem("terramatrix_student_login");
    navigate("/student-login");
  };

  const getCourse = (enrollment: Enrollment) =>
    courses.find((course) => course.id === enrollment.courseId) ||
    courses.find(
      (course) =>
        course.title.trim().toLowerCase() ===
        enrollment.courseTitle.trim().toLowerCase()
    );

  const studentName =
    enrolled[0]?.name || eventRegistrations[0]?.name || login?.email || "Student";

  const myWebinars = eventRegistrations.filter((item) => item.kind === "Webinar");
  const myWorkshops = eventRegistrations.filter((item) => item.kind === "Workshop");

  return (
    <main>
      <section style={headerSection}>
        <div>
          <div style={studentNameLine}>Name: {studentName}</div>
          {login?.email && <div style={studentEmailLine}>{login.email}</div>}
          <div style={eyebrow}>STUDENT DASHBOARD</div>
          <h1 style={pageTitle}>My Learning Dashboard</h1>
        </div>

        <div style={topActions}>
          <Link to="/webinars" style={secondaryButton}>
            Webinars
          </Link>

          <Link to="/workshops" style={secondaryButton}>
            Workshops
          </Link>

          <Link to="/student" style={secondaryButton}>
            Courses
          </Link>

          <button onClick={logout} style={logoutButton}>
            Logout
          </button>
        </div>
      </section>

      <section style={summarySection}>
        <SummaryBox label="Registered Courses" value={enrolled.length} />
        <SummaryBox
          label="Completed"
          value={
            enrolled.filter(
              (item) =>
                item.status === "Course Completed" ||
                item.status === "Certificate Issued"
            ).length
          }
        />
        <SummaryBox
          label="Certificates"
          value={enrolled.filter((item) => item.status === "Certificate Issued").length}
        />
        <SummaryBox label="Webinars" value={myWebinars.length} />
        <SummaryBox label="Workshops" value={myWorkshops.length} />
      </section>

      <section style={contentSection}>
        <h2 style={sectionTitle}>Registered Courses</h2>

        {enrolled.length === 0 ? (
          <div style={emptyCard}>
            <h2>No enrolled courses found</h2>
            <p>
              Once payment is received and admin enrolls you into a course, it
              will appear here.
            </p>
            <Link to="/student" style={primaryButton}>
              Browse Courses
            </Link>
          </div>
        ) : (
          <div style={courseGrid}>
            {enrolled.map((enrollment) => {
              const course = getCourse(enrollment);
              const classroomCourseId = course?.id || enrollment.courseId;

              return (
                <article key={enrollment.id} style={courseCard}>
                  <div
                    style={{
                      ...courseBanner,
                      backgroundImage: `linear-gradient(90deg, rgba(0,105,92,0.94), rgba(0,105,92,0.58)), url('${course?.imageUrl || "/hero-dam.jpg"}')`,
                    }}
                  >
                    <h2 style={courseBannerTitle}>
                      {getCourseCardTitle(course, enrollment.courseTitle)}
                    </h2>
                    <p style={courseBannerSubtitle}>
                      {course?.category || "Registered Course"}
                    </p>
                  </div>

                  <div style={courseBody}>
                    <span style={enrolledLine}>
                      Status: <strong>{enrollment.status}</strong>
                    </span>

                    <span style={smallMuted}>
                      Duration (in hrs.): {course?.duration || "To be updated"}
                    </span>

                    <span style={smallMuted}>
                      Mode: {course?.mode || "To be updated"}
                    </span>

                    <span style={smallMuted}>
                      Certification: {normalizeCertification(course?.certificate || "")}
                    </span>
                  </div>

                  <div style={courseFooter}>
                    <Link
                      to={`/student-classroom/${classroomCourseId}`}
                      target="_blank"
                      rel="noreferrer"
                      style={primaryButton}
                    >
                      Open LMS Classroom
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <EventRegistrationSection
        title="My Webinars"
        emptyText="No webinar registrations found."
        browseLabel="Browse Webinars"
        browsePath="/webinars"
        items={myWebinars}
      />

      <EventRegistrationSection
        title="My Workshops"
        emptyText="No workshop registrations found."
        browseLabel="Browse Workshops"
        browsePath="/workshops"
        items={myWorkshops}
      />

      <section style={contentSection}>
        <div style={videoSectionHeader}>
          <h2 style={sectionTitle}>Suggested Learning Videos</h2>
          <Link to="/learning-videos" style={secondaryButton}>
            View All Videos
          </Link>
        </div>

        {learningVideos.length === 0 ? (
          <div style={emptyCard}>
            <h2>No learning videos added yet</h2>
            <p>Published learning videos will appear here.</p>
          </div>
        ) : (
          <div style={videoGrid}>
            {learningVideos.map((video) => (
              <article key={video.id} style={videoCard}>
                <div
                  style={{
                    ...videoThumb,
                    backgroundImage: `linear-gradient(90deg, rgba(0,60,50,0.84), rgba(0,90,78,0.38)), url('${video.thumbnailUrl || "/hero-dam.jpg"}')`,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedVideo(video)}
                    style={videoPlayButton}
                  >
                    ▶
                  </button>
                </div>

                <div style={videoBody}>
                  <span style={eventKindLine}>{video.category}</span>
                  <h3 style={videoTitle}>{video.title}</h3>
                  <p style={videoText}>{video.theme}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedVideo && (
        <div style={videoModalBackdrop}>
          <div style={videoModalCard}>
            <button
              type="button"
              onClick={() => setSelectedVideo(null)}
              style={videoCloseButton}
            >
              ×
            </button>

            <h2 style={videoModalTitle}>{selectedVideo.title}</h2>
            <div style={videoFrameWrap}>
              <iframe
                src={getYoutubeEmbedUrl(selectedVideo.youtubeUrl)}
                title={selectedVideo.title}
                style={videoFrame}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function EventRegistrationSection({
  title,
  items,
  emptyText,
  browseLabel,
  browsePath,
}: {
  title: string;
  items: EventRegistration[];
  emptyText: string;
  browseLabel: string;
  browsePath: string;
}) {
  return (
    <section style={contentSection}>
      <h2 style={sectionTitle}>{title}</h2>

      {items.length === 0 ? (
        <div style={emptyCard}>
          <h2>{emptyText}</h2>
          <p>
            When you submit interest using the same email and mobile number, it
            will appear here.
          </p>
          <Link to={browsePath} style={primaryButton}>
            {browseLabel}
          </Link>
        </div>
      ) : (
        <div style={eventGrid}>
          {items.map((item) => (
            <article key={item.id} style={eventCard}>
              <div>
                <div style={eventKindLine}>{item.kind}</div>
                <h3 style={eventCardTitle}>{item.eventTitle}</h3>
                <p style={eventMetaLine}>
                  {item.category} · {item.theme || "General"}
                </p>
              </div>

              <div style={eventInfoGrid}>
                <MiniInfo label="Date" value={formatEventDate(item.date)} />
                <MiniInfo label="Time" value={item.time || "To be announced"} />
                <MiniInfo label="Mode" value={item.mode} />
                <MiniInfo label="Certification" value={normalizeCertification(item.certification)} />
                <MiniInfo label="Status" value={item.status} />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div style={miniInfoBox}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SummaryBox({ label, value }: { label: string; value: number }) {
  return (
    <div style={summaryBox}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

const headerSection: CSSProperties = {
  maxWidth: "1220px",
  margin: "0 auto",
  padding: "58px 48px 28px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "24px",
};

const studentNameLine: CSSProperties = {
  color: "#173F35",
  fontSize: "18px",
  fontWeight: 900,
  marginBottom: "3px",
  textAlign: "left",
};

const studentEmailLine: CSSProperties = {
  color: "#8A661E",
  fontSize: "15px",
  fontWeight: 850,
  marginBottom: "16px",
  textAlign: "left",
};

const eyebrow: CSSProperties = {
  color: "#8A661E",
  fontSize: "14px",
  fontWeight: 900,
  letterSpacing: "1.6px",
  marginBottom: "14px",
};

const pageTitle: CSSProperties = {
  color: "#173F35",
  fontSize: "46px",
  margin: "0 0 12px",
};

const pageText: CSSProperties = {
  color: "#53665E",
  fontSize: "18px",
  lineHeight: "1.7",
  maxWidth: "760px",
  margin: 0,
};

const loginText: CSSProperties = {
  color: "#8A661E",
  fontWeight: 900,
};

const topActions: CSSProperties = {
  display: "flex",
  gap: "12px",
  alignItems: "center",
  flexWrap: "wrap",
  justifyContent: "flex-end",
};

const logoutButton: CSSProperties = {
  background: "#FDE8E8",
  color: "#9B1C1C",
  border: "1px solid #F4C7C7",
  padding: "6px 13px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 900,
  fontSize: "14px",
  lineHeight: "1",
  minHeight: "32px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const summarySection: CSSProperties = {
  maxWidth: "1220px",
  margin: "0 auto",
  padding: "0 48px 14px",
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "12px",
};

const summaryBox: CSSProperties = {
  background: "#DDE9E2",
  border: "1px solid #C9DDD3",
  borderRadius: "12px",
  padding: "6px 12px",
  minHeight: "48px",
  display: "grid",
  gap: "1px",
  alignContent: "center",
  textAlign: "center",
};

const contentSection: CSSProperties = {
  maxWidth: "1220px",
  margin: "0 auto",
  padding: "20px 48px 80px",
};

const sectionTitle: CSSProperties = {
  color: "#173F35",
  fontSize: "30px",
  margin: "0 0 18px",
};

const courseGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(230px, 1fr))",
  gap: "20px",
  alignItems: "stretch",
};

const courseCard: CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E8E1D2",
  borderRadius: "16px",
  overflow: "hidden",
  display: "grid",
  gridTemplateRows: "96px 64px auto",
  boxShadow: "0 10px 24px rgba(23,63,53,0.08)",
};

const courseBanner: CSSProperties = {
  minHeight: "96px",
  height: "96px",
  backgroundSize: "cover",
  backgroundPosition: "center",
  color: "#FFFFFF",
  padding: "14px 16px",
  display: "grid",
  alignContent: "center",
  boxSizing: "border-box",
};

const courseBannerTitle: CSSProperties = {
  color: "#FFFFFF",
  fontSize: "21px",
  lineHeight: "1.15",
  margin: 0,
  textShadow: "0 2px 8px rgba(0,0,0,.45)",
};

const courseBannerSubtitle: CSSProperties = {
  color: "#FFFFFF",
  fontSize: "14px",
  margin: "5px 0 0",
  textShadow: "0 2px 8px rgba(0,0,0,.45)",
};

const courseBody: CSSProperties = {
  minHeight: "64px",
  display: "grid",
  gap: "4px",
  justifyItems: "center",
  alignContent: "center",
  padding: "10px 14px",
  textAlign: "center",
};

const enrolledLine: CSSProperties = {
  color: "#173F35",
  fontSize: "16px",
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const smallMuted: CSSProperties = {
  color: "#53665E",
  fontSize: "13px",
  fontWeight: 800,
};

const courseFooter: CSSProperties = {
  borderTop: "1px solid #E8E1D2",
  padding: "12px 14px",
  display: "flex",
  justifyContent: "center",
};

const primaryButton: CSSProperties = {
  background: "#173F35",
  color: "#FFFFFF",
  textDecoration: "none",
  border: "none",
  padding: "8px 14px",
  borderRadius: "9px",
  cursor: "pointer",
  fontWeight: 900,
  fontSize: "14px",
  lineHeight: "1.1",
  minHeight: "34px",
  display: "inline-flex",
  alignItems: "center",
  width: "fit-content",
};

const secondaryButton: CSSProperties = {
  background: "#DDE9E2",
  color: "#173F35",
  textDecoration: "none",
  border: "1px solid #C9DDD3",
  padding: "6px 13px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 900,
  fontSize: "14px",
  lineHeight: "1",
  minHeight: "32px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const emptyCard: CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E8E1D2",
  borderRadius: "20px",
  padding: "42px",
  textAlign: "center",
};

const eventGrid: CSSProperties = {
  display: "grid",
  gap: "14px",
};

const eventCard: CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E8E1D2",
  borderRadius: "18px",
  padding: "18px",
  display: "grid",
  gridTemplateColumns: "1fr 1.2fr",
  gap: "16px",
  alignItems: "center",
  textAlign: "left",
  boxShadow: "0 12px 28px rgba(23,63,53,0.06)",
};

const eventKindLine: CSSProperties = {
  color: "#8A661E",
  fontSize: "13px",
  fontWeight: 900,
  letterSpacing: "1.4px",
};

const eventCardTitle: CSSProperties = {
  color: "#173F35",
  margin: "4px 0",
  fontSize: "20px",
  lineHeight: "1.2",
};

const eventMetaLine: CSSProperties = {
  color: "#53665E",
  margin: 0,
  fontWeight: 800,
};

const eventInfoGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(130px, 1fr))",
  gap: "8px",
};

const miniInfoBox: CSSProperties = {
  background: "#FBFAF6",
  border: "1px solid #E8E1D2",
  borderRadius: "12px",
  padding: "9px 10px",
  display: "grid",
  gap: "2px",
  color: "#53665E",
  fontSize: "12px",
};

const videoSectionHeader: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "14px",
  marginBottom: "14px",
};

const videoGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "14px",
};

const videoCard: CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E8E1D2",
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0 12px 28px rgba(23,63,53,0.06)",
};

const videoThumb: CSSProperties = {
  minHeight: "130px",
  backgroundSize: "cover",
  backgroundPosition: "center",
  display: "grid",
  placeItems: "center",
};

const videoPlayButton: CSSProperties = {
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  border: "none",
  background: "#DEB552",
  color: "#173F35",
  fontSize: "18px",
  cursor: "pointer",
  fontWeight: 900,
};

const videoBody: CSSProperties = {
  padding: "13px",
  textAlign: "left",
};

const videoTitle: CSSProperties = {
  color: "#173F35",
  fontSize: "17px",
  lineHeight: "1.2",
  margin: "5px 0 4px",
};

const videoText: CSSProperties = {
  color: "#53665E",
  margin: 0,
  fontWeight: 800,
};

const videoModalBackdrop: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.62)",
  zIndex: 5000,
  display: "grid",
  placeItems: "center",
  padding: "24px",
};

const videoModalCard: CSSProperties = {
  background: "#FFFFFF",
  borderRadius: "18px",
  width: "min(980px, 94vw)",
  padding: "18px",
  position: "relative",
};

const videoCloseButton: CSSProperties = {
  position: "absolute",
  right: "16px",
  top: "14px",
  width: "38px",
  height: "38px",
  borderRadius: "50%",
  border: "1px solid #E8E1D2",
  background: "#FFFFFF",
  color: "#173F35",
  fontSize: "24px",
  cursor: "pointer",
};

const videoModalTitle: CSSProperties = {
  color: "#173F35",
  margin: "0 50px 14px 0",
  fontSize: "22px",
};

const videoFrameWrap: CSSProperties = {
  position: "relative",
  paddingTop: "56.25%",
  borderRadius: "12px",
  overflow: "hidden",
  background: "#111",
};

const videoFrame: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  border: "none",
};


