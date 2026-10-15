import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Award,
  BookMarked,
  BookOpen,
  Briefcase,
  Calculator,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Download,
  ExternalLink,
  FileCode,
  FileText,
  Filter,
  GraduationCap,
  Layers,
  MapPin,
  Maximize2,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { Badge, EmptyState, Metric, PageIntro } from "../components/Ui";
import {
  ENGINEERING_BRANCHES,
  AUTO_CALCULATORS,
  loadExamCalendars,
  loadOpportunities,
  loadStudyCodes,
  loadHandbooks,
  loadGlossaries,
  type EngineeringBranch,
  type ExamCalendarItem,
  type OpportunityItem,
  type StudyCodeItem,
  type HandbookItem,
  type GlossaryItem,
  type AutoCalculator,
} from "../lib/knowledgeHubData";

type HubTab = "calendars" | "opportunities" | "calculators" | "codes" | "handbooks" | "glossary";

export default function KnowledgeHub() {
  const [activeTab, setActiveTab] = useState<HubTab>("calendars");
  const [selectedBranch, setSelectedBranch] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Data sets from storage/defaults
  const [calendars, setCalendars] = useState<ExamCalendarItem[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [studyCodes, setStudyCodes] = useState<StudyCodeItem[]>([]);
  const [handbooks, setHandbooks] = useState<HandbookItem[]>([]);
  const [glossaries, setGlossaries] = useState<GlossaryItem[]>([]);

  // Modals
  const [selectedCode, setSelectedCode] = useState<StudyCodeItem | null>(null);
  const [selectedHandbook, setSelectedHandbook] = useState<HandbookItem | null>(null);

  // Active Calculator state
  const [activeCalcId, setActiveCalcId] = useState<string>(AUTO_CALCULATORS[0]?.id || "manning_flow");
  const [calcInputs, setCalcInputs] = useState<Record<string, number>>({});

  useEffect(() => {
    setCalendars(loadExamCalendars());
    setOpportunities(loadOpportunities());
    setStudyCodes(loadStudyCodes());
    setHandbooks(loadHandbooks());
    setGlossaries(loadGlossaries());
  }, []);

  const activeCalculator = useMemo(() => {
    return AUTO_CALCULATORS.find((c: AutoCalculator) => c.id === activeCalcId) || AUTO_CALCULATORS[0];
  }, [activeCalcId]);

  // Initialize inputs when calculator changes
  useEffect(() => {
    if (activeCalculator) {
      const defaults: Record<string, number> = {};
      activeCalculator.inputs.forEach((inp: { key: string; defaultValue: number }) => {
        defaults[inp.key] = inp.defaultValue;
      });
      setCalcInputs(defaults);
    }
  }, [activeCalculator]);

  // Compute live calculation
  const calcOutput = useMemo(() => {
    if (!activeCalculator) return null;
    return activeCalculator.calculate(calcInputs);
  }, [activeCalculator, calcInputs]);

  // Filtered lists
  const filteredCalendars = useMemo(() => {
    return calendars.filter((c) => {
      const matchBranch = selectedBranch === "All" || c.branch === selectedBranch;
      const matchQ =
        !searchQuery.trim() ||
        `${c.examName} ${c.conductingBody} ${c.department} ${c.eligibility}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      return matchBranch && matchQ;
    });
  }, [calendars, selectedBranch, searchQuery]);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((o) => {
      const matchBranch = selectedBranch === "All" || o.branch === selectedBranch;
      const matchQ =
        !searchQuery.trim() ||
        `${o.title} ${o.organization} ${o.specialization} ${o.location} ${o.type}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      return matchBranch && matchQ;
    });
  }, [opportunities, selectedBranch, searchQuery]);

  const filteredCodes = useMemo(() => {
    return studyCodes.filter((c) => {
      const matchBranch = selectedBranch === "All" || c.branch === selectedBranch;
      const matchQ =
        !searchQuery.trim() ||
        `${c.codeName} ${c.title} ${c.scopeSummary} ${c.standardBody}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      return matchBranch && matchQ;
    });
  }, [studyCodes, selectedBranch, searchQuery]);

  const filteredHandbooks = useMemo(() => {
    return handbooks.filter((h) => {
      const matchBranch = selectedBranch === "All" || h.branch === selectedBranch;
      const matchQ =
        !searchQuery.trim() ||
        `${h.title} ${h.authorOrBody} ${h.description}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      return matchBranch && matchQ;
    });
  }, [handbooks, selectedBranch, searchQuery]);

  const filteredGlossary = useMemo(() => {
    return glossaries.filter((g) => {
      const matchBranch = selectedBranch === "All" || g.branch === selectedBranch;
      const matchQ =
        !searchQuery.trim() ||
        `${g.term} ${g.department} ${g.specialization} ${g.definition}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      return matchBranch && matchQ;
    });
  }, [glossaries, selectedBranch, searchQuery]);

  return (
    <main>
      <PageIntro
        eyebrow="Open Engineering Knowledge Architecture"
        title="Knowledge Hub"
        description="Comprehensive repository of engineering exam calendars, verified research fellowships & internships, live auto-calculators, standard design study codes, handbooks, and specialized cross-disciplinary glossaries."
        aside={
          <div style={{ display: "grid", gap: 10 }}>
            <Metric value="100% Open" label="Candidate access" helper="Verifiable external references" />
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--tm3-muted)", fontWeight: 700 }}>
              <Sparkles size={14} style={{ color: "var(--tm3-lime)" }} /> Multi-Discipline Engineering & Sciences
            </div>
          </div>
        }
      />

      <section className="tm3-shell" style={{ marginBottom: 60 }}>
        {/* Navigation Tabs Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 14,
            marginBottom: 24,
            borderBottom: "1px solid var(--tm3-border)",
          }}
        >
          <button
            type="button"
            className={`tm3-button ${activeTab === "calendars" ? "tm3-button--dark" : "tm3-button--outline"}`}
            onClick={() => setActiveTab("calendars")}
            style={{ fontSize: "0.84rem", padding: "8px 16px", minHeight: 38 }}
          >
            <Calendar size={15} /> Exam Calendars ({calendars.length})
          </button>
          <button
            type="button"
            className={`tm3-button ${activeTab === "opportunities" ? "tm3-button--dark" : "tm3-button--outline"}`}
            onClick={() => setActiveTab("opportunities")}
            style={{ fontSize: "0.84rem", padding: "8px 16px", minHeight: 38 }}
          >
            <Briefcase size={15} /> Internships & Competitions ({opportunities.length})
          </button>
          <button
            type="button"
            className={`tm3-button ${activeTab === "calculators" ? "tm3-button--dark" : "tm3-button--outline"}`}
            onClick={() => setActiveTab("calculators")}
            style={{ fontSize: "0.84rem", padding: "8px 16px", minHeight: 38 }}
          >
            <Calculator size={15} /> Auto Calculators ({AUTO_CALCULATORS.length})
          </button>
          <button
            type="button"
            className={`tm3-button ${activeTab === "codes" ? "tm3-button--dark" : "tm3-button--outline"}`}
            onClick={() => setActiveTab("codes")}
            style={{ fontSize: "0.84rem", padding: "8px 16px", minHeight: 38 }}
          >
            <FileCode size={15} /> Study Codes ({studyCodes.length})
          </button>
          <button
            type="button"
            className={`tm3-button ${activeTab === "handbooks" ? "tm3-button--dark" : "tm3-button--outline"}`}
            onClick={() => setActiveTab("handbooks")}
            style={{ fontSize: "0.84rem", padding: "8px 16px", minHeight: 38 }}
          >
            <BookMarked size={15} /> Handbooks ({handbooks.length})
          </button>
          <button
            type="button"
            className={`tm3-button ${activeTab === "glossary" ? "tm3-button--dark" : "tm3-button--outline"}`}
            onClick={() => setActiveTab("glossary")}
            style={{ fontSize: "0.84rem", padding: "8px 16px", minHeight: 38 }}
          >
            <BookOpen size={15} /> Technical Glossaries ({glossaries.length})
          </button>
        </div>

        {/* Filters & Search Row (for lists) */}
        {activeTab !== "calculators" && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 14,
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--tm3-text-soft)", marginRight: 4 }}>
                Branch:
              </span>
              <button
                type="button"
                className={`tm3-button ${selectedBranch === "All" ? "tm3-button--dark" : "tm3-button--ghost"}`}
                onClick={() => setSelectedBranch("All")}
                style={{ fontSize: "0.76rem", padding: "4px 10px", minHeight: 28 }}
              >
                All Branches
              </button>
              {ENGINEERING_BRANCHES.map((b: string) => (
                <button
                  key={b}
                  type="button"
                  className={`tm3-button ${selectedBranch === b ? "tm3-button--dark" : "tm3-button--ghost"}`}
                  onClick={() => setSelectedBranch(b)}
                  style={{ fontSize: "0.76rem", padding: "4px 10px", minHeight: 28 }}
                >
                  {b.split("&")[0].trim()}
                </button>
              ))}
            </div>

            <div style={{ minWidth: 260 }}>
              <div style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--tm3-text-soft)" }} />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: 30, height: 34, fontSize: "0.8rem", width: "100%", borderRadius: 8 }}
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 1: EXAM CALENDARS (Compact Rows)
            ========================================================================= */}
        {activeTab === "calendars" && (
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "var(--tm3-ink)" }}>
                National Engineering & Scientific Examination Calendars
              </h3>
              <span style={{ fontSize: "0.76rem", color: "var(--tm3-text-soft)" }}>
                Showing {filteredCalendars.length} exams with verified official portals
              </span>
            </div>

            {filteredCalendars.map((item) => (
              <article
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 16,
                  padding: "14px 20px",
                  borderRadius: 12,
                  background: "var(--tm3-surface)",
                  border: "1px solid var(--tm3-border)",
                  boxShadow: "var(--tm3-shadow-sm)",
                }}
              >
                {/* Left: Exam title & Department */}
                <div style={{ flex: "1 1 360px", minWidth: 260 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <Badge tone={item.status === "Active Registration" ? "green" : "neutral"}>
                      {item.status}
                    </Badge>
                    <span style={{ fontSize: "0.72rem", color: "var(--tm3-primary)", fontWeight: 700 }}>
                      {item.conductingBody}
                    </span>
                  </div>
                  <h4 style={{ margin: "0 0 4px", fontSize: "1.02rem", fontWeight: 800, color: "var(--tm3-ink)" }}>
                    {item.examName}
                  </h4>
                  <div style={{ fontSize: "0.78rem", color: "var(--tm3-text-soft)", display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <span><strong>Branch:</strong> {item.branch}</span>
                    <span>•</span>
                    <span><strong>Department:</strong> {item.department}</span>
                    <span>•</span>
                    <span><strong>Eligibility:</strong> {item.eligibility}</span>
                  </div>
                </div>

                {/* Middle: Key Dates */}
                <div style={{ display: "flex", gap: 16, alignItems: "center", fontSize: "0.8rem" }}>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "0.68rem", textTransform: "uppercase", color: "var(--tm3-text-soft)", display: "block" }}>
                      Application Window
                    </span>
                    <strong style={{ color: "var(--tm3-ink)" }}>{item.applicationWindow}</strong>
                  </div>
                  <div style={{ height: 28, width: 1, background: "var(--tm3-border)" }} />
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "0.68rem", textTransform: "uppercase", color: "var(--tm3-text-soft)", display: "block" }}>
                      Exam Date
                    </span>
                    <strong style={{ color: "var(--tm3-primary)" }}>{item.examDate}</strong>
                  </div>
                </div>

                {/* Right: Verifiable Action Link */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <a
                    href={item.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tm3-button tm3-button--dark"
                    style={{ fontSize: "0.78rem", padding: "6px 14px", minHeight: 34, gap: 6 }}
                  >
                    Official Portal <ArrowUpRight size={13} />
                  </a>
                </div>
              </article>
            ))}

            {filteredCalendars.length === 0 && (
              <EmptyState
                icon="calendar"
                title="No exam calendars found"
                description="Try switching branches or clearing your search filter."
              />
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: INTERNSHIPS, FELLOWSHIPS & COMPETITIONS (Compact Rows)
            ========================================================================= */}
        {activeTab === "opportunities" && (
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "var(--tm3-ink)" }}>
                Verified Internships, Fellowships & Engineering Competitions
              </h3>
              <span style={{ fontSize: "0.76rem", color: "var(--tm3-text-soft)" }}>
                Showing {filteredOpportunities.length} opportunities with direct institutional application portals
              </span>
            </div>

            {filteredOpportunities.map((item) => (
              <article
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 16,
                  padding: "16px 20px",
                  borderRadius: 12,
                  background: "var(--tm3-surface)",
                  border: "1px solid var(--tm3-border)",
                  boxShadow: "var(--tm3-shadow-sm)",
                }}
              >
                {/* Left: Info & Organization */}
                <div style={{ flex: "1 1 380px", minWidth: 260 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <Badge tone="green">{item.type}</Badge>
                    <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--tm3-primary)" }}>
                      {item.organization}
                    </span>
                    {item.verified && (
                      <span style={{ fontSize: "0.7rem", color: "#10b981", display: "inline-flex", alignItems: "center", gap: 3, fontWeight: 700 }}>
                        <CheckCircle2 size={12} /> Verified
                      </span>
                    )}
                  </div>
                  <h4 style={{ margin: "0 0 4px", fontSize: "1.04rem", fontWeight: 800, color: "var(--tm3-ink)" }}>
                    {item.title}
                  </h4>
                  <p style={{ margin: "0 0 8px", fontSize: "0.8rem", color: "var(--tm3-text-soft)", lineHeight: 1.4 }}>
                    {item.description}
                  </p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: "0.74rem", color: "var(--tm3-text-soft)" }}>
                    <span><strong>Specialization:</strong> {item.specialization}</span>
                    <span>•</span>
                    <span><MapPin size={11} style={{ display: "inline" }} /> {item.location} ({item.mode})</span>
                    <span>•</span>
                    <span><strong>Eligibility:</strong> {item.eligibility}</span>
                  </div>
                </div>

                {/* Middle: Stipend & Deadline */}
                <div style={{ display: "flex", gap: 16, alignItems: "center", fontSize: "0.8rem" }}>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "0.68rem", textTransform: "uppercase", color: "var(--tm3-text-soft)", display: "block" }}>
                      Stipend / Prize
                    </span>
                    <strong style={{ color: "var(--tm3-primary)" }}>{item.stipendOrPrize}</strong>
                  </div>
                  <div style={{ height: 28, width: 1, background: "var(--tm3-border)" }} />
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "0.68rem", textTransform: "uppercase", color: "var(--tm3-text-soft)", display: "block" }}>
                      Deadline
                    </span>
                    <strong style={{ color: "var(--tm3-ink)" }}>{item.deadline}</strong>
                  </div>
                </div>

                {/* Right: Apply */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <a
                    href={item.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tm3-button tm3-button--gold"
                    style={{ fontSize: "0.8rem", padding: "8px 16px", minHeight: 36, gap: 6 }}
                  >
                    Apply on Official Portal <ArrowUpRight size={14} />
                  </a>
                </div>
              </article>
            ))}

            {filteredOpportunities.length === 0 && (
              <EmptyState
                icon="spark"
                title="No opportunities found"
                description="Try switching branches or clearing your search filter."
              />
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3: AUTO CALCULATORS (Interactive Simulation)
            ========================================================================= */}
        {activeTab === "calculators" && activeCalculator && (
          <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, alignItems: "flex-start" }}>
            {/* Left Calculator Selector list */}
            <div style={{ display: "grid", gap: 6, background: "var(--tm3-surface)", padding: 14, borderRadius: 14, border: "1px solid var(--tm3-border)" }}>
              <span className="tm3-eyebrow" style={{ marginBottom: 6, display: "block" }}>
                Interactive Calculators
              </span>
              {AUTO_CALCULATORS.map((calc: AutoCalculator) => (
                <button
                  key={calc.id}
                  type="button"
                  className={`tm3-button ${activeCalcId === calc.id ? "tm3-button--dark" : "tm3-button--ghost"}`}
                  onClick={() => setActiveCalcId(calc.id)}
                  style={{ justifyContent: "flex-start", textAlign: "left", padding: "10px 12px", minHeight: "auto", fontSize: "0.82rem" }}
                >
                  <div style={{ width: "100%" }}>
                    <div style={{ fontWeight: 700 }}>{calc.name}</div>
                    <small style={{ fontSize: "0.7rem", opacity: 0.8, display: "block" }}>{calc.branch}</small>
                  </div>
                </button>
              ))}
            </div>

            {/* Right Interactive Calculator Box */}
            <div
              style={{
                borderRadius: 16,
                background: "var(--tm3-surface)",
                border: "1px solid var(--tm3-border)",
                padding: 24,
                boxShadow: "var(--tm3-shadow-sm)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <Badge tone="green">{activeCalculator.branch}</Badge>
                  <h3 style={{ margin: "6px 0 2px", fontSize: "1.3rem", fontWeight: 800, color: "var(--tm3-ink)" }}>
                    {activeCalculator.name}
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.84rem", color: "var(--tm3-text-soft)" }}>
                    {activeCalculator.description}
                  </p>
                </div>
                <div style={{ padding: "6px 12px", borderRadius: 8, background: "var(--tm3-surface-muted)", fontFamily: "monospace", fontSize: "0.82rem", fontWeight: 700, color: "var(--tm3-primary)" }}>
                  {activeCalculator.formula}
                </div>
              </div>

              {/* Input Form Controls */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, margin: "20px 0" }}>
                {activeCalculator.inputs.map((inp: { key: string; label: string; unit: string; defaultValue: number; step?: number }) => (
                  <div key={inp.key} className="tm3-field" style={{ margin: 0 }}>
                    <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 700 }}>
                      <span>{inp.label}</span>
                      <span style={{ color: "var(--tm3-text-soft)" }}>[{inp.unit}]</span>
                    </label>
                    <input
                      type="number"
                      step={inp.step || 0.01}
                      value={calcInputs[inp.key] ?? inp.defaultValue}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setCalcInputs((prev) => ({ ...prev, [inp.key]: isNaN(val) ? 0 : val }));
                      }}
                      style={{ height: 38, fontSize: "0.88rem" }}
                    />
                    <small style={{ fontSize: "0.7rem", color: "var(--tm3-text-soft)" }}>
                      Default: {inp.defaultValue} {inp.unit}
                    </small>
                  </div>
                ))}
              </div>

              {/* Calculated Outputs Panel */}
              {calcOutput && (
                <div style={{ padding: 20, borderRadius: 14, background: "rgba(16, 185, 129, 0.07)", border: "1px solid rgba(16, 185, 129, 0.25)", marginTop: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 800, color: "var(--tm3-primary)", display: "block" }}>
                        Computed Result ({calcOutput.resultLabel})
                      </span>
                      <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--tm3-primary)", marginTop: 2 }}>
                        {calcOutput.value} <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>{calcOutput.unit}</span>
                      </div>
                    </div>
                  </div>

                  {calcOutput.steps && calcOutput.steps.length > 0 && (
                    <div style={{ marginTop: 14, borderTop: "1px dashed rgba(16, 185, 129, 0.25)", paddingTop: 12 }}>
                      <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--tm3-ink)", display: "block", marginBottom: 6 }}>
                        Breakdown & Derived Values:
                      </span>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.8rem", color: "var(--tm3-text)", display: "grid", gap: 4 }}>
                        {calcOutput.steps.map((det: string, idx: number) => (
                          <li key={idx}>{det}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: STUDY CODES (IS 456, IS 1893, IS 800, IRC 112)
            ========================================================================= */}
        {activeTab === "codes" && (
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "var(--tm3-ink)" }}>
                Authoritative Engineering Codes of Practice
              </h3>
              <span style={{ fontSize: "0.76rem", color: "var(--tm3-text-soft)" }}>
                Showing {filteredCodes.length} national & international standards with clause breakdowns
              </span>
            </div>

            {filteredCodes.map((item) => (
              <article
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 16,
                  padding: "16px 20px",
                  borderRadius: 12,
                  background: "var(--tm3-surface)",
                  border: "1px solid var(--tm3-border)",
                  boxShadow: "var(--tm3-shadow-sm)",
                }}
              >
                <div style={{ flex: "1 1 450px", minWidth: 260 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <Badge tone="green">{item.standardBody}</Badge>
                    <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--tm3-primary)" }}>
                      {item.branch} • {item.department}
                    </span>
                  </div>
                  <h4 style={{ margin: "0 0 4px", fontSize: "1.08rem", fontWeight: 800, color: "var(--tm3-ink)" }}>
                    {item.codeName}: {item.title}
                  </h4>
                  <p style={{ margin: "0 0 8px", fontSize: "0.82rem", color: "var(--tm3-text-soft)", lineHeight: 1.45 }}>
                    {item.scopeSummary}
                  </p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {item.keyClauses.slice(0, 3).map((cl, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: "0.7rem",
                          background: "var(--tm3-surface-muted)",
                          padding: "2px 8px",
                          borderRadius: 6,
                          fontWeight: 600,
                          color: "var(--tm3-text)",
                        }}
                      >
                        {cl.clause}: {cl.title}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <button
                    type="button"
                    className="tm3-button tm3-button--gold"
                    onClick={() => setSelectedCode(item)}
                    style={{ fontSize: "0.8rem", padding: "8px 16px", minHeight: 36 }}
                  >
                    <FileText size={14} /> Read Key Clauses
                  </button>
                  <a
                    href={item.verifiableRefUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tm3-button tm3-button--outline"
                    style={{ fontSize: "0.8rem", padding: "8px 12px", minHeight: 36 }}
                    title="View official publisher catalog entry"
                  >
                    <ExternalLink size={14} /> Official Ref
                  </a>
                </div>
              </article>
            ))}

            {filteredCodes.length === 0 && (
              <EmptyState
                icon="book"
                title="No study codes found"
                description="Try switching branches or clearing your search filter."
              />
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 5: HANDBOOKS & MANUALS
            ========================================================================= */}
        {activeTab === "handbooks" && (
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "var(--tm3-ink)" }}>
                Standard Engineering Handbooks & Design Aids
              </h3>
              <span style={{ fontSize: "0.76rem", color: "var(--tm3-text-soft)" }}>
                Showing {filteredHandbooks.length} authoritative design handbooks
              </span>
            </div>

            {filteredHandbooks.map((item) => (
              <article
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 16,
                  padding: "16px 20px",
                  borderRadius: 12,
                  background: "var(--tm3-surface)",
                  border: "1px solid var(--tm3-border)",
                  boxShadow: "var(--tm3-shadow-sm)",
                }}
              >
                <div style={{ flex: "1 1 450px", minWidth: 260 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <Badge tone="green">{item.edition}</Badge>
                    <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--tm3-primary)" }}>
                      {item.authorOrBody} • {item.branch}
                    </span>
                  </div>
                  <h4 style={{ margin: "0 0 4px", fontSize: "1.08rem", fontWeight: 800, color: "var(--tm3-ink)" }}>
                    {item.title}
                  </h4>
                  <p style={{ margin: "0 0 8px", fontSize: "0.82rem", color: "var(--tm3-text-soft)", lineHeight: 1.45 }}>
                    {item.description}
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: "0.72rem", color: "var(--tm3-text-soft)" }}>
                    <span><strong>Department:</strong> {item.department}</span>
                    <span>•</span>
                    <span><strong>Reference Duration:</strong> {item.readTime}</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <button
                    type="button"
                    className="tm3-button tm3-button--gold"
                    onClick={() => setSelectedHandbook(item)}
                    style={{ fontSize: "0.8rem", padding: "8px 16px", minHeight: 36 }}
                  >
                    <BookOpen size={14} /> View Handbook Summary
                  </button>
                </div>
              </article>
            ))}

            {filteredHandbooks.length === 0 && (
              <EmptyState
                icon="book"
                title="No handbooks found"
                description="Try switching branches or clearing your search filter."
              />
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 6: TECHNICAL GLOSSARIES
            ========================================================================= */}
        {activeTab === "glossary" && (
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "var(--tm3-ink)" }}>
                Cross-Disciplinary Engineering Glossaries
              </h3>
              <span style={{ fontSize: "0.76rem", color: "var(--tm3-text-soft)" }}>
                Showing {filteredGlossary.length} defined terms with mathematical formulations & SI units
              </span>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {filteredGlossary.map((item) => (
                <article
                  key={item.id}
                  style={{
                    padding: "16px 20px",
                    borderRadius: 12,
                    background: "var(--tm3-surface)",
                    border: "1px solid var(--tm3-border)",
                    boxShadow: "var(--tm3-shadow-sm)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 10, marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "var(--tm3-primary)" }}>
                        {item.term}
                      </h4>
                      <Badge tone="neutral">{item.department} → {item.specialization}</Badge>
                    </div>
                    {item.siUnit && (
                      <span style={{ fontSize: "0.78rem", color: "var(--tm3-text-soft)", fontFamily: "monospace", background: "var(--tm3-surface-muted)", padding: "2px 8px", borderRadius: 6 }}>
                        SI Unit: <strong>{item.siUnit}</strong>
                      </span>
                    )}
                  </div>

                  <p style={{ margin: "0 0 10px", fontSize: "0.85rem", color: "var(--tm3-ink)", lineHeight: 1.5 }}>
                    {item.definition}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, fontSize: "0.8rem" }}>
                    {item.formula ? (
                      <div style={{ fontFamily: "monospace", color: "var(--tm3-primary)", fontWeight: 700, background: "rgba(16,185,129,.08)", padding: "4px 10px", borderRadius: 6 }}>
                        {item.formula}
                      </div>
                    ) : <span />}
                    <div style={{ color: "var(--tm3-text-soft)", fontSize: "0.75rem" }}>
                      <strong>Significance:</strong> {item.significance}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredGlossary.length === 0 && (
              <EmptyState
                icon="book"
                title="No glossary terms found"
                description="Try switching branches or clearing your search filter."
              />
            )}
          </div>
        )}
      </section>

      {/* =========================================================================
          STUDY CODE CLAUSES MODAL
          ========================================================================= */}
      {selectedCode && (
        <div className="tm3-modal-backdrop" style={{ zIndex: 1300 }} role="presentation">
          <div
            className="tm3-modal"
            style={{ maxWidth: 800, maxHeight: "88vh", display: "flex", flexDirection: "column" }}
            role="dialog"
            aria-modal="true"
          >
            <div className="tm3-modal__head" style={{ borderBottom: "1px solid var(--tm3-border)", paddingBottom: 12 }}>
              <div>
                <span className="tm3-eyebrow">{selectedCode.standardBody} Reference</span>
                <h2 style={{ fontSize: "1.2rem", margin: "4px 0 0" }}>{selectedCode.codeName}: {selectedCode.title}</h2>
              </div>
              <button type="button" onClick={() => setSelectedCode(null)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div style={{ overflowY: "auto", padding: "16px 0", display: "grid", gap: 16 }}>
              <div style={{ padding: 12, borderRadius: 10, background: "var(--tm3-surface-muted)", fontSize: "0.84rem", lineHeight: 1.5 }}>
                <strong>Scope & Code Objective:</strong> {selectedCode.scopeSummary}
              </div>

              <h4 style={{ margin: "4px 0 0", fontSize: "0.95rem", fontWeight: 800 }}>
                Essential Provisions & Critical Engineering Clauses
              </h4>

              <div style={{ display: "grid", gap: 12 }}>
                {selectedCode.keyClauses.map((clause, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 14,
                      borderRadius: 10,
                      background: "var(--tm3-surface)",
                      border: "1px solid var(--tm3-border)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontWeight: 800, color: "var(--tm3-primary)", fontSize: "0.85rem" }}>
                        Clause {clause.clause}
                      </span>
                      <strong style={{ fontSize: "0.88rem", color: "var(--tm3-ink)" }}>
                        {clause.title}
                      </strong>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--tm3-text)", lineHeight: 1.5 }}>
                      {clause.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="tm3-modal__actions" style={{ borderTop: "1px solid var(--tm3-border)", paddingTop: 14 }}>
              <button className="tm3-button tm3-button--outline" type="button" onClick={() => setSelectedCode(null)}>
                Close Reader
              </button>
              <a
                href={selectedCode.verifiableRefUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tm3-button tm3-button--dark"
                style={{ gap: 6 }}
              >
                Official BIS / IRC Catalog Entry <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          HANDBOOK CHAPTER SUMMARY MODAL
          ========================================================================= */}
      {selectedHandbook && (
        <div className="tm3-modal-backdrop" style={{ zIndex: 1300 }} role="presentation">
          <div
            className="tm3-modal"
            style={{ maxWidth: 800, maxHeight: "88vh", display: "flex", flexDirection: "column" }}
            role="dialog"
            aria-modal="true"
          >
            <div className="tm3-modal__head" style={{ borderBottom: "1px solid var(--tm3-border)", paddingBottom: 12 }}>
              <div>
                <span className="tm3-eyebrow">{selectedHandbook.authorOrBody}</span>
                <h2 style={{ fontSize: "1.2rem", margin: "4px 0 0" }}>{selectedHandbook.title}</h2>
              </div>
              <button type="button" onClick={() => setSelectedHandbook(null)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div style={{ overflowY: "auto", padding: "16px 0", display: "grid", gap: 16 }}>
              <div style={{ padding: 12, borderRadius: 10, background: "var(--tm3-surface-muted)", fontSize: "0.84rem", lineHeight: 1.5 }}>
                {selectedHandbook.description}
              </div>

              {selectedHandbook.keyFormulas && selectedHandbook.keyFormulas.length > 0 && (
                <div>
                  <h4 style={{ margin: "0 0 8px", fontSize: "0.92rem", fontWeight: 800 }}>Key Equations & Formula Cards:</h4>
                  <div style={{ display: "grid", gap: 6 }}>
                    {selectedHandbook.keyFormulas.map((f, idx) => (
                      <div key={idx} style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(16,185,129,.07)", fontFamily: "monospace", fontSize: "0.82rem", fontWeight: 700, color: "var(--tm3-primary)" }}>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h4 style={{ margin: "4px 0 0", fontSize: "0.95rem", fontWeight: 800 }}>
                Chapter Summaries & Design Tables
              </h4>

              <div style={{ display: "grid", gap: 10 }}>
                {selectedHandbook.chapters.map((ch, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      background: "var(--tm3-surface)",
                      border: "1px solid var(--tm3-border)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <strong style={{ fontSize: "0.88rem", color: "var(--tm3-ink)" }}>{ch.title}</strong>
                      <span style={{ fontSize: "0.72rem", color: "var(--tm3-text-soft)" }}>Pages {ch.pages}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--tm3-text)", lineHeight: 1.45 }}>
                      {ch.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="tm3-modal__actions" style={{ borderTop: "1px solid var(--tm3-border)", paddingTop: 14 }}>
              <button className="tm3-button tm3-button--outline" type="button" onClick={() => setSelectedHandbook(null)}>
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
