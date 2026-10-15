import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  FileQuestion,
  Filter,
  HelpCircle,
  Layers,
  Lock,
  Play,
  RotateCcw,
  Search,
  Shuffle,
  Sparkles,
  Unlock,
  X,
  XCircle,
} from "lucide-react";
import { Badge, EmptyState, Metric, PageIntro } from "../components/Ui";
import {
  loadExamTracks,
  loadExamQuestions,
  getRandomCbtQuestions,
  shuffleQuestions,
  saveUserExamAttempt,
  loadUserExamAttempts,
  type ExamTrack,
  type ExamQuestion,
  type ExamTrackId,
  type ExamAttemptResult,
  type ExamHeadCategory,
} from "../lib/examBankData";

type QuestionStatus = "not_visited" | "not_answered" | "answered" | "marked_for_review";

const EXAM_HEAD_ORDER: ExamHeadCategory[] = [
  "GATE (National Level)",
  "UPSC ESE / IES",
  "State AE / JE & SSC",
  "Research & PSUs (ISRO/BARC)",
  "Campus Placement & Viva",
  "Engineering Aptitude",
];

export default function ExamPractice() {
  const [tracks, setTracks] = useState<ExamTrack[]>([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [studentLogin, setStudentLogin] = useState<{ email: string; name?: string } | null>(null);

  // CBT Modal State
  const [cbtTrack, setCbtTrack] = useState<ExamTrack | null>(null);
  const [cbtQuestions, setCbtQuestions] = useState<ExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [reviewedIds, setReviewedIds] = useState<Record<string, boolean>>({});
  const [visitedIds, setVisitedIds] = useState<Record<string, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(1800); // 30 mins
  const [isCbtOpen, setIsCbtOpen] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [examResult, setExamResult] = useState<ExamAttemptResult | null>(null);
  const [confirmExitOpen, setConfirmExitOpen] = useState(false);

  useEffect(() => {
    setTracks(loadExamTracks());
    const raw =
      localStorage.getItem("terramatrix_student_login") ||
      sessionStorage.getItem("terramatrix_student_login");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.email) setStudentLogin(parsed);
      } catch {
        setStudentLogin(null);
      }
    }
  }, []);

  // Timer effect for CBT modal
  useEffect(() => {
    if (!isCbtOpen || isResultOpen) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isCbtOpen, isResultOpen, userAnswers]);

  // Discipline options
  const disciplines = useMemo(() => {
    return [
      "All",
      "All Engineering",
      "Civil & Infrastructure",
      "Mechanical & Aerospace",
      "Computer Science & AI",
      "Electrical & Electronics",
      "General Aptitude",
    ];
  }, []);

  const filteredTracks = useMemo(() => {
    return tracks.filter((t) => {
      const matchDiscipline =
        selectedDiscipline === "All" || t.discipline === selectedDiscipline;
      const matchSearch =
        !searchQuery.trim() ||
        `${t.name} ${t.headline} ${t.description} ${t.headCategory} ${t.topics.join(" ")}`
          .toLowerCase()
          .includes(searchQuery.trim().toLowerCase());
      return matchDiscipline && matchSearch;
    });
  }, [tracks, selectedDiscipline, searchQuery]);

  // Group filtered tracks by Head Category
  const groupedTracks = useMemo(() => {
    const groups: { head: ExamHeadCategory; tracks: ExamTrack[] }[] = [];
    EXAM_HEAD_ORDER.forEach((head) => {
      const matching = filteredTracks.filter((t) => t.headCategory === head);
      if (matching.length > 0) {
        groups.push({ head, tracks: matching });
      }
    });
    // Check if any leftover tracks exist
    const leftover = filteredTracks.filter(
      (t) => !EXAM_HEAD_ORDER.includes(t.headCategory as ExamHeadCategory)
    );
    if (leftover.length > 0) {
      groups.push({ head: "Other Examinations" as ExamHeadCategory, tracks: leftover });
    }
    return groups;
  }, [filteredTracks]);

  // Launch CBT Exam with Randomized Questions & Options
  const launchCbt = (track: ExamTrack, sampleOnly: boolean = false) => {
    let questions: ExamQuestion[];
    if (!studentLogin && sampleOnly) {
      const samplePool = loadExamQuestions(track.id).filter((q) => q.isSample);
      questions = shuffleQuestions(samplePool);
    } else {
      questions = getRandomCbtQuestions(track.id, 15);
    }
    if (questions.length === 0) return;

    setCbtTrack(track);
    setCbtQuestions(questions);
    setCurrentIndex(0);
    setUserAnswers({});
    setReviewedIds({});
    setVisitedIds({ [questions[0].id]: true });
    setSecondsRemaining((track.durationMinutes || 30) * 60);
    setIsResultOpen(false);
    setConfirmExitOpen(false);
    setIsCbtOpen(true);
  };

  // Select Option
  const handleSelectOption = (qId: string, optIndex: number) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: optIndex }));
  };

  const handleClearOption = (qId: string) => {
    setUserAnswers((prev) => {
      const next = { ...prev };
      delete next[qId];
      return next;
    });
  };

  const toggleMarkForReview = (qId: string) => {
    setReviewedIds((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < cbtQuestions.length) {
      setCurrentIndex(index);
      const targetId = cbtQuestions[index].id;
      setVisitedIds((prev) => ({ ...prev, [targetId]: true }));
    }
  };

  const handleSaveAndNext = () => {
    if (currentIndex < cbtQuestions.length - 1) {
      goToQuestion(currentIndex + 1);
    }
  };

  const submitExam = () => {
    if (!cbtTrack) return;
    let score = 0;
    const answersRecord: Record<string, { selected: number; correct: number; isCorrect: boolean }> = {};

    cbtQuestions.forEach((q) => {
      const selected = userAnswers[q.id];
      const isAnswered = selected !== undefined;
      const isCorrect = isAnswered && selected === q.correctIndex;

      if (isAnswered) {
        if (isCorrect) score += 1;
        else score = Math.max(0, score - 0.33); // standard negative marking
      }

      answersRecord[q.id] = {
        selected: isAnswered ? selected : -1,
        correct: q.correctIndex,
        isCorrect: isCorrect,
      };
    });

    const roundedScore = Math.round(score * 100) / 100;
    const percentage = Math.round((roundedScore / cbtQuestions.length) * 100);
    const totalTimeSpent = (cbtTrack.durationMinutes || 30) * 60 - secondsRemaining;

    const result: ExamAttemptResult = {
      id: `attempt_${Date.now()}`,
      userEmail: studentLogin?.email || "anonymous_student@terramatrix.academy",
      trackId: cbtTrack.id,
      topic: cbtTrack.name,
      totalQuestions: cbtQuestions.length,
      score: roundedScore,
      percentage: Math.max(0, percentage),
      timeSpentSeconds: Math.max(1, totalTimeSpent),
      date: new Date().toISOString(),
      answers: answersRecord,
    };

    saveUserExamAttempt(result);
    setExamResult(result);
    setIsResultOpen(true);
  };

  // Helper formatting seconds
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Current Question Object
  const currentQ = cbtQuestions[currentIndex];

  // Palette Status Resolver
  const getQuestionStatus = (q: ExamQuestion): QuestionStatus => {
    const isAnswered = userAnswers[q.id] !== undefined;
    const isReviewed = reviewedIds[q.id];
    const isVisited = visitedIds[q.id];

    if (isReviewed) return "marked_for_review";
    if (isAnswered) return "answered";
    if (isVisited) return "not_answered";
    return "not_visited";
  };

  const paletteCounts = useMemo(() => {
    let answered = 0;
    let marked = 0;
    let notAnswered = 0;
    let notVisited = 0;

    cbtQuestions.forEach((q) => {
      const status = getQuestionStatus(q);
      if (status === "answered") answered++;
      else if (status === "marked_for_review") marked++;
      else if (status === "not_answered") notAnswered++;
      else notVisited++;
    });

    return { answered, marked, notAnswered, notVisited };
  }, [cbtQuestions, userAnswers, reviewedIds, visitedIds]);

  return (
    <main>
      <PageIntro
        eyebrow="Standardized Engineering Assessment"
        title="Examination & CBT Simulator"
        description="Authentic Computer-Based Test (CBT) environment modeled after official IIT GATE, UPSC ESE, State PSC, and PSU examination consoles. Select from branch-specific model papers with instant automated scoring, question palettes, timer controls, and detailed mathematical derivations."
        aside={
          <div style={{ display: "grid", gap: 10 }}>
            <Metric value="100% Free" label="Candidate access" helper="Fresh questions on every run" />
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--tm3-muted)", fontWeight: 700 }}>
              <Sparkles size={14} style={{ color: "var(--tm3-lime)" }} /> Official IIT / UPSC Question Architecture
            </div>
          </div>
        }
      />

      {/* Main Container */}
      <section className="tm3-shell" style={{ marginBottom: 60 }}>
        {/* Discipline Filters & Search */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, marginBottom: 28 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {disciplines.map((d) => (
              <button
                key={d}
                type="button"
                className={`tm3-button ${selectedDiscipline === d ? "tm3-button--dark" : "tm3-button--outline"}`}
                onClick={() => setSelectedDiscipline(d)}
                style={{ fontSize: "0.8rem", padding: "6px 14px", minHeight: 34 }}
              >
                {d === "All" ? "All Engineering Branches" : d}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 280 }}>
            <div className="tm3-field" style={{ margin: 0, width: "100%" }}>
              <div style={{ position: "relative" }}>
                <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--tm3-text-soft)" }} />
                <input
                  type="text"
                  placeholder="Search model papers, topics, formulas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: 34, height: 36, fontSize: "0.82rem" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section Heading: Model Papers */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "2px solid var(--tm3-border)", paddingBottom: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "var(--tm3-ink)" }}>
              Model Papers
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "0.84rem", color: "var(--tm3-text-soft)" }}>
              Categorized by national examination bodies and competitive tracks. Practice repeatedly with randomized question sets.
            </p>
          </div>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--tm3-primary)", background: "rgba(16,185,129,.1)", padding: "4px 10px", borderRadius: 8 }}>
            {filteredTracks.length} Papers Available
          </span>
        </div>

        {/* Categorized Model Papers in Sleek Compact Rows */}
        <div style={{ display: "grid", gap: 32 }}>
          {groupedTracks.map(({ head, tracks: categoryTracks }) => (
            <div key={head} style={{ display: "grid", gap: 12 }}>
              {/* Category Head Banner */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", background: "var(--tm3-surface-muted)", borderRadius: 10, borderLeft: "4px solid var(--tm3-primary)" }}>
                <Compass size={16} style={{ color: "var(--tm3-primary)" }} />
                <h3 style={{ margin: 0, fontSize: "0.98rem", fontWeight: 800, color: "var(--tm3-ink)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                  {head}
                </h3>
                <span style={{ marginLeft: "auto", fontSize: "0.74rem", fontWeight: 700, color: "var(--tm3-text-soft)" }}>
                  {categoryTracks.length} {categoryTracks.length === 1 ? "Paper" : "Papers"}
                </span>
              </div>

              {/* Compact Rows */}
              <div style={{ display: "grid", gap: 10 }}>
                {categoryTracks.map((track) => (
                  <article
                    key={track.id}
                    style={{
                      borderRadius: 14,
                      background: "var(--tm3-surface)",
                      border: "1px solid var(--tm3-border)",
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 20,
                      flexWrap: "wrap",
                      boxShadow: "var(--tm3-shadow-sm)",
                      transition: "border-color .15s, transform .15s",
                    }}
                  >
                    {/* Left: Info & Badges */}
                    <div style={{ flex: "1 1 500px", minWidth: 280 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                        <Badge tone="green">{track.discipline}</Badge>
                        <span style={{ fontSize: "0.74rem", color: "var(--tm3-text-soft)", display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock size={12} /> {track.durationMinutes} Mins · 15 Qs · +1 / -0.33
                        </span>
                      </div>

                      <h4 style={{ margin: "0 0 4px", fontSize: "1.08rem", fontWeight: 800, color: "var(--tm3-ink)", lineHeight: 1.3 }}>
                        {track.name}
                      </h4>
                      <p style={{ margin: "0 0 10px", fontSize: "0.82rem", color: "var(--tm3-text-soft)", lineHeight: 1.45 }}>
                        {track.description}
                      </p>

                      {/* Topic chips */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {track.topics.slice(0, 4).map((top) => (
                          <span
                            key={top}
                            style={{
                              padding: "2px 8px",
                              borderRadius: 6,
                              background: "var(--tm3-surface-muted)",
                              color: "var(--tm3-text)",
                              fontSize: "0.7rem",
                              fontWeight: 600,
                            }}
                          >
                            {top}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                      <button
                        type="button"
                        className="tm3-button tm3-button--gold"
                        onClick={() => launchCbt(track, false)}
                        style={{ fontSize: "0.86rem", padding: "8px 18px", minHeight: 40, fontWeight: 700 }}
                      >
                        <Play size={14} fill="currentColor" /> CBT Simulator
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}

          {groupedTracks.length === 0 && (
            <EmptyState
              icon="search"
              title="No model papers matched your search"
              description="Try adjusting your keyword or switching engineering branch filters."
            />
          )}
        </div>
      </section>

      {/* =========================================================================
          FULL-SCREEN CBT EXAM SIMULATOR POPUP (MODAL)
          ========================================================================= */}
      {isCbtOpen && cbtTrack && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1200,
            background: "var(--tm3-bg)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Authentic CBT Top Bar */}
          <header
            style={{
              height: 60,
              padding: "0 24px",
              background: "var(--tm3-surface)",
              borderBottom: "1px solid var(--tm3-border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--tm3-primary)", display: "flex", alignItems: "center", gap: 8 }}>
                <Award size={18} /> TerraMatrix CBT Terminal
              </span>
              <span style={{ height: 20, width: 1, background: "var(--tm3-border)" }} />
              <div>
                <strong style={{ fontSize: "0.9rem", color: "var(--tm3-ink)", display: "block" }}>
                  {cbtTrack.name}
                </strong>
                <small style={{ fontSize: "0.72rem", color: "var(--tm3-text-soft)" }}>
                  Standard Examination Format · Questions: {cbtQuestions.length} · Max Marks: {cbtQuestions.length}.00
                </small>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {/* Countdown Timer */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 14px",
                  borderRadius: 10,
                  background: secondsRemaining < 300 ? "rgba(239, 68, 68, 0.15)" : "var(--tm3-surface-muted)",
                  border: `1px solid ${secondsRemaining < 300 ? "#ef4444" : "var(--tm3-border)"}`,
                  color: secondsRemaining < 300 ? "#ef4444" : "var(--tm3-ink)",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  fontFamily: "monospace",
                }}
              >
                <Clock size={16} /> Time Left: {formatTime(secondsRemaining)}
              </div>

              <button
                type="button"
                className="tm3-button tm3-button--ghost"
                onClick={() => setConfirmExitOpen(true)}
                style={{ fontSize: "0.8rem", padding: "6px 12px", color: "var(--tm3-danger)" }}
              >
                <X size={16} /> Exit Exam
              </button>
            </div>
          </header>

          {/* CBT Main Layout (Split Left & Right) */}
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            {/* Left Question & Answer Area (72%) */}
            <section
              style={{
                flex: "1 1 72%",
                display: "flex",
                flexDirection: "column",
                borderRight: "1px solid var(--tm3-border)",
                overflowY: "auto",
                padding: "24px 32px",
              }}
            >
              {currentQ ? (
                <>
                  {/* Question Meta Head */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--tm3-border)", paddingBottom: 14, marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--tm3-primary)" }}>
                        Question No. {currentIndex + 1}
                      </span>
                      <Badge tone="green">{currentQ.topic}</Badge>
                      {currentQ.source && (
                        <span style={{ fontSize: "0.74rem", color: "var(--tm3-text-soft)", background: "var(--tm3-surface-muted)", padding: "2px 8px", borderRadius: 6 }}>
                          Source: {currentQ.source}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--tm3-text-soft)", fontWeight: 700 }}>
                      Marks: <span style={{ color: "var(--tm3-primary)" }}>+1.00</span> | Negative: <span style={{ color: "var(--tm3-danger)" }}>-0.33</span>
                    </div>
                  </div>

                  {/* Question Statement */}
                  <div style={{ fontSize: "1.05rem", color: "var(--tm3-ink)", lineHeight: 1.6, marginBottom: 24, fontWeight: 500 }}>
                    {currentQ.question}
                  </div>

                  {/* Options List */}
                  <div style={{ display: "grid", gap: 12, marginBottom: 30 }}>
                    {currentQ.options.map((opt, optIdx) => {
                      const isSelected = userAnswers[currentQ.id] === optIdx;
                      return (
                        <label
                          key={optIdx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 14,
                            padding: "14px 18px",
                            borderRadius: 12,
                            background: isSelected ? "rgba(16, 185, 129, 0.1)" : "var(--tm3-surface)",
                            border: `2px solid ${isSelected ? "var(--tm3-primary)" : "var(--tm3-border)"}`,
                            cursor: "pointer",
                            transition: "all .15s",
                          }}
                        >
                          <input
                            type="radio"
                            name={`cbt-option-${currentQ.id}`}
                            checked={isSelected}
                            onChange={() => handleSelectOption(currentQ.id, optIdx)}
                            style={{ accentColor: "var(--tm3-primary)", width: 18, height: 18 }}
                          />
                          <span style={{ fontWeight: 800, color: isSelected ? "var(--tm3-primary)" : "var(--tm3-text-soft)", width: 24 }}>
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <span style={{ fontSize: "0.95rem", color: "var(--tm3-ink)" }}>
                            {opt}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {/* CBT Navigation & Action Bottom Bar */}
                  <div style={{ marginTop: "auto", borderTop: "1px solid var(--tm3-border)", paddingTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        type="button"
                        className="tm3-button tm3-button--outline"
                        onClick={() => toggleMarkForReview(currentQ.id)}
                        style={{ fontSize: "0.82rem", padding: "6px 14px", color: reviewedIds[currentQ.id] ? "#f59e0b" : undefined }}
                      >
                        {reviewedIds[currentQ.id] ? "Unmark Review" : "Mark for Review & Next"}
                      </button>
                      <button
                        type="button"
                        className="tm3-button tm3-button--ghost"
                        onClick={() => handleClearOption(currentQ.id)}
                        style={{ fontSize: "0.82rem", padding: "6px 14px" }}
                        disabled={userAnswers[currentQ.id] === undefined}
                      >
                        Clear Response
                      </button>
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        type="button"
                        className="tm3-button tm3-button--outline"
                        onClick={() => goToQuestion(currentIndex - 1)}
                        disabled={currentIndex === 0}
                        style={{ fontSize: "0.82rem", padding: "6px 14px" }}
                      >
                        <ChevronLeft size={16} /> Previous
                      </button>

                      {currentIndex < cbtQuestions.length - 1 ? (
                        <button
                          type="button"
                          className="tm3-button tm3-button--gold"
                          onClick={handleSaveAndNext}
                          style={{ fontSize: "0.82rem", padding: "6px 18px" }}
                        >
                          Save & Next <ChevronRight size={16} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="tm3-button tm3-button--gold"
                          onClick={submitExam}
                          style={{ fontSize: "0.82rem", padding: "6px 18px", background: "var(--tm3-primary)", color: "#fff" }}
                        >
                          Submit Test Paper
                        </button>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </section>

            {/* Right Question Palette & Candidate Profile (28%) */}
            <aside
              style={{
                flex: "0 0 340px",
                background: "var(--tm3-surface)",
                display: "flex",
                flexDirection: "column",
                padding: 20,
                overflowY: "auto",
              }}
            >
              {/* Palette Legend */}
              <div style={{ marginBottom: 18 }}>
                <span className="tm3-eyebrow" style={{ marginBottom: 8, display: "block" }}>
                  Question Palette
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: "0.75rem", color: "var(--tm3-text-soft)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 14, height: 14, borderRadius: 4, background: "#10b981" }} />
                    Answered ({paletteCounts.answered})
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 14, height: 14, borderRadius: 4, background: "#ef4444" }} />
                    Not Answered ({paletteCounts.notAnswered})
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 14, height: 14, borderRadius: 4, background: "#f59e0b" }} />
                    Marked for Review ({paletteCounts.marked})
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 14, height: 14, borderRadius: 4, background: "var(--tm3-surface-muted)", border: "1px solid var(--tm3-border)" }} />
                    Not Visited ({paletteCounts.notVisited})
                  </div>
                </div>
              </div>

              {/* Numbered Palette Grid */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                  {cbtQuestions.map((q, idx) => {
                    const status = getQuestionStatus(q);
                    const isCurrent = idx === currentIndex;

                    let bg = "var(--tm3-surface-muted)";
                    let color = "var(--tm3-ink)";
                    let border = "1px solid var(--tm3-border)";

                    if (status === "answered") {
                      bg = "#10b981";
                      color = "#ffffff";
                      border = "1px solid #10b981";
                    } else if (status === "marked_for_review") {
                      bg = "#f59e0b";
                      color = "#ffffff";
                      border = "1px solid #f59e0b";
                    } else if (status === "not_answered") {
                      bg = "#ef4444";
                      color = "#ffffff";
                      border = "1px solid #ef4444";
                    }

                    if (isCurrent) {
                      border = "2px solid #38bdf8";
                    }

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => goToQuestion(idx)}
                        style={{
                          height: 36,
                          borderRadius: 8,
                          background: bg,
                          color: color,
                          border: border,
                          fontWeight: 800,
                          fontSize: "0.82rem",
                          cursor: "pointer",
                          display: "grid",
                          placeItems: "center",
                          boxShadow: isCurrent ? "0 0 0 2px #38bdf8" : undefined,
                        }}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Test CTA */}
              <div style={{ marginTop: "auto" }}>
                <button
                  type="button"
                  className="tm3-button tm3-button--gold"
                  onClick={submitExam}
                  style={{ width: "100%", justifyContent: "center", fontSize: "0.92rem", padding: "10px 0" }}
                >
                  <Award size={16} /> Submit Test Paper
                </button>
              </div>
            </aside>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCORECARD & DETAILED SOLUTIONS MODAL (ON SUBMISSION)
          ========================================================================= */}
      {isResultOpen && examResult && cbtTrack && (
        <div className="tm3-modal-backdrop" style={{ zIndex: 1300 }} role="presentation">
          <div
            className="tm3-modal"
            style={{ maxWidth: 860, maxHeight: "90vh", display: "flex", flexDirection: "column" }}
            role="dialog"
            aria-modal="true"
          >
            <div className="tm3-modal__head" style={{ borderBottom: "1px solid var(--tm3-border)", paddingBottom: 14 }}>
              <div>
                <span className="tm3-eyebrow">Auto-Evaluated Examination Result</span>
                <h2 style={{ fontSize: "1.25rem", margin: "4px 0 0" }}>{cbtTrack.name}</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsResultOpen(false);
                  setIsCbtOpen(false);
                }}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ overflowY: "auto", padding: "16px 0", display: "grid", gap: 20 }}>
              {/* Scorecard Hero Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
                <div style={{ padding: 16, borderRadius: 14, background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.3)" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--tm3-text-soft)", textTransform: "uppercase", fontWeight: 700 }}>
                    Score Obtained
                  </span>
                  <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--tm3-primary)", marginTop: 4 }}>
                    {examResult.score} / {examResult.totalQuestions}
                  </div>
                </div>

                <div style={{ padding: 16, borderRadius: 14, background: "var(--tm3-surface-muted)", border: "1px solid var(--tm3-border)" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--tm3-text-soft)", textTransform: "uppercase", fontWeight: 700 }}>
                    Accuracy %
                  </span>
                  <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--tm3-ink)", marginTop: 4 }}>
                    {examResult.percentage}%
                  </div>
                </div>

                <div style={{ padding: 16, borderRadius: 14, background: "var(--tm3-surface-muted)", border: "1px solid var(--tm3-border)" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--tm3-text-soft)", textTransform: "uppercase", fontWeight: 700 }}>
                    Time Spent
                  </span>
                  <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--tm3-ink)", marginTop: 4 }}>
                    {formatTime(examResult.timeSpentSeconds)}
                  </div>
                </div>
              </div>

              {/* Step-by-Step Mathematical Solutions Accordion */}
              <div>
                <h3 style={{ margin: "10px 0 12px", fontSize: "1.05rem", fontWeight: 800 }}>
                  Detailed Step-by-Step Solutions & Code Explanations
                </h3>
                <div style={{ display: "grid", gap: 14 }}>
                  {cbtQuestions.map((q, idx) => {
                    const ans = examResult.answers[q.id];
                    const wasAttempted = ans && ans.selected !== -1;
                    const isCorrect = ans?.isCorrect;

                    return (
                      <article
                        key={q.id}
                        style={{
                          padding: 18,
                          borderRadius: 14,
                          background: "var(--tm3-surface)",
                          border: `1px solid ${
                            !wasAttempted
                              ? "var(--tm3-border)"
                              : isCorrect
                              ? "rgba(34, 197, 94, 0.4)"
                              : "rgba(239, 68, 68, 0.4)"
                          }`,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--tm3-ink)" }}>
                            Q{idx + 1}. {q.topic}
                          </span>
                          {!wasAttempted ? (
                            <Badge tone="neutral">Unattempted</Badge>
                          ) : isCorrect ? (
                            <Badge tone="green">+1.00 Correct</Badge>
                          ) : (
                            <Badge tone="gold">-0.33 Incorrect</Badge>
                          )}
                        </div>

                        <p style={{ margin: "0 0 10px", fontSize: "0.92rem", color: "var(--tm3-ink)", lineHeight: 1.5 }}>
                          {q.question}
                        </p>

                        <div style={{ padding: "8px 12px", borderRadius: 8, background: "var(--tm3-surface-muted)", fontSize: "0.82rem", marginBottom: 10 }}>
                          <div>
                            <strong>Correct Answer:</strong> Option {String.fromCharCode(65 + q.correctIndex)} — {q.options[q.correctIndex]}
                          </div>
                          {wasAttempted && !isCorrect && (
                            <div style={{ color: "var(--tm3-danger)", marginTop: 4 }}>
                              <strong>Your Selection:</strong> Option {String.fromCharCode(65 + ans.selected)} — {q.options[ans.selected]}
                            </div>
                          )}
                        </div>

                        {/* Derivation / Explanation */}
                        <div style={{ padding: 12, borderRadius: 10, background: "rgba(16,185,129,.06)", border: "1px solid rgba(16,185,129,.18)", fontSize: "0.82rem", lineHeight: 1.55 }}>
                          <strong style={{ color: "var(--tm3-primary)", display: "block", marginBottom: 4 }}>
                            Scientific Derivation & Reference:
                          </strong>
                          {q.explanation}
                          {q.formulaOrSnippet && (
                            <div style={{ marginTop: 6, fontFamily: "monospace", color: "var(--tm3-primary)", fontWeight: 700 }}>
                              Formula: {q.formulaOrSnippet}
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="tm3-modal__actions" style={{ borderTop: "1px solid var(--tm3-border)", paddingTop: 14 }}>
              <button
                className="tm3-button tm3-button--outline"
                type="button"
                onClick={() => {
                  setIsResultOpen(false);
                  setIsCbtOpen(false);
                }}
              >
                Close & Return
              </button>
              <button
                className="tm3-button tm3-button--gold"
                type="button"
                onClick={() => launchCbt(cbtTrack, false)}
              >
                <Shuffle size={15} /> Retake Paper (New Randomized Pool)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal to Exit CBT */}
      {confirmExitOpen && (
        <div className="tm3-modal-backdrop" style={{ zIndex: 1400 }} role="presentation">
          <div className="tm3-modal" style={{ maxWidth: 440 }} role="dialog" aria-modal="true">
            <div className="tm3-modal__head">
              <h2>Exit Examination?</h2>
              <button type="button" onClick={() => setConfirmExitOpen(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <p style={{ margin: "0 0 18px", fontSize: "0.85rem", color: "var(--tm3-text-soft)", lineHeight: 1.5 }}>
              Are you sure you want to exit the test? Your responses will not be evaluated unless submitted.
            </p>
            <div className="tm3-modal__actions">
              <button className="tm3-button tm3-button--outline" type="button" onClick={() => setConfirmExitOpen(false)}>
                Resume Test
              </button>
              <button
                className="tm3-button tm3-button--dark"
                type="button"
                onClick={() => {
                  setConfirmExitOpen(false);
                  setIsCbtOpen(false);
                }}
              >
                Exit Without Submitting
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
