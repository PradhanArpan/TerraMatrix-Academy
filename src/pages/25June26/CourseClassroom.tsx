import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { CSSProperties, ReactNode } from "react";

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
  category: string;
  duration: string;
  level: string;
  mode: string;
  imageUrl: string;
  startDate: string;
  fee: string;
  certificate: string;
  description: string;
  outcomes: string;
  brochureName: string;
  brochureData: string;
  onlineSessionLink: string;
  onlineSessionDate: string;
  onlineSessionTime: string;
  recordingLink: string;
};

type StudentLoginData = {
  email: string;
  phone: string;
};

type ClassworkType = "announcement" | "material" | "assignment" | "link" | "recording";

type ClassworkItem = {
  id: number;
  courseId: number;
  type: ClassworkType;
  title: string;
  instructions: string;
  link: string;
  fileName: string;
  fileData: string;
  dueDate: string;
  postedAt: string;
};

type AssignmentSubmission = {
  id: number;
  courseId: number;
  itemId: number;
  email: string;
  phone: string;
  response: string;
  fileName: string;
  fileData: string;
  submittedAt: string;
};

type AttendanceRecord = {
  id: number;
  courseId: number;
  email: string;
  phone: string;
  markedAt: string;
};

type ClassSchedule = {
  id: number;
  courseId: number;
  date: string;
  time: string;
  note: string;
};

type ActiveTab = "stream" | "classwork" | "progress";

const eligibleStatuses: EnrollmentStatus[] = [
  "Enrolled",
  "Course Completed",
  "Certificate Issued",
];

const classworkTypeLabels: Record<ClassworkType, string> = {
  announcement: "Announcement",
  material: "Material",
  assignment: "Assignment",
  link: "Link",
  recording: "Recording",
};

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
    category: course.category || "Industry-Oriented Training",
    duration: course.duration || "To be updated",
    level: course.level || "Open",
    mode: course.mode || "Offline",
    imageUrl: course.imageUrl || "/hero-dam.jpg",
    startDate: course.startDate || "To be announced",
    fee: course.fee || "To be announced",
    certificate: normalizeCertification(course.certificate || ""),
    description: course.description || "",
    outcomes: course.outcomes || "",
    brochureName: course.brochureName || "",
    brochureData: course.brochureData || "",
    onlineSessionLink: course.onlineSessionLink || "",
    onlineSessionDate: course.onlineSessionDate || "",
    onlineSessionTime: course.onlineSessionTime || "",
    recordingLink: course.recordingLink || "",
  };
}

function normalizeClassworkItem(item: Partial<ClassworkItem>): ClassworkItem {
  return {
    id: item.id || Date.now(),
    courseId: item.courseId || 0,
    type:
      item.type === "material" ||
      item.type === "assignment" ||
      item.type === "link" ||
      item.type === "recording" ||
      item.type === "announcement"
        ? item.type
        : "announcement",
    title: item.title || "Untitled",
    instructions: item.instructions || "",
    link: item.link || "",
    fileName: item.fileName || "",
    fileData: item.fileData || "",
    dueDate: item.dueDate || "",
    postedAt: item.postedAt || new Date().toLocaleString(),
  };
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

export default function CourseClassroom() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [login, setLogin] = useState<StudentLoginData | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [items, setItems] = useState<ClassworkItem[]>([]);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("stream");
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [files, setFiles] = useState<Record<number, { fileName: string; fileData: string }>>({});

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

    const savedCourses = localStorage.getItem("terramatrix_courses");
    const allCourses: Course[] = savedCourses
      ? JSON.parse(savedCourses).map((item: Partial<Course>) =>
          normalizeCourse(item)
        )
      : [];

    const routeCourseId = Number(courseId);
    let matchedCourse =
      allCourses.find((item) => item.id === routeCourseId) || null;

    const savedEnrollments = localStorage.getItem("terramatrix_enrollments");
    const allEnrollments: Enrollment[] = savedEnrollments
      ? JSON.parse(savedEnrollments)
      : [];

    const matchedEnrollment = allEnrollments.find((item) => {
      const sameStudent =
        item.email.toLowerCase() === parsedLogin.email &&
        item.phone === parsedLogin.phone &&
        eligibleStatuses.includes(item.status);

      if (!sameStudent) return false;

      const sameCourseId = item.courseId === routeCourseId;
      const sameCourseTitle =
        matchedCourse &&
        item.courseTitle.trim().toLowerCase() ===
          matchedCourse.title.trim().toLowerCase();

      return sameCourseId || Boolean(sameCourseTitle);
    });

    if (!matchedEnrollment) {
      navigate("/student-portal");
      return;
    }

    if (!matchedCourse) {
      matchedCourse =
        allCourses.find(
          (item) =>
            item.title.trim().toLowerCase() ===
            matchedEnrollment.courseTitle.trim().toLowerCase()
        ) || null;
    }

    if (!matchedCourse) {
      matchedCourse = normalizeCourse({
        id: matchedEnrollment.courseId || routeCourseId,
        title: matchedEnrollment.courseTitle,
      });
    }

    const activeCourseId = matchedCourse.id;

    setCourse(matchedCourse);
    setEnrollment(matchedEnrollment);

    const savedClasswork = localStorage.getItem("terramatrix_classwork_items");
    const allItems: ClassworkItem[] = savedClasswork
      ? JSON.parse(savedClasswork).map((item: Partial<ClassworkItem>) =>
          normalizeClassworkItem(item)
        )
      : [];

    setItems(
      allItems
        .filter((item) => item.courseId === activeCourseId)
        .sort((a, b) => b.id - a.id)
    );

    const savedSchedules = localStorage.getItem("terramatrix_class_schedules");
    const allSchedules: ClassSchedule[] = savedSchedules
      ? JSON.parse(savedSchedules)
      : [];

    setSchedules(
      allSchedules
        .filter((item) => item.courseId === activeCourseId)
        .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    );

    const savedSubmissions = localStorage.getItem(
      "terramatrix_assignment_submissions"
    );
    const allSubmissions: AssignmentSubmission[] = savedSubmissions
      ? JSON.parse(savedSubmissions).map((item: AssignmentSubmission) => ({
          ...item,
          itemId: item.itemId || 0,
        }))
      : [];

    const ownSubmissions = allSubmissions.filter(
      (item) =>
        item.courseId === activeCourseId &&
        item.email === parsedLogin.email &&
        item.phone === parsedLogin.phone
    );

    setSubmissions(ownSubmissions);

    const initialResponses: Record<number, string> = {};
    const initialFiles: Record<number, { fileName: string; fileData: string }> = {};

    ownSubmissions.forEach((submission) => {
      initialResponses[submission.itemId] = submission.response;
      initialFiles[submission.itemId] = {
        fileName: submission.fileName,
        fileData: submission.fileData,
      };
    });

    setResponses(initialResponses);
    setFiles(initialFiles);

    const savedAttendance = localStorage.getItem("terramatrix_attendance");
    const attendance: AttendanceRecord[] = savedAttendance
      ? JSON.parse(savedAttendance)
      : [];

    const existingAttendance = attendance.find(
      (item) =>
        item.courseId === activeCourseId &&
        item.email === parsedLogin.email &&
        item.phone === parsedLogin.phone
    );

    setAttendanceMarked(Boolean(existingAttendance));
  }, [courseId, navigate]);

  const assignments = useMemo(
    () => items.filter((item) => item.type === "assignment"),
    [items]
  );

  const materials = useMemo(
    () =>
      items.filter(
        (item) =>
          item.type === "material" ||
          item.type === "link" ||
          item.type === "recording"
      ),
    [items]
  );

  const submittedAssignments = useMemo(
    () =>
      assignments.filter((assignment) =>
        submissions.some((submission) => submission.itemId === assignment.id)
      ),
    [assignments, submissions]
  );

  const nextSession = useMemo(() => {
    const sessionList: ClassSchedule[] = [];

    if (course?.onlineSessionDate) {
      sessionList.push({
        id: course.id,
        courseId: course.id,
        date: course.onlineSessionDate,
        time: course.onlineSessionTime || "",
        note: "Initial schedule",
      });
    }

    sessionList.push(...schedules);

    if (sessionList.length === 0) return null;

    return sessionList.sort(
      (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
    )[0];
  }, [course, schedules]);

  const markAttendance = () => {
    if (!login || !course) return;

    const savedAttendance = localStorage.getItem("terramatrix_attendance");
    const attendance: AttendanceRecord[] = savedAttendance
      ? JSON.parse(savedAttendance)
      : [];

    const alreadyMarked = attendance.some(
      (item) =>
        item.courseId === course.id &&
        item.email === login.email &&
        item.phone === login.phone
    );

    if (alreadyMarked) {
      setAttendanceMarked(true);
      return;
    }

    const newRecord: AttendanceRecord = {
      id: Date.now(),
      courseId: course.id,
      email: login.email,
      phone: login.phone,
      markedAt: new Date().toLocaleString(),
    };

    localStorage.setItem(
      "terramatrix_attendance",
      JSON.stringify([newRecord, ...attendance])
    );

    setAttendanceMarked(true);
    alert("Attendance marked.");
  };

  const uploadAssignmentFile = (itemId: number, file?: File) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setFiles({
        ...files,
        [itemId]: {
          fileName: file.name,
          fileData: String(reader.result),
        },
      });
    };

    reader.readAsDataURL(file);
  };

  const submitAssignment = (assignment: ClassworkItem) => {
    if (!login || !course) return;

    const response = responses[assignment.id] || "";
    const upload = files[assignment.id] || { fileName: "", fileData: "" };

    if (!response.trim() && !upload.fileData) {
      alert("Please type a response or upload a file.");
      return;
    }

    const savedSubmissions = localStorage.getItem(
      "terramatrix_assignment_submissions"
    );

    const allSubmissions: AssignmentSubmission[] = savedSubmissions
      ? JSON.parse(savedSubmissions)
      : [];

    const withoutOld = allSubmissions.filter(
      (item) =>
        !(
          item.courseId === course.id &&
          item.itemId === assignment.id &&
          item.email === login.email &&
          item.phone === login.phone
        )
    );

    const newSubmission: AssignmentSubmission = {
      id: Date.now(),
      courseId: course.id,
      itemId: assignment.id,
      email: login.email,
      phone: login.phone,
      response: response.trim(),
      fileName: upload.fileName,
      fileData: upload.fileData,
      submittedAt: new Date().toLocaleString(),
    };

    const updated = [newSubmission, ...withoutOld];

    localStorage.setItem(
      "terramatrix_assignment_submissions",
      JSON.stringify(updated)
    );

    setSubmissions(
      updated.filter(
        (item) =>
          item.courseId === course.id &&
          item.email === login.email &&
          item.phone === login.phone
      )
    );

    alert("Assignment submitted.");
  };

  const getSubmission = (itemId: number) =>
    submissions.find((submission) => submission.itemId === itemId);

  if (!course || !enrollment) {
    return (
      <main style={page}>
        <div style={emptyCard}>
          <h1>Classroom not available</h1>
          <p>Please login again. If it still appears, ask admin to check the student enrolment for this course.</p>
          <Link to="/student-portal" style={primaryButton}>
            Back to My Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={page}>
      <header style={topBar}>
        <Link to="/student-portal" style={backLink}>
          ← My Dashboard
        </Link>

        <strong>{course.title}</strong>

        <span style={studentNamePill}>
          {enrollment.name}
        </span>
      </header>

      <nav style={tabBar}>
        <button
          onClick={() => setActiveTab("stream")}
          style={activeTab === "stream" ? activeTabButton : tabButton}
        >
          Stream
        </button>

        <button
          onClick={() => setActiveTab("classwork")}
          style={activeTab === "classwork" ? activeTabButton : tabButton}
        >
          Classwork
        </button>

        <button
          onClick={() => setActiveTab("progress")}
          style={activeTab === "progress" ? activeTabButton : tabButton}
        >
          My Progress
        </button>
      </nav>

      <section style={workspace}>
        <div
          style={{
            ...classBanner,
            backgroundImage: `linear-gradient(90deg, rgba(0,105,92,0.95), rgba(0,105,92,0.68), rgba(0,105,92,0.25)), url('${course.imageUrl}')`,
          }}
        >
          <h1 style={classBannerTitle}>{course.title}</h1>
          <p style={classBannerSubtitle}>{course.category}</p>
        </div>

        <section style={studentOverviewGrid}>
          <OverviewCard
            label="Next Class"
            value={
              nextSession
                ? `${formatDisplayDate(nextSession.date)} ${nextSession.time}`
                : "To be scheduled"
            }
          />

          <OverviewCard
            label="Materials / Links"
            value={materials.length}
          />

          <OverviewCard
            label="Assignments"
            value={`${submittedAssignments.length}/${assignments.length} submitted`}
          />

          <div style={overviewCard}>
            <span>Online Session Link</span>
            {course.onlineSessionLink ? (
              <a
                href={course.onlineSessionLink}
                target="_blank"
                rel="noreferrer"
                onClick={markAttendance}
                style={googleMeetButtonSmall}
              >
                Google Meet
              </a>
            ) : (
              <button type="button" disabled style={googleMeetButtonDisabledSmall}>
                Google Meet
              </button>
            )}
          </div>
        </section>

        {activeTab === "stream" && (
          <StreamTab
            course={course}
            items={items}
            attendanceMarked={attendanceMarked}
            markAttendance={markAttendance}
          />
        )}

        {activeTab === "classwork" && (
          <ClassworkTab
            items={items}
            responses={responses}
            setResponses={setResponses}
            files={files}
            uploadAssignmentFile={uploadAssignmentFile}
            submitAssignment={submitAssignment}
            getSubmission={getSubmission}
          />
        )}

        {activeTab === "progress" && (
          <ProgressTab
            assignments={assignments}
            submissions={submissions}
            attendanceMarked={attendanceMarked}
            enrollmentStatus={enrollment.status}
          />
        )}
      </section>
    </main>
  );
}

function StreamTab({
  course,
  items,
  attendanceMarked,
  markAttendance,
}: {
  course: Course;
  items: ClassworkItem[];
  attendanceMarked: boolean;
  markAttendance: () => void;
}) {
  return (
    <div style={streamLayout}>
      <aside style={quickLinksCard}>
        <h3>Online Session Link</h3>

        <div style={quickLinkBox}>
          {course.onlineSessionLink ? (
            <a
              href={course.onlineSessionLink}
              target="_blank"
              rel="noreferrer"
              onClick={markAttendance}
              style={googleMeetButton}
            >
              Google Meet
            </a>
          ) : (
            <button type="button" disabled style={googleMeetButtonDisabled}>
              Google Meet
            </button>
          )}
        </div>

        <button onClick={markAttendance} style={secondaryButton}>
          {attendanceMarked ? "Attendance Marked" : "Mark Attendance"}
        </button>
      </aside>

      <section style={streamPosts}>
        {items.length === 0 ? (
          <div style={emptyCard}>
            No posts yet. Materials and assignments will appear here after the
            instructor creates them.
          </div>
        ) : (
          items.map((item) => (
            <PostCard
              key={item.id}
              icon={getTypeIcon(item.type)}
              title={`${classworkTypeLabels[item.type]}: ${item.title}`}
              subtitle={item.instructions || item.link || item.fileName || item.postedAt}
            />
          ))
        )}
      </section>
    </div>
  );
}

function ClassworkTab({
  items,
  responses,
  setResponses,
  files,
  uploadAssignmentFile,
  submitAssignment,
  getSubmission,
}: {
  items: ClassworkItem[];
  responses: Record<number, string>;
  setResponses: (responses: Record<number, string>) => void;
  files: Record<number, { fileName: string; fileData: string }>;
  uploadAssignmentFile: (itemId: number, file?: File) => void;
  submitAssignment: (assignment: ClassworkItem) => void;
  getSubmission: (itemId: number) => AssignmentSubmission | undefined;
}) {
  return (
    <section style={classworkArea}>
      <h2>Classwork</h2>

      {items.length === 0 ? (
        <div style={emptyCard}>No classwork added yet.</div>
      ) : (
        items.map((item) => {
          const submission = getSubmission(item.id);

          return (
            <article key={item.id} style={classworkItem}>
              <span style={materialIcon}>{getTypeIcon(item.type)}</span>

              <div>
                <div style={classworkHeader}>
                  <div>
                    <p style={itemTypeLine}>
                      <strong>{classworkTypeLabels[item.type]}</strong>
                      <span> · Posted {item.postedAt}</span>
                      {item.dueDate && (
                        <span> · Due {formatDisplayDate(item.dueDate)}</span>
                      )}
                    </p>

                    <h3 style={itemTitle}>{item.title}</h3>

                    {item.instructions && (
                      <p style={itemInstructions}>{item.instructions}</p>
                    )}

                    {item.link && (
                      <a href={item.link} target="_blank" rel="noreferrer" style={smallLink}>
                        Open Link
                      </a>
                    )}

                    {item.fileData && (
                      <a
                        href={getOpenFileUrl(item.fileData)}
                        target="_blank"
                        rel="noreferrer"
                        style={smallLink}
                      >
                        Open {item.fileName || "file"}
                      </a>
                    )}
                  </div>

                  {submission && <span style={submittedBadge}>Submitted</span>}
                </div>

                {item.type === "assignment" && (
                  <div style={assignmentBox}>
                    <Field label="Your response">
                      <textarea
                        value={responses[item.id] || ""}
                        onChange={(e) =>
                          setResponses({
                            ...responses,
                            [item.id]: e.target.value,
                          })
                        }
                        style={textareaStyle}
                        placeholder="Type your answer / notes here"
                      />
                    </Field>

                    <Field label="Upload file">
                      <input
                        type="file"
                        onChange={(e) =>
                          uploadAssignmentFile(item.id, e.target.files?.[0])
                        }
                        style={inputStyle}
                      />
                    </Field>

                    {files[item.id]?.fileName && (
                      <p style={noteText}>Selected: {files[item.id].fileName}</p>
                    )}

                    <button onClick={() => submitAssignment(item)} style={primaryButton}>
                      {submission ? "Update Assignment" : "Submit Assignment"}
                    </button>

                    {submission && (
                      <p style={successText}>Submitted on {submission.submittedAt}</p>
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })
      )}
    </section>
  );
}

function ProgressTab({
  assignments,
  submissions,
  attendanceMarked,
  enrollmentStatus,
}: {
  assignments: ClassworkItem[];
  submissions: AssignmentSubmission[];
  attendanceMarked: boolean;
  enrollmentStatus: EnrollmentStatus;
}) {
  const submittedAssignments = assignments.filter((assignment) =>
    submissions.some((submission) => submission.itemId === assignment.id)
  );

  return (
    <section style={progressArea}>
      <h2>My Progress</h2>

      <div style={analyticsGrid}>
        <Metric label="Assignments" value={assignments.length} />
        <Metric label="Submitted" value={submittedAssignments.length} />
        <Metric label="Attendance" value={attendanceMarked ? "Marked" : "Pending"} />
        <Metric label="Status" value={enrollmentStatus} />
      </div>
    </section>
  );
}

function PostCard({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <article style={postCard}>
      <span style={postIcon}>{icon}</span>
      <div>
        <strong>{title}</strong>
        <p>{subtitle}</p>
      </div>
    </article>
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

function OverviewCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div style={overviewCard}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={metricCard}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function getTypeIcon(type: ClassworkType) {
  if (type === "assignment") return "□";
  if (type === "material") return "▣";
  if (type === "link") return "↗";
  if (type === "recording") return "▶";
  return "✎";
}

const page: CSSProperties = { minHeight: "100vh", background: "#FFFFFF", color: "#3C4043" };
const topBar: CSSProperties = { height: "72px", borderBottom: "1px solid #DADCE0", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 34px", background: "#FFFFFF", position: "sticky", top: 0, zIndex: 20 };
const backLink: CSSProperties = { color: "#1A73E8", textDecoration: "none", fontWeight: 900 };
const studentNamePill: CSSProperties = { background: "#C2E7FF", color: "#174EA6", borderRadius: "999px", padding: "10px 16px", fontWeight: 900, maxWidth: "260px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
const tabBar: CSSProperties = { height: "60px", display: "flex", alignItems: "end", gap: "24px", borderBottom: "1px solid #DADCE0", padding: "0 56px", background: "#FFFFFF", position: "sticky", top: "72px", zIndex: 19 };
const tabButton: CSSProperties = { background: "transparent", border: "none", borderBottom: "4px solid transparent", padding: "0 4px 15px", cursor: "pointer", color: "#3C4043", fontSize: "16px", fontWeight: 900 };
const activeTabButton: CSSProperties = { ...tabButton, color: "#1A73E8", borderBottom: "4px solid #1A73E8" };
const workspace: CSSProperties = { maxWidth: "1180px", margin: "0 auto", padding: "30px 40px 80px" };
const studentOverviewGrid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", margin: "0 0 24px" };
const overviewCard: CSSProperties = { background: "#F8FAFD", border: "1px solid #DADCE0", borderRadius: "14px", padding: "16px", display: "grid", gap: "6px", alignContent: "center", minHeight: "76px" };
const overviewLink: CSSProperties = { color: "#1A73E8", fontWeight: 900, textDecoration: "none" };
const classBanner: CSSProperties = { minHeight: "108px", height: "108px", borderRadius: "14px", backgroundSize: "cover", backgroundPosition: "center", color: "#FFFFFF", padding: "18px 24px", marginBottom: "24px", display: "grid", alignContent: "center", boxSizing: "border-box" };
const classBannerTitle: CSSProperties = { color: "#FFFFFF", fontSize: "34px", lineHeight: "1.1", margin: 0, textShadow: "0 2px 10px rgba(0,0,0,.45)" };
const classBannerSubtitle: CSSProperties = { color: "#FFFFFF", fontSize: "17px", margin: "6px 0 0", textShadow: "0 2px 8px rgba(0,0,0,.45)" };
const streamLayout: CSSProperties = { display: "grid", gridTemplateColumns: "280px 1fr", gap: "28px", alignItems: "start" };
const quickLinksCard: CSSProperties = { border: "1px solid #DADCE0", borderRadius: "14px", padding: "18px", background: "#FFFFFF" };
const quickLinkBox: CSSProperties = { border: "1px solid #DADCE0", borderRadius: "12px", padding: "14px", marginBottom: "12px" };
const googleMeetButton: CSSProperties = { background: "#0F9D58", color: "#FFFFFF", border: "none", borderRadius: "999px", padding: "11px 18px", cursor: "pointer", fontWeight: 900, textDecoration: "none", display: "inline-flex", justifyContent: "center", alignItems: "center", width: "100%", boxSizing: "border-box" };
const googleMeetButtonDisabled: CSSProperties = { ...googleMeetButton, background: "#D8E8DE", color: "#789384", cursor: "not-allowed" };
const googleMeetButtonSmall: CSSProperties = { ...googleMeetButton, width: "auto", padding: "8px 13px", fontSize: "13px" };
const googleMeetButtonDisabledSmall: CSSProperties = { ...googleMeetButtonDisabled, width: "auto", padding: "8px 13px", fontSize: "13px" };
const streamPosts: CSSProperties = { display: "grid", gap: "16px" };
const postCard: CSSProperties = { background: "#F1F3F4", borderRadius: "14px", padding: "18px", display: "grid", gridTemplateColumns: "48px 1fr", gap: "14px", alignItems: "start" };
const postIcon: CSSProperties = { width: "42px", height: "42px", borderRadius: "50%", background: "#C2E7FF", color: "#174EA6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 };
const classworkArea: CSSProperties = { display: "grid", gap: "18px" };
const classworkItem: CSSProperties = { display: "grid", gridTemplateColumns: "46px 1fr", gap: "16px", borderBottom: "1px solid #DADCE0", padding: "18px 0" };
const classworkHeader: CSSProperties = { display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "flex-start" };
const itemTypeLine: CSSProperties = { color: "#5F6368", fontSize: "16px", margin: "0 0 8px", fontWeight: 700 };
const itemTitle: CSSProperties = { color: "#202124", fontSize: "19px", margin: "0 0 6px", lineHeight: "1.25" };
const itemInstructions: CSSProperties = { color: "#3C4043", fontSize: "16px", lineHeight: "1.55", margin: "0 0 8px" };
const materialIcon: CSSProperties = { width: "36px", height: "36px", borderRadius: "50%", background: "#C2E7FF", color: "#174EA6", display: "flex", alignItems: "center", justifyContent: "center" };
const assignmentBox: CSSProperties = { border: "1px solid #DADCE0", borderRadius: "12px", padding: "14px", marginTop: "14px", background: "#F8FAFD" };
const submittedBadge: CSSProperties = { background: "#E6F4EA", color: "#137333", borderRadius: "999px", padding: "6px 10px", fontWeight: 900, fontSize: "12px", height: "fit-content" };
const progressArea: CSSProperties = { display: "grid", gap: "18px" };
const analyticsGrid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" };
const metricCard: CSSProperties = { background: "#F8FAFD", border: "1px solid #DADCE0", borderRadius: "14px", padding: "22px", display: "grid", gap: "8px", textAlign: "center" };
const fieldBlock: CSSProperties = { display: "grid", gap: "7px", color: "#3C4043", fontSize: "14px", fontWeight: 800, marginBottom: "14px" };
const inputStyle: CSSProperties = { width: "100%", boxSizing: "border-box", padding: "12px 13px", borderRadius: "8px", border: "1px solid #DADCE0", fontSize: "15px", outline: "none", background: "#FFFFFF" };
const textareaStyle: CSSProperties = { ...inputStyle, minHeight: "92px", resize: "vertical" };
const primaryButton: CSSProperties = { background: "#1A73E8", color: "#FFFFFF", border: "none", borderRadius: "999px", padding: "10px 16px", cursor: "pointer", fontWeight: 900, textDecoration: "none", display: "inline-block" };
const secondaryButton: CSSProperties = { background: "#FFFFFF", color: "#1A73E8", border: "1px solid #DADCE0", borderRadius: "999px", padding: "10px 16px", cursor: "pointer", fontWeight: 900 };
const smallLink: CSSProperties = { color: "#1A73E8", fontWeight: 900, display: "inline-block", marginRight: "12px" };
const noteText: CSSProperties = { color: "#5F6368", fontWeight: 800 };
const successText: CSSProperties = { color: "#137333", fontWeight: 900 };
const emptyCard: CSSProperties = { background: "#FFFFFF", border: "1px solid #DADCE0", borderRadius: "14px", padding: "32px", color: "#3C4043" };
