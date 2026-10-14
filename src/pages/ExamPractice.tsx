import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  HelpCircle,
  Lock,
  Play,
  RotateCcw,
  Search,
  Shuffle,
  Sparkles,
  Unlock,
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

export default function ExamPractice() {
  const [tracks, setTracks] = useState<ExamTrack[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [studentLogin, setStudentLogin] = useState<{ email: string; name?: string } | null>(null);

  // Practice Simulation state
  const [activeSession, setActiveSession] = useState<{
    trackId: string;
    topic: string;
    questions: ExamQuestion[];
    currentIndex: number;
    userAnswers: Record<string, number>;
    submitted: boolean;
    startTime: number;
  } | null>(null);

  // Review / Flashcard mode: which questions have answer revealed
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setTracks(loadExamTracks());
    const raw = localStorage.getItem("terramatrix_student_login") || sessionStorage.getItem("terramatrix_student_login");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.email) setStudentLogin(parsed);
      } catch {
        setStudentLogin(null);
      }
    }
  }, []);

  const allQuestions = useMemo(() => {
    return loadExamQuestions(selectedTrackId === "all" ? undefined : selectedTrackId, selectedTopic === "All" ? undefined : selectedTopic);
  }, [selectedTrackId, selectedTopic]);

  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      const text = `${q.question} ${q.topic} ${q.source} ${q.trackName}`.toLowerCase();
      return !searchQuery.trim() || text.includes(searchQuery.trim().toLowerCase());
    });
  }, [allQuestions, searchQuery]);

  const availableTopics = useMemo(() => {
    if (selectedTrackId === "all") {
      const set = new Set<string>();
      tracks.forEach((t) => t.topics.forEach((top) => set.add(top)));
      return ["All", ...Array.from(set)];
    }
    const currentTrack = tracks.find((t) => t.id === selectedTrackId);
    return ["All", ...(currentTrack?.topics || [])];
  }, [tracks, selectedTrackId]);

  // Start a fresh, shuffled simulation
  const startSimulator = (trackId: string, topic: string) => {
    let pool = loadExamQuestions(trackId === "all" ? undefined : trackId, topic === "All" ? undefined : topic);
    if (!studentLogin) {
      pool = pool.filter((q) => q.isSample);
    }
    if (pool.length === 0) return;
    const shuffled = shuffleQuestions(pool);
    setActiveSession({
      trackId,
      topic,
      questions: shuffled,
      currentIndex: 0,
      userAnswers: {},
      submitted: false,
      startTime: Date.now(),
    });
    window.scrollTo({ top: 350, behavior: "smooth" });
  };

  const selectAnswer = (questionId: string, optionIndex: number) => {
    if (!activeSession || activeSession.submitted) return;
    setActiveSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        userAnswers: { ...prev.userAnswers, [questionId]: optionIndex },
      };
    });
  };

  const finishSession = () => {
    if (!activeSession) return;
    const duration = Math.round((Date.now() - activeSession.startTime) / 1000);
    let correctCount = 0;
    const answersRecord: Record<string, { selected: number; correct: number; isCorrect: boolean }> = {};

    activeSession.questions.forEach((q) => {
      const selected = activeSession.userAnswers[q.id];
      const isCorrect = selected === q.correctIndex;
      if (isCorrect) correctCount++;
      answersRecord[q.id] = {
        selected: selected ?? -1,
        correct: q.correctIndex,
        isCorrect,
      };
    });

    const score = correctCount;
    const percentage = Math.round((correctCount / activeSession.questions.length) * 100);

    const attempt: ExamAttemptResult = {
      id: `attempt_${Date.now()}`,
      userEmail: studentLogin?.email || "guest@terramatrix.academy",
      trackId: activeSession.trackId as ExamTrackId,
      topic: activeSession.topic,
      totalQuestions: activeSession.questions.length,
      score,
      percentage,
      timeSpentSeconds: duration,
      date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      answers: answersRecord,
    };

    saveUserExamAttempt(attempt);
    setActiveSession((prev) => (prev ? { ...prev, submitted: true } : null));
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <main>
      <PageIntro
        eyebrow="Competitive Exams & Placement Prep"
        title="Model Question Papers & Technical Practice Bank"
        description="Comprehensive question bank designed for Civil Engineering students and engineering graduates. Practice real IIT GATE solved PYQs, UPSC ESE, State AE/JE, and Graduate Placement Viva questions with instant auto-evaluation, unlimited shuffled attempts, and complete step-by-step explanations."
        aside={
          <div style={{ display: "grid", gap: 10 }}>
            <Metric value={allQuestions.length} label="Active questions" helper="Civil & Aptitude" />
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--tm3-muted)", fontWeight: 700 }}>
              <Sparkles size={14} style={{ color: "var(--tm3-lime)" }} /> Auto-evaluated · Shuffled
            </div>
          </div>
        }
      />

      {/* Notice Banner: Pure Practice / No Certificates */}
      <div style={{ width: "min(var(--tm3-content), calc(100% - 44px))", margin: "-18px auto 26px" }}>
        <div style={{ padding: "14px 20px", borderRadius: 16, background: "rgba(214, 245, 109, 0.08)", border: "1px solid rgba(214, 245, 109, 0.25)", display: "flex", alignItems: "center", gap: 12 }}>
          <HelpCircle size={20} style={{ color: "var(--tm3-green-700)", flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--tm3-ink)", lineHeight: 1.5 }}>
            <strong>Practice & Evaluation Purpose:</strong> This question bank is designed exclusively for self-study, interview preparation, and competitive exam practice. Questions shuffle randomly on every attempt. No formal completion certificates are issued for practice tests.
          </p>
        </div>
      </div>

      {/* Access Status Banner (Guest vs Logged In) */}
      <div style={{ width: "min(var(--tm3-content), calc(100% - 44px))", margin: "0 auto 26px" }}>
        {studentLogin ? (
          <div style={{ padding: "12px 18px", borderRadius: 14, background: "var(--tm3-surface)", border: "1px solid var(--tm3-line)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ display: "grid", placeItems: "center", width: 30, height: 30, borderRadius: 9, background: "rgba(62,178,101,0.15)", color: "var(--tm3-success)" }}>
                <Unlock size={16} />
              </span>
              <div>
                <strong style={{ fontSize: "0.85rem", color: "var(--tm3-ink)" }}>Full Practice Access Unlocked</strong>
                <small style={{ display: "block", color: "var(--tm3-muted)", fontSize: "0.74rem" }}>Logged in as {studentLogin.email} · All question modules and shuffle modes enabled</small>
              </div>
            </div>
            <Link to="/student-portal" className="tm3-button tm3-button--ghost" style={{ fontSize: 12 }}>
              My Learning Portal <ChevronRight size={14} />
            </Link>
          </div>
        ) : (
          <div style={{ padding: "16px 20px", borderRadius: 16, background: "var(--tm3-surface-muted)", border: "1px solid var(--tm3-line-strong)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ display: "grid", placeItems: "center", width: 36, height: 36, borderRadius: 11, background: "rgba(220,140,20,0.15)", color: "#b87000" }}>
                <Lock size={18} />
              </span>
              <div>
                <strong style={{ fontSize: "0.88rem", color: "var(--tm3-ink)", display: "block" }}>Sample Questions Available Free Below</strong>
                <span style={{ color: "var(--tm3-muted)", fontSize: "0.78rem" }}>
                  Sign in or register for free to unlock all 100+ questions, timed exam simulations, and unlimited retakes.
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Link to="/student-login" className="tm3-button tm3-button--dark" style={{ minHeight: 38, padding: "6px 14px" }}>
                Sign In (Free Access)
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ACTIVE PRACTICE SIMULATOR (IF STARTED) */}
      {activeSession && (
        <section style={{ width: "min(var(--tm3-content), calc(100% - 44px))", margin: "0 auto 34px" }}>
          <div style={{ border: "2px solid var(--tm3-primary)", borderRadius: 24, background: "var(--tm3-surface)", overflow: "hidden", boxShadow: "var(--tm3-shadow-md)" }}>
            {/* Header */}
            <div style={{ padding: "18px 24px", background: "var(--tm3-surface-muted)", borderBottom: "1px solid var(--tm3-border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <span className="tm3-eyebrow" style={{ margin: 0 }}>Interactive Practice Simulator</span>
                <h3 style={{ margin: "4px 0 0", fontSize: "1.15rem" }}>
                  {activeSession.trackId === "all" ? "Comprehensive Engineering Simulator" : tracks.find((t) => t.id === activeSession.trackId)?.name}
                  {activeSession.topic !== "All" && ` · ${activeSession.topic}`}
                </h3>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Badge tone="green">{activeSession.questions.length} Shuffled Questions</Badge>
                <button
                  type="button"
                  onClick={() => startSimulator(activeSession.trackId, activeSession.topic)}
                  className="tm3-button tm3-button--ghost"
                  style={{ fontSize: 12, padding: "5px 10px" }}
                  title="Reshuffle and start over"
                >
                  <Shuffle size={14} /> Reshuffle
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSession(null)}
                  className="tm3-button tm3-button--outline"
                  style={{ fontSize: 12, padding: "5px 10px" }}
                >
                  Close Simulator
                </button>
              </div>
            </div>

            {/* If NOT yet submitted: Interactive Quiz Runner */}
            {!activeSession.submitted ? (
              <div style={{ padding: "24px" }}>
                <div style={{ display: "grid", gap: 24 }}>
                  {activeSession.questions.map((q, qIndex) => {
                    const selected = activeSession.userAnswers[q.id];
                    return (
                      <article key={q.id} style={{ padding: 20, borderRadius: 18, background: "var(--tm3-canvas)", border: "1px solid var(--tm3-border)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                          <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--tm3-primary)", textTransform: "uppercase" }}>
                            Question {qIndex + 1} of {activeSession.questions.length} · {q.topic}
                          </span>
                          <span style={{ fontSize: "0.72rem", padding: "3px 8px", borderRadius: 6, background: "var(--tm3-surface)", border: "1px solid var(--tm3-border)", color: "var(--tm3-muted)", fontWeight: 700 }}>
                            {q.source}
                          </span>
                        </div>

                        <h4 style={{ margin: "0 0 16px", fontSize: "1rem", lineHeight: 1.5, color: "var(--tm3-text)" }}>
                          {q.question}
                        </h4>

                        {/* Options */}
                        <div style={{ display: "grid", gap: 8 }}>
                          {q.options.map((opt, optIndex) => {
                            const isChosen = selected === optIndex;
                            return (
                              <button
                                type="button"
                                key={optIndex}
                                onClick={() => selectAnswer(q.id, optIndex)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 12,
                                  padding: "12px 16px",
                                  borderRadius: 12,
                                  border: isChosen ? "2px solid var(--tm3-primary)" : "1px solid var(--tm3-border)",
                                  background: isChosen ? "var(--tm3-primary-soft)" : "var(--tm3-surface)",
                                  color: isChosen ? "var(--tm3-primary)" : "var(--tm3-text)",
                                  textAlign: "left",
                                  fontWeight: isChosen ? 750 : 500,
                                  cursor: "pointer",
                                  fontSize: "0.88rem",
                                }}
                              >
                                <span style={{ width: 24, height: 24, borderRadius: "50%", border: isChosen ? "2px solid var(--tm3-primary)" : "1px solid var(--tm3-border-strong)", display: "grid", placeItems: "center", fontSize: "0.74rem", fontWeight: 900, background: isChosen ? "var(--tm3-primary)" : "transparent", color: isChosen ? "white" : "inherit" }}>
                                  {String.fromCharCode(65 + optIndex)}
                                </span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      </article>
                    );
                  })}
                </div>

                <div style={{ marginTop: 24, padding: "16px 0 0", borderTop: "1px solid var(--tm3-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--tm3-muted)" }}>
                    {Object.keys(activeSession.userAnswers).length} of {activeSession.questions.length} questions answered
                  </span>
                  <button
                    type="button"
                    onClick={finishSession}
                    className="tm3-button tm3-button--dark"
                    style={{ minHeight: 44, padding: "10px 24px" }}
                  >
                    <CheckCircle2 size={18} /> Submit Test & View Scorecard
                  </button>
                </div>
              </div>
            ) : (
              /* RESULTS SCORECARD VIEW */
              <div style={{ padding: "28px" }}>
                {(() => {
                  let correct = 0;
                  activeSession.questions.forEach((q) => {
                    if (activeSession.userAnswers[q.id] === q.correctIndex) correct++;
                  });
                  const pct = Math.round((correct / activeSession.questions.length) * 100);

                  return (
                    <div>
                      <div style={{ padding: 24, borderRadius: 20, background: "linear-gradient(135deg, var(--tm3-green-950), var(--tm3-green-800))", color: "white", marginBottom: 26, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 18 }}>
                        <div>
                          <Badge tone="green">Attempt Evaluation Complete</Badge>
                          <h2 style={{ margin: "10px 0 6px", fontSize: "1.8rem", color: "white" }}>
                            You scored {correct} / {activeSession.questions.length} ({pct}%)
                          </h2>
                          <p style={{ margin: 0, color: "#c5d9d1", fontSize: "0.88rem" }}>
                            {pct >= 75 ? "Excellent mastery! High performance in conceptual formulations." : "Good attempt. Review the step-by-step explanations below to strengthen weak areas."}
                          </p>
                        </div>
                        <div style={{ display: "flex", gap: 10 }}>
                          <button
                            type="button"
                            onClick={() => startSimulator(activeSession.trackId, activeSession.topic)}
                            className="tm3-button tm3-button--lime"
                          >
                            <RotateCcw size={16} /> Retake Shuffled Test
                          </button>
                        </div>
                      </div>

                      {/* Detailed Question Review */}
                      <h3 style={{ margin: "0 0 16px", fontSize: "1.2rem", fontWeight: 800 }}>Detailed Solution & Review</h3>
                      <div style={{ display: "grid", gap: 20 }}>
                        {activeSession.questions.map((q, idx) => {
                          const userChoice = activeSession.userAnswers[q.id];
                          const isCorrect = userChoice === q.correctIndex;
                          const wasAnswered = userChoice !== undefined;

                          return (
                            <article key={q.id} style={{ padding: 20, borderRadius: 16, background: "var(--tm3-surface)", border: `1px solid ${isCorrect ? "rgba(62,178,101,0.4)" : "rgba(240,90,80,0.35)"}` }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  {isCorrect ? (
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--tm3-success)", fontWeight: 800, fontSize: "0.82rem" }}>
                                      <CheckCircle2 size={16} /> Correct (+1.00)
                                    </span>
                                  ) : wasAnswered ? (
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--tm3-danger)", fontWeight: 800, fontSize: "0.82rem" }}>
                                      <XCircle size={16} /> Incorrect (0.00)
                                    </span>
                                  ) : (
                                    <span style={{ color: "var(--tm3-muted)", fontWeight: 700, fontSize: "0.82rem" }}>
                                      Unanswered
                                    </span>
                                  )}
                                  <span style={{ color: "var(--tm3-muted)", fontSize: "0.78rem" }}>· {q.topic}</span>
                                </div>
                                <span style={{ fontSize: "0.72rem", color: "var(--tm3-muted)", fontWeight: 700 }}>{q.source}</span>
                              </div>

                              <h4 style={{ margin: "0 0 14px", fontSize: "0.96rem", lineHeight: 1.5 }}>
                                Q{idx + 1}. {q.question}
                              </h4>

                              {/* Options review */}
                              <div style={{ display: "grid", gap: 6, marginBottom: 14 }}>
                                {q.options.map((opt, oIdx) => {
                                  const isRightAnswer = oIdx === q.correctIndex;
                                  const isUserPick = oIdx === userChoice;
                                  return (
                                    <div
                                      key={oIdx}
                                      style={{
                                        padding: "8px 12px",
                                        borderRadius: 8,
                                        fontSize: "0.84rem",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        background: isRightAnswer
                                          ? "rgba(62,178,101,0.12)"
                                          : isUserPick
                                          ? "rgba(240,90,80,0.1)"
                                          : "transparent",
                                        border: isRightAnswer
                                          ? "1px solid rgba(62,178,101,0.35)"
                                          : isUserPick
                                          ? "1px solid rgba(240,90,80,0.3)"
                                          : "1px solid transparent",
                                        color: isRightAnswer ? "var(--tm3-green-800)" : isUserPick ? "var(--tm3-danger)" : "var(--tm3-text-soft)",
                                        fontWeight: isRightAnswer || isUserPick ? 700 : 400,
                                      }}
                                    >
                                      <span>{String.fromCharCode(65 + oIdx)}.</span>
                                      <span>{opt}</span>
                                      {isRightAnswer && <small style={{ marginLeft: "auto", color: "var(--tm3-success)", fontWeight: 800 }}>Correct Answer</small>}
                                      {isUserPick && !isRightAnswer && <small style={{ marginLeft: "auto", color: "var(--tm3-danger)", fontWeight: 800 }}>Your Answer</small>}
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Explanation Box */}
                              <div style={{ padding: "12px 16px", borderRadius: 12, background: "var(--tm3-surface-muted)", border: "1px solid var(--tm3-border)", fontSize: "0.82rem", lineHeight: 1.6 }}>
                                <strong style={{ color: "var(--tm3-primary)", display: "block", marginBottom: 4 }}>
                                  Step-by-Step Solution & Engineering Formulation:
                                </strong>
                                <p style={{ margin: 0, color: "var(--tm3-text)" }}>{q.explanation}</p>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </section>
      )}

      {/* TRACKS & HEAD CATEGORIES GRID */}
      <section style={{ width: "min(var(--tm3-content), calc(100% - 44px))", margin: "0 auto 30px" }}>
        <div style={{ marginBottom: 16 }}>
          <span className="tm3-eyebrow">Exam Tracks & Competitive Modules</span>
          <h2 style={{ margin: "4px 0 0", fontSize: "1.45rem", fontWeight: 800 }}>Select Examination or Placement Track</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
          <div
            onClick={() => { setSelectedTrackId("all"); setSelectedTopic("All"); }}
            style={{
              padding: 18,
              borderRadius: 18,
              background: selectedTrackId === "all" ? "var(--tm3-primary-soft)" : "var(--tm3-surface)",
              border: selectedTrackId === "all" ? "2px solid var(--tm3-primary)" : "1px solid var(--tm3-border)",
              cursor: "pointer",
              transition: "transform .2s",
            }}
          >
            <Badge tone={selectedTrackId === "all" ? "green" : "neutral"}>All Modules</Badge>
            <h3 style={{ margin: "10px 0 6px", fontSize: "1.05rem" }}>Complete Question Bank</h3>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--tm3-muted)" }}>
              All civil engineering, UPSC ESE, state services, and general quantitative aptitude questions.
            </p>
          </div>

          {tracks.map((track) => {
            const isSelected = selectedTrackId === track.id;
            return (
              <div
                key={track.id}
                onClick={() => { setSelectedTrackId(track.id); setSelectedTopic("All"); }}
                style={{
                  padding: 18,
                  borderRadius: 18,
                  background: isSelected ? "var(--tm3-primary-soft)" : "var(--tm3-surface)",
                  border: isSelected ? "2px solid var(--tm3-primary)" : "1px solid var(--tm3-border)",
                  cursor: "pointer",
                  transition: "transform .2s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Badge tone={isSelected ? "green" : "gold"}>{track.badge}</Badge>
                  <small style={{ color: "var(--tm3-muted)", fontSize: "0.72rem", fontWeight: 700 }}>{track.topics.length} topics</small>
                </div>
                <h3 style={{ margin: "10px 0 6px", fontSize: "1.05rem" }}>{track.name}</h3>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--tm3-muted)", lineHeight: 1.5 }}>
                  {track.headline}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FILTER & TOPIC BAR */}
      <section className="tm3-filter-shell" style={{ gridTemplateColumns: "minmax(280px, 1fr) minmax(220px, .35fr) auto" }}>
        <label className="tm3-search-field">
          <Search size={18} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions by formula, concept, standard (IS 456), or PYQ..."
          />
        </label>
        <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
          {availableTopics.map((top) => (
            <option key={top} value={top}>
              {top === "All" ? "All Topics & Modules" : top}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => startSimulator(selectedTrackId, selectedTopic)}
          className="tm3-button tm3-button--lime"
          style={{ whiteSpace: "nowrap" }}
        >
          <Play size={16} fill="currentColor" /> Start Timed Test
        </button>
      </section>

      {/* QUESTION BANK LIST */}
      <section className="tm3-catalogue" style={{ paddingTop: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>
              Question Bank · {filteredQuestions.length} Questions Found
            </h3>
            <small style={{ color: "var(--tm3-muted)" }}>
              {selectedTrackId === "all" ? "Civil Engineering & Aptitude" : tracks.find((t) => t.id === selectedTrackId)?.name}
            </small>
          </div>
          <button
            type="button"
            onClick={() => startSimulator(selectedTrackId, selectedTopic)}
            className="tm3-button tm3-button--ghost"
            style={{ fontSize: 13 }}
          >
            <Shuffle size={14} /> Practice Shuffled Mode
          </button>
        </div>

        {filteredQuestions.length === 0 ? (
          <EmptyState
            icon="search"
            title="No questions match this filter"
            description="Try switching the exam track or clearing your search keywords."
          />
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {filteredQuestions.map((q, idx) => {
              const isLocked = !studentLogin && !q.isSample;
              const isRevealed = revealedIds[q.id];

              return (
                <article
                  key={q.id}
                  style={{
                    padding: 22,
                    borderRadius: 18,
                    background: "var(--tm3-surface)",
                    border: "1px solid var(--tm3-border)",
                    boxShadow: "var(--tm3-shadow-xs)",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <Badge tone={q.difficulty === "Advanced" ? "gold" : "green"}>{q.trackName}</Badge>
                      <Badge tone="neutral">{q.topic}</Badge>
                      {q.isSample && <Badge tone="green">Free Sample</Badge>}
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "var(--tm3-muted)", fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: "var(--tm3-surface-muted)" }}>
                      {q.source}
                    </span>
                  </div>

                  <h3 style={{ margin: "0 0 16px", fontSize: "1.05rem", lineHeight: 1.55, color: "var(--tm3-text)" }}>
                    <span style={{ color: "var(--tm3-primary)", fontWeight: 900, marginRight: 8 }}>#{idx + 1}</span>
                    {q.question}
                  </h3>

                  {/* Options */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10, marginBottom: 16 }}>
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = isRevealed && oIdx === q.correctIndex;
                      return (
                        <div
                          key={oIdx}
                          style={{
                            padding: "10px 14px",
                            borderRadius: 10,
                            background: isCorrect ? "rgba(62,178,101,0.12)" : "var(--tm3-surface-muted)",
                            border: isCorrect ? "1px solid rgba(62,178,101,0.4)" : "1px solid var(--tm3-border)",
                            color: isCorrect ? "var(--tm3-green-800)" : "var(--tm3-text)",
                            fontSize: "0.85rem",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            fontWeight: isCorrect ? 750 : 500,
                          }}
                        >
                          <span style={{ fontWeight: 800, color: isCorrect ? "var(--tm3-success)" : "var(--tm3-muted)" }}>
                            {String.fromCharCode(65 + oIdx)}.
                          </span>
                          <span>{opt}</span>
                          {isCorrect && (
                            <CheckCircle2 size={15} style={{ marginLeft: "auto", color: "var(--tm3-success)" }} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Locked vs Unlocked Action Footer */}
                  {isLocked ? (
                    <div style={{ padding: "12px 16px", borderRadius: 12, background: "var(--tm3-surface-muted)", border: "1px dashed var(--tm3-border-strong)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem", color: "var(--tm3-muted)" }}>
                        <Lock size={15} /> Sign in to view step-by-step solution & detailed derivation
                      </div>
                      <Link to="/student-login" className="tm3-button tm3-button--dark" style={{ minHeight: 34, padding: "4px 12px", fontSize: 12 }}>
                        Sign in for free
                      </Link>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <button
                          type="button"
                          onClick={() => toggleReveal(q.id)}
                          className="tm3-button tm3-button--ghost"
                          style={{ fontSize: 13, padding: "4px 10px" }}
                        >
                          {isRevealed ? "Hide Explanation" : "Reveal Answer & Step-by-Step Solution"}
                        </button>
                        <button
                          type="button"
                          onClick={() => startSimulator(q.trackId, q.topic)}
                          className="tm3-button tm3-button--outline"
                          style={{ fontSize: 12, padding: "4px 12px" }}
                        >
                          <Play size={13} fill="currentColor" /> Test this topic
                        </button>
                      </div>

                      {isRevealed && (
                        <div style={{ marginTop: 14, padding: 16, borderRadius: 14, background: "var(--tm3-surface-muted)", border: "1px solid var(--tm3-border)", fontSize: "0.84rem", lineHeight: 1.65 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--tm3-green-800)", fontWeight: 800, marginBottom: 6 }}>
                            <CheckCircle2 size={16} /> Correct Option: {String.fromCharCode(65 + q.correctIndex)} ({q.options[q.correctIndex]})
                          </div>
                          <strong style={{ display: "block", color: "var(--tm3-primary)", marginBottom: 4 }}>
                            Analytical Solution & Theoretical Basis:
                          </strong>
                          <p style={{ margin: 0, color: "var(--tm3-text)" }}>{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
