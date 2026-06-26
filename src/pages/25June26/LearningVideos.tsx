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

const sampleVideos: LearningVideo[] = [
  {
    id: 1,
    title: "Introduction to QGIS for Civil Engineering",
    category: "Geospatial Tools",
    theme: "QGIS",
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
    category: "Design & Analysis",
    theme: "Structural Analysis",
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
    category: "Field Survey",
    theme: "Planning",
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
  const [searchText, setSearchText] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<LearningVideo | null>(null);

  const videos = useMemo(
    () => getSavedVideos().filter((video) => video.status === "Published"),
    []
  );

  const categories = useMemo(
    () => buildCategoryOptions(videos.map((video) => video.category), "videos"),
    [videos]
  );

  const searchQuery = searchText.trim().toLowerCase();

  const filteredVideos = videos.filter((video) => {
    const matchesCategory =
      selectedCategory === "All" || video.category === selectedCategory;

    const matchesSearch =
      !searchQuery ||
      includesSearch(video.title, searchQuery) ||
      includesSearch(video.category, searchQuery) ||
      includesSearch(video.theme, searchQuery) ||
      includesSearch(video.description, searchQuery);

    return matchesCategory && matchesSearch;
  });

  return (
    <main>
      <section style={heroSection}>
        <div>
          <h1 style={pageTitle}>Learning Videos</h1>
        </div>

        <div style={summaryCard}>
          <strong>{videos.length}</strong>
          <span>Available</span>
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
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={selectInput}
        >
          {categories.map((category) => (
            <option key={category}>{category}</option>
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
                    ...thumbnail,
                    backgroundImage: `linear-gradient(90deg, rgba(0,60,50,0.84), rgba(0,90,78,0.38)), url('${video.thumbnailUrl || "/hero-dam.jpg"}')`,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedVideo(video)}
                    style={playButton}
                  >
                    ▶
                  </button>
                </div>

                <div style={cardBody}>
                  <div style={tagRow}>
                    <span style={categoryBadge}>{video.category}</span>
                    <span style={levelBadge}>{video.level}</span>
                  </div>

                  <h2 style={cardTitle}>{video.title}</h2>
                  <p style={cardText}>{video.description}</p>
                  <span style={themeLine}>Theme: {video.theme}</span>
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
  padding: "58px 48px 28px",
  display: "grid",
  gridTemplateColumns: "1fr 230px",
  gap: "28px",
  alignItems: "center",
};

const eyebrow: CSSProperties = {
  color: "#8A661E",
  fontSize: "13px",
  fontWeight: 900,
  letterSpacing: "1.8px",
  marginBottom: "12px",
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
  borderRadius: "14px",
  minHeight: "74px",
  display: "grid",
  placeItems: "center",
  alignContent: "center",
  gap: "4px",
  textAlign: "center",
  color: "#173F35",
  fontWeight: 900,
  padding: "10px 14px",
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

const contentSection: CSSProperties = {
  maxWidth: "1220px",
  margin: "0 auto",
  padding: "0 48px 70px",
};

const videoGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "20px",
};

const videoCard: CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E8E1D2",
  borderRadius: "18px",
  overflow: "hidden",
  boxShadow: "0 16px 35px rgba(23,63,53,0.08)",
};

const thumbnail: CSSProperties = {
  minHeight: "170px",
  backgroundSize: "cover",
  backgroundPosition: "center",
  display: "grid",
  placeItems: "center",
};

const playButton: CSSProperties = {
  width: "62px",
  height: "62px",
  borderRadius: "50%",
  border: "none",
  background: "#DEB552",
  color: "#173F35",
  fontSize: "24px",
  cursor: "pointer",
  fontWeight: 900,
};

const cardBody: CSSProperties = { padding: "18px", textAlign: "left" };

const tagRow: CSSProperties = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  marginBottom: "12px",
};

const categoryBadge: CSSProperties = {
  background: "#F0E6CF",
  color: "#173F35",
  borderRadius: "999px",
  padding: "7px 10px",
  fontSize: "12px",
  fontWeight: 900,
};

const levelBadge: CSSProperties = { ...categoryBadge, background: "#E7F0EA" };

const cardTitle: CSSProperties = {
  color: "#173F35",
  margin: "0 0 10px",
  fontSize: "21px",
  lineHeight: "1.2",
};

const cardText: CSSProperties = {
  color: "#53665E",
  lineHeight: "1.5",
  margin: "0 0 12px",
  textAlign: "justify",
};

const themeLine: CSSProperties = { color: "#8A661E", fontWeight: 900 };

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
