import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Code,
  Download,
  FileText,
  Layers,
  LayoutDashboard,
  Link2,
  LogOut,
  Megaphone,
  MonitorPlay,
  Paperclip,
  Plus,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
  X,
  XCircle,
} from "lucide-react";
import logo from "../assets/terramatrix-logo.png";
import heroImage from "../assets/hero-dam.jpg";
import { Badge, EmptyState } from "../components/Ui";
import { deriveShortTitle, formatDate, loadCourses, loadInstructors, normalizePublicAssetPath, type Course, type Instructor } from "../lib/catalogData";
import {
  STATISTICS_MOOC_CURRICULUM,
  auditCourseEligibility,
  type MoocModule,
  type CourseQaAudit,
} from "../lib/moocCurriculum";

type InstructorLogin = { id?: number; name: string; email: string; phone?: string };
type Enrollment = { id: number; courseId: number; courseTitle: string; name: string; email: string; phone: string; organisation: string; enrolledAt: string; status: string };
type ClassworkType = "announcement" | "material" | "assignment" | "link" | "recording";
type ClassworkItem = { id: number; courseId: number; type: ClassworkType; title: string; instructions: string; link: string; fileName: string; fileData: string; dueDate: string; postedAt: string };
type Submission = { id: number; courseId: number; itemId: number; email: string; phone: string; response: string; fileName: string; fileData: string; submittedAt: string };
type Attendance = { id: number; courseId: number; email: string; phone: string; markedAt: string };
type Schedule = { id: number; courseId: number; date: string; time: string; note: string };
type ViewKey = "home" | "calendar" | "course";
type CourseTab = "curriculum" | "stream" | "classwork" | "people" | "analytics";

type Draft = { type: ClassworkType; title: string; instructions: string; link: string; dueDate: string; fileName: string; fileData: string };
const emptyDraft: Draft = { type: "announcement", title: "", instructions: "", link: "", dueDate: "", fileName: "", fileData: "" };

const typeMeta: Record<ClassworkType, { label: string; icon: typeof FileText; tone: "green" | "gold" | "blue" | "neutral" }> = {
  announcement: { label: "Announcement", icon: Megaphone, tone: "neutral" },
  material: { label: "Material", icon: FileText, tone: "blue" },
  assignment: { label: "Assignment", icon: ClipboardCheck, tone: "gold" },
  link: { label: "Link", icon: Link2, tone: "green" },
  recording: { label: "Recording", icon: MonitorPlay, tone: "green" },
};

function readArray<T>(key: string): T[] {
  try { const parsed = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
}
function saveArray<T>(key: string, value: T[]) { localStorage.setItem(key, JSON.stringify(value)); }
function safeText(value: unknown) { return String(value || "").trim(); }

export default function InstructorPortal() {
  const navigate = useNavigate();
  const [login, setLogin] = useState<InstructorLogin | null>(null);
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [view, setView] = useState<ViewKey>("home");
  const [tab, setTab] = useState<CourseTab>("curriculum");
  const [items, setItems] = useState<ClassworkItem[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({ date: "", time: "", note: "" });
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [proposedExpertise, setProposedExpertise] = useState("");
  const [proposedBio, setProposedBio] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("terramatrix_instructor_login") || sessionStorage.getItem("terramatrix_instructor_login");
    if (!raw) { navigate("/instructor-login"); return; }
    const parsed = JSON.parse(raw) as InstructorLogin;
    setLogin(parsed);
    const instructors = loadInstructors(true);
    const profile = instructors.find((item) => (parsed.id && item.id === Number(parsed.id)) || item.email.toLowerCase() === parsed.email.toLowerCase() || item.name.toLowerCase() === parsed.name.toLowerCase()) || null;
    if (profile && ((profile.moderationStatus && profile.moderationStatus !== "Approved") || profile.status === "Inactive")) {
      localStorage.removeItem("terramatrix_instructor_login");
      sessionStorage.removeItem("terramatrix_instructor_login");
      navigate("/instructor-login");
      return;
    }
    setInstructor(profile);
    const assigned = loadCourses(false).filter((course) => {
      if (profile && course.instructorIds.includes(profile.id)) return true;
      const name = `${course.instructorName}`.toLowerCase();
      return name.includes(parsed.name.toLowerCase()) || parsed.name.toLowerCase().includes(name);
    });
    setCourses(assigned);
    setItems(readArray<ClassworkItem>("terramatrix_classwork_items"));
    setEnrollments(readArray<Enrollment>("terramatrix_enrollments"));
    setSubmissions(readArray<Submission>("terramatrix_assignment_submissions"));
    setAttendance(readArray<Attendance>("terramatrix_attendance"));
    setSchedules(readArray<Schedule>("terramatrix_class_schedules"));
  }, [navigate]);

  const selectedCourse = courses.find((item) => item.id === selectedId) || null;
  const courseItems = useMemo(() => items.filter((item) => item.courseId === selectedId).sort((a, b) => b.id - a.id), [items, selectedId]);
  const courseStudents = useMemo(() => enrollments.filter((item) => item.courseId === selectedId), [enrollments, selectedId]);
  const courseSubmissions = useMemo(() => submissions.filter((item) => item.courseId === selectedId), [submissions, selectedId]);
  const courseAttendance = useMemo(() => attendance.filter((item) => item.courseId === selectedId), [attendance, selectedId]);
  const courseSchedules = useMemo(() => schedules.filter((item) => item.courseId === selectedId).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)), [schedules, selectedId]);
  const totalStudents = useMemo(() => new Set(enrollments.map((item) => `${item.email}|${item.phone}`)).size, [enrollments]);
  const assignmentCount = courseItems.filter((item) => item.type === "assignment").length;
  const completionRate = courseStudents.length ? Math.round((courseStudents.filter((item) => /completed|certificate/i.test(item.status)).length / courseStudents.length) * 100) : 0;

  const openCourse = (id: number) => { setSelectedId(id); setView("course"); setTab("curriculum"); };
  const goHome = () => { setSelectedId(null); setView("home"); };
  const goCalendar = () => { setSelectedId(null); setView("calendar"); };

  const submitCourseForReview = (courseId: number) => {
    const allCourses = loadCourses(false);
    const updated = allCourses.map((c) => {
      if (c.id === courseId) {
        return {
          ...c,
          moderationStatus: "Pending Review" as const,
        };
      }
      return c;
    });
    localStorage.setItem("terramatrix_courses", JSON.stringify(updated));
    setCourses(updated.filter((c) => {
      if (instructor && c.instructorIds.includes(instructor.id)) return true;
      const name = `${c.instructorName}`.toLowerCase();
      return login && (name.includes(login.name.toLowerCase()) || login.name.toLowerCase().includes(name));
    }));
    setNotice("Course curriculum specification submitted to TerraMatrix Academy Admin for accreditation & approval!");
  };

  const submitProfileUpdateRequest = () => {
    if (!instructor) return;
    const allInstructors = loadInstructors();
    const updated = allInstructors.map((item) => {
      if (item.id === instructor.id) {
        return {
          ...item,
          pendingExpertise: proposedExpertise.trim(),
          pendingBio: proposedBio.trim(),
          moderationStatus: "Pending Review" as const,
        };
      }
      return item;
    });
    localStorage.setItem("terramatrix_instructors", JSON.stringify(updated));
    setInstructor((prev) =>
      prev
        ? {
            ...prev,
            pendingExpertise: proposedExpertise.trim(),
            pendingBio: proposedBio.trim(),
            moderationStatus: "Pending Review",
          }
        : null
    );
    setProfileModalOpen(false);
    setNotice("Profile & expertise update request submitted to Admin for moderation.");
  };

  const uploadDraft = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    if (file.size > 12 * 1024 * 1024) { setNotice("Please use a file below 12 MB or add a Drive link."); return; }
    const reader = new FileReader(); reader.onload = () => setDraft((current) => ({ ...current, fileName: file.name, fileData: String(reader.result || "") })); reader.readAsDataURL(file);
  };

  const publishItem = () => {
    if (!selectedCourse || !safeText(draft.title)) { setNotice("Add a clear title before publishing."); return; }
    const item: ClassworkItem = { id: Date.now(), courseId: selectedCourse.id, type: draft.type, title: safeText(draft.title), instructions: safeText(draft.instructions), link: safeText(draft.link), dueDate: draft.dueDate, fileName: draft.fileName, fileData: draft.fileData, postedAt: new Date().toLocaleString("en-IN") };
    const next = [...items, item]; setItems(next); saveArray("terramatrix_classwork_items", next); setDraft(emptyDraft); setComposerOpen(false); setNotice(`${typeMeta[item.type].label} published to the class.`);
  };

  const deleteItem = (id: number) => {
    if (!window.confirm("Delete this classwork item?")) return;
    const next = items.filter((item) => item.id !== id); setItems(next); saveArray("terramatrix_classwork_items", next);
  };

  const addSchedule = () => {
    if (!selectedCourse || !newSchedule.date || !newSchedule.time) { setNotice("Choose a date and time for the class."); return; }
    const entry: Schedule = { id: Date.now(), courseId: selectedCourse.id, ...newSchedule, note: newSchedule.note || "Live class" };
    const next = [...schedules, entry]; setSchedules(next); saveArray("terramatrix_class_schedules", next); setNewSchedule({ date: "", time: "", note: "" }); setScheduleOpen(false); setNotice("Class added to the learner and instructor schedules.");
  };

  const logout = () => { localStorage.removeItem("terramatrix_instructor_login"); sessionStorage.removeItem("terramatrix_instructor_login"); navigate("/instructor-login"); };

  const workspaceTitle = selectedCourse ? deriveShortTitle(selectedCourse) : view === "calendar" ? "Teaching calendar" : "Instructor overview";

  return (
    <main className="tm3-workspace tm3-instructor-workspace">
      <aside className="tm3-workspace__sidebar">
        <Link className="tm3-workspace__brand" to="/"><img src={logo} alt="" /><span><strong>TerraMatrix</strong><small>Instructor workspace</small></span></Link>
        <div className="tm3-workspace__profile">
          <span>Instructor</span>
          <strong>{login?.name || "Instructor"}</strong>
          <small>{instructor?.designation || login?.email}</small>
          <button
            type="button"
            onClick={() => {
              setProposedExpertise(instructor?.pendingExpertise || instructor?.expertise || "");
              setProposedBio(instructor?.pendingBio || instructor?.bio || "");
              setProfileModalOpen(true);
            }}
            style={{
              marginTop: 10,
              padding: "6px 12px",
              fontSize: "0.72rem",
              fontWeight: 700,
              borderRadius: 8,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#cce4d8",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              width: "100%",
              justifyContent: "center",
            }}
          >
            <Settings2 size={13} />
            <span>Request Profile Update</span>
          </button>
          {instructor?.moderationStatus === "Pending Review" && (
            <span style={{ marginTop: 6, fontSize: "0.68rem", color: "#fef08a", fontWeight: 700 }}>
              ● Profile changes under review
            </span>
          )}
          {instructor?.moderationStatus === "Changes Requested" && (
            <span style={{ marginTop: 6, fontSize: "0.68rem", color: "#fca5a5", fontWeight: 700 }}>
              ● Admin: {instructor.adminFeedback || "Revisions needed"}
            </span>
          )}
        </div>
        <nav className="tm3-workspace-nav" aria-label="Instructor workspace">
          <button type="button" className={view === "home" ? "is-active" : ""} onClick={goHome}><LayoutDashboard size={18} /><span>Overview</span></button>
          <button type="button" className={view === "calendar" ? "is-active" : ""} onClick={goCalendar}><CalendarDays size={18} /><span>Calendar</span></button>
        </nav>
        <div className="tm3-sidebar-label">My programmes</div>
        <div className="tm3-sidebar-courses">
          {courses.map((course) => <button type="button" className={selectedId === course.id ? "is-active" : ""} key={course.id} onClick={() => openCourse(course.id)}><span>{deriveShortTitle(course).slice(0, 1)}</span><strong>{deriveShortTitle(course)}</strong></button>)}
          {!courses.length && <p>No programmes assigned.</p>}
        </div>
        <div className="tm3-workspace__sidebar-footer"><button type="button" onClick={logout}><LogOut size={17} /><span>Sign out</span></button></div>
      </aside>

      <section className="tm3-workspace__main">
        <header className="tm3-workspace-topbar">
          <div><span className="tm3-workspace-kicker">Instructor studio</span><h1>{workspaceTitle}</h1><p>{selectedCourse ? `${selectedCourse.category} · ${courseStudents.length} learners` : `Welcome back, ${login?.name || "Instructor"}.`}</p></div>
          <div className="tm3-workspace-topbar__actions">{selectedCourse && <><button className="tm3-button tm3-button--outline" type="button" onClick={() => setScheduleOpen(true)}><CalendarDays size={16} /> Schedule class</button><button className="tm3-button tm3-button--gold" type="button" onClick={() => setComposerOpen(true)}><Plus size={16} /> Create</button></>}</div>
        </header>

        <div className="tm3-workspace-content">
          {notice && <div className="tm3-notice"><CheckCircle2 size={18} /><span>{notice}</span><button type="button" onClick={() => setNotice("")}>×</button></div>}

          {view === "home" && !selectedCourse && <InstructorHome courses={courses} enrollments={enrollments} submissions={submissions} totalStudents={totalStudents} onOpen={openCourse} />}
          {view === "calendar" && !selectedCourse && <InstructorCalendar courses={courses} schedules={schedules} onOpen={openCourse} />}
          {view === "course" && selectedCourse && (
            <>
              <section className="tm3-instructor-course-hero" style={{ backgroundImage: `linear-gradient(105deg,rgba(5,35,29,.78),rgba(5,35,29,.20)),url('${normalizePublicAssetPath(selectedCourse.imageUrl, heroImage) || heroImage}')`, filter: "brightness(1.03)" }}>
                <div><Badge tone="gold">{selectedCourse.status}</Badge><h2>{selectedCourse.title}</h2><p>{selectedCourse.description}</p><div className="tm3-hero__proof"><span><Users size={16} /> {courseStudents.length} learners</span><span><ClipboardCheck size={16} /> {assignmentCount} assignments</span><span><CalendarDays size={16} /> {courseSchedules.length} scheduled classes</span></div></div>
              </section>
              <div className="tm3-course-tabs" role="tablist">
                {(["curriculum", "stream", "classwork", "people", "analytics"] as CourseTab[]).map((key) => (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={tab === key}
                    className={tab === key ? "is-active" : ""}
                    key={key}
                    onClick={() => setTab(key)}
                  >
                    {key === "curriculum" ? (
                      <Layers size={17} />
                    ) : key === "stream" ? (
                      <Megaphone size={17} />
                    ) : key === "classwork" ? (
                      <BookOpen size={17} />
                    ) : key === "people" ? (
                      <Users size={17} />
                    ) : (
                      <BarChart3 size={17} />
                    )}
                    {key === "curriculum"
                      ? "Curriculum & QA"
                      : key.charAt(0).toUpperCase() + key.slice(1)}
                  </button>
                ))}
              </div>
              {tab === "curriculum" && (
                <CourseCurriculumStudio
                  course={selectedCourse}
                  onSubmitForReview={submitCourseForReview}
                />
              )}
              {tab === "stream" && <CourseStream items={courseItems.filter((item) => item.type === "announcement" || item.type === "recording")} schedules={courseSchedules} course={selectedCourse} onCreate={() => setComposerOpen(true)} onDelete={deleteItem} />}
              {tab === "classwork" && <CourseClasswork items={courseItems.filter((item) => item.type !== "announcement")} submissions={courseSubmissions} onCreate={() => setComposerOpen(true)} onDelete={deleteItem} />}
              {tab === "people" && <CoursePeople students={courseStudents} attendance={courseAttendance} />}
              {tab === "analytics" && <CourseAnalytics students={courseStudents} items={courseItems} submissions={courseSubmissions} attendance={courseAttendance} completionRate={completionRate} />}
            </>
          )}
        </div>
      </section>

      {composerOpen && selectedCourse && <ComposerModal draft={draft} setDraft={setDraft} onUpload={uploadDraft} onClose={() => { setComposerOpen(false); setDraft(emptyDraft); }} onPublish={publishItem} />}
      {scheduleOpen && selectedCourse && <ScheduleModal value={newSchedule} setValue={setNewSchedule} onClose={() => setScheduleOpen(false)} onSave={addSchedule} />}
      {profileModalOpen && (
        <ProfileEditModal
          expertise={proposedExpertise}
          setExpertise={setProposedExpertise}
          bio={proposedBio}
          setBio={setProposedBio}
          onClose={() => setProfileModalOpen(false)}
          onSubmit={submitProfileUpdateRequest}
        />
      )}
    </main>
  );
}

function InstructorHome({ courses, enrollments, submissions, totalStudents, onOpen }: { courses: Course[]; enrollments: Enrollment[]; submissions: Submission[]; totalStudents: number; onOpen: (id: number) => void }) {
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long" });
  return <>
    <section className="tm3-dashboard-hero tm3-dashboard-hero--instructor"><div><div className="tm3-eyebrow tm3-eyebrow--light">Teaching intelligence</div><h2>Shape learning. Track progress. Build capability.</h2><p>Manage every class, resource, assignment and learner interaction from one focused workspace.</p></div><div className="tm3-instructor-today"><CalendarDays size={22} /><span>Today</span><strong>{today}</strong></div></section>
    <div className="tm3-stat-grid"><div className="tm3-stat-card"><span>Assigned programmes</span><strong>{courses.length}</strong></div><div className="tm3-stat-card"><span>Unique learners</span><strong>{totalStudents}</strong></div><div className="tm3-stat-card"><span>Submissions</span><strong>{submissions.length}</strong></div><div className="tm3-stat-card"><span>Active enrolments</span><strong>{enrollments.filter((item) => item.status === "Enrolled").length}</strong></div></div>
    <section className="tm3-dashboard-section tm3-dashboard-section--wide"><div className="tm3-dashboard-section__head"><div><span className="tm3-eyebrow">My programmes</span><h2>Teaching portfolio</h2></div></div>{courses.length ? <div className="tm3-instructor-course-grid">{courses.map((course) => { const count = enrollments.filter((item) => item.courseId === course.id).length; return <article key={course.id}><div className="tm3-instructor-course-card__image" style={{ backgroundImage: `linear-gradient(to top,rgba(5,35,29,.38),transparent 65%),url('${normalizePublicAssetPath(course.imageUrl, heroImage) || heroImage}')`, filter: "brightness(1.04)" }}><Badge tone="gold">{course.status}</Badge><h3>{deriveShortTitle(course)}</h3>{course.title && course.title !== deriveShortTitle(course) && <div className="tm3-course-card__full-title" style={{ color: "#c5d9d1", margin: "2px 0 0" }}>{course.title}</div>}</div><div><span>{course.category}</span><strong>{count} learner{count === 1 ? "" : "s"}</strong><button type="button" onClick={() => onOpen(course.id)}>Open classroom <ChevronRight size={17} /></button></div></article>; })}</div> : <EmptyState title="No assigned programmes" description="The academy administrator can assign courses to your instructor profile." />}</section>
  </>;
}

function InstructorCalendar({ courses, schedules, onOpen }: { courses: Course[]; schedules: Schedule[]; onOpen: (id: number) => void }) {
  const events = schedules.map((item) => ({ ...item, course: courses.find((course) => course.id === item.courseId) })).filter((item) => item.course).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  return <section className="tm3-dashboard-section tm3-dashboard-section--wide"><div className="tm3-dashboard-section__head"><div><span className="tm3-eyebrow">Teaching schedule</span><h2>Upcoming classes</h2></div></div>{events.length ? <div className="tm3-calendar-agenda">{events.map((item) => <article key={item.id}><span className="tm3-session-card__date"><strong>{new Date(`${item.date}T00:00:00`).getDate()}</strong><small>{new Date(`${item.date}T00:00:00`).toLocaleString("en-IN", { month: "short" })}</small></span><div><Badge tone="green">Live class</Badge><h3>{item.note || deriveShortTitle(item.course!)}</h3><p>{deriveShortTitle(item.course!)} · {item.time}</p></div><button type="button" onClick={() => onOpen(item.courseId)}>Open <ChevronRight size={17} /></button></article>)}</div> : <EmptyState title="No classes scheduled" description="Open a programme and schedule a class to build your teaching calendar." />}</section>;
}

function CourseStream({ items, schedules, course, onCreate, onDelete }: { items: ClassworkItem[]; schedules: Schedule[]; course: Course; onCreate: () => void; onDelete: (id: number) => void }) {
  return <div className="tm3-instructor-two-col"><section className="tm3-dashboard-section"><div className="tm3-dashboard-section__head"><h2>Class stream</h2><button type="button" onClick={onCreate}>Post update</button></div><div className="tm3-stream-list">{items.length ? items.map((item) => { const meta = typeMeta[item.type]; const Icon = meta.icon; return <article className="tm3-stream-item tm3-stream-item--admin" key={item.id}><span><Icon size={20} /></span><div><small>{item.postedAt}</small><h3>{item.title}</h3><p>{item.instructions}</p>{item.link && <a href={item.link} target="_blank" rel="noreferrer">Open link</a>}</div><button type="button" onClick={() => onDelete(item.id)}><X size={16} /></button></article>; }) : <EmptyState title="Start the conversation" description="Announcements and recordings help learners stay oriented between classes." actionLabel="Create announcement" onAction={onCreate} />}</div></section><aside className="tm3-dashboard-section"><div className="tm3-dashboard-section__head"><h2>Class schedule</h2></div>{schedules.length ? <div className="tm3-mini-agenda">{schedules.slice(0, 6).map((item) => <div key={item.id}><CalendarDays size={17} /><span><strong>{item.note || "Live class"}</strong><small>{formatDate(item.date)} · {item.time}</small></span></div>)}</div> : <p className="tm3-muted-copy">No classes are scheduled yet.</p>}{course.onlineSessionLink && <a className="tm3-button tm3-button--dark tm3-full-button" href={course.onlineSessionLink} target="_blank" rel="noreferrer"><Video size={16} /> Open meeting room</a>}</aside></div>;
}

function CourseClasswork({ items, submissions, onCreate, onDelete }: { items: ClassworkItem[]; submissions: Submission[]; onCreate: () => void; onDelete: (id: number) => void }) {
  return <section className="tm3-dashboard-section tm3-dashboard-section--wide"><div className="tm3-dashboard-section__head"><div><span className="tm3-eyebrow">Learning design</span><h2>Classwork and resources</h2></div><button type="button" onClick={onCreate}>Create classwork</button></div>{items.length ? <div className="tm3-classwork-list">{items.map((item) => { const meta = typeMeta[item.type]; const Icon = meta.icon; const count = submissions.filter((submission) => submission.itemId === item.id).length; return <article className="tm3-classwork-card" key={item.id}><div className="tm3-classwork-card__head"><span className={`tm3-resource-icon tm3-resource-icon--${meta.tone}`}><Icon size={20} /></span><div><Badge tone={meta.tone}>{meta.label}</Badge><h3>{item.title}</h3><small>{item.dueDate ? `Due ${formatDate(item.dueDate)}` : item.postedAt}</small></div><button className="tm3-icon-delete" type="button" onClick={() => onDelete(item.id)}><X size={16} /></button></div>{item.instructions && <p>{item.instructions}</p>}<div className="tm3-classwork-card__links"><span><Users size={16} /> {item.type === "assignment" ? `${count} submissions` : "Published to class"}</span>{item.link && <a href={item.link} target="_blank" rel="noreferrer">Open resource</a>}</div></article>; })}</div> : <EmptyState title="No classwork yet" description="Create an assignment, material, external link or recording for this programme." actionLabel="Create classwork" onAction={onCreate} />}</section>;
}

function CoursePeople({ students, attendance }: { students: Enrollment[]; attendance: Attendance[] }) {
  const attended = new Set(attendance.map((item) => `${item.email}|${item.phone}`));
  return <section className="tm3-dashboard-section tm3-dashboard-section--wide"><div className="tm3-dashboard-section__head"><div><span className="tm3-eyebrow">Learner management</span><h2>People</h2></div><Badge tone="green">{students.length} enrolled</Badge></div>{students.length ? <div className="tm3-people-table"><div className="tm3-people-table__head"><span>Learner</span><span>Organisation</span><span>Status</span><span>Attendance</span></div>{students.map((student) => <div className="tm3-people-table__row" key={student.id}><span><i>{student.name.slice(0, 1).toUpperCase()}</i><span><strong>{student.name}</strong><small>{student.email}</small></span></span><span>{student.organisation || "—"}</span><span><Badge tone={/completed|certificate/i.test(student.status) ? "gold" : "green"}>{student.status}</Badge></span><span>{attended.has(`${student.email}|${student.phone}`) ? <Badge tone="green">Marked</Badge> : <Badge tone="neutral">Pending</Badge>}</span></div>)}</div> : <EmptyState title="No enrolled learners" description="Learners will appear here after the admin confirms enrolment." />}</section>;
}

function CourseAnalytics({ students, items, submissions, attendance, completionRate }: { students: Enrollment[]; items: ClassworkItem[]; submissions: Submission[]; attendance: Attendance[]; completionRate: number }) {
  const assignments = items.filter((item) => item.type === "assignment");
  const submissionRate = students.length && assignments.length ? Math.min(100, Math.round((submissions.length / (students.length * assignments.length)) * 100)) : 0;
  const attendanceRate = students.length ? Math.min(100, Math.round((new Set(attendance.map((item) => `${item.email}|${item.phone}`)).size / students.length) * 100)) : 0;
  return <><div className="tm3-stat-grid"><div className="tm3-stat-card"><span>Enrolled learners</span><strong>{students.length}</strong></div><div className="tm3-stat-card"><span>Assignment submission</span><strong>{submissionRate}%</strong></div><div className="tm3-stat-card"><span>Attendance</span><strong>{attendanceRate}%</strong></div><div className="tm3-stat-card"><span>Completion</span><strong>{completionRate}%</strong></div></div><section className="tm3-dashboard-section tm3-dashboard-section--wide"><div className="tm3-dashboard-section__head"><div><span className="tm3-eyebrow">Course health</span><h2>Learning engagement</h2></div></div><div className="tm3-analytics-bars"><AnalyticsBar label="Assignment submission" value={submissionRate} /><AnalyticsBar label="Attendance participation" value={attendanceRate} /><AnalyticsBar label="Course completion" value={completionRate} /></div></section></>;
}
function AnalyticsBar({ label, value }: { label: string; value: number }) { return <div><span><strong>{label}</strong><b>{value}%</b></span><div><i style={{ width: `${value}%` }} /></div></div>; }

function ComposerModal({ draft, setDraft, onUpload, onClose, onPublish }: { draft: Draft; setDraft: Dispatch<SetStateAction<Draft>>; onUpload: (event: ChangeEvent<HTMLInputElement>) => void; onClose: () => void; onPublish: () => void }) {
  return <div className="tm3-modal-backdrop" role="presentation"><div className="tm3-modal tm3-modal--composer" role="dialog" aria-modal="true" aria-labelledby="composer-title"><div className="tm3-modal__head"><div><span className="tm3-eyebrow">Create for your class</span><h2 id="composer-title">Publish learning content</h2></div><button type="button" onClick={onClose}><X size={20} /></button></div><div className="tm3-composer-types">{(Object.keys(typeMeta) as ClassworkType[]).map((type) => { const meta = typeMeta[type]; const Icon = meta.icon; return <button type="button" className={draft.type === type ? "is-active" : ""} key={type} onClick={() => setDraft((current) => ({ ...current, type }))}><Icon size={18} /><span>{meta.label}</span></button>; })}</div><div className="tm3-form-grid"><label className="tm3-field tm3-field--full"><span>Title</span><input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} placeholder="A clear, action-oriented title" /></label><label className="tm3-field tm3-field--full"><span>Instructions / context</span><textarea value={draft.instructions} onChange={(event) => setDraft((current) => ({ ...current, instructions: event.target.value }))} placeholder="Explain what learners should know or do…" /></label>{draft.type !== "announcement" && <label className="tm3-field"><span>Resource link</span><input value={draft.link} onChange={(event) => setDraft((current) => ({ ...current, link: event.target.value }))} placeholder="YouTube, Drive, Meet or web link" /></label>}{draft.type === "assignment" && <label className="tm3-field"><span>Due date</span><input type="date" value={draft.dueDate} onChange={(event) => setDraft((current) => ({ ...current, dueDate: event.target.value }))} /></label>}<label className="tm3-field tm3-field--full"><span>Attachment</span><label className="tm3-upload-zone"><Paperclip size={20} /><strong>{draft.fileName || "Attach a learning file"}</strong><small>PDF, document or image up to 12 MB</small><input type="file" onChange={onUpload} /></label></label></div><div className="tm3-modal__actions"><button className="tm3-button tm3-button--outline" type="button" onClick={onClose}>Cancel</button><button className="tm3-button tm3-button--dark" type="button" onClick={onPublish}><Send size={16} /> Publish to class</button></div></div></div>;
}

function ScheduleModal({ value, setValue, onClose, onSave }: { value: { date: string; time: string; note: string }; setValue: Dispatch<SetStateAction<{ date: string; time: string; note: string }>>; onClose: () => void; onSave: () => void }) {
  return <div className="tm3-modal-backdrop"><div className="tm3-modal" role="dialog" aria-modal="true"><div className="tm3-modal__head"><div><span className="tm3-eyebrow">Live learning</span><h2>Schedule a class</h2></div><button type="button" onClick={onClose}><X size={20} /></button></div><div className="tm3-form-grid"><label className="tm3-field"><span>Date</span><input type="date" value={value.date} onChange={(event) => setValue((current) => ({ ...current, date: event.target.value }))} /></label><label className="tm3-field"><span>Time</span><input type="time" value={value.time} onChange={(event) => setValue((current) => ({ ...current, time: event.target.value }))} /></label><label className="tm3-field tm3-field--full"><span>Session title / note</span><input value={value.note} onChange={(event) => setValue((current) => ({ ...current, note: event.target.value }))} placeholder="e.g. Live problem-solving studio" /></label></div><div className="tm3-modal__actions"><button className="tm3-button tm3-button--outline" type="button" onClick={onClose}>Cancel</button><button className="tm3-button tm3-button--dark" type="button" onClick={onSave}><CalendarDays size={16} /> Add to schedule</button></div></div></div>;
}

function ProfileEditModal({
  expertise,
  setExpertise,
  bio,
  setBio,
  onClose,
  onSubmit,
}: {
  expertise: string;
  setExpertise: Dispatch<SetStateAction<string>>;
  bio: string;
  setBio: Dispatch<SetStateAction<string>>;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="tm3-modal-backdrop" role="presentation">
      <div className="tm3-modal" role="dialog" aria-modal="true">
        <div className="tm3-modal__head">
          <div>
            <span className="tm3-eyebrow">Instructor Profile Governance</span>
            <h2>Request Profile & Expertise Update</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <p style={{ margin: "0 0 16px", color: "var(--tm3-text-soft)", fontSize: "0.82rem", lineHeight: 1.5 }}>
          In accordance with TerraMatrix Academy quality standards, all changes to instructor technical expertise tags and official biographies are verified by the Academy Administration before being reflected on the public instructors page.
        </p>
        <div className="tm3-form-grid">
          <label className="tm3-field tm3-field--full">
            <span>Specialized Tool Expertise (comma-separated, max 3-5 key tools)</span>
            <input
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              placeholder="e.g. Remote Sensing, QGIS, Satellite Image Processing, Google Earth Engine"
            />
            <small style={{ color: "var(--tm3-text-soft)", fontSize: "0.72rem" }}>
              Public instructor cards will display the top 3 badges cleanly with a count badge for additional tags.
            </small>
          </label>
          <label className="tm3-field tm3-field--full">
            <span>Professional Biography / Research Summary</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Outline your engineering background, consulting engagements, and key technical capabilities..."
              rows={4}
            />
          </label>
        </div>
        <div className="tm3-modal__actions">
          <button className="tm3-button tm3-button--outline" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="tm3-button tm3-button--gold" type="button" onClick={onSubmit}>
            <Send size={16} /> Submit Request for Approval
          </button>
        </div>
      </div>
    </div>
  );
}

function CourseCurriculumStudio({
  course,
  onSubmitForReview,
}: {
  course: Course;
  onSubmitForReview?: (id: number) => void;
}) {
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false,
  });
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [downloadNotice, setDownloadNotice] = useState(false);

  const modules: MoocModule[] = useMemo(() => {
    if (course.id === 6 || /statistics/i.test(course.title)) {
      return STATISTICS_MOOC_CURRICULUM;
    }
    const outcomesList = (course.outcomes || "")
      .split(/[;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

    return [
      {
        id: 1,
        number: "01",
        title: "Foundations, Theoretical Mechanics & Formulations",
        summary: outcomesList[0] || "Governing mathematical models, standard codes and initial assumptions.",
        topics: [
          {
            id: "t1-1",
            title: "Foundational Theory & Mechanics",
            summary: "Overview of physical behavior and governing equations.",
            units: [
              { id: "u1-1", title: "Introduction & Theoretical Framework", type: "video", durationMinutes: 35, durationLabel: "35 min", summary: `Core mechanics and theoretical derivation for ${course.title}.` },
              { id: "u1-2", title: "Formulations & Code Reference Notes", type: "reading", durationMinutes: 25, durationLabel: "25 min", summary: "Design standard limits, load combinations, and safety factors." },
              { id: "u1-3", title: "Foundations Diagnostic Quiz", type: "quiz", durationMinutes: 20, durationLabel: "20 min", summary: "Formative evaluation on fundamentals and standard code provisions." },
            ],
          },
        ],
      },
      {
        id: 2,
        number: "02",
        title: "Computational Modeling & Solver Discretization",
        summary: outcomesList[1] || "Discretization, grid generation, boundary conditions and numerical convergence.",
        topics: [
          {
            id: "t2-1",
            title: "Model Setup & Grid Mechanics",
            summary: "Translating engineering problem into simulation software.",
            units: [
              { id: "u2-1", title: "Software Workspace & Boundary Initialization", type: "video", durationMinutes: 45, durationLabel: "45 min", summary: "Hands-on walkthrough configuring solver parameters." },
              { id: "u2-2", title: course.materialTitle || "Applied Software Lab & Scripts", type: "lab", durationMinutes: 50, durationLabel: "50 min", summary: course.materialDescription || "Convergence inspection and sanity checks.", fileName: course.materialFileName || "Lab_Files.zip" },
              { id: "u2-3", title: "Computational Problem Set #1", type: "assignment", durationMinutes: 60, durationLabel: "60 min", summary: "Submit discretization results and verification notes." },
            ],
          },
        ],
      },
      {
        id: 3,
        number: "03",
        title: "Compliance Checking, Optimization & Detailing",
        summary: outcomesList[2] || "Serviceability limits, safety factors, and failure mode mitigation.",
        topics: [
          {
            id: "t3-1",
            title: "Design Compliance & Optimization",
            summary: "Interpreting output matrices against standard engineering codes.",
            units: [
              { id: "u3-1", title: "Design Code Compliance & Detailing Rules", type: "reading", durationMinutes: 40, durationLabel: "40 min", summary: "Code-mandated safety margins and reinforcement/geometry detailing." },
              { id: "u3-2", title: "Advanced Problem Formulation & Lab", type: "lab", durationMinutes: 55, durationLabel: "55 min", summary: "Iterative optimization and sensitivity analysis." },
              { id: "u3-3", title: "Mid-Term Technical Evaluation Quiz", type: "quiz", durationMinutes: 25, durationLabel: "25 min", summary: "Assessment on design criteria and code limits." },
            ],
          },
        ],
      },
      {
        id: 4,
        number: "04",
        title: "Capstone Deliverable & Portfolio Project",
        summary: outcomesList[3] || "Comprehensive engineering report, calculations, and drawing deliverables.",
        topics: [
          {
            id: "t4-1",
            title: "Real-World Engineering Capstone",
            summary: "End-to-end design project submitted for peer and instructor review.",
            units: [
              { id: "u4-1", title: "Capstone Project Brief & Industry Specifications", type: "reading", durationMinutes: 30, durationLabel: "30 min", summary: course.assignmentInstructions || "Detailed project requirements, input parameters, and deliverables." },
              { id: "u4-2", title: course.assignmentTitle || "Capstone Submission & Verification Report", type: "assignment", durationMinutes: 120, durationLabel: "120 min", summary: "Submit engineering calculations, drawings, and executive summary." },
            ],
          },
        ],
      },
    ];
  }, [course]);

  const audit: CourseQaAudit = useMemo(() => auditCourseEligibility(modules), [modules]);

  const downloadSyllabusJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ courseTitle: course.title, audit, modules }, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${deriveShortTitle(course).replace(/\s+/g, "_")}_Curriculum_Spec.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setDownloadNotice(true);
    setTimeout(() => setDownloadNotice(false), 3500);
  };

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {/* Moderation & Accreditation Status Alert */}
      {course.moderationStatus === "Pending Review" && (
        <div style={{ padding: "16px 20px", borderRadius: 14, background: "rgba(234, 179, 8, 0.12)", border: "1px solid rgba(234, 179, 8, 0.35)", color: "#fef08a", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Clock3 size={22} style={{ color: "#facc15", flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: "0.92rem", display: "block" }}>Under Academy Moderation & Quality Review</strong>
              <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#fef9c3" }}>
                This course curriculum and specification has been submitted to the TerraMatrix Admin for accreditation against the 7-Point Quality Standards.
              </p>
            </div>
          </div>
          <span className="tm3-badge tm3-badge--gold">Pending Review</span>
        </div>
      )}

      {course.moderationStatus === "Changes Requested" && (
        <div style={{ padding: "16px 20px", borderRadius: 14, background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.35)", color: "#fca5a5", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <AlertCircle size={22} style={{ color: "#ef4444", flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong style={{ fontSize: "0.92rem", display: "block", color: "#fee2e2" }}>Revisions Requested by Academy Admin</strong>
              <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "#fecaca", lineHeight: 1.5 }}>
                Admin Feedback: <em>"{course.adminReviewComment || "Please update syllabus to meet the 10 contact hours requirement and include reproducible computational notebooks."}"</em>
              </p>
            </div>
          </div>
          <button
            type="button"
            className="tm3-button tm3-button--gold"
            onClick={() => onSubmitForReview?.(course.id)}
            style={{ padding: "8px 16px", fontSize: "0.8rem", whiteSpace: "nowrap" }}
          >
            <Send size={15} /> Resubmit with Revisions
          </button>
        </div>
      )}

      {(course.moderationStatus === "Approved" || (!course.moderationStatus && course.status === "Published")) && (
        <div style={{ padding: "14px 20px", borderRadius: 14, background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#a7f3d0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <CheckCircle2 size={22} style={{ color: "var(--tm3-lime)", flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: "0.9rem" }}>Accredited & Published on TerraMatrix Academy</strong>
              <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#d1fae5" }}>
                Course meets TerraMatrix MOOC quality criteria and is live on the public course catalogue.
              </p>
            </div>
          </div>
          <span className="tm3-badge tm3-badge--green">Accredited</span>
        </div>
      )}

      {(!course.moderationStatus || course.moderationStatus === "Draft") && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, padding: "16px 20px", borderRadius: 14, background: "var(--tm3-surface)", border: "1px solid var(--tm3-border)" }}>
          <div>
            <strong style={{ fontSize: "0.92rem", display: "block" }}>Ready for Academic Rollout?</strong>
            <p style={{ margin: "3px 0 0", fontSize: "0.8rem", color: "var(--tm3-text-soft)" }}>
              Submit this course specification to the TerraMatrix Quality Review Committee for admin verification & accreditation.
            </p>
          </div>
          <button
            type="button"
            className="tm3-button tm3-button--gold"
            onClick={() => onSubmitForReview?.(course.id)}
          >
            <ShieldCheck size={16} /> Submit Course for Approval
          </button>
        </div>
      )}

      {/* 1. Quality Assurance Scorecard & Acceptance Status */}
      <section className="tm3-qa-card">
        <div className="tm3-qa-head">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ display: "grid", placeItems: "center", width: 44, height: 44, borderRadius: 14, background: "rgba(214,245,109,.15)", color: "var(--tm3-lime)" }}>
              <ShieldCheck size={26} />
            </span>
            <div>
              <span className="tm3-eyebrow tm3-eyebrow--light" style={{ margin: 0 }}>
                TerraMatrix Academy · Accreditation & Acceptance Standards
              </span>
              <h3>Course Quality Assurance (QA) Engine</h3>
            </div>
          </div>
          <div className="tm3-qa-score-badge">
            <Sparkles size={16} />
            <span>{audit.score}% QA Compliance · {audit.status}</span>
          </div>
        </div>

        {/* Metric Pills */}
        <div className="tm3-qa-metrics">
          <div className="tm3-qa-metric-pill">
            <span>Academic Contact</span>
            <strong>{audit.totalHours} hrs</strong>
            <small style={{ color: "#a4c4b8", fontSize: "0.68rem" }}>{audit.totalDurationMinutes} mins</small>
          </div>
          <div className="tm3-qa-metric-pill">
            <span>Structure</span>
            <strong>{audit.moduleCount} Modules</strong>
            <small style={{ color: "#a4c4b8", fontSize: "0.68rem" }}>{audit.topicCount} Topics</small>
          </div>
          <div className="tm3-qa-metric-pill">
            <span>Content Units</span>
            <strong>{audit.unitCount} Units</strong>
            <small style={{ color: "#a4c4b8", fontSize: "0.68rem" }}>Structured delivery</small>
          </div>
          <div className="tm3-qa-metric-pill">
            <span>Video Lectures</span>
            <strong>{audit.videoCount} Videos</strong>
            <small style={{ color: "#a4c4b8", fontSize: "0.68rem" }}>High-def recorded</small>
          </div>
          <div className="tm3-qa-metric-pill">
            <span>Handouts / Notes</span>
            <strong>{audit.readingCount} Notes</strong>
            <small style={{ color: "#a4c4b8", fontSize: "0.68rem" }}>Scientific readings</small>
          </div>
          <div className="tm3-qa-metric-pill">
            <span>Concept Quizzes</span>
            <strong>{audit.quizCount} Quizzes</strong>
            <small style={{ color: "#a4c4b8", fontSize: "0.68rem" }}>Formative checks</small>
          </div>
          <div className="tm3-qa-metric-pill">
            <span>Assignments / Labs</span>
            <strong>{audit.assignmentCount} Labs</strong>
            <small style={{ color: "#a4c4b8", fontSize: "0.68rem" }}>Hands-on problem sets</small>
          </div>
        </div>

        {/* 7-Point Compliance Matrix */}
        <div className="tm3-qa-checklist-grid">
          {audit.checklist.map((item) => (
            <div className={`tm3-qa-check-item is-${item.status}`} key={item.id}>
              <span className="tm3-qa-check-icon">
                {item.status === "pass" ? (
                  <CheckCircle2 size={16} />
                ) : item.status === "warn" ? (
                  <AlertCircle size={16} />
                ) : (
                  <XCircle size={16} />
                )}
              </span>
              <div className="tm3-qa-check-body">
                <strong>{item.criterion}</strong>
                <p>{item.description}</p>
                <small>Requirement: {item.required} · Found: {item.found}</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Actions & Guidance Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>Course Curriculum & Pedagogical Map</h3>
          <p style={{ margin: "4px 0 0", color: "var(--tm3-text-soft)", fontSize: "0.82rem" }}>
            Review every module, topic, and learning unit scheduled for delivery to learners.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {downloadNotice && <span style={{ color: "var(--tm3-success)", fontSize: 13, fontWeight: 700 }}>Specification downloaded!</span>}
          <button type="button" className="tm3-button tm3-button--outline" onClick={downloadSyllabusJson}>
            <Download size={16} /> Export Syllabus JSON
          </button>
        </div>
      </div>

      {/* 3. Modular Curriculum Tree */}
      <div className="tm3-curriculum-builder">
        {modules.map((mod) => {
          const isOpen = expandedModules[mod.id] ?? false;
          const totalModUnits = mod.topics.reduce((acc, t) => acc + t.units.length, 0);
          const totalModDuration = mod.topics.reduce((acc, t) => acc + t.units.reduce((uacc, u) => uacc + u.durationMinutes, 0), 0);

          return (
            <div className="tm3-mooc-module-card" key={mod.id}>
              <div className="tm3-mooc-module-head" onClick={() => setExpandedModules((prev) => ({ ...prev, [mod.id]: !isOpen }))}>
                <div className="tm3-mooc-module-head-left">
                  <div className="tm3-mooc-module-number">{mod.number}</div>
                  <div className="tm3-mooc-module-info">
                    <h4>{mod.title}</h4>
                    <p>{mod.summary}</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: "0.78rem", color: "var(--tm3-text-soft)", fontWeight: 700 }}>
                    {totalModUnits} units · {totalModDuration} mins
                  </span>
                  <ChevronDown size={18} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
                </div>
              </div>

              {isOpen && (
                <div className="tm3-mooc-module-body">
                  {mod.topics.map((topic) => (
                    <div className="tm3-mooc-topic-block" key={topic.id}>
                      <div className="tm3-mooc-topic-title">
                        <h5>{topic.title}</h5>
                        <small style={{ color: "var(--tm3-text-soft)", fontSize: "0.74rem" }}>{topic.units.length} learning units</small>
                      </div>
                      <div className="tm3-mooc-units-list">
                        {topic.units.map((unit) => {
                          const isUnitActive = activeUnitId === unit.id;
                          return (
                            <div key={unit.id} style={{ display: "grid", gap: 6 }}>
                              <div
                                className="tm3-mooc-unit-row"
                                style={{ cursor: "pointer", border: isUnitActive ? "1px solid var(--tm3-primary)" : undefined }}
                                onClick={() => setActiveUnitId(isUnitActive ? null : unit.id)}
                              >
                                <div className="tm3-mooc-unit-row-left">
                                  <span className={`tm3-unit-type-pill tm3-unit-type-pill--${unit.type === "ref_video" ? "video" : unit.type}`}>
                                    {unit.type}
                                  </span>
                                  <span>{unit.title}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <span className="tm3-unit-duration-pill">
                                    <Clock3 size={12} style={{ verticalAlign: -1, marginRight: 4 }} />
                                    {unit.durationLabel}
                                  </span>
                                  <ChevronRight size={15} style={{ transform: isUnitActive ? "rotate(90deg)" : "none", transition: "transform .2s" }} />
                                </div>
                              </div>

                              {/* Unit Details & Code Snippet Drawer */}
                              {isUnitActive && (
                                <div style={{ padding: "14px 18px", borderRadius: 12, background: "var(--tm3-surface)", border: "1px solid var(--tm3-border)", fontSize: "0.82rem" }}>
                                  <p style={{ margin: "0 0 10px", color: "var(--tm3-text)", lineHeight: 1.5 }}>{unit.summary}</p>
                                  {unit.fileName && (
                                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 8, background: "var(--tm3-surface-muted)", color: "var(--tm3-primary)", fontWeight: 700, fontSize: "0.76rem", marginBottom: 10 }}>
                                      <FileText size={14} /> {unit.fileName}
                                    </div>
                                  )}
                                  {unit.contentSnippet && (
                                    <div style={{ marginTop: 8 }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--tm3-text-soft)", fontSize: "0.72rem", fontWeight: 800, marginBottom: 4, textTransform: "uppercase" }}>
                                        <Code size={13} /> Code / Analytical Script
                                      </div>
                                      <pre className="tm3-code-snippet" style={{ margin: 0, maxHeight: 180, overflow: "auto" }}>
                                        <code>{unit.contentSnippet}</code>
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. TerraMatrix Academy Course Acceptance Criteria Guide */}
      <section className="tm3-dashboard-section tm3-dashboard-section--wide" style={{ marginTop: 12 }}>
        <div className="tm3-dashboard-section__head">
          <div>
            <span className="tm3-eyebrow">Academic Quality & Acceptance Policy</span>
            <h2>Rules & Requirements for Course Acceptance on TerraMatrix Academy</h2>
          </div>
          <Badge tone="green">Accredited Technical Education</Badge>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          <div style={{ padding: 18, borderRadius: 16, background: "var(--tm3-surface)", border: "1px solid var(--tm3-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 10, background: "var(--tm3-primary-soft)", color: "var(--tm3-primary)", fontWeight: 800 }}>1</span>
              <strong style={{ fontSize: "0.92rem" }}>Academic Depth & Hours</strong>
            </div>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--tm3-text-soft)", lineHeight: 1.55 }}>
              Courses must feature a minimum of 10 contact hours (900+ minutes) across at least 4 progressive modules. Trivial crash courses under 5 hours are not eligible for certificate issuance.
            </p>
          </div>

          <div style={{ padding: 18, borderRadius: 16, background: "var(--tm3-surface)", border: "1px solid var(--tm3-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 10, background: "var(--tm3-primary-soft)", color: "var(--tm3-primary)", fontWeight: 800 }}>2</span>
              <strong style={{ fontSize: "0.92rem" }}>Codes & Standards Grounding</strong>
            </div>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--tm3-text-soft)", lineHeight: 1.55 }}>
              All structural, geotechnical, hydraulic, and data courses must reference standard engineering codes (e.g., IS 456, IS 1893, Eurocodes, IRC, ASTM, or published peer-reviewed literature).
            </p>
          </div>

          <div style={{ padding: 18, borderRadius: 16, background: "var(--tm3-surface)", border: "1px solid var(--tm3-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 10, background: "var(--tm3-primary-soft)", color: "var(--tm3-primary)", fontWeight: 800 }}>3</span>
              <strong style={{ fontSize: "0.92rem" }}>Reproducible Computational Labs</strong>
            </div>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--tm3-text-soft)", lineHeight: 1.55 }}>
              Theory alone is insufficient. Each module must provide verified code notebooks (Python/R), modeling project files (SAP2000, ETABS, HEC-RAS, Revit), or GIS layers with datasets.
            </p>
          </div>

          <div style={{ padding: 18, borderRadius: 16, background: "var(--tm3-surface)", border: "1px solid var(--tm3-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 10, background: "var(--tm3-primary-soft)", color: "var(--tm3-primary)", fontWeight: 800 }}>4</span>
              <strong style={{ fontSize: "0.92rem" }}>Verified Capstone Deliverable</strong>
            </div>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--tm3-text-soft)", lineHeight: 1.55 }}>
              Learners must submit a comprehensive final project deliverable evaluated against a clear rubric. Only passing submissions unlock the blockchain-verifiable TerraMatrix Certificate.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
