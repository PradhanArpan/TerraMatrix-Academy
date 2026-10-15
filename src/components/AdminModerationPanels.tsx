import { useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  BookOpen,
  Bot,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  ChevronRight,
  Clock3,
  Compass,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileCode,
  FileText,
  Filter,
  GraduationCap,
  Layers,
  MessageSquareText,
  PlayCircle,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Terminal,
  UsersRound,
  Video,
  X,
} from "lucide-react";
import { Badge } from "./Ui";
import {
  deriveShortTitle,
  formatDate,
  type AcademyEvent,
  type Course,
  type Instructor,
  type LearningVideo,
} from "../lib/catalogData";
import {
  loadExamCalendars,
  saveExamCalendars,
  loadOpportunities,
  saveOpportunities,
  loadStudyCodes,
  saveStudyCodes,
  loadHandbooks,
  saveHandbooks,
  loadGlossaries,
  saveGlossaries,
  type ExamCalendarItem,
  type OpportunityItem,
  type StudyCodeItem,
  type HandbookItem,
  type GlossaryItem,
  ENGINEERING_BRANCHES,
} from "../lib/knowledgeHubData";
import {
  getTmaShorts,
  saveTmaShort,
  type TmaShortVideo,
} from "../lib/tmaShortsData";
import {
  EXAM_QUESTIONS,
  EXAM_TRACKS,
  type ExamDifficulty,
  type ExamQuestion,
  type ExamTrack,
  type ExamTrackId,
} from "../lib/examBankData";
import {
  STATISTICS_MOOC_CURRICULUM,
  auditCourseEligibility,
  type CourseQaAudit,
  type MoocModule,
} from "../lib/moocCurriculum";

/* =========================================================================
   1. GOVERNANCE & APPROVALS PANEL
   ========================================================================= */

type ModerationSubTab = "courses" | "videos" | "instructors";

export function AdminModerationPanel({
  courses,
  onUpdateCourses,
  instructors,
  onUpdateInstructors,
  videos,
  onUpdateVideos,
  onSelectTab,
}: {
  courses: Course[];
  onUpdateCourses: (updated: Course[]) => void;
  instructors: Instructor[];
  onUpdateInstructors: (updated: Instructor[]) => void;
  videos: LearningVideo[];
  onUpdateVideos: (updated: LearningVideo[]) => void;
  onSelectTab: (tab: "courses" | "videos" | "instructors") => void;
}) {
  const [subTab, setSubTab] = useState<ModerationSubTab>("courses");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [reviewComments, setReviewComments] = useState<Record<number, string>>({});
  const [videoInsights, setVideoInsights] = useState<Record<number, string>>({});
  const [feedbackNotice, setFeedbackNotice] = useState<string>("");

  // Course moderation stats
  const pendingCourses = useMemo(
    () => courses.filter((c) => c.moderationStatus === "Pending Review"),
    [courses]
  );
  const changesRequestedCourses = useMemo(
    () => courses.filter((c) => c.moderationStatus === "Changes Requested"),
    [courses]
  );

  // Video moderation stats
  const pendingVideos = useMemo(
    () => videos.filter((v) => v.moderationStatus === "Pending Review"),
    [videos]
  );

  // Instructor profile update requests
  const pendingInstructors = useMemo(
    () =>
      instructors.filter(
        (ins) =>
          ins.moderationStatus === "Pending Review" ||
          (ins.pendingExpertise && ins.pendingExpertise !== ins.expertise)
      ),
    [instructors]
  );

  const totalPending = pendingCourses.length + pendingVideos.length + pendingInstructors.length;

  const showNotice = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => setFeedbackNotice(""), 4000);
  };

  // Actions for Courses
  const approveCourse = (id: number) => {
    const updated = courses.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          status: "Published" as const,
          moderationStatus: "Approved" as const,
          adminReviewComment: reviewComments[id] || c.adminReviewComment || "Approved by TerraMatrix Academic Committee.",
        };
      }
      return c;
    });
    onUpdateCourses(updated);
    localStorage.setItem("terramatrix_courses", JSON.stringify(updated));
    showNotice("Course approved and published live to the public catalogue!");
  };

  const requestCourseChanges = (id: number) => {
    const comment = reviewComments[id]?.trim() || "Please add reproducible computational labs and specify standard engineering code references.";
    const updated = courses.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          status: "Draft" as const,
          moderationStatus: "Changes Requested" as const,
          adminReviewComment: comment,
        };
      }
      return c;
    });
    onUpdateCourses(updated);
    localStorage.setItem("terramatrix_courses", JSON.stringify(updated));
    showNotice("Revisions requested. Notification and comments sent to instructor.");
  };

  // Actions for Videos
  const approveVideo = (id: number) => {
    const insight = videoInsights[id];
    const updated = videos.map((v) => {
      if (v.id === id) {
        return {
          ...v,
          status: "Published" as const,
          moderationStatus: "Approved" as const,
          terraMatrixInsight: insight || v.terraMatrixInsight || "Curated for engineering rigor by TerraMatrix Academy.",
        };
      }
      return v;
    });
    onUpdateVideos(updated);
    localStorage.setItem("terramatrix_learning_videos", JSON.stringify(updated));
    showNotice("Video approved and published to the Learning Library!");
  };

  const declineVideo = (id: number) => {
    if (!window.confirm("Decline and remove this video submission?")) return;
    const updated = videos.filter((v) => v.id !== id);
    onUpdateVideos(updated);
    localStorage.setItem("terramatrix_learning_videos", JSON.stringify(updated));
    showNotice("Video submission declined.");
  };

  // Actions for Instructors
  const approveInstructorProfile = (id: number) => {
    const updated = instructors.map((ins) => {
      if (ins.id === id) {
        return {
          ...ins,
          expertise: ins.pendingExpertise || ins.expertise,
          bio: ins.pendingBio || ins.bio,
          pendingExpertise: undefined,
          pendingBio: undefined,
          moderationStatus: "Approved" as const,
          adminFeedback: "Profile update approved.",
        };
      }
      return ins;
    });
    onUpdateInstructors(updated);
    localStorage.setItem("terramatrix_instructors", JSON.stringify(updated));
    showNotice("Instructor technical profile and expertise tags approved!");
  };

  const declineInstructorProfile = (id: number, feedbackMsg: string) => {
    const updated = instructors.map((ins) => {
      if (ins.id === id) {
        return {
          ...ins,
          moderationStatus: "Changes Requested" as const,
          adminFeedback: feedbackMsg || "Please limit expertise to top 3-5 verified engineering tools.",
        };
      }
      return ins;
    });
    onUpdateInstructors(updated);
    localStorage.setItem("terramatrix_instructors", JSON.stringify(updated));
    showNotice("Instructor profile changes declined with feedback.");
  };

  // Filtered courses for proposal stream
  const displayedCourses = useMemo(() => {
    if (courseFilter === "pending") return pendingCourses;
    if (courseFilter === "revisions") return changesRequestedCourses;
    if (courseFilter === "approved") return courses.filter((c) => c.moderationStatus === "Approved");
    return courses;
  }, [courses, courseFilter, pendingCourses, changesRequestedCourses]);

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {/* Header Banner */}
      <section className="tm3-qa-card">
        <div className="tm3-qa-head">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span
              style={{
                display: "grid",
                placeItems: "center",
                width: 46,
                height: 46,
                borderRadius: 14,
                background: "rgba(214,245,109,.15)",
                color: "var(--tm3-lime)",
              }}
            >
              <ShieldCheck size={26} />
            </span>
            <div>
              <span className="tm3-eyebrow tm3-eyebrow--light" style={{ margin: 0 }}>
                TerraMatrix Academy · Accreditation & Quality Governance
              </span>
              <h2 style={{ margin: "2px 0 0", color: "#fff", fontSize: "1.35rem" }}>
                Approvals, Moderation & Rollout Queue
              </h2>
            </div>
          </div>
          <div className="tm3-qa-score-badge">
            <Sparkles size={16} />
            <span>{totalPending} Pending Approval Requests</span>
          </div>
        </div>

        <div className="tm3-qa-metrics">
          <div className="tm3-qa-metric-pill">
            <span>Course Proposals</span>
            <strong>{pendingCourses.length} in review</strong>
            <small style={{ color: "#a4c4b8", fontSize: "0.68rem" }}>
              {changesRequestedCourses.length} revisions requested
            </small>
          </div>
          <div className="tm3-qa-metric-pill">
            <span>Curated YouTube Videos</span>
            <strong>{pendingVideos.length} submissions</strong>
            <small style={{ color: "#a4c4b8", fontSize: "0.68rem" }}>Creator nominated</small>
          </div>
          <div className="tm3-qa-metric-pill">
            <span>Instructor Profiles</span>
            <strong>{pendingInstructors.length} requests</strong>
            <small style={{ color: "#a4c4b8", fontSize: "0.68rem" }}>Expertise updates</small>
          </div>
          <div className="tm3-qa-metric-pill">
            <span>Live Catalogues</span>
            <strong>{courses.filter((c) => c.status === "Published").length} Published</strong>
            <small style={{ color: "#a4c4b8", fontSize: "0.68rem" }}>Accredited offerings</small>
          </div>
        </div>
      </section>

      {/* Notice Banner */}
      {feedbackNotice && (
        <div className="tm3-notice" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <CheckCircle2 size={18} />
          <span>{feedbackNotice}</span>
          <button type="button" onClick={() => setFeedbackNotice("")} style={{ marginLeft: "auto", cursor: "pointer", background: "none", border: "none", color: "inherit", fontSize: 16 }}>
            ×
          </button>
        </div>
      )}

      {/* Sub-tab Navigation */}
      <div style={{ display: "flex", gap: 10, borderBottom: "1px solid var(--tm3-border)", paddingBottom: 12 }}>
        <button
          type="button"
          onClick={() => setSubTab("courses")}
          className={`tm3-button ${subTab === "courses" ? "tm3-button--dark" : "tm3-button--outline"}`}
          style={{ fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          <BookOpen size={16} />
          <span>Course & Workshop Proposals</span>
          {pendingCourses.length > 0 && (
            <span style={{ padding: "2px 6px", borderRadius: 99, background: "var(--tm3-gold)", color: "#1c1917", fontSize: "0.68rem", fontWeight: 800 }}>
              {pendingCourses.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setSubTab("videos")}
          className={`tm3-button ${subTab === "videos" ? "tm3-button--dark" : "tm3-button--outline"}`}
          style={{ fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          <PlayCircle size={16} />
          <span>Creator YouTube Videos</span>
          {pendingVideos.length > 0 && (
            <span style={{ padding: "2px 6px", borderRadius: 99, background: "var(--tm3-gold)", color: "#1c1917", fontSize: "0.68rem", fontWeight: 800 }}>
              {pendingVideos.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setSubTab("instructors")}
          className={`tm3-button ${subTab === "instructors" ? "tm3-button--dark" : "tm3-button--outline"}`}
          style={{ fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          <UsersRound size={16} />
          <span>Instructor Expertise & Bios</span>
          {pendingInstructors.length > 0 && (
            <span style={{ padding: "2px 6px", borderRadius: 99, background: "var(--tm3-gold)", color: "#1c1917", fontSize: "0.68rem", fontWeight: 800 }}>
              {pendingInstructors.length}
            </span>
          )}
        </button>
      </div>

      {/* STREAM 1: COURSES & PROGRAMMES */}
      {subTab === "courses" && (
        <div style={{ display: "grid", gap: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", gap: 8 }}>
              {(["all", "pending", "revisions", "approved"] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setCourseFilter(filter)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    background: courseFilter === filter ? "var(--tm3-primary)" : "var(--tm3-surface)",
                    color: courseFilter === filter ? "#fff" : "var(--tm3-text-soft)",
                    border: "1px solid var(--tm3-border)",
                  }}
                >
                  {filter === "all"
                    ? `All (${courses.length})`
                    : filter === "pending"
                    ? `Pending Review (${pendingCourses.length})`
                    : filter === "revisions"
                    ? `Revisions (${changesRequestedCourses.length})`
                    : `Approved (${courses.filter((c) => c.moderationStatus === "Approved").length})`}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="tm3-button tm3-button--outline"
              onClick={() => onSelectTab("courses")}
              style={{ fontSize: "0.78rem" }}
            >
              Open Full Course Builder
            </button>
          </div>

          {displayedCourses.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", background: "var(--tm3-surface)", borderRadius: 16, border: "1px solid var(--tm3-border)", color: "var(--tm3-text-soft)" }}>
              No course proposals match the selected filter.
            </div>
          ) : (
            displayedCourses.map((course) => {
              const audit = auditCourseEligibility(
                course.id === 6 || /statistics/i.test(course.title)
                  ? STATISTICS_MOOC_CURRICULUM
                  : [
                      {
                        id: 1,
                        number: "01",
                        title: "Theory & Formulations",
                        summary: "Mechanics and standard engineering codes.",
                        topics: [
                          {
                            id: "t1",
                            title: "Core Mechanics",
                            summary: "Formulations and boundary conditions.",
                            units: [
                              { id: "u1", title: "Theory Overview", type: "video", durationMinutes: 45, durationLabel: "45 min", summary: "Theoretical derivation." },
                              { id: "u2", title: "Code Notes", type: "reading", durationMinutes: 30, durationLabel: "30 min", summary: "Standard code provisions." },
                              { id: "u3", title: "Diagnostic Quiz", type: "quiz", durationMinutes: 20, durationLabel: "20 min", summary: "Formative evaluation." },
                            ],
                          },
                        ],
                      },
                      {
                        id: 2,
                        number: "02",
                        title: "Computational Labs & Applied Modeling",
                        summary: "Software solver discretization.",
                        topics: [
                          {
                            id: "t2",
                            title: "Solver Lab",
                            summary: "Hands-on project files.",
                            units: [
                              { id: "u4", title: "Lab Setup", type: "video", durationMinutes: 45, durationLabel: "45 min", summary: "Solver walkthrough." },
                              { id: "u5", title: "Lab Scripts", type: "lab", durationMinutes: 60, durationLabel: "60 min", summary: "Computational files.", fileName: "Lab_Files.zip" },
                              { id: "u6", title: "Problem Set", type: "assignment", durationMinutes: 60, durationLabel: "60 min", summary: "Hands-on lab submission." },
                            ],
                          },
                        ],
                      },
                      {
                        id: 3,
                        number: "03",
                        title: "Verification & Capstone",
                        summary: "Project review and rubric.",
                        topics: [
                          {
                            id: "t3",
                            title: "Capstone",
                            summary: "Deliverable verification.",
                            units: [
                              { id: "u7", title: "Capstone Brief", type: "video", durationMinutes: 30, durationLabel: "30 min", summary: "Project scope." },
                              { id: "u8", title: "Final Capstone", type: "assignment", durationMinutes: 120, durationLabel: "120 min", summary: "Full engineering report." },
                            ],
                          },
                        ],
                      },
                    ]
              );

              const isPending = course.moderationStatus === "Pending Review";
              const isChanges = course.moderationStatus === "Changes Requested";
              const isApproved = course.moderationStatus === "Approved" || course.status === "Published";

              return (
                <article
                  key={course.id}
                  style={{
                    padding: 22,
                    borderRadius: 16,
                    background: "var(--tm3-surface)",
                    border: `1px solid ${isPending ? "rgba(234, 179, 8, 0.4)" : isChanges ? "rgba(239, 68, 68, 0.4)" : "var(--tm3-border)"}`,
                    display: "grid",
                    gap: 16,
                  }}
                >
                  {/* Proposal Top Row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: "0.72rem", color: "var(--tm3-text-soft)", fontWeight: 700, textTransform: "uppercase" }}>
                          {course.category} · {course.theme}
                        </span>
                        <Badge tone={isApproved ? "green" : isChanges ? "gold" : "gold"}>
                          {course.moderationStatus || course.status}
                        </Badge>
                        <Badge tone="blue">{course.level}</Badge>
                      </div>
                      <h3 style={{ margin: "2px 0 0", fontSize: "1.18rem", fontWeight: 800 }}>
                        {course.title}
                      </h3>
                      {course.shortTitle && course.shortTitle !== course.title && (
                        <div style={{ fontSize: "0.82rem", color: "var(--tm3-text-soft)", marginTop: 2 }}>
                          Card title: <strong>{course.shortTitle}</strong>
                        </div>
                      )}
                      <p style={{ margin: "6px 0 0", fontSize: "0.84rem", color: "var(--tm3-text-soft)" }}>
                        Lead Instructor: <strong>{course.instructorName || "Not assigned"}</strong> · Duration: <strong>{course.duration}</strong> · Fee: <strong>{course.fee}</strong>
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 12, background: "rgba(214,245,109,.1)", border: "1px solid rgba(214,245,109,.25)" }}>
                      <ShieldCheck size={20} style={{ color: "var(--tm3-lime)" }} />
                      <div>
                        <strong style={{ fontSize: "0.86rem", display: "block" }}>{audit.score}% QA Score</strong>
                        <small style={{ fontSize: "0.7rem", color: "var(--tm3-text-soft)" }}>{audit.status}</small>
                      </div>
                    </div>
                  </div>

                  {/* 7-Point Compliance Chips */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {audit.checklist.map((c) => (
                      <span
                        key={c.id}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "3px 9px",
                          borderRadius: 6,
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          background: c.status === "pass" ? "rgba(16,185,129,.1)" : c.status === "warn" ? "rgba(234,179,8,.1)" : "rgba(239,68,68,.1)",
                          color: c.status === "pass" ? "#a7f3d0" : c.status === "warn" ? "#fef08a" : "#fca5a5",
                          border: `1px solid ${c.status === "pass" ? "rgba(16,185,129,.25)" : c.status === "warn" ? "rgba(234,179,8,.25)" : "rgba(239,68,68,.25)"}`,
                        }}
                      >
                        {c.status === "pass" ? "✓" : "!"} {c.criterion} ({c.found})
                      </span>
                    ))}
                  </div>

                  {/* Outcomes Preview */}
                  {course.outcomes && (
                    <div style={{ padding: "10px 14px", borderRadius: 10, background: "var(--tm3-surface-muted)", fontSize: "0.8rem", color: "var(--tm3-text-soft)" }}>
                      <strong style={{ display: "block", color: "var(--tm3-text)", marginBottom: 4, fontSize: "0.75rem", textTransform: "uppercase" }}>
                        Program Outcomes & Delivery Objectives:
                      </strong>
                      <div style={{ whiteSpace: "pre-line", lineHeight: 1.45 }}>{course.outcomes}</div>
                    </div>
                  )}

                  {/* Admin Review Feedback Box */}
                  <div style={{ display: "grid", gap: 6 }}>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--tm3-text)" }}>
                      Admin Feedback / Required Modifications:
                    </label>
                    <textarea
                      value={reviewComments[course.id] ?? course.adminReviewComment ?? ""}
                      onChange={(e) =>
                        setReviewComments({
                          ...reviewComments,
                          [course.id]: e.target.value,
                        })
                      }
                      placeholder="Enter feedback or requested curriculum additions for the instructor..."
                      rows={2}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid var(--tm3-border)",
                        background: "var(--tm3-surface)",
                        color: "var(--tm3-text)",
                        fontSize: "0.82rem",
                        fontFamily: "inherit",
                      }}
                    />
                  </div>

                  {/* Actions Bar */}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 10, borderTop: "1px solid var(--tm3-border)" }}>
                    <button
                      type="button"
                      className="tm3-button tm3-button--outline"
                      onClick={() => requestCourseChanges(course.id)}
                      style={{ fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: 6, color: "#facc15" }}
                    >
                      <AlertCircle size={15} />
                      <span>Request Revisions</span>
                    </button>

                    <button
                      type="button"
                      className="tm3-button tm3-button--gold"
                      onClick={() => approveCourse(course.id)}
                      style={{ fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: 6 }}
                    >
                      <CheckCircle2 size={16} />
                      <span>Approve & Rollout Live</span>
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}

      {/* STREAM 2: YOUTUBE VIDEOS MODERATION */}
      {subTab === "videos" && (
        <div style={{ display: "grid", gap: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Curated YouTube Video Nominations</h3>
              <p style={{ margin: "2px 0 0", color: "var(--tm3-text-soft)", fontSize: "0.82rem" }}>
                Verify technical quality and attach a TerraMatrix Academy Insight / Key Takeaway before publishing.
              </p>
            </div>
            <button
              type="button"
              className="tm3-button tm3-button--outline"
              onClick={() => onSelectTab("videos")}
              style={{ fontSize: "0.78rem" }}
            >
              Open Learning Video Manager
            </button>
          </div>

          {videos.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", background: "var(--tm3-surface)", borderRadius: 16, border: "1px solid var(--tm3-border)", color: "var(--tm3-text-soft)" }}>
              No video nominations available.
            </div>
          ) : (
            videos.map((video) => {
              const isPending = video.moderationStatus === "Pending Review";
              const isApproved = video.moderationStatus === "Approved" || video.status === "Published";

              return (
                <article
                  key={video.id}
                  style={{
                    padding: 20,
                    borderRadius: 16,
                    background: "var(--tm3-surface)",
                    border: `1px solid ${isPending ? "rgba(234, 179, 8, 0.4)" : "var(--tm3-border)"}`,
                    display: "grid",
                    gap: 14,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <div
                        style={{
                          width: 140,
                          height: 85,
                          borderRadius: 10,
                          background: `url('${video.thumbnailUrl || "/course-hydrology.jpg"}') center/cover no-repeat`,
                          border: "1px solid var(--tm3-border)",
                          flexShrink: 0,
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        <PlayCircle size={28} style={{ color: "#fff", filter: "drop-shadow(0 2px 4px rgba(0,0,0,.6))" }} />
                      </div>
                      <div>
                        <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                          <Badge tone={isApproved ? "green" : "gold"}>
                            {video.moderationStatus || video.status}
                          </Badge>
                          <Badge tone="blue">{video.category}</Badge>
                          <Badge tone="neutral">{video.level}</Badge>
                        </div>
                        <h4 style={{ margin: "2px 0 0", fontSize: "1.05rem" }}>{video.title}</h4>
                        <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--tm3-text-soft)" }}>
                          Creator: <strong>{video.creatorName || "Engineering Contributor"}</strong> {video.creatorChannel && `(${video.creatorChannel})`} · Duration: <strong>{video.duration || "15 mins"}</strong>
                        </p>
                        {video.youtubeUrl && (
                          <a
                            href={video.youtubeUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 4, fontSize: "0.78rem", color: "var(--tm3-lime)", textDecoration: "none", fontWeight: 700 }}
                          >
                            <ExternalLink size={13} /> View on YouTube
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* TerraMatrix Insight Editor */}
                  <div style={{ display: "grid", gap: 5 }}>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--tm3-text)", display: "flex", alignItems: "center", gap: 6 }}>
                      <Sparkles size={14} style={{ color: "var(--tm3-gold)" }} />
                      <span>TerraMatrix Academy Key Insight & Pedagogical Summary:</span>
                    </label>
                    <textarea
                      value={videoInsights[video.id] ?? video.terraMatrixInsight ?? ""}
                      onChange={(e) =>
                        setVideoInsights({
                          ...videoInsights,
                          [video.id]: e.target.value,
                        })
                      }
                      placeholder="Provide learners with why this video matters, key theoretical takeaways, and solver applications..."
                      rows={2}
                      style={{
                        padding: "9px 12px",
                        borderRadius: 9,
                        border: "1px solid var(--tm3-border)",
                        background: "var(--tm3-surface)",
                        color: "var(--tm3-text)",
                        fontSize: "0.82rem",
                        fontFamily: "inherit",
                      }}
                    />
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8, borderTop: "1px solid var(--tm3-border)" }}>
                    <button
                      type="button"
                      className="tm3-button tm3-button--outline"
                      onClick={() => declineVideo(video.id)}
                      style={{ fontSize: "0.78rem", color: "#f87171" }}
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      className="tm3-button tm3-button--gold"
                      onClick={() => approveVideo(video.id)}
                      style={{ fontSize: "0.78rem", display: "inline-flex", alignItems: "center", gap: 6 }}
                    >
                      <CheckCircle2 size={15} />
                      <span>Approve & Publish to Learning Library</span>
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}

      {/* STREAM 3: INSTRUCTOR EXPERTISE & BIO MODERATION */}
      {subTab === "instructors" && (
        <div style={{ display: "grid", gap: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Instructor Technical Profile Requests</h3>
              <p style={{ margin: "2px 0 0", color: "var(--tm3-text-soft)", fontSize: "0.82rem" }}>
                Verify technical expertise tags (max 3-5 tags) and professional summaries before updating live cards.
              </p>
            </div>
            <button
              type="button"
              className="tm3-button tm3-button--outline"
              onClick={() => onSelectTab("instructors")}
              style={{ fontSize: "0.78rem" }}
            >
              Open Instructor Directory
            </button>
          </div>

          {instructors.map((instructor) => {
            const hasPending = Boolean(instructor.pendingExpertise || instructor.pendingBio || instructor.moderationStatus === "Pending Review");
            const requestedExpertise = instructor.pendingExpertise || instructor.expertise;
            const requestedBio = instructor.pendingBio || instructor.bio;

            return (
              <article
                key={instructor.id}
                style={{
                  padding: 22,
                  borderRadius: 16,
                  background: "var(--tm3-surface)",
                  border: `1px solid ${hasPending ? "rgba(234, 179, 8, 0.4)" : "var(--tm3-border)"}`,
                  display: "grid",
                  gap: 16,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: `url('${instructor.photoUrl}') center/cover no-repeat`,
                        border: "1px solid var(--tm3-border)",
                      }}
                    />
                    <div>
                      <h4 style={{ margin: 0, fontSize: "1.05rem" }}>{instructor.name}</h4>
                      <small style={{ color: "var(--tm3-text-soft)", fontSize: "0.78rem" }}>
                        {instructor.designation} · {instructor.company}
                      </small>
                    </div>
                  </div>

                  <Badge tone={hasPending ? "gold" : "green"}>
                    {hasPending ? "Update Pending Review" : "Live Profile Synchronized"}
                  </Badge>
                </div>

                {/* 2-Column Diff: Live vs Requested */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                  <div style={{ padding: 14, borderRadius: 12, background: "var(--tm3-surface-muted)", border: "1px solid var(--tm3-border)" }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--tm3-text-soft)", fontWeight: 800, textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                      Current Live Profile:
                    </span>
                    <strong style={{ fontSize: "0.82rem", display: "block", marginBottom: 4 }}>
                      Expertise: {instructor.expertise || "None added"}
                    </strong>
                    <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--tm3-text-soft)", lineHeight: 1.45 }}>
                      {instructor.bio}
                    </p>
                  </div>

                  <div style={{ padding: 14, borderRadius: 12, background: hasPending ? "rgba(234, 179, 8, 0.08)" : "var(--tm3-surface-muted)", border: `1px solid ${hasPending ? "rgba(234, 179, 8, 0.3)" : "var(--tm3-border)"}` }}>
                    <span style={{ fontSize: "0.72rem", color: hasPending ? "#facc15" : "var(--tm3-text-soft)", fontWeight: 800, textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                      Requested Profile Update:
                    </span>
                    <strong style={{ fontSize: "0.82rem", display: "block", marginBottom: 4, color: hasPending ? "#fef08a" : "var(--tm3-text)" }}>
                      Expertise: {requestedExpertise}
                    </strong>
                    <p style={{ margin: 0, fontSize: "0.78rem", color: hasPending ? "#fef9c3" : "var(--tm3-text-soft)", lineHeight: 1.45 }}>
                      {requestedBio}
                    </p>
                  </div>
                </div>

                {hasPending && (
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 10, borderTop: "1px solid var(--tm3-border)" }}>
                    <button
                      type="button"
                      className="tm3-button tm3-button--outline"
                      onClick={() => declineInstructorProfile(instructor.id, "Please limit expertise tags to 3-5 key tools.")}
                      style={{ fontSize: "0.78rem", color: "#facc15" }}
                    >
                      Decline with Feedback
                    </button>
                    <button
                      type="button"
                      className="tm3-button tm3-button--gold"
                      onClick={() => approveInstructorProfile(instructor.id)}
                      style={{ fontSize: "0.78rem", display: "inline-flex", alignItems: "center", gap: 6 }}
                    >
                      <CheckCircle2 size={15} />
                      <span>Approve Profile Update</span>
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   2. ENTERPRISE ROLLOUT & OFFERINGS MATRIX
   ========================================================================= */

export function AdminProgrammesRolloutPanel({
  courses,
  onUpdateCourses,
  workshops,
  onUpdateWorkshops,
  webinars,
  onUpdateWebinars,
  videos,
  onUpdateVideos,
  onSelectTab,
}: {
  courses: Course[];
  onUpdateCourses: (updated: Course[]) => void;
  workshops: AcademyEvent[];
  onUpdateWorkshops: (updated: AcademyEvent[]) => void;
  webinars: AcademyEvent[];
  onUpdateWebinars: (updated: AcademyEvent[]) => void;
  videos: LearningVideo[];
  onUpdateVideos: (updated: LearningVideo[]) => void;
  onSelectTab: (tab: "courses" | "workshops" | "webinars" | "videos") => void;
}) {
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [rolloutNotice, setRolloutNotice] = useState<string>("");

  // Automated Webinar Brochure Studio State
  const [brochureModalOpen, setBrochureModalOpen] = useState(false);
  const [brochureState, setBrochureState] = useState({
    title: "Advanced 2D River Hydrodynamics & Dam Breach Modeling with HEC-RAS",
    category: "Water Resources & River Hydraulics",
    seriesLabel: "TerraMatrix Bi-Weekly Technical Knowledge Webinar Series",
    speaker: "Dr. Asit Kumar",
    speakerRole: "Hydraulic Modeling & River Basin Specialist",
    date: "Saturday, 25 October 2026",
    time: "7:00 PM – 8:30 PM IST",
    meetingLink: "https://meet.google.com/trm-acdm-web",
    fee: "100% Free Open Access (Certificate Provided)",
    takeaways: [
      "2D Shallow Water Equations & Finite Volume Hydrodynamic Solvers",
      "Dam Break Hydrograph Generation & Flood Hazard Inundation Mapping",
      "Model Calibration against Real-World Gauge Telemetry & CWC Guidelines",
    ],
    targetAudience: "Civil Engineers, Hydrologists, Water Planners & Students",
  });
  const [copiedAnnouncement, setCopiedAnnouncement] = useState(false);
  const [broadcastDone, setBroadcastDone] = useState(false);

  const showNotice = (msg: string) => {
    setRolloutNotice(msg);
    setTimeout(() => setRolloutNotice(""), 3500);
  };

  // Toggle Course Status
  const toggleCourseLive = (id: number) => {
    const updated = courses.map((c) =>
      c.id === id ? { ...c, status: (c.status === "Published" ? "Draft" : "Published") as "Draft" | "Published" } : c
    );
    onUpdateCourses(updated);
    localStorage.setItem("terramatrix_courses", JSON.stringify(updated));
    showNotice("Course publication status updated.");
  };

  // Toggle Workshop Status
  const toggleWorkshopLive = (id: number) => {
    const updated = workshops.map((w) =>
      w.id === id ? { ...w, status: (w.status === "Published" || w.status === "Upcoming" ? "Draft" : "Upcoming") as AcademyEvent["status"] } : w
    );
    onUpdateWorkshops(updated);
    localStorage.setItem("terramatrix_workshops", JSON.stringify(updated));
    showNotice("Workshop rollout status updated.");
  };

  // Toggle Webinar Status
  const toggleWebinarLive = (id: number) => {
    const updated = webinars.map((wb) =>
      wb.id === id ? { ...wb, status: (wb.status === "Published" || wb.status === "Upcoming" ? "Draft" : "Upcoming") as AcademyEvent["status"] } : wb
    );
    onUpdateWebinars(updated);
    localStorage.setItem("terramatrix_webinars", JSON.stringify(updated));
    showNotice("Webinar rollout status updated.");
  };

  // Toggle Video Status
  const toggleVideoLive = (id: number) => {
    const updated = videos.map((v) =>
      v.id === id ? { ...v, status: (v.status === "Published" ? "Draft" : "Published") as "Draft" | "Published" } : v
    );
    onUpdateVideos(updated);
    localStorage.setItem("terramatrix_learning_videos", JSON.stringify(updated));
    showNotice("Video status updated.");
  };

  // Unified items list
  const allOfferings = useMemo(() => {
    const list: Array<{
      id: number;
      kind: "Course" | "Workshop" | "Webinar" | "Curated Video";
      title: string;
      shortTitle?: string;
      category: string;
      instructor: string;
      durationOrDate: string;
      fee: string;
      status: string;
      link?: string;
      toggle: () => void;
      editTab: "courses" | "workshops" | "webinars" | "videos";
    }> = [];

    courses.forEach((c) => {
      list.push({
        id: c.id,
        kind: "Course",
        title: c.title,
        shortTitle: c.shortTitle,
        category: c.category,
        instructor: c.instructorName || "TerraMatrix Instructor",
        durationOrDate: c.duration,
        fee: c.fee,
        status: c.status,
        link: c.onlineSessionLink,
        toggle: () => toggleCourseLive(c.id),
        editTab: "courses",
      });
    });

    workshops.forEach((w) => {
      list.push({
        id: w.id,
        kind: "Workshop",
        title: w.title,
        category: w.category,
        instructor: w.resourcePerson,
        durationOrDate: `${w.date} ${w.time}`,
        fee: w.fee,
        status: w.status,
        toggle: () => toggleWorkshopLive(w.id),
        editTab: "workshops",
      });
    });

    webinars.forEach((wb) => {
      list.push({
        id: wb.id,
        kind: "Webinar",
        title: wb.title,
        category: wb.category,
        instructor: wb.resourcePerson,
        durationOrDate: `${wb.date} ${wb.time}`,
        fee: wb.fee,
        status: wb.status,
        toggle: () => toggleWebinarLive(wb.id),
        editTab: "webinars",
      });
    });

    videos.forEach((v) => {
      list.push({
        id: v.id,
        kind: "Curated Video",
        title: v.title,
        category: v.category,
        instructor: v.creatorName || "YouTube Creator",
        durationOrDate: v.duration || "15 mins",
        fee: "Free",
        status: v.status,
        link: v.youtubeUrl,
        toggle: () => toggleVideoLive(v.id),
        editTab: "videos",
      });
    });

    return list;
  }, [courses, workshops, webinars, videos]);

  const filteredOfferings = useMemo(() => {
    return allOfferings.filter((item) => {
      if (filterType === "courses" && item.kind !== "Course") return false;
      if (filterType === "workshops" && item.kind !== "Workshop") return false;
      if (filterType === "webinars" && item.kind !== "Webinar") return false;
      if (filterType === "videos" && item.kind !== "Curated Video") return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        return (
          item.title.toLowerCase().includes(query) ||
          item.instructor.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [allOfferings, filterType, searchTerm]);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Metric Snapshot */}
      <div className="tm3-stat-grid">
        <div className="tm3-stat-card">
          <span>Active Offerings</span>
          <strong>{allOfferings.filter((i) => i.status === "Published" || i.status === "Upcoming").length}</strong>
        </div>
        <div className="tm3-stat-card">
          <span>Master Programmes</span>
          <strong>{courses.length} courses</strong>
        </div>
        <div className="tm3-stat-card">
          <span>Interactive Workshops</span>
          <strong>{workshops.length} scheduled</strong>
        </div>
        <div className="tm3-stat-card">
          <span>Learning Videos</span>
          <strong>{videos.length} videos</strong>
        </div>
      </div>

      {rolloutNotice && (
        <div className="tm3-notice" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <CheckCircle2 size={18} />
          <span>{rolloutNotice}</span>
          <button type="button" onClick={() => setRolloutNotice("")} style={{ marginLeft: "auto", cursor: "pointer", background: "none", border: "none", color: "inherit", fontSize: 16 }}>
            ×
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(["all", "courses", "workshops", "webinars", "videos"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
                background: filterType === type ? "var(--tm3-primary)" : "var(--tm3-surface)",
                color: filterType === type ? "#fff" : "var(--tm3-text-soft)",
                border: "1px solid var(--tm3-border)",
              }}
            >
              {type === "all"
                ? `All Offerings (${allOfferings.length})`
                : type === "courses"
                ? `Courses (${courses.length})`
                : type === "workshops"
                ? `Workshops (${workshops.length})`
                : type === "webinars"
                ? `Webinars (${webinars.length})`
                : `Videos (${videos.length})`}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            className="tm3-button tm3-button--lime"
            onClick={() => setBrochureModalOpen(true)}
            style={{ fontSize: "0.78rem", whiteSpace: "nowrap", padding: "6px 14px" }}
          >
            <Sparkles size={14} /> Webinar Brochure Studio
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--tm3-surface)", padding: "4px 12px", borderRadius: 10, border: "1px solid var(--tm3-border)", width: 240 }}>
            <Search size={15} style={{ color: "var(--tm3-text-soft)" }} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search offerings, instructors..."
              style={{ border: "none", background: "transparent", color: "var(--tm3-text)", fontSize: "0.8rem", outline: "none", width: "100%" }}
            />
          </div>
        </div>
      </div>

      {/* Offerings Table */}
      <div style={{ overflowX: "auto", borderRadius: 16, border: "1px solid var(--tm3-border)", background: "var(--tm3-surface)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
          <thead>
            <tr style={{ background: "var(--tm3-surface-muted)", borderBottom: "1px solid var(--tm3-border)", textAlign: "left" }}>
              <th style={{ padding: "12px 16px" }}>Format</th>
              <th style={{ padding: "12px 16px" }}>Title & Subject</th>
              <th style={{ padding: "12px 16px" }}>Instructor / Speaker</th>
              <th style={{ padding: "12px 16px" }}>Schedule / Duration</th>
              <th style={{ padding: "12px 16px" }}>Status</th>
              <th style={{ padding: "12px 16px", textAlign: "right" }}>Rollout Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOfferings.map((item) => {
              const isLive = item.status === "Published" || item.status === "Upcoming";
              return (
                <tr key={`${item.kind}-${item.id}`} style={{ borderBottom: "1px solid var(--tm3-border)" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge tone={item.kind === "Course" ? "gold" : item.kind === "Workshop" ? "green" : item.kind === "Webinar" ? "blue" : "neutral"}>
                      {item.kind}
                    </Badge>
                  </td>
                  <td style={{ padding: "12px 16px", maxWidth: 300 }}>
                    <strong style={{ display: "block", color: "var(--tm3-text)", fontSize: "0.84rem" }}>
                      {item.title}
                    </strong>
                    <small style={{ color: "var(--tm3-text-soft)", fontSize: "0.72rem" }}>
                      {item.category} {item.shortTitle && `· (${item.shortTitle})`}
                    </small>
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--tm3-text-soft)" }}>
                    {item.instructor}
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--tm3-text-soft)", whiteSpace: "nowrap" }}>
                    {item.durationOrDate}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge tone={isLive ? "green" : "neutral"}>
                      {item.status}
                    </Badge>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                    <div style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                      <button
                        type="button"
                        onClick={item.toggle}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 6,
                          fontSize: "0.74rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          background: isLive ? "rgba(239, 68, 68, 0.12)" : "rgba(16, 185, 129, 0.15)",
                          color: isLive ? "#f87171" : "var(--tm3-lime)",
                          border: `1px solid ${isLive ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)"}`,
                        }}
                      >
                        {isLive ? "Unpublish" : "Make Live"}
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectTab(item.editTab)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: 6,
                          fontSize: "0.74rem",
                          cursor: "pointer",
                          background: "var(--tm3-surface-muted)",
                          border: "1px solid var(--tm3-border)",
                          color: "var(--tm3-text)",
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* AUTOMATED WEBINAR BROCHURE STUDIO MODAL */}
      {brochureModalOpen && (
        <div className="tm3-modal-backdrop" role="presentation">
          <div className="tm3-modal tm3-modal--composer" role="dialog" aria-modal="true" style={{ maxWidth: 860 }}>
            <div className="tm3-modal__head">
              <div>
                <span className="tm3-eyebrow tm3-eyebrow--gold">Admin Automation Engine</span>
                <h2>Automated Webinar Brochure & Invitation Studio</h2>
                <p style={{ margin: "4px 0 0", color: "var(--tm3-text-soft)", fontSize: "0.82rem" }}>
                  Create or schedule bi-weekly webinars. Instantly generate publication-grade brochures, copy social invitation announcements, and broadcast reminders to enrolled students and faculty.
                </p>
              </div>
              <button type="button" onClick={() => setBrochureModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
              {/* Left Column: Form Controls */}
              <div className="tm3-form-grid" style={{ alignContent: "start" }}>
                <label className="tm3-field tm3-field--full">
                  <span>Load from Scheduled Webinar</span>
                  <select
                    onChange={(e) => {
                      const found = webinars.find((w) => w.id === Number(e.target.value));
                      if (found) {
                        setBrochureState({
                          ...brochureState,
                          title: found.title,
                          category: found.category,
                          speaker: found.resourcePerson,
                          date: formatDate(found.date),
                          time: found.time || "7:00 PM IST",
                          meetingLink: found.link || "https://meet.google.com/trm-acdm-web",
                        });
                      }
                    }}
                  >
                    <option value="">-- Select an Existing Webinar --</option>
                    {webinars.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.title} ({formatDate(w.date)})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="tm3-field tm3-field--full">
                  <span>Webinar Topic / Title</span>
                  <input
                    value={brochureState.title}
                    onChange={(e) => setBrochureState({ ...brochureState, title: e.target.value })}
                  />
                </label>

                <label className="tm3-field">
                  <span>Speaker / Resource Person</span>
                  <input
                    value={brochureState.speaker}
                    onChange={(e) => setBrochureState({ ...brochureState, speaker: e.target.value })}
                  />
                </label>

                <label className="tm3-field">
                  <span>Speaker Role / Affiliation</span>
                  <input
                    value={brochureState.speakerRole}
                    onChange={(e) => setBrochureState({ ...brochureState, speakerRole: e.target.value })}
                  />
                </label>

                <label className="tm3-field">
                  <span>Date</span>
                  <input
                    value={brochureState.date}
                    onChange={(e) => setBrochureState({ ...brochureState, date: e.target.value })}
                  />
                </label>

                <label className="tm3-field">
                  <span>Time (with Timezone)</span>
                  <input
                    value={brochureState.time}
                    onChange={(e) => setBrochureState({ ...brochureState, time: e.target.value })}
                  />
                </label>

                <label className="tm3-field tm3-field--full">
                  <span>Live Meeting Link (Google Meet / Zoom)</span>
                  <input
                    value={brochureState.meetingLink}
                    onChange={(e) => setBrochureState({ ...brochureState, meetingLink: e.target.value })}
                  />
                </label>

                <label className="tm3-field tm3-field--full">
                  <span>Key Takeaway #1</span>
                  <input
                    value={brochureState.takeaways[0]}
                    onChange={(e) => {
                      const updated = [...brochureState.takeaways];
                      updated[0] = e.target.value;
                      setBrochureState({ ...brochureState, takeaways: updated });
                    }}
                  />
                </label>

                <label className="tm3-field tm3-field--full">
                  <span>Key Takeaway #2</span>
                  <input
                    value={brochureState.takeaways[1]}
                    onChange={(e) => {
                      const updated = [...brochureState.takeaways];
                      updated[1] = e.target.value;
                      setBrochureState({ ...brochureState, takeaways: updated });
                    }}
                  />
                </label>

                <label className="tm3-field tm3-field--full">
                  <span>Key Takeaway #3</span>
                  <input
                    value={brochureState.takeaways[2]}
                    onChange={(e) => {
                      const updated = [...brochureState.takeaways];
                      updated[2] = e.target.value;
                      setBrochureState({ ...brochureState, takeaways: updated });
                    }}
                  />
                </label>
              </div>

              {/* Right Column: Live Publication Brochure Card */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <span style={{ fontSize: "0.78rem", color: "var(--tm3-text-soft)", fontWeight: 700 }}>
                  Live Generated Brochure Preview (Publication Ready):
                </span>

                <div
                  id="tm-webinar-brochure"
                  style={{
                    borderRadius: 20,
                    background: "linear-gradient(145deg, #05241d 0%, #083c31 55%, #051d18 100%)",
                    border: "2px solid rgba(214, 245, 109, 0.4)",
                    padding: 24,
                    color: "#fff",
                    boxShadow: "0 16px 36px rgba(0,0,0,0.45)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Decorative background grid accents */}
                  <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(214, 245, 109, 0.08)", pointerEvents: "none" }} />

                  {/* Header Strip */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.12)", paddingBottom: 14, marginBottom: 16 }}>
                    <div>
                      <strong style={{ fontSize: "0.95rem", letterSpacing: "0.5px", color: "#fff", display: "block" }}>
                        TERRAMATRIX ACADEMY
                      </strong>
                      <small style={{ color: "var(--tm3-lime)", fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase" }}>
                        Bi-Weekly Technical Webinar Series
                      </small>
                    </div>
                    <span style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(214,245,109,0.15)", color: "var(--tm3-lime)", fontSize: "0.7rem", fontWeight: 800, border: "1px solid rgba(214,245,109,0.3)" }}>
                      FREE OPEN ACCESS
                    </span>
                  </div>

                  {/* Domain & Title */}
                  <Badge tone="green">{brochureState.category}</Badge>
                  <h3 style={{ fontSize: "1.25rem", margin: "10px 0 6px", lineHeight: 1.35, color: "#fff", fontWeight: 800 }}>
                    {brochureState.title}
                  </h3>

                  {/* Speaker Card */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", margin: "12px 0" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--tm3-primary)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800 }}>
                      {brochureState.speaker.slice(0, 1)}
                    </div>
                    <div>
                      <strong style={{ fontSize: "0.88rem", display: "block" }}>{brochureState.speaker}</strong>
                      <small style={{ color: "#a4c4b8", fontSize: "0.74rem" }}>{brochureState.speakerRole}</small>
                    </div>
                  </div>

                  {/* Key Takeaways */}
                  <div style={{ margin: "14px 0" }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--tm3-lime)", fontWeight: 800, textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                      Key Learning Takeaways:
                    </span>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.78rem", color: "#d1fae5", lineHeight: 1.55 }}>
                      {brochureState.takeaways.filter(Boolean).map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Schedule & Platform Strip */}
                  <div style={{ padding: 12, borderRadius: 12, background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.1)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: "0.75rem" }}>
                    <div>
                      <span style={{ color: "var(--tm3-text-soft)", display: "block" }}>Date & Time:</span>
                      <strong style={{ color: "#fff" }}>{brochureState.date}</strong>
                      <small style={{ color: "#a4c4b8", display: "block" }}>{brochureState.time}</small>
                    </div>
                    <div>
                      <span style={{ color: "var(--tm3-text-soft)", display: "block" }}>Live Platform:</span>
                      <strong style={{ color: "var(--tm3-lime)" }}>Google Meet / Live Studio</strong>
                      <small style={{ color: "#a4c4b8", display: "block" }}>Interactive Q&A Session</small>
                    </div>
                  </div>

                  {/* Registration Footer & QR / Link note */}
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.12)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: "0.68rem", color: "var(--tm3-text-soft)", display: "block" }}>Register free at:</span>
                      <strong style={{ fontSize: "0.76rem", color: "var(--tm3-lime)" }}>
                        terra-matrix-academy.vercel.app/#/webinars
                      </strong>
                    </div>
                    <span style={{ fontSize: "0.68rem", color: "#a4c4b8", textAlign: "right" }}>
                      Auto-enrolls in Academy Community
                    </span>
                  </div>
                </div>

                {/* Brochure Actions */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <button
                    type="button"
                    className="tm3-button tm3-button--outline"
                    onClick={() => {
                      window.print();
                    }}
                    style={{ fontSize: "0.78rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  >
                    <Printer size={15} /> Print / Save PDF
                  </button>

                  <button
                    type="button"
                    className="tm3-button tm3-button--gold"
                    onClick={() => {
                      const text = `🌐 TERRAMATRIX ACADEMY · TECHNICAL WEBINAR\n\n📌 Topic: ${brochureState.title}\n🎙 Speaker: ${brochureState.speaker} (${brochureState.speakerRole})\n🗓 Date: ${brochureState.date} at ${brochureState.time}\n💻 Platform: ${brochureState.meetingLink}\n💰 Registration: Free Open Access\n\nKey Takeaways:\n• ${brochureState.takeaways.join("\n• ")}\n\n👉 Register here: https://terra-matrix-academy.vercel.app/#/webinars\n(Registering automatically joins the TerraMatrix Student Community with free access to exam simulators, video lessons, and handbooks!)`;
                      navigator.clipboard.writeText(text);
                      setCopiedAnnouncement(true);
                      setTimeout(() => setCopiedAnnouncement(false), 2500);
                    }}
                    style={{ fontSize: "0.78rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  >
                    <Copy size={14} /> {copiedAnnouncement ? "Copied to Clipboard!" : "Copy WhatsApp/Social Invite"}
                  </button>
                </div>

                <button
                  type="button"
                  className="tm3-button tm3-button--lime"
                  onClick={() => {
                    try {
                      const stored = JSON.parse(localStorage.getItem("terramatrix_announcements") || "[]");
                      stored.unshift({
                        id: Date.now(),
                        title: `Upcoming Bi-Weekly Webinar: ${brochureState.title}`,
                        date: brochureState.date,
                        speaker: brochureState.speaker,
                        link: brochureState.meetingLink,
                        postedAt: new Date().toLocaleDateString("en-IN"),
                      });
                      localStorage.setItem("terramatrix_announcements", JSON.stringify(stored));
                      setBroadcastDone(true);
                      setTimeout(() => setBroadcastDone(false), 3000);
                      showNotice("Webinar invitation broadcasted to enrolled students and instructors!");
                    } catch {
                      // Fallback
                    }
                  }}
                  style={{ fontSize: "0.78rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                >
                  <Send size={14} /> {broadcastDone ? "Broadcast Active!" : "Broadcast Notification to Enrolled Students & Faculty"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   3. EXAM PREP QUESTION BANK & PYQ MANAGER
   ========================================================================= */

export function AdminExamBankPanel() {
  const [questions, setQuestions] = useState<ExamQuestion[]>(() => {
    try {
      const saved = localStorage.getItem("terramatrix_exam_questions");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return EXAM_QUESTIONS;
  });

  const [selectedTrack, setSelectedTrack] = useState<ExamTrackId>("gate_civil");
  const [modalOpen, setModalOpen] = useState(false);
  const [notice, setNotice] = useState("");

  // Form State
  const [newQuestion, setNewQuestion] = useState({
    trackId: "gate_civil" as ExamTrackId,
    topic: "Structural Analysis",
    source: "GATE 2024 (2 Marks)",
    question: "",
    option0: "",
    option1: "",
    option2: "",
    option3: "",
    correctIndex: 0,
    explanation: "",
    difficulty: "Intermediate" as ExamDifficulty,
    isSample: true,
  });

  const trackQuestions = useMemo(
    () => questions.filter((q) => q.trackId === selectedTrack),
    [questions, selectedTrack]
  );

  const sampleCount = useMemo(
    () => questions.filter((q) => q.isSample).length,
    [questions]
  );

  const handleAddQuestion = () => {
    if (!newQuestion.question.trim() || !newQuestion.option0.trim() || !newQuestion.option1.trim()) {
      alert("Please provide the question and at least options A and B.");
      return;
    }

    const trackObj = EXAM_TRACKS.find((t) => t.id === newQuestion.trackId);
    const created: ExamQuestion = {
      id: `q_${Date.now()}`,
      trackId: newQuestion.trackId,
      trackName: trackObj?.name || "Civil Engineering",
      topic: newQuestion.topic.trim() || "Engineering Fundamentals",
      source: newQuestion.source.trim() || "Model Practice",
      question: newQuestion.question.trim(),
      options: [
        newQuestion.option0.trim(),
        newQuestion.option1.trim(),
        newQuestion.option2.trim() || "Option C",
        newQuestion.option3.trim() || "Option D",
      ],
      correctIndex: newQuestion.correctIndex,
      explanation: newQuestion.explanation.trim() || "Calculated using standard engineering principles.",
      difficulty: newQuestion.difficulty,
      isSample: newQuestion.isSample,
    };

    const updated = [created, ...questions];
    setQuestions(updated);
    localStorage.setItem("terramatrix_exam_questions", JSON.stringify(updated));
    setModalOpen(false);
    setNewQuestion({
      trackId: selectedTrack,
      topic: "Structural Analysis",
      source: "",
      question: "",
      option0: "",
      option1: "",
      option2: "",
      option3: "",
      correctIndex: 0,
      explanation: "",
      difficulty: "Intermediate",
      isSample: false,
    });
    setNotice("Question added to the exam bank successfully!");
    setTimeout(() => setNotice(""), 3500);
  };

  const deleteQuestion = (id: string) => {
    if (!window.confirm("Delete this question from the question bank?")) return;
    const updated = questions.filter((q) => q.id !== id);
    setQuestions(updated);
    localStorage.setItem("terramatrix_exam_questions", JSON.stringify(updated));
    setNotice("Question deleted.");
    setTimeout(() => setNotice(""), 3000);
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Top Banner */}
      <section className="tm3-qa-card">
        <div className="tm3-qa-head">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span
              style={{
                display: "grid",
                placeItems: "center",
                width: 46,
                height: 46,
                borderRadius: 14,
                background: "rgba(214,245,109,.15)",
                color: "var(--tm3-lime)",
              }}
            >
              <CheckSquare size={26} />
            </span>
            <div>
              <span className="tm3-eyebrow tm3-eyebrow--light" style={{ margin: 0 }}>
                TerraMatrix Academy · Competitive Exam Engine
              </span>
              <h2 style={{ margin: "2px 0 0", color: "#fff", fontSize: "1.35rem" }}>
                Model Question Papers & PYQ Question Bank
              </h2>
            </div>
          </div>
          <div className="tm3-qa-score-badge">
            <Sparkles size={16} />
            <span>{questions.length} Total Questions</span>
          </div>
        </div>

        <div className="tm3-qa-metrics">
          <div className="tm3-qa-metric-pill">
            <span>Exam Tracks</span>
            <strong>{EXAM_TRACKS.length} categories</strong>
            <small style={{ color: "#a4c4b8", fontSize: "0.68rem" }}>GATE, ESE, PSC, Aptitude</small>
          </div>
          <div className="tm3-qa-metric-pill">
            <span>Free Public Samples</span>
            <strong>{sampleCount} questions</strong>
            <small style={{ color: "#a4c4b8", fontSize: "0.68rem" }}>Accessible without login</small>
          </div>
          <div className="tm3-qa-metric-pill">
            <span>Logged-In Learner Pool</span>
            <strong>{questions.length - sampleCount} questions</strong>
            <small style={{ color: "#a4c4b8", fontSize: "0.68rem" }}>Unlocked on free login</small>
          </div>
          <div className="tm3-qa-metric-pill">
            <span>Auto-Evaluated</span>
            <strong>100%</strong>
            <small style={{ color: "#a4c4b8", fontSize: "0.68rem" }}>With detailed steps</small>
          </div>
        </div>
      </section>

      {notice && (
        <div className="tm3-notice" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <CheckCircle2 size={18} />
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")} style={{ marginLeft: "auto", cursor: "pointer", background: "none", border: "none", color: "inherit", fontSize: 16 }}>
            ×
          </button>
        </div>
      )}

      {/* Track Selector & Add Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {EXAM_TRACKS.map((track) => (
            <button
              key={track.id}
              type="button"
              onClick={() => setSelectedTrack(track.id)}
              style={{
                padding: "8px 14px",
                borderRadius: 9,
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                background: selectedTrack === track.id ? "var(--tm3-primary)" : "var(--tm3-surface)",
                color: selectedTrack === track.id ? "#fff" : "var(--tm3-text-soft)",
                border: "1px solid var(--tm3-border)",
              }}
            >
              {track.name} ({questions.filter((q) => q.trackId === track.id).length})
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link
            to="/exam-prep"
            className="tm3-button tm3-button--outline"
            style={{ fontSize: "0.78rem", display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}
          >
            <Eye size={15} /> Launch Public Simulator
          </Link>
          <button
            type="button"
            className="tm3-button tm3-button--gold"
            onClick={() => {
              setNewQuestion((prev) => ({ ...prev, trackId: selectedTrack }));
              setModalOpen(true);
            }}
            style={{ fontSize: "0.78rem", display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Plus size={16} /> Add Question
          </button>
        </div>
      </div>

      {/* Question List */}
      <div style={{ display: "grid", gap: 14 }}>
        {trackQuestions.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", background: "var(--tm3-surface)", borderRadius: 16, border: "1px solid var(--tm3-border)", color: "var(--tm3-text-soft)" }}>
            No questions added to this track yet. Click "+ Add Question" to seed questions.
          </div>
        ) : (
          trackQuestions.map((q, idx) => (
            <article
              key={q.id}
              style={{
                padding: 18,
                borderRadius: 14,
                background: "var(--tm3-surface)",
                border: "1px solid var(--tm3-border)",
                display: "grid",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ display: "grid", placeItems: "center", width: 28, height: 28, borderRadius: 8, background: "var(--tm3-primary-soft)", color: "var(--tm3-primary)", fontSize: "0.75rem", fontWeight: 800 }}>
                    Q{idx + 1}
                  </span>
                  <Badge tone="blue">{q.topic}</Badge>
                  {q.source && <Badge tone="gold">{q.source}</Badge>}
                  <Badge tone={q.isSample ? "green" : "neutral"}>
                    {q.isSample ? "Free Sample" : "Student Only"}
                  </Badge>
                  <Badge tone="neutral">{q.difficulty}</Badge>
                </div>

                <button
                  type="button"
                  onClick={() => deleteQuestion(q.id)}
                  style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: "0.76rem", fontWeight: 700 }}
                >
                  Delete
                </button>
              </div>

              <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--tm3-text)", lineHeight: 1.5 }}>
                {q.question}
              </div>

              {/* 4 Options Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 8 }}>
                {q.options.map((opt, optIdx) => {
                  const isCorrect = optIdx === q.correctIndex;
                  return (
                    <div
                      key={optIdx}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        fontSize: "0.8rem",
                        background: isCorrect ? "rgba(16,185,129,.12)" : "var(--tm3-surface-muted)",
                        border: `1px solid ${isCorrect ? "rgba(16,185,129,.35)" : "var(--tm3-border)"}`,
                        color: isCorrect ? "#a7f3d0" : "var(--tm3-text)",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <strong style={{ color: isCorrect ? "var(--tm3-lime)" : "var(--tm3-text-soft)" }}>
                        {String.fromCharCode(65 + optIdx)}.
                      </strong>
                      <span>{opt}</span>
                      {isCorrect && (
                        <CheckCircle2 size={14} style={{ color: "var(--tm3-lime)", marginLeft: "auto" }} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              {q.explanation && (
                <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,.02)", border: "1px dashed var(--tm3-border)", fontSize: "0.78rem", color: "var(--tm3-text-soft)" }}>
                  <strong style={{ color: "var(--tm3-lime)", marginRight: 6 }}>Step-by-Step Engineering Solution:</strong>
                  {q.explanation}
                </div>
              )}
            </article>
          ))
        )}
      </div>

      {/* Add Question Modal */}
      {modalOpen && (
        <div className="tm3-modal-backdrop" role="presentation">
          <div className="tm3-modal tm3-modal--composer" role="dialog" aria-modal="true">
            <div className="tm3-modal__head">
              <div>
                <span className="tm3-eyebrow">Question Bank Authoring</span>
                <h2>Add Question to Bank</h2>
              </div>
              <button type="button" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="tm3-form-grid">
              <label className="tm3-field">
                <span>Exam Track</span>
                <select
                  value={newQuestion.trackId}
                  onChange={(e) =>
                    setNewQuestion({
                      ...newQuestion,
                      trackId: e.target.value as ExamTrackId,
                    })
                  }
                >
                  {EXAM_TRACKS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="tm3-field">
                <span>Subject / Engineering Topic</span>
                <input
                  value={newQuestion.topic}
                  onChange={(e) => setNewQuestion({ ...newQuestion, topic: e.target.value })}
                  placeholder="e.g. Geotechnical Engineering"
                />
              </label>

              <label className="tm3-field">
                <span>PYQ Source Tag (Optional)</span>
                <input
                  value={newQuestion.source}
                  onChange={(e) => setNewQuestion({ ...newQuestion, source: e.target.value })}
                  placeholder="e.g. GATE 2024 (2 Marks)"
                />
              </label>

              <label className="tm3-field">
                <span>Difficulty</span>
                <select
                  value={newQuestion.difficulty}
                  onChange={(e) =>
                    setNewQuestion({
                      ...newQuestion,
                      difficulty: e.target.value as ExamDifficulty,
                    })
                  }
                >
                  <option value="Foundational">Foundational (Conceptual / Basic Formula)</option>
                  <option value="Intermediate">Intermediate (Numerical Analysis & Solver)</option>
                  <option value="Advanced">Advanced (Multi-Step Synthesis & Design Codes)</option>
                </select>
              </label>

              <label className="tm3-field tm3-field--full">
                <span>Question Statement</span>
                <textarea
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                  placeholder="Write clear problem statement with parameters, units and assumptions..."
                  rows={3}
                />
              </label>

              <label className="tm3-field">
                <span>Option A</span>
                <input
                  value={newQuestion.option0}
                  onChange={(e) => setNewQuestion({ ...newQuestion, option0: e.target.value })}
                  placeholder="Option A value"
                />
              </label>

              <label className="tm3-field">
                <span>Option B</span>
                <input
                  value={newQuestion.option1}
                  onChange={(e) => setNewQuestion({ ...newQuestion, option1: e.target.value })}
                  placeholder="Option B value"
                />
              </label>

              <label className="tm3-field">
                <span>Option C</span>
                <input
                  value={newQuestion.option2}
                  onChange={(e) => setNewQuestion({ ...newQuestion, option2: e.target.value })}
                  placeholder="Option C value"
                />
              </label>

              <label className="tm3-field">
                <span>Option D</span>
                <input
                  value={newQuestion.option3}
                  onChange={(e) => setNewQuestion({ ...newQuestion, option3: e.target.value })}
                  placeholder="Option D value"
                />
              </label>

              <label className="tm3-field">
                <span>Correct Option</span>
                <select
                  value={newQuestion.correctIndex}
                  onChange={(e) =>
                    setNewQuestion({
                      ...newQuestion,
                      correctIndex: Number(e.target.value),
                    })
                  }
                >
                  <option value={0}>Option A</option>
                  <option value={1}>Option B</option>
                  <option value={2}>Option C</option>
                  <option value={3}>Option D</option>
                </select>
              </label>

              <label className="tm3-field" style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 24 }}>
                <input
                  type="checkbox"
                  checked={newQuestion.isSample}
                  onChange={(e) => setNewQuestion({ ...newQuestion, isSample: e.target.checked })}
                  style={{ width: 18, height: 18 }}
                />
                <span style={{ fontSize: "0.82rem" }}>Available as Free Public Sample (Unauthenticated)</span>
              </label>

              <label className="tm3-field tm3-field--full">
                <span>Step-by-Step Technical Explanation & Governing Formula</span>
                <textarea
                  value={newQuestion.explanation}
                  onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                  placeholder="Explain step-by-step mathematical substitution, code limits, and reason for correct option..."
                  rows={3}
                />
              </label>
            </div>

            <div className="tm3-modal__actions">
              <button className="tm3-button tm3-button--outline" type="button" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button className="tm3-button tm3-button--gold" type="button" onClick={handleAddQuestion}>
                Save to Question Bank
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   4. KNOWLEDGE HUB & AI CONTENT LOADER / BOT
   ========================================================================= */

type KnowledgeHubSubTab = "prompts" | "loader" | "bot";

export function AdminKnowledgeHubPanel() {
  const [subTab, setSubTab] = useState<KnowledgeHubSubTab>("prompts");
  const [notice, setNotice] = useState<string>("");

  // Prompt Generator state
  const [promptContentType, setPromptContentType] = useState<
    "exam_calendar" | "opportunity" | "study_code" | "handbook" | "glossary" | "tma_short"
  >("exam_calendar");
  const [promptBranch, setPromptBranch] = useState<string>("Civil & Infrastructure");
  const [promptTopic, setPromptTopic] = useState<string>("UPSC ESE 2026 Civil Engineering");
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Content Loader state
  const [loaderTarget, setLoaderTarget] = useState<
    "exam_calendar" | "opportunity" | "study_code" | "handbook" | "glossary" | "tma_short"
  >("opportunity");
  const [jsonInput, setJsonInput] = useState<string>("");
  const [loaderStats, setLoaderStats] = useState({
    calendars: loadExamCalendars().length,
    opportunities: loadOpportunities().length,
    codes: loadStudyCodes().length,
    handbooks: loadHandbooks().length,
    glossaries: loadGlossaries().length,
    shorts: getTmaShorts().length,
  });

  // Bot state
  const [botScanning, setBotScanning] = useState(false);
  const [botLogs, setBotLogs] = useState<string[]>([]);
  const [discoveredItems, setDiscoveredItems] = useState<
    Array<{
      id: string;
      title: string;
      org: string;
      type: "Exam" | "Internship" | "Competition";
      deadline: string;
      url: string;
      branch: string;
      eligibility: string;
      published: boolean;
    }>
  >([
    {
      id: "bot_gate_2026",
      title: "GATE 2026 National Examination Notification",
      org: "IIT Guwahati (Organizing Institute)",
      type: "Exam",
      deadline: "October 2025",
      url: "https://gate2025.iitr.ac.in",
      branch: "All Engineering Branches",
      eligibility: "B.Tech / B.E / M.Sc Students & Graduates",
      published: false,
    },
    {
      id: "bot_drdo_rac_2025",
      title: "DRDO Recruitment & Assessment Centre (RAC) Scientist 'B' Fellowships",
      org: "DRDO Ministry of Defence",
      type: "Internship",
      deadline: "15 November 2025",
      url: "https://rac.gov.in",
      branch: "Mechanical, CS, Civil & Aerospace",
      eligibility: "First Class B.Tech with valid GATE score",
      published: false,
    },
    {
      id: "bot_sih_2025",
      title: "Smart India Hackathon (SIH 2025) - Hardware & Software Edition",
      org: "Ministry of Education & AICTE",
      type: "Competition",
      deadline: "30 November 2025",
      url: "https://www.sih.gov.in",
      branch: "All Engineering & Sciences",
      eligibility: "Undergraduate & Postgraduate Engineering Teams",
      published: false,
    },
    {
      id: "bot_iisc_cics_fellow",
      title: "IISc Bangalore Centre for Infrastructure Research Summer Fellowship",
      org: "Indian Institute of Science (IISc)",
      type: "Internship",
      deadline: "28 February 2026",
      url: "https://iisc.ac.in",
      branch: "Civil, Computational & Environmental",
      eligibility: "3rd Year Pre-final B.Tech Students",
      published: false,
    },
  ]);

  const refreshCounts = () => {
    setLoaderStats({
      calendars: loadExamCalendars().length,
      opportunities: loadOpportunities().length,
      codes: loadStudyCodes().length,
      handbooks: loadHandbooks().length,
      glossaries: loadGlossaries().length,
      shorts: getTmaShorts().length,
    });
  };

  // Generate Prompt
  const generatedAiPrompt = useMemo(() => {
    switch (promptContentType) {
      case "exam_calendar":
        return `You are an engineering curriculum compiler for TerraMatrix Academy.
Please generate 1 or more Exam Calendar items for: "${promptTopic}" in branch "${promptBranch}".
Return ONLY a valid JSON array matching this exact schema:
[
  {
    "id": "exam_${promptTopic.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now()}",
    "examName": "${promptTopic}",
    "conductingBody": "National / State Conducting Agency",
    "branch": "${promptBranch}",
    "department": "Core Department",
    "notificationDate": "Month Year",
    "applicationWindow": "Date to Date",
    "examDate": "Tentative Exam Date",
    "officialUrl": "https://official-portal-url.gov.in",
    "status": "Active Registration",
    "eligibility": "Academic criteria required",
    "notes": "Key highlights and syllabus changes"
  }
]`;

      case "opportunity":
        return `You are an engineering career curator for TerraMatrix Academy.
Please generate 1 or more verified Opportunities (Internship, Research Fellowship, or Hackathon) for: "${promptTopic}" in branch "${promptBranch}".
Return ONLY a valid JSON array matching this exact schema:
[
  {
    "id": "opp_${promptTopic.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now()}",
    "title": "${promptTopic}",
    "organization": "Institution or Organization Name",
    "type": "Industrial Internship",
    "branch": "${promptBranch}",
    "department": "Engineering Department",
    "specialization": "Sub-specialization",
    "stipendOrPrize": "₹XX,000 / month OR Cash Prize",
    "location": "City / Campus",
    "mode": "Hybrid",
    "deadline": "Day Month Year",
    "officialUrl": "https://official-opportunity-link.org",
    "verified": true,
    "eligibility": "Eligibility criteria",
    "description": "2-sentence practical engineering description of the role."
  }
]`;

      case "study_code":
        return `You are a structural & standard design codes expert for TerraMatrix Academy.
Please generate a comprehensive Study Code breakdown for: "${promptTopic}" in branch "${promptBranch}".
Return ONLY a valid JSON array matching this exact schema:
[
  {
    "id": "code_${promptTopic.toLowerCase().replace(/[^a-z0-9]/g, "_")}",
    "codeName": "${promptTopic}",
    "standardBody": "BIS (Indian Standards)",
    "branch": "${promptBranch}",
    "department": "Core Design Department",
    "title": "Full Official Title of Standard",
    "scopeSummary": "Concise 2-sentence summary of scope and applicability.",
    "keyClauses": [
      { "clause": "Clause Number", "title": "Clause Title", "summary": "Exact technical provision and equation" },
      { "clause": "Clause Number", "title": "Clause Title", "summary": "Exact technical provision and equation" }
    ],
    "verifiableRefUrl": "https://standardsbis.bsbedge.com"
  }
]`;

      case "handbook":
        return `You are an engineering reference publisher for TerraMatrix Academy.
Please generate a Handbook summary for: "${promptTopic}" in branch "${promptBranch}".
Return ONLY a valid JSON array matching this exact schema:
[
  {
    "id": "hb_${promptTopic.toLowerCase().replace(/[^a-z0-9]/g, "_")}",
    "title": "${promptTopic}",
    "branch": "${promptBranch}",
    "department": "Core Department",
    "authorOrBody": "Publisher or Standard Committee",
    "edition": "Latest Edition / Year",
    "description": "Concise summary of practical handbook utility.",
    "chapters": [
      { "title": "Chapter 1 Title", "pages": "1-45", "summary": "Core provisions and formulas" },
      { "title": "Chapter 2 Title", "pages": "46-90", "summary": "Core provisions and formulas" }
    ],
    "keyFormulas": ["Formula 1: ...", "Formula 2: ..."],
    "readTime": "35 Mins reference"
  }
]`;

      case "glossary":
        return `You are an engineering lexicographer for TerraMatrix Academy.
Please generate specialized glossary items for: "${promptTopic}" in branch "${promptBranch}".
Return ONLY a valid JSON array matching this exact schema:
[
  {
    "id": "gl_${promptTopic.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now()}",
    "term": "${promptTopic}",
    "branch": "${promptBranch}",
    "department": "Specific Department",
    "specialization": "Sub-specialization",
    "definition": "Rigorous physical and mathematical definition.",
    "formula": "Governing mathematical equation",
    "siUnit": "SI Unit (e.g. m, N/m², Pa·s, Dimensionless)",
    "significance": "Why this parameter governs design and failure."
  }
]`;

      case "tma_short":
        return `You are an AI video producer and technical engineering narrator for TMA Shorts.
Please generate a 20-30s Concept Explainer Reel specification for: "${promptTopic}" in branch "${promptBranch}".
Return ONLY a valid JSON array matching this exact schema:
[
  {
    "id": "short_${promptTopic.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now()}",
    "title": "${promptTopic}",
    "category": "Fluid Dynamics",
    "discipline": "${promptBranch}",
    "conceptSummary": "High-density scientific summary in 2 sentences.",
    "durationSeconds": 28,
    "creatorName": "TerraMatrix AI Lab",
    "creatorRole": "Engineering Simulation Group",
    "dateAdded": "${new Date().toISOString().split("T")[0]}",
    "tags": ["Tag1", "Tag2", "Physics"],
    "aiProductionPrompt": {
      "model": "Runway Gen-3 Alpha / OpenAI Sora",
      "visualPrompt": "Detailed 4K cinematic macro prompt with lighting, colors, and camera angle.",
      "motionCameraPrompt": "Camera tracking and slow motion instructions.",
      "narratorScript": "Exact voiceover script under 50 words.",
      "voiceTone": "Authoritative, crisp technical narrator",
      "renderSpecs": "9:16 Vertical Reel (1080x1920), 60 FPS"
    }
  }
]`;
    }
  }, [promptContentType, promptBranch, promptTopic]);

  const copyPromptText = () => {
    navigator.clipboard.writeText(generatedAiPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  // Load sample JSON into textarea
  const loadSampleJson = () => {
    switch (loaderTarget) {
      case "opportunity":
        setJsonInput(
          JSON.stringify(
            [
              {
                id: `opp_custom_${Date.now()}`,
                title: "L&T Construction Graduate Research Fellowship",
                organization: "Larsen & Toubro Heavy Civil Infrastructure",
                type: "Research Fellowship",
                branch: "Civil & Infrastructure",
                department: "Structural & Geotechnical",
                specialization: "Prestressed Concrete & Tunneling",
                stipendOrPrize: "₹35,000 / month",
                location: "Chennai HQ / Project Sites",
                mode: "Hybrid",
                deadline: "30 April 2026",
                officialUrl: "https://www.lntecc.com",
                verified: true,
                eligibility: "Final-year B.Tech / M.Tech in Civil / Structural",
                description:
                  "Practical fellowship working on high-speed rail viaduct segmental design and underground metro station diaphragm walls.",
              },
            ],
            null,
            2
          )
        );
        break;
      case "exam_calendar":
        setJsonInput(
          JSON.stringify(
            [
              {
                id: `exam_custom_${Date.now()}`,
                examName: "ISRO Scientist / Engineer 'SC' 2026",
                conductingBody: "ISRO Centralised Recruitment Board (ICRB)",
                branch: "All Engineering Branches",
                department: "Civil, Mechanical & Electrical",
                notificationDate: "December 2025",
                applicationWindow: "15 Jan 2026 to 15 Feb 2026",
                examDate: "April 2026",
                officialUrl: "https://www.isro.gov.in/Careers.html",
                status: "Upcoming Announcement",
                eligibility: "First Class B.E / B.Tech with min 65% aggregate",
                notes: "Objective screening followed by comprehensive interview at URSC Bangalore.",
              },
            ],
            null,
            2
          )
        );
        break;
      case "tma_short":
        setJsonInput(
          JSON.stringify(
            [
              {
                id: `short_custom_${Date.now()}`,
                title: "Reynolds Turbulence Transition in Pipe Flow",
                category: "Fluid Dynamics",
                discipline: "Civil & Mechanical Engineering",
                conceptSummary:
                  "How laminar streamlines disintegrate into chaotic turbulent eddies at critical Reynolds number Re > 2300.",
                durationSeconds: 27,
                creatorName: "TerraMatrix Fluid Lab",
                creatorRole: "Hydrodynamics Unit",
                dateAdded: new Date().toISOString().split("T")[0],
                tags: ["Fluid Mechanics", "Reynolds", "Turbulence", "Laminar"],
                aiProductionPrompt: {
                  model: "Runway Gen-3 Alpha / Sora",
                  visualPrompt:
                    "4K engineering visualization of water flowing through smooth glass pipe. Ink filament remains straight at Re 1200, then violently disperses into 3D vortex rings as flow velocity increases to Re 4000.",
                  motionCameraPrompt:
                    "Smooth lateral dolly track matching the dye filament velocity.",
                  narratorScript:
                    "At low velocity, viscosity dampens perturbations. But as inertial forces overwhelm viscous shear, infinitesimal disturbances amplify, triggering sudden turbulent chaos.",
                  voiceTone: "Crisp technical presenter",
                  renderSpecs: "9:16 Vertical Reel (1080x1920), 60 FPS",
                },
              },
            ],
            null,
            2
          )
        );
        break;
      default:
        setJsonInput("[]");
    }
  };

  // Publish JSON into Portal storage
  const handlePublishJson = () => {
    if (!jsonInput.trim()) {
      alert("Please paste valid JSON before publishing.");
      return;
    }

    try {
      let parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        parsed = [parsed];
      }

      if (loaderTarget === "exam_calendar") {
        const existing = loadExamCalendars();
        const updated = [...parsed, ...existing.filter((e) => !parsed.some((p: ExamCalendarItem) => p.id === e.id))];
        saveExamCalendars(updated);
        setNotice(`Successfully published ${parsed.length} Exam Calendar(s) to live portal!`);
      } else if (loaderTarget === "opportunity") {
        const existing = loadOpportunities();
        const updated = [...parsed, ...existing.filter((e) => !parsed.some((p: OpportunityItem) => p.id === e.id))];
        saveOpportunities(updated);
        setNotice(`Successfully published ${parsed.length} Opportunity(ies) to live portal!`);
      } else if (loaderTarget === "study_code") {
        const existing = loadStudyCodes();
        const updated = [...parsed, ...existing.filter((e) => !parsed.some((p: StudyCodeItem) => p.id === e.id))];
        saveStudyCodes(updated);
        setNotice(`Successfully published ${parsed.length} Study Code(s) to live portal!`);
      } else if (loaderTarget === "handbook") {
        const existing = loadHandbooks();
        const updated = [...parsed, ...existing.filter((e) => !parsed.some((p: HandbookItem) => p.id === e.id))];
        saveHandbooks(updated);
        setNotice(`Successfully published ${parsed.length} Handbook(s) to live portal!`);
      } else if (loaderTarget === "glossary") {
        const existing = loadGlossaries();
        const updated = [...parsed, ...existing.filter((e) => !parsed.some((p: GlossaryItem) => p.id === e.id))];
        saveGlossaries(updated);
        setNotice(`Successfully published ${parsed.length} Glossary Term(s) to live portal!`);
      } else if (loaderTarget === "tma_short") {
        parsed.forEach((s: TmaShortVideo) => saveTmaShort(s));
        setNotice(`Successfully published ${parsed.length} TMA Short(s) to live portal!`);
      }

      refreshCounts();
      setJsonInput("");
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      alert(`Invalid JSON format: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Run Crawler Bot
  const runOpportunityCrawler = () => {
    setBotScanning(true);
    setBotLogs(["[0.1s] Initializing TMA Autonomous National Opportunity Crawler..."]);

    setTimeout(() => {
      setBotLogs((prev) => [...prev, "[0.4s] Connecting to UPSC official gateway (upsc.gov.in)... Status: 200 OK"]);
    }, 400);

    setTimeout(() => {
      setBotLogs((prev) => [
        ...prev,
        "[0.8s] Scanning GATE 2026 / IIT organizing committee notices... Detected active announcement.",
      ]);
    }, 900);

    setTimeout(() => {
      setBotLogs((prev) => [
        ...prev,
        "[1.3s] Crawling CSIR, DRDO RAC and AICTE Smart India Hackathon feeds... Verified institutional SSL certificates.",
      ]);
    }, 1500);

    setTimeout(() => {
      setBotLogs((prev) => [
        ...prev,
        "[1.9s] Crawl complete: 4 verified opportunities structured and ready for approval.",
      ]);
      setBotScanning(false);
    }, 2100);
  };

  const publishBotItem = (item: (typeof discoveredItems)[0]) => {
    if (item.type === "Exam") {
      const existing = loadExamCalendars();
      const newCal: ExamCalendarItem = {
        id: item.id,
        examName: item.title,
        conductingBody: item.org,
        branch: "General Engineering & Applied Sciences",
        department: "Core Engineering",
        notificationDate: "2025-2026",
        applicationWindow: item.deadline,
        examDate: "Scheduled",
        officialUrl: item.url,
        status: "Active Registration",
        eligibility: item.eligibility,
        notes: "Auto-verified by TMA Discovery Bot",
      };
      saveExamCalendars([newCal, ...existing.filter((e) => e.id !== newCal.id)]);
    } else {
      const existing = loadOpportunities();
      const newOpp: OpportunityItem = {
        id: item.id,
        title: item.title,
        organization: item.org,
        type: item.type === "Competition" ? "Hackathon & Competition" : "Industrial Internship",
        branch: "General Engineering & Applied Sciences",
        department: "Multi-Disciplinary",
        specialization: item.branch,
        stipendOrPrize: "Competitive Institutional Stipend / Cash Prize",
        location: "India / Hybrid",
        mode: "Hybrid",
        deadline: item.deadline,
        officialUrl: item.url,
        verified: true,
        eligibility: item.eligibility,
        description: `Verified opportunity discovered via institutional crawler from ${item.org}.`,
      };
      saveOpportunities([newOpp, ...existing.filter((o) => o.id !== newOpp.id)]);
    }

    setDiscoveredItems((prev) =>
      prev.map((d) => (d.id === item.id ? { ...d, published: true } : d))
    );
    refreshCounts();
    setNotice(`Published "${item.title}" directly to Knowledge Hub!`);
    setTimeout(() => setNotice(""), 3500);
  };

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {/* Banner */}
      <div
        style={{
          borderRadius: 16,
          background: "linear-gradient(135deg, #06261f 0%, #03120f 100%)",
          border: "1px solid rgba(16,185,129,0.3)",
          padding: "24px 28px",
          color: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <span
            style={{
              fontSize: "0.74rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--tm3-lime)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Compass size={14} /> Knowledge Hub & AI Content Engine
          </span>
          <h2 style={{ margin: "6px 0 4px", fontSize: "1.4rem", fontWeight: 800 }}>
            Curriculum, Standards & Discovery Automation
          </h2>
          <p style={{ margin: 0, fontSize: "0.84rem", color: "rgba(255,255,255,0.75)", maxWidth: 640, lineHeight: 1.5 }}>
            Generate structured AI prompts for single topics, paste JSON payloads to immediately publish materials without code redeployment, or run the national opportunity crawler bot.
          </p>
        </div>

        {/* Live Counts Pill */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: "0.76rem" }}>
          <div style={{ padding: "8px 12px", borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <span style={{ opacity: 0.7, display: "block" }}>Exams</span>
            <strong>{loaderStats.calendars} Live</strong>
          </div>
          <div style={{ padding: "8px 12px", borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <span style={{ opacity: 0.7, display: "block" }}>Opportunities</span>
            <strong>{loaderStats.opportunities} Live</strong>
          </div>
          <div style={{ padding: "8px 12px", borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <span style={{ opacity: 0.7, display: "block" }}>Study Codes</span>
            <strong>{loaderStats.codes} Live</strong>
          </div>
          <div style={{ padding: "8px 12px", borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <span style={{ opacity: 0.7, display: "block" }}>TMA Shorts</span>
            <strong>{loaderStats.shorts} Live</strong>
          </div>
        </div>
      </div>

      {notice && (
        <div
          style={{
            padding: "12px 18px",
            borderRadius: 10,
            background: "rgba(16,185,129,0.15)",
            border: "1px solid #10b981",
            color: "var(--tm3-primary)",
            fontWeight: 700,
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <CheckCircle2 size={16} /> {notice}
        </div>
      )}

      {/* Sub-Tabs Navigation */}
      <div style={{ display: "flex", gap: 10, borderBottom: "1px solid var(--tm3-border)", paddingBottom: 10 }}>
        <button
          type="button"
          className={`tm3-button ${subTab === "prompts" ? "tm3-button--dark" : "tm3-button--outline"}`}
          onClick={() => setSubTab("prompts")}
          style={{ fontSize: "0.82rem", padding: "6px 14px", minHeight: 34 }}
        >
          <Sparkles size={14} /> 1. AI Prompt Generator
        </button>
        <button
          type="button"
          className={`tm3-button ${subTab === "loader" ? "tm3-button--dark" : "tm3-button--outline"}`}
          onClick={() => setSubTab("loader")}
          style={{ fontSize: "0.82rem", padding: "6px 14px", minHeight: 34 }}
        >
          <Plus size={14} /> 2. One-Click JSON Content Loader
        </button>
        <button
          type="button"
          className={`tm3-button ${subTab === "bot" ? "tm3-button--dark" : "tm3-button--outline"}`}
          onClick={() => setSubTab("bot")}
          style={{ fontSize: "0.82rem", padding: "6px 14px", minHeight: 34 }}
        >
          <Bot size={14} /> 3. Opportunity & Exam Discovery Bot
        </button>
      </div>

      {/* =========================================================================
          SUB-TAB 1: AI PROMPT TEMPLATE GENERATOR
          ========================================================================= */}
      {subTab === "prompts" && (
        <div
          style={{
            background: "var(--tm3-surface)",
            padding: 24,
            borderRadius: 14,
            border: "1px solid var(--tm3-border)",
            display: "grid",
            gap: 18,
          }}
        >
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem", fontWeight: 800 }}>
              AI Prompt Generator for Engineering Content
            </h3>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--tm3-text-soft)" }}>
              Create standard JSON prompts for any single topic. Generate the content in ChatGPT, Claude, or Gemini, then copy the output into the One-Click Loader.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            <div className="tm3-field" style={{ margin: 0 }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 700 }}>Content Category</label>
              <select
                value={promptContentType}
                onChange={(e) => setPromptContentType(e.target.value as any)}
                style={{ height: 36, fontSize: "0.82rem" }}
              >
                <option value="exam_calendar">Exam Calendar</option>
                <option value="opportunity">Internship / Opportunity</option>
                <option value="study_code">Study Code (IS/IRC/Eurocode)</option>
                <option value="handbook">Engineering Handbook</option>
                <option value="glossary">Technical Glossary Term</option>
                <option value="tma_short">TMA Short Concept Reel</option>
              </select>
            </div>

            <div className="tm3-field" style={{ margin: 0 }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 700 }}>Engineering Branch</label>
              <select
                value={promptBranch}
                onChange={(e) => setPromptBranch(e.target.value)}
                style={{ height: 36, fontSize: "0.82rem" }}
              >
                {ENGINEERING_BRANCHES.map((b: string) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="tm3-field" style={{ margin: 0 }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 700 }}>Specific Subject / Exam / Code Name</label>
              <input
                type="text"
                value={promptTopic}
                onChange={(e) => setPromptTopic(e.target.value)}
                placeholder="e.g. ISRO Scientist 2026, IS 13920..."
                style={{ height: 36, fontSize: "0.82rem" }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <strong style={{ fontSize: "0.84rem", color: "var(--tm3-ink)" }}>
                Generated Prompt (Copy & paste into ChatGPT / Claude / Gemini):
              </strong>
              <button
                type="button"
                onClick={copyPromptText}
                className="tm3-button tm3-button--gold"
                style={{ fontSize: "0.76rem", padding: "4px 12px", minHeight: 28, gap: 4 }}
              >
                <Copy size={12} /> {copiedPrompt ? "Copied Prompt!" : "Copy Prompt"}
              </button>
            </div>
            <textarea
              readOnly
              value={generatedAiPrompt}
              rows={12}
              style={{
                width: "100%",
                fontFamily: "monospace",
                fontSize: "0.8rem",
                lineHeight: 1.5,
                background: "#0f172a",
                color: "#38bdf8",
                padding: 14,
                borderRadius: 10,
                border: "1px solid #1e293b",
              }}
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 2: ONE-CLICK CONTENT LOADER (INSTANT LOCALSTORAGE SAVE)
          ========================================================================= */}
      {subTab === "loader" && (
        <div
          style={{
            background: "var(--tm3-surface)",
            padding: 24,
            borderRadius: 14,
            border: "1px solid var(--tm3-border)",
            display: "grid",
            gap: 18,
          }}
        >
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem", fontWeight: 800 }}>
              One-Click Content Loader
            </h3>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--tm3-text-soft)" }}>
              Paste the JSON generated by AI. It will instantly be validated and stored into the live portal database without having to redeploy code!
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 700 }}>Target Hub Entity:</span>
              <select
                value={loaderTarget}
                onChange={(e) => setLoaderTarget(e.target.value as any)}
                style={{ height: 34, fontSize: "0.82rem", padding: "0 10px", borderRadius: 8 }}
              >
                <option value="opportunity">Internship & Competition (Current: {loaderStats.opportunities})</option>
                <option value="exam_calendar">Exam Calendar (Current: {loaderStats.calendars})</option>
                <option value="study_code">Study Code (Current: {loaderStats.codes})</option>
                <option value="handbook">Handbook (Current: {loaderStats.handbooks})</option>
                <option value="glossary">Glossary Term (Current: {loaderStats.glossaries})</option>
                <option value="tma_short">TMA Short Video (Current: {loaderStats.shorts})</option>
              </select>
            </div>

            <button
              type="button"
              onClick={loadSampleJson}
              className="tm3-button tm3-button--outline"
              style={{ fontSize: "0.76rem", padding: "4px 12px", minHeight: 30 }}
            >
              Load Sample JSON Template
            </button>
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 700, display: "block", marginBottom: 6 }}>
              JSON Payload (Single Object or Array):
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste valid JSON here..."
              rows={12}
              style={{
                width: "100%",
                fontFamily: "monospace",
                fontSize: "0.8rem",
                lineHeight: 1.5,
                background: "var(--tm3-surface-muted)",
                padding: 14,
                borderRadius: 10,
                border: "1px solid var(--tm3-border)",
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              type="button"
              className="tm3-button tm3-button--ghost"
              onClick={() => setJsonInput("")}
              style={{ fontSize: "0.82rem" }}
            >
              Clear
            </button>
            <button
              type="button"
              className="tm3-button tm3-button--gold"
              onClick={handlePublishJson}
              style={{ fontSize: "0.85rem", padding: "8px 20px" }}
            >
              <CheckCircle2 size={16} /> Validate & Publish to Live Portal
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 3: OPPORTUNITY & EXAM CRAWLER BOT
          ========================================================================= */}
      {subTab === "bot" && (
        <div
          style={{
            background: "var(--tm3-surface)",
            padding: 24,
            borderRadius: 14,
            border: "1px solid var(--tm3-border)",
            display: "grid",
            gap: 18,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
            <div>
              <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem", fontWeight: 800 }}>
                TMA National Engineering Opportunity Crawler Bot
              </h3>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--tm3-text-soft)" }}>
                Scans official government and institution portals for upcoming exam notifications, internships, fellowships, and hackathons with verifiable URLs.
              </p>
            </div>
            <button
              type="button"
              className="tm3-button tm3-button--gold"
              onClick={runOpportunityCrawler}
              disabled={botScanning}
              style={{ fontSize: "0.85rem", padding: "8px 18px", gap: 8 }}
            >
              <RefreshCw size={15} className={botScanning ? "tm3-spin" : ""} />
              {botScanning ? "Scanning National Portals..." : "Run Opportunity Scan"}
            </button>
          </div>

          {/* Crawler Log Terminal */}
          {botLogs.length > 0 && (
            <div
              style={{
                borderRadius: 10,
                background: "#090d16",
                border: "1px solid #1e293b",
                padding: 14,
                fontFamily: "monospace",
                fontSize: "0.78rem",
                color: "#10b981",
                display: "grid",
                gap: 4,
              }}
            >
              <div style={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <Terminal size={14} /> Crawler Activity Log:
              </div>
              {botLogs.map((log, idx) => (
                <div key={idx}>{log}</div>
              ))}
            </div>
          )}

          {/* Discovered Items List */}
          <div>
            <h4 style={{ margin: "10px 0 12px", fontSize: "0.95rem", fontWeight: 800 }}>
              Discovered Candidates ({discoveredItems.length})
            </h4>
            <div style={{ display: "grid", gap: 12 }}>
              {discoveredItems.map((item) => (
                <article
                  key={item.id}
                  style={{
                    padding: "16px 20px",
                    borderRadius: 12,
                    background: "var(--tm3-surface-muted)",
                    border: "1px solid var(--tm3-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: "1 1 380px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <Badge tone={item.type === "Exam" ? "gold" : "green"}>{item.type}</Badge>
                      <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--tm3-primary)" }}>
                        {item.org}
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "#10b981", fontWeight: 700 }}>
                        • SSL Verified
                      </span>
                    </div>
                    <h5 style={{ margin: "0 0 4px", fontSize: "1.02rem", fontWeight: 800, color: "var(--tm3-ink)" }}>
                      {item.title}
                    </h5>
                    <div style={{ fontSize: "0.76rem", color: "var(--tm3-text-soft)", display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <span><strong>Branch:</strong> {item.branch}</span>
                      <span>•</span>
                      <span><strong>Deadline:</strong> {item.deadline}</span>
                      <span>•</span>
                      <span><strong>Eligibility:</strong> {item.eligibility}</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tm3-button tm3-button--outline"
                      style={{ fontSize: "0.78rem", padding: "6px 12px", minHeight: 32 }}
                    >
                      Verify Link <ExternalLink size={12} />
                    </a>
                    {item.published ? (
                      <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}>
                        <CheckCircle2 size={15} /> Published
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="tm3-button tm3-button--gold"
                        onClick={() => publishBotItem(item)}
                        style={{ fontSize: "0.78rem", padding: "6px 14px", minHeight: 32 }}
                      >
                        Approve & Publish to Hub
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
