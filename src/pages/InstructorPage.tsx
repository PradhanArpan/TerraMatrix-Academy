import { useEffect, useState } from "react";
import { ExternalLink, Mail, Phone, UserRound, X } from "lucide-react";
import { Badge, EmptyState, Metric, PageIntro } from "../components/Ui";
import { loadInstructors, type Instructor } from "../lib/catalogData";

function expertiseItems(value: string) {
  return value.split(/[,;\n]/).map((item) => item.trim()).filter(Boolean).slice(0, 6);
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
        eyebrow="Faculty and practitioners"
        title="Expertise that connects theory, tools and real practice."
        description="TerraMatrix instructors bring together academic depth, applied engineering experience, research capability and a commitment to learner-centred professional growth."
        aside={<Metric value={instructors.length} label="Active instructors" helper="Shared faculty directory" />}
      />

      <section className="tm3-catalogue">
        {instructors.length === 0 ? (
          <EmptyState icon="spark" title="The faculty directory is being prepared" description="Instructor profiles added by the academy will appear here automatically." />
        ) : (
          <div className="tm3-catalogue-grid">
            {instructors.map((instructor) => (
              <article className="tm3-content-card" key={instructor.id}>
                <div className="tm3-content-card__media" style={{ height: 290, backgroundImage: `linear-gradient(to top, rgba(6,31,26,.62), transparent 58%), url('${instructor.photoUrl}')`, backgroundPosition: "center 22%" }} />
                <div className="tm3-content-card__body">
                  <div>
                    <h3 style={{ fontSize: 23 }}>{instructor.name}</h3>
                    <p style={{ marginTop: 4, color: "var(--tm3-green-700)", fontWeight: 800 }}>{instructor.designation}</p>
                    <p style={{ marginTop: 2 }}>{instructor.company}</p>
                  </div>
                  <div className="tm3-badge-row">{expertiseItems(instructor.expertise).map((item) => <Badge key={item}>{item}</Badge>)}</div>
                  <p>{instructor.bio || "Profile details will be updated by the academy."}</p>
                  <div className="tm3-content-card__footer">
                    <span style={{ color: "var(--tm3-muted)", fontSize: 12 }}>Faculty profile</span>
                    <button className="tm3-button tm3-button--ghost" type="button" onClick={() => setSelected(instructor)}>View profile <UserRound size={16} /></button>
                  </div>
                </div>
              </article>
            ))}
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
            <div className="tm3-badge-row" style={{ marginBottom: 18 }}>{expertiseItems(selected.expertise).map((item) => <Badge tone="green" key={item}>{item}</Badge>)}</div>
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
