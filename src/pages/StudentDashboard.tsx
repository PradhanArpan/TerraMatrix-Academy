import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  MonitorPlay,
  Search,
  SlidersHorizontal,
  UsersRound,
} from "lucide-react";
import { Badge, EmptyState, Metric, PageIntro } from "../components/Ui";
import {
  deriveShortTitle,
  formatDate,
  formatFee,
  getCourseInstructors,
  loadCourses,
  loadInstructors,
  type Course,
  type Instructor,
} from "../lib/catalogData";

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

export default function StudentDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [mode, setMode] = useState("All");

  useEffect(() => {
    setCourses(loadCourses());
    setInstructors(loadInstructors());
  }, []);

  const categories = useMemo(() => ["All", ...unique(courses.map((course) => course.category))], [courses]);
  const levels = useMemo(() => ["All", ...unique(courses.map((course) => course.level))], [courses]);
  const modes = useMemo(() => ["All", ...unique(courses.map((course) => course.mode))], [courses]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return courses.filter((course) => {
      const faculty = getCourseInstructors(course, instructors).map((item) => item.name).join(" ");
      const haystack = [course.title, course.shortTitle, course.category, course.theme, course.description, course.level, course.mode, faculty].join(" ").toLowerCase();
      return (!query || haystack.includes(query)) && (category === "All" || course.category === category) && (level === "All" || course.level === level) && (mode === "All" || course.mode === mode);
    });
  }, [courses, instructors, search, category, level, mode]);

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setLevel("All");
    setMode("All");
  };

  return (
    <main>
      <PageIntro
        eyebrow="Learning catalogue"
        title="Find the capability you need next."
        description="Explore focused engineering courses and professional programmes by learning area, format, level and instructor. Each pathway is designed around practical competence and measurable outcomes."
        aside={<Metric value={courses.length} label="Published programmes" helper="Shared live catalogue" />}
      />

      <section className="tm3-filter-shell" aria-label="Course filters">
        <label className="tm3-search-field">
          <Search size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search programmes, tools, topics or faculty" />
        </label>
        <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category">
          {categories.map((item) => <option key={item}>{item === "All" ? "All learning areas" : item}</option>)}
        </select>
        <select value={level} onChange={(event) => setLevel(event.target.value)} aria-label="Filter by level">
          {levels.map((item) => <option key={item}>{item === "All" ? "All levels" : item}</option>)}
        </select>
        <select value={mode} onChange={(event) => setMode(event.target.value)} aria-label="Filter by mode">
          {modes.map((item) => <option key={item}>{item === "All" ? "All formats" : item}</option>)}
        </select>
      </section>

      <section className="tm3-catalogue">
        {courses.length === 0 ? (
          <EmptyState
            icon="book"
            title="The programme catalogue is ready for publishing"
            description="No courses have been published to the shared database yet. When the academy publishes its first programme, it will appear here immediately on desktop, tablet and mobile."
          />
        ) : filtered.length === 0 ? (
          <div>
            <EmptyState
              icon="search"
              title="No programmes match these filters"
              description="Try a broader search or reset the category, level and format filters."
            />
            <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
              <button className="tm3-button tm3-button--outline" type="button" onClick={clearFilters}><SlidersHorizontal size={17} /> Reset filters</button>
            </div>
          </div>
        ) : (
          <div className="tm3-catalogue-grid">
            {filtered.map((course) => {
              const faculty = getCourseInstructors(course, instructors);
              return (
                <article className="tm3-programme-card" key={course.id}>
                  <div className="tm3-programme-card__image" style={{ backgroundImage: `url('${course.imageUrl}')` }}>
                    <span className="tm3-programme-card__badge"><Badge tone="gold">{course.category}</Badge></span>
                  </div>
                  <div className="tm3-programme-card__body">
                    <div className="tm3-badge-row">
                      <Badge tone="green">{course.level}</Badge>
                      <Badge>{course.mode}</Badge>
                      {course.theme && <Badge>{course.theme}</Badge>}
                    </div>
                    <h3>{deriveShortTitle(course)}</h3>
                    <p>{course.description}</p>
                    <div className="tm3-programme-card__meta">
                      <span><Clock3 size={14} /> {course.duration} hrs</span>
                      <span><CalendarDays size={14} /> {formatDate(course.startDate)}</span>
                      <span><UsersRound size={14} /> {faculty[0]?.name}</span>
                      <span><MonitorPlay size={14} /> {course.mode}</span>
                    </div>
                    <div className="tm3-programme-card__footer">
                      <strong>{formatFee(course.fee)}</strong>
                      <Link className="tm3-button tm3-button--ghost" to={`/courses/${course.id}`}>View programme <ArrowRight size={16} /></Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="tm3-cta" style={{ marginTop: 0 }}>
        <div>
          <div className="tm3-eyebrow tm3-eyebrow--light">Institutional learning</div>
          <h2>Need a customised programme for your cohort or organisation?</h2>
          <p>TerraMatrix can structure focused training around your engineering domain, software stack, field context or professional development goals.</p>
        </div>
        <div className="tm3-cta__actions"><Link className="tm3-button tm3-button--lime" to="/">Discuss a programme <ArrowRight size={17} /></Link></div>
      </section>
    </main>
  );
}
