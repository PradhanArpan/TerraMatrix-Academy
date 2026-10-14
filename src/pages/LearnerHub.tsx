import { useEffect, useMemo, useState } from "react";
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
  ChevronLeft,
  ChevronRight,
  Code,
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
  Pause,
  Play,
  Printer,
  RotateCcw,
  Search,
  Share2,
  Sliders,
  Smartphone,
  Sparkles,
  Waves,
  Wind,
  X,
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
  discipline: string;
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
    id: "gate-all",
    title: "GATE (Graduate Aptitude Test in Engineering)",
    organization: "IISc / IIT Consortium (MHRD)",
    discipline: "All Engineering Branches (CE, ME, CS, EE, DA)",
    category: "National Exam",
    eligibility: "B.E. / B.Tech (3rd year & graduates)",
    typicalMonth: "February (Annually)",
    keySubjects: ["Engineering Mathematics", "Core Technical Syllabus", "General Aptitude"],
    officialPortal: "https://gate2026.iitkgp.ac.in",
    status: "Annual Cycle Active",
    description: "Gateway for PSU recruitment (IOCL, ONGC, NTPC, BHEL, NHAI, PowerGrid) and M.Tech / Direct Ph.D. admissions at IITs and IISc.",
  },
  {
    id: "upsc-ese",
    title: "UPSC ESE (Engineering Services Examination / IES)",
    organization: "Union Public Service Commission",
    discipline: "Civil, Mechanical, Electrical, Electronics",
    category: "National Exam",
    eligibility: "Engineering Degree Graduate",
    typicalMonth: "Prelims: Feb / Mains: June",
    keySubjects: ["General Studies & Engineering Aptitude", "Core Engineering Papers I & II"],
    officialPortal: "https://upsc.gov.in",
    status: "Annual Cycle Active",
    description: "Recruitment to Group A gazetted technical cadres in Indian Railways, CPWD, Military Engineer Services (MES), and Central Water Engineering.",
  },
  {
    id: "isro-icrb",
    title: "ISRO ICRB Scientist / Engineer 'SC'",
    organization: "Indian Space Research Organisation",
    discipline: "Mechanical, Aerospace, Civil, Computer Science, Electronics",
    category: "PSU / Recruitment",
    eligibility: "B.Tech with min 65% marks or 6.84 CGPA",
    typicalMonth: "Notification cycles vary (Bi-annual)",
    keySubjects: ["Spacecraft Structures", "Orbital Mechanics", "Propulsion & Control"],
    officialPortal: "https://www.isro.gov.in/Careers.html",
    status: "Notification Expected",
    description: "Prestigious engineering R&D recruitment for national launch vehicle, satellite payload, and aerospace ground infrastructure missions.",
  },
  {
    id: "barc-oces",
    title: "BARC OCES / DGFS Scientific Officer",
    organization: "Bhabha Atomic Research Centre (DAE)",
    discipline: "Nuclear, Mechanical, Chemical, Civil, CS",
    category: "PSU / Recruitment",
    eligibility: "B.Tech with min 60% aggregate",
    typicalMonth: "March - April (Online exam or GATE score)",
    keySubjects: ["Thermal Hydraulics", "Materials Science", "Reactor Physics"],
    officialPortal: "https://barcocesexam.in",
    status: "Annual Cycle Active",
    description: "Orientation Course for Engineering Graduates and Science Post-graduates leading to scientific officer appointments across atomic energy centres.",
  },
  {
    id: "ssc-je",
    title: "SSC Junior Engineer (Civil / Electrical / Mechanical)",
    organization: "Staff Selection Commission",
    discipline: "Civil, Mechanical, Electrical",
    category: "National Exam",
    eligibility: "Diploma or Degree in Engineering",
    typicalMonth: "Paper 1: June / Paper 2: Oct",
    keySubjects: ["General Intelligence", "General Awareness", "Core Technical Engineering"],
    officialPortal: "https://ssc.gov.in",
    status: "Annual Cycle Active",
    description: "Recruitment to Junior Engineer posts in Central Water Commission, CPWD, Military Engineer Services, and Border Roads Organization.",
  },
];

type InternshipOpportunity = {
  id: string;
  title: string;
  company: string;
  domain: string;
  mode: "On-site" | "Hybrid" | "Remote Research";
  duration: string;
  stipend: string;
  location: string;
  skillsRequired: string[];
  description: string;
};

const INTERNSHIPS: InternshipOpportunity[] = [
  {
    id: "intern-fea",
    title: "Computational Mechanics & FEA Engineering Intern",
    company: "TerraMatrix Engineering Simulation Labs",
    domain: "Mechanical & Aerospace",
    mode: "Hybrid",
    duration: "3 - 6 Months",
    stipend: "₹18,000 - ₹25,000 / month",
    location: "Bengaluru / Hyderabad",
    skillsRequired: ["Finite Element Analysis", "ANSYS / ABAQUS", "Python", "Solid Mechanics"],
    description: "Participate in nonlinear stress modeling, fatigue evaluation, and structural optimization for aerospace components and industrial equipment.",
  },
  {
    id: "intern-gis",
    title: "Satellite Geodesy & GIS Data Science Trainee",
    company: "GeoSpatial Intelligence Research Consortium",
    domain: "Geospatial & Geomatics",
    mode: "Remote Research",
    duration: "4 Months",
    stipend: "₹15,000 / month",
    location: "Remote / New Delhi",
    skillsRequired: ["QGIS", "Google Earth Engine", "Python / GeoPandas", "InSAR"],
    description: "Process Sentinel-1/2 synthetic aperture radar and multispectral satellite imagery to detect ground subsidence and environmental surface changes.",
  },
  {
    id: "intern-bim",
    title: "Infrastructure BIM & Virtual Design Trainee",
    company: "Metropolitan EPC Infrastructure Partners",
    domain: "Civil & Infrastructure",
    mode: "On-site",
    duration: "6 Months",
    stipend: "₹20,000 / month",
    location: "Mumbai / Pune",
    skillsRequired: ["Revit", "Navisworks", "BIM 360", "Clash Detection", "ISO 19650"],
    description: "Hands-on model federation, parametric rebar detailing, and clash coordination for high-speed rail viaducts and underground transit stations.",
  },
  {
    id: "intern-hydro",
    title: "Hydrodynamic Modeling & 2D Dam Break Intern",
    company: "Water Resources Modeling Centre",
    domain: "Water Resources & Environmental",
    mode: "Hybrid",
    duration: "3 Months",
    stipend: "₹16,000 / month",
    location: "Kolkata / Guwahati",
    skillsRequired: ["HEC-RAS 2D", "HEC-HMS", "GIS Catchment Analysis", "Hydraulics"],
    description: "Execute 2D hydrodynamic unsteady flood wave propagation, spillway rating calibrations, and dam breach risk mapping following CWC protocols.",
  },
];

/* =========================================================================
   FREE TECHNICAL STUDY CODES & HANDBOOKS (WITH IN-APP READER DATA)
   ========================================================================= */

type Handbook = {
  id: string;
  title: string;
  tag: string;
  discipline: string;
  format: string;
  pages: string;
  summary: string;
  tableOfContents: string[];
  contentSections: {
    heading: string;
    text: string;
    formulas?: string[];
    codeBlock?: string;
  }[];
};

const HANDBOOKS: Handbook[] = [
  {
    id: "hb-concrete",
    title: "IS 456 & Eurocode 2 Reinforced Concrete Design Reference",
    tag: "Design Code Standard",
    discipline: "Civil & Infrastructure",
    format: "Technical Handbook",
    pages: "Comprehensive Reference",
    summary: "Essential limit state flexure, shear capacity, development length, and deflection control formulas with detailing rules.",
    tableOfContents: [
      "1. Limit State Design Principles",
      "2. Flexural Strength Equations",
      "3. Shear Reinforcement & Punching Shear",
      "4. Serviceability & Deflection Control",
      "5. Minimum Reinforcement & Cover Provisions",
    ],
    contentSections: [
      {
        heading: "1. Limit State Design Principles",
        text: "Under IS 456:2000 Clause 38.1, the maximum compressive strain in concrete at the outermost compression fiber is taken as 0.0035 in bending. The characteristic strength f_ck corresponds to the 28-day 150 mm cube compressive strength where no more than 5% of test results are expected to fall below.",
        formulas: [
          "Target Mean Strength: f'_ck = f_ck + 1.65 s",
          "Partial Safety Factors: γ_m(concrete) = 1.50, γ_m(steel) = 1.15",
          "Design Tensile Stress in Steel: f_yd = 0.87 f_y",
        ],
      },
      {
        heading: "2. Flexural Strength Equations (Singly Reinforced Beams)",
        text: "Equating the compressive force in concrete to the tensile force in reinforcement yields the neutral axis depth x_u. When x_u <= x_u,max, the section is under-reinforced, providing ductile warning before ultimate failure.",
        formulas: [
          "Neutral Axis Depth: x_u / d = (0.87 f_y A_st) / (0.36 f_ck b d)",
          "Limiting Neutral Axis: x_u,max / d = 0.53 (Fe 250), 0.48 (Fe 415), 0.46 (Fe 500)",
          "Moment of Resistance: M_u = 0.87 f_y A_st d (1 - (A_st f_y) / (b d f_ck))",
        ],
        codeBlock: `# Python calculation of Singly Reinforced Beam Capacity (IS 456)
def calculate_beam_moment(b, d, f_ck, f_y, ast):
    xu = (0.87 * f_y * ast) / (0.36 * f_ck * b)
    xu_max_ratio = 0.48 if f_y == 415 else 0.46
    xu_max = xu_max_ratio * d
    if xu > xu_max:
        xu = xu_max
        mu = 0.36 * f_ck * b * xu * (d - 0.42 * xu)
    else:
        mu = 0.87 * f_y * ast * d * (1.0 - (ast * f_y) / (b * d * f_ck))
    return {"xu_mm": round(xu, 1), "Mu_kNm": round(mu / 1e6, 2)}`,
      },
      {
        heading: "3. Shear Reinforcement & Punching Shear",
        text: "Nominal shear stress τ_v = V_u / (b d). When τ_v exceeds the design shear strength of concrete τ_c (IS 456 Table 19), shear stirrups must carry the excess shear V_us = V_u - τ_c b d.",
        formulas: [
          "Shear Stirrup Spacing: s_v = (0.87 f_y A_sv d) / V_us",
          "Maximum Permissible Spacing: s_v <= 0.75 d <= 300 mm",
          "Maximum Concrete Shear Capacity: τ_c,max = 0.63 √f_ck",
        ],
      },
      {
        heading: "4. Development Length & Detailing",
        text: "The anchorage bond length L_d prevents pulling out of rebar under tension. For deformed bars conforming to IS 1786, design bond stress τ_bd is increased by 60%.",
        formulas: [
          "Development Length: L_d = (φ · σ_s) / (4 · τ_bd)",
          "For Fe 415 / Fe 500 in tension: L_d ≈ 47φ to 55φ",
        ],
      },
    ],
  },
  {
    id: "hb-hydraulics",
    title: "Open Channel Hydraulics & Hydrodynamic Modeling Handbook",
    tag: "Fluid Mechanics",
    discipline: "Water Resources & Mechanical",
    format: "Technical Handbook",
    pages: "Formula Guide",
    summary: "Manning's uniform flow, specific energy curves, critical flow regime, hydraulic jump conjugate depths, and unsteady routing principles.",
    tableOfContents: [
      "1. Manning & Chezy Uniform Flow Equations",
      "2. Specific Energy & Critical Depth",
      "3. Hydraulic Jump Mechanics & Energy Dissipation",
      "4. Gradually Varied Flow (GVF) Water Surface Profiles",
      "5. HEC-RAS 1D/2D Saint-Venant Equations",
    ],
    contentSections: [
      {
        heading: "1. Manning & Chezy Uniform Flow Equations",
        text: "Uniform flow occurs when gravity driving forces along the channel bed slope are balanced by boundary friction resistance. The Manning equation is globally utilized for open flumes, natural streams, and drainage conduits.",
        formulas: [
          "Manning's Velocity: v = (1 / n) · R^(2/3) · S_0^(1/2)",
          "Discharge: Q = A · v = (1 / n) · A · R^(2/3) · S_0^(1/2)",
          "Hydraulic Radius: R = A / P (Cross-sectional Area / Wetted Perimeter)",
        ],
      },
      {
        heading: "2. Specific Energy & Critical Depth",
        text: "Specific energy E is the energy per unit weight of fluid measured with respect to the channel bed. For a given discharge Q, specific energy is minimum at critical depth where Froude number Fr = 1.",
        formulas: [
          "Specific Energy: E = y + (v² / 2g) = y + (Q² / (2 g A²))",
          "Critical Depth (Rectangular): y_c = (q² / g)^(1/3), where q = Q / b",
          "Minimum Specific Energy: E_min = 1.5 y_c",
          "Froude Number: Fr = v / √(g D_h), where D_h = A / T",
        ],
      },
      {
        heading: "3. Hydraulic Jump Mechanics & Head Loss",
        text: "When a supercritical flow (Fr_1 > 1) transitions rapidly to a subcritical flow (Fr_2 < 1), a standing hydraulic jump forms with significant turbulent kinetic energy dissipation.",
        formulas: [
          "Bélanger Conjugate Depth Ratio: y_2 / y_1 = 0.5 · (√(1 + 8 Fr_1²) - 1)",
          "Energy Head Loss: ΔE = (y_2 - y_1)³ / (4 y_1 y_2)",
          "Relative Jump Efficiency: E_2 / E_1 = (8 Fr_1² + 1)^(3/2) - 4 Fr_1² + 1 / (8 Fr_1² (2 + Fr_1²))",
        ],
        codeBlock: `# Hydraulic Jump Conjugate Depth & Energy Loss Solver
import math

def solve_hydraulic_jump(y1, v1, g=9.81):
    fr1 = v1 / math.sqrt(g * y1)
    if fr1 <= 1.0:
        return {"error": "Upstream flow is subcritical (Fr <= 1). Jump cannot form."}
    y2 = (y1 / 2.0) * (math.sqrt(1.0 + 8.0 * (fr1 ** 2)) - 1.0)
    delta_e = ((y2 - y1) ** 3) / (4.0 * y1 * y2)
    return {
        "Froude_Upstream": round(fr1, 2),
        "Conjugate_Depth_y2_m": round(y2, 3),
        "Head_Loss_deltaE_m": round(delta_e, 3),
        "Efficiency_Percent": round((1.0 - delta_e / (y1 + v1**2 / (2*g))) * 100, 1)
    }`,
      },
    ],
  },
  {
    id: "hb-thermo",
    title: "Thermodynamics, Energy Cycles & Heat Transfer Quick Reference",
    tag: "Applied Physics",
    discipline: "Mechanical & Aerospace",
    format: "Technical Handbook",
    pages: "Core Reference",
    summary: "Carnot, Otto, Diesel cycles, Navier-Stokes momentum, Fourier conduction, and LMTD heat exchanger formulation.",
    tableOfContents: [
      "1. First & Second Laws of Thermodynamics",
      "2. Ideal Gas Standard Power Cycles",
      "3. Steady-State Conduction & Convection",
      "4. Heat Exchanger LMTD & NTU Methods",
    ],
    contentSections: [
      {
        heading: "1. Laws of Thermodynamics & Maximum Efficiency",
        text: "The First Law establishes internal energy conservation dU = δQ - δW. The Second Law dictates entropy generation dS_gen >= 0, establishing that no cycle can exceed the Carnot efficiency between two temperature reservoirs.",
        formulas: [
          "Carnot Efficiency: η_Carnot = 1 - (T_L / T_H)",
          "Entropy Change (Reversible): dS = δQ_rev / T",
          "Enthalpy: H = U + p V",
        ],
      },
      {
        heading: "2. Power Cycles (Otto & Diesel)",
        text: "The ideal air-standard Otto cycle represents spark-ignition internal combustion engines with constant-volume heat addition.",
        formulas: [
          "Otto Cycle Efficiency: η_Otto = 1 - 1 / (r^(γ - 1))",
          "Diesel Cycle Efficiency: η_Diesel = 1 - (1 / (r^(γ - 1))) · ((r_c^γ - 1) / (γ (r_c - 1)))",
        ],
      },
      {
        heading: "3. Heat Transfer & Conduction",
        text: "Fourier's Law governing one-dimensional steady heat conduction through a plane wall of thermal conductivity k and thickness L.",
        formulas: [
          "Fourier's Law: q = -k (dT / dx) = (k A / L) · (T_1 - T_2)",
          "Newton's Law of Cooling: q = h A (T_s - T_∞)",
          "LMTD (Counter-Flow): ΔT_lm = (ΔT_1 - ΔT_2) / ln(ΔT_1 / ΔT_2)",
        ],
      },
    ],
  },
  {
    id: "hb-python",
    title: "Scientific Python & Computational Modeling Handbook",
    tag: "Computational Engineering",
    discipline: "All Engineering Branches",
    format: "Jupyter Notebook & Scripts",
    pages: "Code & Notebooks",
    summary: "NumPy matrix vectorization, SciPy root solvers and differential integrators, and Matplotlib engineering plotting templates.",
    tableOfContents: [
      "1. Vectorized NumPy Linear Algebra",
      "2. Nonlinear Solvers with SciPy",
      "3. Numerical Integration & ODEs",
      "4. SymPy Symbolic Equations",
    ],
    contentSections: [
      {
        heading: "1. Vectorized NumPy Matrix Operations",
        text: "NumPy arrays allow C-level SIMD execution across contiguous memory buffers, eliminating slow Python interpreter overhead in iterative engineering simulations.",
        codeBlock: `import numpy as np

# Create stiffness matrix for a 2-node truss element
def truss_element_stiffness(E, A, L, theta_deg):
    theta = np.radians(theta_deg)
    c, s = np.cos(theta), np.sin(theta)
    k_local = (E * A / L) * np.array([
        [ c*c,  c*s, -c*c, -c*s],
        [ c*s,  s*s, -c*s, -s*s],
        [-c*c, -c*s,  c*c,  c*s],
        [-c*s, -s*s,  c*s,  s*s]
    ])
    return k_local`,
      },
      {
        heading: "2. Solving Differential Equations with SciPy",
        text: "Dynamic response of a damped harmonic oscillator using `scipy.integrate.solve_ivp`.",
        codeBlock: `from scipy.integrate import solve_ivp
import numpy as np

# Equation: m x'' + c x' + k x = F0 * sin(omega * t)
def oscillator_ode(t, y, m, c, k, F0, omega):
    x, v = y
    dxdt = v
    dvdt = (F0 * np.sin(omega * t) - c * v - k * x) / m
    return [dxdt, dvdt]

# Integrate from t=0 to 10 seconds
sol = solve_ivp(oscillator_ode, [0, 10], [0, 0], args=(1.0, 0.2, 20.0, 5.0, 4.47), max_step=0.01)`,
      },
    ],
  },
];

/* =========================================================================
   MAIN COMPONENT
   ========================================================================= */

export default function LearnerHub() {
  const [activeTab, setActiveTab] = useState<"shorts" | "opportunities" | "calculators" | "materials">("shorts");
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("All");

  // In-App Handbook Modal Reader State
  const [activeHandbook, setActiveHandbook] = useState<Handbook | null>(null);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  // --- REEL 1: AIRFOIL & VENTURI AERODYNAMICS ---
  const [aoa, setAoa] = useState<number>(6); // Angle of attack degrees (0 to 18)
  const [flowSpeed, setFlowSpeed] = useState<number>(45); // m/s
  const [isSimRunning, setIsSimRunning] = useState<boolean>(true);
  const [simTime, setSimTime] = useState<number>(0);

  // --- REEL 2: 2D STRESS & MOHR'S CIRCLE ---
  const [sigmaX, setSigmaX] = useState<number>(80); // MPa
  const [sigmaY, setSigmaY] = useState<number>(20); // MPa
  const [tauXY, setTauXY] = useState<number>(40); // MPa

  // --- REEL 3: ELECTROMAGNETIC WAVE & FOURIER HARMONICS ---
  const [harmonicsCount, setHarmonicsCount] = useState<number>(1); // 1, 3, 5, 7

  // --- REEL 4: HARMONIC RESONANCE OSCILLATOR ---
  const [freqRatio, setFreqRatio] = useState<number>(0.95); // omega / omega_n
  const [dampingRatio, setDampingRatio] = useState<number>(0.15); // zeta

  // --- REEL SELECTOR (CURRENT TMA SHORT) ---
  const [activeReelIndex, setActiveReelIndex] = useState<number>(0);

  // Continuous animation loop for physics visualizers
  useEffect(() => {
    if (!isSimRunning) return;
    const interval = setInterval(() => {
      setSimTime((prev) => (prev + 0.05) % 1000);
    }, 50);
    return () => clearInterval(interval);
  }, [isSimRunning]);

  // Mohr's circle calculations
  const mohrMetrics = useMemo(() => {
    const center = (sigmaX + sigmaY) / 2;
    const r = Math.sqrt(Math.pow((sigmaX - sigmaY) / 2, 2) + Math.pow(tauXY, 2));
    const sigma1 = center + r;
    const sigma2 = center - r;
    const tauMax = r;
    const thetaP_deg = (0.5 * Math.atan2(2 * tauXY, sigmaX - sigmaY) * 180) / Math.PI;
    return {
      center: center.toFixed(1),
      r: r.toFixed(1),
      sigma1: sigma1.toFixed(1),
      sigma2: sigma2.toFixed(1),
      tauMax: tauMax.toFixed(1),
      thetaP: thetaP_deg.toFixed(1),
    };
  }, [sigmaX, sigmaY, tauXY]);

  // Airfoil Aerodynamics Lift & Drag
  const aeroMetrics = useMemo(() => {
    // Stall occurs above 14 degrees
    const isStalled = aoa > 14;
    const cl = isStalled ? Math.max(0.2, 1.4 - (aoa - 14) * 0.15) : (aoa * 0.1 + 0.2);
    const cd = 0.02 + Math.pow(aoa / 10, 2) * 0.08 + (isStalled ? 0.3 : 0);
    const dynamicPressure = 0.5 * 1.225 * Math.pow(flowSpeed, 2);
    const liftPerMeter = dynamicPressure * cl * 1.0; // Chord = 1m
    const dragPerMeter = dynamicPressure * cd * 1.0;
    return {
      cl: cl.toFixed(2),
      cd: cd.toFixed(3),
      lift: Math.round(liftPerMeter),
      drag: Math.round(dragPerMeter),
      isStalled,
    };
  }, [aoa, flowSpeed]);

  // Resonance Magnification Factor
  const resonanceMetrics = useMemo(() => {
    const r = freqRatio;
    const zeta = dampingRatio;
    const dmf = 1.0 / Math.sqrt(Math.pow(1 - r * r, 2) + Math.pow(2 * zeta * r, 2));
    const isNearResonance = Math.abs(r - 1.0) < 0.15;
    return {
      dmf: dmf.toFixed(2),
      isNearResonance,
    };
  }, [freqRatio, dampingRatio]);

  // --- CALCULATORS STATE ---
  const [concreteGrade, setConcreteGrade] = useState<number>(30); // M30
  const [concreteExposure, setConcreteExposure] = useState<string>("Moderate");

  const concreteCalc = useMemo(() => {
    const s = concreteGrade <= 20 ? 4.0 : concreteGrade <= 35 ? 5.0 : 5.5;
    const target = concreteGrade + 1.65 * s;
    const maxWc =
      concreteExposure === "Mild"
        ? 0.55
        : concreteExposure === "Moderate"
        ? 0.50
        : concreteExposure === "Severe"
        ? 0.45
        : 0.40;
    const minCement =
      concreteExposure === "Mild"
        ? 300
        : concreteExposure === "Moderate"
        ? 320
        : concreteExposure === "Severe"
        ? 340
        : 360;
    return {
      s: s.toFixed(1),
      targetStrength: target.toFixed(1),
      maxWc: maxWc.toFixed(2),
      minCement,
    };
  }, [concreteGrade, concreteExposure]);

  // Calculator 2: Column Buckling
  const [colLength, setColLength] = useState<number>(4.0); // meters
  const [colDiameter, setColDiameter] = useState<number>(0.2); // meters
  const [colEndCondition, setColEndCondition] = useState<string>("both_pinned");

  const columnCalc = useMemo(() => {
    const E = 200e9; // Steel 200 GPa
    const r = colDiameter / 2.0;
    const I = (Math.PI * Math.pow(colDiameter, 4)) / 64.0;
    const A = Math.PI * Math.pow(r, 2);
    const kRadius = Math.sqrt(I / A);

    const leRatio =
      colEndCondition === "both_fixed"
        ? 0.5
        : colEndCondition === "one_fixed_one_pinned"
        ? 0.7
        : colEndCondition === "cantilever"
        ? 2.0
        : 1.0;
    const Le = colLength * leRatio;
    const slenderness = Le / kRadius;
    const Pcr = (Math.PI * Math.PI * E * I) / Math.pow(Le, 2);

    return {
      Le: Le.toFixed(2),
      slenderness: Math.round(slenderness),
      Pcr_kN: Math.round(Pcr / 1000),
    };
  }, [colLength, colDiameter, colEndCondition]);

  const copyCodeToClipboard = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(idx);
    setTimeout(() => setCopiedCodeIndex(null), 2500);
  };

  return (
    <main>
      <PageIntro
        eyebrow="Physical Simulation & Applied Science"
        title="TMA Shorts & Applied Engineering Knowledge Hub"
        description="Interactive computational physics, TMA Shorts, multi-disciplinary examination gateways, verified design handbooks, and open engineering calculators."
        aside={
          <div style={{ display: "grid", gap: 10 }}>
            <Metric value="Multi-Domain" label="Engineering scope" helper="Aero, Mech, Civil, Electrical & AI" />
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--tm3-muted)", fontWeight: 700 }}>
              <Sparkles size={14} style={{ color: "var(--tm3-lime)" }} /> Open Access · Interactive Simulations
            </div>
          </div>
        }
      />

      {/* Main Tab Navigation Bar */}
      <section className="tm3-shell" style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", borderBottom: "1px solid var(--tm3-border)", paddingBottom: 14 }}>
          <button
            type="button"
            className={`tm3-button ${activeTab === "shorts" ? "tm3-button--dark" : "tm3-button--outline"}`}
            onClick={() => setActiveTab("shorts")}
          >
            <Zap size={16} /> TMA Shorts (Visual Physics)
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
            <Sliders size={16} /> Multi-Engineering Calculators
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
          TAB 1: TMA SHORTS & VISUAL PHYSICS
          ===================================================================== */}
      {activeTab === "shorts" && (
        <section className="tm3-shell" style={{ display: "grid", gap: 32, marginBottom: 60 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
            <div>
              <span className="tm3-eyebrow">Visual Engineering Mechanics</span>
              <h2 style={{ margin: "4px 0 0", fontSize: "1.5rem" }}>
                TMA Shorts — Interactive Physical Principles
              </h2>
              <p style={{ margin: "4px 0 0", color: "var(--tm3-text-soft)", fontSize: "0.85rem" }}>
                Concise physical simulations and mathematical derivations across aerospace, mechanical, civil, and electrical domains.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Badge tone="gold">Bite-Sized Engineering Concepts</Badge>
              <button
                type="button"
                className="tm3-button tm3-button--outline"
                onClick={() => setIsSimRunning(!isSimRunning)}
                style={{ fontSize: "0.8rem", padding: "6px 12px", minHeight: 34 }}
              >
                {isSimRunning ? <Pause size={14} /> : <Play size={14} />} {isSimRunning ? "Pause Simulation" : "Run Simulation"}
              </button>
            </div>
          </div>

          {/* Reel Navigation Switcher */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { id: 0, title: "Airfoil Aerodynamics & Flow Separation", domain: "Aerospace / Mechanical" },
              { id: 1, title: "2D Stress Tensor & Mohr's Circle", domain: "Materials / Civil / Mech" },
              { id: 2, title: "EM Waves & Fourier Harmonics", domain: "Electrical / CS" },
              { id: 3, title: "Resonance & Base Excitation", domain: "Vibrations / Dynamics" },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                className={`tm3-button ${activeReelIndex === r.id ? "tm3-button--dark" : "tm3-button--outline"}`}
                onClick={() => setActiveReelIndex(r.id)}
                style={{ fontSize: "0.8rem", padding: "6px 14px", minHeight: 34 }}
              >
                <span>{r.title}</span>
                <small style={{ opacity: 0.7, marginLeft: 4 }}>({r.domain})</small>
              </button>
            ))}
          </div>

          {/* TMA SHORT REEL CONTAINER (PHONE / THEATER HYBRID) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 28,
              alignItems: "stretch",
            }}
          >
            {/* 1. SHORT 0: AIRFOIL AERODYNAMICS */}
            {activeReelIndex === 0 && (
              <>
                <article
                  style={{
                    borderRadius: 24,
                    background: "var(--tm3-surface)",
                    border: "1px solid var(--tm3-border)",
                    overflow: "hidden",
                    boxShadow: "var(--tm3-shadow-md)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ padding: "16px 20px", background: "linear-gradient(135deg, rgba(6,31,26,0.95), rgba(16,185,129,0.25))", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <Badge tone="green">Aerospace & Fluids</Badge>
                      <h3 style={{ margin: "6px 0 2px", fontSize: "1.2rem", color: "#fff" }}>
                        Airfoil Aerodynamics & Flow Separation
                      </h3>
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "var(--tm3-lime)", fontWeight: 800 }}>TMA Short #01</span>
                  </div>

                  {/* SVG Canvas */}
                  <div style={{ padding: 20, background: "rgba(0,0,0,0.25)", position: "relative", display: "flex", justifyContent: "center" }}>
                    <svg width="100%" height="220" viewBox="0 0 400 220" style={{ overflow: "visible" }}>
                      <defs>
                        <linearGradient id="wingGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                      </defs>

                      {/* Streamlines with dynamic phase motion */}
                      {[40, 70, 95, 115, 135, 160, 185].map((yOffset, i) => {
                        const shift = (simTime * 20 + i * 25) % 400;
                        const isUpper = yOffset < 115;
                        const bend = isUpper ? -aoa * 2.2 : aoa * 1.2;
                        const d = `M 0,${yOffset} Q 180,${yOffset + bend} 400,${yOffset}`;
                        return (
                          <g key={i}>
                            <path d={d} fill="none" stroke={aeroMetrics.isStalled && isUpper && i > 1 ? "#ef4444" : "rgba(56,189,248,0.4)"} strokeWidth="1.5" strokeDasharray={aeroMetrics.isStalled && isUpper && i > 1 ? "4 4" : undefined} />
                            <circle cx={(shift + i * 40) % 400} cy={yOffset + (Math.sin(((shift + i * 40) % 400) / 400 * Math.PI) * bend)} r="2.5" fill={aeroMetrics.isStalled && isUpper && i > 1 ? "#ef4444" : "#38bdf8"} />
                          </g>
                        );
                      })}

                      {/* Airfoil profile rotated by AOA */}
                      <g transform={`translate(200, 115) rotate(${-aoa})`}>
                        <path
                          d="M -70,0 C -50,-24 40,-16 80,0 C 40,8 -50,14 -70,0 Z"
                          fill="url(#wingGrad)"
                          stroke="#34d399"
                          strokeWidth="2"
                        />
                        {/* Chord line */}
                        <line x1="-70" y1="0" x2="80" y2="0" stroke="rgba(255,255,255,0.4)" strokeDasharray="3 3" />
                      </g>

                      {/* Lift vector arrow */}
                      <line x1="200" y1="115" x2="200" y2={115 - Math.min(80, aeroMetrics.lift / 20)} stroke="#34d399" strokeWidth="3" markerEnd="url(#arrow)" />
                      <text x="208" y={115 - Math.min(80, aeroMetrics.lift / 20) + 10} fill="#34d399" fontSize="11" fontWeight="800">Lift (L)</text>

                      {/* Drag vector arrow */}
                      <line x1="200" y1="115" x2={200 + Math.min(60, aeroMetrics.drag / 5)} y2="115" stroke="#f59e0b" strokeWidth="3" />
                      <text x={205 + Math.min(60, aeroMetrics.drag / 5)} y="125" fill="#f59e0b" fontSize="11" fontWeight="800">Drag (D)</text>
                    </svg>
                  </div>

                  {/* Controls & Metrics */}
                  <div style={{ padding: 20, display: "grid", gap: 14 }}>
                    <div className="tm3-form-grid" style={{ margin: 0 }}>
                      <label className="tm3-field">
                        <span>Angle of Attack (α): {aoa}°</span>
                        <input type="range" min="0" max="18" step="1" value={aoa} onChange={(e) => setAoa(Number(e.target.value))} />
                      </label>
                      <label className="tm3-field">
                        <span>Airflow Velocity (v): {flowSpeed} m/s</span>
                        <input type="range" min="20" max="90" step="5" value={flowSpeed} onChange={(e) => setFlowSpeed(Number(e.target.value))} />
                      </label>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, padding: 12, borderRadius: 12, background: "var(--tm3-surface-muted)", textAlign: "center" }}>
                      <div>
                        <small style={{ color: "var(--tm3-text-soft)", fontSize: "0.72rem" }}>Lift Coeff (C_L)</small>
                        <strong style={{ display: "block", fontSize: "1.1rem", color: aeroMetrics.isStalled ? "#ef4444" : "var(--tm3-primary)" }}>{aeroMetrics.cl}</strong>
                      </div>
                      <div>
                        <small style={{ color: "var(--tm3-text-soft)", fontSize: "0.72rem" }}>Drag Coeff (C_D)</small>
                        <strong style={{ display: "block", fontSize: "1.1rem", color: "#f59e0b" }}>{aeroMetrics.cd}</strong>
                      </div>
                      <div>
                        <small style={{ color: "var(--tm3-text-soft)", fontSize: "0.72rem" }}>Flight State</small>
                        <strong style={{ display: "block", fontSize: "0.85rem", color: aeroMetrics.isStalled ? "#ef4444" : "var(--tm3-success)" }}>
                          {aeroMetrics.isStalled ? "Stall (Separation)" : "Attached Laminar"}
                        </strong>
                      </div>
                    </div>
                  </div>
                </article>

                {/* Key Takeaway Card */}
                <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ padding: 24, borderRadius: 22, background: "var(--tm3-surface)", border: "1px solid var(--tm3-border)", flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <Sparkles size={18} style={{ color: "var(--tm3-lime)" }} />
                      <strong style={{ fontSize: "1.05rem" }}>Key Engineering Principle</strong>
                    </div>
                    <p style={{ margin: "0 0 12px", fontSize: "0.88rem", lineHeight: 1.6, color: "var(--tm3-ink)" }}>
                      Bernoulli's equation dictates that accelerating fluid over the cambered upper surface creates a suction pressure differential (Δp = 1/2 ρ (v_upper² - v_lower²)), generating <strong>aerodynamic lift</strong>.
                    </p>
                    <p style={{ margin: "0 0 16px", fontSize: "0.85rem", lineHeight: 1.6, color: "var(--tm3-text-soft)" }}>
                      When the angle of attack exceeds the critical limit (α &gt; 14°), the adverse pressure gradient overcomes boundary layer kinetic energy, triggering <strong>flow separation, turbulent vortex shedding, and sudden aerodynamic stall</strong>.
                    </p>

                    <div style={{ padding: 12, borderRadius: 10, background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.2)", fontSize: "0.82rem" }}>
                      <strong>Governing Formula:</strong>
                      <div style={{ fontFamily: "monospace", color: "var(--tm3-primary)", fontWeight: 700, marginTop: 4 }}>
                        L = 1/2 · ρ · v² · S · C_L
                      </div>
                    </div>
                  </div>
                </aside>
              </>
            )}

            {/* 2. SHORT 1: MOHR'S CIRCLE & STRESS TENSOR */}
            {activeReelIndex === 1 && (
              <>
                <article
                  style={{
                    borderRadius: 24,
                    background: "var(--tm3-surface)",
                    border: "1px solid var(--tm3-border)",
                    overflow: "hidden",
                    boxShadow: "var(--tm3-shadow-md)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ padding: "16px 20px", background: "linear-gradient(135deg, rgba(6,31,26,0.95), rgba(16,185,129,0.25))", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <Badge tone="green">Mechanics & Materials</Badge>
                      <h3 style={{ margin: "6px 0 2px", fontSize: "1.2rem", color: "#fff" }}>
                        2D Stress Tensor & Mohr's Circle
                      </h3>
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "var(--tm3-lime)", fontWeight: 800 }}>TMA Short #02</span>
                  </div>

                  {/* Mohr's Circle Visualizer */}
                  <div style={{ padding: 20, background: "rgba(0,0,0,0.25)", display: "flex", justifyContent: "center" }}>
                    <svg width="100%" height="220" viewBox="0 0 360 220" style={{ overflow: "visible" }}>
                      {/* Axes */}
                      <line x1="20" y1="110" x2="340" y2="110" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                      <line x1="180" y1="20" x2="180" y2="200" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                      <text x="330" y="105" fill="#c5d9d1" fontSize="10">σ</text>
                      <text x="185" y="30" fill="#c5d9d1" fontSize="10">τ</text>

                      {/* Dynamic Mohr Circle */}
                      <circle
                        cx={180 + Number(mohrMetrics.center) * 0.9}
                        cy="110"
                        r={Math.max(10, Number(mohrMetrics.r) * 0.9)}
                        fill="rgba(16,185,129,0.15)"
                        stroke="#10b981"
                        strokeWidth="2"
                      />

                      {/* Principal Stress Points */}
                      <circle cx={180 + Number(mohrMetrics.sigma1) * 0.9} cy="110" r="4" fill="#38bdf8" />
                      <text x={180 + Number(mohrMetrics.sigma1) * 0.9 + 4} y="105" fill="#38bdf8" fontSize="10" fontWeight="700">σ₁</text>

                      <circle cx={180 + Number(mohrMetrics.sigma2) * 0.9} cy="110" r="4" fill="#38bdf8" />
                      <text x={180 + Number(mohrMetrics.sigma2) * 0.9 - 14} y="105" fill="#38bdf8" fontSize="10" fontWeight="700">σ₂</text>

                      {/* Center Point */}
                      <circle cx={180 + Number(mohrMetrics.center) * 0.9} cy="110" r="3" fill="#facc15" />
                      <text x={180 + Number(mohrMetrics.center) * 0.9 - 6} y="125" fill="#facc15" fontSize="10">C</text>
                    </svg>
                  </div>

                  {/* Sliders & Controls */}
                  <div style={{ padding: 20, display: "grid", gap: 14 }}>
                    <div className="tm3-form-grid" style={{ margin: 0 }}>
                      <label className="tm3-field">
                        <span>Normal Stress (σ_x): {sigmaX} MPa</span>
                        <input type="range" min="0" max="150" step="5" value={sigmaX} onChange={(e) => setSigmaX(Number(e.target.value))} />
                      </label>
                      <label className="tm3-field">
                        <span>Normal Stress (σ_y): {sigmaY} MPa</span>
                        <input type="range" min="0" max="150" step="5" value={sigmaY} onChange={(e) => setSigmaY(Number(e.target.value))} />
                      </label>
                      <label className="tm3-field tm3-field--full">
                        <span>Shear Stress (τ_xy): {tauXY} MPa</span>
                        <input type="range" min="0" max="80" step="5" value={tauXY} onChange={(e) => setTauXY(Number(e.target.value))} />
                      </label>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, padding: 12, borderRadius: 12, background: "var(--tm3-surface-muted)", textAlign: "center" }}>
                      <div>
                        <small style={{ color: "var(--tm3-text-soft)", fontSize: "0.72rem" }}>Major Principal (σ₁)</small>
                        <strong style={{ display: "block", fontSize: "1.05rem", color: "var(--tm3-primary)" }}>{mohrMetrics.sigma1} MPa</strong>
                      </div>
                      <div>
                        <small style={{ color: "var(--tm3-text-soft)", fontSize: "0.72rem" }}>Minor Principal (σ₂)</small>
                        <strong style={{ display: "block", fontSize: "1.05rem", color: "#38bdf8" }}>{mohrMetrics.sigma2} MPa</strong>
                      </div>
                      <div>
                        <small style={{ color: "var(--tm3-text-soft)", fontSize: "0.72rem" }}>Max In-Plane Shear (τ_max)</small>
                        <strong style={{ display: "block", fontSize: "1.05rem", color: "#facc15" }}>{mohrMetrics.tauMax} MPa</strong>
                      </div>
                    </div>
                  </div>
                </article>

                {/* Key Takeaway Card */}
                <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ padding: 24, borderRadius: 22, background: "var(--tm3-surface)", border: "1px solid var(--tm3-border)", flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <Sparkles size={18} style={{ color: "var(--tm3-lime)" }} />
                      <strong style={{ fontSize: "1.05rem" }}>Key Engineering Principle</strong>
                    </div>
                    <p style={{ margin: "0 0 12px", fontSize: "0.88rem", lineHeight: 1.6, color: "var(--tm3-ink)" }}>
                      Every multi-axial state of stress has an orientation plane where <strong>shear stress vanishes identically (τ = 0)</strong>. The normal stresses acting on these planes are the <strong>principal stresses (σ₁, σ₂)</strong>.
                    </p>
                    <p style={{ margin: "0 0 16px", fontSize: "0.85rem", lineHeight: 1.6, color: "var(--tm3-text-soft)" }}>
                      Brittle materials (concrete, cast iron) fail along planes of maximum tensile stress (Rankine criterion), while ductile metals (mild steel, aluminum) yield along planes of maximum shear stress τ_max (Tresca / von Mises criteria).
                    </p>
                    <div style={{ padding: 12, borderRadius: 10, background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.2)", fontSize: "0.82rem" }}>
                      <strong>Principal Stress Radius Formula:</strong>
                      <div style={{ fontFamily: "monospace", color: "var(--tm3-primary)", fontWeight: 700, marginTop: 4 }}>
                        R = √(((σ_x - σ_y)/2)² + τ_xy²)
                      </div>
                    </div>
                  </div>
                </aside>
              </>
            )}

            {/* 3. SHORT 2: EM WAVES & FOURIER HARMONICS */}
            {activeReelIndex === 2 && (
              <>
                <article
                  style={{
                    borderRadius: 24,
                    background: "var(--tm3-surface)",
                    border: "1px solid var(--tm3-border)",
                    overflow: "hidden",
                    boxShadow: "var(--tm3-shadow-md)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ padding: "16px 20px", background: "linear-gradient(135deg, rgba(6,31,26,0.95), rgba(16,185,129,0.25))", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <Badge tone="green">Electrical & Signals</Badge>
                      <h3 style={{ margin: "6px 0 2px", fontSize: "1.2rem", color: "#fff" }}>
                        Fourier Synthesis & Traveling Waves
                      </h3>
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "var(--tm3-lime)", fontWeight: 800 }}>TMA Short #03</span>
                  </div>

                  {/* Fourier Synthesizer Canvas */}
                  <div style={{ padding: 20, background: "rgba(0,0,0,0.25)", display: "flex", justifyContent: "center" }}>
                    <svg width="100%" height="220" viewBox="0 0 400 220" style={{ overflow: "visible" }}>
                      <line x1="20" y1="110" x2="380" y2="110" stroke="rgba(255,255,255,0.2)" />
                      {/* Synthesize points across 400px */}
                      <path
                        d={(() => {
                          const pts: string[] = [];
                          for (let x = 20; x <= 380; x += 2) {
                            let yVal = 0;
                            const t = (x - 20) / 360 * 4 * Math.PI - simTime * 2;
                            // Add odd harmonics based on count
                            for (let h = 1; h <= harmonicsCount; h += 2) {
                              yVal += (4 / (Math.PI * h)) * Math.sin(h * t);
                            }
                            const py = 110 - yVal * 45;
                            pts.push(`${x === 20 ? "M" : "L"} ${x},${py}`);
                          }
                          return pts.join(" ");
                        })()}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2.5"
                      />
                    </svg>
                  </div>

                  {/* Harmonics Selector */}
                  <div style={{ padding: 20, display: "grid", gap: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Fourier Odd Harmonics Added:</span>
                      <div style={{ display: "flex", gap: 6 }}>
                        {[1, 3, 5, 7].map((h) => (
                          <button
                            key={h}
                            type="button"
                            className={`tm3-button ${harmonicsCount === h ? "tm3-button--dark" : "tm3-button--outline"}`}
                            onClick={() => setHarmonicsCount(h)}
                            style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                          >
                            N = {h}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>

                {/* Key Takeaway */}
                <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ padding: 24, borderRadius: 22, background: "var(--tm3-surface)", border: "1px solid var(--tm3-border)", flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <Sparkles size={18} style={{ color: "var(--tm3-lime)" }} />
                      <strong style={{ fontSize: "1.05rem" }}>Key Engineering Principle</strong>
                    </div>
                    <p style={{ margin: "0 0 12px", fontSize: "0.88rem", lineHeight: 1.6, color: "var(--tm3-ink)" }}>
                      Joseph Fourier's theorem states that any periodic engineering signal can be decomposed into an infinite sum of sinusoidal harmonics: f(t) = a₀/2 + ∑ (a_n cos(nωt) + b_n sin(nωt)).
                    </p>
                    <p style={{ margin: "0 0 16px", fontSize: "0.85rem", lineHeight: 1.6, color: "var(--tm3-text-soft)" }}>
                      Notice how adding odd harmonics (3f, 5f, 7f) sharpens the rise and fall slopes, synthesizing a pure sinusoidal wave into a square digital clock pulse with the characteristic Gibbs phenomenon overshoot near discontinuities.
                    </p>
                  </div>
                </aside>
              </>
            )}

            {/* 4. SHORT 3: HARMONIC RESONANCE & VIBRATION */}
            {activeReelIndex === 3 && (
              <>
                <article
                  style={{
                    borderRadius: 24,
                    background: "var(--tm3-surface)",
                    border: "1px solid var(--tm3-border)",
                    overflow: "hidden",
                    boxShadow: "var(--tm3-shadow-md)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ padding: "16px 20px", background: "linear-gradient(135deg, rgba(6,31,26,0.95), rgba(16,185,129,0.25))", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <Badge tone="green">Dynamics & Vibrations</Badge>
                      <h3 style={{ margin: "6px 0 2px", fontSize: "1.2rem", color: "#fff" }}>
                        Harmonic Resonance & Base Excitation
                      </h3>
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "var(--tm3-lime)", fontWeight: 800 }}>TMA Short #04</span>
                  </div>

                  {/* Mass Bob Bouncing Canvas */}
                  <div style={{ padding: 20, background: "rgba(0,0,0,0.25)", display: "flex", justifyContent: "center" }}>
                    <svg width="100%" height="220" viewBox="0 0 360 220" style={{ overflow: "visible" }}>
                      {/* Fixed base ceiling */}
                      <rect x="80" y="20" width="200" height="8" fill="#64748b" />
                      {/* Spring coil */}
                      <path
                        d={(() => {
                          const bobY = 120 + Math.sin(simTime * freqRatio * 4) * Math.min(60, Number(resonanceMetrics.dmf) * 12);
                          let springPath = "M 180,28 ";
                          const segments = 8;
                          const segHeight = (bobY - 48) / segments;
                          for (let i = 0; i < segments; i++) {
                            const xOffset = i % 2 === 0 ? 195 : 165;
                            springPath += `L ${xOffset},${35 + i * segHeight} `;
                          }
                          springPath += `L 180,${bobY - 15}`;
                          return springPath;
                        })()}
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="2.5"
                      />

                      {/* Mass Bob */}
                      <g transform={`translate(180, ${120 + Math.sin(simTime * freqRatio * 4) * Math.min(60, Number(resonanceMetrics.dmf) * 12)})`}>
                        <rect x="-24" y="-15" width="48" height="30" rx="6" fill={resonanceMetrics.isNearResonance ? "#ef4444" : "#10b981"} />
                        <text x="0" y="4" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="800">m</text>
                      </g>
                    </svg>
                  </div>

                  {/* Controls */}
                  <div style={{ padding: 20, display: "grid", gap: 14 }}>
                    <div className="tm3-form-grid" style={{ margin: 0 }}>
                      <label className="tm3-field">
                        <span>Frequency Ratio (ω / ω_n): {freqRatio}</span>
                        <input type="range" min="0.4" max="1.6" step="0.05" value={freqRatio} onChange={(e) => setFreqRatio(Number(e.target.value))} />
                      </label>
                      <label className="tm3-field">
                        <span>Damping Ratio (ζ): {dampingRatio}</span>
                        <input type="range" min="0.05" max="0.5" step="0.05" value={dampingRatio} onChange={(e) => setDampingRatio(Number(e.target.value))} />
                      </label>
                    </div>

                    <div style={{ padding: 12, borderRadius: 12, background: "var(--tm3-surface-muted)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Dynamic Magnification Factor (DMF):</span>
                      <strong style={{ fontSize: "1.2rem", color: resonanceMetrics.isNearResonance ? "#ef4444" : "var(--tm3-primary)" }}>
                        {resonanceMetrics.dmf}x
                      </strong>
                    </div>
                  </div>
                </article>

                {/* Key Takeaway */}
                <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ padding: 24, borderRadius: 22, background: "var(--tm3-surface)", border: "1px solid var(--tm3-border)", flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <Sparkles size={18} style={{ color: "var(--tm3-lime)" }} />
                      <strong style={{ fontSize: "1.05rem" }}>Key Engineering Principle</strong>
                    </div>
                    <p style={{ margin: "0 0 12px", fontSize: "0.88rem", lineHeight: 1.6, color: "var(--tm3-ink)" }}>
                      When driving excitation frequency approaches the system natural frequency (ω → ω_n), the response amplitude explodes by the <strong>Dynamic Magnification Factor</strong> DMF = 1 / (2ζ).
                    </p>
                    <p style={{ margin: "0 0 16px", fontSize: "0.85rem", lineHeight: 1.6, color: "var(--tm3-text-soft)" }}>
                      This phenomenon explains why earthquake ground motions shatter buildings with matching natural periods, and why rotating turbo-machinery must safely pass through critical whirling speeds without dwelling.
                    </p>
                  </div>
                </aside>
              </>
            )}
          </div>
        </section>
      )}

      {/* =====================================================================
          TAB 2: EXAM CALENDARS & INTERNSHIPS
          ===================================================================== */}
      {activeTab === "opportunities" && (
        <section className="tm3-shell" style={{ display: "grid", gap: 36, marginBottom: 60 }}>
          {/* Competitive Exams Section */}
          <div>
            <div style={{ marginBottom: 18 }}>
              <span className="tm3-eyebrow">National Engineering Competitive Gateways</span>
              <h2 style={{ margin: "4px 0 0", fontSize: "1.4rem" }}>
                Annual Examination Schedules & Official Portals
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>
              {EXAM_OPPORTUNITIES.map((exam) => (
                <article
                  key={exam.id}
                  style={{
                    padding: 22,
                    borderRadius: 20,
                    background: "var(--tm3-surface)",
                    border: "1px solid var(--tm3-border)",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "var(--tm3-shadow-sm)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                    <Badge tone="green">{exam.category}</Badge>
                    <span style={{ fontSize: "0.72rem", color: "var(--tm3-primary)", fontWeight: 700 }}>
                      {exam.typicalMonth}
                    </span>
                  </div>

                  <h3 style={{ margin: "0 0 4px", fontSize: "1.15rem", fontWeight: 800 }}>{exam.title}</h3>
                  <small style={{ color: "var(--tm3-text-soft)", fontSize: "0.78rem", marginBottom: 10 }}>
                    {exam.organization} · {exam.discipline}
                  </small>

                  <p style={{ margin: "0 0 14px", fontSize: "0.82rem", color: "var(--tm3-ink)", lineHeight: 1.5, flex: 1 }}>
                    {exam.description}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--tm3-border)", paddingTop: 14, marginTop: "auto" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--tm3-text-soft)" }}>
                      Eligibility: {exam.eligibility}
                    </span>
                    <a
                      href={exam.officialPortal}
                      target="_blank"
                      rel="noreferrer"
                      className="tm3-button tm3-button--outline"
                      style={{ padding: "4px 12px", fontSize: "0.78rem" }}
                    >
                      Official Portal <ExternalLink size={13} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Internships Section */}
          <div>
            <div style={{ marginBottom: 18 }}>
              <span className="tm3-eyebrow">Industry & Research Traineeships</span>
              <h2 style={{ margin: "4px 0 0", fontSize: "1.4rem" }}>
                Curated Engineering Internships & Projects
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>
              {INTERNSHIPS.map((item) => (
                <article
                  key={item.id}
                  style={{
                    padding: 22,
                    borderRadius: 20,
                    background: "var(--tm3-surface)",
                    border: "1px solid var(--tm3-border)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <Badge tone="gold">{item.mode}</Badge>
                    <span style={{ fontSize: "0.75rem", color: "var(--tm3-primary)", fontWeight: 700 }}>{item.stipend}</span>
                  </div>

                  <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem", fontWeight: 800 }}>{item.title}</h3>
                  <small style={{ color: "var(--tm3-text-soft)", fontSize: "0.78rem", marginBottom: 10 }}>
                    {item.company} · {item.domain}
                  </small>

                  <p style={{ margin: "0 0 14px", fontSize: "0.82rem", color: "var(--tm3-ink)", lineHeight: 1.5, flex: 1 }}>
                    {item.description}
                  </p>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                    {item.skillsRequired.map((s) => (
                      <span key={s} style={{ padding: "2px 8px", borderRadius: 6, background: "var(--tm3-surface-muted)", fontSize: "0.72rem", fontWeight: 600 }}>
                        {s}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--tm3-border)", paddingTop: 14, marginTop: "auto" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--tm3-text-soft)" }}>Duration: {item.duration}</span>
                    <Link to="/student" className="tm3-button tm3-button--dark" style={{ padding: "4px 12px", fontSize: "0.78rem" }}>
                      Apply via Portal
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          TAB 3: MULTI-ENGINEERING CALCULATORS
          ===================================================================== */}
      {activeTab === "calculators" && (
        <section className="tm3-shell" style={{ display: "grid", gap: 32, marginBottom: 60 }}>
          <div>
            <span className="tm3-eyebrow">Design Automation</span>
            <h2 style={{ margin: "4px 0 0", fontSize: "1.5rem" }}>Quick Engineering Calculators</h2>
            <p style={{ margin: "4px 0 0", color: "var(--tm3-text-soft)", fontSize: "0.85rem" }}>
              Instant verification solvers grounded in Indian Standards (IS), Eurocodes, and solid mechanics formulations.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 24 }}>
            {/* CALCULATOR 1: IS 10262 CONCRETE DESIGN */}
            <article style={{ padding: 24, borderRadius: 20, background: "var(--tm3-surface)", border: "1px solid var(--tm3-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <Badge tone="green">IS 10262:2019 / IS 456</Badge>
                  <h3 style={{ margin: "6px 0 0", fontSize: "1.2rem" }}>Target Mean Concrete Strength</h3>
                </div>
              </div>

              <div className="tm3-form-grid" style={{ marginBottom: 18 }}>
                <label className="tm3-field">
                  <span>Characteristic Strength (f_ck) Grade</span>
                  <select value={concreteGrade} onChange={(e) => setConcreteGrade(Number(e.target.value))}>
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
                  <select value={concreteExposure} onChange={(e) => setConcreteExposure(e.target.value)}>
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
                  <span>Standard Deviation (s):</span>
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

            {/* CALCULATOR 2: EULER COLUMN BUCKLING */}
            <article style={{ padding: 24, borderRadius: 20, background: "var(--tm3-surface)", border: "1px solid var(--tm3-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <Badge tone="green">Euler-Bernoulli Mechanics</Badge>
                  <h3 style={{ margin: "6px 0 0", fontSize: "1.2rem" }}>Critical Column Buckling Load</h3>
                </div>
              </div>

              <div className="tm3-form-grid" style={{ marginBottom: 18 }}>
                <label className="tm3-field">
                  <span>Column Height (L in meters): {colLength} m</span>
                  <input type="range" min="1" max="10" step="0.5" value={colLength} onChange={(e) => setColLength(Number(e.target.value))} />
                </label>

                <label className="tm3-field">
                  <span>Solid Diameter (d in meters): {colDiameter} m</span>
                  <input type="range" min="0.05" max="0.5" step="0.02" value={colDiameter} onChange={(e) => setColDiameter(Number(e.target.value))} />
                </label>

                <label className="tm3-field tm3-field--full">
                  <span>End Restraint Conditions</span>
                  <select value={colEndCondition} onChange={(e) => setColEndCondition(e.target.value)}>
                    <option value="both_pinned">Both Ends Pinned / Hinged (Le = 1.0 L)</option>
                    <option value="both_fixed">Both Ends Fixed (Le = 0.5 L)</option>
                    <option value="one_fixed_one_pinned">One Fixed, One Pinned (Le = 0.7 L)</option>
                    <option value="cantilever">Cantilever / One Fixed, One Free (Le = 2.0 L)</option>
                  </select>
                </label>
              </div>

              <div style={{ padding: 18, borderRadius: 14, background: "rgba(56,189,248,.1)", border: "1px solid rgba(56,189,248,.3)", display: "grid", gap: 8, fontSize: "0.85rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Euler Critical Buckling Load (P_cr):</span>
                  <strong style={{ color: "#38bdf8", fontSize: "1.1rem" }}>{columnCalc.Pcr_kN.toLocaleString()} kN</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Effective Length (Le):</span>
                  <strong>{columnCalc.Le} m</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Slenderness Ratio (λ = Le / k):</span>
                  <strong>{columnCalc.slenderness}</strong>
                </div>
              </div>
            </article>
          </div>
        </section>
      )}

      {/* =====================================================================
          TAB 4: FREE TECHNICAL HANDBOOKS & STUDY CODES (WITH IN-APP READER MODAL)
          ===================================================================== */}
      {activeTab === "materials" && (
        <section className="tm3-shell" style={{ display: "grid", gap: 24, marginBottom: 60 }}>
          <div>
            <span className="tm3-eyebrow">Open Engineering Library</span>
            <h2 style={{ margin: "4px 0 0", fontSize: "1.5rem" }}>
              Free Reference Handbooks & Computational Notebooks
            </h2>
            <p style={{ margin: "4px 0 0", color: "var(--tm3-text-soft)", fontSize: "0.85rem" }}>
              In-app technical guides with complete derivations, code snippets, and design standards across civil, mechanical, aerospace, and computational engineering.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 22 }}>
            {HANDBOOKS.map((hb) => (
              <article
                key={hb.id}
                style={{
                  padding: 22,
                  borderRadius: 20,
                  background: "var(--tm3-surface)",
                  border: "1px solid var(--tm3-border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  boxShadow: "var(--tm3-shadow-sm)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Badge tone="green">{hb.discipline}</Badge>
                  <small style={{ color: "var(--tm3-text-soft)", fontWeight: 700 }}>{hb.format}</small>
                </div>

                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800 }}>{hb.title}</h3>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--tm3-text-soft)", lineHeight: 1.5, flex: 1 }}>
                  {hb.summary}
                </p>

                {/* Chapters Preview */}
                <div style={{ display: "grid", gap: 4, background: "var(--tm3-surface-muted)", padding: 10, borderRadius: 10 }}>
                  {hb.tableOfContents.slice(0, 3).map((c, i) => (
                    <span key={i} style={{ fontSize: "0.74rem", color: "var(--tm3-ink)" }}>
                      {c}
                    </span>
                  ))}
                  {hb.tableOfContents.length > 3 && (
                    <small style={{ color: "var(--tm3-primary)", fontSize: "0.72rem", fontWeight: 700 }}>
                      + {hb.tableOfContents.length - 3} more sections inside
                    </small>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--tm3-border)", paddingTop: 14, marginTop: "auto" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--tm3-primary)", fontWeight: 700 }}>{hb.pages}</span>
                  <button
                    type="button"
                    className="tm3-button tm3-button--gold"
                    onClick={() => setActiveHandbook(hb)}
                    style={{ padding: "6px 14px", fontSize: "0.82rem" }}
                  >
                    <BookOpen size={14} /> Read Handbook
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          IN-APP HANDBOOK & CODE READER POPUP MODAL
          ========================================================================= */}
      {activeHandbook && (
        <div className="tm3-modal-backdrop" style={{ zIndex: 1300 }} role="presentation">
          <div
            className="tm3-modal"
            style={{ maxWidth: 900, maxHeight: "92vh", display: "flex", flexDirection: "column" }}
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="tm3-modal__head" style={{ borderBottom: "1px solid var(--tm3-border)", paddingBottom: 16 }}>
              <div>
                <span className="tm3-eyebrow">{activeHandbook.discipline} · {activeHandbook.tag}</span>
                <h2 style={{ fontSize: "1.3rem", margin: "4px 0 0" }}>{activeHandbook.title}</h2>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  type="button"
                  className="tm3-button tm3-button--outline"
                  onClick={() => window.print()}
                  style={{ fontSize: "0.78rem", padding: "6px 12px", minHeight: 32 }}
                >
                  <Printer size={14} /> Print / Save PDF
                </button>
                <button type="button" onClick={() => setActiveHandbook(null)} aria-label="Close">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Reader Body */}
            <div style={{ overflowY: "auto", padding: "20px 0", display: "grid", gap: 24 }}>
              {/* Summary Lead */}
              <div style={{ padding: 16, borderRadius: 14, background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.2)", fontSize: "0.88rem", lineHeight: 1.6 }}>
                <strong>Handbook Overview:</strong> {activeHandbook.summary}
              </div>

              {/* Sections */}
              {activeHandbook.contentSections.map((sec, sIdx) => (
                <div key={sIdx} style={{ display: "grid", gap: 12 }}>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "var(--tm3-ink)", borderBottom: "1px solid var(--tm3-border)", paddingBottom: 6 }}>
                    {sec.heading}
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.88rem", lineHeight: 1.65, color: "var(--tm3-text)" }}>
                    {sec.text}
                  </p>

                  {/* Formulas List */}
                  {sec.formulas && sec.formulas.length > 0 && (
                    <div style={{ display: "grid", gap: 8, padding: 14, borderRadius: 12, background: "var(--tm3-surface-muted)", border: "1px solid var(--tm3-border)" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--tm3-primary)", textTransform: "uppercase" }}>
                        Governing Mathematical Formulas
                      </span>
                      {sec.formulas.map((f, fIdx) => (
                        <div key={fIdx} style={{ fontFamily: "monospace", fontSize: "0.84rem", color: "var(--tm3-ink)", fontWeight: 600 }}>
                          • {f}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Code Snippet */}
                  {sec.codeBlock && (
                    <div style={{ position: "relative" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0a2620", color: "#a7f3d0", padding: "6px 14px", borderTopLeftRadius: 10, borderTopRightRadius: 10, fontSize: "0.74rem", fontWeight: 700 }}>
                        <span>Python Computational Code</span>
                        <button
                          type="button"
                          onClick={() => copyCodeToClipboard(sec.codeBlock!, sIdx)}
                          style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.72rem" }}
                        >
                          <Copy size={12} /> {copiedCodeIndex === sIdx ? "Copied!" : "Copy Code"}
                        </button>
                      </div>
                      <pre className="tm3-code-snippet" style={{ margin: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0, maxHeight: 220, overflow: "auto" }}>
                        <code>{sec.codeBlock}</code>
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Actions */}
            <div className="tm3-modal__actions" style={{ borderTop: "1px solid var(--tm3-border)", paddingTop: 14 }}>
              <button className="tm3-button tm3-button--outline" type="button" onClick={() => setActiveHandbook(null)}>
                Close Handbook
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
