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
  FileQuestion,
  FileText,
  Filter,
  HelpCircle,
  Layers,
  Lock,
  Maximize2,
  Minimize2,
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
  shuffleQuestions,
  saveUserExamAttempt,
  loadUserExamAttempts,
  type ExamTrack,
  type ExamQuestion,
  type ExamTrackId,
  type ExamAttemptResult,
} from "../lib/examBankData";

type QuestionStatus = "not_visited" | "not_answered" | "answered" | "marked_for_review";

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
  const [isPaperViewOpen, setIsPaperViewOpen] = useState(false);
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
      "Mechanical & Aerospace",
      "Civil & Infrastructure",
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
        `${t.name} ${t.headline} ${t.description} ${t.topics.join(" ")}`
          .toLowerCase()
          .includes(searchQuery.trim().toLowerCase());
      return matchDiscipline && matchSearch;
    });
  }, [tracks, selectedDiscipline, searchQuery]);

  // Launch CBT Exam
  const launchCbt = (track: ExamTrack, sampleOnly: boolean = false) => {
    let pool = loadExamQuestions(track.id);
    if (!studentLogin && sampleOnly) {
      pool = pool.filter((q) => q.isSample);
    }
    if (pool.length === 0) return;

    const shuffled = shuffleQuestions(pool);
    setCbtTrack(track);
    setCbtQuestions(shuffled);
    setCurrentIndex(0);
    setUserAnswers({});
    setReviewedIds({});
    setVisitedIds({ [shuffled[0].id]: true });
    setSecondsRemaining((track.durationMinutes || 30) * 60);
    setIsResultOpen(false);
    setIsPaperViewOpen(false);
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

  const handleToggleReview = (qId: string) => {
    setReviewedIds((prev) => ({ ...prev, [qId]: !prev[qId] }));
    if (currentIndex < cbtQuestions.length - 1) {
      goToQuestion(currentIndex + 1);
    }
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < cbtQuestions.length) {
      setCurrentIndex(index);
      const nextQ = cbtQuestions[index];
      setVisitedIds((prev) => ({ ...prev, [nextQ.id]: true }));
    }
  };

  // Determine question state in palette
  const getQuestionStatus = (q: ExamQuestion): QuestionStatus => {
    const isAnswered = userAnswers[q.id] !== undefined;
    const isMarked = !!reviewedIds[q.id];
    const isVisited = !!visitedIds[q.id];

    if (isMarked) return "marked_for_review";
    if (isAnswered) return "answered";
    if (isVisited) return "not_answered";
    return "not_visited";
  };

  // Submit CBT Exam
  const submitExam = () => {
    if (!cbtTrack) return;
    let score = 0;
    const answerSummary: Record<
      string,
      { selected: number; correct: number; isCorrect: boolean }
    > = {};

    cbtQuestions.forEach((q) => {
      const userChoice = userAnswers[q.id];
      const isCorrect = userChoice === q.correctIndex;
      if (userChoice !== undefined) {
        if (isCorrect) score += 1;
        else score -= 0.33; // Standard GATE negative marking
      }
      answerSummary[q.id] = {
        selected: userChoice ?? -1,
        correct: q.correctIndex,
        isCorrect: isCorrect,
      };
    });

    const netScore = Math.max(0, Number(score.toFixed(2)));
    const totalPossible = cbtQuestions.length;
    const percentage = Math.round((netScore / totalPossible) * 100);
    const duration = (cbtTrack.durationMinutes || 30) * 60;
    const timeSpent = duration - secondsRemaining;

    const attempt: ExamAttemptResult = {
      id: `attempt_${Date.now()}`,
      userEmail: studentLogin?.email || "guest@terramatrix.academy",
      trackId: cbtTrack.id,
      topic: cbtTrack.name,
      totalQuestions: totalPossible,
      score: netScore,
      percentage,
      timeSpentSeconds: timeSpent,
      date: new Date().toISOString(),
      answers: answerSummary,
    };

    saveUserExamAttempt(attempt);
    setExamResult(attempt);
    setIsResultOpen(true);
  };

  // Timer formatting
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Current question pointer
  const currentQ = cbtQuestions[currentIndex];

  // Palette counts
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
        title="Examination & Model CBT Test Simulator"
        description="Interactive Computer-Based Test (CBT) environment modeled after official IIT GATE and UPSC examination consoles. Select from universal and branch-specific papers with instant automated scoring, question palettes, timer controls, and detailed mathematical explanations."
        aside={
          <div style={{ display: "grid", gap: 10 }}>
            <Metric value="100% Free" label="Candidate access" helper="Shuffled on every attempt" />
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--tm3-muted)", fontWeight: 700 }}>
              <Sparkles size={14} style={{ color: "var(--tm3-lime)" }} /> Official IIT / UPSC Question Architecture
            </div>
          </div>
        }
      />

      {/* Main Container */}
      <section className="tm3-shell" style={{ marginBottom: 60 }}>
        {/* Discipline Filters & Search */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, marginBottom: 24 }}>
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

          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 260 }}>
            <div className="tm3-field" style={{ margin: 0, width: "100%" }}>
              <div style={{ position: "relative" }}>
                <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--tm3-text-soft)" }} />
                <input
                  type="text"
                  placeholder="Search papers, topics, codes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: 34, height: 36, fontSize: "0.82rem" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Paper Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 24 }}>
          {filteredTracks.map((track) => (
            <article
              key={track.id}
              style={{
                borderRadius: 20,
                background: "var(--tm3-surface)",
                border: "1px solid var(--tm3-border)",
                padding: 24,
                display: "flex",
                flexDirection: "column",
                boxShadow: "var(--tm3-shadow-sm)",
                transition: "transform .15s, border-color .15s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                <Badge tone="green">{track.discipline}</Badge>
                <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--tm3-primary)", display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={12} /> {track.durationMinutes} Mins · +1 / -0.33
                </span>
              </div>

              <h3 style={{ margin: "0 0 6px", fontSize: "1.2rem", fontWeight: 800, color: "var(--tm3-ink)", lineHeight: 1.35 }}>
                {track.name}
              </h3>
              <p style={{ margin: "0 0 16px", fontSize: "0.82rem", color: "var(--tm3-text-soft)", lineHeight: 1.5, flex: 1 }}>
                {track.description}
              </p>

              {/* Topics Pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
                {track.topics.slice(0, 4).map((top) => (
                  <span
                    key={top}
                    style={{
                      padding: "3px 8px",
                      borderRadius: 6,
                      background: "var(--tm3-surface-muted)",
                      color: "var(--tm3-text)",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                    }}
                  >
                    {top}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 10, marginTop: "auto", borderTop: "1px solid var(--tm3-border)", paddingTop: 16 }}>
                <button
                  type="button"
                  className="tm3-button tm3-button--gold"
                  onClick={() => launchCbt(track, false)}
                  style={{ flex: 1, justifyContent: "center", fontSize: "0.85rem", minHeight: 38 }}
                >
                  <Play size={15} /> Launch CBT Simulator
                </button>
                <button
                  type="button"
                  className="tm3-button tm3-button--outline"
                  onClick={() => {
                    setCbtTrack(track);
                    setCbtQuestions(loadExamQuestions(track.id));
                    setIsPaperViewOpen(true);
                  }}
                  style={{ padding: "0 14px", fontSize: "0.8rem", minHeight: 38 }}
                  title="Preview entire paper in single document"
                >
                  <FileText size={15} /> Paper View
                </button>
              </div>
            </article>
          ))}
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
                className="tm3-button tm3-button--outline"
                onClick={() => setIsPaperViewOpen(true)}
                style={{ fontSize: "0.8rem", padding: "6px 12px", minHeight: 34 }}
              >
                <FileText size={15} /> Question Paper
              </button>

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
                background: "var(--tm3-surface)",
              }}
            >
              {currentQ && (
                <>
                  {/* Question Info Bar */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "1px solid var(--tm3-border)",
                      paddingBottom: 12,
                      marginBottom: 18,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--tm3-primary)" }}>
                        Question No. {currentIndex + 1}
                      </span>
                      <Badge tone="green">{currentQ.topic}</Badge>
                      <span style={{ fontSize: "0.75rem", color: "var(--tm3-text-soft)", fontWeight: 600 }}>
                        {currentQ.source}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.78rem", fontWeight: 700 }}>
                      <span style={{ color: "var(--tm3-success)" }}>Marks: +1.00</span>
                      <span style={{ color: "var(--tm3-danger)" }}>Negative: -0.33</span>
                    </div>
                  </div>

                  {/* Problem Statement */}
                  <div style={{ marginBottom: 24, fontSize: "1.05rem", lineHeight: 1.6, color: "var(--tm3-ink)", fontWeight: 500 }}>
                    {currentQ.question}
                  </div>

                  {/* Options List */}
                  <div style={{ display: "grid", gap: 12, marginBottom: 28 }}>
                    {currentQ.options.map((opt, oIdx) => {
                      const isSelected = userAnswers[currentQ.id] === oIdx;
                      const letter = String.fromCharCode(65 + oIdx);
                      return (
                        <div
                          key={oIdx}
                          onClick={() => handleSelectOption(currentQ.id, oIdx)}
                          style={{
                            padding: "14px 18px",
                            borderRadius: 12,
                            border: `2px solid ${isSelected ? "var(--tm3-primary)" : "var(--tm3-border)"}`,
                            background: isSelected ? "var(--tm3-primary-soft)" : "var(--tm3-bg)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 14,
                            transition: "border-color .15s, background .15s",
                          }}
                        >
                          <span
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              display: "grid",
                              placeItems: "center",
                              background: isSelected ? "var(--tm3-primary)" : "var(--tm3-surface-muted)",
                              color: isSelected ? "#fff" : "var(--tm3-ink)",
                              fontWeight: 800,
                              fontSize: "0.85rem",
                              flexShrink: 0,
                            }}
                          >
                            {letter}
                          </span>
                          <span style={{ fontSize: "0.95rem", color: "var(--tm3-ink)", fontWeight: isSelected ? 600 : 400 }}>
                            {opt}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom Action Toolbar */}
                  <div
                    style={{
                      marginTop: "auto",
                      borderTop: "1px solid var(--tm3-border)",
                      paddingTop: 18,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 10,
                    }}
                  >
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        className="tm3-button tm3-button--outline"
                        onClick={() => handleToggleReview(currentQ.id)}
                        style={{
                          fontSize: "0.82rem",
                          color: reviewedIds[currentQ.id] ? "#9333ea" : undefined,
                          borderColor: reviewedIds[currentQ.id] ? "#9333ea" : undefined,
                        }}
                      >
                        {reviewedIds[currentQ.id] ? "Unmark Review" : "Mark for Review & Next"}
                      </button>
                      <button
                        type="button"
                        className="tm3-button tm3-button--ghost"
                        onClick={() => handleClearOption(currentQ.id)}
                        style={{ fontSize: "0.82rem" }}
                      >
                        Clear Response
                      </button>
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        type="button"
                        className="tm3-button tm3-button--outline"
                        disabled={currentIndex === 0}
                        onClick={() => goToQuestion(currentIndex - 1)}
                        style={{ fontSize: "0.82rem" }}
                      >
                        <ChevronLeft size={16} /> Previous
                      </button>
                      <button
                        type="button"
                        className="tm3-button tm3-button--dark"
                        onClick={() => {
                          if (currentIndex < cbtQuestions.length - 1) {
                            goToQuestion(currentIndex + 1);
                          } else {
                            submitExam();
                          }
                        }}
                        style={{ fontSize: "0.85rem", padding: "6px 18px" }}
                      >
                        {currentIndex < cbtQuestions.length - 1 ? (
                          <>
                            Save & Next <ChevronRight size={16} />
                          </>
                        ) : (
                          "Save & Review Test"
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </section>

            {/* Right Question Palette & Candidate Profile (28%) */}
            <aside
              style={{
                flex: "0 0 320px",
                background: "var(--tm3-surface-muted)",
                display: "flex",
                flexDirection: "column",
                padding: "20px",
                overflowY: "auto",
              }}
            >
              {/* Candidate Info */}
              <div
                style={{
                  padding: 14,
                  borderRadius: 14,
                  background: "var(--tm3-surface)",
                  border: "1px solid var(--tm3-border)",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "var(--tm3-primary-soft)",
                    color: "var(--tm3-primary)",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 800,
                  }}
                >
                  {studentLogin?.name ? studentLogin.name.slice(0, 1).toUpperCase() : "TM"}
                </div>
                <div>
                  <strong style={{ fontSize: "0.85rem", display: "block", color: "var(--tm3-ink)" }}>
                    {studentLogin?.name || "Candidate #TM-2026-ENG"}
                  </strong>
                  <small style={{ fontSize: "0.72rem", color: "var(--tm3-text-soft)" }}>
                    {studentLogin?.email || "Practice Candidate"}
                  </small>
                </div>
              </div>

              {/* Status Legend */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16, fontSize: "0.72rem", fontWeight: 700 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#22c55e" }} />
                  <span>Answered ({paletteCounts.answered})</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#ef4444" }} />
                  <span>Not Answered ({paletteCounts.notAnswered})</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#a855f7" }} />
                  <span>Marked Review ({paletteCounts.marked})</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 14, height: 14, borderRadius: 3, background: "var(--tm3-border)" }} />
                  <span>Not Visited ({paletteCounts.notVisited})</span>
                </div>
              </div>

              {/* Question Palette Number Grid */}
              <div style={{ borderTop: "1px solid var(--tm3-border)", paddingTop: 14, marginBottom: 20 }}>
                <h4 style={{ margin: "0 0 10px", fontSize: "0.82rem", color: "var(--tm3-ink)", textTransform: "uppercase" }}>
                  Question Palette
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                  {cbtQuestions.map((q, idx) => {
                    const status = getQuestionStatus(q);
                    const isCurrent = currentIndex === idx;

                    let bg = "var(--tm3-surface)";
                    let color = "var(--tm3-ink)";
                    let border = "1px solid var(--tm3-border)";

                    if (status === "answered") {
                      bg = "#22c55e";
                      color = "#fff";
                      border = "1px solid #16a34a";
                    } else if (status === "marked_for_review") {
                      bg = "#a855f7";
                      color = "#fff";
                      border = "1px solid #9333ea";
                    } else if (status === "not_answered") {
                      bg = "#ef4444";
                      color = "#fff";
                      border = "1px solid #dc2626";
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
          QUESTION PAPER VIEW MODAL (ALL QUESTIONS IN SINGLE DOCUMENT)
          ========================================================================= */}
      {isPaperViewOpen && cbtTrack && (
        <div className="tm3-modal-backdrop" style={{ zIndex: 1300 }} role="presentation">
          <div
            className="tm3-modal"
            style={{ maxWidth: 860, maxHeight: "90vh", display: "flex", flexDirection: "column" }}
            role="dialog"
            aria-modal="true"
          >
            <div className="tm3-modal__head" style={{ borderBottom: "1px solid var(--tm3-border)", paddingBottom: 14 }}>
              <div>
                <span className="tm3-eyebrow">Standard Question Paper View</span>
                <h2 style={{ fontSize: "1.2rem", margin: "4px 0 0" }}>{cbtTrack.name}</h2>
              </div>
              <button type="button" onClick={() => setIsPaperViewOpen(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div style={{ overflowY: "auto", padding: "20px 0", display: "grid", gap: 20 }}>
              {cbtQuestions.map((q, idx) => (
                <article
                  key={q.id}
                  style={{
                    padding: 16,
                    borderRadius: 14,
                    background: "var(--tm3-surface-muted)",
                    border: "1px solid var(--tm3-border)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <strong style={{ color: "var(--tm3-primary)", fontSize: "0.9rem" }}>
                      Q{idx + 1}. ({q.topic})
                    </strong>
                    <span style={{ fontSize: "0.75rem", color: "var(--tm3-text-soft)" }}>+1.00 / -0.33</span>
                  </div>
                  <p style={{ margin: "0 0 12px", fontSize: "0.92rem", lineHeight: 1.5, color: "var(--tm3-ink)" }}>
                    {q.question}
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: "0.85rem" }}>
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} style={{ padding: "6px 10px", borderRadius: 8, background: "var(--tm3-surface)", border: "1px solid var(--tm3-border)" }}>
                        <strong>{String.fromCharCode(65 + oIdx)}.</strong> {opt}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <div className="tm3-modal__actions" style={{ borderTop: "1px solid var(--tm3-border)", paddingTop: 14 }}>
              <button className="tm3-button tm3-button--outline" type="button" onClick={() => setIsPaperViewOpen(false)}>
                Return to CBT
              </button>
            </div>
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
                <Shuffle size={15} /> Retake Paper (Shuffled)
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
