import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { CSSProperties } from "react";
import logo from "../assets/terramatrix-logo.png";

type LearningTool = {
  id: number;
  area: string;
  name: string;
  icon: string;
  logoData: string;
  order: number;
};

type GeneralEnquiryForm = {
  name: string;
  email: string;
  phone: string;
  organisation: string;
  topic: string;
  message: string;
};

type PortalStat = {
  label: string;
  value: number;
  icon: string;
  iconUrl?: string;
};

const emptyGeneralEnquiryForm: GeneralEnquiryForm = {
  name: "",
  email: "",
  phone: "",
  organisation: "",
  topic: "General enquiry",
  message: "",
};

const defaultLearningTools: LearningTool[] = [
  { id: 1, area: "Geospatial Tools", name: "QGIS", icon: "🛰️", logoData: "", order: 1 },
  { id: 2, area: "Geospatial Tools", name: "ArcGIS", icon: "🗺️", logoData: "", order: 2 },
  { id: 3, area: "Geospatial Tools", name: "GEE", icon: "🌍", logoData: "", order: 3 },
  { id: 4, area: "Geospatial Tools", name: "RS", icon: "🛰️", logoData: "", order: 4 },

  { id: 5, area: "Design & Analysis", name: "BIM", icon: "🏢", logoData: "", order: 5 },
  { id: 6, area: "Design & Analysis", name: "Revit", icon: "🏗️", logoData: "", order: 6 },
  { id: 7, area: "Design & Analysis", name: "AutoCAD", icon: "📐", logoData: "", order: 7 },
  { id: 8, area: "Design & Analysis", name: "ETABS", icon: "🏛️", logoData: "", order: 8 },
  { id: 9, area: "Design & Analysis", name: "SAP2000", icon: "🌉", logoData: "", order: 9 },

  { id: 10, area: "Water Resources", name: "HEC-RAS", icon: "🌊", logoData: "", order: 10 },
  { id: 11, area: "Water Resources", name: "HEC-HMS", icon: "🌧️", logoData: "", order: 11 },
  { id: 12, area: "Water Resources", name: "MODFlow", icon: "💧", logoData: "", order: 12 },
  { id: 13, area: "Water Resources", name: "CCHE2D", icon: "〰️", logoData: "", order: 13 },
  { id: 14, area: "Water Resources", name: "MIKE", icon: "🌦️", logoData: "", order: 14 },

  { id: 15, area: "Field Survey", name: "Kobo", icon: "📱", logoData: "", order: 15 },
  { id: 16, area: "Field Survey", name: "GPS", icon: "📍", logoData: "", order: 16 },
  { id: 17, area: "Field Survey", name: "Drone", icon: "🛩️", logoData: "", order: 17 },
  { id: 18, area: "Field Survey", name: "Mobile GIS", icon: "🧭", logoData: "", order: 18 },

  { id: 19, area: "Research & Data", name: "Statistics", icon: "📊", logoData: "", order: 19 },
  { id: 20, area: "Research & Data", name: "Excel", icon: "📗", logoData: "", order: 20 },
  { id: 21, area: "Research & Data", name: "SPSS", icon: "📈", logoData: "", order: 21 },
  { id: 22, area: "Research & Data", name: "R Studio", icon: "®️", logoData: "", order: 22 },
  { id: 23, area: "Research & Data", name: "LaTeX", icon: "📝", logoData: "", order: 23 },

  { id: 24, area: "Computational Tools", name: "GeneXPro", icon: "🧬", logoData: "", order: 24 },
  { id: 25, area: "Computational Tools", name: "MATLAB", icon: "🧮", logoData: "", order: 25 },
  { id: 26, area: "Computational Tools", name: "Python", icon: "🐍", logoData: "", order: 26 },
  { id: 27, area: "Computational Tools", name: "PowerBI", icon: "📊", logoData: "", order: 27 },
];

const highlights = [
  { icon: "🎓", title: "Modern Curriculum" },
  { icon: "🧩", title: "Skill Enhancement" },
  { icon: "👥", title: "Expert Instructors" },
  { icon: "📈", title: "Real-World Impact" },
];

const genericSkillItems = [
  { name: "BIM", logoUrl: "/logos/bim.png" },
  { name: "CAD", logoUrl: "/logos/cad.png" },
  { name: "API", logoUrl: "/logos/api.png" },
  { name: "GIS", logoUrl: "/logos/gis.png" },
  { name: "Structural Design", logoUrl: "/logos/structural-design.png" },
  { name: "Structural Analysis", logoUrl: "/logos/structural-analysis.png" },
  { name: "Hydrologic Modeling", logoUrl: "/logos/hydrologic-modeling.png" },
  { name: "River Analysis", logoUrl: "/logos/river-analysis.png" },
  { name: "Data Analysis", logoUrl: "/logos/data-analysis.png" },
  { name: "Field Survey", logoUrl: "/logos/field-survey.png" },
  { name: "Remote Sensing", logoUrl: "/logos/remote-sensing.png" },
  { name: "Programming", logoUrl: "/logos/programming.png" },
];

function normalizeToolName(name: string) {
  const clean = name.trim();
  const lower = clean.toLowerCase();

  if (lower === "google earth") return "GEE";
  if (lower === "remote sensing") return "RS";
  if (lower === "gps survey") return "GPS";
  if (lower === "field survey") return "GPS";
  if (lower === "survey") return "GPS";
  if (lower === "drone survey") return "Drone";
  if (lower === "impact assessment") return "Kobo";
  if (lower === "hydrology") return "MODFlow";
  if (lower === "power bi") return "PowerBI";
  if (lower === "matlab") return "MATLAB";
  if (lower === "kobotoolbox") return "Kobo";
  if (lower === "computer based") return "Computational Tools";

  return clean;
}

function normalizeToolArea(area: string, name: string) {
  const cleanArea = area.trim();
  const cleanName = normalizeToolName(name).toLowerCase();

  if (["qgis", "arcgis", "gee", "rs"].includes(cleanName)) return "Geospatial Tools";
  if (["bim", "revit", "autocad", "etabs", "sap2000"].includes(cleanName)) return "Design & Analysis";
  if (["hec-ras", "hec-hms", "modflow", "cche2d", "mike"].includes(cleanName)) return "Water Resources";
  if (["kobo", "gps", "drone", "mobile gis"].includes(cleanName)) return "Field Survey";
  if (["genexpro", "matlab", "python", "powerbi"].includes(cleanName)) return "Computational Tools";
  if (["statistics", "excel", "spss", "r studio", "latex"].includes(cleanName)) return "Research & Data";

  if (cleanArea.toLowerCase() === "gis & geospatial") return "Geospatial Tools";
  if (cleanArea.toLowerCase() === "bim & civil tools") return "Design & Analysis";
  if (cleanArea.toLowerCase() === "design and analysis") return "Design & Analysis";
  if (cleanArea.toLowerCase() === "computer based") return "Computational Tools";
  if (cleanArea.toLowerCase() === "computing & modelling") return "Computational Tools";
  if (cleanArea.toLowerCase() === "geospatial tools") return "Geospatial Tools";
  if (cleanArea.toLowerCase() === "water resources") return "Water Resources";
  if (cleanArea.toLowerCase() === "field survey") return "Field Survey";
  if (cleanArea.toLowerCase() === "research & data") return "Research & Data";

  if (
    cleanArea.toLowerCase() === "water, risk & field practice" ||
    cleanArea.toLowerCase() === "water and field"
  ) {
    if (["hec-ras", "hec-hms", "modflow", "cche2d", "mike"].includes(cleanName)) {
      return "Water Resources";
    }

    return "Field Survey";
  }

  return cleanArea || "General Tools";
}

function normalizeLearningTool(tool: Partial<LearningTool>): LearningTool {
  const normalizedName = normalizeToolName(tool.name || "Tool");

  return {
    id: tool.id || Date.now(),
    area: normalizeToolArea(tool.area || "General Tools", normalizedName),
    name: normalizedName,
    icon: tool.icon || "🧩",
    logoData: tool.logoData || "",
    order: Number(tool.order || 1),
  };
}

function getToolKey(tool: LearningTool) {
  return `${tool.area.trim().toLowerCase()}::${normalizeToolName(tool.name).toLowerCase()}`;
}

function dedupeLearningTools(tools: LearningTool[]) {
  const seen = new Set<string>();
  const cleaned: LearningTool[] = [];

  tools
    .filter((tool) => tool.name.trim())
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
    .forEach((tool) => {
      const key = getToolKey(tool);
      if (seen.has(key)) return;

      seen.add(key);
      cleaned.push({ ...tool, name: normalizeToolName(tool.name) });
    });

  return cleaned;
}

function mergeWithDefaultLearningTools(savedTools: LearningTool[]) {
  const cleanedSaved = dedupeLearningTools(savedTools);
  const existingKeys = new Set(cleanedSaved.map((tool) => getToolKey(tool)));

  const missingDefaults = defaultLearningTools.filter(
    (tool) => !existingKeys.has(getToolKey(tool))
  );

  return dedupeLearningTools([...cleanedSaved, ...missingDefaults]);
}

function readStoredArray<T = Record<string, unknown>>(key: string): T[] {
  try {
    const saved = localStorage.getItem(key);

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getPortalStats(): PortalStat[] {
  const courses = readStoredArray<{ status?: string }>("terramatrix_courses");
  const videos = readStoredArray<{ status?: string }>("terramatrix_learning_videos");
  const webinars = readStoredArray<{ status?: string }>("terramatrix_webinars");
  const workshops = readStoredArray<{ status?: string }>("terramatrix_workshops");
  const instructors = readStoredArray("terramatrix_instructors");

  const publishedCourses = courses.filter((item) => item.status !== "Draft").length;
  const publishedVideos = videos.filter((item) => item.status !== "Draft").length;
  const visibleWebinars = webinars.filter((item) => item.status !== "Draft").length;
  const visibleWorkshops = workshops.filter((item) => item.status !== "Draft").length;

  return [
    {
      label: "Courses",
      value: publishedCourses || 1,
      icon: "📖",
      iconUrl: "/logos/courses.png",
    },
    {
      label: "Learning Videos",
      value: publishedVideos || 3,
      icon: "▶️",
      iconUrl: "/logos/learning-videos.png",
    },
    {
      label: "Webinars",
      value: visibleWebinars || 1,
      icon: "📅",
      iconUrl: "/logos/webinars.png",
    },
    {
      label: "Workshops",
      value: visibleWorkshops || 1,
      icon: "🧑‍🏫",
      iconUrl: "/logos/workshops.png",
    },
    {
      label: "Expert Instructors",
      value: instructors.length || 6,
      icon: "👤",
      iconUrl: "/logos/instructors.png",
    },
  ];
}

export default function Home() {
  const [learningTools, setLearningTools] =
    useState<LearningTool[]>(defaultLearningTools);
  const [toolCarouselIndex, setToolCarouselIndex] = useState<Record<string, number>>({});
  const [areaCarouselIndex, setAreaCarouselIndex] = useState(0);
  const [generalEnquiryForm, setGeneralEnquiryForm] =
    useState<GeneralEnquiryForm>(emptyGeneralEnquiryForm);
  const [showGeneralEnquiry, setShowGeneralEnquiry] = useState(false);
  const [portalStats, setPortalStats] = useState<PortalStat[]>(getPortalStats);

  useEffect(() => {
    const saved = localStorage.getItem("terramatrix_learning_tools");

    if (saved) {
      try {
        const merged = mergeWithDefaultLearningTools(
          JSON.parse(saved).map((tool: Partial<LearningTool>) =>
            normalizeLearningTool(tool)
          )
        );
        setLearningTools(merged);
        localStorage.setItem("terramatrix_learning_tools", JSON.stringify(merged));
      } catch {
        setLearningTools(defaultLearningTools);
      }
    }

    setPortalStats(getPortalStats());
  }, []);

  const groupedTools = useMemo(() => {
    const groups = new Map<string, LearningTool[]>();

    dedupeLearningTools(learningTools).forEach((tool) => {
      const area = tool.area || "General Tools";
      groups.set(area, [...(groups.get(area) || []), tool]);
    });

    return Array.from(groups.entries()).map(([area, tools]) => ({
      area,
      tools: tools.sort((a, b) => a.order - b.order),
    }));
  }, [learningTools]);

  const getVisibleTools = (area: string, tools: LearningTool[]) => {
    const pageCount = Math.max(1, Math.ceil(tools.length / 3));
    const page = Math.min(toolCarouselIndex[area] || 0, pageCount - 1);
    return tools.slice(page * 3, page * 3 + 3);
  };

  const moveToolCarousel = (area: string, tools: LearningTool[], direction: number) => {
    const pageCount = Math.max(1, Math.ceil(tools.length / 3));

    setToolCarouselIndex((current) => {
      const currentPage = current[area] || 0;
      const nextPage = (currentPage + direction + pageCount) % pageCount;
      return { ...current, [area]: nextPage };
    });
  };

  const visibleAreaGroups = useMemo(() => {
    const pageSize = 4;
    const safeIndex = Math.min(areaCarouselIndex, Math.max(0, groupedTools.length - 1));

    if (groupedTools.length <= pageSize) return groupedTools;

    const extended = [...groupedTools, ...groupedTools];
    return extended.slice(safeIndex, safeIndex + pageSize);
  }, [areaCarouselIndex, groupedTools]);

  const moveAreaCarousel = (direction: number) => {
    if (groupedTools.length <= 4) return;

    setAreaCarouselIndex((current) => {
      const next = (current + direction + groupedTools.length) % groupedTools.length;
      return next;
    });
  };

  const submitGeneralEnquiry = () => {
    if (!generalEnquiryForm.name.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(generalEnquiryForm.email.trim())) {
      alert("Please enter a valid email.");
      return;
    }

    const saved = localStorage.getItem("terramatrix_enquiries");
    const enquiries = saved ? JSON.parse(saved) : [];

    const newEnquiry = {
      id: Date.now(),
      courseId: 0,
      courseTitle: `General Enquiry - ${generalEnquiryForm.topic}`,
      name: generalEnquiryForm.name.trim(),
      email: generalEnquiryForm.email.trim().toLowerCase(),
      phone: generalEnquiryForm.phone.trim(),
      organisation: generalEnquiryForm.organisation.trim(),
      message: generalEnquiryForm.message.trim(),
      submittedAt: new Date().toLocaleString(),
      status: "New Enquiry",
      paymentLink: "",
    };

    localStorage.setItem(
      "terramatrix_enquiries",
      JSON.stringify([newEnquiry, ...enquiries])
    );

    setGeneralEnquiryForm(emptyGeneralEnquiryForm);
    setShowGeneralEnquiry(false);
    alert("Enquiry submitted. The TerraMatrix Academy team will respond.");
  };

  return (
    <main>
      <style>{`
        @keyframes tmToolsAutoScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <section style={heroSection}>
        <div style={heroOverlay}>
          <div style={heroContent}>
            <div style={eyebrow}>TERRAMATRIX ACADEMY</div>

            <div style={heroBrandCard}>
              <img src={logo} alt="TerraMatrix Academy" style={heroLogo} />
            </div>

            <h1 style={heroTitle}>
              Practice-Oriented Learning for Students, Faculty and Professionals
            </h1>

            <p style={heroText}>
              Short courses, tool training and applied learning modules for UG
              and PG learners, researchers, educators and working professionals.
            </p>

            <div style={heroButtonRow}>
              <Link to="/student" style={primaryButton}>
                Explore Courses
              </Link>

              <button
                type="button"
                onClick={() => setShowGeneralEnquiry(true)}
                style={heroSecondaryButton}
              >
                Contact / Enquire
              </button>
            </div>
          </div>
        </div>
      </section>

      <section style={highlightWrap}>
        <div style={highlightGrid}>
          {highlights.map((item) => (
            <article key={item.title} style={highlightCard}>
              <div style={highlightIcon}>{item.icon}</div>
              <h3 style={highlightTitle}>{item.title}</h3>
            </article>
          ))}
        </div>
      </section>

      <section style={statsSection}>
        <div style={statsPanel}>
          <h2 style={statsTitle}>Academy at a Glance</h2>

          <div style={statsGrid}>
            {portalStats.map((item) => (
              <article key={item.label} style={statCard}>
                <div style={statTopLine}>
                  <span style={statIcon}>
                    {item.iconUrl ? (
                      <img src={item.iconUrl} alt={item.label} style={statIconImage} />
                    ) : (
                      item.icon
                    )}
                  </span>
                  <strong style={statValue}>{item.value}</strong>
                </div>
                <span style={statLabel}>{item.label}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={learningSection}>
        <div style={learningPanel}>
          <h2 style={toolsPanelTitle}>Tools, Methods and Applied Skills</h2>

          <div style={toolsCarouselFrame}>
            <div style={toolsCarouselTrack}>
              {[...genericSkillItems, ...genericSkillItems].map((tool, index) => (
                <article key={`${tool.name}-${index}`} style={genericToolCard}>
                  <div style={genericToolLogo}>
                    {tool.logoUrl ? (
                      <img src={tool.logoUrl} alt={tool.name} style={genericToolLogoImage} />
                    ) : (
                      <span>{tool.name}</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section style={enquirySection}>
        <div style={enquiryCtaCard}>
          <div>
            <div style={sectionEyebrow}>CONTACT / ENQUIRE</div>
            <h2 style={enquiryCtaTitle}>Have a question?</h2>
            <p style={enquiryText}>
              For courses, webinars, workshops, learning videos, collaborations or
              institutional training, send a general enquiry.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowGeneralEnquiry(true)}
            style={enquiryButton}
          >
            Contact / Enquire
          </button>
        </div>
      </section>

      {showGeneralEnquiry && (
        <div style={enquiryModalBackdrop}>
          <div style={enquiryModalCard}>
            <button
              type="button"
              onClick={() => setShowGeneralEnquiry(false)}
              style={enquiryModalClose}
            >
              ×
            </button>

            <div>
              <div style={sectionEyebrow}>CONTACT / ENQUIRE</div>
              <h2 style={sectionTitle}>General Enquiry</h2>
              <p style={enquiryText}>
                Use this form for questions about courses, webinars, workshops,
                learning videos, collaborations or institutional training.
              </p>
            </div>

            <div style={enquiryFormGrid}>
              <input
                value={generalEnquiryForm.name}
                onChange={(e) =>
                  setGeneralEnquiryForm({ ...generalEnquiryForm, name: e.target.value })
                }
                style={enquiryInput}
                placeholder="Name"
              />

              <input
                value={generalEnquiryForm.email}
                onChange={(e) =>
                  setGeneralEnquiryForm({ ...generalEnquiryForm, email: e.target.value })
                }
                style={enquiryInput}
                placeholder="Email"
              />

              <input
                value={generalEnquiryForm.phone}
                onChange={(e) =>
                  setGeneralEnquiryForm({ ...generalEnquiryForm, phone: e.target.value })
                }
                style={enquiryInput}
                placeholder="Phone"
              />

              <input
                value={generalEnquiryForm.organisation}
                onChange={(e) =>
                  setGeneralEnquiryForm({
                    ...generalEnquiryForm,
                    organisation: e.target.value,
                  })
                }
                style={enquiryInput}
                placeholder="Organisation / Institution"
              />

              <select
                value={generalEnquiryForm.topic}
                onChange={(e) =>
                  setGeneralEnquiryForm({ ...generalEnquiryForm, topic: e.target.value })
                }
                style={enquiryInput}
              >
                <option>General enquiry</option>
                <option>Courses</option>
                <option>Learning Videos</option>
                <option>Webinars</option>
                <option>Workshops</option>
                <option>Institutional Training</option>
                <option>Collaboration</option>
              </select>

              <textarea
                value={generalEnquiryForm.message}
                onChange={(e) =>
                  setGeneralEnquiryForm({ ...generalEnquiryForm, message: e.target.value })
                }
                style={enquiryTextarea}
                placeholder="Message"
              />
            </div>

            <button type="button" onClick={submitGeneralEnquiry} style={enquiryButton}>
              Submit Enquiry
            </button>
          </div>
        </div>
      )}

    </main>
  );
}

const heroSection: CSSProperties = {
  minHeight: "420px",
  backgroundImage:
    "linear-gradient(90deg, rgba(7,45,37,0.96), rgba(7,45,37,0.78), rgba(7,45,37,0.18)), url('/hero-dam.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  position: "relative",
  overflow: "hidden",
};

const heroOverlay: CSSProperties = {
  minHeight: "420px",
  display: "flex",
  alignItems: "center",
};

const heroContent: CSSProperties = {
  maxWidth: "1220px",
  width: "100%",
  margin: "0 auto",
  padding: "52px 48px 66px",
  color: "#FFFFFF",
  textAlign: "left",
  position: "relative",
};

const heroBrandCard: CSSProperties = {
  position: "absolute",
  right: "58px",
  bottom: "86px",
  display: "grid",
  placeItems: "center",
  width: "134px",
  height: "134px",
  background: "rgba(255,255,255,0.88)",
  border: "1px solid rgba(255,255,255,0.72)",
  borderRadius: "50%",
  boxShadow: "0 16px 38px rgba(0,0,0,0.2)",
  zIndex: 2,
};

const heroLogo: CSSProperties = {
  width: "118px",
  height: "118px",
  objectFit: "contain",
  borderRadius: "50%",
  background: "#FFFFFF",
};

const eyebrow: CSSProperties = {
  color: "#D8B25C",
  fontSize: "20px",
  fontWeight: 900,
  letterSpacing: "2.6px",
  marginBottom: "16px",
};

const heroTitle: CSSProperties = {
  color: "#FFFFFF",
  fontSize: "54px",
  lineHeight: "1.08",
  maxWidth: "1050px",
  margin: "0 0 20px",
  fontWeight: 950,
  textShadow: "0 6px 22px rgba(0,0,0,0.35)",
};

const heroText: CSSProperties = {
  color: "#F4F7F5",
  fontSize: "20px",
  lineHeight: "1.6",
  maxWidth: "820px",
  margin: "0 0 30px",
};

const heroButtonRow: CSSProperties = {
  display: "flex",
  gap: "14px",
  alignItems: "center",
  flexWrap: "wrap",
};

const primaryButton: CSSProperties = {
  display: "inline-block",
  background: "#D8B25C",
  color: "#173F35",
  textDecoration: "none",
  padding: "15px 24px",
  borderRadius: "10px",
  fontWeight: 900,
  fontSize: "17px",
};

const heroSecondaryButton: CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  color: "#FFFFFF",
  border: "1px solid rgba(255,255,255,0.68)",
  padding: "14px 22px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: 900,
  fontSize: "17px",
};

const highlightWrap: CSSProperties = {
  maxWidth: "1220px",
  margin: "0 auto",
  padding: "26px 48px 42px",
};

const highlightGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  background: "#FFFFFF",
  borderRadius: "20px",
  overflow: "hidden",
  border: "1px solid #E8E1D2",
  boxShadow: "0 14px 36px rgba(23,63,53,0.08)",
};

const highlightCard: CSSProperties = {
  minHeight: "92px",
  padding: "16px 18px",
  display: "grid",
  alignContent: "center",
  justifyItems: "center",
  gap: "9px",
  borderRight: "1px solid #E8E1D2",
  textAlign: "center",
};

const highlightIcon: CSSProperties = {
  fontSize: "27px",
  lineHeight: 1,
};

const highlightTitle: CSSProperties = {
  color: "#173F35",
  fontSize: "21px",
  lineHeight: "1.2",
  margin: 0,
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const statsSection: CSSProperties = {
  maxWidth: "1220px",
  margin: "0 auto",
  padding: "0 48px 44px",
};

const statsPanel: CSSProperties = {
  background: "linear-gradient(90deg, #F2F8F5, #FBFAF6)",
  border: "1px solid #DDE9E2",
  borderRadius: "18px",
  padding: "20px 24px 24px",
  boxShadow: "0 14px 36px rgba(23,63,53,0.06)",
};

const statsTitle: CSSProperties = {
  color: "#8A661E",
  fontSize: "14px",
  fontWeight: 900,
  letterSpacing: "2px",
  textTransform: "uppercase",
  margin: "0 0 16px",
  textAlign: "left",
};

const statsGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  gap: "14px",
};

const statCard: CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E8E1D2",
  borderRadius: "14px",
  padding: "14px 14px",
  minHeight: "138px",
  display: "grid",
  alignContent: "center",
  gap: "8px",
  textAlign: "left",
};

const statTopLine: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "14px",
};

const statIcon: CSSProperties = {
  width: "104px",
  height: "104px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "28px",
  lineHeight: 1,
};

const statIconImage: CSSProperties = {
  width: "104px",
  height: "104px",
  objectFit: "contain",
  display: "block",
};

const statValue: CSSProperties = {
  color: "#173F35",
  fontSize: "32px",
  lineHeight: "1",
};

const statLabel: CSSProperties = {
  color: "#173F35",
  fontSize: "14px",
  fontWeight: 800,
  textAlign: "center",
};

const learningSection: CSSProperties = {
  maxWidth: "1220px",
  margin: "0 auto",
  padding: "0 48px 56px",
};

const learningPanel: CSSProperties = {
  background: "linear-gradient(90deg, #F2F8F5, #FBFAF6)",
  border: "1px solid #DDE9E2",
  borderRadius: "18px",
  padding: "20px 24px 24px",
  boxShadow: "0 14px 36px rgba(23,63,53,0.06)",
  overflow: "hidden",
};

const toolsPanelTitle: CSSProperties = {
  color: "#8A661E",
  fontSize: "14px",
  fontWeight: 900,
  letterSpacing: "2px",
  textTransform: "uppercase",
  margin: "0 0 16px",
  textAlign: "left",
};

const toolsCarouselFrame: CSSProperties = {
  width: "100%",
  overflow: "hidden",
  background: "#FFFFFF",
  border: "1px solid #E8E1D2",
  borderRadius: "14px",
  padding: "14px 0",
};

const toolsCarouselTrack: CSSProperties = {
  display: "flex",
  width: "max-content",
  gap: "26px",
  padding: "0 18px",
  animation: "tmToolsAutoScroll 46s linear infinite",
};

const genericToolCard: CSSProperties = {
  width: "160px",
  minHeight: "150px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4px",
};

const genericToolLogo: CSSProperties = {
  width: "136px",
  height: "136px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  lineHeight: 1,
};

const genericToolLogoImage: CSSProperties = {
  width: "136px",
  height: "136px",
  objectFit: "contain",
  display: "block",
};

const sectionEyebrow: CSSProperties = {
  color: "#8A661E",
  fontSize: "14px",
  fontWeight: 900,
  letterSpacing: "2px",
  textTransform: "uppercase",
  marginBottom: "8px",
};

const sectionTitle: CSSProperties = {
  color: "#173F35",
  fontSize: "34px",
  lineHeight: "1.15",
  margin: 0,
};

const enquirySection: CSSProperties = {
  maxWidth: "1220px",
  margin: "0 auto",
  padding: "0 48px 72px",
};

const enquiryCtaCard: CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E8E1D2",
  borderRadius: "18px",
  padding: "20px 22px",
  boxShadow: "0 12px 30px rgba(23,63,53,0.06)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "22px",
  textAlign: "left",
};

const enquiryCtaTitle: CSSProperties = {
  color: "#173F35",
  fontSize: "26px",
  margin: "4px 0 0",
};

const enquiryText: CSSProperties = {
  color: "#53665E",
  fontSize: "15px",
  lineHeight: "1.45",
  margin: "8px 0 0",
  maxWidth: "820px",
};

const enquiryFormGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
};

const enquiryInput: CSSProperties = {
  border: "1px solid #D8D2C3",
  borderRadius: "12px",
  padding: "13px 14px",
  fontSize: "15px",
  outline: "none",
  background: "#FBFAF6",
  color: "#173F35",
};

const enquiryTextarea: CSSProperties = {
  ...enquiryInput,
  gridColumn: "1 / -1",
  minHeight: "88px",
  resize: "vertical",
};

const enquiryButton: CSSProperties = {
  background: "#173F35",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "12px",
  padding: "12px 18px",
  cursor: "pointer",
  fontWeight: 900,
  justifySelf: "start",
  whiteSpace: "nowrap",
};

const enquiryModalBackdrop: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.56)",
  zIndex: 5000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "28px",
};

const enquiryModalCard: CSSProperties = {
  position: "relative",
  width: "min(880px, 96vw)",
  maxHeight: "88vh",
  overflowY: "auto",
  background: "#FFFFFF",
  border: "1px solid #E8E1D2",
  borderRadius: "20px",
  padding: "24px",
  boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
  display: "grid",
  gap: "16px",
  textAlign: "left",
};

const enquiryModalClose: CSSProperties = {
  position: "absolute",
  top: "12px",
  right: "12px",
  width: "34px",
  height: "34px",
  borderRadius: "50%",
  border: "1px solid #E8E1D2",
  background: "#FBFAF6",
  color: "#173F35",
  cursor: "pointer",
  fontSize: "22px",
  lineHeight: "1",
  fontWeight: 900,
};
