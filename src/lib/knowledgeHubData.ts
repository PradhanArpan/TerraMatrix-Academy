export type EngineeringBranch =
  | "Civil & Infrastructure"
  | "Mechanical & Aerospace"
  | "Electrical & Electronics"
  | "Computer Science & AI"
  | "Earth & Geospatial Sciences"
  | "General Engineering & Applied Sciences";

export const ENGINEERING_BRANCHES: EngineeringBranch[] = [
  "Civil & Infrastructure",
  "Mechanical & Aerospace",
  "Electrical & Electronics",
  "Computer Science & AI",
  "Earth & Geospatial Sciences",
  "General Engineering & Applied Sciences",
];

export type ExamCalendarItem = {
  id: string;
  examName: string;
  conductingBody: string;
  branch: EngineeringBranch;
  department: string;
  notificationDate: string;
  applicationWindow: string;
  examDate: string;
  officialUrl: string;
  status: "Active Registration" | "Upcoming Announcement" | "Date Announced" | "Admit Card Released";
  eligibility: string;
  notes: string;
};

export type OpportunityType = "Research Fellowship" | "Industrial Internship" | "Hackathon & Competition" | "Exhibition";

export type OpportunityItem = {
  id: string;
  title: string;
  organization: string;
  type: OpportunityType;
  branch: EngineeringBranch;
  department: string;
  specialization: string;
  stipendOrPrize: string;
  location: string;
  mode: "On-site" | "Remote" | "Hybrid";
  deadline: string;
  officialUrl: string;
  verified: boolean;
  eligibility: string;
  description: string;
};

export type StudyCodeItem = {
  id: string;
  codeName: string; // e.g. "IS 456:2000"
  standardBody: "BIS (Indian Standards)" | "IRC (Indian Roads Congress)" | "Eurocode" | "ASTM" | "ISO";
  branch: EngineeringBranch;
  department: string;
  title: string;
  scopeSummary: string;
  keyClauses: { clause: string; title: string; summary: string }[];
  downloadUrl?: string;
  verifiableRefUrl: string;
};

export type HandbookItem = {
  id: string;
  title: string;
  branch: EngineeringBranch;
  department: string;
  authorOrBody: string;
  edition: string;
  description: string;
  chapters: { title: string; pages: string; summary: string }[];
  keyFormulas: string[];
  readTime: string;
  pdfUrl?: string;
};

export type GlossaryItem = {
  id: string;
  term: string;
  branch: EngineeringBranch;
  department: string;
  specialization: string;
  definition: string;
  formula?: string;
  siUnit?: string;
  significance: string;
};

export type AutoCalculatorId =
  | "mannings_flow"
  | "concrete_moment"
  | "column_buckling"
  | "reynolds_pipe"
  | "earth_pressure";

export type AutoCalculatorItem = {
  id: AutoCalculatorId;
  name: string;
  branch: EngineeringBranch;
  department: string;
  formula: string;
  description: string;
  inputs: { key: string; label: string; unit: string; defaultValue: number; step?: number }[];
  calculate: (inputs: Record<string, number>) => { resultKey: string; resultLabel: string; value: string; unit: string; steps: string[] };
};

// Initial Seed Data for Exam Calendars
export const DEFAULT_EXAM_CALENDARS: ExamCalendarItem[] = [
  {
    id: "cal_gate_2026",
    examName: "GATE 2026 (Graduate Aptitude Test in Engineering)",
    conductingBody: "IIT Guwahati / IISc Consortium",
    branch: "General Engineering & Applied Sciences",
    department: "All Engineering Branches (CE, ME, CS, EE, EC, IN, DA)",
    notificationDate: "August 2025",
    applicationWindow: "24 Aug 2025 – 12 Oct 2025",
    examDate: "07 & 08 Feb, 14 & 15 Feb 2026",
    officialUrl: "https://gate2026.iitg.ac.in",
    status: "Date Announced",
    eligibility: "B.E. / B.Tech / M.Sc / Professional Candidates in 3rd/4th year or graduated",
    notes: "Mandatory qualification for M.Tech admissions across IITs/NITs and recruitment in Maharatna/Navratna PSUs.",
  },
  {
    id: "cal_ese_2026",
    examName: "UPSC ESE / IES 2026 (Engineering Services Examination)",
    conductingBody: "Union Public Service Commission (UPSC)",
    branch: "Civil & Infrastructure",
    department: "Civil, Mechanical, Electrical, Electronics Engineering",
    notificationDate: "September 2025",
    applicationWindow: "18 Sep 2025 – 08 Oct 2025",
    examDate: "Prelims: 15 Feb 2026 | Mains: 28 June 2026",
    officialUrl: "https://upsc.gov.in",
    status: "Date Announced",
    eligibility: "Engineering Degree holders in CE, ME, EE, or E&T branches. Age 21–30 years.",
    notes: "Direct recruitment to Group 'A' Central Engineering Services (CPWD, Indian Railways IRSE, Military Engineer Services MES, CWC).",
  },
  {
    id: "cal_isro_sc_2026",
    examName: "ISRO Scientist / Engineer 'SC' Recruitment Exam",
    conductingBody: "ISRO Centralised Recruitment Board (ICRB)",
    branch: "Mechanical & Aerospace",
    department: "Mechanical, Aerospace, Civil, Computer Science, Electronics",
    notificationDate: "November 2025",
    applicationWindow: "10 Nov 2025 – 02 Dec 2025",
    examDate: "March 2026 (Tentative)",
    officialUrl: "https://www.isro.gov.in/Careers.html",
    status: "Upcoming Announcement",
    eligibility: "B.E./B.Tech in First Class with minimum 65% aggregate or 6.84 CGPA.",
    notes: "Positions at VSSC Thiruvananthapuram, URSC Bengaluru, SAC Ahmedabad, and SDSC SHAR Sriharikota.",
  },
  {
    id: "cal_barc_oces_2026",
    examName: "BARC OCES / DGFS 2026 Scientific Officers",
    conductingBody: "Bhabha Atomic Research Centre (BARC)",
    branch: "General Engineering & Applied Sciences",
    department: "Nuclear, Mechanical, Chemical, Civil, Metallurgy, Computer Science",
    notificationDate: "December 2025",
    applicationWindow: "01 Jan 2026 – 31 Jan 2026",
    examDate: "04 – 06 April 2026",
    officialUrl: "https://barcoces.in",
    status: "Upcoming Announcement",
    eligibility: "B.E./B.Tech with minimum 60% marks or valid GATE 2025/2026 score.",
    notes: "Direct absorption as Scientific Officer (Group A Gazetted) in DAE research facilities.",
  },
  {
    id: "cal_ssc_je_2026",
    examName: "SSC Junior Engineer (JE) Examination 2026",
    conductingBody: "Staff Selection Commission (SSC)",
    branch: "Civil & Infrastructure",
    department: "Civil, Mechanical, and Electrical Junior Engineering",
    notificationDate: "March 2026",
    applicationWindow: "28 Mar 2026 – 25 Apr 2026",
    examDate: "Paper 1: June 2026 | Paper 2: October 2026",
    officialUrl: "https://ssc.gov.in",
    status: "Upcoming Announcement",
    eligibility: "Diploma or Degree in Civil, Mechanical, or Electrical Engineering.",
    notes: "Recruitment to CPWD, Central Water Commission, Border Roads Organisation (BRO), and MES.",
  },
  {
    id: "cal_state_psc_ae_2026",
    examName: "State Engineering Services (Assistant Engineer AE) Combined Exam",
    conductingBody: "State Public Service Commissions (Combined PWD / Irrigation / PHED)",
    branch: "Civil & Infrastructure",
    department: "Public Works, Water Resources & Environmental Engineering",
    notificationDate: "January 2026",
    applicationWindow: "15 Jan 2026 – 18 Feb 2026",
    examDate: "May 2026",
    officialUrl: "https://mpsc.gov.in",
    status: "Upcoming Announcement",
    eligibility: "B.E./B.Tech in Civil, Mechanical, or Electrical Engineering.",
    notes: "Direct recruitment to Class-II Gazetted Engineering Officers in State Governments.",
  },
];

// Initial Seed Data for Opportunities (Internships, Fellowships, Hackathons)
export const DEFAULT_OPPORTUNITIES: OpportunityItem[] = [
  {
    id: "opp_iit_surge",
    title: "IIT Kanpur SURGE Summer Research Fellowship",
    organization: "Indian Institute of Technology Kanpur",
    type: "Research Fellowship",
    branch: "General Engineering & Applied Sciences",
    department: "Interdisciplinary Engineering & Computational Sciences",
    specialization: "Scientific Computing, Finite Element Mechanics & Materials",
    stipendOrPrize: "₹15,000 / month + Campus Hostel",
    location: "IIT Kanpur Campus, Uttar Pradesh",
    mode: "On-site",
    deadline: "15 February 2026",
    officialUrl: "https://www.iitk.ac.in/surge",
    verified: true,
    eligibility: "Undergraduates in 3rd year with minimum 7.5 CGPA from recognized engineering colleges.",
    description: "8-week intensive research program under senior faculty mentors, focusing on advanced simulations, structural mechanics, water modeling, and machine learning.",
  },
  {
    id: "opp_csir_intern",
    title: "CSIR-CRRI National Summer Research Internship",
    organization: "Central Road Research Institute (CSIR-CRRI)",
    type: "Research Fellowship",
    branch: "Civil & Infrastructure",
    department: "Transportation & Geotechnical Engineering",
    specialization: "Pavement Mechanics, Subsurface Soil Stabilization & GIS",
    stipendOrPrize: "Certificate + Research Project Credits + Laboratory Access",
    location: "New Delhi",
    mode: "On-site",
    deadline: "31 March 2026",
    officialUrl: "https://crridom.gov.in/content/training-programs",
    verified: true,
    eligibility: "B.Tech/M.Tech Civil Engineering candidates with interest in highway materials and soil dynamics.",
    description: "Work with premier transport scientists on accelerated pavement testing, satellite remote sensing for highway alignment, and geotechnical ground improvement.",
  },
  {
    id: "opp_lt_bis",
    title: "L&T Build India Scholarship (BIS) & Project Internship",
    organization: "Larsen & Toubro Construction",
    type: "Industrial Internship",
    branch: "Civil & Infrastructure",
    department: "Construction Engineering & Management",
    specialization: "BIM Infrastructure Detailing, Smart Mega-Structures & EPC",
    stipendOrPrize: "100% M.Tech Tuition at IIT/NIT + ₹13,400 / month Stipend + Job Offer",
    location: "IIT Madras / IIT Delhi / NIT Trichy + L&T Project Sites",
    mode: "On-site",
    deadline: "10 January 2026",
    officialUrl: "https://www.lntecc.com/careers/build-india-scholarship",
    verified: true,
    eligibility: "Final-year B.E. / B.Tech Civil Engineering with minimum 70% aggregate.",
    description: "Prestigious 2-year sponsorship for M.Tech in Construction Technology & Management with permanent absorption as Executive Engineer at L&T.",
  },
  {
    id: "opp_sih_hackathon",
    title: "Smart India Hackathon (SIH) – Infrastructure & Clean Tech Theme",
    organization: "Ministry of Education & AICTE",
    type: "Hackathon & Competition",
    branch: "General Engineering & Applied Sciences",
    department: "Smart Infrastructure, Disaster Resilience & AI",
    specialization: "Sensor IoT, Flood Inundation AI & Renewable Energy",
    stipendOrPrize: "₹1,00,000 Cash Prize per problem statement + Incubation Support",
    location: "Designated Nodal Centers Across India",
    mode: "Hybrid",
    deadline: "20 November 2025",
    officialUrl: "https://www.sih.gov.in",
    verified: true,
    eligibility: "College student teams of 6 members with at least 1 female team member.",
    description: "National hackathon solving live problem statements provided by Central Ministries, State Governments, and Infrastructure PSUs.",
  },
  {
    id: "opp_siemens_intern",
    title: "Siemens Energy Numerical Simulation & FEA Internship",
    organization: "Siemens Energy India Technology Center",
    type: "Industrial Internship",
    branch: "Mechanical & Aerospace",
    department: "Thermal & Solid Mechanics",
    specialization: "Computational Fluid Dynamics (CFD) & High-temperature Stress",
    stipendOrPrize: "₹35,000 / month",
    location: "Gurugram / Pune",
    mode: "Hybrid",
    deadline: "28 February 2026",
    officialUrl: "https://www.siemens-energy.com/global/en/company/jobs.html",
    verified: true,
    eligibility: "Pre-final and final year B.Tech/M.Tech students with proficiency in ANSYS / Python.",
    description: "Hands-on engineering simulation on gas turbine blades, aerodynamic boundary layer dissipation, and structural fatigue life prediction.",
  },
  {
    id: "opp_asce_competition",
    title: "ASCE National Student Infrastructure Symposium & Design Challenge",
    organization: "American Society of Civil Engineers (ASCE India Section)",
    type: "Hackathon & Competition",
    branch: "Civil & Infrastructure",
    department: "Structural & Geotechnical Design",
    specialization: "Earthquake-Resistant Tall Buildings & Sustainable Bridge Design",
    stipendOrPrize: "National Trophy + ₹75,000 Cash + International Convention Travel Grant",
    location: "Hyderabad / Bengaluru",
    mode: "On-site",
    deadline: "15 April 2026",
    officialUrl: "https://www.asce.org",
    verified: true,
    eligibility: "Student members of ASCE or registered civil engineering students.",
    description: "Build physical scaled structural models tested on a shake table, presenting complete engineering calculations, CAD drawings, and cost estimations.",
  },
];

// Initial Seed Data for Study Codes & Standard Specifications
export const DEFAULT_STUDY_CODES: StudyCodeItem[] = [
  {
    id: "code_is_456",
    codeName: "IS 456:2000",
    standardBody: "BIS (Indian Standards)",
    branch: "Civil & Infrastructure",
    department: "Structural Engineering",
    title: "Plain and Reinforced Concrete – Code of Practice (Fourth Revision)",
    scopeSummary: "Mandatory standard for the structural design of all reinforced and prestressed concrete structures in India, formulating Limit State Design principles for flexure, shear, compression, and serviceability.",
    keyClauses: [
      { clause: "Clause 38.1", title: "Assumptions for Limit State of Collapse: Flexure", summary: "Plane sections remain plane; maximum compressive strain in concrete is 0.0035; tensile strength of concrete is ignored; parabolic-rectangular stress block with factor 0.36 fck b xu." },
      { clause: "Clause 40.1 - 40.4", title: "Design for Shear & Nominal Shear Stress (τv)", summary: "Nominal shear stress τv = Vu / (b * d). If τv < τc, provide minimum shear reinforcement. Maximum shear stress shall not exceed τc,max." },
      { clause: "Table 16 & 19", title: "Nominal Cover and Design Shear Strength of Concrete (τc)", summary: "Prescribes minimum concrete cover for mild to extreme durability exposures (20mm to 75mm) and shear strength based on 100 As / (b d)." },
      { clause: "Clause 26.5.1", title: "Minimum & Maximum Longitudinal Steel in Beams", summary: "Minimum tension steel As / (b d) = 0.85 / fy. Maximum tension steel percentage shall not exceed 4% of gross area (0.04 b D)." },
    ],
    verifiableRefUrl: "https://standardsbis.bsbedge.com",
  },
  {
    id: "code_is_1893",
    codeName: "IS 1893:2016 (Part 1)",
    standardBody: "BIS (Indian Standards)",
    branch: "Civil & Infrastructure",
    department: "Earthquake Engineering & Dynamics",
    title: "Criteria for Earthquake Resistant Design of Structures: Part 1 General Provisions & Buildings",
    scopeSummary: "Defines seismic zones II, III, IV, and V across India. Provides response spectra for rock/hard, medium, and soft soils, formulating equivalent static and response spectrum dynamic analysis methods.",
    keyClauses: [
      { clause: "Clause 6.4.2", title: "Design Horizontal Seismic Coefficient (Ah)", summary: "Ah = (Z / 2) * (I / R) * (Sa / g). Z = Zone factor (0.10 to 0.36); I = Importance factor (1.0 to 1.5); R = Response reduction factor (3 to 5); Sa/g = Spectral acceleration." },
      { clause: "Clause 7.2.1", title: "Fundamental Natural Period (Ta) of Buildings", summary: "Ta = 0.075 * h^0.75 for RC frame; Ta = 0.09 * h / sqrt(d) for infill masonry frame." },
      { clause: "Table 2", title: "Zone Factors (Z) for Seismic Zones", summary: "Zone II: 0.10 (Low) | Zone III: 0.16 (Moderate) | Zone IV: 0.24 (Severe) | Zone V: 0.36 (Very Severe)." },
    ],
    verifiableRefUrl: "https://standardsbis.bsbedge.com",
  },
  {
    id: "code_is_800",
    codeName: "IS 800:2007",
    standardBody: "BIS (Indian Standards)",
    branch: "Civil & Infrastructure",
    department: "Steel Structures & Industrial Design",
    title: "General Construction in Steel – Code of Practice (Third Revision)",
    scopeSummary: "Limit state design for structural steelwork in tension members, compression columns, flexural girders, and connections (bolted and welded) with partial safety factors.",
    keyClauses: [
      { clause: "Section 6", title: "Design of Tension Members (Gross Yielding vs Net Rupture)", summary: "Design strength Td is least of yielding of gross section Tdg = (Ag * fy) / γm0 and rupture of critical section Tdn = (0.9 * An * fu) / γm1." },
      { clause: "Section 7", title: "Design of Compression Members & Column Buckling Curves", summary: "Four buckling classes (a, b, c, d) with imperfection parameter α ranging from 0.21 to 0.76. Design compressive stress fcd governed by Perry-Robertson formula." },
      { clause: "Section 10", title: "Connections (High-Strength Friction Grip HSFG & Welded)", summary: "Shear capacity of bearing bolts Vdsb = (fub / sqrt(3)) * (nn * Anb + ns * Asb) / γmb." },
    ],
    verifiableRefUrl: "https://standardsbis.bsbedge.com",
  },
  {
    id: "code_irc_112",
    codeName: "IRC:112-2020",
    standardBody: "IRC (Indian Roads Congress)",
    branch: "Civil & Infrastructure",
    department: "Bridge Engineering",
    title: "Code of Practice for Concrete Road Bridges (Limit State Method)",
    scopeSummary: "Comprehensive Indian bridge code aligning with international Eurocode principles for prestressed, precast, and in-situ highway bridge superstructures and substructures.",
    keyClauses: [
      { clause: "Section 6", title: "Material Properties & Design Compressive Strengths", summary: "Characteristic compressive strength fck up to M90 grade. Design fatigue verification of reinforcement under cyclical vehicular axle loads." },
      { clause: "Section 10", title: "Ultimate Limit State of Shear & Torsion in Box Girders", summary: "Variable angle truss model with inclination θ between concrete compression struts and longitudinal bridge axis (21.8° ≤ θ ≤ 45°)." },
    ],
    verifiableRefUrl: "https://irc.nic.in",
  },
];

// Initial Seed Data for Engineering Handbooks
export const DEFAULT_HANDBOOKS: HandbookItem[] = [
  {
    id: "hb_civil_formula",
    title: "TerraMatrix Civil & Structural Engineering Ready Reference Handbook",
    branch: "Civil & Infrastructure",
    department: "Structural, Geotechnical & Hydraulics",
    authorOrBody: "TerraMatrix Academy Academic Editorial Council",
    edition: "2026 Comprehensive Edition",
    description: "Compact authoritative field handbook assembling fundamental governing equations, design shortcuts, IS code tables, and typical structural cross-sections for practicing engineers.",
    chapters: [
      { title: "Chapter 1: Beam Deflection & Moment Coefficients", pages: "1–24", summary: "Standard loading cases, conjugate beam theorems, moment distribution distribution factors, and continuous span moment envelopes." },
      { title: "Chapter 2: Geotechnical Bearing Capacity & Earth Pressure", pages: "25–52", summary: "Terzaghi and Meyerhof bearing capacity factors (Nc, Nq, Nγ), Hansen shape and depth corrections, Rankine & Coulomb active and passive earth pressure." },
      { title: "Chapter 3: Open Channel & Hydraulic Jump Formulation", pages: "53–82", summary: "Manning's steady uniform flow, critical flow depth yc = (q^2 / g)^(1/3), conjugate depths y2/y1 relation, and energy dissipation in stilling basins." },
      { title: "Chapter 4: Seismic Base Shear & Detailing Rules", pages: "83–118", summary: "IS 13920 ductile detailing for beams, columns, joints, shear walls, and lap length requirements." },
    ],
    keyFormulas: [
      "δ_max = (5 * w * L^4) / (384 * E * I) [Simply Supported UDL]",
      "q_ult = c*Nc + q*Nq + 0.5*γ*B*Nγ [Terzaghi General Bearing]",
      "Q = (1/n) * A * R^(2/3) * S^(1/2) [Manning's Discharge]",
      "V_b = Ah * W = (Z * I * Sa / (2 * R * g)) * W [Seismic Base Shear]",
    ],
    readTime: "45 min read",
  },
  {
    id: "hb_comp_mechanics",
    title: "Applied Computational Engineering & Scientific Python Handbook",
    branch: "Computer Science & AI",
    department: "Computational Mechanics & Applied Mathematics",
    authorOrBody: "Computational Engineering Group",
    edition: "v3.2 Digital Edition",
    description: "Concise practitioner handbook detailing the translation of partial differential equations into discretized finite element matrices and Python solver algorithms.",
    chapters: [
      { title: "Chapter 1: Matrix Stiffness Formulations", pages: "1–32", summary: "Element stiffness matrix [k] for 1D bar, 2D truss, beam element, and transformation matrices [T]." },
      { title: "Chapter 2: Numerical Integration & Gauss Quadrature", pages: "33–58", summary: "1-point, 2-point, and 3-point Gauss-Legendre quadrature rules for evaluating stiffness integrals over isoparametric domains." },
      { title: "Chapter 3: Non-linear Solvers & Newton-Raphson", pages: "59–90", summary: "Iterative tangent stiffness update, residual force vector {R} = {P} - {F_int}, and convergence criteria." },
    ],
    keyFormulas: [
      "[K]{U} = {F} [Global Finite Element Equilibrium]",
      "[k] = (A * E / L) * [[1, -1], [-1, 1]] [1D Bar Stiffness]",
      "x_{n+1} = x_n - f(x_n) / f'(x_n) [Newton-Raphson Step]",
    ],
    readTime: "35 min read",
  },
  {
    id: "hb_geospatial_guide",
    title: "Geospatial Intelligence, Spatial SQL & Satellite Remote Sensing Handbook",
    branch: "Earth & Geospatial Sciences",
    department: "Geomatics & Spatial Analytics",
    authorOrBody: "Geospatial Intelligence Unit",
    edition: "2026 Edition",
    description: "Practical field guide for processing Sentinel and Landsat multispectral bands, generating digital elevation models (DEM), and querying PostGIS databases.",
    chapters: [
      { title: "Chapter 1: Coordinate Reference Systems & Projections", pages: "1–20", summary: "WGS 84 (EPSG:4326), Universal Transverse Mercator (UTM), geoid undulations, and datum transformations." },
      { title: "Chapter 2: Multispectral Indices (NDVI, NDWI, MNDWI)", pages: "21–48", summary: "Band math algorithms: NDVI = (NIR - Red) / (NIR + Red) for vegetative biomass; NDWI for surface water delineation." },
      { title: "Chapter 3: Terrain Analysis from LiDAR & Photogrammetry", pages: "49–75", summary: "Slope, aspect, flow accumulation, watershed catchment delineation, and D8 flow routing algorithms." },
    ],
    keyFormulas: [
      "NDVI = (Band_NIR - Band_Red) / (Band_NIR + Band_Red)",
      "MNDWI = (Band_Green - Band_SWIR) / (Band_Green + Band_SWIR)",
      "S = sqrt((dz/dx)^2 + (dz/dy)^2) [Terrain Gradient Slope]",
    ],
    readTime: "30 min read",
  },
];

// Initial Seed Data for Glossaries
export const DEFAULT_GLOSSARIES: GlossaryItem[] = [
  {
    id: "gl_shear_lag",
    term: "Shear Lag Effect",
    branch: "Civil & Infrastructure",
    department: "Structural Engineering",
    specialization: "Steel & Concrete Bridges",
    definition: "Non-uniform distribution of normal flexural stresses across wide flange plates or bridge box-girder decks caused by in-plane shear deformation, leading to peak stresses near the web-flange junction.",
    formula: "σ_max / σ_avg > 1.0 (requires effective flange width beff in IS 800 / IRC 112)",
    siUnit: "N/mm² (MPa)",
    significance: "Crucial for avoiding premature yielding and fatigue cracking in wide box girder decks of highway bridges and long-span industrial transfer girders.",
  },
  {
    id: "gl_hydraulic_jump",
    term: "Hydraulic Jump & Froude Number",
    branch: "Civil & Infrastructure",
    department: "Water Resources & Hydraulics",
    specialization: "Spillway & River Hydrodynamics",
    definition: "Rapid, turbulent transition of open-channel flow from supercritical state (Fr > 1) to subcritical state (Fr < 1), accompanied by significant kinetic energy dissipation through turbulent eddies.",
    formula: "Fr = v / sqrt(g * y); y2 / y1 = 0.5 * (sqrt(1 + 8 * Fr1^2) - 1)",
    siUnit: "Dimensionless (Fr); Meters (y)",
    significance: "Designed at the toe of dam spillways, barrages, and sluice gates to prevent catastrophic scour and erosion of downstream riverbeds.",
  },
  {
    id: "gl_liquefaction",
    term: "Soil Liquefaction (Cyclic Mobility)",
    branch: "Civil & Infrastructure",
    department: "Geotechnical Engineering",
    specialization: "Earthquake & Foundation Engineering",
    definition: "Phenomenon in saturated, cohesionless loose silts and sands where dynamic cyclical earthquake shear stresses cause pore water pressure to rise to equal total overburden stress, reducing effective stress (σ') to zero and causing soil to behave as a heavy liquid.",
    formula: "σ' = σ - u = 0 (when excess pore pressure u = total stress σ)",
    siUnit: "kPa or N/m²",
    significance: "Primary cause of catastrophic building tilts, sand boils, and bridge abutment lateral spreading during earthquakes.",
  },
  {
    id: "gl_pinn",
    term: "Physics-Informed Neural Network (PINN)",
    branch: "Computer Science & AI",
    department: "Computational Mechanics & AI",
    specialization: "Scientific Machine Learning",
    definition: "Deep neural network architecture trained to approximate solutions of physical engineering governing differential equations by embedding residual differential operators (e.g. Navier-Stokes, elasticity) directly into the loss function via automatic differentiation.",
    formula: "Loss = Loss_data + λ * Loss_PDE; Loss_PDE = || ∂u/∂t + u*∂u/∂x - ν*∂²u/∂x² ||²",
    siUnit: "Dimensionless objective metric",
    significance: "Allows structural and aerodynamic modeling from sparse sensor telemetry without requiring full 3D boundary-fitted computational grids.",
  },
  {
    id: "gl_reynolds_number",
    term: "Reynolds Number (Re)",
    branch: "Mechanical & Aerospace",
    department: "Fluid Mechanics & Aerodynamics",
    specialization: "Pipe Flow & Aerodynamic Drag",
    definition: "Dimensionless ratio of fluid inertial forces to viscous forces. Characterizes whether fluid flow will be laminar (smooth, orderly), transitional, or turbulent (chaotic, eddying).",
    formula: "Re = (ρ * v * D) / μ = (v * D) / ν",
    siUnit: "Dimensionless",
    significance: "Determines pipe friction factor (Darcy-Weisbach) in water networks and boundary layer separation around aerofoils and bridge piers.",
  },
  {
    id: "gl_insar",
    term: "Interferometric Synthetic Aperture Radar (InSAR)",
    branch: "Earth & Geospatial Sciences",
    department: "Remote Sensing & Geomatics",
    specialization: "Geodesy & Infrastructure Monitoring",
    definition: "Radar remote sensing technique that compares the phase difference between two or more SAR satellite images of the same terrain taken at different times to measure ground deformation with millimeter-scale precision.",
    formula: "Δφ = φ_topo + φ_def + φ_atm + φ_noise; ΔR = (λ / 4π) * Δφ_def",
    siUnit: "Millimeters (mm) displacement",
    significance: "Used for non-contact monitoring of bridge subsidence, dam crest movement, landslide propagation, and groundwater depletion.",
  },
];

// Interactive Auto Calculators
export const DEFAULT_CALCULATORS: AutoCalculatorItem[] = [
  {
    id: "mannings_flow",
    name: "Manning's Open Channel Flow Calculator",
    branch: "Civil & Infrastructure",
    department: "Hydraulics & Water Resources",
    formula: "Q = (1/n) * A * R^(2/3) * S^(1/2)",
    description: "Computes steady uniform open-channel discharge (Q), mean velocity (V), and hydraulic radius (R) for rectangular and trapezoidal canals.",
    inputs: [
      { key: "bottomWidth", label: "Bottom Width (b)", unit: "m", defaultValue: 4.0, step: 0.1 },
      { key: "waterDepth", label: "Flow Depth (y)", unit: "m", defaultValue: 1.5, step: 0.05 },
      { key: "sideSlope", label: "Side Slope (z:1, Horiz:Vert)", unit: "z", defaultValue: 1.5, step: 0.1 },
      { key: "bedSlope", label: "Bed Slope (S0)", unit: "m/m", defaultValue: 0.001, step: 0.0001 },
      { key: "roughness", label: "Manning's n", unit: "-", defaultValue: 0.015, step: 0.001 },
    ],
    calculate: (inputs) => {
      const b = inputs.bottomWidth || 4;
      const y = inputs.waterDepth || 1.5;
      const z = inputs.sideSlope || 0;
      const S = inputs.bedSlope || 0.001;
      const n = inputs.roughness || 0.015;

      const A = (b + z * y) * y;
      const P = b + 2 * y * Math.sqrt(1 + z * z);
      const R = A / P;
      const V = (1 / n) * Math.pow(R, 2 / 3) * Math.sqrt(S);
      const Q = A * V;
      const Fr = V / Math.sqrt(9.81 * (A / (b + 2 * z * y)));

      return {
        resultKey: "discharge",
        resultLabel: "Volumetric Discharge (Q)",
        value: Q.toFixed(3),
        unit: "m³/s",
        steps: [
          `Flow Area (A) = (b + z*y)*y = (${b} + ${z}*${y})*${y} = ${A.toFixed(3)} m²`,
          `Wetted Perimeter (P) = b + 2*y*sqrt(1 + z²) = ${P.toFixed(3)} m`,
          `Hydraulic Radius (R) = A / P = ${R.toFixed(3)} m`,
          `Mean Velocity (V) = (1/n) * R^(2/3) * S^(1/2) = ${V.toFixed(3)} m/s`,
          `Froude Number (Fr) = ${Fr.toFixed(2)} (${Fr < 1 ? "Subcritical tranquil flow" : "Supercritical rapid flow"})`,
        ],
      };
    },
  },
  {
    id: "concrete_moment",
    name: "IS 456 RC Beam Moment Capacity (Mu)",
    branch: "Civil & Infrastructure",
    department: "Structural Engineering",
    formula: "Mu = 0.87 * fy * Ast * d * [1 - (Ast * fy) / (b * d * fck)]",
    description: "Evaluates the ultimate limit state flexural moment resistance (Mu) of a singly reinforced rectangular concrete beam according to IS 456:2000 Clause 38 & G-1.1.",
    inputs: [
      { key: "width", label: "Beam Width (b)", unit: "mm", defaultValue: 250, step: 10 },
      { key: "effDepth", label: "Effective Depth (d)", unit: "mm", defaultValue: 450, step: 10 },
      { key: "fck", label: "Concrete Grade (fck)", unit: "MPa", defaultValue: 25, step: 5 },
      { key: "fy", label: "Steel Yield (fy)", unit: "MPa", defaultValue: 500, step: 85 },
      { key: "ast", label: "Tension Steel (Ast)", unit: "mm²", defaultValue: 942, step: 50 },
    ],
    calculate: (inputs) => {
      const b = inputs.width || 250;
      const d = inputs.effDepth || 450;
      const fck = inputs.fck || 25;
      const fy = inputs.fy || 500;
      const Ast = inputs.ast || 942;

      // Limiting depth factor
      let xu_max_factor = 0.48; // Fe 415
      if (fy >= 500) xu_max_factor = 0.46;
      if (fy <= 250) xu_max_factor = 0.53;
      const xu_max = xu_max_factor * d;

      // Actual neutral axis depth xu
      const xu = (0.87 * fy * Ast) / (0.36 * fck * b);
      const isUnderReinforced = xu <= xu_max;

      let Mu = 0;
      if (isUnderReinforced) {
        Mu = 0.87 * fy * Ast * d * (1 - (Ast * fy) / (b * d * fck));
      } else {
        // Over-reinforced section limited to balanced capacity per IS 456
        Mu = 0.36 * (xu_max / d) * (1 - 0.42 * (xu_max / d)) * b * d * d * fck;
      }
      const Mu_kNm = Mu / 1e6;

      return {
        resultKey: "moment",
        resultLabel: "Ultimate Moment Capacity (Mu)",
        value: Mu_kNm.toFixed(2),
        unit: "kN·m",
        steps: [
          `Neutral Axis Depth (xu) = (0.87 * ${fy} * ${Ast}) / (0.36 * ${fck} * ${b}) = ${xu.toFixed(1)} mm`,
          `Limiting Depth (xu,max) = ${xu_max_factor} * ${d} = ${xu_max.toFixed(1)} mm`,
          `Section Classification: ${isUnderReinforced ? "Under-Reinforced Section (Ductile Failure - Desirable)" : "Over-Reinforced (Capacity Capped at Balanced Limit)"}`,
          `Mu = ${Mu_kNm.toFixed(2)} kN·m`,
        ],
      };
    },
  },
  {
    id: "column_buckling",
    name: "Euler Critical Buckling Load for Columns",
    branch: "Civil & Infrastructure",
    department: "Structural Mechanics",
    formula: "Pcr = (π² * E * I) / Le²",
    description: "Calculates the theoretical Euler elastic buckling load (Pcr) and critical compressive stress for slender structural columns with various end support conditions.",
    inputs: [
      { key: "length", label: "Column Length (L)", unit: "m", defaultValue: 3.5, step: 0.1 },
      { key: "youngsModulus", label: "Elastic Modulus (E)", unit: "GPa", defaultValue: 200, step: 10 },
      { key: "momentInertia", label: "Moment of Inertia (I_min)", unit: "cm⁴", defaultValue: 850, step: 20 },
      { key: "endCondition", label: "End Fixity (1: Pinned-Pinned, 2: Fixed-Free, 3: Fixed-Fixed, 4: Fixed-Pinned)", unit: "Type", defaultValue: 1, step: 1 },
      { key: "area", label: "Cross-Section Area (A)", unit: "cm²", defaultValue: 45, step: 1 },
    ],
    calculate: (inputs) => {
      const L = inputs.length || 3.5;
      const E = (inputs.youngsModulus || 200) * 1e9; // Pa
      const I = (inputs.momentInertia || 850) * 1e-8; // m^4
      const A = (inputs.area || 45) * 1e-4; // m^2
      const condition = Math.round(inputs.endCondition || 1);

      let effectiveFactor = 1.0;
      let conditionLabel = "Both Ends Pinned / Hinged";
      if (condition === 2) { effectiveFactor = 2.0; conditionLabel = "One End Fixed, Other Free (Cantilever)"; }
      else if (condition === 3) { effectiveFactor = 0.5; conditionLabel = "Both Ends Fixed"; }
      else if (condition === 4) { effectiveFactor = 0.7; conditionLabel = "One End Fixed, Other Pinned"; }

      const Le = effectiveFactor * L;
      const Pcr = (Math.PI * Math.PI * E * I) / (Le * Le);
      const Pcr_kN = Pcr / 1000;
      const r = Math.sqrt(I / A);
      const slenderness = Le / r;
      const stress_MPa = (Pcr / A) / 1e6;

      return {
        resultKey: "buckling_load",
        resultLabel: "Critical Buckling Load (Pcr)",
        value: Pcr_kN.toFixed(1),
        unit: "kN",
        steps: [
          `Support Condition: ${conditionLabel} (Effective Length Factor = ${effectiveFactor})`,
          `Effective Length (Le) = ${effectiveFactor} * ${L} = ${Le.toFixed(2)} m`,
          `Radius of Gyration (r) = sqrt(I / A) = ${(r * 100).toFixed(2)} cm`,
          `Slenderness Ratio (λ) = Le / r = ${slenderness.toFixed(1)}`,
          `Critical Compressive Stress (σ_cr) = ${stress_MPa.toFixed(1)} MPa`,
        ],
      };
    },
  },
  {
    id: "reynolds_pipe",
    name: "Reynolds Number & Flow Regime Calculator",
    branch: "Mechanical & Aerospace",
    department: "Fluid Mechanics",
    formula: "Re = (ρ * v * D) / μ",
    description: "Determines whether fluid flow in a conduit or pipeline is laminar, critical, or turbulent, and calculates the Darcy-Weisbach friction factor.",
    inputs: [
      { key: "pipeDiameter", label: "Pipe Diameter (D)", unit: "mm", defaultValue: 100, step: 10 },
      { key: "velocity", label: "Flow Velocity (v)", unit: "m/s", defaultValue: 1.2, step: 0.1 },
      { key: "fluidDensity", label: "Fluid Density (ρ)", unit: "kg/m³", defaultValue: 1000, step: 10 },
      { key: "dynamicViscosity", label: "Dynamic Viscosity (μ)", unit: "mPa·s", defaultValue: 1.0, step: 0.1 },
    ],
    calculate: (inputs) => {
      const D = (inputs.pipeDiameter || 100) / 1000;
      const v = inputs.velocity || 1.2;
      const rho = inputs.fluidDensity || 1000;
      const mu = (inputs.dynamicViscosity || 1.0) * 1e-3;

      const Re = (rho * v * D) / mu;
      let regime = "Laminar Flow (Re < 2000)";
      let frictionFactor = 64 / Math.max(1, Re);
      if (Re >= 2000 && Re <= 4000) {
        regime = "Transitional Flow (2000 ≤ Re ≤ 4000)";
        frictionFactor = 0.032;
      } else if (Re > 4000) {
        regime = "Fully Turbulent Flow (Re > 4000)";
        // Blasius formula for smooth pipe
        frictionFactor = 0.3164 / Math.pow(Re, 0.25);
      }

      return {
        resultKey: "reynolds",
        resultLabel: "Reynolds Number (Re)",
        value: Math.round(Re).toLocaleString(),
        unit: "-",
        steps: [
          `Pipe Diameter (D) = ${D} m, Velocity = ${v} m/s`,
          `Fluid Density (ρ) = ${rho} kg/m³, Viscosity (μ) = ${(mu * 1000).toFixed(2)} mPa·s`,
          `Flow Regime: ${regime}`,
          `Darcy-Weisbach Friction Factor (f) ≈ ${frictionFactor.toFixed(4)}`,
        ],
      };
    },
  },
];

export const AUTO_CALCULATORS = DEFAULT_CALCULATORS;
export type AutoCalculator = (typeof DEFAULT_CALCULATORS)[number];

// Helper functions for storage and persistence
export function loadExamCalendars(): ExamCalendarItem[] {
  try {
    const raw = localStorage.getItem("terramatrix_exam_calendars");
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_EXAM_CALENDARS;
}

export function saveExamCalendars(items: ExamCalendarItem[]): void {
  localStorage.setItem("terramatrix_exam_calendars", JSON.stringify(items));
}

export function loadOpportunities(): OpportunityItem[] {
  try {
    const raw = localStorage.getItem("terramatrix_opportunities");
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_OPPORTUNITIES;
}

export function saveOpportunities(items: OpportunityItem[]): void {
  localStorage.setItem("terramatrix_opportunities", JSON.stringify(items));
}

export function loadStudyCodes(): StudyCodeItem[] {
  try {
    const raw = localStorage.getItem("terramatrix_study_codes");
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_STUDY_CODES;
}

export function saveStudyCodes(items: StudyCodeItem[]): void {
  localStorage.setItem("terramatrix_study_codes", JSON.stringify(items));
}

export function loadHandbooks(): HandbookItem[] {
  try {
    const raw = localStorage.getItem("terramatrix_handbooks");
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_HANDBOOKS;
}

export function saveHandbooks(items: HandbookItem[]): void {
  localStorage.setItem("terramatrix_handbooks", JSON.stringify(items));
}

export function loadGlossaries(): GlossaryItem[] {
  try {
    const raw = localStorage.getItem("terramatrix_glossaries");
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_GLOSSARIES;
}

export function saveGlossaries(items: GlossaryItem[]): void {
  localStorage.setItem("terramatrix_glossaries", JSON.stringify(items));
}
