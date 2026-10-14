import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  ClipboardCheck,
  Clock3,
  Code,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  FolderGit2,
  GraduationCap,
  Layers,
  LayoutDashboard,
  Link2,
  LogOut,
  MessageSquareText,
  MonitorPlay,
  Paperclip,
  PlayCircle,
  Send,
  Sparkles,
  UsersRound,
  Video,
} from "lucide-react";
import logo from "../assets/terramatrix-logo.png";
import heroImage from "../assets/hero-dam.jpg";
import { Badge, EmptyState } from "../components/Ui";
import { deriveShortTitle, formatDate, loadCourses, normalizePublicAssetPath, type Course } from "../lib/catalogData";
import { STATISTICS_MOOC_CURRICULUM } from "../lib/moocCurriculum";

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
type Login = { email: string; phone: string };
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
type Submission = {
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
type Attendance = { id: number; courseId: number; email: string; phone: string; markedAt: string };
type Schedule = { id: number; courseId: number; date: string; time: string; note: string };
type ViewKey = "curriculum" | "overview" | "stream" | "assignments" | "resources" | "progress";

type LessonType = "video" | "reading" | "lab" | "assignment" | "live";
type Lesson = {
  id: string;
  moduleId: number;
  title: string;
  type: LessonType;
  duration: string;
  summary: string;
  codeSnippet?: string;
  link?: string;
  fileName?: string;
  fileData?: string;
  assignmentItem?: ClassworkItem;
};
type Module = {
  id: number;
  number: string;
  title: string;
  description: string;
  lessons: Lesson[];
};

const navItems: Array<{ key: ViewKey; label: string; icon: typeof LayoutDashboard }> = [
  { key: "curriculum", label: "Curriculum & Lessons", icon: BookOpen },
  { key: "overview", label: "Course Home", icon: LayoutDashboard },
  { key: "stream", label: "Class Stream", icon: MessageSquareText },
  { key: "assignments", label: "Assignments & Labs", icon: ClipboardCheck },
  { key: "resources", label: "Resource Vault", icon: FileText },
  { key: "progress", label: "Progress & Milestone", icon: CheckCircle2 },
];

const typeMeta: Record<ClassworkType, { label: string; icon: typeof FileText; tone: "green" | "gold" | "blue" | "neutral" }> = {
  announcement: { label: "Announcement", icon: MessageSquareText, tone: "neutral" },
  material: { label: "Learning material", icon: FileText, tone: "blue" },
  assignment: { label: "Assignment", icon: ClipboardCheck, tone: "gold" },
  link: { label: "External resource", icon: Link2, tone: "green" },
  recording: { label: "Class recording", icon: PlayCircle, tone: "green" },
};

function readArray<T>(key: string): T[] {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function openUrl(value: string) {
  const clean = normalizePublicAssetPath(value);
  const match = clean.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  return match?.[1] ? `https://drive.google.com/file/d/${match[1]}/view` : clean;
}

export default function CourseClassroom() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [view, setView] = useState<ViewKey>("curriculum");
  const [login, setLogin] = useState<Login | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [items, setItems] = useState<ClassworkItem[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [files, setFiles] = useState<Record<number, { fileName: string; fileData: string }>>({});
  const [notice, setNotice] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({ 1: true, 2: true, 3: true, 4: true });

  useEffect(() => {
    const raw = localStorage.getItem("terramatrix_student_login") || sessionStorage.getItem("terramatrix_student_login");
    if (!raw) { navigate("/student-login"); return; }
    const parsed = JSON.parse(raw) as Login;
    setLogin(parsed);

    const requestedId = Number(courseId);
    const courses = loadCourses(false);
    const allEnrollments = readArray<Enrollment>("terramatrix_enrollments");
    const matchedEnrollment = allEnrollments.find((item) =>
      item.email.toLowerCase() === parsed.email.toLowerCase() &&
      item.phone === parsed.phone &&
      ["Enrolled", "Course Completed", "Certificate Issued"].includes(item.status) &&
      Number(item.courseId) === requestedId
    );
    if (!matchedEnrollment) { navigate("/student-portal"); return; }

    const matchedCourse = courses.find((item) => item.id === requestedId) || {
      ...courses[0],
      id: requestedId,
      title: matchedEnrollment.courseTitle,
      shortTitle: matchedEnrollment.courseTitle,
      imageUrl: heroImage,
    } as Course;

    setCourse(matchedCourse);
    setEnrollment(matchedEnrollment);
    setItems(readArray<ClassworkItem>("terramatrix_classwork_items").filter((item) => Number(item.courseId) === requestedId).sort((a, b) => b.id - a.id));
    setSchedules(readArray<Schedule>("terramatrix_class_schedules").filter((item) => Number(item.courseId) === requestedId).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)));

    const ownSubmissions = readArray<Submission>("terramatrix_assignment_submissions").filter((item) => Number(item.courseId) === requestedId && item.email.toLowerCase() === parsed.email.toLowerCase() && item.phone === parsed.phone);
    setSubmissions(ownSubmissions);
    setResponses(Object.fromEntries(ownSubmissions.map((item) => [item.itemId, item.response || ""])));
    setFiles(Object.fromEntries(ownSubmissions.map((item) => [item.itemId, { fileName: item.fileName || "", fileData: item.fileData || "" }])));
    setAttendanceMarked(readArray<Attendance>("terramatrix_attendance").some((item) => Number(item.courseId) === requestedId && item.email.toLowerCase() === parsed.email.toLowerCase() && item.phone === parsed.phone));

    // Load completed lesson IDs for this student and course
    const storedCompleted = JSON.parse(localStorage.getItem(`tm_completed_${parsed.email}_${requestedId}`) || "[]");
    if (Array.isArray(storedCompleted)) {
      setCompletedLessonIds(storedCompleted);
    }
  }, [courseId, navigate]);

  const assignments = useMemo(() => items.filter((item) => item.type === "assignment"), [items]);
  const materials = useMemo(() => items.filter((item) => item.type === "material" || item.type === "link" || item.type === "recording"), [items]);
  const announcements = useMemo(() => items.filter((item) => item.type === "announcement"), [items]);
  const submittedIds = useMemo(() => new Set(submissions.map((item) => item.itemId)), [submissions]);

  // Build the curriculum modules dynamically
  const modules: Module[] = useMemo(() => {
    if (!course) return [];

    if (course.id === 6 || /statistics/i.test(course.title)) {
      return STATISTICS_MOOC_CURRICULUM.map((mod) => {
        const lessons: Lesson[] = [];
        mod.topics.forEach((topic) => {
          topic.units.forEach((u) => {
            const mappedType: LessonType =
              u.type === "video" || u.type === "ref_video"
                ? "video"
                : u.type === "reading"
                ? "reading"
                : u.type === "lab"
                ? "lab"
                : u.type === "assignment" || u.type === "quiz"
                ? "assignment"
                : "reading";

            // If there's an assignment item matching or for module 8 capstone
            const matchingAssignment = assignments.find((a) => a.title.toLowerCase().includes(u.title.toLowerCase())) || assignments[0];

            lessons.push({
              id: u.id,
              moduleId: mod.id,
              title: `${topic.title !== mod.title ? `[${topic.title}] ` : ""}${u.title}`,
              type: mappedType,
              duration: u.durationLabel,
              summary: u.summary,
              codeSnippet: u.contentSnippet,
              link: u.resourceLink,
              fileName: u.fileName,
              assignmentItem: mappedType === "assignment" ? matchingAssignment : undefined,
            });
          });
        });

        return {
          id: mod.id,
          number: mod.number,
          title: mod.title,
          description: mod.summary,
          lessons,
        };
      });
    }

    const outcomesList = (course.outcomes || "")
      .split(/[;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const firstOutcome = outcomesList[0] || "Foundational principles, mathematical formulations and governing equations.";
    const secondOutcome = outcomesList[1] || "Numerical solver configuration, boundary conditions and discretization.";
    const thirdOutcome = outcomesList[2] || "Code compliance checks, load combinations and detailing provisions.";
    const fourthOutcome = outcomesList[3] || "Industrial capstone deliverable, validation reports and engineering drawings.";

    const mod1Lessons: Lesson[] = [
      {
        id: "1-1",
        moduleId: 1,
        title: "Introduction & Theoretical Framework",
        type: "video",
        duration: "35 min",
        summary: `Comprehensive overview of ${course.title}. Understanding fundamental mechanics, assumptions, and physical behavior governing the design problem.`,
        codeSnippet: `# Engineering Formulation Setup\nimport numpy as np\n\ndef evaluate_system(loads, geometry):\n    # Principle of virtual work & equilibrium\n    k_matrix = np.array([[12.0, -6.0], [-6.0, 4.0]])\n    displacement = np.linalg.solve(k_matrix, loads)\n    return displacement`,
      },
      {
        id: "1-2",
        moduleId: 1,
        title: "Governing Standards & Formulation Guide",
        type: "reading",
        duration: "25 min",
        summary: firstOutcome,
        link: course.materialFileData || undefined,
        fileName: course.materialFileName || "Formulation_Notes.pdf",
      },
    ];

    const mod2Lessons: Lesson[] = [
      {
        id: "2-1",
        moduleId: 2,
        title: "Software Setup, Grid & Boundary Models",
        type: "lab",
        duration: "50 min",
        summary: secondOutcome,
        codeSnippet: course.materialFileData
          ? `# Download associated model geometry from the resources vault`
          : `# Model Parameter Initializer\nsection_properties = {\n    "depth_mm": 600,\n    "width_mm": 300,\n    "fck_MPa": 30,\n    "fy_MPa": 500\n}`,
        fileData: course.materialFileData || undefined,
        fileName: course.materialFileName || undefined,
      },
      {
        id: "2-2",
        moduleId: 2,
        title: course.materialTitle || "Applied Numerical Lab & Simulation",
        type: "reading",
        duration: "40 min",
        summary: course.materialDescription || "Mesh discretization, convergence checks and sanity validation of intermediate calculations.",
        link: course.materialFileData || undefined,
        fileName: course.materialFileName || undefined,
      },
    ];

    // Add extra instructor materials to Module 2 or 3
    materials.forEach((mat, idx) => {
      mod2Lessons.push({
        id: `mat-${mat.id}`,
        moduleId: 2,
        title: mat.title,
        type: mat.type === "recording" ? "video" : mat.type === "link" ? "lab" : "reading",
        duration: "30 min",
        summary: mat.instructions || "Supplementary reference material published by course instructor.",
        link: mat.link || undefined,
        fileData: mat.fileData || undefined,
        fileName: mat.fileName || undefined,
      });
    });

    const mod3Lessons: Lesson[] = [
      {
        id: "3-1",
        moduleId: 3,
        title: "Design Compliance, Safety Factors & Detailing",
        type: "reading",
        duration: "45 min",
        summary: thirdOutcome,
      },
      {
        id: "3-2",
        moduleId: 3,
        title: schedules[0]?.note || (course.onlineSessionDate ? "Live Interactive Masterclass & Mentorship" : "Applied Case Review Session"),
        type: "live",
        duration: "60 min",
        summary: `Live interactive session with ${course.instructorName || "instructor"}. Direct Q&A, live model review and problem troubleshooting.`,
        link: course.onlineSessionLink || undefined,
      },
    ];

    const mod4Lessons: Lesson[] = [
      {
        id: "4-1",
        moduleId: 4,
        title: course.assignmentTitle || "Comprehensive Capstone Project Brief",
        type: "assignment",
        duration: "120 min",
        summary: course.assignmentInstructions || fourthOutcome,
        assignmentItem: assignments[0] || undefined,
      },
    ];

    // Add instructor assignments
    assignments.forEach((asg, idx) => {
      if (idx > 0) {
        mod4Lessons.push({
          id: `asg-${asg.id}`,
          moduleId: 4,
          title: asg.title,
          type: "assignment",
          duration: "90 min",
          summary: asg.instructions || "Submit your design report and verification calculations.",
          assignmentItem: asg,
        });
      }
    });

    return [
      {
        id: 1,
        number: "01",
        title: "Foundational Formulations & Theory",
        description: "Theoretical fundamentals, assumptions and structural governing equations.",
        lessons: mod1Lessons,
      },
      {
        id: 2,
        number: "02",
        title: "Applied Modeling & Software Workflow",
        description: "Geometry configuration, numerical solvers, and discretization.",
        lessons: mod2Lessons,
      },
      {
        id: 3,
        number: "03",
        title: "Code Provisions & Interactive Mentorship",
        description: "Safety factors, IS/Eurocode compliance, and live masterclass.",
        lessons: mod3Lessons,
      },
      {
        id: 4,
        number: "04",
        title: "Capstone Evaluation & Deliverable",
        description: "Complete design calculations, engineering drawings and rubrics.",
        lessons: mod4Lessons,
      },
    ];
  }, [course, materials, schedules, assignments]);

  // Set default active lesson
  useEffect(() => {
    if (!selectedLessonId && modules[0]?.lessons[0]) {
      setSelectedLessonId(modules[0].lessons[0].id);
    }
  }, [modules, selectedLessonId]);

  // Find currently active lesson
  const currentLesson: Lesson | null = useMemo(() => {
    for (const mod of modules) {
      const found = mod.lessons.find((l) => l.id === selectedLessonId);
      if (found) return found;
    }
    return modules[0]?.lessons[0] || null;
  }, [modules, selectedLessonId]);

  // Flattened lesson list for prev/next
  const allLessons = useMemo(() => modules.flatMap((m) => m.lessons), [modules]);
  const currentLessonIndex = useMemo(() => allLessons.findIndex((l) => l.id === selectedLessonId), [allLessons, selectedLessonId]);
  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex >= 0 && currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;

  // Toggle completion
  const toggleComplete = (id: string) => {
    if (!login || !course) return;
    const next = completedLessonIds.includes(id)
      ? completedLessonIds.filter((item) => item !== id)
      : [...completedLessonIds, id];
    setCompletedLessonIds(next);
    localStorage.setItem(`tm_completed_${login.email}_${course.id}`, JSON.stringify(next));
  };

  const progress = useMemo(() => {
    if (!enrollment) return 0;
    if (enrollment.status === "Certificate Issued") return 100;
    if (allLessons.length === 0) return 30;
    const percent = Math.round((completedLessonIds.length / allLessons.length) * 100);
    return Math.max(percent, submittedIds.size > 0 ? 40 : 15);
  }, [enrollment, allLessons, completedLessonIds, submittedIds]);

  const nextSession = schedules[0] || (course?.onlineSessionDate ? { id: 0, courseId: course.id, date: course.onlineSessionDate, time: course.onlineSessionTime, note: "Live Masterclass" } : null);

  const markAttendance = () => {
    if (!login || !course || attendanceMarked) return;
    const all = readArray<Attendance>("terramatrix_attendance");
    all.push({ id: Date.now(), courseId: course.id, email: login.email, phone: login.phone, markedAt: new Date().toLocaleString("en-IN") });
    localStorage.setItem("terramatrix_attendance", JSON.stringify(all));
    setAttendanceMarked(true);
    setNotice("Attendance successfully verified for this course session.");
  };

  const upload = (itemId: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) { setNotice("Please select a file below 15 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => setFiles((current) => ({ ...current, [itemId]: { fileName: file.name, fileData: String(reader.result || "") } }));
    reader.readAsDataURL(file);
  };

  const submitAssignment = (item: ClassworkItem) => {
    if (!login || !course) return;
    const response = (responses[item.id] || "").trim();
    const file = files[item.id];
    if (!response && !file?.fileData) { setNotice("Please write a response note or attach a project file before submitting."); return; }
    const all = readArray<Submission>("terramatrix_assignment_submissions");
    const existingIndex = all.findIndex((entry) => entry.courseId === course.id && entry.itemId === item.id && entry.email.toLowerCase() === login.email.toLowerCase() && entry.phone === login.phone);
    const submission: Submission = {
      id: existingIndex >= 0 ? all[existingIndex].id : Date.now(),
      courseId: course.id,
      itemId: item.id,
      email: login.email,
      phone: login.phone,
      response,
      fileName: file?.fileName || "",
      fileData: file?.fileData || "",
      submittedAt: new Date().toLocaleString("en-IN"),
    };
    if (existingIndex >= 0) all[existingIndex] = submission; else all.push(submission);
    localStorage.setItem("terramatrix_assignment_submissions", JSON.stringify(all));
    setSubmissions((current) => [...current.filter((entry) => entry.itemId !== item.id), submission]);
    setNotice(existingIndex >= 0 ? "Deliverable submission updated." : "Capstone deliverable submitted successfully.");
  };

  const logout = () => {
    localStorage.removeItem("terramatrix_student_login");
    sessionStorage.removeItem("terramatrix_student_login");
    navigate("/student-login");
  };

  if (!course || !enrollment) {
    return <div className="tm3-bootstrap"><div className="tm3-loader"><i /></div></div>;
  }

  const courseImage = normalizePublicAssetPath(course.imageUrl, heroImage) || heroImage;

  return (
    <main className="tm3-workspace tm3-classroom">
      {/* Sidebar navigation */}
      <aside className="tm3-workspace__sidebar">
        <Link className="tm3-workspace__brand" to="/student-portal">
          <img src={logo} alt="" />
          <span>
            <strong>TerraMatrix</strong>
            <small>Executive LMS</small>
          </span>
        </Link>
        <Link className="tm3-back-link" to="/student-portal">
          <ArrowLeft size={16} /> Back to My Learning
        </Link>
        <div className="tm3-course-mini">
          <span>{course.category}</span>
          <strong>{deriveShortTitle(course)}</strong>
          <small>{course.instructorName} · {course.duration}</small>
        </div>
        <nav className="tm3-workspace-nav" aria-label="Course navigation">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              type="button"
              className={view === key ? "is-active" : ""}
              key={key}
              onClick={() => setView(key)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="tm3-workspace__sidebar-footer">
          <Link
            to="/student"
            className="tm3-workspace-nav-sublink"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "10px 14px",
              borderRadius: 12,
              background: "rgba(255,255,255,.05)",
              color: "#c9d9d2",
              fontSize: 12.5,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            <BookOpen size={16} style={{ color: "var(--tm3-lime)" }} />
            <span>Browse catalogue</span>
          </Link>
          <button type="button" onClick={logout}><LogOut size={17} /><span>Sign out</span></button>
        </div>
      </aside>

      {/* Main Workspace Stage */}
      <section className="tm3-workspace__main">
        {/* Top Header Bar */}
        <header className="tm3-workspace-topbar">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--tm3-muted)", marginBottom: 4 }}>
              <Link to="/student-portal" style={{ textDecoration: "none", color: "inherit" }}>My Learning</Link>
              <span>/</span>
              <span>{course.category}</span>
              <span>/</span>
              <strong style={{ color: "var(--tm3-ink)" }}>{deriveShortTitle(course)}</strong>
            </div>
            <h1 style={{ fontSize: 20 }}>{course.title}</h1>
          </div>
          <div className="tm3-workspace-topbar__actions">
            {course.onlineSessionLink && (
              <a className="tm3-button tm3-button--gold" href={course.onlineSessionLink} target="_blank" rel="noreferrer">
                <Video size={16} /> Join Live Class
              </a>
            )}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "7px 14px", borderRadius: 999, background: "var(--tm3-soft)", border: "1px solid var(--tm3-line)", fontSize: 13, fontWeight: 750 }}>
              <span style={{ color: "var(--tm3-green-700)" }}>{progress}% Complete</span>
            </div>
          </div>
        </header>

        <div className="tm3-workspace-content">
          {notice && (
            <div className="tm3-notice" role="status">
              <CheckCircle2 size={18} />
              <span>{notice}</span>
              <button type="button" onClick={() => setNotice("")}>×</button>
            </div>
          )}

          {/* VIEW: CURRICULUM & MODULES (Coursera / Udemy Modular LMS) */}
          {view === "curriculum" && (
            <div className="tm3-lms-layout">
              {/* Left Column: Modular Syllabus Tree */}
              <aside className="tm3-curriculum-panel">
                <div className="tm3-curriculum-panel__header">
                  <div>
                    <h3>Course Curriculum</h3>
                    <small style={{ color: "var(--tm3-muted)", fontSize: 11.5 }}>
                      {completedLessonIds.length} of {allLessons.length} activities completed
                    </small>
                  </div>
                  <Badge tone="green">{progress}%</Badge>
                </div>

                <div className="tm3-curriculum-panel__tree">
                  {modules.map((mod) => {
                    const isOpen = expandedModules[mod.id] ?? true;
                    const modCompleted = mod.lessons.every((l) => completedLessonIds.includes(l.id));
                    return (
                      <div className="tm3-module-block" key={mod.id}>
                        <button
                          type="button"
                          className="tm3-module-block__trigger"
                          onClick={() => setExpandedModules((prev) => ({ ...prev, [mod.id]: !isOpen }))}
                        >
                          <div className="tm3-module-block__title">
                            <span>Module {mod.number}</span>
                            <strong>{mod.title}</strong>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {modCompleted && <CheckCircle2 size={15} style={{ color: "var(--tm3-success)" }} />}
                            <ChevronDown size={16} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
                          </div>
                        </button>

                        {isOpen && (
                          <div className="tm3-lesson-list">
                            {mod.lessons.map((lesson) => {
                              const isSelected = lesson.id === selectedLessonId;
                              const isDone = completedLessonIds.includes(lesson.id);
                              return (
                                <button
                                  type="button"
                                  key={lesson.id}
                                  className={`tm3-lesson-row ${isSelected ? "is-active" : ""}`}
                                  onClick={() => setSelectedLessonId(lesson.id)}
                                >
                                  <span
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleComplete(lesson.id);
                                    }}
                                    style={{ cursor: "pointer", display: "grid", placeItems: "center" }}
                                    title={isDone ? "Mark incomplete" : "Mark complete"}
                                  >
                                    {isDone ? (
                                      <CheckCircle2 size={16} style={{ color: "var(--tm3-success)" }} />
                                    ) : (
                                      <Circle size={15} style={{ color: "var(--tm3-line-strong)" }} />
                                    )}
                                  </span>
                                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {lesson.title}
                                  </span>
                                  <small style={{ color: "var(--tm3-muted)", fontSize: 11 }}>{lesson.duration}</small>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </aside>

              {/* Right Column: Interactive Lesson Stage */}
              <div className="tm3-lesson-stage">
                {currentLesson && (
                  <article className="tm3-lesson-card">
                    <div className="tm3-lesson-card__header">
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <Badge tone="gold">Module {currentLesson.moduleId}</Badge>
                          <Badge tone="green">{currentLesson.type.toUpperCase()}</Badge>
                          <span style={{ fontSize: 12, color: "var(--tm3-muted)" }}>
                            <Clock3 size={13} style={{ verticalAlign: -1, marginRight: 4 }} />
                            {currentLesson.duration}
                          </span>
                        </div>
                        <h2>{currentLesson.title}</h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleComplete(currentLesson.id)}
                        className={`tm3-button ${completedLessonIds.includes(currentLesson.id) ? "tm3-button--outline" : "tm3-button--dark"}`}
                        style={{ minHeight: 38, padding: "6px 14px" }}
                      >
                        {completedLessonIds.includes(currentLesson.id) ? (
                          <>
                            <CheckCircle2 size={16} style={{ color: "var(--tm3-success)" }} /> Completed
                          </>
                        ) : (
                          "Mark complete"
                        )}
                      </button>
                    </div>

                    {/* Lesson Content Viewer */}
                    {currentLesson.type === "video" && (
                      <div>
                        <div className="tm3-video-player-wrap">
                          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "linear-gradient(135deg, rgba(6,31,26,.88), rgba(6,31,26,.65)), url('" + courseImage + "') center/cover" }}>
                            <div style={{ textAlign: "center", color: "white", padding: 20 }}>
                              <PlayCircle size={64} style={{ color: "var(--tm3-lime)", marginBottom: 12, cursor: "pointer" }} />
                              <h3 style={{ margin: 0, fontSize: 18 }}>{currentLesson.title}</h3>
                              <p style={{ margin: "6px 0 0", color: "#c5d9d1", fontSize: 13 }}>Standard definition lecture player · Duration {currentLesson.duration}</p>
                            </div>
                          </div>
                        </div>
                        <div className="tm3-reading-content">
                          <h3>Lecture Summary & Core Insights</h3>
                          <p>{currentLesson.summary}</p>
                          {currentLesson.codeSnippet && (
                            <pre className="tm3-code-snippet"><code>{currentLesson.codeSnippet}</code></pre>
                          )}
                        </div>
                      </div>
                    )}

                    {currentLesson.type === "reading" && (
                      <div className="tm3-reading-content">
                        <h3>Mathematical Principles & Engineering Code Guide</h3>
                        <p>{currentLesson.summary}</p>
                        <p>
                          In modern industrial practice, analytical equations are derived based on limit state criteria. Adhering to relevant codes (such as IS 456 for concrete, IS 1893 for earthquake resistant design, and IRC 112 for bridges) ensures compliance and safety against progressive collapse.
                        </p>
                        {currentLesson.codeSnippet && (
                          <pre className="tm3-code-snippet"><code>{currentLesson.codeSnippet}</code></pre>
                        )}
                        {currentLesson.link && (
                          <div style={{ marginTop: 24, padding: 18, borderRadius: 16, background: "var(--tm3-soft)", border: "1px solid var(--tm3-line)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <FileText size={24} style={{ color: "var(--tm3-green-700)" }} />
                              <div>
                                <strong style={{ fontSize: 13.5, display: "block" }}>{currentLesson.fileName || "Course Study Material"}</strong>
                                <small style={{ color: "var(--tm3-muted)" }}>Downloadable reference file</small>
                              </div>
                            </div>
                            <a href={openUrl(currentLesson.link)} target="_blank" rel="noreferrer" download={currentLesson.fileName} className="tm3-button tm3-button--dark" style={{ minHeight: 38, padding: "6px 14px" }}>
                              <Download size={15} /> Download
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {currentLesson.type === "lab" && (
                      <div className="tm3-reading-content">
                        <h3>Practical Software Lab & Scripting Walkthrough</h3>
                        <p>{currentLesson.summary}</p>
                        <p>
                          Follow the step-by-step instructions below to initialize your project grid, configure material definitions, and inspect convergence metrics.
                        </p>
                        {currentLesson.codeSnippet && (
                          <pre className="tm3-code-snippet"><code>{currentLesson.codeSnippet}</code></pre>
                        )}
                        {currentLesson.fileData && (
                          <div style={{ marginTop: 20 }}>
                            <a href={openUrl(currentLesson.fileData)} target="_blank" rel="noreferrer" download={currentLesson.fileName} className="tm3-button tm3-button--dark">
                              <Download size={16} /> Download Lab Files ({currentLesson.fileName || "Dataset"})
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {currentLesson.type === "live" && (
                      <div>
                        <div style={{ padding: 28, borderRadius: 20, background: "linear-gradient(135deg, var(--tm3-green-950), var(--tm3-green-800))", color: "white", marginBottom: 24 }}>
                          <div style={{ marginBottom: 12 }}>
                            <Badge tone="live">Live Masterclass</Badge>
                          </div>
                          <h3 style={{ margin: "0 0 8px", fontSize: 22, color: "white" }}>{currentLesson.title}</h3>
                          <p style={{ color: "#c5d9d1", margin: "0 0 18px", fontSize: 14 }}>{currentLesson.summary}</p>
                          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                            {course.onlineSessionLink ? (
                              <a href={course.onlineSessionLink} target="_blank" rel="noreferrer" className="tm3-button tm3-button--lime">
                                <Video size={16} /> Open Meeting Room
                              </a>
                            ) : (
                              <Badge tone="gold">Link will be active 15 mins before class</Badge>
                            )}
                            <button
                              type="button"
                              onClick={markAttendance}
                              disabled={attendanceMarked}
                              className={`tm3-button ${attendanceMarked ? "tm3-button--ghost" : "tm3-button--outline"}`}
                              style={{ color: "white", borderColor: "rgba(255,255,255,.3)" }}
                            >
                              <CheckCircle2 size={16} />
                              {attendanceMarked ? "Attendance Verified" : "Verify Attendance"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentLesson.type === "assignment" && (
                      <div>
                        <div className="tm3-reading-content">
                          <h3>Capstone Evaluation Brief & Rubrics</h3>
                          <p>{currentLesson.summary}</p>
                          <p>
                            Ensure your submission includes your working engineering model file, a summary PDF report highlighting the methodology, code checks performed, and conclusions.
                          </p>
                        </div>

                        {currentLesson.assignmentItem ? (
                          <div className="tm3-submission-box" style={{ marginTop: 24 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                              <label htmlFor={`res-${currentLesson.assignmentItem.id}`} style={{ fontWeight: 800, fontSize: 13 }}>
                                Your Project Submission
                              </label>
                              {submittedIds.has(currentLesson.assignmentItem.id) && (
                                <Badge tone="green">Submitted</Badge>
                              )}
                            </div>
                            <textarea
                              id={`res-${currentLesson.assignmentItem.id}`}
                              value={responses[currentLesson.assignmentItem.id] || ""}
                              onChange={(e) => setResponses({ ...responses, [currentLesson.assignmentItem!.id]: e.target.value })}
                              placeholder="Provide technical commentary, model notes, or public drive link..."
                              rows={5}
                            />
                            <div className="tm3-submission-box__footer">
                              <label className="tm3-file-button">
                                <Paperclip size={16} />
                                {files[currentLesson.assignmentItem.id]?.fileName || "Attach CAD / Model / PDF file (max 15MB)"}
                                <input type="file" onChange={(e) => upload(currentLesson.assignmentItem!.id, e)} />
                              </label>
                              <button
                                className="tm3-button tm3-button--dark"
                                type="button"
                                onClick={() => submitAssignment(currentLesson.assignmentItem!)}
                              >
                                <Send size={15} />
                                {submittedIds.has(currentLesson.assignmentItem.id) ? "Update Submission" : "Submit Deliverable"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ padding: 18, borderRadius: 16, background: "var(--tm3-soft)", marginTop: 20 }}>
                            <p style={{ margin: 0, fontSize: 13, color: "var(--tm3-muted)" }}>
                              Review the project brief above. Once your calculations and CAD sheets are ready, submit your files via the Assignments tab.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Lesson Stage Navigation Footer */}
                    <div className="tm3-lesson-nav-footer">
                      {prevLesson ? (
                        <button
                          type="button"
                          className="tm3-button tm3-button--outline"
                          onClick={() => setSelectedLessonId(prevLesson.id)}
                        >
                          <ArrowLeft size={16} /> Previous: {prevLesson.title.slice(0, 24)}...
                        </button>
                      ) : <span />}

                      {nextLesson ? (
                        <button
                          type="button"
                          className="tm3-button tm3-button--dark"
                          onClick={() => {
                            if (!completedLessonIds.includes(currentLesson.id)) {
                              toggleComplete(currentLesson.id);
                            }
                            setSelectedLessonId(nextLesson.id);
                          }}
                        >
                          Next: {nextLesson.title.slice(0, 24)}... <ArrowRight size={16} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="tm3-button tm3-button--lime"
                          onClick={() => setView("progress")}
                        >
                          Review Milestones <Award size={16} />
                        </button>
                      )}
                    </div>
                  </article>
                )}
              </div>
            </div>
          )}

          {/* VIEW: OVERVIEW */}
          {view === "overview" && (
            <>
              <section className="tm3-classroom-hero">
                <div className="tm3-classroom-hero__image" style={{ backgroundImage: `linear-gradient(110deg, rgba(4,40,34,.94), rgba(4,40,34,.34)), url('${courseImage}')` }}>
                  <div>
                    <Badge tone="gold">{enrollment.status}</Badge>
                    <h2>{course.title}</h2>
                    <p>{course.description}</p>
                    <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                      <button type="button" className="tm3-button tm3-button--lime" onClick={() => setView("curriculum")}>
                        Go to Curriculum & Lessons <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="tm3-classroom-progress">
                  <span>Course Progress</span>
                  <strong>{progress}%</strong>
                  <div><i style={{ width: `${progress}%` }} /></div>
                  <small>{completedLessonIds.length} of {allLessons.length} lessons completed</small>
                </div>
              </section>

              <div className="tm3-stat-grid">
                <div className="tm3-stat-card"><span>Curriculum Modules</span><strong>{modules.length}</strong></div>
                <div className="tm3-stat-card"><span>Interactive Lessons</span><strong>{allLessons.length}</strong></div>
                <div className="tm3-stat-card"><span>Deliverables Submitted</span><strong>{submittedIds.size} / {assignments.length || 1}</strong></div>
                <div className="tm3-stat-card"><span>Attendance Status</span><strong>{attendanceMarked ? "Verified" : "Pending"}</strong></div>
              </div>

              <div className="tm3-dashboard-grid">
                <section className="tm3-dashboard-section">
                  <div className="tm3-dashboard-section__head">
                    <h2>Next Learning Milestone</h2>
                    <button type="button" onClick={() => setView("curriculum")}>Open syllabus</button>
                  </div>
                  {allLessons.filter((l) => !completedLessonIds.includes(l.id)).slice(0, 3).map((item) => (
                    <article className="tm3-action-card" key={item.id}>
                      <span className="tm3-action-card__icon"><BookOpen size={20} /></span>
                      <div>
                        <Badge tone="gold">Module {item.moduleId}</Badge>
                        <h3>{item.title}</h3>
                        <p>{item.summary}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLessonId(item.id);
                          setView("curriculum");
                        }}
                      >
                        <ChevronRight size={18} />
                      </button>
                    </article>
                  ))}
                </section>

                <section className="tm3-dashboard-section">
                  <div className="tm3-dashboard-section__head">
                    <h2>Live Class & Mentorship</h2>
                    <button type="button" onClick={() => setView("stream")}>View stream</button>
                  </div>
                  {nextSession ? (
                    <div className="tm3-session-card">
                      <span className="tm3-session-card__date">
                        <strong>{new Date(`${nextSession.date}T00:00:00`).getDate() || "–"}</strong>
                        <small>{new Date(`${nextSession.date}T00:00:00`).toLocaleString("en-IN", { month: "short" })}</small>
                      </span>
                      <div>
                        <Badge tone="green">Scheduled Session</Badge>
                        <h3>{nextSession.note || course.title}</h3>
                        <p><Clock3 size={15} /> {nextSession.time || "Time TBA"}</p>
                      </div>
                      {course.onlineSessionLink && (
                        <a href={course.onlineSessionLink} target="_blank" rel="noreferrer"><ExternalLink size={18} /></a>
                      )}
                    </div>
                  ) : (
                    <EmptyState title="No upcoming sessions" description="Live mentorship sessions will appear here as they are scheduled." />
                  )}
                  <button
                    className={`tm3-attendance-button ${attendanceMarked ? "is-complete" : ""}`}
                    type="button"
                    onClick={markAttendance}
                    disabled={attendanceMarked}
                  >
                    <CheckCircle2 size={18} />
                    {attendanceMarked ? "Attendance Verified" : "Verify Attendance"}
                  </button>
                </section>
              </div>
            </>
          )}

          {/* VIEW: CLASS STREAM (Google Classroom style) */}
          {view === "stream" && (
            <section className="tm3-dashboard-section tm3-dashboard-section--wide">
              <div className="tm3-dashboard-section__head">
                <div>
                  <span className="tm3-eyebrow">Class Stream</span>
                  <h2>Announcements & Mentorship Notes</h2>
                </div>
              </div>
              <div className="tm3-stream-list">
                {announcements.length === 0 && schedules.length === 0 ? (
                  <EmptyState title="The stream is quiet" description="Announcements and scheduled classes will appear here." />
                ) : null}
                {announcements.map((item) => (
                  <article className="tm3-stream-item" key={item.id}>
                    <span><MessageSquareText size={20} /></span>
                    <div>
                      <small>{item.postedAt}</small>
                      <h3>{item.title}</h3>
                      <p>{item.instructions}</p>
                    </div>
                  </article>
                ))}
                {schedules.map((item) => (
                  <article className="tm3-stream-item" key={`schedule-${item.id}`}>
                    <span><CalendarDays size={20} /></span>
                    <div>
                      <small>{formatDate(item.date)} · {item.time || "Time TBA"}</small>
                      <h3>{item.note || "Live Masterclass"}</h3>
                      <p>Open the course live-session link at the scheduled time to participate.</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* VIEW: ASSIGNMENTS & LABS */}
          {view === "assignments" && (
            <section className="tm3-classwork-layout">
              <div className="tm3-classwork-main">
                <div className="tm3-dashboard-section__head">
                  <div>
                    <span className="tm3-eyebrow">Project Submissions</span>
                    <h2>Graded Assessments & Rubrics</h2>
                  </div>
                </div>

                {assignments.length === 0 && !course.assignmentTitle ? (
                  <EmptyState title="No assignments assigned" description="Graded tasks and capstone submissions will appear here." />
                ) : (
                  <div className="tm3-classwork-list">
                    {course.assignmentTitle && (
                      <article className="tm3-classwork-card">
                        <div className="tm3-classwork-card__head">
                          <span className="tm3-resource-icon tm3-resource-icon--gold"><ClipboardCheck size={20} /></span>
                          <div>
                            <Badge tone="gold">Course Capstone</Badge>
                            <h3>{course.assignmentTitle}</h3>
                            <small>Comprehensive final project deliverable</small>
                          </div>
                        </div>
                        <p>{course.assignmentInstructions || "Complete the design calculations and attach your working model."}</p>
                      </article>
                    )}

                    {assignments.map((item) => {
                      const submitted = submittedIds.has(item.id);
                      return (
                        <article className="tm3-classwork-card" key={item.id}>
                          <div className="tm3-classwork-card__head">
                            <span className="tm3-resource-icon tm3-resource-icon--gold"><ClipboardCheck size={20} /></span>
                            <div>
                              <Badge tone="gold">Assignment</Badge>
                              <h3>{item.title}</h3>
                              <small>{item.dueDate ? `Due ${formatDate(item.dueDate)}` : item.postedAt}</small>
                            </div>
                            {submitted && <Badge tone="green">Submitted</Badge>}
                          </div>
                          {item.instructions && <p>{item.instructions}</p>}
                          <div className="tm3-submission-box">
                            <label htmlFor={`res-page-${item.id}`}>Your Submission</label>
                            <textarea
                              id={`res-page-${item.id}`}
                              value={responses[item.id] || ""}
                              onChange={(e) => setResponses({ ...responses, [item.id]: e.target.value })}
                              placeholder="Add calculation notes, project repository link, or methodology..."
                              rows={4}
                            />
                            <div className="tm3-submission-box__footer">
                              <label className="tm3-file-button">
                                <Paperclip size={16} />
                                {files[item.id]?.fileName || "Attach CAD / Model / PDF"}
                                <input type="file" onChange={(e) => upload(item.id, e)} />
                              </label>
                              <button className="tm3-button tm3-button--dark" type="button" onClick={() => submitAssignment(item)}>
                                <Send size={15} />
                                {submitted ? "Update Submission" : "Submit Assignment"}
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>

              <aside className="tm3-classwork-side">
                <div>
                  <Sparkles size={20} />
                  <h3>Evaluation Criteria</h3>
                  <p>Submissions are evaluated on adherence to engineering code provisions, formulation accuracy, and documentation clarity.</p>
                </div>
                <div>
                  <Award size={20} />
                  <h3>Certification Requirement</h3>
                  <p>Complete all modules and submit the capstone deliverable to unlock your verified certificate.</p>
                </div>
              </aside>
            </section>
          )}

          {/* VIEW: RESOURCE VAULT */}
          {view === "resources" && (
            <section className="tm3-dashboard-section tm3-dashboard-section--wide">
              <div className="tm3-dashboard-section__head">
                <div>
                  <span className="tm3-eyebrow">Downloads</span>
                  <h2>Course Resource Vault</h2>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginTop: 16 }}>
                {course.materialFileData && (
                  <div style={{ padding: 22, borderRadius: 18, border: "1px solid var(--tm3-line)", background: "var(--tm3-surface)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ display: "inline-block", padding: 8, borderRadius: 12, background: "var(--tm3-green-100)", color: "var(--tm3-green-800)", marginBottom: 12 }}>
                        <FileSpreadsheet size={22} />
                      </span>
                      <h4 style={{ margin: "0 0 6px", fontSize: 16 }}>{course.materialTitle || "Primary Course Material"}</h4>
                      <p style={{ margin: 0, fontSize: 12.5, color: "var(--tm3-muted)" }}>{course.materialDescription || "Official course dataset and calculation templates."}</p>
                    </div>
                    <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--tm3-line)" }}>
                      <a href={openUrl(course.materialFileData)} target="_blank" rel="noreferrer" download={course.materialFileName} className="tm3-button tm3-button--dark" style={{ width: "100%", justifyContent: "center" }}>
                        <Download size={15} /> Download Files
                      </a>
                    </div>
                  </div>
                )}

                {materials.map((mat) => (
                  <div key={mat.id} style={{ padding: 22, borderRadius: 18, border: "1px solid var(--tm3-line)", background: "var(--tm3-surface)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ display: "inline-block", padding: 8, borderRadius: 12, background: "var(--tm3-gold-soft)", color: "var(--tm3-gold-deep)", marginBottom: 12 }}>
                        <FileText size={22} />
                      </span>
                      <h4 style={{ margin: "0 0 6px", fontSize: 16 }}>{mat.title}</h4>
                      <p style={{ margin: 0, fontSize: 12.5, color: "var(--tm3-muted)" }}>{mat.instructions || "Supplementary reference document."}</p>
                    </div>
                    <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--tm3-line)" }}>
                      {mat.fileData ? (
                        <a href={openUrl(mat.fileData)} target="_blank" rel="noreferrer" download={mat.fileName} className="tm3-button tm3-button--dark" style={{ width: "100%", justifyContent: "center" }}>
                          <Download size={15} /> Download ({mat.fileName || "File"})
                        </a>
                      ) : mat.link ? (
                        <a href={openUrl(mat.link)} target="_blank" rel="noreferrer" className="tm3-button tm3-button--outline" style={{ width: "100%", justifyContent: "center" }}>
                          <ExternalLink size={15} /> Open Link
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* VIEW: PROGRESS & CERTIFICATE */}
          {view === "progress" && (
            <section className="tm3-progress-page">
              <div className="tm3-dashboard-section__head">
                <div>
                  <span className="tm3-eyebrow">Milestones</span>
                  <h2>Curriculum Analytics & Credential</h2>
                </div>
              </div>

              <div className="tm3-progress-overview">
                <div className="tm3-progress-ring">
                  <strong>{progress}%</strong>
                  <span>completed</span>
                </div>
                <div>
                  <Badge tone={progress === 100 ? "green" : "gold"}>{enrollment.status}</Badge>
                  <h3 style={{ marginTop: 8 }}>{course.title}</h3>
                  <p>Overall progress is evaluated across interactive lesson completions, live session attendance, and capstone deliverable reviews.</p>
                  <div className="tm3-progress-bar">
                    <span style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>

              <div className="tm3-progress-checklist">
                <article className="is-complete">
                  <CheckCircle2 size={20} />
                  <div>
                    <h3>1. Enrolment & Onboarding</h3>
                    <p>Enrolled on {formatDate(enrollment.enrolledAt)} · Learner verified</p>
                  </div>
                </article>
                <article className={attendanceMarked ? "is-complete" : ""}>
                  <CheckCircle2 size={20} />
                  <div>
                    <h3>2. Live Masterclass Attendance</h3>
                    <p>{attendanceMarked ? "Attendance successfully verified for course sessions." : "Attend scheduled live masterclasses to verify presence."}</p>
                  </div>
                </article>
                <article className={completedLessonIds.length >= Math.ceil(allLessons.length * 0.75) ? "is-complete" : ""}>
                  <CheckCircle2 size={20} />
                  <div>
                    <h3>3. Curriculum Lessons Completed</h3>
                    <p>{completedLessonIds.length} of {allLessons.length} modular activities completed</p>
                  </div>
                </article>
                <article className={submittedIds.size > 0 ? "is-complete" : ""}>
                  <CheckCircle2 size={20} />
                  <div>
                    <h3>4. Capstone Engineering Deliverable</h3>
                    <p>{submittedIds.size > 0 ? "Deliverables submitted and logged in registry." : "Submit your final calculation sheets in the Assignments tab."}</p>
                  </div>
                </article>
                <article className={enrollment.status === "Certificate Issued" || progress === 100 ? "is-complete" : ""}>
                  <CheckCircle2 size={20} />
                  <div>
                    <h3>5. Verified Credential Issuance</h3>
                    <p>
                      {enrollment.status === "Certificate Issued"
                        ? "Verified digital credential issued by TerraMatrix Academy."
                        : "Unlocked upon verification by the academy after completing all modules."}
                    </p>
                  </div>
                </article>
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
