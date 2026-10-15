import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Boxes,
  BrainCircuit,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Cpu,
  Database,
  FileCode,
  FlaskConical,
  GraduationCap,
  Layers,
  Map,
  Navigation,
  Network,
  Satellite,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Waves,
  X,
} from "lucide-react";
import heroImage from "../assets/hero-academy-cover.jpg";
import { submitPublicEnquiry } from "../lib/appsScriptApi";
import { Badge, EmptyState, Eyebrow, SectionHeading } from "../components/Ui";
import {
  deriveShortTitle,
  formatDate,
  formatFee,
  getCourseInstructors,
  loadCourses,
  loadEvents,
  loadInstructors,
  type Course,
  type Instructor,
} from "../lib/catalogData";

type EnquiryForm = {
  name: string;
  email: string;
  phone: string;
  organisation: string;
  topic: string;
  message: string;
};

const emptyForm: EnquiryForm = {
  name: "",
  email: "",
  phone: "",
  organisation: "",
  topic: "General enquiry",
  message: "",
};

const pillars = [
  { title: "Learn", description: "Structured courses, live classes and intelligent learning resources.", icon: BookOpen, to: "/student" },
  { title: "Practice", description: "Simulations, tools, cases and applied engineering challenges.", icon: FlaskConical, to: "/student" },
  { title: "Research", description: "Research methods, data workflows and publication support.", icon: SearchCheck, to: "/learning-videos" },
  { title: "Collaborate", description: "Instructor communities, industry mentors and project networks.", icon: Network, to: "/instructors" },
  { title: "Certify", description: "Verified evidence of learning, competence and professional growth.", icon: BadgeCheck, to: "/student-login" },
];

const domains = [
  {
    title: "Civil & Infrastructure",
    description: "Water resources, bridge & structural engineering, BIM detailing and hydraulic modeling.",
    image: "/domain-civil.jpg",
    icon: Building2,
    tools: ["AutoCAD", "Revit & BIM", "SAP2000", "HEC-RAS"],
    to: "/student?category=Engineering%20Tools",
    badge: "Core Engineering",
  },
  {
    title: "Geospatial Intelligence",
    description: "GIS, multispectral satellite remote sensing, terrain modeling and spatial decision systems.",
    image: "/domain-geospatial.jpg",
    icon: Map,
    tools: ["QGIS", "ArcGIS Pro", "GEE", "Remote Sensing"],
    to: "/student?category=Geospatial%20Tools",
    badge: "Spatial Analytics",
  },
  {
    title: "Computational Engineering",
    description: "Applied Python, finite element modeling, numerical methods and engineering data analytics.",
    image: "/domain-computational.jpg",
    icon: Cpu,
    tools: ["Python", "NumPy & SciPy", "FEA Solvers", "Data Science"],
    to: "/student?category=Computational%20Tools",
    badge: "Scientific Computing",
  },
  {
    title: "AI for Engineers",
    description: "Digital twins, infrastructure telemetry, automated workflows and generative engineering tools.",
    image: "/domain-ai.jpg",
    icon: BrainCircuit,
    tools: ["Digital Twins", "Sensor AI", "Automation", "Engineering APIs"],
    to: "/student",
    badge: "Intelligent Systems",
  },
];

const engineeringTopics = [
  {
    name: "Structural Analysis & Computational Mechanics",
    headline: "Nonlinear Solvers, Dynamic Response & Code Detailing",
    description: "Finite element formulations, seismic response spectra (IS 1893, Eurocodes), and structural detailing for reinforced concrete and steel infrastructure.",
    tools: "SAP2000 · ETABS · Non-linear FEA · IS 456 · IS 1893",
    code: "Structural & Seismic",
    icon: Activity,
    to: "/student?category=Design%20%26%20Analysis",
    tone: "blue",
  },
  {
    name: "Water Resources, Catchments & Hydrodynamics",
    headline: "Basin Hydrology, Dam Breach & 2D Flood Dynamics",
    description: "Catchment rainfall-runoff modeling, unsteady river hydrodynamics, shallow-water solvers, and water infrastructure risk evaluation.",
    tools: "HEC-RAS 1D/2D · HEC-HMS · Hydrodynamic Solvers · CWC",
    code: "Hydraulics & Basin Modeling",
    icon: Waves,
    to: "/student?category=Engineering%20Tools",
    tone: "lime",
  },
  {
    name: "Geospatial Intelligence, Remote Sensing & Geomatics",
    headline: "Multispectral Satellites, Spatial SQL & Drone Photogrammetry",
    description: "Earth observation analysis, multispectral satellite data, radar InSAR deformation, UAV terrain photogrammetry, and spatial databases.",
    tools: "QGIS · ArcGIS Pro · Google Earth Engine · RTK GNSS · PostGIS",
    code: "GIS & Spatial Intelligence",
    icon: Satellite,
    to: "/student?category=Geospatial%20Tools",
    tone: "green",
  },
  {
    name: "Computational Engineering & Numerical Solvers",
    headline: "Scientific Python, Matrix Formulations & Optimization",
    description: "Translating engineering governing equations into scientific computing pipelines, matrix solvers, probabilistic reliability, and sensitivity analysis.",
    tools: "NumPy · SciPy · SymPy · Pandas · Monte Carlo · Python",
    code: "Scientific Computing",
    icon: FileCode,
    to: "/student?category=Computational%20Tools",
    tone: "gold",
  },
  {
    name: "Infrastructure BIM, Digital Twins & Virtual Design",
    headline: "Parametric Modeling, Clash Coordination & Field Verification",
    description: "Multi-disciplinary 3D BIM coordination, structural reinforcement detailing, construction scheduling, and drone-based reality capture.",
    tools: "Autodesk Revit · Navisworks · ISO 19650 · Drone Mesh · Total Station",
    code: "BIM & Digital Infrastructure",
    icon: Boxes,
    to: "/student?category=Design%20%26%20Analysis",
    tone: "blue",
  },
  {
    name: "AI & Machine Learning for Physical Engineers",
    headline: "Physics-Informed ML, Structural Health & Engineering APIs",
    description: "Surrogate neural network models, structural health monitoring, automated calculation microservices, and AI-assisted engineering decision support.",
    tools: "PyTorch · Scikit-Learn · Sensor IoT · Fast Engineering APIs",
    code: "AI for Engineers",
    icon: BrainCircuit,
    to: "/student",
    tone: "lime",
  },
];

const journey = [
  { title: "Choose a capability path", description: "Find a course, workshop or webinar aligned to your role, level and professional goal." },
  { title: "Learn with expert guidance", description: "Study through concise resources, live interaction, structured assignments and peer engagement." },
  { title: "Apply in authentic contexts", description: "Use engineering tools, case evidence, simulations and practice tasks to build real competence." },
  { title: "Build a verified portfolio", description: "Track progress, complete assessments and retain professional evidence of your learning journey." },
];

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [eventCount, setEventCount] = useState(0);
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [form, setForm] = useState<EnquiryForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  useEffect(() => {
    setCourses(loadCourses());
    setInstructors(loadInstructors());
    setEventCount(loadEvents("webinars").length + loadEvents("workshops").length);
  }, []);

  useEffect(() => {
    if (isCarouselPaused) return;
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % engineeringTopics.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isCarouselPaused]);

  const prevCarouselSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + engineeringTopics.length) % engineeringTopics.length);
  };

  const nextCarouselSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % engineeringTopics.length);
  };

  const featuredCourses = useMemo(() => courses.slice(0, 3), [courses]);

  const submit = async () => {
    if (!form.name.trim()) { alert("Please enter your name."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) { alert("Please enter a valid email address."); return; }
    setSubmitting(true);
    try {
      await submitPublicEnquiry({
        source: "Home",
        courseId: "",
        courseTitle: `General Enquiry - ${form.topic}`,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        organisation: form.organisation.trim(),
        message: form.message.trim(),
      });
      setForm(emptyForm);
      setShowEnquiry(false);
      alert("Thank you. The TerraMatrix Academy team will respond to your enquiry.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "The enquiry could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <section className="tm3-hero">
        <div className="tm3-hero__image" style={{ backgroundImage: `url('${heroImage}')` }} />
        <div className="tm3-hero__inner">
          <div className="tm3-hero__copy">
            <Eyebrow tone="light">Beyond a traditional LMS</Eyebrow>
            <h1>Engineering learning that moves from <span>knowledge to impact.</span></h1>
            <p className="tm3-hero__lead">
              TerraMatrix Academy is an engineering intelligence platform connecting structured learning, practical skill development, research, collaboration and professional certification.
            </p>
            <div className="tm3-hero__actions">
              <Link className="tm3-button tm3-button--lime" to="/student">Explore learning pathways <ArrowRight size={18} /></Link>
              <button className="tm3-button tm3-button--outline" type="button" onClick={() => setShowEnquiry(true)} style={{ color: "white", borderColor: "rgba(255,255,255,.35)" }}>Talk to the Academy</button>
            </div>
            <div className="tm3-hero__proof">
              <span><CheckCircle2 size={15} /> Practice-oriented</span>
              <span><CheckCircle2 size={15} /> Expert-led</span>
              <span><CheckCircle2 size={15} /> Research-connected</span>
              <span><CheckCircle2 size={15} /> Mobile-ready</span>
            </div>
          </div>

          <aside className="tm3-hero-card" aria-label="TerraMatrix learning ecosystem">
            <div className="tm3-hero-card__top">
              <span style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <GraduationCap size={16} style={{ color: "var(--tm3-lime)" }} />
                  <strong>{courses.length || "5"}</strong> programmes
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <UsersRound size={16} style={{ color: "var(--tm3-lime)" }} />
                  <strong>{instructors.length || "5"}</strong> instructors
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <CalendarDays size={16} style={{ color: "var(--tm3-lime)" }} />
                  <strong>{eventCount || "3"}</strong> events
                </span>
              </span>
              <i />
            </div>
            <div className="tm3-hero-card__body">
              {pillars.map(({ title, description, icon: Icon, to }) => (
                <Link className="tm3-pillar-link" to={to} key={title}>
                  <span className="tm3-pillar-link__icon"><Icon size={19} /></span>
                  <span><strong>{title}</strong><small>{description}</small></span>
                  <ChevronRight size={16} />
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="tm3-brand-strip" aria-label="Platform promise">
        <div className="tm3-brand-strip__inner">
          <div className="tm3-brand-strip__item"><span><GraduationCap size={19} /></span><div><strong>Structured learning</strong><small>Clear pathways and outcomes</small></div></div>
          <div className="tm3-brand-strip__item"><span><BriefcaseBusiness size={19} /></span><div><strong>Industry relevance</strong><small>Practice-led capability building</small></div></div>
          <div className="tm3-brand-strip__item"><span><FlaskConical size={19} /></span><div><strong>Research connection</strong><small>Evidence, methods and inquiry</small></div></div>
          <div className="tm3-brand-strip__item"><span><UsersRound size={19} /></span><div><strong>Expert community</strong><small>Instructor and practitioner guidance</small></div></div>
          <div className="tm3-brand-strip__item"><span><ShieldCheck size={19} /></span><div><strong>Meaningful recognition</strong><small>Learning records and certificates</small></div></div>
        </div>
      </section>

      <section className="tm3-section">
        <div className="tm3-shell">
          <SectionHeading
            eyebrow="Featured learning"
            title="Build capabilities that engineering practice actually demands."
            description="Choose focused learning experiences designed around tools, decisions, field realities and professional outcomes—not content consumption alone."
          />

          {featuredCourses.length === 0 ? (
            <EmptyState
              icon="spark"
              title="The first programmes are being prepared"
              description="The shared catalogue is ready. Published courses added by the academy will appear here automatically across every device."
              actionLabel="View the catalogue"
              actionTo="/student"
            />
          ) : (
            <div className="tm3-card-grid">
              {featuredCourses.map((course) => {
                const courseInstructors = getCourseInstructors(course, instructors);
                return (
                  <article className="tm3-programme-card" key={course.id}>
                    <div className="tm3-programme-card__image" style={{ backgroundImage: `url('${course.imageUrl}')` }}>
                      <span className="tm3-programme-card__badge"><Badge tone="gold">{course.category}</Badge></span>
                    </div>
                    <div className="tm3-programme-card__body">
                      <div className="tm3-badge-row"><Badge tone="green">{course.level}</Badge><Badge>{course.mode}</Badge></div>
                      <h3>{deriveShortTitle(course)}</h3>
                      {course.title && course.title !== deriveShortTitle(course) && (
                        <div className="tm3-course-card__full-title">{course.title}</div>
                      )}
                      <p>{course.description}</p>
                      <div className="tm3-programme-card__meta">
                        <span><CalendarDays size={14} /> {formatDate(course.startDate)}</span>
                        <span><BookOpen size={14} /> {course.duration} hrs</span>
                        <span><UsersRound size={14} /> {courseInstructors[0]?.name}</span>
                      </div>
                      <div className="tm3-programme-card__footer">
                        <strong>{formatFee(course.fee)}</strong>
                        <Link className="tm3-button tm3-button--ghost" to={`/courses/${course.id}`}>Programme details <ArrowRight size={16} /></Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="tm3-section tm3-section--soft">
        <div className="tm3-shell">
          <SectionHeading
            eyebrow="The TerraMatrix model"
            title="One platform. Five connected dimensions of engineering growth."
            description="Learning becomes valuable when it is connected to practice, inquiry, collaboration and recognised achievement."
            align="center"
          />
          <div className="tm3-pillar-grid">
            {pillars.map((pillar, index) => (
              <article className="tm3-pillar-card" key={pillar.title}>
                <div className="tm3-pillar-card__number">0{index + 1}</div>
                <div><h3>{pillar.title}</h3><p>{pillar.description}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="tm3-section">
        <div className="tm3-shell">
          <SectionHeading
            eyebrow="Academic domains"
            title="Designed for the evolving engineering landscape."
            description="The academy begins with civil engineering and expands through computational, geospatial and AI-enabled professional practice."
          />
          <div className="tm3-domain-grid">
            {domains.map((domain) => (
              <Link
                to={domain.to}
                className="tm3-domain-card"
                key={domain.title}
                style={{ backgroundImage: `url('${domain.image}')` }}
              >
                <div className="tm3-domain-card__overlay" />
                <div className="tm3-domain-card__content">
                  <div>
                    <div className="tm3-domain-card__header">
                      <div className="tm3-domain-card__badge-logo">
                        <domain.icon size={22} style={{ color: "var(--tm3-lime)" }} />
                      </div>
                      <Badge tone="gold">{domain.badge}</Badge>
                    </div>
                    <h3>{domain.title}</h3>
                    <p>{domain.description}</p>
                    <div className="tm3-domain-card__tools">
                      {domain.tools.map((tool) => (
                        <span key={tool} className="tm3-domain-card__tool-pill">{tool}</span>
                      ))}
                    </div>
                  </div>
                  <div className="tm3-domain-card__cta">
                    <span>Explore domain</span>
                    <ArrowRight size={15} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="tm3-tools-section">
        <div className="tm3-shell">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
            <div>
              <span className="tm3-eyebrow">Competency matrix</span>
              <h2>
                Master authentic engineering tools & standards.
              </h2>
              <p className="tm3-tools-lead">
                Progressive capability pathways across computational mechanics, 2D river hydrodynamics, satellite geospatial intelligence, and engineering AI.
              </p>
            </div>

            {/* Carousel Navigation Bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ display: "flex", gap: 6 }}>
                {engineeringTopics.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => setCarouselIndex(dotIdx)}
                    className={`tm3-tools-dot ${dotIdx === carouselIndex ? "tm3-tools-dot--active" : "tm3-tools-dot--inactive"}`}
                    aria-label={`Go to slide ${dotIdx + 1}`}
                  />
                ))}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={prevCarouselSlide}
                  className="tm3-tools-nav-btn"
                  aria-label="Previous competency cluster"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={nextCarouselSlide}
                  className="tm3-tools-nav-btn"
                  aria-label="Next competency cluster"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Smooth Sliding Carousel Viewport & Track */}
          <div
            className="tm3-carousel-viewport"
            onMouseEnter={() => setIsCarouselPaused(true)}
            onMouseLeave={() => setIsCarouselPaused(false)}
          >
            <div
              className="tm3-carousel-track"
              style={{ "--carousel-idx": carouselIndex } as React.CSSProperties}
            >
              {[...engineeringTopics, ...engineeringTopics.slice(0, 3)].map((topic, idx) => {
                const Icon = topic.icon;
                return (
                  <div className="tm3-carousel-card" key={`${topic.name}-${idx}`}>
                    <Link
                      to={topic.to}
                      className="tm3-topic-card"
                    >
                      <div>
                        <div className="tm3-topic-card__head">
                          <div className={`tm3-topic-card__icon tm3-topic-card__icon--${topic.tone}`}>
                            <Icon size={22} />
                          </div>
                          <span className="tm3-topic-card__code">{topic.code}</span>
                        </div>

                        <h3>{topic.name}</h3>

                        <div className="tm3-topic-card__headline">
                          {topic.headline}
                        </div>

                        <p>{topic.description}</p>
                      </div>

                      <div className="tm3-topic-card__footer">
                        <span className="tm3-topic-card__tools">{topic.tools}</span>
                        <span className="tm3-topic-card__explore">
                          Explore <ArrowRight size={14} />
                        </span>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="tm3-section tm3-section--soft">
        <div className="tm3-shell tm3-journey">
          <div className="tm3-journey__visual" style={{ backgroundImage: `linear-gradient(145deg, rgba(6,31,26,.04), rgba(6,31,26,.16)), url('${heroImage}')` }}>
            <div className="tm3-journey__visual-card">
              <strong>From enrolment to demonstrated capability</strong>
              <span>A coherent learner journey across classes, resources, assignments, live sessions and evidence of completion.</span>
            </div>
          </div>
          <div>
            <SectionHeading
              eyebrow="Learner journey"
              title="A clearer path from intention to professional growth."
              description="Every learning experience is organised around progress, application and measurable outcomes."
            />
            <div className="tm3-journey__steps">
              {journey.map((item, index) => (
                <div className="tm3-journey-step" key={item.title}>
                  <span className="tm3-journey-step__number">{index + 1}</span>
                  <div><h3>{item.title}</h3><p>{item.description}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="tm3-cta">
        <div>
          <Eyebrow tone="light">Start a conversation</Eyebrow>
          <h2>Build the next capability pathway with TerraMatrix.</h2>
          <p>
            For students, instructors, institutions and industry teams seeking focused training, collaborative learning or a customised engineering programme.
          </p>
        </div>
        <div className="tm3-cta__actions">
          <button className="tm3-button tm3-button--lime" onClick={() => setShowEnquiry(true)}>Enquire now <ArrowRight size={17} /></button>
          <Link className="tm3-button tm3-button--outline" to="/instructors" style={{ color: "white", borderColor: "rgba(255,255,255,.3)" }}>Meet the instructors</Link>
        </div>
      </section>

      {showEnquiry && (
        <div className="tm3-modal-backdrop" role="dialog" aria-modal="true" aria-label="Contact TerraMatrix Academy">
          <div className="tm3-modal">
            <button className="tm3-modal__close" type="button" onClick={() => setShowEnquiry(false)} aria-label="Close"><X size={19} /></button>
            <Eyebrow>Contact the Academy</Eyebrow>
            <h2>Tell us what you are looking to learn or build.</h2>
            <div className="tm3-form">
              <div className="tm3-form-grid">
                <label className="tm3-field">Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></label>
                <label className="tm3-field">Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@example.com" /></label>
                <label className="tm3-field">Phone<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Mobile number" /></label>
                <label className="tm3-field">Organisation<input value={form.organisation} onChange={(e) => setForm({ ...form, organisation: e.target.value })} placeholder="Institution / company" /></label>
              </div>
              <label className="tm3-field">Enquiry type
                <select value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}>
                  <option>General enquiry</option><option>Course or programme</option><option>Institutional training</option><option>Industry collaboration</option><option>Research collaboration</option>
                </select>
              </label>
              <label className="tm3-field">Message<textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Briefly describe your need or learning goal." /></label>
              <button className="tm3-button tm3-button--dark" type="button" onClick={() => void submit()} disabled={submitting}>{submitting ? "Submitting…" : "Submit enquiry"}<ArrowRight size={17} /></button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
