import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CSSProperties, ReactNode } from "react";

type InstructorLogin = {
  id: number;
  email: string;
  phone: string;
  name: string;
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

type Enrollment = {
  id: number;
  courseId: number;
  courseTitle: string;
  name: string;
  email: string;
  phone: string;
  organisation: string;
  enrolledAt: string;
  status: "Enrolled" | "Course Completed" | "Certificate Issued";
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

type ActiveTab = "stream" | "classwork" | "people" | "grades" | "analytics";
type SideView = "home" | "calendar";

const classworkTypeLabels: Record<ClassworkType, string> = {
  announcement: "Announcement",
  material: "Material",
  assignment: "Assignment",
  link: "Link",
  recording: "Recording",
};

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
    instructorIds: Array.isArray(course.instructorIds) ? course.instructorIds : [],
    startDate: course.startDate || "To be announced",
    fee: course.fee || "To be announced",
    certificate: course.certificate || "Yes",
    description: course.description || "",
    outcomes: course.outcomes || "",
    brochureName: course.brochureName || "",
    brochureData: course.brochureData || "",
    status: course.status === "Draft" ? "Draft" : "Published",
    onlineSessionLink: course.onlineSessionLink || "",
    onlineSessionDate: course.onlineSessionDate || "",
    onlineSessionTime: course.onlineSessionTime || "",
    recordingLink: course.recordingLink || "",
    materialTitle: course.materialTitle || "Course Reading Material",
    materialDescription: course.materialDescription || "",
    materialFileName: course.materialFileName || "",
    materialFileData: course.materialFileData || "",
    assignmentTitle: course.assignmentTitle || "Assignment",
    assignmentInstructions: course.assignmentInstructions || "",
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

function getCourseCardTitle(course?: Course | null) {
  return course?.shortTitle || deriveCompactCourseTitle(course?.title || "Course");
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

function getEmptyClassworkItem(
  courseId: number,
  type: ClassworkType
): ClassworkItem {
  return {
    id: Date.now(),
    courseId,
    type,
    title: "",
    instructions: "",
    link: "",
    fileName: "",
    fileData: "",
    dueDate: "",
    postedAt: new Date().toLocaleString(),
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

function getMeetingType(link: string) {
  const value = link.toLowerCase();

  if (value.includes("meet.google")) {
    return { label: "Google Meet", logo: "🎥" };
  }

  if (value.includes("bigbluebutton") || value.includes("bbb")) {
    return { label: "BigBlueButton", logo: "🔵" };
  }

  return { label: "Online Class", logo: "🔗" };
}

function normalizeSchedule(schedule: Partial<ClassSchedule>): ClassSchedule {
  return {
    id: schedule.id || Date.now(),
    courseId: schedule.courseId || 0,
    date: schedule.date || "",
    time: schedule.time || "",
    note: schedule.note || "",
  };
}

function parseIsoDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function buildScheduleDates(startDate: string, repeat: string, untilDate: string) {
  if (!startDate) return [];

  const start = parseIsoDate(startDate);
  const until = repeat === "none" || !untilDate ? start : parseIsoDate(untilDate);
  const dates: string[] = [];

  if (Number.isNaN(start.getTime()) || Number.isNaN(until.getTime())) return [];
  if (until < start) return [];

  const cursor = new Date(start);
  let guard = 0;

  while (cursor <= until && guard < 80) {
    const day = cursor.getDay();

    if (repeat !== "weekdays" || (day >= 1 && day <= 5)) {
      dates.push(toIsoDate(cursor));
    }

    if (repeat === "none") break;
    if (repeat === "daily" || repeat === "weekdays") cursor.setDate(cursor.getDate() + 1);
    if (repeat === "weekly") cursor.setDate(cursor.getDate() + 7);
    if (repeat === "monthly") cursor.setMonth(cursor.getMonth() + 1);

    guard += 1;
  }

  return dates;
}

const repeatLabels: Record<string, string> = {
  none: "Does not repeat",
  daily: "Daily",
  weekly: "Weekly",
  weekdays: "Every weekday",
  monthly: "Monthly",
};

export default function InstructorPortal() {
  const navigate = useNavigate();

  const [login, setLogin] = useState<InstructorLogin | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [classworkItems, setClassworkItems] = useState<ClassworkItem[]>([]);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("stream");
  const [activeSideView, setActiveSideView] = useState<SideView>("home");
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [editingItem, setEditingItem] = useState<ClassworkItem | null>(null);
  const [newScheduleDate, setNewScheduleDate] = useState("");
  const [newScheduleTime, setNewScheduleTime] = useState("");
  const [newScheduleRepeat, setNewScheduleRepeat] = useState("none");
  const [newScheduleUntil, setNewScheduleUntil] = useState("");

  useEffect(() => {
    const savedLogin =
      localStorage.getItem("terramatrix_instructor_login") ||
      sessionStorage.getItem("terramatrix_instructor_login");

    if (!savedLogin) {
      navigate("/instructor-login");
      return;
    }

    localStorage.setItem("terramatrix_instructor_login", savedLogin);
    sessionStorage.setItem("terramatrix_instructor_login", savedLogin);

    const parsedLogin = JSON.parse(savedLogin);
    setLogin(parsedLogin);

    const savedCourses = localStorage.getItem("terramatrix_courses");
    const allCourses: Course[] = savedCourses
      ? JSON.parse(savedCourses).map((item: Partial<Course>) =>
          normalizeCourse(item)
        )
      : [];

    const linkedCourses = allCourses.filter((course) =>
      course.instructorIds.includes(parsedLogin.id)
    );

    setCourses(linkedCourses);

    const savedEnrollments = localStorage.getItem("terramatrix_enrollments");
    setEnrollments(savedEnrollments ? JSON.parse(savedEnrollments) : []);

    const savedSubmissions = localStorage.getItem(
      "terramatrix_assignment_submissions"
    );
    setSubmissions(
      savedSubmissions
        ? JSON.parse(savedSubmissions).map((item: AssignmentSubmission) => ({
            ...item,
            itemId: item.itemId || 0,
          }))
        : []
    );

    const savedAttendance = localStorage.getItem("terramatrix_attendance");
    setAttendance(savedAttendance ? JSON.parse(savedAttendance) : []);

    const savedClasswork = localStorage.getItem("terramatrix_classwork_items");
    setClassworkItems(
      savedClasswork
        ? JSON.parse(savedClasswork).map((item: Partial<ClassworkItem>) =>
            normalizeClassworkItem(item)
          )
        : []
    );

    const savedSchedules = localStorage.getItem("terramatrix_class_schedules");
    setSchedules(
      savedSchedules
        ? JSON.parse(savedSchedules).map((item: Partial<ClassSchedule>) =>
            normalizeSchedule(item)
          )
        : []
    );
  }, [navigate]);

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) || null,
    [courses, selectedCourseId]
  );

  const selectedCourseItems = useMemo(
    () =>
      selectedCourse
        ? classworkItems
            .filter((item) => item.courseId === selectedCourse.id)
            .sort((a, b) => b.id - a.id)
        : [],
    [classworkItems, selectedCourse]
  );

  const selectedCourseSchedules = useMemo(
    () =>
      selectedCourse
        ? schedules
            .filter((item) => item.courseId === selectedCourse.id)
            .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
        : [],
    [schedules, selectedCourse]
  );

  const courseStudents = useMemo(
    () =>
      selectedCourse
        ? enrollments.filter((item) => item.courseId === selectedCourse.id)
        : [],
    [enrollments, selectedCourse]
  );

  const courseSubmissions = useMemo(
    () =>
      selectedCourse
        ? submissions.filter((item) => item.courseId === selectedCourse.id)
        : [],
    [submissions, selectedCourse]
  );

  const courseAttendance = useMemo(
    () =>
      selectedCourse
        ? attendance.filter((item) => item.courseId === selectedCourse.id)
        : [],
    [attendance, selectedCourse]
  );


  const logout = () => {
    localStorage.removeItem("terramatrix_instructor_login");
    sessionStorage.removeItem("terramatrix_instructor_login");
    navigate("/instructor-login");
  };

  const openCourse = (courseId: number) => {
    setSelectedCourseId(courseId);
    setActiveSideView("home");
    setActiveTab("stream");
    setShowCreateMenu(false);
    setEditingItem(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showSideView = (view: SideView) => {
    setSelectedCourseId(null);
    setActiveSideView(view);
    setShowCreateMenu(false);
    setEditingItem(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveCourse = (updatedCourse: Course) => {
    const savedCourses = localStorage.getItem("terramatrix_courses");
    const allCourses: Course[] = savedCourses
      ? JSON.parse(savedCourses).map((item: Partial<Course>) =>
          normalizeCourse(item)
        )
      : [];

    const updatedAllCourses = allCourses.map((course) =>
      course.id === updatedCourse.id ? updatedCourse : course
    );

    localStorage.setItem("terramatrix_courses", JSON.stringify(updatedAllCourses));

    setCourses((current) =>
      current.map((course) =>
        course.id === updatedCourse.id ? updatedCourse : course
      )
    );

    alert("Classroom updated.");
  };

  const updateCourseField = (
    courseId: number,
    key: keyof Course,
    value: string
  ) => {
    setCourses((current) =>
      current.map((course) =>
        course.id === courseId ? { ...course, [key]: value } : course
      )
    );
  };

  const startCreateItem = (type: ClassworkType) => {
    if (!selectedCourse) return;
    setEditingItem(getEmptyClassworkItem(selectedCourse.id, type));
    setShowCreateMenu(false);
  };

  const saveClassworkItem = () => {
    if (!editingItem) return;

    if (!editingItem.title.trim()) {
      alert("Please enter a title.");
      return;
    }

    const normalized = {
      ...editingItem,
      title: editingItem.title.trim(),
      instructions: editingItem.instructions.trim(),
      link: editingItem.link.trim(),
    };

    const exists = classworkItems.some((item) => item.id === normalized.id);
    const updated = exists
      ? classworkItems.map((item) => (item.id === normalized.id ? normalized : item))
      : [normalized, ...classworkItems];

    setClassworkItems(updated);
    localStorage.setItem("terramatrix_classwork_items", JSON.stringify(updated));
    setEditingItem(null);
    alert(`${classworkTypeLabels[normalized.type]} saved.`);
  };

  const deleteClassworkItem = (id: number) => {
    const updated = classworkItems.filter((item) => item.id !== id);
    setClassworkItems(updated);
    localStorage.setItem("terramatrix_classwork_items", JSON.stringify(updated));
  };

  const addSchedule = () => {
    if (!selectedCourse) return;

    if (!newScheduleDate || !newScheduleTime) {
      alert("Please select both date and time.");
      return;
    }

    if (newScheduleRepeat !== "none" && !newScheduleUntil) {
      alert("Please select an end date for the recurring schedule.");
      return;
    }

    const scheduleDates = buildScheduleDates(
      newScheduleDate,
      newScheduleRepeat,
      newScheduleUntil
    );

    if (scheduleDates.length === 0) {
      alert("Please check the selected dates.");
      return;
    }

    const repeatNote =
      newScheduleRepeat === "none" ? "" : repeatLabels[newScheduleRepeat] || "";

    const newSchedules: ClassSchedule[] = scheduleDates.map((date, index) => ({
      id: Date.now() + index,
      courseId: selectedCourse.id,
      date,
      time: newScheduleTime,
      note: repeatNote,
    }));

    const existingKeys = new Set(
      schedules.map((item) => `${item.courseId}-${item.date}-${item.time}`)
    );

    const filteredNewSchedules = newSchedules.filter(
      (item) => !existingKeys.has(`${item.courseId}-${item.date}-${item.time}`)
    );

    const updated = [...schedules, ...filteredNewSchedules].sort((a, b) =>
      `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
    );

    setSchedules(updated);
    localStorage.setItem("terramatrix_class_schedules", JSON.stringify(updated));
    setNewScheduleDate("");
    setNewScheduleTime("");
    setNewScheduleRepeat("none");
    setNewScheduleUntil("");
  };

  const deleteSchedule = (id: number) => {
    const updated = schedules.filter((item) => item.id !== id);
    setSchedules(updated);
    localStorage.setItem("terramatrix_class_schedules", JSON.stringify(updated));
  };

  const uploadClassworkFile = (file?: File) => {
    if (!file || !editingItem) return;

    const reader = new FileReader();

    reader.onload = () => {
      setEditingItem({
        ...editingItem,
        fileName: file.name,
        fileData: String(reader.result),
      });
    };

    reader.readAsDataURL(file);
  };

  const countEnrollments = (courseId: number) =>
    enrollments.filter((item) => item.courseId === courseId).length;


  const countAttendance = (courseId: number) =>
    attendance.filter((item) => item.courseId === courseId).length;

  const selectedPageTitle = selectedCourse
    ? selectedCourse.title
    : activeSideView === "calendar"
      ? "Calendar"
      : "Instructor Dashboard";

  return (
    <main style={page}>
      <aside style={sideBar}>
        <div style={instructorInfoBox}>
          <span style={instructorInfoLabel}>Instructor</span>
          <strong>{login?.name || "Instructor"}</strong>
          {login?.email && <span style={instructorInfoEmail}>{login.email}</span>}
        </div>

        <button
          onClick={() => showSideView("home")}
          style={activeSideView === "home" && !selectedCourse ? activeSideNavItem : sideNavItem}
        >
          ⌂ Home
        </button>

        <button
          onClick={() => showSideView("calendar")}
          style={activeSideView === "calendar" && !selectedCourse ? activeSideNavItem : sideNavItem}
        >
          ▣ Calendar
        </button>

        <div style={courseListSpacer} />

        {courses.map((course) => (
          <button
            key={course.id}
            onClick={() => openCourse(course.id)}
            style={{
              ...miniCourseButton,
              ...(selectedCourseId === course.id ? selectedMiniCourseButton : {}),
            }}
          >
            <span style={courseInitial}>
              {getCourseCardTitle(course).slice(0, 1).toUpperCase()}
            </span>
            <span>{getCourseCardTitle(course)}</span>
          </button>
        ))}

        {selectedCourse && (
          <ClassQuickLinks
            course={selectedCourse}
            schedules={selectedCourseSchedules}
            newScheduleDate={newScheduleDate}
            setNewScheduleDate={setNewScheduleDate}
            newScheduleTime={newScheduleTime}
            setNewScheduleTime={setNewScheduleTime}
            newScheduleRepeat={newScheduleRepeat}
            setNewScheduleRepeat={setNewScheduleRepeat}
            newScheduleUntil={newScheduleUntil}
            setNewScheduleUntil={setNewScheduleUntil}
            addSchedule={addSchedule}
            deleteSchedule={deleteSchedule}
          />
        )}
      </aside>

      <section style={mainArea}>
        <header style={topBar}>
          <div style={topTitle}>{selectedPageTitle}</div>

          <button onClick={logout} style={logoutButton}>
            Logout
          </button>
        </header>

        {!selectedCourse && activeSideView === "home" && (
          <InstructorHome
            courses={courses}
            onOpenCourse={openCourse}
            countEnrollments={countEnrollments}
          />
        )}

        {!selectedCourse && activeSideView === "calendar" && (
          <CalendarView
            courses={courses}
            schedules={schedules}
            onOpenCourse={openCourse}
          />
        )}

        {selectedCourse && (
          <ClassroomView
            course={selectedCourse}
            instructorName={login?.name || "Instructor"}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            showCreateMenu={showCreateMenu}
            setShowCreateMenu={setShowCreateMenu}
            startCreateItem={startCreateItem}
            items={selectedCourseItems}
            students={courseStudents}
            submissions={courseSubmissions}
            attendance={courseAttendance}
            editItem={setEditingItem}
            deleteItem={deleteClassworkItem}
          />
        )}

        {editingItem && (
          <ItemEditorModal
            item={editingItem}
            setItem={setEditingItem}
            onClose={() => setEditingItem(null)}
            onSave={saveClassworkItem}
            onUploadFile={uploadClassworkFile}
          />
        )}
      </section>
    </main>
  );
}

function InstructorHome({
  courses,
  onOpenCourse,
  countEnrollments,
}: {
  courses: Course[];
  onOpenCourse: (courseId: number) => void;
  countEnrollments: (courseId: number) => number;
}) {
  return (
    <>
      <section style={homeHeader}>
        <h1 style={homeTitle}>My Classes</h1>
      </section>

      <section style={courseGrid}>
        {courses.length === 0 ? (
          <div style={emptyCard}>
            <h2>No assigned classes found</h2>
            <p>
              Ask the admin to create a course and link your instructor profile
              to that course.
            </p>
          </div>
        ) : (
          courses.map((course) => (
            <article key={course.id} style={classCard}>
              <div
                style={{
                  ...classCardBanner,
                  backgroundImage: `linear-gradient(90deg, rgba(0,105,92,0.95), rgba(0,105,92,0.62)), url('${course.imageUrl}')`,
                }}
              >
                <h2 style={classCardTitle}>{getCourseCardTitle(course)}</h2>
                <p style={classCardSubtitle}>{course.category}</p>
              </div>

              <div style={classCardBody}>
                <span style={enrolledLine}>
                  Enrolled: <strong>{countEnrollments(course.id)}</strong>
                </span>
              </div>

              <div style={classCardFooter}>
                <button
                  onClick={() => onOpenCourse(course.id)}
                  style={openClassButton}
                >
                  Open Classroom
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </>
  );
}

function CalendarView({
  courses,
  schedules,
  onOpenCourse,
}: {
  courses: Course[];
  schedules: ClassSchedule[];
  onOpenCourse: (courseId: number) => void;
}) {
  const [monthCursor, setMonthCursor] = useState(() => new Date());
  const monthStart = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
  const monthLabel = monthStart.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const coursePalette = ["#1A73E8", "#0B8043", "#F9AB00", "#A142F4", "#D93025", "#00897B"];

  const toIsoDate = (value: string) => {
    if (!value) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";

    return parsed.toISOString().slice(0, 10);
  };

  const getCourse = (courseId: number) =>
    courses.find((course) => course.id === courseId);

  const getCourseColor = (courseId: number) => {
    const index = Math.abs(courseId) % coursePalette.length;
    return coursePalette[index];
  };

  const moveMonth = (direction: number) => {
    setMonthCursor(
      (current) => new Date(current.getFullYear(), current.getMonth() + direction, 1)
    );
  };

  const classEvents = [
    ...courses
      .filter((course) => toIsoDate(course.onlineSessionDate))
      .map((course) => ({
        id: `course-${course.id}`,
        courseId: course.id,
        date: toIsoDate(course.onlineSessionDate),
        time: course.onlineSessionTime,
        title: getCourseCardTitle(course),
        note: "Scheduled class",
      })),
    ...schedules
      .filter((schedule) => getCourse(schedule.courseId))
      .map((schedule) => ({
        id: `schedule-${schedule.id}`,
        courseId: schedule.courseId,
        date: toIsoDate(schedule.date),
        time: schedule.time,
        title: getCourseCardTitle(getCourse(schedule.courseId)),
        note: schedule.note || "Scheduled class",
      })),
  ].filter((event) => event.date);

  const monthKey = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}`;
  const monthEvents = classEvents.filter((event) => event.date.startsWith(monthKey));

  const eventsByDate = monthEvents.reduce<Record<string, typeof monthEvents>>(
    (groups, event) => {
      groups[event.date] = [...(groups[event.date] || []), event];
      return groups;
    },
    {}
  );

  const firstDay = monthStart.getDay();
  const daysInMonth = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth() + 1,
    0
  ).getDate();

  const blankCells = Array.from({ length: firstDay }, (_, index) => index);
  const monthDays = Array.from({ length: daysInMonth }, (_, index) => index + 1);

  return (
    <section style={utilityPage}>
      <div style={calendarHeader}>
        <div>
          <h1 style={calendarTitle}>Monthly Calendar</h1>
          <p style={calendarSubText}>
            Scheduled classes for assigned courses are highlighted below.
          </p>
        </div>

        <div style={calendarMonthControls}>
          <button onClick={() => moveMonth(-1)} style={calendarNavButton}>‹</button>
          <strong>{monthLabel}</strong>
          <button onClick={() => moveMonth(1)} style={calendarNavButton}>›</button>
        </div>
      </div>

      <div style={calendarLegend}>
        {courses.map((course) => (
          <button
            key={course.id}
            onClick={() => onOpenCourse(course.id)}
            style={calendarLegendItem}
          >
            <span style={{ ...calendarColorDot, background: getCourseColor(course.id) }} />
            {getCourseCardTitle(course)}
          </button>
        ))}
      </div>

      <div style={monthGrid}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} style={weekdayCell}>
            {day}
          </div>
        ))}

        {blankCells.map((cell) => (
          <div key={`blank-${cell}`} style={blankDayCell} />
        ))}

        {monthDays.map((day) => {
          const dateString = `${monthKey}-${String(day).padStart(2, "0")}`;
          const dayEvents = eventsByDate[dateString] || [];

          return (
            <div
              key={dateString}
              style={dayEvents.length > 0 ? activeDayCell : dayCell}
            >
              <div style={dayNumber}>{day}</div>

              <div style={dayEventList}>
                {dayEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => onOpenCourse(event.courseId)}
                    style={{
                      ...calendarEvent,
                      borderLeft: `4px solid ${getCourseColor(event.courseId)}`,
                    }}
                  >
                    <strong>{event.title}</strong>
                    <span>{event.time || "Time TBA"}</span>
                    {event.note && <span>{event.note}</span>}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {monthEvents.length === 0 && (
        <div style={calendarEmptyNote}>
          No scheduled classes are available for this month.
        </div>
      )}
    </section>
  );
}

function ClassQuickLinks({
  course,
  schedules,
  newScheduleDate,
  setNewScheduleDate,
  newScheduleTime,
  setNewScheduleTime,
  newScheduleRepeat,
  setNewScheduleRepeat,
  newScheduleUntil,
  setNewScheduleUntil,
  addSchedule,
  deleteSchedule,
}: {
  course: Course;
  schedules: ClassSchedule[];
  newScheduleDate: string;
  setNewScheduleDate: (value: string) => void;
  newScheduleTime: string;
  setNewScheduleTime: (value: string) => void;
  newScheduleRepeat: string;
  setNewScheduleRepeat: (value: string) => void;
  newScheduleUntil: string;
  setNewScheduleUntil: (value: string) => void;
  addSchedule: () => void;
  deleteSchedule: (id: number) => void;
}) {
  return (
    <div style={sideQuickLinks}>
      <div style={sideSectionTitle}>Online Session Link</div>

      <div style={meetingBox}>
        {course.onlineSessionLink ? (
          <a
            href={course.onlineSessionLink}
            target="_blank"
            rel="noreferrer"
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

      <div style={sideSectionTitle}>Session Schedule</div>

      <Field label="Date">
        <input
          type="date"
          value={newScheduleDate}
          onChange={(e) => setNewScheduleDate(e.target.value)}
          style={compactInput}
        />
      </Field>

      <Field label="Time">
        <input
          type="time"
          value={newScheduleTime}
          onChange={(e) => setNewScheduleTime(e.target.value)}
          style={compactInput}
        />
      </Field>

      <Field label="Repeat">
        <select
          value={newScheduleRepeat}
          onChange={(e) => {
            setNewScheduleRepeat(e.target.value);
            if (e.target.value === "none") setNewScheduleUntil("");
          }}
          style={compactInput}
        >
          <option value="none">Does not repeat</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="weekdays">Every weekday</option>
          <option value="monthly">Monthly</option>
        </select>
      </Field>

      {newScheduleRepeat !== "none" && (
        <Field label="Ends on">
          <input
            type="date"
            value={newScheduleUntil}
            onChange={(e) => setNewScheduleUntil(e.target.value)}
            style={compactInput}
          />
        </Field>
      )}

      <button onClick={addSchedule} style={sideSaveButton}>
        Save Schedule
      </button>

      <div style={scheduleList}>
        {course.onlineSessionDate && (
          <div style={scheduleItem}>
            <div style={scheduleLine}>
              <strong>{formatDisplayDate(course.onlineSessionDate)}</strong>
              <span>{course.onlineSessionTime || "Time not set"}</span>
            </div>
          </div>
        )}

        {schedules.map((schedule) => (
          <div key={schedule.id} style={scheduleItem}>
            <button
              onClick={() => deleteSchedule(schedule.id)}
              style={miniDeleteButton}
              title="Remove schedule"
            >
              ×
            </button>

            <div style={scheduleLine}>
              <strong>{formatDisplayDate(schedule.date)}</strong>
              <span>{schedule.time}</span>
            </div>

            {schedule.note && <small style={scheduleNote}>{schedule.note}</small>}
          </div>
        ))}
      </div>
    </div>
  );
}

function ClassroomView({
  course,
  instructorName,
  activeTab,
  setActiveTab,
  showCreateMenu,
  setShowCreateMenu,
  startCreateItem,
  items,
  students,
  submissions,
  attendance,
  editItem,
  deleteItem,
}: {
  course: Course;
  instructorName: string;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  showCreateMenu: boolean;
  setShowCreateMenu: (value: boolean) => void;
  startCreateItem: (type: ClassworkType) => void;
  items: ClassworkItem[];
  students: Enrollment[];
  submissions: AssignmentSubmission[];
  attendance: AttendanceRecord[];
  editItem: (item: ClassworkItem) => void;
  deleteItem: (id: number) => void;
}) {
  return (
    <>
      <nav style={tabBar}>
        <button onClick={() => setActiveTab("stream")} style={activeTab === "stream" ? activeTabButton : tabButton}>Stream</button>
        <button onClick={() => setActiveTab("classwork")} style={activeTab === "classwork" ? activeTabButton : tabButton}>Classwork</button>
        <button onClick={() => setActiveTab("people")} style={activeTab === "people" ? activeTabButton : tabButton}>People</button>
        <button onClick={() => setActiveTab("grades")} style={activeTab === "grades" ? activeTabButton : tabButton}>Grades</button>
        <button onClick={() => setActiveTab("analytics")} style={activeTab === "analytics" ? activeTabButton : tabButton}>Analytics</button>
      </nav>

      <section style={classWorkspace}>
        <div
          style={{
            ...classBanner,
            backgroundImage: `linear-gradient(90deg, rgba(0,105,92,0.95), rgba(0,105,92,0.72), rgba(0,105,92,0.28)), url('${course.imageUrl}')`,
          }}
        >
          <h1 style={classBannerTitle}>{course.title}</h1>
          <p style={classBannerSubtitle}>{course.category}</p>
        </div>

        {activeTab === "stream" && (
          <StreamTab instructorName={instructorName} items={items} editItem={editItem} />
        )}

        {activeTab === "classwork" && (
          <ClassworkTab
            showCreateMenu={showCreateMenu}
            setShowCreateMenu={setShowCreateMenu}
            startCreateItem={startCreateItem}
            items={items}
            editItem={editItem}
            deleteItem={deleteItem}
          />
        )}

        {activeTab === "people" && <PeopleTab instructorName={instructorName} students={students} />}
        {activeTab === "grades" && <GradesTab submissions={submissions} students={students} assignments={items.filter((item) => item.type === "assignment")} />}
        {activeTab === "analytics" && <AnalyticsTab students={students} submissions={submissions} attendance={attendance} />}
      </section>
    </>
  );
}

function StreamTab({
  instructorName,
  items,
  editItem,
}: {
  instructorName: string;
  items: ClassworkItem[];
  editItem: (item: ClassworkItem) => void;
}) {
  return (
    <section style={streamPosts}>
      <div style={announcementBox}>
        <strong>New Announcements</strong>
      </div>

      {items.length === 0 ? (
        <div style={emptyCard}>
          No posts yet. Create a material, assignment or announcement from Classwork.
        </div>
      ) : (
        items.map((item) => (
          <PostCard
            key={item.id}
            icon={getTypeIcon(item.type)}
            title={`${instructorName} posted ${classworkTypeLabels[item.type]}: ${item.title}`}
            subtitle={item.instructions || item.link || item.fileName || item.postedAt}
            onEdit={() => editItem(item)}
          />
        ))
      )}
    </section>
  );
}

function ClassworkTab({
  showCreateMenu,
  setShowCreateMenu,
  startCreateItem,
  items,
  editItem,
  deleteItem,
}: {
  showCreateMenu: boolean;
  setShowCreateMenu: (value: boolean) => void;
  startCreateItem: (type: ClassworkType) => void;
  items: ClassworkItem[];
  editItem: (item: ClassworkItem) => void;
  deleteItem: (id: number) => void;
}) {
  return (
    <section style={classworkArea}>
      <div style={createBar}>
        <div style={createWrap}>
          <button onClick={() => setShowCreateMenu(!showCreateMenu)} style={createButton}>
            ＋ Create
          </button>

          {showCreateMenu && (
            <div style={createMenu}>
              <button onClick={() => startCreateItem("assignment")} style={createMenuItem}>Assignment</button>
              <button onClick={() => startCreateItem("material")} style={createMenuItem}>Material</button>
              <button onClick={() => startCreateItem("announcement")} style={createMenuItem}>Announcement</button>
              <button onClick={() => startCreateItem("link")} style={createMenuItem}>Link</button>
              <button onClick={() => startCreateItem("recording")} style={createMenuItem}>Recording</button>
            </div>
          )}
        </div>

        <select style={topicFilter}>
          <option>All topics</option>
          <option>Materials</option>
          <option>Assignments</option>
          <option>Recordings</option>
        </select>
      </div>

      <div style={topicBlock}>
        <h2>Classwork</h2>

        {items.length === 0 ? (
          <div style={emptyCard}>No classwork added yet.</div>
        ) : (
          items.map((item) => (
            <div key={item.id} style={classworkItem}>
              <span style={materialIcon}>{getTypeIcon(item.type)}</span>

              <div>
                <div style={classworkItemHeader}>
                  <div>
                    <strong>{item.title}</strong>
                    <p style={noteText}>
                      {classworkTypeLabels[item.type]} · Posted {item.postedAt}
                      {item.dueDate ? ` · Due ${formatDisplayDate(item.dueDate)}` : ""}
                    </p>
                  </div>

                  <div style={smallActionRow}>
                    <button onClick={() => editItem(item)} style={smallButton}>Edit</button>
                    <button onClick={() => deleteItem(item.id)} style={deleteButton}>Delete</button>
                  </div>
                </div>

                {item.instructions && <p>{item.instructions}</p>}
                {item.link && <a href={item.link} target="_blank" rel="noreferrer" style={smallLink}>Open Link</a>}
                {item.fileData && <a href={item.fileData} download={item.fileName || "classwork-file"} style={smallLink}>Download {item.fileName || "file"}</a>}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function ItemEditorModal({
  item,
  setItem,
  onClose,
  onSave,
  onUploadFile,
}: {
  item: ClassworkItem;
  setItem: (item: ClassworkItem) => void;
  onClose: () => void;
  onSave: () => void;
  onUploadFile: (file?: File) => void;
}) {
  return (
    <div style={modalBackdrop}>
      <div style={modalCard}>
        <button onClick={onClose} style={closeButton}>×</button>

        <div style={eyebrow}>{classworkTypeLabels[item.type].toUpperCase()}</div>
        <h2 style={modalTitle}>
          {item.title ? "Edit" : "Create"} {classworkTypeLabels[item.type]}
        </h2>

        <Field label="Title">
          <input value={item.title} onChange={(e) => setItem({ ...item, title: e.target.value })} style={inputStyle} placeholder={`Enter ${classworkTypeLabels[item.type].toLowerCase()} title`} />
        </Field>

        <Field label="Instructions / Description">
          <textarea value={item.instructions} onChange={(e) => setItem({ ...item, instructions: e.target.value })} style={textareaStyle} placeholder="Add instructions or description" />
        </Field>

        {(item.type === "link" || item.type === "recording") && (
          <Field label="Link">
            <input value={item.link} onChange={(e) => setItem({ ...item, link: e.target.value })} style={inputStyle} placeholder="Paste link" />
          </Field>
        )}

        {(item.type === "material" || item.type === "assignment") && (
          <Field label="Upload File / PDF">
            <input type="file" onChange={(e) => onUploadFile(e.target.files?.[0])} style={inputStyle} />
          </Field>
        )}

        {item.fileName && <p style={noteText}>Attached: {item.fileName}</p>}

        {item.type === "assignment" && (
          <Field label="Due Date">
            <input type="date" value={item.dueDate} onChange={(e) => setItem({ ...item, dueDate: e.target.value })} style={inputStyle} />
          </Field>
        )}

        <div style={modalActions}>
          <button onClick={onSave} style={createButton}>Save</button>
          <button onClick={onClose} style={smallButton}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function PeopleTab({ instructorName, students }: { instructorName: string; students: Enrollment[] }) {
  return (
    <section style={peopleArea}>
      <div style={peopleSection}>
        <h2>Instructor(s)</h2>
        <div style={personRow}>
          <span style={avatarCircle}>{instructorName.slice(0, 1)}</span>
          <strong>{instructorName}</strong>
        </div>
      </div>

      <div style={peopleSection}>
        <div style={peopleHeader}>
          <h2>Students</h2>
          <span>{students.length} student(s)</span>
        </div>

        {students.length === 0 ? (
          <p style={noteText}>No students enrolled yet.</p>
        ) : (
          students.map((student) => (
            <div key={student.id} style={personRow}>
              <span style={avatarCircle}>{student.name.slice(0, 1)}</span>
              <div>
                <strong>{student.name}</strong>
                <p style={personMeta}>{student.email} · {student.phone}</p>
              </div>
              <span style={studentStatus}>{student.status}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function GradesTab({
  submissions,
  students,
  assignments,
}: {
  submissions: AssignmentSubmission[];
  students: Enrollment[];
  assignments: ClassworkItem[];
}) {
  return (
    <section style={gradesArea}>
      <div style={peopleHeader}>
        <h2>Grades / To Review</h2>
        <span>{submissions.length} submission(s) from {students.length} student(s)</span>
      </div>

      {assignments.length === 0 ? (
        <p style={noteText}>No assignments created yet.</p>
      ) : (
        assignments.map((assignment) => (
          <div key={assignment.id} style={assignmentGradeBlock}>
            <h3>{assignment.title}</h3>
            <p style={noteText}>
              {submissions.filter((item) => item.itemId === assignment.id).length} submission(s)
            </p>

            {submissions
              .filter((item) => item.itemId === assignment.id)
              .map((submission) => (
                <div key={submission.id} style={submissionCard}>
                  <strong>{submission.email}</strong>
                  <span>{submission.submittedAt}</span>
                  {submission.response && <p>{submission.response}</p>}
                  {submission.fileData && (
                    <a href={submission.fileData} download={submission.fileName || "assignment-file"} style={smallLink}>
                      Download Submission File
                    </a>
                  )}
                </div>
              ))}
          </div>
        ))
      )}
    </section>
  );
}

function AnalyticsTab({ students, submissions, attendance }: { students: Enrollment[]; submissions: AssignmentSubmission[]; attendance: AttendanceRecord[] }) {
  const submissionPercent = students.length === 0 ? 0 : Math.round((submissions.length / students.length) * 100);
  const attendancePercent = students.length === 0 ? 0 : Math.round((attendance.length / students.length) * 100);

  return (
    <section style={analyticsArea}>
      <h2>Class Analytics</h2>
      <div style={analyticsGrid}>
        <Metric label="Students" value={students.length} />
        <Metric label="Submissions" value={submissions.length} />
        <Metric label="Submission %" value={`${submissionPercent}%`} />
        <Metric label="Attendance %" value={`${attendancePercent}%`} />
      </div>
    </section>
  );
}

function PostCard({ icon, title, subtitle, onEdit }: { icon: string; title: string; subtitle: string; onEdit: () => void }) {
  return (
    <article style={postCard}>
      <span style={postIcon}>{icon}</span>
      <div>
        <strong>{title}</strong>
        <p>{subtitle}</p>
      </div>
      <button onClick={onEdit} style={moreButton}>⋮</button>
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div style={infoBox}>
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

const page: CSSProperties = { display: "grid", gridTemplateColumns: "300px 1fr", minHeight: "calc(100vh - 90px)", background: "#FFFFFF" };
const sideBar: CSSProperties = { background: "#F7F9FC", borderRight: "1px solid #E0E3E7", padding: "22px 16px", display: "grid", alignContent: "start", gap: "8px", minHeight: "calc(100vh - 90px)" };
const sideNavItem: CSSProperties = { background: "transparent", border: "none", color: "#3C4043", padding: "14px 16px", borderRadius: "999px", textAlign: "left", cursor: "pointer", fontSize: "16px", fontWeight: 700 };
const activeSideNavItem: CSSProperties = { ...sideNavItem, background: "#D7EEFF", color: "#174EA6" };
const instructorInfoBox: CSSProperties = { background: "#FFFFFF", border: "1px solid #DADCE0", borderRadius: "14px", padding: "14px", margin: "0 0 14px", display: "grid", gap: "4px", color: "#3C4043", textAlign: "center" };
const instructorInfoLabel: CSSProperties = { color: "#5F6368", fontSize: "12px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.8px" };
const instructorInfoEmail: CSSProperties = { color: "#5F6368", fontSize: "12px", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
const sideSectionTitle: CSSProperties = { color: "#3C4043", fontSize: "16px", fontWeight: 900, marginTop: "24px", marginBottom: "8px", paddingLeft: "16px" };
const courseListSpacer: CSSProperties = { height: "14px" };
const miniCourseButton: CSSProperties = { background: "transparent", border: "none", borderRadius: "999px", padding: "10px 12px", textAlign: "left", display: "grid", gridTemplateColumns: "36px 1fr", gap: "10px", alignItems: "center", cursor: "pointer", color: "#3C4043", fontWeight: 700 };
const selectedMiniCourseButton: CSSProperties = { background: "#D7EEFF", color: "#174EA6" };
const courseInitial: CSSProperties = { width: "32px", height: "32px", borderRadius: "50%", background: "#C2E7FF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 };
const sideQuickLinks: CSSProperties = { borderTop: "1px solid #DADCE0", marginTop: "18px", paddingTop: "8px" };
const meetingBox: CSSProperties = { background: "#FFFFFF", border: "1px solid #DADCE0", borderRadius: "12px", padding: "12px", display: "grid", marginBottom: "12px" };
const googleMeetButton: CSSProperties = { background: "#0F9D58", color: "#FFFFFF", border: "none", borderRadius: "999px", padding: "11px 18px", cursor: "pointer", fontWeight: 900, textDecoration: "none", display: "inline-flex", justifyContent: "center", alignItems: "center", width: "100%", boxSizing: "border-box" };
const googleMeetButtonDisabled: CSSProperties = { ...googleMeetButton, background: "#D8E8DE", color: "#789384", cursor: "not-allowed" };
const sideNoteText: CSSProperties = { color: "#5F6368", fontSize: "12px", lineHeight: "1.4", margin: "5px 0 0" };
const scheduleList: CSSProperties = { display: "grid", gap: "8px", marginTop: "12px" };
const scheduleItem: CSSProperties = { background: "#FFFFFF", border: "1px solid #DADCE0", borderRadius: "10px", padding: "10px 34px 10px 10px", display: "grid", gap: "3px", fontSize: "13px", position: "relative", minHeight: "38px", alignContent: "center" };
const scheduleLine: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", whiteSpace: "nowrap" };
const scheduleNote: CSSProperties = { color: "#5F6368", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
const miniDeleteButton: CSSProperties = { position: "absolute", top: "6px", right: "7px", background: "#FCE8E6", color: "#A50E0E", border: "1px solid #F4C7C3", borderRadius: "50%", width: "22px", height: "22px", lineHeight: "18px", cursor: "pointer", fontWeight: 900, padding: 0, fontSize: "16px" };
const compactInput: CSSProperties = { width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: "8px", border: "1px solid #DADCE0", fontSize: "13px", background: "#FFFFFF" };
const sideSaveButton: CSSProperties = { background: "#1A73E8", color: "#FFFFFF", border: "none", borderRadius: "999px", padding: "10px 14px", cursor: "pointer", fontWeight: 900, width: "100%" };
const mainArea: CSSProperties = { minWidth: 0, background: "#FFFFFF" };
const topBar: CSSProperties = { height: "76px", borderBottom: "1px solid #E0E3E7", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", background: "#FFFFFF", position: "sticky", top: "86px", zIndex: 8 };
const topTitle: CSSProperties = { color: "#3C4043", fontSize: "28px", fontWeight: 900 };
const homeHeader: CSSProperties = { padding: "42px 44px 18px", display: "flex", justifyContent: "center", textAlign: "center" };
const eyebrow: CSSProperties = { color: "#5F6368", fontSize: "13px", fontWeight: 900, letterSpacing: "1.4px", marginBottom: "10px" };
const homeTitle: CSSProperties = { color: "#202124", fontSize: "42px", margin: 0 };
const logoutButton: CSSProperties = { background: "#FCE8E6", color: "#A50E0E", border: "1px solid #F4C7C3", borderRadius: "999px", padding: "11px 18px", cursor: "pointer", fontWeight: 900 };
const courseGrid: CSSProperties = { padding: "18px 44px 70px", display: "grid", gridTemplateColumns: "repeat(3, minmax(230px, 1fr))", gap: "20px", alignItems: "stretch" };
const classCard: CSSProperties = { background: "#FFFFFF", border: "1px solid #DADCE0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 2px rgba(60,64,67,.15)", display: "grid", gridTemplateRows: "96px 54px auto" };
const classCardBanner: CSSProperties = { minHeight: "96px", height: "96px", backgroundSize: "cover", backgroundPosition: "center", color: "#FFFFFF", padding: "14px 16px", display: "grid", alignContent: "center", boxSizing: "border-box" };
const classCardTitle: CSSProperties = { color: "#FFFFFF", fontSize: "21px", lineHeight: "1.15", margin: 0, textShadow: "0 2px 8px rgba(0,0,0,.45)" };
const classCardSubtitle: CSSProperties = { color: "#FFFFFF", fontSize: "14px", margin: "5px 0 0", textShadow: "0 2px 8px rgba(0,0,0,.45)" };
const classCardBody: CSSProperties = { minHeight: "54px", display: "flex", justifyContent: "center", alignItems: "center", padding: "10px 14px" };
const classCardFooter: CSSProperties = { borderTop: "1px solid #DADCE0", padding: "11px 14px", display: "flex", justifyContent: "center" };
const enrolledLine: CSSProperties = { color: "#3C4043", fontSize: "17px", fontWeight: 900, whiteSpace: "nowrap" };
const openClassButton: CSSProperties = { background: "#1A73E8", color: "#FFFFFF", border: "none", borderRadius: "999px", padding: "9px 14px", cursor: "pointer", fontWeight: 900 };
const emptyCard: CSSProperties = { background: "#FFFFFF", border: "1px solid #DADCE0", borderRadius: "14px", padding: "32px", color: "#3C4043" };
const utilityPage: CSSProperties = { padding: "30px 44px 70px" };
const calendarHeader: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "18px", marginBottom: "16px" };
const calendarTitle: CSSProperties = { color: "#202124", fontSize: "32px", margin: "0 0 4px" };
const calendarSubText: CSSProperties = { color: "#5F6368", fontSize: "15px", margin: 0 };
const calendarMonthControls: CSSProperties = { display: "flex", alignItems: "center", gap: "10px", background: "#FFFFFF", border: "1px solid #DADCE0", borderRadius: "999px", padding: "8px 12px", color: "#202124" };
const calendarNavButton: CSSProperties = { width: "30px", height: "30px", borderRadius: "50%", border: "1px solid #DADCE0", background: "#F8FAFD", cursor: "pointer", fontSize: "20px", fontWeight: 900, lineHeight: 1 };
const calendarLegend: CSSProperties = { display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "14px" };
const calendarLegendItem: CSSProperties = { display: "inline-flex", alignItems: "center", gap: "7px", border: "1px solid #DADCE0", background: "#FFFFFF", borderRadius: "999px", padding: "7px 11px", cursor: "pointer", fontWeight: 800, color: "#3C4043" };
const calendarColorDot: CSSProperties = { width: "10px", height: "10px", borderRadius: "50%", display: "inline-block" };
const monthGrid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(7, minmax(96px, 1fr))", gap: "8px" };
const weekdayCell: CSSProperties = { color: "#5F6368", fontSize: "13px", fontWeight: 900, textAlign: "center", padding: "8px 4px" };
const blankDayCell: CSSProperties = { minHeight: "104px", borderRadius: "12px", background: "transparent" };
const dayCell: CSSProperties = { minHeight: "104px", border: "1px solid #E8EAED", background: "#FFFFFF", borderRadius: "12px", padding: "8px", display: "grid", alignContent: "start", gap: "6px" };
const activeDayCell: CSSProperties = { ...dayCell, background: "#F8FAFD", border: "1px solid #C2E7FF" };
const dayNumber: CSSProperties = { color: "#3C4043", fontSize: "13px", fontWeight: 900 };
const dayEventList: CSSProperties = { display: "grid", gap: "5px" };
const calendarEvent: CSSProperties = { background: "#FFFFFF", border: "1px solid #DADCE0", borderRadius: "8px", padding: "5px 6px", display: "grid", gap: "2px", textAlign: "left", color: "#3C4043", fontSize: "11px", cursor: "pointer", overflow: "hidden" };
const calendarEmptyNote: CSSProperties = { marginTop: "14px", background: "#FFFFFF", border: "1px solid #DADCE0", borderRadius: "12px", padding: "14px", color: "#5F6368", fontWeight: 800 };
const tabBar: CSSProperties = { height: "64px", display: "flex", alignItems: "end", gap: "20px", borderBottom: "1px solid #DADCE0", padding: "0 44px", background: "#FFFFFF", position: "sticky", top: "162px", zIndex: 7 };
const tabButton: CSSProperties = { background: "transparent", border: "none", borderBottom: "4px solid transparent", padding: "0 4px 16px", cursor: "pointer", color: "#3C4043", fontSize: "16px", fontWeight: 900 };
const activeTabButton: CSSProperties = { ...tabButton, color: "#1A73E8", borderBottom: "4px solid #1A73E8" };
const classWorkspace: CSSProperties = { padding: "20px 44px 80px" };
const classBanner: CSSProperties = { minHeight: "112px", borderRadius: "12px", backgroundSize: "cover", backgroundPosition: "center", color: "#FFFFFF", padding: "16px 22px", marginBottom: "18px", display: "grid", alignContent: "center", boxSizing: "border-box" };
const classBannerTitle: CSSProperties = { color: "#FFFFFF", fontSize: "34px", lineHeight: "1.1", margin: 0, textShadow: "0 3px 12px rgba(0,0,0,.45)" };
const classBannerSubtitle: CSSProperties = { color: "#FFFFFF", fontSize: "17px", lineHeight: "1.2", margin: "5px 0 0", textShadow: "0 2px 8px rgba(0,0,0,.35)" };
const streamPosts: CSSProperties = { display: "grid", gap: "16px" };
const announcementBox: CSSProperties = { background: "#E8F0FE", borderRadius: "999px", padding: "16px 22px", color: "#174EA6" };
const postCard: CSSProperties = { background: "#F1F3F4", borderRadius: "14px", padding: "18px", display: "grid", gridTemplateColumns: "48px 1fr 32px", gap: "14px", alignItems: "start" };
const postIcon: CSSProperties = { width: "42px", height: "42px", borderRadius: "50%", background: "#C2E7FF", color: "#174EA6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 };
const moreButton: CSSProperties = { background: "transparent", border: "none", cursor: "pointer", fontSize: "22px" };
const classworkArea: CSSProperties = { display: "grid", gap: "28px" };
const createBar: CSSProperties = { display: "flex", gap: "18px", alignItems: "flex-start" };
const createWrap: CSSProperties = { position: "relative" };
const createButton: CSSProperties = { background: "#1A73E8", color: "#FFFFFF", border: "none", borderRadius: "999px", padding: "13px 24px", cursor: "pointer", fontWeight: 900, fontSize: "16px", boxShadow: "0 2px 6px rgba(26,115,232,0.3)" };
const createMenu: CSSProperties = { position: "absolute", top: "54px", left: 0, background: "#FFFFFF", border: "1px solid #DADCE0", borderRadius: "12px", boxShadow: "0 8px 28px rgba(60,64,67,.25)", minWidth: "260px", padding: "8px", zIndex: 5 };
const createMenuItem: CSSProperties = { display: "block", width: "100%", background: "#FFFFFF", border: "none", textAlign: "left", padding: "14px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: 800, color: "#3C4043" };
const topicFilter: CSSProperties = { width: "320px", border: "1px solid #DADCE0", borderRadius: "8px", padding: "13px 14px", fontSize: "16px" };
const topicBlock: CSSProperties = { borderTop: "1px solid #DADCE0", paddingTop: "24px" };
const classworkItem: CSSProperties = { display: "grid", gridTemplateColumns: "46px 1fr", gap: "16px", borderBottom: "1px solid #DADCE0", padding: "18px 0" };
const classworkItemHeader: CSSProperties = { display: "flex", justifyContent: "space-between", gap: "16px" };
const materialIcon: CSSProperties = { width: "36px", height: "36px", borderRadius: "50%", background: "#C2E7FF", color: "#174EA6", display: "flex", alignItems: "center", justifyContent: "center" };
const smallActionRow: CSSProperties = { display: "flex", gap: "8px", alignItems: "start" };
const smallButton: CSSProperties = { background: "#FFFFFF", color: "#1A73E8", border: "1px solid #DADCE0", borderRadius: "8px", padding: "8px 10px", cursor: "pointer", fontWeight: 900 };
const deleteButton: CSSProperties = { ...smallButton, color: "#A50E0E", background: "#FCE8E6" };
const peopleArea: CSSProperties = { maxWidth: "900px" };
const peopleSection: CSSProperties = { borderBottom: "1px solid #DADCE0", padding: "20px 0" };
const peopleHeader: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center" };
const personRow: CSSProperties = { display: "grid", gridTemplateColumns: "42px 1fr auto", gap: "14px", alignItems: "center", padding: "13px 0", borderTop: "1px solid #F1F3F4" };
const avatarCircle: CSSProperties = { width: "38px", height: "38px", borderRadius: "50%", background: "#C2E7FF", color: "#174EA6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 };
const personMeta: CSSProperties = { color: "#5F6368", margin: "4px 0 0" };
const studentStatus: CSSProperties = { background: "#E6F4EA", color: "#137333", borderRadius: "999px", padding: "6px 10px", fontWeight: 900, fontSize: "12px" };
const gradesArea: CSSProperties = { maxWidth: "980px" };
const assignmentGradeBlock: CSSProperties = { border: "1px solid #DADCE0", borderRadius: "14px", padding: "18px", marginBottom: "16px" };
const submissionCard: CSSProperties = { border: "1px solid #DADCE0", borderRadius: "12px", padding: "16px", display: "grid", gap: "8px", marginTop: "12px" };
const analyticsArea: CSSProperties = { maxWidth: "900px" };
const analyticsGrid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" };
const metricCard: CSSProperties = { background: "#F8FAFD", border: "1px solid #DADCE0", borderRadius: "14px", padding: "22px", display: "grid", gap: "8px", textAlign: "center" };
const fieldBlock: CSSProperties = { display: "grid", gap: "7px", color: "#3C4043", fontSize: "14px", fontWeight: 800, marginBottom: "14px" };
const inputStyle: CSSProperties = { width: "100%", boxSizing: "border-box", padding: "12px 13px", borderRadius: "8px", border: "1px solid #DADCE0", fontSize: "15px", outline: "none", background: "#FFFFFF" };
const textareaStyle: CSSProperties = { ...inputStyle, minHeight: "88px", resize: "vertical" };
const infoBox: CSSProperties = { background: "#F8FAFD", border: "1px solid #DADCE0", borderRadius: "10px", padding: "10px", display: "grid", gap: "4px" };
const noteText: CSSProperties = { color: "#5F6368", fontWeight: 800 };
const smallLink: CSSProperties = { color: "#1A73E8", fontWeight: 900, display: "inline-block", marginRight: "12px" };
const modalBackdrop: CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "28px", zIndex: 50 };
const modalCard: CSSProperties = { background: "#FFFFFF", borderRadius: "18px", padding: "28px", width: "min(760px, 96vw)", maxHeight: "88vh", overflow: "auto", boxShadow: "0 20px 70px rgba(0,0,0,.25)", position: "relative" };
const closeButton: CSSProperties = { position: "absolute", right: "16px", top: "14px", border: "1px solid #DADCE0", background: "#FFFFFF", borderRadius: "50%", width: "36px", height: "36px", cursor: "pointer", fontSize: "22px" };
const modalTitle: CSSProperties = { color: "#202124", margin: "0 0 20px" };
const modalActions: CSSProperties = { display: "flex", gap: "12px", marginTop: "18px" };
