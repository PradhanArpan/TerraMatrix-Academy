import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Play, Search, X } from "lucide-react";
import { Badge, EmptyState, Metric, PageIntro } from "../components/Ui";
import { loadVideos, type LearningVideo } from "../lib/catalogData";

function getEmbedUrl(value: string) {
  const clean = value.trim();
  const match = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&/]+)/i);
  return match?.[1] ? `https://www.youtube.com/embed/${match[1]}?rel=0` : clean;
}

export default function LearningVideos() {
  const [videos, setVideos] = useState<LearningVideo[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<LearningVideo | null>(null);

  useEffect(() => setVideos(loadVideos()), []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(videos.map((item) => item.category).filter(Boolean)))], [videos]);
  const filtered = useMemo(() => videos.filter((video) => {
    const haystack = `${video.title} ${video.category} ${video.theme} ${video.description} ${video.level}`.toLowerCase();
    return (!query.trim() || haystack.includes(query.trim().toLowerCase())) && (category === "All" || video.category === category);
  }), [videos, query, category]);

  return (
    <main>
      <PageIntro
        eyebrow="Learning library"
        title="Engineering ideas, explained with clarity."
        description="A growing collection of recorded lessons, demonstrations and focused explainers that support conceptual understanding and practical application."
        aside={<Metric value={videos.length} label="Published videos" helper="On-demand learning" />}
      />

      <section className="tm3-filter-shell" style={{ gridTemplateColumns: "minmax(280px, 1fr) minmax(220px, .35fr)" }}>
        <label className="tm3-search-field"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search topics, tools or concepts" /></label>
        <select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item === "All" ? "All learning areas" : item}</option>)}</select>
      </section>

      <section className="tm3-catalogue">
        {videos.length === 0 ? (
          <EmptyState icon="spark" title="The learning library is being curated" description="Published learning videos will appear here automatically from the shared academy database." />
        ) : filtered.length === 0 ? (
          <EmptyState icon="search" title="No videos match this search" description="Try another topic or learning area." />
        ) : (
          <div className="tm3-catalogue-grid">
            {filtered.map((video) => (
              <article className="tm3-content-card" key={video.id}>
                <button type="button" onClick={() => setSelected(video)} className="tm3-content-card__media" style={{ width: "100%", border: 0, padding: 0, cursor: "pointer", backgroundImage: `url('${video.thumbnailUrl}')` }} aria-label={`Play ${video.title}`}>
                  <span className="tm3-content-card__play"><span><Play size={23} fill="currentColor" /></span></span>
                </button>
                <div className="tm3-content-card__body">
                  <div className="tm3-badge-row"><Badge tone="green">{video.category}</Badge><Badge>{video.level}</Badge></div>
                  <h3>{video.title}</h3>
                  <p>{video.description}</p>
                  <div className="tm3-content-card__footer">
                    <span style={{ color: "var(--tm3-muted)", fontSize: 12, fontWeight: 700 }}>{video.theme}</span>
                    <button className="tm3-button tm3-button--ghost" type="button" onClick={() => setSelected(video)}>Watch <Play size={15} /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <div className="tm3-modal-backdrop" role="dialog" aria-modal="true" aria-label={selected.title}>
          <div className="tm3-modal tm3-modal--wide">
            <button className="tm3-modal__close" type="button" onClick={() => setSelected(null)} aria-label="Close"><X size={18} /></button>
            <div className="tm3-eyebrow tm3-eyebrow--gold">Learning video</div>
            <h2>{selected.title}</h2>
            <div style={{ aspectRatio: "16/9", borderRadius: 18, overflow: "hidden", background: "#000" }}>
              <iframe src={getEmbedUrl(selected.youtubeUrl)} title={selected.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ width: "100%", height: "100%", border: 0 }} />
            </div>
            <p style={{ color: "var(--tm3-muted)", lineHeight: 1.7 }}>{selected.description}</p>
            <a className="tm3-button tm3-button--outline" href={selected.youtubeUrl} target="_blank" rel="noreferrer">Open on YouTube <ExternalLink size={16} /></a>
          </div>
        </div>
      )}
    </main>
  );
}
