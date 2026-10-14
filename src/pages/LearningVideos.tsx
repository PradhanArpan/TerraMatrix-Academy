import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ExternalLink, Play, Plus, Search, Sparkles, User, Video, X } from "lucide-react";
import { Badge, EmptyState, Metric, PageIntro } from "../components/Ui";
import { loadVideos, type LearningVideo } from "../lib/catalogData";

function getEmbedUrl(value: string) {
  const clean = value.trim();
  const match = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&/]+)/i);
  return match?.[1] ? `https://www.youtube.com/embed/${match[1]}?rel=0` : clean;
}

type CreatorSubmission = {
  creatorName: string;
  creatorChannel: string;
  creatorEmail: string;
  youtubeUrl: string;
  category: string;
  topic: string;
  title: string;
  description: string;
  proposedInsight: string;
};

const emptySubmission: CreatorSubmission = {
  creatorName: "",
  creatorChannel: "",
  creatorEmail: "",
  youtubeUrl: "",
  category: "Structural Engineering",
  topic: "",
  title: "",
  description: "",
  proposedInsight: "",
};

export default function LearningVideos() {
  const [videos, setVideos] = useState<LearningVideo[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<LearningVideo | null>(null);

  // Creator Submission Modal
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submission, setSubmission] = useState<CreatorSubmission>(emptySubmission);
  const [submitNotice, setSubmitNotice] = useState("");

  useEffect(() => setVideos(loadVideos()), []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(videos.map((item) => item.category).filter(Boolean)))], [videos]);

  const filtered = useMemo(() => videos.filter((video) => {
    const haystack = `${video.title} ${video.category} ${video.theme} ${video.topic || ""} ${video.creatorName || ""} ${video.description} ${video.level}`.toLowerCase();
    return (!query.trim() || haystack.includes(query.trim().toLowerCase())) && (category === "All" || video.category === category);
  }), [videos, query, category]);

  const handleCreatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submission.title.trim() || !submission.youtubeUrl.trim() || !submission.creatorName.trim()) {
      alert("Please provide the video title, YouTube URL, and creator name.");
      return;
    }

    const newVideo: LearningVideo = {
      id: Date.now(),
      title: submission.title.trim(),
      category: submission.category,
      theme: submission.category,
      topic: submission.topic.trim() || "General Engineering",
      creatorName: submission.creatorName.trim(),
      creatorChannel: submission.creatorChannel.trim(),
      creatorEmail: submission.creatorEmail.trim(),
      description: submission.description.trim(),
      terraMatrixInsight: submission.proposedInsight.trim() || "Under review by TerraMatrix Academy editorial panel.",
      youtubeUrl: submission.youtubeUrl.trim(),
      thumbnailUrl: "/domain-civil.jpg",
      level: "Intermediate",
      duration: "15 mins",
      status: "Draft",
      moderationStatus: "Pending Review",
      submittedAt: new Date().toLocaleDateString("en-IN"),
    };

    try {
      const stored = JSON.parse(localStorage.getItem("terramatrix_learning_videos") || "[]");
      stored.unshift(newVideo);
      localStorage.setItem("terramatrix_learning_videos", JSON.stringify(stored));
      setSubmission(emptySubmission);
      setSubmitModalOpen(false);
      setSubmitNotice("Thank you! Your video proposal has been submitted to TerraMatrix Academy for review and editorial curation.");
      setTimeout(() => setSubmitNotice(""), 6000);
    } catch {
      alert("Failed to save submission. Please try again.");
    }
  };

  return (
    <main>
      <PageIntro
        eyebrow="Learning library"
        title="Engineering ideas, curated from top creators with TerraMatrix Insights."
        description="A specialized collection of verified YouTube video explainers and computational demonstrations. Organized by domain, topic, and creators, enriched with TerraMatrix Academy editorial summaries and key takeaways."
        aside={
          <div style={{ display: "grid", gap: 10 }}>
            <Metric value={videos.length} label="Curated videos" helper="Peer-reviewed content" />
            <button
              type="button"
              onClick={() => setSubmitModalOpen(true)}
              className="tm3-button tm3-button--lime"
              style={{ fontSize: 13, minHeight: 38 }}
            >
              <Video size={16} /> Submit YouTube Video
            </button>
          </div>
        }
      />

      {submitNotice && (
        <div style={{ width: "min(var(--tm3-content), calc(100% - 44px))", margin: "-16px auto 24px" }}>
          <div className="tm3-notice">
            <CheckCircle2 size={18} />
            <span>{submitNotice}</span>
            <button type="button" onClick={() => setSubmitNotice("")}>×</button>
          </div>
        </div>
      )}

      {/* Filter and Search Shell */}
      <section className="tm3-filter-shell" style={{ gridTemplateColumns: "minmax(280px, 1fr) minmax(220px, .35fr) auto" }}>
        <label className="tm3-search-field">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by topic, creator, tool (QGIS, SAP2000, Python) or engineering concept..."
          />
        </label>
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item === "All" ? "All learning areas" : item}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setSubmitModalOpen(true)}
          className="tm3-button tm3-button--outline"
          style={{ whiteSpace: "nowrap" }}
        >
          <Plus size={16} /> Creator Submission
        </button>
      </section>

      {/* Video Catalogue Grid */}
      <section className="tm3-catalogue">
        {videos.length === 0 ? (
          <EmptyState
            icon="spark"
            title="The learning library is being curated"
            description="Published learning videos will appear here automatically from the shared academy database."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="search"
            title="No videos match this search"
            description="Try another topic, creator, or engineering discipline."
          />
        ) : (
          <div className="tm3-catalogue-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
            {filtered.map((video) => (
              <article
                className="tm3-content-card"
                key={video.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 22,
                  overflow: "hidden",
                  background: "var(--tm3-surface)",
                  border: "1px solid var(--tm3-border)",
                  boxShadow: "var(--tm3-shadow-xs)",
                  height: "100%",
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelected(video)}
                  className="tm3-content-card__media"
                  style={{
                    width: "100%",
                    height: 200,
                    border: 0,
                    padding: 0,
                    cursor: "pointer",
                    backgroundImage: `linear-gradient(to top, rgba(6,31,26,.65), transparent 50%), url('${video.thumbnailUrl}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    position: "relative",
                  }}
                  aria-label={`Play ${video.title}`}
                >
                  <span className="tm3-content-card__play">
                    <span>
                      <Play size={24} fill="currentColor" />
                    </span>
                  </span>
                  {video.duration && (
                    <span style={{ position: "absolute", bottom: 12, right: 12, padding: "3px 8px", borderRadius: 6, background: "rgba(0,0,0,0.75)", color: "white", fontSize: "0.72rem", fontWeight: 700 }}>
                      {video.duration}
                    </span>
                  )}
                </button>

                <div style={{ padding: 20, display: "flex", flexDirection: "column", flex: 1, gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Badge tone="green">{video.category}</Badge>
                      <Badge tone="neutral">{video.level}</Badge>
                    </div>
                    {video.creatorName && (
                      <span style={{ fontSize: "0.72rem", color: "var(--tm3-muted)", fontWeight: 700 }}>
                        by {video.creatorName}
                      </span>
                    )}
                  </div>

                  <h3 style={{ margin: "2px 0 0", fontSize: "1.1rem", lineHeight: 1.35, fontWeight: 800 }}>
                    {video.title}
                  </h3>

                  <p style={{ margin: 0, color: "var(--tm3-muted)", fontSize: "0.82rem", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {video.description}
                  </p>

                  {/* TerraMatrix Editorial Insight Box */}
                  {video.terraMatrixInsight && (
                    <div style={{ marginTop: 6, padding: "10px 12px", borderRadius: 12, background: "rgba(214, 245, 109, 0.08)", border: "1px solid rgba(214, 245, 109, 0.25)", fontSize: "0.78rem", lineHeight: 1.5 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--tm3-green-800)", fontWeight: 800, fontSize: "0.72rem", marginBottom: 3 }}>
                        <Sparkles size={13} style={{ color: "var(--tm3-lime)" }} />
                        <span>TerraMatrix Academy Key Insight</span>
                      </div>
                      <p style={{ margin: 0, color: "var(--tm3-ink)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {video.terraMatrixInsight}
                      </p>
                    </div>
                  )}

                  <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid var(--tm3-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--tm3-muted)", fontSize: 12, fontWeight: 700 }}>
                      {video.topic || video.theme}
                    </span>
                    <button
                      className="tm3-button tm3-button--ghost"
                      type="button"
                      onClick={() => setSelected(video)}
                      style={{ padding: "4px 10px", fontSize: 13 }}
                    >
                      Watch <Play size={14} fill="currentColor" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* VIDEO PLAYER MODAL */}
      {selected && (
        <div className="tm3-modal-backdrop" role="dialog" aria-modal="true" aria-label={selected.title}>
          <div className="tm3-modal tm3-modal--wide">
            <button className="tm3-modal__close" type="button" onClick={() => setSelected(null)} aria-label="Close">
              <X size={18} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Badge tone="green">{selected.category}</Badge>
              {selected.creatorName && <Badge tone="gold">Creator: {selected.creatorName}</Badge>}
            </div>
            <h2 style={{ fontSize: "1.45rem", marginBottom: 16 }}>{selected.title}</h2>
            <div style={{ aspectRatio: "16/9", borderRadius: 18, overflow: "hidden", background: "#000", marginBottom: 18 }}>
              <iframe
                src={getEmbedUrl(selected.youtubeUrl)}
                title={selected.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: "100%", height: "100%", border: 0 }}
              />
            </div>

            {/* Insight & Description */}
            {selected.terraMatrixInsight && (
              <div style={{ padding: 18, borderRadius: 16, background: "rgba(214, 245, 109, 0.1)", border: "1px solid rgba(214, 245, 109, 0.3)", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--tm3-green-800)", fontWeight: 800, fontSize: "0.85rem", marginBottom: 6 }}>
                  <Sparkles size={16} style={{ color: "var(--tm3-lime)" }} />
                  <span>TerraMatrix Academy Key Insight & Engineering Synthesis:</span>
                </div>
                <p style={{ margin: 0, color: "var(--tm3-ink)", fontSize: "0.88rem", lineHeight: 1.6 }}>
                  {selected.terraMatrixInsight}
                </p>
              </div>
            )}

            <p style={{ color: "var(--tm3-muted)", lineHeight: 1.7, fontSize: "0.9rem" }}>{selected.description}</p>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
              <a className="tm3-button tm3-button--outline" href={selected.youtubeUrl} target="_blank" rel="noreferrer">
                Open on YouTube <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* CREATOR SUBMISSION MODAL */}
      {submitModalOpen && (
        <div className="tm3-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="creator-submit-title">
          <div className="tm3-modal tm3-modal--composer">
            <div className="tm3-modal__head">
              <div>
                <span className="tm3-eyebrow">Creator Showcase Pipeline</span>
                <h2 id="creator-submit-title">Submit YouTube Video for Curation</h2>
                <p style={{ margin: "4px 0 0", color: "var(--tm3-muted)", fontSize: "0.82rem" }}>
                  Engineering creators can propose YouTube explainers. Upon admin approval and editorial review, it will be showcased on TerraMatrix Academy.
                </p>
              </div>
              <button type="button" onClick={() => setSubmitModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatorSubmit} className="tm3-form-grid">
              <label className="tm3-field">
                <span>Creator / Presenter Name *</span>
                <input
                  required
                  value={submission.creatorName}
                  onChange={(e) => setSubmission({ ...submission, creatorName: e.target.value })}
                  placeholder="e.g. Er. Rajesh Verma"
                />
              </label>

              <label className="tm3-field">
                <span>YouTube Channel / Organization</span>
                <input
                  value={submission.creatorChannel}
                  onChange={(e) => setSubmission({ ...submission, creatorChannel: e.target.value })}
                  placeholder="e.g. YouTube / CivilStructuresHub"
                />
              </label>

              <label className="tm3-field">
                <span>Contact Email *</span>
                <input
                  required
                  type="email"
                  value={submission.creatorEmail}
                  onChange={(e) => setSubmission({ ...submission, creatorEmail: e.target.value })}
                  placeholder="creator@gmail.com"
                />
              </label>

              <label className="tm3-field">
                <span>YouTube Video URL *</span>
                <input
                  required
                  value={submission.youtubeUrl}
                  onChange={(e) => setSubmission({ ...submission, youtubeUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </label>

              <label className="tm3-field">
                <span>Category / Academic Domain *</span>
                <select
                  value={submission.category}
                  onChange={(e) => setSubmission({ ...submission, category: e.target.value })}
                >
                  <option value="Structural Engineering">Structural Engineering</option>
                  <option value="Geospatial Tools">Geospatial Tools</option>
                  <option value="Water Resources">Water Resources</option>
                  <option value="Computational Tools">Computational Tools</option>
                  <option value="Civil & Infrastructure">Civil & Infrastructure</option>
                </select>
              </label>

              <label className="tm3-field">
                <span>Topic / Focus Area</span>
                <input
                  value={submission.topic}
                  onChange={(e) => setSubmission({ ...submission, topic: e.target.value })}
                  placeholder="e.g. Foundation Settlement Analysis"
                />
              </label>

              <label className="tm3-field tm3-field--full">
                <span>Video Title *</span>
                <input
                  required
                  value={submission.title}
                  onChange={(e) => setSubmission({ ...submission, title: e.target.value })}
                  placeholder="Accurate, descriptive technical title"
                />
              </label>

              <label className="tm3-field tm3-field--full">
                <span>Video Summary / Description *</span>
                <textarea
                  required
                  rows={3}
                  value={submission.description}
                  onChange={(e) => setSubmission({ ...submission, description: e.target.value })}
                  placeholder="Explain what concepts, equations, or software tools are taught in this video..."
                />
              </label>

              <label className="tm3-field tm3-field--full">
                <span>Proposed Key Takeaway / Insight (Optional)</span>
                <textarea
                  rows={2}
                  value={submission.proposedInsight}
                  onChange={(e) => setSubmission({ ...submission, proposedInsight: e.target.value })}
                  placeholder="What is the critical engineering formula or practical takeaway learners should watch out for?"
                />
              </label>

              <div className="tm3-modal__actions" style={{ gridColumn: "1 / -1" }}>
                <button
                  type="button"
                  className="tm3-button tm3-button--outline"
                  onClick={() => setSubmitModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="tm3-button tm3-button--dark">
                  <Video size={16} /> Submit for Admin Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
