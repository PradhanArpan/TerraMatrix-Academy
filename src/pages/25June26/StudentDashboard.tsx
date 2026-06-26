import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
    title: course.title || "Untitled Course",
    shortTitle: course.shortTitle || "",
    category: course.category || "Industry-Oriented Training",
    duration: course.duration || "To be updated",
    level: course.level || "Open",
    mode: course.mode || "Offline",
    imageUrl: course.imageUrl || "/hero-dam.jpg",
    instructorName: course.instructorName || "TerraMatrix Faculty",
    instructorDesignation: course.instructorDesignation || "Course Instructor",
    instructorIds: Array.isArray(course.instructorIds) ? course.instructorIds : [],
    startDate: course.startDate || "To be announced",
    fee: course.fee || "To be announced",
    certificate: normalizeCertification(course.certificate || ""),
    description: course.description || "Course description will be updated soon.",
    outcomes: course.outcomes || "Learning outcomes will be updated soon.",
    brochureName: course.brochureName || "",
    brochureData: course.brochureData || "",
    status: course.status === "Draft" ? "Draft" : "Published",
    onlineSessionLink: course.onlineSessionLink || "",
    onlineSessionDate: course.onlineSessionDate || "",
    onlineSessionTime: course.onlineSessionTime || "",
    recordingLink: course.recordingLink || "",
    materialTitle: course.materialTitle || "",
    materialDescription: course.materialDescription || "",
    materialFileName: course.materialFileName || "",
    materialFileData: course.materialFileData || "",
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
    photoUrl: instructor.photoUrl || "/hero-dam.jpg",
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

function formatFee(value: string) {
  if (!value) return "To be announced";
  if (value.toLowerCase().includes("free") || value.toLowerCase().includes("tba")) return value;
  return value.replace(/^₹\s*/, "");
}

export default function StudentDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const savedCourses = localStorage.getItem("terramatrix_courses");
    const savedInstructors = localStorage.getItem("terramatrix_instructors");

    if (savedCourses) {
      try {
        const allCourses: Course[] = JSON.parse(savedCourses).map(
          (course: Partial<Course>) => normalizeCourse(course)
        );
        setCourses(allCourses.filter((course) => course.status === "Published"));
      } catch {
        setCourses([]);
      }
    }

    if (savedInstructors) {
      try {
        setInstructors(
          JSON.parse(savedInstructors).map((instructor: Partial<Instructor>) =>
            normalizeInstructor(instructor)
          )
        );
      } catch {
        setInstructors([]);
      }
    }
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(courses.map((course) => course.category || "Industry-Oriented Training"))
    );
    return ["All", ...unique];
  }, [courses]);

  const getCourseInstructors = (course: Course) => {
    const linked = instructors.filter((instructor) =>
      course.instructorIds.includes(instructor.id)
    );

    if (linked.length > 0) return linked;

    return [
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
      },
    ];
  };

  const filteredCourses = courses.filter((course) => {
    const search = searchText.toLowerCase();
    const instructorNames = getCourseInstructors(course)
      .map((instructor) => instructor.name)
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      course.title.toLowerCase().includes(search) ||
      course.shortTitle.toLowerCase().includes(search) ||
      course.description.toLowerCase().includes(search) ||
      course.category.toLowerCase().includes(search) ||
      instructorNames.includes(search);

    const matchesCategory =
      selectedCategory === "All" || course.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <main>
      <section style={heroSection}>
        <div>
          <h1 style={pageTitle}>Course Catalogue</h1>
        </div>

        <div style={summaryPanel}>
          <SummaryBox label="Available" value={courses.length} />
        </div>
      </section>

      <section style={toolbar}>
        <input
          type="text"
          placeholder="Search by course, category or instructor..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={searchInput}
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={selectInput}
        >
          {categories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
      </section>

      <section style={courseSection}>
        {courses.length === 0 ? (
          <div style={emptyState}>
            <h2>No published courses yet</h2>
            <p>
              Create a course from the Admin panel and publish it. Published
              courses will appear here automatically.
            </p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div style={emptyState}>
            <h2>No matching courses found</h2>
            <p>Try a different search term or select another learning area.</p>
          </div>
        ) : (
          <div style={courseGrid}>
            {filteredCourses.map((course) => {
              const linkedInstructors = getCourseInstructors(course);

              return (
                <article key={course.id} style={courseCard}>
                  <div
                    style={{
                      ...courseImage,
                      backgroundImage: `linear-gradient(rgba(23,63,53,0.08), rgba(23,63,53,0.08)), url('${course.imageUrl}')`,
                    }}
                  />

                  <div style={courseBody}>
                    <div style={courseTop}>
                      <div style={badgeRow}>
                        <span style={categoryBadge}>{course.category}</span>
                        <span style={levelBadge}>{course.level}</span>
                      </div>

                      <Link to={`/courses/${course.id}`} style={registerButton}>
                        Register
                      </Link>
                    </div>

                    <h2 style={courseTitle}>{course.title}</h2>
                    <p style={courseDescription}>{course.description}</p>

                    <div style={instructorBox}>
                      <span style={smallLabel}>Instructor(s)</span>
                      {linkedInstructors.map((instructor) => (
                        <div key={instructor.id} style={instructorLine}>
                          <strong>{instructor.name}</strong>
                          <small style={instructorMeta}>
                            {instructor.designation}, {instructor.company}
                          </small>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={courseMeta}>
                    <Info label="Duration (in hrs.)" value={course.duration} />
                    <Info label="Mode" value={course.mode} />
                    <Info label="Start Date" value={formatDisplayDate(course.startDate)} />
                    <Info label="Fee (in Rs.)" value={formatFee(course.fee)} />
                    <Info label="Certification" value={normalizeCertification(course.certificate)} />
                    <Link to={`/courses/${course.id}`} style={viewButton}>
                      View Course
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function SummaryBox({ label, value }: { label: string; value: number }) {
  return (
    <div style={summaryBox}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
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

const heroSection: CSSProperties = {
  maxWidth: "1220px",
  margin: "0 auto",
  padding: "46px 48px 24px",
  display: "grid",
  gridTemplateColumns: "1fr 160px",
  gap: "28px",
  alignItems: "center",
};

const eyebrow: CSSProperties = {
  color: "#8A661E",
  fontSize: "14px",
  fontWeight: 800,
  letterSpacing: "1.6px",
  marginBottom: "14px",
};

const pageTitle: CSSProperties = {
  color: "#8A661E",
  fontSize: "46px",
  lineHeight: "1.12",
  margin: 0,
};

const pageText: CSSProperties = {
  color: "#53665E",
  fontSize: "18px",
  lineHeight: "1.75",
  maxWidth: "760px",
  margin: 0,
};

const summaryPanel: CSSProperties = {
  background: "#DDE9E2",
  border: "1px solid #C9DDD3",
  borderRadius: "14px",
  padding: "10px 16px",
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "3px",
  minHeight: "72px",
  alignContent: "center",
};

const summaryBox: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "2px",
  textAlign: "center",
  color: "#173F35",
  fontWeight: 850,
};

const toolbar: CSSProperties = {
  maxWidth: "1220px",
  margin: "0 auto",
  padding: "16px 48px 22px",
  display: "grid",
  gridTemplateColumns: "1fr 260px",
  gap: "16px",
};

const searchInput: CSSProperties = {
  padding: "15px 18px",
  borderRadius: "12px",
  border: "1px solid #D8D2C3",
  fontSize: "16px",
  outline: "none",
  background: "#FFFFFF",
};

const selectInput: CSSProperties = {
  ...searchInput,
};

const courseSection: CSSProperties = {
  maxWidth: "1220px",
  margin: "0 auto",
  padding: "0 48px 80px",
};

const courseGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "12px",
};

const courseCard: CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E8E1D2",
  borderRadius: "14px",
  overflow: "hidden",
  boxShadow: "0 8px 20px rgba(23,63,53,0.045)",
  display: "grid",
  gridTemplateColumns: "180px 1fr",
  textAlign: "left",
};

const courseImage: CSSProperties = {
  gridColumn: "1",
  gridRow: "1",
  height: "100%",
  minHeight: "190px",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundColor: "#DDE9E2",
};

const courseBody: CSSProperties = {
  gridColumn: "2",
  gridRow: "1",
  padding: "12px 14px 8px",
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const courseTop: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "10px",
  marginBottom: "2px",
};

const badgeRow: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
  alignItems: "center",
};

const categoryBadge: CSSProperties = {
  background: "#F0E6CF",
  color: "#173F35",
  padding: "5px 9px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 800,
};

const levelBadge: CSSProperties = {
  background: "#EAF3EE",
  color: "#35584D",
  padding: "5px 9px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 800,
};

const courseTitle: CSSProperties = {
  color: "#173F35",
  fontSize: "21px",
  lineHeight: "1.2",
  margin: 0,
};

const courseDescription: CSSProperties = {
  color: "#53665E",
  fontSize: "14px",
  lineHeight: "1.35",
  margin: 0,
  textAlign: "justify",
};

const instructorActionRow: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "10px",
  alignItems: "stretch",
};

const instructorBox: CSSProperties = {
  background: "#FBFAF6",
  padding: "6px 10px",
  borderRadius: "9px",
  border: "1px solid #E8E1D2",
  display: "grid",
  gap: "0px",
};

const smallLabel: CSSProperties = {
  color: "#7A5A22",
  fontSize: "10px",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.7px",
  marginBottom: "2px",
};

const instructorLine: CSSProperties = {
  display: "flex",
  gap: "5px",
  alignItems: "baseline",
  flexWrap: "wrap",
  color: "#173F35",
  lineHeight: "1.18",
  margin: 0,
};

const instructorMeta: CSSProperties = {
  color: "#53665E",
  fontSize: "12.5px",
  lineHeight: "1.18",
};

const courseMeta: CSSProperties = {
  gridColumn: "1 / -1",
  gridRow: "2",
  display: "grid",
  gridTemplateColumns: "repeat(6, minmax(105px, 1fr))",
  gap: "7px",
  alignItems: "stretch",
  padding: "8px 10px 10px",
  borderTop: "1px solid #EFE8DA",
};

const infoBox: CSSProperties = {
  background: "#FBFAF6",
  border: "1px solid #E8E1D2",
  borderRadius: "8px",
  padding: "4px 9px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: "1px",
  fontSize: "12px",
  lineHeight: "1.15",
  minHeight: "38px",
};

const registerButton: CSSProperties = {
  background: "#173F35",
  color: "#FFFFFF",
  border: "none",
  padding: "8px 18px",
  borderRadius: "10px",
  fontWeight: 900,
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  fontSize: "14px",
  whiteSpace: "nowrap",
};

const viewButton: CSSProperties = {
  background: "#DEB552",
  color: "#173F35",
  border: "1px solid #C9A244",
  padding: "6px 12px",
  borderRadius: "8px",
  fontWeight: 900,
  cursor: "pointer",
  alignSelf: "stretch",
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  fontSize: "13px",
  minHeight: "38px",
};

const emptyState: CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E8E1D2",
  borderRadius: "22px",
  padding: "48px",
  textAlign: "center",
  boxShadow: "0 14px 36px rgba(23,63,53,0.07)",
};
