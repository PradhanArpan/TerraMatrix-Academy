import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Award,
  ChevronRight,
  Code,
  Copy,
  ExternalLink,
  Eye,
  Film,
  Layers,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Share2,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import { Badge, EmptyState, Metric, PageIntro } from "../components/Ui";
import {
  TMA_SHORTS_CATEGORIES,
  getTmaShorts,
  type TmaShortVideo,
} from "../lib/tmaShortsData";

export default function TmaShorts() {
  const [shorts, setShorts] = useState<TmaShortVideo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [activeShort, setActiveShort] = useState<TmaShortVideo | null>(null);

  // Simulation state for Bernoulli / Venturi interactive reel
  const [simPlaying, setSimPlaying] = useState(true);
  const [throatNarrowing, setThroatNarrowing] = useState<number>(0.3); // 30% throat diameter
  const [cavitationTriggered, setCavitationTriggered] = useState<boolean>(false);
  const [speechSpeaking, setSpeechSpeaking] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(true);

  // AI Prompt Modal
  const [promptModalShort, setPromptModalShort] = useState<TmaShortVideo | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  useEffect(() => {
    const list = getTmaShorts();
    setShorts(list);
    if (list.length > 0) {
      setActiveShort(list[0]);
    }
  }, []);

  const filteredShorts = useMemo(() => {
    if (selectedCategory === "All Categories") return shorts;
    return shorts.filter((s) => s.category === selectedCategory);
  }, [shorts, selectedCategory]);

  // Voice narration using Web Speech API
  const toggleSpeechNarration = (script?: string) => {
    if (!("speechSynthesis" in window)) return;

    if (speechSpeaking) {
      window.speechSynthesis.cancel();
      setSpeechSpeaking(false);
      return;
    }

    const textToSpeak =
      script ||
      activeShort?.aiProductionPrompt?.narratorScript ||
      "When fluid enters a constriction, mass conservation forces it to accelerate. By Bernoulli's equation, as kinetic energy surges, static pressure drops precipitously.";

    window.speechSynthesis.cancel(); // reset any ongoing
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Daniel") || v.name.includes("David"))
    ) || voices.find((v) => v.lang.startsWith("en"));
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => setSpeechSpeaking(true);
    utterance.onend = () => setSpeechSpeaking(false);
    utterance.onerror = () => setSpeechSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsAudioMuted(false);
  };

  const stopSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeechSpeaking(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <main>
      <PageIntro
        eyebrow="AI Concept Explainer Reels"
        title="TMA Shorts"
        description="High-density visual engineering explainers combining scientific simulation, mathematical derivations, and generative video prompts. Built for engineering learners to master complex phenomena in seconds."
        aside={
          <div style={{ display: "grid", gap: 10 }}>
            <Metric value="Vertical Reels" label="Format" helper="Concept-driven engineering" />
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--tm3-muted)", fontWeight: 700 }}>
              <Sparkles size={14} style={{ color: "var(--tm3-lime)" }} /> Generative AI & Physics Simulation
            </div>
          </div>
        }
      />

      <section className="tm3-shell" style={{ marginBottom: 60 }}>
        {/* Categories Pills */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 12,
            marginBottom: 28,
            borderBottom: "1px solid var(--tm3-border)",
          }}
        >
          {TMA_SHORTS_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`tm3-button ${selectedCategory === cat ? "tm3-button--dark" : "tm3-button--outline"}`}
              onClick={() => setSelectedCategory(cat)}
              style={{ fontSize: "0.8rem", padding: "6px 14px", minHeight: 34, flexShrink: 0 }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Two Column Layout: Main Reel Player on Left, Feed on Right */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 440px) 1fr", gap: 32, alignItems: "flex-start" }}>
          {/* =========================================================================
              ACTIVE 9:16 VERTICAL REEL PLAYER
              ========================================================================= */}
          {activeShort && (
            <div
              style={{
                borderRadius: 24,
                background: "#030c0a",
                border: "2px solid rgba(16, 185, 129, 0.4)",
                overflow: "hidden",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
                display: "flex",
                flexDirection: "column",
                position: "sticky",
                top: 80,
              }}
            >
              {/* Vertical Reel Aspect Ratio Box (9:16) */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "9/16",
                  background: "radial-gradient(ellipse at center, #06261f 0%, #020b08 100%)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: 20,
                  color: "#ffffff",
                  overflow: "hidden",
                }}
              >
                {/* Background SVG Streamline Physics Simulation for Bernoulli / Venturi */}
                {activeShort.interactiveSimType === "bernoulli_venturi" ? (
                  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.9 }}>
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 360 640"
                      preserveAspectRatio="xMidYMid slice"
                    >
                      <defs>
                        <linearGradient id="fluidGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                          <stop offset="50%" stopColor="#10b981" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
                        </linearGradient>
                        <radialGradient id="bubbleGlow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
                        </radialGradient>
                      </defs>

                      {/* Venturi Tube Glass Contour */}
                      <path
                        d="M 20 200 L 120 200 Q 180 270 200 270 L 220 270 Q 240 270 300 200 L 340 200"
                        fill="none"
                        stroke="rgba(255,255,255,0.4)"
                        strokeWidth="3"
                      />
                      <path
                        d="M 20 400 L 120 400 Q 180 330 200 330 L 220 330 Q 240 330 300 400 L 340 400"
                        fill="none"
                        stroke="rgba(255,255,255,0.4)"
                        strokeWidth="3"
                      />

                      {/* Manometer Tube 1 (Inlet - High Pressure Column) */}
                      <rect x="68" y="70" width="16" height="130" fill="rgba(6,182,212,0.3)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" rx="3" />
                      <line x1="68" y1="100" x2="84" y2="100" stroke="#10b981" strokeWidth="2.5" />
                      <text x="76" y="60" textAnchor="middle" fill="#67e8f9" fontSize="10" fontFamily="monospace" fontWeight="bold">P1: 200 kPa</text>

                      {/* Manometer Tube 2 (Throat - Depressed Pressure Column) */}
                      <rect x="202" y="160" width="16" height="110" fill="rgba(239,68,68,0.3)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" rx="3" />
                      <line x1="202" y1={cavitationTriggered ? "260" : "220"} x2="218" y2={cavitationTriggered ? "260" : "220"} stroke="#ef4444" strokeWidth="2.5" />
                      <text x="210" y="150" textAnchor="middle" fill={cavitationTriggered ? "#f87171" : "#fca5a5"} fontSize="10" fontFamily="monospace" fontWeight="bold">
                        {cavitationTriggered ? "P2: 2.1 kPa (Vapor)" : "P2: 18 kPa"}
                      </text>

                      {/* Streamlines with dashed animation */}
                      <path
                        d="M 20 250 Q 150 250 180 290 L 220 290 Q 250 290 340 250"
                        fill="none"
                        stroke="url(#fluidGrad)"
                        strokeWidth="2.5"
                        strokeDasharray="12, 6"
                        style={{ animation: simPlaying ? "streamlineFlow 1.2s linear infinite" : "none" }}
                      />
                      <path
                        d="M 20 300 Q 150 300 200 300 L 220 300 Q 250 300 340 300"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3.5"
                        strokeDasharray="16, 6"
                        style={{ animation: simPlaying ? "streamlineFlow 0.8s linear infinite" : "none" }}
                      />
                      <path
                        d="M 20 350 Q 150 350 180 310 L 220 310 Q 250 310 340 350"
                        fill="none"
                        stroke="url(#fluidGrad)"
                        strokeWidth="2.5"
                        strokeDasharray="12, 6"
                        style={{ animation: simPlaying ? "streamlineFlow 1.2s linear infinite" : "none" }}
                      />

                      {/* Velocity Vectors Overlay */}
                      <text x="50" y="295" fill="#a7f3d0" fontSize="11" fontFamily="monospace" fontWeight="bold">v1 = 2.0 m/s</text>
                      <text x="180" y="325" fill="#fde047" fontSize="12" fontFamily="monospace" fontWeight="bold">v2 = 12.5 m/s ⚡</text>

                      {/* Cavitation Vapor Bubbles if triggered */}
                      {cavitationTriggered && (
                        <g>
                          <circle cx="210" cy="295" r="5" fill="url(#bubbleGlow)" />
                          <circle cx="218" cy="305" r="4" fill="url(#bubbleGlow)" />
                          <circle cx="225" cy="290" r="6" fill="url(#bubbleGlow)" />
                          <circle cx="235" cy="300" r="3" fill="url(#bubbleGlow)" />
                          <text x="210" y="360" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold" letterSpacing="0.05em">
                            CAVITATION IMPLOSION
                          </text>
                        </g>
                      )}
                    </svg>
                  </div>
                ) : (
                  /* Ambient Grid for other concepts */
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "radial-gradient(circle at 50% 50%, rgba(16,185,129,0.15) 0%, transparent 70%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div style={{ textAlign: "center", padding: 24 }}>
                      <Film size={48} style={{ color: "var(--tm3-lime)", marginBottom: 12, opacity: 0.8 }} />
                      <div style={{ fontSize: "1.1rem", fontWeight: 800 }}>AI Concept Simulation</div>
                      <small style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.7)" }}>
                        {activeShort.category}
                      </small>
                    </div>
                  </div>
                )}

                {/* Reel Top Bar: Badge & Creator Info */}
                <div style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 20,
                        background: "rgba(16, 185, 129, 0.25)",
                        border: "1px solid rgba(16, 185, 129, 0.5)",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        color: "#a7f3d0",
                      }}
                    >
                      {activeShort.category}
                    </span>
                    <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                      <Sparkles size={12} style={{ color: "var(--tm3-lime)" }} /> {activeShort.creatorName}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => toggleSpeechNarration()}
                      title={speechSpeaking ? "Mute technical narration" : "Play technical voice narration"}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: speechSpeaking ? "var(--tm3-primary)" : "rgba(0,0,0,0.6)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        color: "#ffffff",
                        display: "grid",
                        placeItems: "center",
                        cursor: "pointer",
                      }}
                    >
                      {speechSpeaking ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimPlaying(!simPlaying)}
                      title={simPlaying ? "Pause simulation" : "Play simulation"}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "rgba(0,0,0,0.6)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        color: "#ffffff",
                        display: "grid",
                        placeItems: "center",
                        cursor: "pointer",
                      }}
                    >
                      {simPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                  </div>
                </div>

                {/* Reel Middle / Formula Card Overlay */}
                <div style={{ position: "relative", zIndex: 10, textAlign: "center", margin: "auto 0" }}>
                  <div
                    style={{
                      display: "inline-block",
                      padding: "8px 16px",
                      borderRadius: 12,
                      background: "rgba(0, 0, 0, 0.75)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <div style={{ fontSize: "0.72rem", color: "var(--tm3-lime)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Governing Formulation
                    </div>
                    <div style={{ fontSize: "1rem", fontFamily: "monospace", fontWeight: 800, marginTop: 4, color: "#ffffff" }}>
                      P₁ + ½ρv₁² = P₂ + ½ρv₂²
                    </div>
                  </div>
                </div>

                {/* Reel Bottom: Title, Captions & Interactive Cavitation Toggle */}
                <div style={{ position: "relative", zIndex: 10, display: "grid", gap: 10 }}>
                  {activeShort.interactiveSimType === "bernoulli_venturi" && (
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: 12,
                        background: "rgba(0,0,0,0.85)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#e2e8f0" }}>
                        Cavitation Threshold (P_throat &lt; P_v)
                      </span>
                      <button
                        type="button"
                        onClick={() => setCavitationTriggered(!cavitationTriggered)}
                        style={{
                          fontSize: "0.74rem",
                          padding: "4px 12px",
                          borderRadius: 20,
                          background: cavitationTriggered ? "#ef4444" : "var(--tm3-primary)",
                          color: "#fff",
                          border: "none",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        {cavitationTriggered ? "Implosion Active" : "Trigger Cavitation"}
                      </button>
                    </div>
                  )}

                  {/* Subtitle / Caption Stream */}
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: 14,
                      background: "rgba(6, 31, 26, 0.9)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      fontSize: "0.82rem",
                      lineHeight: 1.45,
                      color: "#f1f5f9",
                    }}
                  >
                    <strong style={{ color: "var(--tm3-lime)", display: "block", fontSize: "0.76rem", textTransform: "uppercase" }}>
                      Scientific Insight:
                    </strong>
                    {activeShort.conceptSummary}
                  </div>

                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, lineHeight: 1.35, color: "#ffffff" }}>
                    {activeShort.title}
                  </h3>

                  {/* Action Link to AI Prompt */}
                  <button
                    type="button"
                    onClick={() => setPromptModalShort(activeShort)}
                    className="tm3-button tm3-button--lime"
                    style={{ width: "100%", justifyContent: "center", fontSize: "0.82rem", minHeight: 38, fontWeight: 800 }}
                  >
                    <Code size={14} /> View AI Production Prompt & Script
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TMA SHORTS FEED & REEL CATALOG
              ========================================================================= */}
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--tm3-border)", paddingBottom: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "var(--tm3-ink)" }}>
                  Concept Explainer Reels
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "var(--tm3-text-soft)" }}>
                  Condensed technical insights ready for mobile platforms and classroom walkthroughs
                </p>
              </div>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--tm3-primary)", background: "rgba(16,185,129,.1)", padding: "4px 10px", borderRadius: 8 }}>
                {filteredShorts.length} Reels
              </span>
            </div>

            {/* Shorts List Cards */}
            <div style={{ display: "grid", gap: 12 }}>
              {filteredShorts.map((short) => {
                const isActive = activeShort?.id === short.id;
                return (
                  <article
                    key={short.id}
                    onClick={() => {
                      stopSpeech();
                      setActiveShort(short);
                    }}
                    style={{
                      padding: "16px 20px",
                      borderRadius: 14,
                      background: isActive ? "rgba(16, 185, 129, 0.08)" : "var(--tm3-surface)",
                      border: `1.5px solid ${isActive ? "var(--tm3-primary)" : "var(--tm3-border)"}`,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                      boxShadow: "var(--tm3-shadow-sm)",
                      transition: "all .15s",
                    }}
                  >
                    <div style={{ flex: "1 1 340px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <Badge tone="green">{short.category}</Badge>
                        <span style={{ fontSize: "0.72rem", color: "var(--tm3-text-soft)", fontWeight: 600 }}>
                          {short.discipline}
                        </span>
                      </div>
                      <h4 style={{ margin: "0 0 4px", fontSize: "1.05rem", fontWeight: 800, color: "var(--tm3-ink)" }}>
                        {short.title}
                      </h4>
                      <p style={{ margin: "0 0 8px", fontSize: "0.82rem", color: "var(--tm3-text-soft)", lineHeight: 1.45 }}>
                        {short.conceptSummary}
                      </p>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {short.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            style={{
                              fontSize: "0.7rem",
                              background: "var(--tm3-surface-muted)",
                              padding: "2px 8px",
                              borderRadius: 6,
                              fontWeight: 600,
                              color: "var(--tm3-text)",
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          color: isActive ? "var(--tm3-primary)" : "var(--tm3-text-soft)",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Play size={13} fill={isActive ? "currentColor" : "none"} /> {isActive ? "Now Playing" : "Watch Reel"}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPromptModalShort(short);
                        }}
                        className="tm3-button tm3-button--outline"
                        style={{ fontSize: "0.74rem", padding: "4px 10px", minHeight: 28 }}
                      >
                        <Code size={12} /> Prompt
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          AI VIDEO PROMPT & PRODUCTION WORKFLOW MODAL
          ========================================================================= */}
      {promptModalShort && promptModalShort.aiProductionPrompt && (
        <div className="tm3-modal-backdrop" style={{ zIndex: 1300 }} role="presentation">
          <div
            className="tm3-modal"
            style={{ maxWidth: 760, maxHeight: "88vh", display: "flex", flexDirection: "column" }}
            role="dialog"
            aria-modal="true"
          >
            <div className="tm3-modal__head" style={{ borderBottom: "1px solid var(--tm3-border)", paddingBottom: 12 }}>
              <div>
                <span className="tm3-eyebrow">AI Generative Video Production Blueprint</span>
                <h2 style={{ fontSize: "1.2rem", margin: "4px 0 0" }}>{promptModalShort.title}</h2>
              </div>
              <button type="button" onClick={() => setPromptModalShort(null)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div style={{ overflowY: "auto", padding: "16px 0", display: "grid", gap: 16 }}>
              <div style={{ padding: 12, borderRadius: 10, background: "var(--tm3-surface-muted)", fontSize: "0.82rem", lineHeight: 1.5 }}>
                Use this blueprint in <strong>Runway Gen-3 Alpha</strong>, <strong>OpenAI Sora</strong>, or <strong>Luma Dream Machine</strong> to generate high-fidelity technical engineering reels. Add the finished video link through the Admin Portal to publish.
              </div>

              {/* Target Engine Specs */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: "0.8rem" }}>
                <div style={{ padding: 10, borderRadius: 8, background: "var(--tm3-surface)", border: "1px solid var(--tm3-border)" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--tm3-text-soft)", textTransform: "uppercase", display: "block" }}>Target Engine</span>
                  <strong>{promptModalShort.aiProductionPrompt.model}</strong>
                </div>
                <div style={{ padding: 10, borderRadius: 8, background: "var(--tm3-surface)", border: "1px solid var(--tm3-border)" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--tm3-text-soft)", textTransform: "uppercase", display: "block" }}>Output Specs</span>
                  <strong>{promptModalShort.aiProductionPrompt.renderSpecs}</strong>
                </div>
              </div>

              {/* Visual Prompt */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <strong style={{ fontSize: "0.85rem", color: "var(--tm3-ink)" }}>1. Visual Generation Prompt:</strong>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(promptModalShort.aiProductionPrompt!.visualPrompt)}
                    className="tm3-button tm3-button--ghost"
                    style={{ fontSize: "0.72rem", padding: "2px 8px", minHeight: 24, gap: 4 }}
                  >
                    {copiedPrompt ? "Copied!" : <><Copy size={12} /> Copy Prompt</>}
                  </button>
                </div>
                <div style={{ padding: 12, borderRadius: 8, background: "#0f172a", color: "#38bdf8", fontFamily: "monospace", fontSize: "0.8rem", lineHeight: 1.5 }}>
                  {promptModalShort.aiProductionPrompt.visualPrompt}
                </div>
              </div>

              {/* Camera & Motion */}
              <div>
                <strong style={{ fontSize: "0.85rem", color: "var(--tm3-ink)", display: "block", marginBottom: 6 }}>
                  2. Camera Direction & Dynamics:
                </strong>
                <div style={{ padding: 12, borderRadius: 8, background: "var(--tm3-surface-muted)", fontSize: "0.82rem", lineHeight: 1.5, color: "var(--tm3-text)" }}>
                  {promptModalShort.aiProductionPrompt.motionCameraPrompt}
                </div>
              </div>

              {/* Narrator Voice Script */}
              <div>
                <strong style={{ fontSize: "0.85rem", color: "var(--tm3-ink)", display: "block", marginBottom: 6 }}>
                  3. Narrator Script (ElevenLabs Voiceover):
                </strong>
                <div style={{ padding: 12, borderRadius: 8, background: "rgba(16,185,129,.07)", border: "1px solid rgba(16,185,129,.2)", fontSize: "0.84rem", lineHeight: 1.55, color: "var(--tm3-ink)" }}>
                  "{promptModalShort.aiProductionPrompt.narratorScript}"
                  <small style={{ display: "block", marginTop: 6, color: "var(--tm3-primary)", fontWeight: 700 }}>
                    Tone & Persona: {promptModalShort.aiProductionPrompt.voiceTone}
                  </small>
                </div>
              </div>
            </div>

            <div className="tm3-modal__actions" style={{ borderTop: "1px solid var(--tm3-border)", paddingTop: 14 }}>
              <button className="tm3-button tm3-button--outline" type="button" onClick={() => setPromptModalShort(null)}>
                Close Blueprint
              </button>
              <button
                className="tm3-button tm3-button--dark"
                type="button"
                onClick={() => {
                  const fullText = `[AI VISUAL PROMPT]\n${promptModalShort.aiProductionPrompt!.visualPrompt}\n\n[CAMERA]\n${promptModalShort.aiProductionPrompt!.motionCameraPrompt}\n\n[NARRATION SCRIPT]\n${promptModalShort.aiProductionPrompt!.narratorScript}`;
                  copyToClipboard(fullText);
                }}
              >
                Copy Complete Production Bundle
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
