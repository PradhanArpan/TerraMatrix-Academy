import { useEffect, useState } from "react";
import { ExternalLink, Mail, Phone, UserRound, X } from "lucide-react";
import { Badge, EmptyState, Metric, PageIntro } from "../components/Ui";
import { loadInstructors, type Instructor } from "../lib/catalogData";

function parseExpertise(value: string) {
  const all = value.split(/[,;\n]/).map((item) => item.trim()).filter(Boolean);
  const visible = all.slice(0, 3);
  const overflow = all.length - visible.length;
  return { all, visible, overflow };
}

function getPdfPreviewUrl(value: string) {
  const drive = value.match(/drive\.google\.com\/file\/d\/([^/]+)/)?.[1];
  if (drive) return `https://drive.google.com/file/d/${drive}/preview`;
  const id = value.match(/[?&]id=([^&]+)/)?.[1];
  if (value.includes("drive.google.com") && id) return `https://drive.google.com/file/d/${id}/preview`;
  return value.startsWith("/") ? `${value}#toolbar=0&navpanes=0` : value;
}

export default function InstructorPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selected, setSelected] = useState<Instructor | null>(null);
  useEffect(() => setInstructors(loadInstructors()), []);

  return (
    <main>
      <PageIntro
        eyebrow="Instructors and practitioners"
        title="Expertise that connects theory, tools and real practice."
        description="TerraMatrix instructors bring together academic depth, applied engineering experience, research capability and a commitment to learner-centred professional growth."
        aside={<Metric value={instructors.length} label="Active instructors" helper="Shared instructor directory" />}
      />

      <section className="tm3-catalogue">
        {instructors.length === 0 ? (
          <EmptyState icon="spark" title="The instructor directory is being prepared" description="Instructor profiles added by the academy will appear here automatically." />
        ) : (
          <div className="tm3-catalogue-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 22 }}>
            {instructors.map((instructor) => {
              const { visible, overflow } = parseExpertise(instructor.expertise);
              return (
                <article
                  key={instructor.id}
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
                  <div
                    style={{
                      height: 205,
                      width: "100%",
                      backgroundImage: `linear-gradient(to top, rgba(6,31,26,.32), transparent 55%), url('${instructor.photoUrl}')`,
                      backgroundPosition: "center 20%",
                      backgroundSize: "cover",
                      filter: "brightness(1.04)",
                      display: "flex",
                      alignItems: "flex-end",
                      padding: 14,
                    }}
                  >
                    <Badge tone="green">Instructor</Badge>
                  </div>
                  <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", flex: 1, gap: 10 }}>
                    <div>
                      <h3 style={{ margin: "0 0 3px", fontSize: "1.15rem", fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {instructor.name}
                      </h3>
                      <p style={{ margin: "0 0 2px", color: "var(--tm3-green-700)", fontWeight: 800, fontSize: "0.82rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {instructor.designation}
                      </p>
                      <p style={{ margin: 0, color: "var(--tm3-muted)", fontSize: "0.75rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {instructor.company || instructor.affiliation || "TerraMatrix Instructor"}
                      </p>
                    </div>

                    {/* Limit expertise tags: max 3 visible + overflow badge */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, minHeight: 26, maxHeight: 56, overflow: "hidden" }}>
                      {visible.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            padding: "3px 8px",
                            borderRadius: 6,
                            background: "var(--tm3-primary-soft)",
                            color: "var(--tm3-primary)",
                            fontSize: "0.72rem",
                            fontWeight: 750,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                      {overflow > 0 && (
                        <span
                          style={{
                            padding: "3px 7px",
                            borderRadius: 6,
                            background: "var(--tm3-surface-muted)",
                            color: "var(--tm3-muted)",
                            fontSize: "0.7rem",
                            fontWeight: 800,
                          }}
                        >
                          +{overflow} more
                        </span>
                      )}
                    </div>

                    {/* Uniform clamped bio */}
                    <p
                      style={{
                        margin: 0,
                        color: "var(--tm3-muted)",
                        fontSize: "0.79rem",
                        lineHeight: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        minHeight: "2.4em",
                      }}
                    >
                      {instructor.bio || "Profile and technical competencies published by TerraMatrix Academy."}
                    </p>

                    {/* Uniform footer row */}
                    <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid var(--tm3-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "var(--tm3-muted)", fontSize: "0.74rem", fontWeight: 700 }}>Faculty Profile</span>
                      <button
                        className="tm3-button tm3-button--ghost"
                        type="button"
                        onClick={() => setSelected(instructor)}
                        style={{ padding: "4px 10px", fontSize: "0.78rem" }}
                      >
                        View profile <UserRound size={14} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {selected && (
        <div className="tm3-modal-backdrop" role="dialog" aria-modal="true" aria-label={`${selected.name} profile`}>
          <div className="tm3-modal">
            <button className="tm3-modal__close" type="button" onClick={() => setSelected(null)} aria-label="Close"><X size={18} /></button>
            <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 20, alignItems: "center", marginBottom: 22 }}>
              <img src={selected.photoUrl} alt={selected.name} style={{ width: 110, height: 110, borderRadius: 24, objectFit: "cover" }} />
              <div><div className="tm3-eyebrow tm3-eyebrow--gold">Instructor profile</div><h2 style={{ marginBottom: 4 }}>{selected.name}</h2><p style={{ margin: 0, color: "var(--tm3-green-700)", fontWeight: 800 }}>{selected.designation}</p><p style={{ margin: "2px 0 0", color: "var(--tm3-muted)" }}>{selected.company}</p></div>
            </div>
            <div className="tm3-badge-row" style={{ marginBottom: 18 }}>{parseExpertise(selected.expertise).all.map((item) => <Badge tone="green" key={item}>{item}</Badge>)}</div>
            <p style={{ color: "var(--tm3-muted)", lineHeight: 1.75 }}>{selected.bio || "A detailed profile will be published shortly."}</p>
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
              {selected.email && <a className="tm3-button tm3-button--outline" href={`mailto:${selected.email}`}><Mail size={16} /> Email</a>}
              {selected.phone && <a className="tm3-button tm3-button--outline" href={`tel:${selected.phone}`}><Phone size={16} /> Call</a>}
              {selected.cvData && <a className="tm3-button tm3-button--dark" href={getPdfPreviewUrl(selected.cvData)} target="_blank" rel="noreferrer">View resume <ExternalLink size={16} /></a>}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
