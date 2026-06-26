import { useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

type EventStatus = "Upcoming" | "Completed" | "Draft";
type RegistrationStatus =
  | "Registered"
  | "Confirmed"
  | "Attended"
  | "Certificate Issued";

type AcademyEvent = {
  id: number;
  title: string;
  category: string;
  theme: string;
  description: string;
  date: string;
  time: string;
  mode: string;
  resourcePerson: string;
  instructorIds: number[];
  fee: string;
  certification: string;
  recordingLink: string;
  imageUrl: string;
  status: EventStatus;
};

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

type EventRegistration = {
  id: number;
  kind: "Webinar";
  eventId: number;
  eventTitle: string;
  category: string;
  theme: string;
  date: string;
  time: string;
  mode: string;
  certification: string;
  paymentOption: string;
  paymentStatus: string;
  paymentReference: string;
  paymentNote: string;
  name: string;
  email: string;
  phone: string;
  organisation: string;
  message: string;
  submittedAt: string;
  status: RegistrationStatus;
};

type RegistrationForm = {
  name: string;
  email: string;
  phone: string;
  organisation: string;
  message: string;
  paymentOption: string;
  paymentReference: string;
  paymentNote: string;
};

const pageKind = "Webinar";
const storageKey = "terramatrix_webinars";
const defaultTitle = "Webinars";
const defaultEyebrow = "WEBINARS";
const defaultSummary = "Live and recorded knowledge sessions on civil engineering, geospatial applications, water resources, research methods and professional practice.";

const emptyForm: RegistrationForm = {
  name: "",
  email: "",
  phone: "",
  organisation: "",
  message: "",
  paymentOption: "Payment details requested",
  paymentReference: "",
  paymentNote: "",
};


const defaultTaxonomyCategories = [
  "Engineering Tools",
  "Digital Skills",
  "Field & Survey Methods",
  "Research & Data Skills",
  "Water & Environmental Systems",
  "Risk, Resilience & Sustainability",
  "Professional & Academic Practice",
  "Institutional / Custom Training",
];

const defaultTaxonomyLevels = [
  "Foundation",
  "Intermediate",
  "Advanced",
  "Professional",
  "Open",
];

const defaultTaxonomyThemes: Record<string, string[]> = {
  "Engineering Tools": [
    "CAD and Drafting",
    "Structural Modelling",
    "BIM and Revit",
    "Design Documentation",
    "Quantity and Estimation",
  ],
  "Digital Skills": [
    "GIS and Mapping",
    "Remote Sensing",
    "Google Earth / GEE",
    "Digital Documentation",
    "AI-supported Learning",
  ],
  "Field & Survey Methods": [
    "GPS and Mobile Mapping",
    "Drone Survey",
    "Site Reconnaissance",
    "Field Data Collection",
    "Ground Truthing",
  ],
  "Research & Data Skills": [
    "Statistics",
    "Excel-based Analysis",
    "SPSS / R / Python",
    "Survey Design",
    "Impact Assessment",
    "Research Methodology",
  ],
  "Water & Environmental Systems": [
    "Water Resources",
    "Groundwater",
    "Irrigation Systems",
    "Tank Filling Schemes",
    "Environmental Monitoring",
    "Sustainability Assessment",
  ],
  "Risk, Resilience & Sustainability": [
    "Disaster Risk Reduction",
    "Climate Resilience",
    "Floods and Landslides",
    "Recovery Planning",
    "Environmental Sustainability",
    "ESG Orientation",
  ],
  "Professional & Academic Practice": [
    "Technical Report Writing",
    "Project Documentation",
    "Engineering Communication",
    "Consultancy Skills",
    "Academic Writing",
    "Teaching and Assessment",
  ],
  "Institutional / Custom Training": [
    "Faculty Development",
    "Student Skill Training",
    "Government / Department Training",
    "Industry-oriented Training",
    "Community-based Training",
  ],
};

function uniqueOptions(values: string[]) {
  return Array.from(
    new Set(values.map((value) => String(value || "").trim()).filter(Boolean))
  );
}

function getPublicTaxonomy() {
  try {
    const saved = localStorage.getItem("terramatrix_taxonomy");
    const parsed = saved ? JSON.parse(saved) : {};
    const categories = uniqueOptions([
      ...(Array.isArray(parsed.categories) ? parsed.categories : []),
      ...defaultTaxonomyCategories,
    ]);
    const levels = uniqueOptions([
      ...(Array.isArray(parsed.levels) ? parsed.levels : []),
      ...defaultTaxonomyLevels,
    ]);
    const savedThemes =
      parsed.themesByCategory && typeof parsed.themesByCategory === "object"
        ? parsed.themesByCategory
        : {};

    const themesByCategory: Record<string, string[]> = {};
    categories.forEach((category) => {
      themesByCategory[category] = uniqueOptions([
        ...(Array.isArray(savedThemes[category]) ? savedThemes[category] : []),
        ...(defaultTaxonomyThemes[category] || []),
      ]);
    });

    return { categories, levels, themesByCategory };
  } catch {
    return {
      categories: defaultTaxonomyCategories,
      levels: defaultTaxonomyLevels,
      themesByCategory: defaultTaxonomyThemes,
    };
  }
}

function getCategoryFilterOptions(itemCategories: string[]) {
  return ["All", ...uniqueOptions([...getPublicTaxonomy().categories, ...itemCategories])];
}

function getLevelFilterOptions(itemLevels: string[]) {
  return ["All", ...uniqueOptions([...getPublicTaxonomy().levels, ...itemLevels])];
}

function getThemeFilterOptions(selectedCategory: string, itemThemes: string[]) {
  const taxonomy = getPublicTaxonomy();

  if (selectedCategory !== "All") {
    return [
      "All",
      ...uniqueOptions([
        ...(taxonomy.themesByCategory[selectedCategory] || []),
        ...itemThemes,
      ]),
    ];
  }

  return [
    "All",
    ...uniqueOptions([
      ...Object.values(taxonomy.themesByCategory).flat(),
      ...itemThemes,
    ]),
  ];
}


const sampleEvents: AcademyEvent[] = [
  {
    id: 1,
    title: "Geospatial Tools for Civil Engineering Practice",
    category: "Digital Skills",
    theme: "GIS and Mapping",
    description:
      "A focused webinar introducing how geospatial tools can support site analysis, documentation and engineering decision-making.",
    date: "2026-07-20",
    time: "6:00 PM",
    mode: "Online",
    resourcePerson: "TerraMatrix Faculty",
    instructorIds: [1],
    fee: "Free",
    certification: "Participation Certificate",
    imageUrl: "/hero-dam.jpg",
    recordingLink: "",
    status: "Upcoming",
  },
];

type CategoryKey = "videos" | "webinars" | "workshops";

function getManagedCategories(group: CategoryKey) {
  try {
    const saved = localStorage.getItem("terramatrix_content_categories");
    const parsed = saved ? JSON.parse(saved) : {};
    return Array.isArray(parsed[group]) ? parsed[group] as string[] : [];
  } catch {
    return [];
  }
}

function buildCategoryOptions(itemCategories: string[], group: CategoryKey) {
  const values = [...getManagedCategories(group), ...itemCategories]
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  return ["All", ...Array.from(new Set(values))];
}

function includesSearch(value: string, query: string) {
  return String(value || "").toLowerCase().includes(query);
}


function getSavedEvents() {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return sampleEvents;

    const parsed = JSON.parse(saved) as Partial<AcademyEvent>[];

    return parsed.map((item, index) => ({
      id: item.id || Date.now() + index,
      title: item.title || `${pageKind} Title`,
      category: item.category || "General",
      theme: item.theme || item.category || "General",
      description: item.description || "Details will be updated soon.",
      date: item.date || "To be announced",
      time: item.time || "",
      mode: item.mode || "Online",
      resourcePerson: item.resourcePerson || "TerraMatrix Faculty",
      instructorIds: Array.isArray(item.instructorIds) ? item.instructorIds : [],
      fee: item.fee || "Free",
      certification: "Participation Certificate",
      recordingLink: item.recordingLink || "",
      imageUrl: item.imageUrl || "/hero-dam.jpg",
      status:
        item.status === "Completed" || item.status === "Draft"
          ? item.status
          : "Upcoming",
    }));
  } catch {
    return sampleEvents;
  }
}

function normalizeInstructor(item: Partial<Instructor>, index = 0): Instructor {
  return {
    id: item.id || index + 1,
    name: item.name || "TerraMatrix Faculty",
    designation: item.designation || "Instructor",
    company: item.company || "TerraMatrix Academy",
    expertise: item.expertise || "",
    email: item.email || "",
    phone: item.phone || "",
    bio: item.bio || "",
    photoUrl: item.photoUrl || "/hero-dam.jpg",
  };
}

function getSavedInstructors() {
  try {
    const saved = localStorage.getItem("terramatrix_instructors");

    if (!saved) {
      return [
        normalizeInstructor({
          id: 1,
          name: "TerraMatrix Faculty",
          designation: "Instructor",
          company: "TerraMatrix Academy",
        }),
      ];
    }

    return (JSON.parse(saved) as Partial<Instructor>[]).map(normalizeInstructor);
  } catch {
    return [];
  }
}

function formatDate(value: string) {
  if (!value || value === "To be announced") return "To be announced";
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

function getValidIndianPhone(value: string) {
  let cleaned = value.replace(/\D/g, "");
  if (cleaned.startsWith("091") && cleaned.length === 13) cleaned = cleaned.slice(3);
  else if (cleaned.startsWith("91") && cleaned.length === 12) cleaned = cleaned.slice(2);
  else if (cleaned.startsWith("0") && cleaned.length === 11) cleaned = cleaned.slice(1);

  if (/^[6-9]\d{9}$/.test(cleaned)) return cleaned;
  return null;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function Webinars() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTheme, setSelectedTheme] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<AcademyEvent | null>(null);
  const [form, setForm] = useState<RegistrationForm>(emptyForm);

  const events = useMemo(
    () => getSavedEvents().filter((item) => item.status !== "Draft"),
    []
  );

  const instructors = useMemo(() => getSavedInstructors(), []);

  const categories = useMemo(
    () => getCategoryFilterOptions(events.map((item) => item.category)),
    [events]
  );

  const themes = useMemo(
    () =>
      getThemeFilterOptions(
        selectedCategory,
        events
          .filter(
            (item) =>
              selectedCategory === "All" || item.category === selectedCategory
          )
          .map((item) => item.theme)
      ),
    [events, selectedCategory]
  );

  const searchQuery = searchText.trim().toLowerCase();

  const filteredEvents = events.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesTheme = selectedTheme === "All" || item.theme === selectedTheme;

    const matchesSearch =
      !searchQuery ||
      includesSearch(item.title, searchQuery) ||
      includesSearch(item.category, searchQuery) ||
      includesSearch(item.theme, searchQuery) ||
      includesSearch(item.description, searchQuery) ||
      includesSearch(item.resourcePerson, searchQuery);

    return matchesCategory && matchesTheme && matchesSearch;
  });

  const upcomingCount = events.filter((item) => item.status === "Upcoming").length;
  const completedCount = events.filter((item) => item.status === "Completed").length;

  const getEventInstructors = (item: AcademyEvent) => {
    const linked = instructors.filter((instructor) =>
      item.instructorIds.includes(instructor.id)
    );

    if (linked.length > 0) return linked;

    const fallbackNames = (item.resourcePerson || "TerraMatrix Faculty")
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);

    return fallbackNames.map((name, index) =>
      normalizeInstructor({
        id: index + 1,
        name,
        designation: "Instructor",
        company: "TerraMatrix Academy",
      })
    );
  };

  const openRegistration = (item: AcademyEvent) => {
    if (item.status !== "Upcoming") return;
    setSelectedEvent(item);
    setForm(emptyForm);
  };

  const saveRegistration = () => {
    if (!selectedEvent) return;

    if (!form.name.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!isValidEmail(form.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    const phone = getValidIndianPhone(form.phone);
    if (!phone) {
      alert("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    const saved = localStorage.getItem("terramatrix_event_registrations");
    const registrations: EventRegistration[] = saved ? JSON.parse(saved) : [];

    const newRegistration: EventRegistration = {
      id: Date.now(),
      kind: pageKind as "Webinar",
      eventId: selectedEvent.id,
      eventTitle: selectedEvent.title,
      category: selectedEvent.category,
      theme: selectedEvent.theme,
      date: selectedEvent.date,
      time: selectedEvent.time,
      mode: selectedEvent.mode,
      certification: "Participation Certificate",
      paymentOption: form.paymentOption,
      paymentStatus:
        form.paymentOption === "Not Applicable / Free" ? "Not Applicable" : "Pending",
      paymentReference: form.paymentReference.trim(),
      paymentNote: form.paymentNote.trim(),
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone,
      organisation: form.organisation.trim(),
      message: form.message.trim(),
      submittedAt: new Date().toLocaleString("en-IN"),
      status: "Registered",
    };

    localStorage.setItem(
      "terramatrix_event_registrations",
      JSON.stringify([newRegistration, ...registrations])
    );

    setSelectedEvent(null);
    setForm(emptyForm);
    alert(`${pageKind} registration submitted.`);
  };

  return (
    <main>
      <section style={heroSection}>
        <div>
          <h1 style={pageTitle}>{defaultTitle}</h1>
        </div>

        <div style={summaryCards}>
          <div style={summaryCard}>
            <strong style={summaryValue}>{upcomingCount}</strong>
            <span style={summaryLabel}>Upcoming</span>
          </div>
          <div style={summaryCard}>
            <strong style={summaryValue}>{completedCount}</strong>
            <span style={summaryLabel}>Completed</span>
          </div>
        </div>
      </section>

      <section style={toolbar}>
        <input
          type="text"
          placeholder="Search by webinar, category or theme..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={searchInput}
        />

        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedTheme("All");
          }}
          style={selectInput}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === "All" ? "All Categories" : category}
            </option>
          ))}
        </select>

        <select
          value={selectedTheme}
          onChange={(e) => setSelectedTheme(e.target.value)}
          style={selectInput}
        >
          {themes.map((theme) => (
            <option key={theme} value={theme}>
              {theme === "All" ? "All Themes" : theme}
            </option>
          ))}
        </select>
      </section>

      <section style={contentSection}>
        {filteredEvents.length === 0 ? (
          <div style={emptyCard}>
            No {pageKind.toLowerCase()} items are available in this category yet.
          </div>
        ) : (
          <div style={eventGrid}>
            {filteredEvents.map((item) => (
              <article key={item.id} style={eventCard}>
                <div
                  style={{
                    ...eventImage,
                    backgroundImage: `linear-gradient(90deg, rgba(0,60,50,0.88), rgba(0,80,70,0.42)), url('${item.imageUrl || "/hero-dam.jpg"}')`,
                  }}
                >
                  <span style={statusBadge}>{item.status}</span>
                </div>

                <div style={eventBody}>
                  <div style={eventTop}>
                    <div style={tagRow}>
                      <span style={categoryBadge}>{item.category}</span>
                      <span style={levelBadge}>{item.theme}</span>
                    </div>

                    {item.status === "Upcoming" ? (
                      <button
                        type="button"
                        onClick={() => openRegistration(item)}
                        style={registerButton}
                      >
                        Register
                      </button>
                    ) : item.recordingLink ? (
                      <a
                        href={item.recordingLink}
                        target="_blank"
                        rel="noreferrer"
                        style={recordingButton}
                      >
                        View Recording
                      </a>
                    ) : (
                      <button type="button" style={disabledButton} disabled>
                        Completed
                      </button>
                    )}
                  </div>

                  <h2 style={cardTitle}>{item.title}</h2>
                  <p style={cardText}>{item.description}</p>

                  <div style={instructorBox}>
                    <span style={smallLabel}>Instructor(s)</span>
                    {getEventInstructors(item).map((instructor) => (
                      <div key={`${item.id}-${instructor.id}-${instructor.name}`} style={instructorLine}>
                        <strong>{instructor.name}</strong>
                        <small style={instructorMeta}>
                          {instructor.designation}, {instructor.company}
                        </small>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={detailGrid}>
                  <Info label="Date" value={formatDate(item.date)} />
                  <Info label="Time" value={item.time || "To be announced"} />
                  <Info label="Mode" value={item.mode} />
                  <Info label="Fee" value={item.fee} />
                  <Info label="Certification" value="Participation Certificate" />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedEvent && (
        <div style={modalBackdrop}>
          <div style={modalCard}>
            <button type="button" onClick={() => setSelectedEvent(null)} style={closeButton}>
              ×
            </button>

            <div style={eyebrow}>{pageKind.toUpperCase()} REGISTRATION</div>
            <h2 style={modalTitle}>{selectedEvent.title}</h2>
            <p style={modalSubText}>
              Submit your registration using the same email and phone you will use for
              student login. It will appear in your student portal.
            </p>

            <div style={formGrid}>
              <Field label="Name">
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={inputStyle}
                  placeholder="Full name"
                />
              </Field>

              <Field label="Email">
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={inputStyle}
                  placeholder="email@example.com"
                />
              </Field>

              <Field label="Mobile Number">
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  style={inputStyle}
                  placeholder="10-digit mobile number"
                />
              </Field>

              <Field label="Organisation / Institution">
                <input
                  value={form.organisation}
                  onChange={(e) =>
                    setForm({ ...form, organisation: e.target.value })
                  }
                  style={inputStyle}
                  placeholder="Optional"
                />
              </Field>
            </div>

            <Field label="Message / Requirement">
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                style={textareaStyle}
                placeholder="Optional"
              />
            </Field>

            <div style={formGrid}>
              <Field label="Payment Option">
                <select
                  value={form.paymentOption}
                  onChange={(e) =>
                    setForm({ ...form, paymentOption: e.target.value })
                  }
                  style={inputStyle}
                >
                  <option>Payment details requested</option>
                  <option>UPI</option>
                  <option>Bank Transfer</option>
                  <option>Already Paid</option>
                  <option>Not Applicable / Free</option>
                </select>
              </Field>

              <Field label="Payment / Transaction Reference">
                <input
                  value={form.paymentReference}
                  onChange={(e) =>
                    setForm({ ...form, paymentReference: e.target.value })
                  }
                  style={inputStyle}
                  placeholder="Optional reference number"
                />
              </Field>
            </div>

            <Field label="Payment Note">
              <textarea
                value={form.paymentNote}
                onChange={(e) => setForm({ ...form, paymentNote: e.target.value })}
                style={textareaStyle}
                placeholder="Optional payment note"
              />
            </Field>

            <div style={buttonRow}>
              <button type="button" onClick={saveRegistration} style={registerButton}>
                Submit
              </button>
              <button type="button" onClick={() => setSelectedEvent(null)} style={plainButton}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div style={infoBox}>
      <span style={infoLabel}>{label}</span>
      <strong style={infoValue} title={value}>{value}</strong>
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

const heroSection: CSSProperties = { maxWidth: "1220px", margin: "0 auto", padding: "42px 48px 20px", display: "grid", gridTemplateColumns: "1fr 250px", gap: "24px", alignItems: "center" };
const eyebrow: CSSProperties = { color: "#8A661E", fontSize: "13px", fontWeight: 900, letterSpacing: "1.8px", marginBottom: "12px" };
const pageTitle: CSSProperties = { color: "#8A661E", fontSize: "42px", lineHeight: "1.1", margin: 0 };
const pageText: CSSProperties = { color: "#53665E", fontSize: "17px", lineHeight: "1.6", maxWidth: "820px", textAlign: "justify" };
const summaryCards: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", alignItems: "stretch" };
const summaryCard: CSSProperties = { background: "#DDE9E2", border: "1px solid #C8DBD1", borderRadius: "12px", minHeight: "54px", display: "grid", placeItems: "center", alignContent: "center", gap: "1px", textAlign: "center", color: "#173F35", fontWeight: 900, padding: "7px 10px", boxShadow: "0 6px 14px rgba(23,63,53,0.045)" };
const summaryValue: CSSProperties = { fontSize: "18px", lineHeight: "1", fontWeight: 950 };
const summaryLabel: CSSProperties = { fontSize: "15px", lineHeight: "1.05", fontWeight: 900 };
const toolbar: CSSProperties = { maxWidth: "1220px", margin: "0 auto", padding: "16px 48px 22px", display: "grid", gridTemplateColumns: "1fr 220px 220px", gap: "16px" };
const searchInput: CSSProperties = { padding: "15px 18px", borderRadius: "12px", border: "1px solid #D8D2C3", fontSize: "16px", outline: "none", background: "#FFFFFF" };
const selectInput: CSSProperties = { ...searchInput };
const contentSection: CSSProperties = { maxWidth: "1220px", margin: "0 auto", padding: "0 48px 70px" };
const eventGrid: CSSProperties = { display: "grid", gap: "16px" };
const eventCard: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "230px 1fr",
  gridTemplateRows: "auto auto",
  background: "#FFFFFF",
  border: "1px solid #E8E1D2",
  borderRadius: "14px",
  overflow: "hidden",
  boxShadow: "0 8px 20px rgba(23,63,53,0.045)",
};

const eventImage: CSSProperties = {
  gridColumn: "1",
  gridRow: "1",
  minHeight: "158px",
  height: "100%",
  backgroundSize: "cover",
  backgroundPosition: "center",
  position: "relative",
};

const statusBadge: CSSProperties = {
  position: "absolute",
  top: "10px",
  left: "10px",
  background: "#DEB552",
  color: "#173F35",
  borderRadius: "999px",
  padding: "5px 10px",
  fontSize: "12px",
  fontWeight: 900,
};

const eventBody: CSSProperties = {
  gridColumn: "2",
  gridRow: "1",
  padding: "12px 18px 9px",
  textAlign: "left",
  display: "grid",
  alignContent: "start",
  gap: "5px",
};

const eventTop: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "8px",
};

const tagRow: CSSProperties = { display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" };
const categoryBadge: CSSProperties = { background: "#F0E6CF", color: "#173F35", borderRadius: "999px", padding: "5px 9px", fontSize: "11px", fontWeight: 900 };
const levelBadge: CSSProperties = { ...categoryBadge, background: "#E7F0EA" };
const cardTitle: CSSProperties = { color: "#173F35", margin: 0, fontSize: "18px", lineHeight: "1.15" };
const cardText: CSSProperties = { color: "#53665E", fontSize: "13px", lineHeight: "1.32", margin: 0, textAlign: "justify" };

const instructorBox: CSSProperties = {
  background: "#FBFAF6",
  padding: "5px 9px",
  borderRadius: "8px",
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
  marginBottom: "1px",
};

const instructorLine: CSSProperties = {
  display: "flex",
  gap: "5px",
  alignItems: "baseline",
  flexWrap: "wrap",
  color: "#173F35",
  fontSize: "13px",
  lineHeight: "1.12",
  margin: 0,
};

const instructorMeta: CSSProperties = {
  color: "#53665E",
  fontSize: "11.5px",
  lineHeight: "1.12",
};

const detailGrid: CSSProperties = {
  gridColumn: "1 / -1",
  gridRow: "2",
  display: "grid",
  gridTemplateColumns: "repeat(5, minmax(105px, 1fr))",
  gap: "6px",
  alignItems: "stretch",
  padding: "6px 9px 8px",
  borderTop: "1px solid #EFE8DA",
};

const infoBox: CSSProperties = {
  background: "#FBFAF6",
  border: "1px solid #E8E1D2",
  borderRadius: "8px",
  padding: "4px 9px",
  display: "grid",
  gap: "1px",
  minHeight: "38px",
  alignContent: "center",
  justifyItems: "start",
  textAlign: "left",
};

const infoLabel: CSSProperties = {
  fontSize: "12px",
  lineHeight: "1.1",
  color: "#53665E",
};

const infoValue: CSSProperties = {
  fontSize: "13px",
  lineHeight: "1.12",
  color: "#173F35",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const registerButton: CSSProperties = {
  background: "#173F35",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "10px",
  padding: "7px 16px",
  cursor: "pointer",
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const disabledButton: CSSProperties = { ...registerButton, background: "#D8D2C3", color: "#6D6A60", cursor: "not-allowed" };
const recordingButton: CSSProperties = { ...registerButton, display: "inline-flex", alignItems: "center", textDecoration: "none", background: "#DEB552", color: "#173F35" };
const emptyCard: CSSProperties = { background: "#FFFFFF", border: "1px solid #E8E1D2", borderRadius: "18px", padding: "28px", color: "#53665E", textAlign: "center" };
const modalBackdrop: CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.58)", zIndex: 5000, display: "grid", placeItems: "center", padding: "24px" };
const modalCard: CSSProperties = { background: "#FFFFFF", borderRadius: "22px", width: "min(760px, 94vw)", maxHeight: "88vh", overflow: "auto", padding: "30px", position: "relative", textAlign: "left" };
const closeButton: CSSProperties = { position: "absolute", right: "16px", top: "14px", width: "38px", height: "38px", borderRadius: "50%", border: "1px solid #E8E1D2", background: "#FFFFFF", color: "#173F35", fontSize: "24px", cursor: "pointer" };
const modalTitle: CSSProperties = { color: "#173F35", margin: "0 46px 8px 0" };
const modalSubText: CSSProperties = { color: "#53665E", lineHeight: "1.45", margin: "0 0 18px" };
const formGrid: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" };
const fieldBlock: CSSProperties = { display: "grid", gap: "6px", color: "#35584D", fontSize: "14px", fontWeight: 800, marginBottom: "14px" };
const inputStyle: CSSProperties = { width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: "11px", border: "1px solid #D8D2C3", fontSize: "15px", outline: "none", background: "#FFFFFF" };
const textareaStyle: CSSProperties = { ...inputStyle, minHeight: "86px", resize: "vertical" };
const buttonRow: CSSProperties = { display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" };
const plainButton: CSSProperties = { background: "#FFFFFF", color: "#173F35", border: "1px solid #D8D2C3", borderRadius: "12px", padding: "12px 18px", cursor: "pointer", fontWeight: 900 };
