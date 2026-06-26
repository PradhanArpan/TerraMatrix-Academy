import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

type LearningVideo = {
  id: number;
  title: string;
  category: string;
  theme: string;
  description: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  level: string;
  status: "Draft" | "Published";
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


const sampleVideos: LearningVideo[] = [
  {
    id: 1,
    title: "Introduction to QGIS for Civil Engineering",
    category: "Digital Skills",
    theme: "GIS and Mapping",
    description:
      "A short orientation video on QGIS interface, layers and basic map preparation for civil engineering learners.",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "/hero-dam.jpg",
    level: "Foundation",
    status: "Published",
  },
  {
    id: 2,
    title: "Understanding Structural Modelling Workflow",
    category: "Engineering Tools",
    theme: "Structural Modelling",
    description:
      "A brief learning video explaining the logic of modelling, loading and interpretation before using analysis software.",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "/hero-dam.jpg",
    level: "Foundation",
    status: "Published",
  },
  {
    id: 3,
    title: "Google Earth for Field Reconnaissance",
    category: "Field & Survey Methods",
    theme: "Site Reconnaissance",
    description:
      "How to use Google Earth as a first-level visual tool for site understanding, route planning and field preparation.",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "/hero-dam.jpg",
    level: "Open",
    status: "Published",
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


function getSavedVideos() {
  try {
    const saved = localStorage.getItem("terramatrix_learning_videos");
    if (!saved) return sampleVideos;
    const parsed = JSON.parse(saved) as Partial<LearningVideo>[];

    return parsed.map((video, index) => ({
      id: video.id || Date.now() + index,
      title: video.title || "Untitled Learning Video",
      category: video.category || "Learning Video",
      theme: video.theme || video.category || "General",
      description: video.description || "Video description will be updated soon.",
      youtubeUrl: video.youtubeUrl || "",
      thumbnailUrl: video.thumbnailUrl || "/hero-dam.jpg",
      level: video.level || "Open",
      status: video.status === "Draft" ? "Draft" : "Published",
    }));
  } catch {
    return sampleVideos;
  }
}

function getYoutubeEmbedUrl(value: string) {
  const url = String(value || "").trim();
  if (!url) return "";

  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1`;
    }
  }

  return url;
}

export default function LearningVideos() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTheme, setSelectedTheme] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<LearningVideo | null>(null);

  const videos = useMemo(
    () => getSavedVideos().filter((video) => video.status === "Published"),
    []
  );

  const categories = useMemo(
    () => getCategoryFilterOptions(videos.map((video) => video.category)),
    [videos]
  );

  const themes = useMemo(
    () =>
      getThemeFilterOptions(
        selectedCategory,
        videos
          .filter(
            (video) =>
              selectedCategory === "All" || video.category === selectedCategory
          )
          .map((video) => video.theme)
      ),
    [videos, selectedCategory]
  );

  const levels = useMemo(
    () => getLevelFilterOptions(videos.map((video) => video.level)),
    [videos]
  );

  const searchQuery = searchText.trim().toLowerCase();

  const filteredVideos = videos.filter((video) => {
    const matchesCategory =
      selectedCategory === "All" || video.category === selectedCategory;
    const matchesTheme = selectedTheme === "All" || video.theme === selectedTheme;
    const matchesLevel = selectedLevel === "All" || video.level === selectedLevel;

    const matchesSearch =
      !searchQuery ||
      includesSearch(video.title, searchQuery) ||
      includesSearch(video.category, searchQuery) ||
      includesSearch(video.theme, searchQuery) ||
      includesSearch(video.level, searchQuery) ||
      includesSearch(video.description, searchQuery);

    return matchesCategory && matchesTheme && matchesLevel && matchesSearch;
  });

  return (
    <main>
      <section style={heroSection}>
        <div>
          <h1 style={pageTitle}>Learning Videos</h1>
        </div>

        <div style={summaryCard}>
          <strong style={summaryValue}>{videos.length}</strong>
          <span style={summaryLabel}>Available</span>
        </div>
      </section>

      <section style={toolbar}>
        <input
          type="text"
          placeholder="Search by video, category or theme..."
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

        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          style={selectInput}
        >
          {levels.map((level) => (
            <option key={level} value={level}>
              {level === "All" ? "All Levels" : level}
            </option>
          ))}
        </select>
      </section>

      <section style={contentSection}>
        {filteredVideos.length === 0 ? (
          <div style={emptyCard}>No videos are available in this category yet.</div>
        ) : (
          <div style={videoGrid}>
            {filteredVideos.map((video) => (
              <article key={video.id} style={videoCard}>
                <div
                  style={{
                    ...videoBanner,
                    backgroundImage: `linear-gradient(90deg, rgba(0,96,82,0.88), rgba(0,96,82,0.52)), url('${video.thumbnailUrl || "/hero-dam.jpg"}')`,
                  }}
                >
                  <span style={levelRibbonStyle(video.level)}>{video.level}</span>
                  <h2 style={videoBannerTitle}>{video.title}</h2>
                </div>

                <div style={videoBody}>
                  <div style={videoMetaRow}>
                    <div style={videoMetaBox}>
                      <span style={videoMetaLabel}>Category</span>
                      <strong style={videoMetaValue}>{video.category}</strong>
                    </div>

                    <div style={videoMetaBox}>
                      <span style={videoMetaLabel}>Theme</span>
                      <strong style={videoMetaValue}>{video.theme}</strong>
                    </div>
                  </div>

                  <p style={videoDescription}>{video.description}</p>
                </div>

                <div style={videoFooter}>
                  <button
                    type="button"
                    onClick={() => setSelectedVideo(video)}
                    style={watchVideoButton}
                  >
                    Watch Video
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedVideo && (
        <div style={modalBackdrop}>
          <div style={videoModal}>
            <button
              type="button"
              onClick={() => setSelectedVideo(null)}
              style={closeButton}
            >
              ×
            </button>

            <h2 style={modalTitle}>{selectedVideo.title}</h2>
            <div style={videoFrameWrap}>
              <iframe
                src={getYoutubeEmbedUrl(selectedVideo.youtubeUrl)}
                title={selectedVideo.title}
                style={videoFrame}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

const heroSection: CSSProperties = {
  maxWidth: "1220px",
  margin: "0 auto",
  padding: "42px 48px 20px",
  display: "grid",
  gridTemplateColumns: "1fr 200px",
  gap: "24px",
  alignItems: "center",
};

const eyebrow: CSSProperties = {
  color: "#8A661E",
  fontSize: "13px",
  fontWeight: 900,
  letterSpacing: "1.8px",
  marginBottom: "10px",
};

const pageTitle: CSSProperties = {
  color: "#8A661E",
  fontSize: "42px",
  lineHeight: "1.1",
  margin: 0,
};

const pageText: CSSProperties = {
  color: "#53665E",
  fontSize: "17px",
  lineHeight: "1.6",
  maxWidth: "820px",
};

const summaryCard: CSSProperties = {
  background: "#DDE9E2",
  border: "1px solid #C8DBD1",
  borderRadius: "12px",
  minHeight: "54px",
  display: "grid",
  placeItems: "center",
  alignContent: "center",
  gap: "1px",
  textAlign: "center",
  color: "#173F35",
  fontWeight: 900,
  padding: "7px 12px",
};

const summaryValue: CSSProperties = {
  fontSize: "18px",
  lineHeight: "1",
  fontWeight: 950,
};

const summaryLabel: CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.05",
  fontWeight: 900,
};

const toolbar: CSSProperties = {
  maxWidth: "1220px",
  margin: "0 auto",
  padding: "16px 48px 22px",
  display: "grid",
  gridTemplateColumns: "1fr 220px 220px 180px",
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

const contentSection: CSSProperties = {
  maxWidth: "1220px",
  margin: "0 auto",
  padding: "0 48px 70px",
};

const videoGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 290px))",
  justifyContent: "start",
  gap: "18px",
};

const videoCard: CSSProperties = {
  width: "100%",
  maxWidth: "290px",
  background: "#FFFFFF",
  border: "1px solid #E8E1D2",
  borderRadius: "16px",
  overflow: "hidden",
  display: "grid",
  gridTemplateRows: "auto auto auto",
  boxShadow: "0 10px 24px rgba(23,63,53,0.08)",
};

const videoBanner: CSSProperties = {
  minHeight: "96px",
  height: "96px",
  backgroundSize: "cover",
  backgroundPosition: "center",
  color: "#FFFFFF",
  padding: "22px 14px 10px",
  display: "grid",
  alignContent: "center",
  boxSizing: "border-box",
  position: "relative",
  overflow: "hidden",
};

const videoBannerTitle: CSSProperties = {
  color: "#FFFFFF",
  fontSize: "17px",
  lineHeight: "1.08",
  margin: 0,
  textAlign: "center",
  textShadow: "0 2px 8px rgba(0,0,0,.45)",
};

function levelRibbonStyle(level: string): CSSProperties {
  const clean = String(level || "").toLowerCase();

  const palette =
    clean.includes("foundation")
      ? { background: "rgba(22, 128, 79, 0.58)", color: "#FFFFFF" }
      : clean.includes("intermediate")
        ? { background: "rgba(214, 126, 29, 0.62)", color: "#FFFFFF" }
        : clean.includes("advanced")
          ? { background: "rgba(166, 73, 55, 0.62)", color: "#FFFFFF" }
          : clean.includes("professional")
            ? { background: "rgba(108, 65, 154, 0.62)", color: "#FFFFFF" }
            : { background: "rgba(91,112,133,0.6)", color: "#FFFFFF" };

  return {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    textAlign: "center",
    padding: "3px 8px",
    fontSize: "9.5px",
    fontWeight: 900,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    borderBottom: "1px solid rgba(255,255,255,0.32)",
    boxShadow: "0 2px 6px rgba(0,0,0,0.10)",
    backdropFilter: "blur(1px)",
    ...palette,
  };
}

const videoBody: CSSProperties = {
  minHeight: "88px",
  display: "grid",
  gap: "6px",
  alignContent: "start",
  padding: "8px 12px",
  textAlign: "left",
};

const videoMetaRow: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "7px",
};

const videoMetaBox: CSSProperties = {
  minWidth: 0,
};

const videoMetaLabel: CSSProperties = {
  display: "block",
  color: "#8A661E",
  fontSize: "9.5px",
  fontWeight: 950,
  lineHeight: "1.05",
  textTransform: "uppercase",
  letterSpacing: "0.45px",
};

const videoMetaValue: CSSProperties = {
  display: "block",
  color: "#173F35",
  fontSize: "10.8px",
  fontWeight: 900,
  lineHeight: "1.12",
};

const videoDescription: CSSProperties = {
  color: "#53665E",
  fontSize: "10.8px",
  fontWeight: 700,
  lineHeight: "1.28",
  margin: 0,
  textAlign: "justify",
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

const videoFooter: CSSProperties = {
  borderTop: "1px solid #E8E1D2",
  padding: "8px 12px 10px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const watchVideoButton: CSSProperties = {
  background: "#173F35",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "10px",
  padding: "10px 16px",
  fontWeight: 900,
  fontSize: "13.5px",
  cursor: "pointer",
};

const emptyCard: CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E8E1D2",
  borderRadius: "18px",
  padding: "28px",
  color: "#53665E",
  textAlign: "center",
};

const modalBackdrop: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.62)",
  zIndex: 5000,
  display: "grid",
  placeItems: "center",
  padding: "24px",
};

const videoModal: CSSProperties = {
  background: "#FFFFFF",
  borderRadius: "18px",
  width: "min(980px, 94vw)",
  padding: "18px",
  position: "relative",
};

const closeButton: CSSProperties = {
  position: "absolute",
  right: "16px",
  top: "14px",
  width: "38px",
  height: "38px",
  borderRadius: "50%",
  border: "1px solid #E8E1D2",
  background: "#FFFFFF",
  color: "#173F35",
  fontSize: "24px",
  cursor: "pointer",
};

const modalTitle: CSSProperties = {
  color: "#173F35",
  margin: "0 50px 14px 0",
  fontSize: "22px",
};

const videoFrameWrap: CSSProperties = {
  position: "relative",
  paddingTop: "56.25%",
  borderRadius: "12px",
  overflow: "hidden",
  background: "#111",
};

const videoFrame: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  border: "none",
};
