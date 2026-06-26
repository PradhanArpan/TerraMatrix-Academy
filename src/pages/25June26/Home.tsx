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

export default function Home() {
  const [learningTools, setLearningTools] =
    useState<LearningTool[]>(defaultLearningTools);
  const [toolCarouselIndex, setToolCarouselIndex] = useState<Record<string, number>>({});
  const [areaCarouselIndex, setAreaCarouselIndex] = useState(0);

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

  return (
    <main>
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

            <Link to="/student" style={primaryButton}>
              Explore Courses
            </Link>
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

      <section style={learningSection}>
        <div style={sectionHeader}>
          <div style={sectionEyebrow}>LEARNING AREAS</div>
          <h2 style={sectionTitle}>Tools, Methods and Applied Skills</h2>
        </div>

        <div style={areaCarouselFrame}>
          {groupedTools.length > 4 && (
            <button
              type="button"
              onClick={() => moveAreaCarousel(-1)}
              style={{ ...areaCarouselButton, ...areaCarouselButtonLeft }}
              aria-label="Previous learning area"
            >
              ‹
            </button>
          )}

          <div style={toolGrid}>
          {visibleAreaGroups.map((group) => {
            const visibleTools = getVisibleTools(group.area, group.tools);
            const pageCount = Math.max(1, Math.ceil(group.tools.length / 3));

            return (
              <article key={group.area} style={toolCard}>
                <h3 style={toolTitle}>{group.area}</h3>

                <div style={toolLogoGrid}>
                  {visibleTools.map((tool) => (
                    <div key={tool.id} style={toolLogoItem} title={tool.name}>
                      <div style={toolLogoBox}>
                        {tool.logoData ? (
                          <img src={tool.logoData} alt={tool.name} style={toolLogoImage} />
                        ) : (
                          <span style={toolIconText}>{tool.icon || "🧩"}</span>
                        )}
                      </div>
                      <span style={toolName}>{tool.name}</span>
                    </div>
                  ))}
                </div>

                {pageCount > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => moveToolCarousel(group.area, group.tools, -1)}
                      style={{ ...carouselButton, ...carouselButtonLeft }}
                      aria-label={`Previous ${group.area} tools`}
                    >
                      ‹
                    </button>

                    <button
                      type="button"
                      onClick={() => moveToolCarousel(group.area, group.tools, 1)}
                      style={{ ...carouselButton, ...carouselButtonRight }}
                      aria-label={`Next ${group.area} tools`}
                    >
                      ›
                    </button>
                  </>
                )}
              </article>
            );
          })}
          </div>

          {groupedTools.length > 4 && (
            <button
              type="button"
              onClick={() => moveAreaCarousel(1)}
              style={{ ...areaCarouselButton, ...areaCarouselButtonRight }}
              aria-label="Next learning area"
            >
              ›
            </button>
          )}
        </div>
      </section>
    </main>
  );
}

const heroSection: CSSProperties = {
  minHeight: "420px",
  backgroundImage:
    "linear-gradient(90deg, rgba(7,45,37,0.96), rgba(7,45,37,0.78), rgba(7,45,37,0.18)), url('/hero-dam.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
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
};

const heroBrandCard: CSSProperties = {
  position: "absolute",
  right: "54px",
  bottom: "42px",
  display: "grid",
  placeItems: "center",
  width: "154px",
  height: "154px",
  background: "rgba(255,255,255,0.9)",
  border: "1px solid rgba(255,255,255,0.72)",
  borderRadius: "50%",
  boxShadow: "0 18px 42px rgba(0,0,0,0.22)",
  zIndex: 2,
};

const heroLogo: CSSProperties = {
  width: "136px",
  height: "136px",
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

const highlightWrap: CSSProperties = {
  maxWidth: "1220px",
  margin: "-30px auto 0",
  padding: "0 48px 42px",
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
  minHeight: "112px",
  padding: "22px 18px",
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

const learningSection: CSSProperties = {
  maxWidth: "1220px",
  margin: "0 auto",
  padding: "8px 48px 78px",
};

const sectionHeader: CSSProperties = {
  textAlign: "center",
  maxWidth: "860px",
  margin: "0 auto 22px",
};

const sectionEyebrow: CSSProperties = {
  color: "#8A661E",
  fontSize: "14px",
  fontWeight: 900,
  letterSpacing: "2px",
  marginBottom: "10px",
};

const sectionTitle: CSSProperties = {
  color: "#173F35",
  fontSize: "38px",
  lineHeight: "1.15",
  margin: 0,
};

const areaCarouselFrame: CSSProperties = {
  position: "relative",
  padding: "0 54px",
};

const areaCarouselButton: CSSProperties = {
  width: "30px",
  height: "30px",
  borderRadius: "50%",
  border: "1px solid #C9DDD3",
  background: "#DDE9E2",
  color: "#173F35",
  cursor: "pointer",
  fontWeight: 900,
  fontSize: "20px",
  lineHeight: "1",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 3,
};

const areaCarouselButtonLeft: CSSProperties = {
  left: "6px",
};

const areaCarouselButtonRight: CSSProperties = {
  right: "6px",
};

const toolGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "14px",
};

const toolCard: CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E8E1D2",
  borderRadius: "14px",
  padding: "12px 34px",
  boxShadow: "0 8px 18px rgba(23,63,53,0.04)",
  display: "grid",
  gap: "10px",
  alignContent: "start",
  position: "relative",
};

const toolTitle: CSSProperties = {
  color: "#173F35",
  fontSize: "17px",
  lineHeight: "1.15",
  margin: 0,
  textAlign: "center",
  whiteSpace: "nowrap",
};

const toolLogoGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "5px",
  alignItems: "start",
};

const toolLogoItem: CSSProperties = {
  display: "grid",
  justifyItems: "center",
  gap: "6px",
  minWidth: 0,
};

const toolLogoBox: CSSProperties = {
  width: "38px",
  height: "38px",
  borderRadius: "12px",
  background: "#DDE9E2",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  border: "1px solid #C9DDD3",
};

const toolLogoImage: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  background: "#FFFFFF",
};

const toolIconText: CSSProperties = {
  fontSize: "23px",
};

const toolName: CSSProperties = {
  color: "#173F35",
  fontSize: "10.2px",
  fontWeight: 850,
  textAlign: "center",
  lineHeight: "1.08",
  minHeight: "22px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  whiteSpace: "nowrap",
  maxWidth: "64px",
};

const carouselButton: CSSProperties = {
  width: "24px",
  height: "24px",
  borderRadius: "50%",
  border: "1px solid #C9DDD3",
  background: "#DDE9E2",
  color: "#173F35",
  cursor: "pointer",
  fontWeight: 900,
  fontSize: "17px",
  lineHeight: "1",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "absolute",
  top: "52%",
  transform: "translateY(-50%)",
};

const carouselButtonLeft: CSSProperties = {
  left: "6px",
};

const carouselButtonRight: CSSProperties = {
  right: "6px",
};
