import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  Briefcase,
  Building,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Code,
  Compass,
  Download,
  ExternalLink,
  Eye,
  FileCode,
  FileText,
  Filter,
  GraduationCap,
  Layers,
  Play,
  RotateCcw,
  Search,
  Share2,
  Sliders,
  Sparkles,
  Smartphone,
  Waves,
  Zap,
} from "lucide-react";
import { Badge, EmptyState, Metric, PageIntro } from "../components/Ui";

/* =========================================================================
   COMPETITIVE EXAMS & INTERNSHIP DIRECTORY DATA
   ========================================================================= */

type ExamOpportunity = {
  id: string;
  title: string;
  organization: string;
  category: "National Exam" | "PSU / Recruitment" | "State Engineering";
  eligibility: string;
  typicalMonth: string;
  keySubjects: string[];
  officialPortal: string;
  status: "Annual Cycle Active" | "Notification Expected" | "Applications Open";
  description: string;
};

const EXAM_OPPORTUNITIES: ExamOpportunity[] = [
  {
    id: "gate-ce",
    title: "GATE Civil Engineering (CE)",
    organization: "IITs / IISc Bangalore (Rotating)",
    category: "National Exam",
    eligibility: "B.Tech / B.E. in Civil Engineering (Pre-final & Final year eligible)",
    typicalMonth: "February (Annually)",
    keySubjects: ["Structural Analysis", "Geotechnical Engineering", "Fluid Mechanics", "Surveying", "Mathematics"],
    officialPortal: "https://gate2025.iitr.ac.in",
    status: "Annual Cycle Active",
    description: "Gateway for M.Tech admissions at IITs/NITs and direct recruitment for PSU Executive Trainee posts (ONGC, IOCL, NTPC, NHAI).",
  },
  {
    id: "upsc-ese",
    title: "UPSC Engineering Services Exam (ESE / IES)",
    organization: "Union Public Service Commission (UPSC)",
    category: "National Exam",
    eligibility: "Graduate in Engineering (Age 21–30 years)",
    typicalMonth: "Prelims: Feb | Mains: June",
    keySubjects: ["Design of Concrete & Steel", "Open Channel Flow", "Soil Mechanics", "Highway & Railways"],
    officialPortal: "https://upsc.gov.in",
    status: "Annual Cycle Active",
    description: "Recruitment to prestigious Class-1 gazetted engineering services (Central Water Commission, CPWD, Military Engineer Services, Indian Railway).",
  },
  {
    id: "ssc-je",
    title: "SSC Junior Engineer (Civil)",
    organization: "Staff Selection Commission (SSC)",
    category: "National Exam",
    eligibility: "Diploma / Degree in Civil Engineering",
    typicalMonth: "Paper 1: June | Paper 2: October",
    keySubjects: ["Building Materials", "Estimating & Costing", "Surveying", "Soil Mechanics", "Hydraulics"],
    officialPortal: "https://ssc.gov.in",
    status: "Annual Cycle Active",
    description: "Direct recruitment for Junior Engineer cadre in CPWD, MES, Border Roads Organisation (BRO), and Central Water Power Research Station.",
  },
  {
    id: "isro-icrb",
    title: "ISRO Scientist / Engineer 'SC' (Civil)",
    organization: "Indian Space Research Organisation (ISRO)",
    category: "PSU / Recruitment",
    eligibility: "B.Tech in Civil Engineering with minimum 65% aggregate or 6.84 CGPA",
    typicalMonth: "As notified (Annual / Bi-annual)",
    keySubjects: ["Structural Dynamics", "Heavy Foundation Design", "Cleanroom Infrastructure", "Geomatics"],
    officialPortal: "https://isro.gov.in/careers",
    status: "Notification Expected",
    description: "Launch pad civil infrastructure, tracking station construction, satellite assembly facility engineering, and structural telemetry.",
  },
  {
    id: "barc-oces",
    title: "BARC Scientific Officer (OCES/DGFS - Civil)",
    organization: "Bhabha Atomic Research Centre (BARC)",
    category: "PSU / Recruitment",
    eligibility: "B.Tech Civil with min 60% aggregate or valid GATE score",
    typicalMonth: "Exam: April | Interviews: June",
    keySubjects: ["Reactor Containment Structures", "Finite Element Method", "Seismic Hazard", "Geotechnical"],
    officialPortal: "https://barcoces.examinfo.in",
    status: "Annual Cycle Active",
    description: "Prestigious scientific research cadre designing nuclear containment vessels, seismic qualification, and radiation shielding structures.",
  },
  {
    id: "state-ae-je",
    title: "State PSC Assistant & Junior Engineer Services",
    organization: "State Public Service Commissions (WBPSC, OPSC, BPSC, MPSC, etc.)",
    category: "State Engineering",
    eligibility: "Degree / Diploma in Civil Engineering (State domicile provisions apply)",
    typicalMonth: "State-specific schedules",
    keySubjects: ["Public Works Specifications", "Surveying Corrections", "Irrigation & Canals", "Environmental"],
    officialPortal: "https://mpsc.gov.in",
    status: "Annual Cycle Active",
    description: "Engineering cadre recruitment across Public Works Departments (PWD), Irrigation & Waterways, and Urban Development Directorates.",
  },
];

type InternshipOpening = {
  id: string;
  title: string;
  domain: string;
  companyOrInstitute: string;
  location: string;
  stipend: string;
  duration: string;
  skillsRequired: string[];
  applyLink: string;
  isVerified: boolean;
};

const INTERNSHIP_LISTINGS: InternshipOpening[] = [
  {
    id: "intern-1",
    title: "Graduate Engineer Trainee - Structural & Seismic Design",
    domain: "Civil & Structural",
    companyOrInstitute: "Larsen & Toubro (L&T Construction) / Industry Partner",
    location: "Chennai / Mumbai / Sites",
    stipend: "₹28,000 – ₹35,000 / month",
    duration: "6 Months Internship / Pre-Placement",
    skillsRequired: ["ETABS", "IS 1893:2016", "Reinforced Concrete Detailing", "AutoCAD"],
    applyLink: "https://lntecc.com/careers",
    isVerified: true,
  },
  {
    id: "intern-2",
    title: "Geospatial Analyst & Drone Remote Sensing Intern",
    domain: "Geospatial & Remote Sensing",
    companyOrInstitute: "TerraMatrix Geospatial Research Group",
    location: "Kolkata / Remote Hybrid",
    stipend: "₹15,000 – ₹20,000 / month",
    duration: "3–6 Months",
    skillsRequired: ["QGIS", "Python for GIS", "Sentinel-2 Multispectral", "DEM/DTM Processing"],
    applyLink: "/#/student?category=Geospatial%20Tools",
    isVerified: true,
  },
  {
    id: "intern-3",
    title: "Water Resources & Hydrodynamic Modeling Intern",
    domain: "Water Resources & Catchments",
    companyOrInstitute: "CWPRS / River Basin Consulting Labs",
    location: "Pune / Roorkee",
    stipend: "₹18,000 / month",
    duration: "4 Months",
    skillsRequired: ["HEC-RAS 2D", "HEC-HMS", "Catchment Delineation", "Open Channel Hydraulics"],
    applyLink: "https://cwprs.gov.in",
    isVerified: true,
  },
  {
    id: "intern-4",
    title: "BIM Coordination & Parametric Modeling Intern",
    domain: "BIM & Digital Twins",
    companyOrInstitute: "Ramboll / AtkinsRéalis Partner Hub",
    location: "Bengaluru / Gurugram",
    stipend: "₹25,000 / month",
    duration: "6 Months",
    skillsRequired: ["Autodesk Revit", "Navisworks Clash Detection", "IFC Schema", "Structural BIM"],
    applyLink: "https://ramboll.com/careers",
    isVerified: true,
  },
];

/* =========================================================================
   FREE REFERENCE HANDBOOKS & CHEAT SHEETS
   ========================================================================= */

const REFERENCE_MATERIALS = [
  {
    title: "IS 456:2000 Structural Concrete Quick Formula Handbook",
    pages: "16 Pages",
    format: "PDF Reference",
    summary: "Limiting moments of resistance, shear capacity, development length formulas, and reinforcement curtailment rules.",
    tag: "Design Standards",
  },
  {
    title: "Hydraulic & River Basin Mechanics Formula Sheet",
    pages: "12 Pages",
    format: "PDF Reference",
    summary: "Manning's open channel flow, hydraulic jump equations, Froude number criteria, and HEC-RAS boundary condition definitions.",
    tag: "Water Resources",
  },
  {
    title: "Scientific Python for Civil Engineers - Starter Notebooks",
    pages: "8 Jupyter Notebooks",
    format: ".ipynb / Python",
    summary: "Hands-on code for moment-curvature diagrams, finite element truss solvers, and rainfall return period calculations.",
    tag: "Computational",
  },
  {
    title: "QGIS & Satellite Remote Sensing Workflow Checklist",
    pages: "10 Pages",
    format: "PDF Checklist",
    summary: "Step-by-step geospatial tutorial for downloading Copernicus Sentinel-2 tiles, calculating NDVI, and terrain slope analysis.",
    tag: "Geospatial",
  },
];

export default function LearnerHub() {
  const [activeTab, setActiveTab] = useState<"reels" | "opportunities" | "calculators" | "materials">("reels");

  // Reels Mode: Vertical 9:16 layout toggle
  const [reelsLayout, setReelsLayout] = useState(false);

  /* -------------------------------------------------------------------------
     INTERACTIVE CONCEPT 1: BERNOULLI'S PRINCIPLE & VENTURI EFFECT
     ------------------------------------------------------------------------- */
  const [velocity1, setVelocity1] = useState(2.0); // m/s
  const [areaRatio, setAreaRatio] = useState(2.5); // A1 / A2

  // Physics calculation
  const velocity2 = useMemo(() => velocity1 * areaRatio, [velocity1, areaRatio]);
  const rho = 1000; // kg/m^3 (water)
  // Dynamic pressure drop: Delta P = 0.5 * rho * (v2^2 - v1^2)
  const deltaP = useMemo(() => 0.5 * rho * (velocity2 * velocity2 - velocity1 * velocity1), [velocity1, velocity2]);
  const headLossMeters = useMemo(() => (deltaP / (rho * 9.81)).toFixed(2), [deltaP]);

  /* -------------------------------------------------------------------------
     INTERACTIVE CONCEPT 2: MOHR'S CIRCLE OF STRESS
     ------------------------------------------------------------------------- */
  const [sigmaX, setSigmaX] = useState(80); // MPa
  const [sigmaY, setSigmaY] = useState(30); // MPa
  const [tauXY, setTauXY] = useState(40); // MPa

  const mohrCalculations = useMemo(() => {
    const center = (sigmaX + sigmaY) / 2;
    const diff = (sigmaX - sigmaY) / 2;
    const radius = Math.sqrt(diff * diff + tauXY * tauXY);
    const sigma1 = center + radius;
    const sigma2 = center - radius;
    const tauMax = radius;
    const thetaP = (0.5 * Math.atan2(2 * tauXY, sigmaX - sigmaY) * (180 / Math.PI)).toFixed(1);
    return {
      center: center.toFixed(1),
      radius: radius.toFixed(1),
      sigma1: sigma1.toFixed(1),
      sigma2: sigma2.toFixed(1),
      tauMax: tauMax.toFixed(1),
      thetaP,
    };
  }, [sigmaX, sigmaY, tauXY]);

  /* -------------------------------------------------------------------------
     INTERACTIVE CONCEPT 3: HYDRAULIC JUMP
     ------------------------------------------------------------------------- */
  const [depth1, setDepth1] = useState(0.4); // meters (y1)
  const [vJump1, setVJump1] = useState(4.5); // m/s (v1)

  const jumpCalculations = useMemo(() => {
    const g = 9.81;
    const fr1 = vJump1 / Math.sqrt(g * depth1);
    const y2 = (depth1 / 2) * (Math.sqrt(1 + 8 * fr1 * fr1) - 1);
    const deltaE = Math.pow(y2 - depth1, 3) / (4 * depth1 * y2);
    const efficiency = (y2 / (depth1 + (vJump1 * vJump1) / (2 * g))) * 100;
    return {
      fr1: fr1.toFixed(2),
      isSupercritical: fr1 > 1,
      y2: y2.toFixed(2),
      deltaE: deltaE.toFixed(2),
      efficiency: Math.min(100, Math.max(0, efficiency)).toFixed(1),
    };
  }, [depth1, vJump1]);

  /* -------------------------------------------------------------------------
     CALCULATOR 1: IS 10262 CONCRETE TARGET STRENGTH & W/C
     ------------------------------------------------------------------------- */
  const [grade, setGrade] = useState<number>(30); // M30
  const [exposure, setExposure] = useState<string>("Moderate");

  const concreteCalc = useMemo(() => {
    // Standard deviation s according to IS 10262:2019
    const s = grade <= 15 ? 3.5 : grade <= 25 ? 4.0 : grade <= 50 ? 5.0 : 5.5;
    const targetStrength = grade + 1.65 * s;
    const maxWc = exposure === "Mild" ? 0.55 : exposure === "Moderate" ? 0.50 : exposure === "Severe" ? 0.45 : 0.40;
    const minCement = exposure === "Mild" ? 300 : exposure === "Moderate" ? 300 : exposure === "Severe" ? 320 : 340;
    return {
      s,
      targetStrength: targetStrength.toFixed(2),
      maxWc,
      minCement,
    };
  }, [grade, exposure]);

  /* -------------------------------------------------------------------------
     CALCULATOR 2: OPEN CHANNEL MANNING'S DISCHARGE (RECTANGULAR)
     ------------------------------------------------------------------------- */
  const [bedWidth, setBedWidth] = useState(4.0); // m
  const [flowDepth, setFlowDepth] = useState(1.5); // m
  const [bedSlope, setBedSlope] = useState(0.001); // 1 in 1000
  const [manningN, setManningN] = useState(0.025); // Concrete / clean earth

  const manningCalc = useMemo(() => {
    const area = bedWidth * flowDepth;
    const wettedPerimeter = bedWidth + 2 * flowDepth;
    const hydraulicRadius = area / wettedPerimeter;
    const velocity = (1 / manningN) * Math.pow(hydraulicRadius, 2 / 3) * Math.sqrt(bedSlope);
    const discharge = area * velocity;
    return {
      area: area.toFixed(2),
      perimeter: wettedPerimeter.toFixed(2),
      radius: hydraulicRadius.toFixed(2),
      velocity: velocity.toFixed(2),
      discharge: discharge.toFixed(2),
    };
  }, [bedWidth, flowDepth, bedSlope, manningN]);

  return (
    <main>
      <PageIntro
        eyebrow="Learner Gateway & Tools"
        title="Everything built for our engineering students."
        description="Interactive visual physics, 20-second concept reels, competitive exam & internship opportunities, instant design calculators, and open technical handbooks."
        aside={
          <div style={{ display: "grid", gap: 10 }}>
            <Metric value="100% Free" label="Learner access" helper="Grounded in code standards" />
            <button
              type="button"
              onClick={() => setReelsLayout(!reelsLayout)}
              className="tm3-button tm3-button--lime"
              style={{ fontSize: 13, minHeight: 38 }}
            >
              <Smartphone size={16} /> {reelsLayout ? "Standard Grid Mode" : "9:16 Social Reels Mode"}
            </button>
          </div>
        }
      />

      {/* Primary Sub-Navigation Bar */}
      <section className="tm3-shell" style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", borderBottom: "1px solid var(--tm3-border)", paddingBottom: 14 }}>
          <button
            type="button"
            className={`tm3-button ${activeTab === "reels" ? "tm3-button--dark" : "tm3-button--outline"}`}
            onClick={() => setActiveTab("reels")}
          >
            <Zap size={16} /> Concept Reels & Physics Animations
          </button>
          <button
            type="button"
            className={`tm3-button ${activeTab === "opportunities" ? "tm3-button--dark" : "tm3-button--outline"}`}
            onClick={() => setActiveTab("opportunities")}
          >
            <Briefcase size={16} /> Exam Calendars & Internships
          </button>
          <button
            type="button"
            className={`tm3-button ${activeTab === "calculators" ? "tm3-button--dark" : "tm3-button--outline"}`}
            onClick={() => setActiveTab("calculators")}
          >
            <Sliders size={16} /> Quick Engineering Calculators
          </button>
          <button
            type="button"
            className={`tm3-button ${activeTab === "materials" ? "tm3-button--dark" : "tm3-button--outline"}`}
            onClick={() => setActiveTab("materials")}
          >
            <BookOpen size={16} /> Free Study Codes & Handbooks
          </button>
        </div>
      </section>

      {/* =====================================================================
          TAB 1: CONCEPT REELS & REACT ANIMATIONS
          ===================================================================== */}
      {activeTab === "reels" && (
        <section className="tm3-shell" style={{ display: "grid", gap: 32, marginBottom: 60 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
            <div>
              <span className="tm3-eyebrow">Visual Engineering Mechanics</span>
              <h2 style={{ margin: "4px 0 0", fontSize: "1.5rem" }}>
                Interactive 20-Second Concept Reels
              </h2>
              <p style={{ margin: "4px 0 0", color: "var(--tm3-text-soft)", fontSize: "0.85rem" }}>
                Clear animated explanations for viva questions, competitive exams, and Instagram/Facebook technical reels.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Badge tone="gold">Format: &lt; 30s Takeaway</Badge>
              <Badge tone="green">Multi-Device Responsive</Badge>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: reelsLayout ? "repeat(auto-fit, minmax(280px, 340px))" : "repeat(auto-fit, minmax(360px, 1fr))",
              justifyContent: reelsLayout ? "center" : undefined,
              gap: 24,
            }}
          >
            {/* REEL 1: BERNOULLI'S PRINCIPLE */}
            <article
              className="tm3-content-card"
              style={{
                borderRadius: 22,
                background: "var(--tm3-surface)",
                border: "1px solid var(--tm3-border)",
                overflow: "hidden",
                boxShadow: "var(--tm3-shadow-sm)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ padding: "16px 20px", background: "linear-gradient(135deg, rgba(6,31,26,0.95), rgba(16,185,129,0.2))", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <Badge tone="green">Fluid Mechanics</Badge>
                  <h3 style={{ margin: "6px 0 2px", fontSize: "1.15rem", color: "#fff" }}>Bernoulli's Principle & Venturi Flow</h3>
                </div>
                <span style={{ fontSize: "0.72rem", color: "var(--tm3-lime)", fontWeight: 800 }}>#Reel 01</span>
              </div>

              {/* Animated Canvas */}
              <div style={{ padding: 20, background: "rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                <svg width="100%" height="160" viewBox="0 0 360 160" style={{ overflow: "visible" }}>
                  <defs>
                    <linearGradient id="waterGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                      <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.75" />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>

                  {/* Venturi Tube Geometry */}
                  <path
                    d="M 20 40 L 130 40 L 180 65 L 230 65 L 280 40 L 340 40 L 340 120 L 280 120 L 230 95 L 180 95 L 130 120 L 20 120 Z"
                    fill="url(#waterGrad)"
                    stroke="var(--tm3-primary)"
                    strokeWidth="3"
                  />

                  {/* Flow streamlines (Animated) */}
                  <line x1="30" y1="80" x2="140" y2="80" stroke="#bae6fd" strokeWidth="2" strokeDasharray="6,4" />
                  <line x1="140" y1="80" x2="220" y2="80" stroke="#f0f9ff" strokeWidth="3" strokeDasharray="4,2" />
                  <line x1="220" y1="80" x2="330" y2="80" stroke="#bae6fd" strokeWidth="2" strokeDasharray="6,4" />

                  {/* Manometer 1 (Wide inlet) */}
                  <line x1="80" y1="40" x2="80" y2="10" stroke="rgba(255,255,255,0.4)" strokeWidth="4" />
                  <line x1="80" y1="40" x2="80" y2="15" stroke="var(--tm3-lime)" strokeWidth="6" />
                  <text x="80" y="8" fill="var(--tm3-lime)" fontSize="10" fontWeight="bold" textAnchor="middle">High P₁</text>

                  {/* Manometer 2 (Throat constriction) */}
                  <line x1="205" y1="65" x2="205" y2="30" stroke="rgba(255,255,255,0.4)" strokeWidth="4" />
                  <line x1="205" y1="65" x2="205" y2="52" stroke="#38bdf8" strokeWidth="6" />
                  <text x="205" y="26" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">Low P₂</text>

                  {/* Velocity Vectors */}
                  <text x="80" y="84" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle">v₁ = {velocity1} m/s</text>
                  <text x="205" y="84" fill="var(--tm3-ink)" fontSize="11" fontWeight="800" textAnchor="middle">v₂ = {velocity2.toFixed(1)} m/s</text>
                </svg>

                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginTop: 8, fontSize: "0.75rem", color: "var(--tm3-text-soft)" }}>
                  <span>Inlet: $v_1$ = {velocity1} m/s</span>
                  <span style={{ color: "var(--tm3-lime)", fontWeight: 800 }}>Throat Constriction: $v_2$ = {velocity2.toFixed(1)} m/s</span>
                </div>
              </div>

              {/* Interactive Sliders */}
              <div style={{ padding: "16px 20px", display: "grid", gap: 12 }}>
                <label style={{ fontSize: "0.8rem", display: "grid", gap: 4 }}>
                  <span style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Inlet Velocity ($v_1$)</span>
                    <strong>{velocity1} m/s</strong>
                  </span>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    step="0.5"
                    value={velocity1}
                    onChange={(e) => setVelocity1(Number(e.target.value))}
                  />
                </label>

                <label style={{ fontSize: "0.8rem", display: "grid", gap: 4 }}>
                  <span style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Area Contraction Ratio ($A_1 / A_2$)</span>
                    <strong>{areaRatio}x</strong>
                  </span>
                  <input
                    type="range"
                    min="1.5"
                    max="4.0"
                    step="0.5"
                    value={areaRatio}
                    onChange={(e) => setAreaRatio(Number(e.target.value))}
                  />
                </label>

                {/* 20-Sec Takeaway Box */}
                <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(214, 245, 109, 0.08)", border: "1px solid rgba(214, 245, 109, 0.25)", fontSize: "0.8rem", lineHeight: 1.5 }}>
                  <strong style={{ color: "var(--tm3-lime)", display: "block", marginBottom: 3 }}>
                    ⚡ 20-Sec Key Takeaway (Viva / Reel):
                  </strong>
                  As cross-sectional area contracts, continuity requires fluid velocity to spike ($A_1 v_1 = A_2 v_2$). To conserve total energy, <em>static pressure must drop</em>:
                  <div style={{ fontFamily: "monospace", color: "var(--tm3-text)", marginTop: 4, fontWeight: 700 }}>
                    ΔP = {(deltaP / 1000).toFixed(1)} kPa (Head drop: {headLossMeters} m)
                  </div>
                </div>
              </div>
            </article>

            {/* REEL 2: MOHR'S CIRCLE OF STRESS */}
            <article
              className="tm3-content-card"
              style={{
                borderRadius: 22,
                background: "var(--tm3-surface)",
                border: "1px solid var(--tm3-border)",
                overflow: "hidden",
                boxShadow: "var(--tm3-shadow-sm)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ padding: "16px 20px", background: "linear-gradient(135deg, rgba(6,31,26,0.95), rgba(59,130,246,0.2))", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <Badge tone="blue">Mechanics of Materials</Badge>
                  <h3 style={{ margin: "6px 0 2px", fontSize: "1.15rem", color: "#fff" }}>Mohr's Circle of 2D Stress</h3>
                </div>
                <span style={{ fontSize: "0.72rem", color: "#93c5fd", fontWeight: 800 }}>#Reel 02</span>
              </div>

              {/* Graphic Plot Canvas */}
              <div style={{ padding: 20, background: "rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <svg width="100%" height="160" viewBox="0 0 360 160">
                  {/* Axes */}
                  <line x1="20" y1="80" x2="340" y2="80" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                  <line x1="60" y1="10" x2="60" y2="150" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                  <text x="330" y="74" fill="rgba(255,255,255,0.7)" fontSize="10">σ (Normal)</text>
                  <text x="65" y="20" fill="rgba(255,255,255,0.7)" fontSize="10">τ (Shear)</text>

                  {/* Mohr's Circle */}
                  <circle
                    cx="180"
                    cy="80"
                    r="55"
                    fill="rgba(59, 130, 246, 0.12)"
                    stroke="#60a5fa"
                    strokeWidth="2.5"
                  />
                  {/* Center Dot */}
                  <circle cx="180" cy="80" r="4" fill="var(--tm3-lime)" />
                  <text x="180" y="96" fill="var(--tm3-lime)" fontSize="10" textAnchor="middle">Center C ({mohrCalculations.center})</text>

                  {/* Principal Stresses */}
                  <circle cx="235" cy="80" r="4" fill="#10b981" />
                  <text x="235" y="72" fill="#10b981" fontSize="10" fontWeight="bold" textAnchor="middle">σ₁ ({mohrCalculations.sigma1})</text>

                  <circle cx="125" cy="80" r="4" fill="#f59e0b" />
                  <text x="125" y="72" fill="#f59e0b" fontSize="10" fontWeight="bold" textAnchor="middle">σ₂ ({mohrCalculations.sigma2})</text>

                  {/* Max Shear Top */}
                  <circle cx="180" cy="25" r="4" fill="#ec4899" />
                  <text x="180" y="20" fill="#ec4899" fontSize="10" textAnchor="middle">τ_max = {mohrCalculations.tauMax} MPa</text>
                </svg>
              </div>

              {/* Sliders */}
              <div style={{ padding: "16px 20px", display: "grid", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <label style={{ fontSize: "0.78rem", display: "grid", gap: 3 }}>
                    <span>σ_x = {sigmaX} MPa</span>
                    <input
                      type="range"
                      min="10"
                      max="140"
                      step="5"
                      value={sigmaX}
                      onChange={(e) => setSigmaX(Number(e.target.value))}
                    />
                  </label>
                  <label style={{ fontSize: "0.78rem", display: "grid", gap: 3 }}>
                    <span>σ_y = {sigmaY} MPa</span>
                    <input
                      type="range"
                      min="0"
                      max="80"
                      step="5"
                      value={sigmaY}
                      onChange={(e) => setSigmaY(Number(e.target.value))}
                    />
                  </label>
                </div>

                <label style={{ fontSize: "0.78rem", display: "grid", gap: 3 }}>
                  <span>Shear Stress τ_xy = {tauXY} MPa</span>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="5"
                    value={tauXY}
                    onChange={(e) => setTauXY(Number(e.target.value))}
                  />
                </label>

                {/* 20-Sec Takeaway Box */}
                <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.25)", fontSize: "0.8rem", lineHeight: 1.5 }}>
                  <strong style={{ color: "#93c5fd", display: "block", marginBottom: 3 }}>
                    ⚡ 20-Sec Exam Formula:
                  </strong>
                  Principal stresses occur on planes of <em>zero shear stress</em>. Major σ₁ = {mohrCalculations.sigma1} MPa, Minor σ₂ = {mohrCalculations.sigma2} MPa, Max In-Plane Shear = {mohrCalculations.tauMax} MPa at θ_p = {mohrCalculations.thetaP}°.
                </div>
              </div>
            </article>

            {/* REEL 3: HYDRAULIC JUMP & ENERGY LOSS */}
            <article
              className="tm3-content-card"
              style={{
                borderRadius: 22,
                background: "var(--tm3-surface)",
                border: "1px solid var(--tm3-border)",
                overflow: "hidden",
                boxShadow: "var(--tm3-shadow-sm)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ padding: "16px 20px", background: "linear-gradient(135deg, rgba(6,31,26,0.95), rgba(20,184,166,0.2))", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <Badge tone="green">River & Channel Hydraulics</Badge>
                  <h3 style={{ margin: "6px 0 2px", fontSize: "1.15rem", color: "#fff" }}>Hydraulic Jump & Energy Dissipation</h3>
                </div>
                <span style={{ fontSize: "0.72rem", color: "#2dd4bf", fontWeight: 800 }}>#Reel 03</span>
              </div>

              {/* Water Jump Profile Canvas */}
              <div style={{ padding: 20, background: "rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <svg width="100%" height="160" viewBox="0 0 360 160">
                  {/* Bed of channel */}
                  <line x1="20" y1="130" x2="340" y2="130" stroke="var(--tm3-border)" strokeWidth="4" />

                  {/* Water Body Profile */}
                  <path
                    d="M 20 130 L 20 110 L 110 110 C 140 110 160 55 200 55 L 340 55 L 340 130 Z"
                    fill="rgba(14, 165, 233, 0.4)"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                  />

                  {/* Turbulence swirls at the jump */}
                  <circle cx="160" cy="80" r="14" fill="none" stroke="rgba(255,255,255,0.7)" strokeDasharray="3,3" strokeWidth="2" />
                  <circle cx="180" cy="72" r="10" fill="none" stroke="rgba(255,255,255,0.7)" strokeDasharray="2,2" strokeWidth="2" />

                  <text x="65" y="100" fill="#fff" fontSize="11" fontWeight="bold">y₁ = {depth1} m</text>
                  <text x="65" y="122" fill="var(--tm3-lime)" fontSize="9">Supercritical (Fr₁={jumpCalculations.fr1})</text>

                  <text x="260" y="45" fill="#fff" fontSize="11" fontWeight="bold">y₂ = {jumpCalculations.y2} m</text>
                  <text x="260" y="122" fill="#38bdf8" fontSize="9">Subcritical (Tranquil)</text>
                </svg>
              </div>

              {/* Sliders */}
              <div style={{ padding: "16px 20px", display: "grid", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <label style={{ fontSize: "0.78rem", display: "grid", gap: 3 }}>
                    <span>Initial Depth y₁ = {depth1} m</span>
                    <input
                      type="range"
                      min="0.2"
                      max="1.0"
                      step="0.1"
                      value={depth1}
                      onChange={(e) => setDepth1(Number(e.target.value))}
                    />
                  </label>
                  <label style={{ fontSize: "0.78rem", display: "grid", gap: 3 }}>
                    <span>Velocity v₁ = {vJump1} m/s</span>
                    <input
                      type="range"
                      min="2.0"
                      max="7.0"
                      step="0.5"
                      value={vJump1}
                      onChange={(e) => setVJump1(Number(e.target.value))}
                    />
                  </label>
                </div>

                {/* 20-Sec Takeaway Box */}
                <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(20, 184, 166, 0.08)", border: "1px solid rgba(20, 184, 166, 0.25)", fontSize: "0.8rem", lineHeight: 1.5 }}>
                  <strong style={{ color: "#2dd4bf", display: "block", marginBottom: 3 }}>
                    ⚡ 20-Sec Spillway Takeaway:
                  </strong>
                  Froude Number Fr₁ = {jumpCalculations.fr1} ({jumpCalculations.isSupercritical ? "Supercritical Jump Occurs" : "Subcritical, no jump"}). Energy loss in jump: <strong>ΔE = {jumpCalculations.deltaE} m</strong>. Essential for stilling basin dam protection!
                </div>
              </div>
            </article>
          </div>
        </section>
      )}

      {/* =====================================================================
          TAB 2: OPPORTUNITIES & CAREER DIRECTORY
          ===================================================================== */}
      {activeTab === "opportunities" && (
        <section className="tm3-shell" style={{ display: "grid", gap: 36, marginBottom: 60 }}>
          {/* Competitive Exams Schedule */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
              <div>
                <span className="tm3-eyebrow">National & State Engineering Exams</span>
                <h2 style={{ margin: "2px 0 0", fontSize: "1.45rem" }}>Competitive Exam Opportunities Calendar</h2>
              </div>
              <Link to="/exam-prep" className="tm3-button tm3-button--gold" style={{ fontSize: "0.8rem" }}>
                <CheckCircle2 size={15} /> Practice Model Questions & PYQs
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 }}>
              {EXAM_OPPORTUNITIES.map((exam) => (
                <article
                  key={exam.id}
                  style={{
                    padding: 20,
                    borderRadius: 18,
                    background: "var(--tm3-surface)",
                    border: "1px solid var(--tm3-border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    boxShadow: "var(--tm3-shadow-xs)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div>
                      <Badge tone={exam.category === "National Exam" ? "gold" : "green"}>{exam.category}</Badge>
                      <h3 style={{ margin: "8px 0 2px", fontSize: "1.1rem", fontWeight: 800 }}>{exam.title}</h3>
                      <small style={{ color: "var(--tm3-primary)", fontWeight: 700 }}>{exam.organization}</small>
                    </div>
                    <span style={{ fontSize: "0.72rem", padding: "4px 8px", borderRadius: 8, background: "rgba(16,185,129,.1)", color: "#10b981", fontWeight: 700 }}>
                      {exam.status}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--tm3-text-soft)", lineHeight: 1.5 }}>
                    {exam.description}
                  </p>

                  <div style={{ fontSize: "0.78rem", display: "grid", gap: 4, background: "var(--tm3-surface-muted)", padding: 12, borderRadius: 10 }}>
                    <div><strong>Eligibility:</strong> {exam.eligibility}</div>
                    <div><strong>Annual Cycle:</strong> {exam.typicalMonth}</div>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {exam.keySubjects.map((s) => (
                      <span key={s} style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 6, background: "rgba(255,255,255,.05)", border: "1px solid var(--tm3-border)" }}>
                        {s}
                      </span>
                    ))}
                  </div>

                  <div style={{ marginTop: "auto", paddingTop: 10, borderTop: "1px solid var(--tm3-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Link to="/exam-prep" style={{ fontSize: "0.78rem", color: "var(--tm3-primary)", fontWeight: 700, textDecoration: "none" }}>
                      Take Mock Practice →
                    </Link>
                    <a
                      href={exam.officialPortal}
                      target="_blank"
                      rel="noreferrer"
                      className="tm3-button tm3-button--outline"
                      style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                    >
                      Official Portal <ExternalLink size={13} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Internships & Graduate Trainee Openings */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
              <div>
                <span className="tm3-eyebrow">Industry Experience</span>
                <h2 style={{ margin: "2px 0 0", fontSize: "1.45rem" }}>Internships & Graduate Trainee (GET) Openings</h2>
              </div>
              <Badge tone="green">Verified Engineering Partners</Badge>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 }}>
              {INTERNSHIP_LISTINGS.map((listing) => (
                <article
                  key={listing.id}
                  style={{
                    padding: 20,
                    borderRadius: 18,
                    background: "var(--tm3-surface)",
                    border: "1px solid var(--tm3-border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div>
                      <Badge tone="blue">{listing.domain}</Badge>
                      <h3 style={{ margin: "8px 0 2px", fontSize: "1.1rem", fontWeight: 800 }}>{listing.title}</h3>
                      <small style={{ color: "var(--tm3-text-soft)", fontWeight: 700 }}>{listing.companyOrInstitute}</small>
                    </div>
                  </div>

                  <div style={{ fontSize: "0.8rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, background: "var(--tm3-surface-muted)", padding: 12, borderRadius: 10 }}>
                    <div><span style={{ color: "var(--tm3-text-soft)" }}>Location:</span> <strong>{listing.location}</strong></div>
                    <div><span style={{ color: "var(--tm3-text-soft)" }}>Stipend:</span> <strong style={{ color: "var(--tm3-lime)" }}>{listing.stipend}</strong></div>
                    <div><span style={{ color: "var(--tm3-text-soft)" }}>Duration:</span> <strong>{listing.duration}</strong></div>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {listing.skillsRequired.map((s) => (
                      <span key={s} style={{ fontSize: "0.72rem", padding: "3px 8px", borderRadius: 6, background: "rgba(214,245,109,.1)", color: "var(--tm3-lime)", fontWeight: 700 }}>
                        {s}
                      </span>
                    ))}
                  </div>

                  <div style={{ marginTop: "auto", paddingTop: 10, borderTop: "1px solid var(--tm3-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--tm3-text-soft)" }}>TerraMatrix Verified</span>
                    <a
                      href={listing.applyLink}
                      target="_blank"
                      rel="noreferrer"
                      className="tm3-button tm3-button--gold"
                      style={{ padding: "6px 14px", fontSize: "0.78rem" }}
                    >
                      Apply / Inquire <ArrowUpRight size={14} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          TAB 3: QUICK ENGINEERING CALCULATORS
          ===================================================================== */}
      {activeTab === "calculators" && (
        <section className="tm3-shell" style={{ display: "grid", gap: 32, marginBottom: 60 }}>
          <div>
            <span className="tm3-eyebrow">Formulations & Calculations</span>
            <h2 style={{ margin: "4px 0 0", fontSize: "1.5rem" }}>Instant Interactive Engineering Calculators</h2>
            <p style={{ margin: "4px 0 0", color: "var(--tm3-text-soft)", fontSize: "0.85rem" }}>
              Grounded in official Bureau of Indian Standards (BIS) and standard hydraulic formulas.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 24 }}>
            {/* CALCULATOR 1: IS 10262 CONCRETE DESIGN */}
            <article style={{ padding: 24, borderRadius: 20, background: "var(--tm3-surface)", border: "1px solid var(--tm3-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <Badge tone="green">IS 10262:2019 / IS 456</Badge>
                  <h3 style={{ margin: "6px 0 0", fontSize: "1.2rem" }}>Target Mean Strength & Max w/c Ratio</h3>
                </div>
              </div>

              <div className="tm3-form-grid" style={{ marginBottom: 18 }}>
                <label className="tm3-field">
                  <span>Characteristic Strength (f_ck) Grade</span>
                  <select value={grade} onChange={(e) => setGrade(Number(e.target.value))}>
                    <option value={20}>M20 (20 MPa)</option>
                    <option value={25}>M25 (25 MPa)</option>
                    <option value={30}>M30 (30 MPa)</option>
                    <option value={35}>M35 (35 MPa)</option>
                    <option value={40}>M40 (40 MPa)</option>
                    <option value={45}>M45 (45 MPa)</option>
                    <option value={50}>M50 (50 MPa)</option>
                  </select>
                </label>

                <label className="tm3-field">
                  <span>Environmental Exposure (IS 456 Table 3)</span>
                  <select value={exposure} onChange={(e) => setExposure(e.target.value)}>
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                    <option value="Very Severe">Very Severe</option>
                  </select>
                </label>
              </div>

              <div style={{ padding: 18, borderRadius: 14, background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.3)", display: "grid", gap: 8, fontSize: "0.85rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Target Mean Strength f&apos;_ck = f_ck + 1.65 s:</span>
                  <strong style={{ color: "var(--tm3-lime)", fontSize: "1.1rem" }}>{concreteCalc.targetStrength} MPa</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Standard Deviation ($s$):</span>
                  <strong>{concreteCalc.s} N/mm²</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Maximum Water-Cement (w/c) Ratio:</span>
                  <strong style={{ color: "#38bdf8" }}>{concreteCalc.maxWc}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Minimum Cement Content:</span>
                  <strong>{concreteCalc.minCement} kg/m³</strong>
                </div>
              </div>
            </article>

            {/* CALCULATOR 2: MANNING'S OPEN CHANNEL DISCHARGE */}
            <article style={{ padding: 24, borderRadius: 20, background: "var(--tm3-surface)", border: "1px solid var(--tm3-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <Badge tone="blue">Hydraulics & Open Channel</Badge>
                  <h3 style={{ margin: "6px 0 0", fontSize: "1.2rem" }}>Manning's Flow & Discharge Calculator</h3>
                </div>
              </div>

              <div className="tm3-form-grid" style={{ marginBottom: 18 }}>
                <label className="tm3-field">
                  <span>Bed Width ($b$) [meters]</span>
                  <input
                    type="number"
                    step="0.5"
                    value={bedWidth}
                    onChange={(e) => setBedWidth(Math.max(0.5, Number(e.target.value)))}
                  />
                </label>

                <label className="tm3-field">
                  <span>Water Depth ($y$) [meters]</span>
                  <input
                    type="number"
                    step="0.1"
                    value={flowDepth}
                    onChange={(e) => setFlowDepth(Math.max(0.1, Number(e.target.value)))}
                  />
                </label>

                <label className="tm3-field">
                  <span>Bed Slope ($S_0$)</span>
                  <input
                    type="number"
                    step="0.0005"
                    value={bedSlope}
                    onChange={(e) => setBedSlope(Math.max(0.0001, Number(e.target.value)))}
                  />
                </label>

                <label className="tm3-field">
                  <span>Manning's Roughness ($n$)</span>
                  <select value={manningN} onChange={(e) => setManningN(Number(e.target.value))}>
                    <option value={0.013}>0.013 (Smooth Concrete)</option>
                    <option value={0.025}>0.025 (Clean Earth / Gravel)</option>
                    <option value={0.035}>0.035 (Natural River Bed)</option>
                    <option value={0.050}>0.050 (Weedy / Mountain Stream)</option>
                  </select>
                </label>
              </div>

              <div style={{ padding: 18, borderRadius: 14, background: "rgba(56,189,248,.1)", border: "1px solid rgba(56,189,248,.3)", display: "grid", gap: 8, fontSize: "0.85rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Discharge ($Q = A \cdot v$):</span>
                  <strong style={{ color: "#38bdf8", fontSize: "1.1rem" }}>{manningCalc.discharge} m³/s</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Flow Velocity ($v$):</span>
                  <strong>{manningCalc.velocity} m/s</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Flow Area ($A$) / Wetted Perimeter ($P$):</span>
                  <span>{manningCalc.area} m² / {manningCalc.perimeter} m</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Hydraulic Radius ($R = A/P$):</span>
                  <strong>{manningCalc.radius} m</strong>
                </div>
              </div>
            </article>
          </div>
        </section>
      )}

      {/* =====================================================================
          TAB 4: FREE TECHNICAL STUDY CODES & HANDBOOKS
          ===================================================================== */}
      {activeTab === "materials" && (
        <section className="tm3-shell" style={{ display: "grid", gap: 24, marginBottom: 60 }}>
          <div>
            <span className="tm3-eyebrow">Open Engineering Library</span>
            <h2 style={{ margin: "4px 0 0", fontSize: "1.5rem" }}>Free Reference Handbooks & Computational Notebooks</h2>
            <p style={{ margin: "4px 0 0", color: "var(--tm3-text-soft)", fontSize: "0.85rem" }}>
              Open-access study guides for civil engineering students, viva examinations, and practicing designers.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {REFERENCE_MATERIALS.map((ref) => (
              <article
                key={ref.title}
                style={{
                  padding: 20,
                  borderRadius: 18,
                  background: "var(--tm3-surface)",
                  border: "1px solid var(--tm3-border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Badge tone="green">{ref.tag}</Badge>
                  <small style={{ color: "var(--tm3-text-soft)", fontWeight: 700 }}>{ref.format}</small>
                </div>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>{ref.title}</h3>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--tm3-text-soft)", lineHeight: 1.5, flex: 1 }}>
                  {ref.summary}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--tm3-border)", paddingTop: 12, marginTop: "auto" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--tm3-primary)", fontWeight: 700 }}>{ref.pages}</span>
                  <Link
                    to="/student"
                    className="tm3-button tm3-button--outline"
                    style={{ padding: "4px 10px", fontSize: "0.78rem" }}
                  >
                    <BookOpen size={13} /> Access in Portal
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
