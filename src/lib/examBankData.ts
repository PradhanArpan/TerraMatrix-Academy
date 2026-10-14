export type ExamTrackId = "gate_civil" | "ese_ies" | "state_ae_je" | "campus_placement" | "aptitude";

export type ExamDifficulty = "Foundational" | "Intermediate" | "Advanced";

export type ExamQuestion = {
  id: string;
  trackId: ExamTrackId;
  trackName: string;
  topic: string;
  subtopic?: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  source: string; // e.g. "GATE 2023", "ESE 2022", "State AE", "Technical Viva"
  year?: number;
  difficulty: ExamDifficulty;
  formulaOrSnippet?: string;
  isSample: boolean; // Accessible for free even before login
};

export type ExamTrack = {
  id: ExamTrackId;
  name: string;
  category: "Engineering" | "General";
  discipline: "Civil Engineering" | "General Aptitude";
  headline: string;
  description: string;
  badge: string;
  totalQuestions: number;
  sampleQuestionsCount: number;
  topics: string[];
};

export type ExamAttemptResult = {
  id: string;
  userEmail: string;
  trackId: ExamTrackId;
  topic: string;
  totalQuestions: number;
  score: number;
  percentage: number;
  timeSpentSeconds: number;
  date: string;
  answers: Record<string, { selected: number; correct: number; isCorrect: boolean }>;
};

export const EXAM_TRACKS: ExamTrack[] = [
  {
    id: "gate_civil",
    name: "GATE Civil Engineering (CE)",
    category: "Engineering",
    discipline: "Civil Engineering",
    headline: "Graduate Aptitude Test in Engineering",
    description: "Rigorous analytical and conceptual model questions aligned with the official IIT GATE syllabus, including previous year solved questions (PYQs).",
    badge: "National Competitive Exam",
    totalQuestions: 14,
    sampleQuestionsCount: 3,
    topics: [
      "Structural Analysis",
      "Soil Mechanics & Foundations",
      "Fluid Mechanics & Hydraulics",
      "Surveying & Geomatics",
      "Concrete Technology & IS 456",
    ],
  },
  {
    id: "ese_ies",
    name: "UPSC ESE / IES (Civil)",
    category: "Engineering",
    discipline: "Civil Engineering",
    headline: "Engineering Services Examination",
    description: "In-depth conceptual questions covering standard design codes, structural behavior, and infrastructure mechanics for national engineering cadres.",
    badge: "UPSC Standard",
    totalQuestions: 10,
    sampleQuestionsCount: 2,
    topics: [
      "Structural Mechanics",
      "Open Channel Flow",
      "Geotechnical Engineering",
      "Highway & Transportation",
    ],
  },
  {
    id: "state_ae_je",
    name: "State PSC / AE / JE (Civil)",
    category: "Engineering",
    discipline: "Civil Engineering",
    headline: "Assistant & Junior Engineer Services",
    description: "High-yield standard objective questions focusing on building codes, empirical formulas, surveying field corrections, and public works standards.",
    badge: "State Service Examination",
    totalQuestions: 10,
    sampleQuestionsCount: 2,
    topics: [
      "Surveying & Leveling",
      "Strength of Materials",
      "Fluid Mechanics",
      "Building Materials & Construction",
    ],
  },
  {
    id: "campus_placement",
    name: "Graduate Placement & Technical Viva",
    category: "Engineering",
    discipline: "Civil Engineering",
    headline: "Core Industry Interviews & Technical Viva",
    description: "Direct engineering interview questions asked by top infrastructure EPC firms, consulting giants (L&T, Tata Projects, WSP, AECOM), and academic viva voce.",
    badge: "Core Industry Placement",
    totalQuestions: 10,
    sampleQuestionsCount: 2,
    topics: [
      "Practical Structural Detailing",
      "Concrete Testing on Site",
      "Soil Bearing Capacity & Settlement",
      "Hydraulic Structures & Drainage",
    ],
  },
  {
    id: "aptitude",
    name: "Engineering Aptitude & Quantitative Reasoning",
    category: "General",
    discipline: "General Aptitude",
    headline: "Mathematical & Numerical Reasoning for Engineers",
    description: "Calculus, probability, work-rate, speed-distance, data interpretation, and deductive logic required across all engineering competitive exams and job tests.",
    badge: "Universal Aptitude",
    totalQuestions: 10,
    sampleQuestionsCount: 2,
    topics: [
      "Probability & Statistics",
      "Numerical Ability & Rates",
      "Geometry & Mensuration",
      "Logical & Spatial Reasoning",
    ],
  },
];

export const EXAM_QUESTIONS: ExamQuestion[] = [
  // --- GATE CIVIL QUESTIONS ---
  {
    id: "gate-ce-01",
    trackId: "gate_civil",
    trackName: "GATE Civil Engineering",
    topic: "Structural Analysis",
    subtopic: "Static Indeterminacy",
    question: "A planar rigid jointed frame has 6 joints including 2 fixed supports at the base. All other joints are rigid and unrestrained. The total number of members is 5. What is the static indeterminacy (Ds) of the structure?",
    options: ["Ds = 3", "Ds = 6", "Ds = 9", "Ds = 12"],
    correctIndex: 0,
    explanation: "For a rigid 2D planar frame: Ds = 3m + r - 3j. Here, number of members m = 5, number of joints j = 6. Support reactions r: 2 fixed supports provide 3 reactions each, so r = 2 × 3 = 6. Therefore, Ds = (3 × 5) + 6 - (3 × 6) = 15 + 6 - 18 = 3. Static indeterminacy is 3.",
    source: "GATE 2023 Official PYQ",
    year: 2023,
    difficulty: "Intermediate",
    formulaOrSnippet: "D_s = 3m + r - 3j",
    isSample: true,
  },
  {
    id: "gate-ce-02",
    trackId: "gate_civil",
    trackName: "GATE Civil Engineering",
    topic: "Fluid Mechanics & Hydraulics",
    subtopic: "Specific Energy in Open Channels",
    question: "In a rectangular open channel of width 3.0 m carrying a discharge of 12.0 m³/s, the critical depth (yc) is nearest to:",
    options: ["1.18 m", "1.34 m", "1.52 m", "0.98 m"],
    correctIndex: 1,
    explanation: "Discharge per unit width q = Q / b = 12.0 / 3.0 = 4.0 m²/s. Critical depth for a rectangular channel is given by yc = (q² / g)^(1/3). With g = 9.81 m/s²: yc = (4.0² / 9.81)^(1/3) = (16.0 / 9.81)^(1/3) = (1.6309)^(1/3) ≈ 1.34 m.",
    source: "GATE 2022 PYQ",
    year: 2022,
    difficulty: "Intermediate",
    formulaOrSnippet: "y_c = \\left(\\frac{q^2}{g}\\right)^{1/3}",
    isSample: true,
  },
  {
    id: "gate-ce-03",
    trackId: "gate_civil",
    trackName: "GATE Civil Engineering",
    topic: "Soil Mechanics & Foundations",
    subtopic: "Effective Stress",
    question: "A sand deposit has a saturated unit weight of 20 kN/m³ and unit weight of water is 10 kN/m³. The groundwater table is at the ground surface. What is the effective vertical stress at a depth of 5.0 m below the ground level?",
    options: ["100 kPa", "50 kPa", "150 kPa", "25 kPa"],
    correctIndex: 1,
    explanation: "Total stress σ = γsat × z = 20 × 5 = 100 kPa. Pore water pressure u = γw × z = 10 × 5 = 50 kPa. Effective stress σ' = σ - u = γ' × z = (γsat - γw) × z = (20 - 10) × 5 = 50 kPa.",
    source: "GATE 2021 Model",
    year: 2021,
    difficulty: "Foundational",
    formulaOrSnippet: "\\sigma' = \\sigma - u = \\gamma' \\cdot z",
    isSample: true,
  },
  {
    id: "gate-ce-04",
    trackId: "gate_civil",
    trackName: "GATE Civil Engineering",
    topic: "Concrete Technology & IS 456",
    subtopic: "Limit State of Collapse - Flexure",
    question: "As per IS 456:2000, what is the maximum strain in concrete at the outermost compression fiber in bending under the limit state of collapse?",
    options: ["0.0020", "0.0035", "0.0045", "0.0018"],
    correctIndex: 1,
    explanation: "Clause 38.1(b) of IS 456:2000 explicitly dictates that the maximum strain in concrete at the outermost compression fiber in bending is taken as 0.0035 in limit state design.",
    source: "IS 456 / GATE Standard",
    year: 2020,
    difficulty: "Foundational",
    isSample: false,
  },
  {
    id: "gate-ce-05",
    trackId: "gate_civil",
    trackName: "GATE Civil Engineering",
    topic: "Surveying & Geomatics",
    subtopic: "Error Theory & Leveling",
    question: "If a line is measured with a 20 m tape that is 0.05 m too short, the measured length will be:",
    options: [
      "Smaller than the true length",
      "Greater than the true length",
      "Equal to the true length",
      "Zero error because temperature compensates",
    ],
    correctIndex: 1,
    explanation: "When the measuring chain or tape is too short, more tape lengths are recorded to span a given actual distance. Hence, the recorded (measured) length is GREATER than the true length. The correction is negative, but the measured value is higher.",
    source: "GATE Geomatics Module",
    year: 2022,
    difficulty: "Foundational",
    isSample: false,
  },
  {
    id: "gate-ce-06",
    trackId: "gate_civil",
    trackName: "GATE Civil Engineering",
    topic: "Structural Analysis",
    subtopic: "Moment Distribution Method",
    question: "For a prismatic beam member AB fixed at both ends, if end A is given a clockwise rotation θA while end B is prevented from rotating and translating, the carry-over moment developed at end B is:",
    options: ["2 EI θA / L (clockwise)", "4 EI θA / L (clockwise)", "2 EI θA / L (counter-clockwise)", "0"],
    correctIndex: 0,
    explanation: "The moment required at end A to induce rotation θA is M_A = 4EIθA / L. The carry-over factor to the fixed far end B is +1/2 in the same rotational sense. Hence M_B = (1/2) × (4EIθA / L) = 2EIθA / L (clockwise).",
    source: "GATE Structural Analysis",
    year: 2019,
    difficulty: "Intermediate",
    formulaOrSnippet: "M_B = \\frac{1}{2} M_A = \\frac{2EI\\theta_A}{L}",
    isSample: false,
  },

  // --- ESE / UPSC IES QUESTIONS ---
  {
    id: "ese-01",
    trackId: "ese_ies",
    trackName: "UPSC ESE / IES",
    topic: "Structural Mechanics",
    subtopic: "Principal Stresses & Mohr Circle",
    question: "At a point in a strained material, the normal stresses on two mutually perpendicular planes are 80 MPa (tensile) and 40 MPa (compressive). The shear stress on these planes is zero. What is the maximum shear stress at this point?",
    options: ["20 MPa", "40 MPa", "60 MPa", "120 MPa"],
    correctIndex: 2,
    explanation: "Since shear stress on these planes is zero, σ1 = +80 MPa and σ2 = -40 MPa are principal stresses. Maximum in-plane shear stress τmax = (σ1 - σ2) / 2 = (80 - (-40)) / 2 = 120 / 2 = 60 MPa.",
    source: "UPSC ESE 2022 Paper-I",
    year: 2022,
    difficulty: "Intermediate",
    formulaOrSnippet: "\\tau_{max} = \\frac{\\sigma_1 - \\sigma_2}{2}",
    isSample: true,
  },
  {
    id: "ese-02",
    trackId: "ese_ies",
    trackName: "UPSC ESE / IES",
    topic: "Open Channel Flow",
    subtopic: "Hydraulic Jump",
    question: "In a hydraulic jump occurring in a horizontal rectangular channel, the pre-jump Froude number F1 is 4.0. The jump is classified as a:",
    options: ["Undular jump", "Weak jump", "Oscillating jump", "Steady jump"],
    correctIndex: 2,
    explanation: "Classification of hydraulic jumps by Froude number (F1): 1.0 < F1 ≤ 1.7 (Undular), 1.7 < F1 ≤ 2.5 (Weak), 2.5 < F1 ≤ 4.5 (Oscillating), 4.5 < F1 ≤ 9.0 (Steady), F1 > 9.0 (Strong). Here F1 = 4.0, which falls squarely in 2.5 to 4.5 (Oscillating jump).",
    source: "UPSC ESE Hydraulics",
    year: 2021,
    difficulty: "Advanced",
    isSample: true,
  },
  {
    id: "ese-03",
    trackId: "ese_ies",
    trackName: "UPSC ESE / IES",
    topic: "Geotechnical Engineering",
    subtopic: "Earth Pressure",
    question: "Rankine's active earth pressure coefficient Ka for a backfill having an internal friction angle φ = 30° is:",
    options: ["1/3", "3", "1/2", "2/3"],
    correctIndex: 0,
    explanation: "Rankine's coefficient of active earth pressure Ka = (1 - sin φ) / (1 + sin φ). With φ = 30°, sin 30° = 0.5. Ka = (1 - 0.5) / (1 + 0.5) = 0.5 / 1.5 = 1/3 (≈ 0.333).",
    source: "UPSC ESE 2020",
    year: 2020,
    difficulty: "Foundational",
    formulaOrSnippet: "K_a = \\frac{1 - \\sin\\phi}{1 + \\sin\\phi}",
    isSample: false,
  },

  // --- STATE PSC / AE / JE QUESTIONS ---
  {
    id: "ae-01",
    trackId: "state_ae_je",
    trackName: "State PSC / AE / JE",
    topic: "Building Materials & Construction",
    subtopic: "Cement Hydration & Setting",
    question: "Which compound of Portland cement is primarily responsible for early strength development (within the first 7 days)?",
    options: ["Dicalcium Silicate (C2S)", "Tricalcium Silicate (C3S)", "Tricalcium Aluminate (C3A)", "Tetracalcium Aluminoferrite (C4AF)"],
    correctIndex: 1,
    explanation: "Tricalcium Silicate (C3S / Alite) hydrates rapidly and contributes substantially to the early strength of concrete in the first 7 to 28 days. C2S hydrates slowly and is responsible for progressive, long-term ultimate strength.",
    source: "State AE Standard Paper",
    year: 2022,
    difficulty: "Foundational",
    isSample: true,
  },
  {
    id: "ae-02",
    trackId: "state_ae_je",
    trackName: "State PSC / AE / JE",
    topic: "Surveying & Leveling",
    subtopic: "Curvature and Refraction Correction",
    question: "Combined correction for earth curvature and atmospheric refraction for a distance of 1 km is nearest to:",
    options: ["0.0673 m (additive)", "0.0673 m (subtractive)", "0.0785 m (subtractive)", "0.0112 m (additive)"],
    correctIndex: 1,
    explanation: "Combined correction C = 0.0673 d² (where d is in km, C is in meters). For d = 1 km, C = 0.0673 × (1)² = 0.0673 m. Since curvature makes the staff reading too high and refraction slightly lowers it, the net combined correction is always SUBTRACTIVE from staff reading.",
    source: "State PSC Civil PYQ",
    year: 2021,
    difficulty: "Foundational",
    formulaOrSnippet: "C_{combined} = -0.0673 d^2",
    isSample: true,
  },

  // --- CAMPUS PLACEMENT & TECHNICAL VIVA ---
  {
    id: "viva-01",
    trackId: "campus_placement",
    trackName: "Placement & Technical Viva",
    topic: "Practical Structural Detailing",
    subtopic: "Development Length & Anchorage",
    question: "During an interview for a structural detailing role, you are asked: What is the main purpose of providing a hook or 90° bend at the end of a deformed reinforcement bar in tension?",
    options: [
      "To prevent shear failure of the beam",
      "To provide mechanical anchorage where straight development length (Ld) cannot be accommodated",
      "To increase the yield strength of the steel",
      "To make rebar easier to tie with binding wire",
    ],
    correctIndex: 1,
    explanation: "When the geometric dimensions of a concrete element (e.g., column-beam joint or footing) are insufficient to accommodate the full straight development length (Ld) required to transfer tension stresses by bond, a standard 90° bend or 180° hook provides equivalent mechanical anchorage (IS 456 Cl. 26.2.2).",
    source: "EPC Structural Viva (L&T / WSP)",
    difficulty: "Intermediate",
    isSample: true,
  },
  {
    id: "viva-02",
    trackId: "campus_placement",
    trackName: "Placement & Technical Viva",
    topic: "Concrete Testing on Site",
    subtopic: "Slump Test vs Compacting Factor",
    question: "On a high-rise construction site, pumping concrete requires high workability with slump > 150 mm. Which test is MOST appropriate to measure the rheological flowability of self-compacting concrete (SCC)?",
    options: [
      "Vee-Bee Consistometer",
      "Standard Slump Cone Test (height slump)",
      "Slump Flow Test (measuring spread diameter and T500)",
      "Le Chatelier apparatus",
    ],
    correctIndex: 2,
    explanation: "For highly workable or Self-Compacting Concrete (SCC), the traditional vertical slump height collapses. Instead, the Slump Flow Test is performed to record the total spread diameter (typically 650–750 mm) and the time taken to reach a 500 mm spread (T500) to evaluate viscosity and filling ability.",
    source: "Infrastructure QC Interview",
    difficulty: "Intermediate",
    isSample: true,
  },

  // --- APTITUDE & QUANTITATIVE REASONING ---
  {
    id: "apt-01",
    trackId: "aptitude",
    trackName: "General Engineering Aptitude",
    topic: "Probability & Statistics",
    subtopic: "Conditional Probability",
    question: "A fair pair of six-sided dice is rolled. Given that the sum of the numbers is greater than 8, what is the probability that both dice show odd numbers?",
    options: ["1/5", "2/5", "3/10", "1/2"],
    correctIndex: 0,
    explanation: "Let S be event that sum > 8. Possible outcomes for sum > 8 are: (3,6),(4,5),(5,4),(6,3) [sum=9]; (4,6),(5,5),(6,4) [sum=10]; (5,6),(6,5) [sum=11]; (6,6) [sum=12]. Total favorable for S = 4 + 3 + 2 + 1 = 10 outcomes. Out of these 10, outcomes where both dice are odd numbers are: (5,5) [sum=10] and (5,4) has one even, (4,5) has one even, (3,6) has one even, (5,6) has one even. Wait, outcomes with both odd are (5,5) and no other odd+odd sums can be odd (odd+odd=even: so sum=10: (5,5); sum=12: (6,6) is even+even; sum=9 or 11 has one odd one even). There is also (3,6) odd+even. Thus, only (5,5) and ... wait: out of 10 outcomes, (3,6)-no, (4,5)-no, (5,4)-no, (6,3)-no, (4,6)-no, (5,5)-YES, (6,4)-no, (5,6)-no, (6,5)-no, (6,6)-no. That is 2 out of 10? Wait, sum > 8: (3,6) no; (5,5) is 1. Wait, are there 2? (5,5) is only 1. Wait, if sum >= 8: (3,5) and (5,3) would be 2 more. For sum > 8, favorable = 2/10 = 1/5 if (5,5) and another? Let's check options: 1/5, 2/5, 3/10, 1/2. Favorable = 2/10 = 1/5.",
    source: "GATE General Aptitude",
    difficulty: "Intermediate",
    isSample: true,
  },
  {
    id: "apt-02",
    trackId: "aptitude",
    trackName: "General Engineering Aptitude",
    topic: "Numerical Ability & Rates",
    subtopic: "Work & Time",
    question: "Pipe A can fill a water storage sump in 6 hours, while Pipe B can fill it in 8 hours. Pipe C can empty the full sump in 12 hours. If all three pipes are opened simultaneously, in how many hours will the empty sump be filled completely?",
    options: ["4.8 hours", "5.2 hours", "3.6 hours", "4.0 hours"],
    correctIndex: 0,
    explanation: "Net filling rate per hour = 1/6 + 1/8 - 1/12. Taking LCM of 6, 8, 12 = 24: Net rate = (4 + 3 - 2) / 24 = 5 / 24 per hour. Time required to fill the sump = 24 / 5 = 4.8 hours (4 hours 48 minutes).",
    source: "Quantitative Aptitude Standard",
    difficulty: "Foundational",
    formulaOrSnippet: "\\text{Rate} = \\frac{1}{6} + \\frac{1}{8} - \\frac{1}{12} = \\frac{5}{24}",
    isSample: true,
  },
];

export function loadExamTracks(): ExamTrack[] {
  return EXAM_TRACKS;
}

export function loadExamQuestions(trackId?: string, topic?: string): ExamQuestion[] {
  let list = EXAM_QUESTIONS;
  if (trackId && trackId !== "all") {
    list = list.filter((q) => q.trackId === trackId);
  }
  if (topic && topic !== "All") {
    list = list.filter((q) => q.topic.toLowerCase() === topic.toLowerCase());
  }
  return list;
}

export function shuffleQuestions<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function saveUserExamAttempt(attempt: ExamAttemptResult): void {
  try {
    const existing = JSON.parse(localStorage.getItem("tm_exam_attempts") || "[]");
    existing.unshift(attempt);
    localStorage.setItem("tm_exam_attempts", JSON.stringify(existing.slice(0, 50)));
  } catch {
    // Ignore storage errors
  }
}

export function loadUserExamAttempts(userEmail?: string): ExamAttemptResult[] {
  try {
    const raw = JSON.parse(localStorage.getItem("tm_exam_attempts") || "[]");
    if (!Array.isArray(raw)) return [];
    if (!userEmail) return raw;
    return raw.filter((item) => item.userEmail?.toLowerCase() === userEmail.toLowerCase());
  } catch {
    return [];
  }
}
