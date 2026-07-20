import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CSSProperties, ReactNode } from "react";
import { FileText, Home, ImagePlus, UploadCloud } from "lucide-react";
import {
  clearAdminSession,
  deleteAdminMediaRecord,
  deleteAdminRecord,
  getAdminToken,
  loadAdminBootstrap,
  saveAdminMediaRecord,
  saveAdminRecord,
} from "../lib/appsScriptApi";

type EnquiryStatus =
  | "New Enquiry"
  | "Payment Link Sent"
  | "Payment Received"
  | "Enrolled"
  | "Course Completed"
  | "Certificate Issued";

type Instructor = {
  id: number;
  remoteId?: string;
  name: string;
  designation: string;
  company: string;
  expertise: string;
  email: string;
  phone: string;
  bio: string;
  photoUrl: string;
  cvName: string;
  cvData: string;
};

type Course = {
  id: number;
  title: string;
  shortTitle: string;
  category: string;
  theme: string;
  duration: string;
  level: string;
  mode: string;
  imageUrl: string;
  instructorName: string;
  instructorDesignation: string;
  instructorIds: number[];
  startDate: string;
  fee: string;
  certificate: string;
  description: string;
  outcomes: string;
  brochureName: string;
  brochureData: string;
  status: "Draft" | "Published";
  onlineSessionLink: string;
  onlineSessionDate: string;
  onlineSessionTime: string;
  recordingLink: string;
  materialTitle: string;
  materialDescription: string;
  materialFileName: string;
  materialFileData: string;
  assignmentTitle: string;
  assignmentInstructions: string;
};

type Enquiry = {
  id: number;
  courseId: number;
  courseTitle: string;
  name: string;
  email: string;
  phone: string;
  organisation: string;
  message: string;
  submittedAt: string;
  status: EnquiryStatus;
  paymentLink: string;
};

type EnrollmentStatus = "Enrolled" | "Course Completed" | "Certificate Issued";

type Enrollment = {
  id: number;
  courseId: number;
  courseTitle: string;
  name: string;
  email: string;
  phone: string;
  organisation: string;
  enrolledAt: string;
  status: EnrollmentStatus;
};

type EnrollmentRow = {
  name: string;
  email: string;
  phone: string;
  organisation: string;
};

type LearningTool = {
  id: number;
  area: string;
  name: string;
  icon: string;
  logoData: string;
  order: number;
};

type LearningToolForm = Omit<LearningTool, "id">;

type ContentStatus = "Draft" | "Published";
type EventStatus = "Draft" | "Upcoming" | "Completed";

type LearningVideo = {
  id: number;
  title: string;
  category: string;
  theme: string;
  description: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  level: string;
  status: ContentStatus;
};

type LearningVideoForm = Omit<LearningVideo, "id">;

type AcademyEvent = {
  id: number;
  title: string;
  category: string;
  theme: string;
  description: string;
  date: string;
  time: string;
  mode: string;
  resourcePerson: string;
  instructorIds: number[];
  fee: string;
  certification: string;
  recordingLink: string;
  imageUrl: string;
  status: EventStatus;
};

type AcademyEventForm = Omit<AcademyEvent, "id">;

type EventRegistrationStatus =
  | "Registered"
  | "Confirmed"
  | "Attended"
  | "Certificate Issued";

type EventRegistration = {
  id: number;
  kind: "Course" | "Webinar" | "Workshop";
  eventId: number;
  eventTitle: string;
  category: string;
  theme: string;
  date: string;
  time: string;
  mode: string;
  certification: string;
  paymentOption: string;
  paymentStatus: string;
  paymentReference: string;
  paymentNote: string;
  name: string;
  email: string;
  phone: string;
  organisation: string;
  message: string;
  submittedAt: string;
  status: EventRegistrationStatus;
};

type CourseForm = Omit<
  Course,
  "id" | "status" | "instructorName" | "instructorDesignation" | "outcomes"
> & {
  outcome1: string;
  outcome2: string;
  outcome3: string;
  outcome4: string;
  outcome5: string;
};

type InstructorForm = Omit<Instructor, "id">;

const defaultImage = "/hero-dam.jpg";

const taxonomyCategoryOptions = [
  "Engineering Tools",
  "Digital Skills",
  "Field & Survey Methods",
  "Research & Data Skills",
  "Water & Environmental Systems",
  "Risk, Resilience & Sustainability",
  "Professional & Academic Practice",
  "Institutional / Custom Training",
];

const taxonomyThemeDefaults: Record<string, string[]> = {
  "Engineering Tools": [
    "CAD and Drafting",
    "Structural Modelling",
    "BIM and Revit",
    "Design Documentation",
    "Quantity and Estimation",
  ],
  "Digital Skills": [
    "GIS and Mapping",
    "Remote Sensing",
    "Google Earth / GEE",
    "Digital Documentation",
    "AI-supported Learning",
  ],
  "Field & Survey Methods": [
    "GPS and Mobile Mapping",
    "Drone Survey",
    "Site Reconnaissance",
    "Field Data Collection",
    "Ground Truthing",
  ],
  "Research & Data Skills": [
    "Statistics",
    "Excel-based Analysis",
    "SPSS / R / Python",
    "Survey Design",
    "Impact Assessment",
    "Research Methodology",
  ],
  "Water & Environmental Systems": [
    "Water Resources",
    "Groundwater",
    "Irrigation Systems",
    "Tank Filling Schemes",
    "Environmental Monitoring",
    "Sustainability Assessment",
  ],
  "Risk, Resilience & Sustainability": [
    "Disaster Risk Reduction",
    "Climate Resilience",
    "Floods and Landslides",
    "Recovery Planning",
    "Environmental Sustainability",
    "ESG Orientation",
  ],
  "Professional & Academic Practice": [
    "Technical Report Writing",
    "Project Documentation",
    "Engineering Communication",
    "Consultancy Skills",
    "Academic Writing",
    "Teaching and Assessment",
  ],
  "Institutional / Custom Training": [
    "Faculty Development",
    "Student Skill Training",
    "Government / Department Training",
    "Industry-oriented Training",
    "Community-based Training",
  ],
};

const courseCategories = taxonomyCategoryOptions;

const courseLevelOptions = [
  "Foundation",
  "Intermediate",
  "Advanced",
  "Professional",
  "Open",
];

const enquiryStatuses: EnquiryStatus[] = [
  "New Enquiry",
  "Payment Link Sent",
  "Payment Received",
  "Enrolled",
  "Course Completed",
  "Certificate Issued",
];

const enrollmentStatuses: EnrollmentStatus[] = [
  "Enrolled",
  "Course Completed",
  "Certificate Issued",
];

const emptyEnrollmentRow: EnrollmentRow = {
  name: "",
  email: "",
  phone: "",
  organisation: "",
};

const emptyInstructorForm: InstructorForm = {
  name: "",
  designation: "",
  company: "",
  expertise: "",
  email: "",
  phone: "",
  bio: "",
  photoUrl: defaultImage,
  cvName: "",
  cvData: "",
};

const defaultLearningTools: LearningTool[] = [
  { id: 1, area: "Geospatial Tools", name: "QGIS", icon: "🛰️", logoData: "", order: 1 },
  { id: 2, area: "Geospatial Tools", name: "ArcGIS", icon: "🗺️", logoData: "", order: 2 },
  { id: 3, area: "Geospatial Tools", name: "GEE", icon: "🌍", logoData: "", order: 3 },
  { id: 4, area: "Geospatial Tools", name: "RS", icon: "🛰️", logoData: "", order: 4 },

  { id: 5, area: "Design & Analysis", name: "BIM", icon: "🏢", logoData: "", order: 5 },
  { id: 6, area: "Design & Analysis", name: "Revit", icon: "🏗️", logoData: "", order: 6 },
  { id: 7, area: "Design & Analysis", name: "AutoCAD", icon: "📐", logoData: "", order: 7 },
  { id: 8, area: "Design & Analysis", name: "ETABS", icon: "🏛️", logoData: "", order: 8 },
  { id: 9, area: "Design & Analysis", name: "SAP2000", icon: "🌉", logoData: "", order: 9 },

  { id: 10, area: "Water Resources", name: "RAS", icon: "🌊", logoData: "", order: 10 },
  { id: 11, area: "Water Resources", name: "HMS", icon: "🌧️", logoData: "", order: 11 },
  { id: 12, area: "Water Resources", name: "MODFlow", icon: "💧", logoData: "", order: 12 },
  { id: 13, area: "Water Resources", name: "CCHE2D", icon: "〰️", logoData: "", order: 13 },
  { id: 14, area: "Water Resources", name: "MIKE", icon: "🌦️", logoData: "", order: 14 },

  { id: 15, area: "Field Survey", name: "Kobo", icon: "📱", logoData: "", order: 15 },
  { id: 16, area: "Field Survey", name: "GPS", icon: "📍", logoData: "", order: 16 },
  { id: 17, area: "Field Survey", name: "Drone", icon: "🛩️", logoData: "", order: 17 },
  { id: 18, area: "Field Survey", name: "Mobile GIS", icon: "🧭", logoData: "", order: 18 },

  { id: 19, area: "Research & Data", name: "Statistics", icon: "📊", logoData: "", order: 19 },
  { id: 20, area: "Research & Data", name: "Excel", icon: "📗", logoData: "", order: 20 },
  { id: 21, area: "Research & Data", name: "SPSS", icon: "📈", logoData: "", order: 21 },
  { id: 22, area: "Research & Data", name: "R Studio", icon: "®️", logoData: "", order: 22 },
  { id: 23, area: "Research & Data", name: "LaTeX", icon: "📝", logoData: "", order: 23 },

  { id: 24, area: "Computational Tools", name: "GeneXPro", icon: "🧬", logoData: "", order: 24 },
  { id: 25, area: "Computational Tools", name: "MATLAB", icon: "🧮", logoData: "", order: 25 },
  { id: 26, area: "Computational Tools", name: "Python", icon: "🐍", logoData: "", order: 26 },
  { id: 27, area: "Computational Tools", name: "PowerBI", icon: "📊", logoData: "", order: 27 },
];

const learningAreaOptions = [
  "Geospatial Tools",
  "Design & Analysis",
  "Water Resources",
  "Field Survey",
  "Research & Data",
  "Computational Tools",
];

const emptyLearningToolForm: LearningToolForm = {
  area: "Geospatial Tools",
  name: "",
  icon: "🧩",
  logoData: "",
  order: 1,
};

const contentCategoryOptions = taxonomyCategoryOptions;

type ContentCategoryKey = "courses" | "videos" | "webinars" | "workshops";
type TaxonomyMode = "levels" | "categories" | "themes";

type TaxonomySettings = {
  levels: string[];
  categories: string[];
  themesByCategory: Record<string, string[]>;
};

const categoryGroupLabels: Record<ContentCategoryKey, string> = {
  courses: "Courses",
  videos: "Learning Videos",
  webinars: "Webinars",
  workshops: "Workshops",
};

function uniqueCategoryList(values: string[]) {
  return Array.from(
    new Set(
      values
        .map((value) => String(value || "").trim())
        .filter(Boolean)
    )
  );
}

function normalizeThemesByCategory(
  categories: string[],
  input?: Record<string, string[]>
) {
  const themeMap: Record<string, string[]> = {};

  categories.forEach((category) => {
    const savedThemes = input?.[category];
    const defaultThemes = taxonomyThemeDefaults[category] || [];
    const merged = uniqueCategoryList([...(savedThemes || []), ...defaultThemes]);
    themeMap[category] = merged.length ? merged : ["General"];
  });

  return themeMap;
}

function loadTaxonomySettings(): TaxonomySettings {
  try {
    const saved = localStorage.getItem("terramatrix_taxonomy");
    const parsed = saved ? JSON.parse(saved) : {};
    const savedCategories = Array.isArray(parsed.categories) ? parsed.categories : [];
    const savedLevels = Array.isArray(parsed.levels) ? parsed.levels : [];
    const categories = uniqueCategoryList([...savedCategories, ...taxonomyCategoryOptions]);
    const levels = uniqueCategoryList([...savedLevels, ...courseLevelOptions]);

    return {
      levels,
      categories,
      themesByCategory: normalizeThemesByCategory(categories, parsed.themesByCategory),
    };
  } catch {
    const categories = uniqueCategoryList(taxonomyCategoryOptions);
    return {
      levels: uniqueCategoryList(courseLevelOptions),
      categories,
      themesByCategory: normalizeThemesByCategory(categories, taxonomyThemeDefaults),
    };
  }
}

function saveTaxonomySettings(settings: TaxonomySettings) {
  const categories = uniqueCategoryList(settings.categories);
  const levels = uniqueCategoryList(settings.levels);
  const themesByCategory = normalizeThemesByCategory(
    categories,
    settings.themesByCategory
  );

  const normalized: TaxonomySettings = {
    levels,
    categories,
    themesByCategory,
  };

  localStorage.setItem("terramatrix_taxonomy", JSON.stringify(normalized));
  localStorage.setItem(
    "terramatrix_content_categories",
    JSON.stringify({
      courses: categories,
      videos: categories,
      webinars: categories,
      workshops: categories,
    })
  );

  return normalized;
}

function loadContentCategoryMap(): Record<ContentCategoryKey, string[]> {
  const taxonomy = loadTaxonomySettings();

  return {
    courses: taxonomy.categories,
    videos: taxonomy.categories,
    webinars: taxonomy.categories,
    workshops: taxonomy.categories,
  };
}

function saveContentCategoryMap(updated: Record<ContentCategoryKey, string[]>) {
  const taxonomy = loadTaxonomySettings();
  const mergedCategories = uniqueCategoryList([
    ...taxonomy.categories,
    ...updated.courses,
    ...updated.videos,
    ...updated.webinars,
    ...updated.workshops,
  ]);
  saveTaxonomySettings({ ...taxonomy, categories: mergedCategories });
}

function updateStoredCategoryReferences(
  _group: ContentCategoryKey,
  oldCategory: string,
  newCategory: string
) {
  updateStoredTaxonomyReferences("category", oldCategory, newCategory);
}

function updateStoredThemeReferences(oldTheme: string, newTheme: string) {
  updateStoredTaxonomyReferences("theme", oldTheme, newTheme);
}

function updateStoredLevelReferences(oldLevel: string, newLevel: string) {
  updateStoredTaxonomyReferences("level", oldLevel, newLevel);
}

function updateStoredTaxonomyReferences(
  field: "category" | "theme" | "level",
  oldValueRaw: string,
  newValueRaw: string
) {
  const oldValue = oldValueRaw.trim();
  const newValue = newValueRaw.trim();

  if (!oldValue || !newValue || oldValue === newValue) return;

  const storageKeys = [
    "terramatrix_courses",
    "terramatrix_learning_videos",
    "terramatrix_webinars",
    "terramatrix_workshops",
  ];

  storageKeys.forEach((key) => {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return;

      const updated = (JSON.parse(saved) as Record<string, unknown>[]).map((item) =>
        item[field] === oldValue ? { ...item, [field]: newValue } : item
      );

      localStorage.setItem(key, JSON.stringify(updated));
    } catch {
      // Keep taxonomy editing safe even if localStorage contains malformed data.
    }
  });

  if (field === "category" || field === "theme") {
    try {
      const saved = localStorage.getItem("terramatrix_event_registrations");
      if (!saved) return;

      const updated = (JSON.parse(saved) as Record<string, unknown>[]).map((item) =>
        item[field] === oldValue ? { ...item, [field]: newValue } : item
      );

      localStorage.setItem("terramatrix_event_registrations", JSON.stringify(updated));
    } catch {
      // Ignore malformed registration backups.
    }
  }
}

function getManagedCategoryOptions(_group: ContentCategoryKey, current = "") {
  const taxonomy = loadTaxonomySettings();
  return uniqueCategoryList([...taxonomy.categories, current]);
}

function getManagedLevelOptions(current = "") {
  const taxonomy = loadTaxonomySettings();
  return uniqueCategoryList([...taxonomy.levels, current]);
}

function getManagedThemeOptions(category: string, current = "") {
  const taxonomy = loadTaxonomySettings();
  const themes = taxonomy.themesByCategory[category] || [];

  return uniqueCategoryList([...themes, current]);
}

function getDefaultThemeForCategory(category: string, current = "") {
  const options = getManagedThemeOptions(category, current);

  return options.includes(current) && current ? current : options[0] || "General";
}

const emptyLearningVideoForm: LearningVideoForm = {
  title: "",
  category: "Digital Skills",
  theme: "GIS and Mapping",
  description: "",
  youtubeUrl: "",
  thumbnailUrl: defaultImage,
  level: "Foundation",
  status: "Published",
};

const sampleLearningVideos: LearningVideo[] = [
  {
    id: 1,
    title: "Introduction to QGIS for Civil Engineering",
    category: "Digital Skills",
    theme: "GIS and Mapping",
    description:
      "A short orientation video on QGIS interface, layers and basic map preparation for civil engineering learners.",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: defaultImage,
    level: "Foundation",
    status: "Published",
  },
  {
    id: 2,
    title: "Understanding Structural Modelling Workflow",
    category: "Engineering Tools",
    theme: "Structural Modelling",
    description:
      "A brief learning video explaining the logic of modelling, loading and interpretation before using analysis software.",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: defaultImage,
    level: "Foundation",
    status: "Published",
  },
  {
    id: 3,
    title: "Google Earth for Field Reconnaissance",
    category: "Field & Survey Methods",
    theme: "Site Reconnaissance",
    description:
      "How to use Google Earth as a first-level visual tool for site understanding, route planning and field preparation.",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: defaultImage,
    level: "Open",
    status: "Published",
  },
];

const emptyAcademyEventForm: AcademyEventForm = {
  title: "",
  category: "Professional & Academic Practice",
  theme: "Engineering Communication",
  description: "",
  date: "",
  time: "",
  mode: "Online",
  resourcePerson: "",
  instructorIds: [],
  fee: "Free",
  certification: "Participation Certificate",
  recordingLink: "",
  imageUrl: defaultImage,
  status: "Upcoming",
};

const sampleInstructors: Instructor[] = [
  {
    id: 1,
    name: "TerraMatrix Faculty",
    designation: "Course Instructor",
    company: "TerraMatrix Academy",
    expertise: "Engineering Training, GIS, Applied Learning",
    email: "",
    phone: "",
    bio: "Instructor profile will be updated by the admin.",
    photoUrl: defaultImage,
    cvName: "",
    cvData: "",
  },
];

const emptyCourseForm: CourseForm = {
  title: "",
  shortTitle: "",
  category: "Engineering Tools",
  theme: "CAD and Drafting",
  duration: "",
  level: "Foundation",
  mode: "Offline",
  imageUrl: defaultImage,
  instructorIds: [],
  startDate: "",
  fee: "",
  certificate: "Completion Certificate",
  description: "",
  outcome1: "",
  outcome2: "",
  outcome3: "",
  outcome4: "",
  outcome5: "",
  brochureName: "",
  brochureData: "",
  onlineSessionLink: "",
  onlineSessionDate: "",
  onlineSessionTime: "",
  recordingLink: "",
  materialTitle: "",
  materialDescription: "",
  materialFileName: "",
  materialFileData: "",
  assignmentTitle: "",
  assignmentInstructions: "",
};

const sampleCourses: Course[] = [
  {
    id: 1,
    title: "GIS Applications for Engineers",
    shortTitle: "GIS Applications",
    category: "Engineering Tools",
    theme: "GIS and Mapping",
    duration: "30 Hours",
    level: "Foundation",
    mode: "Offline",
    imageUrl: defaultImage,
    instructorName: "TerraMatrix Faculty",
    instructorDesignation: "Course Instructor",
    instructorIds: [1],
    startDate: "To be announced",
    fee: "To be announced",
    certificate: "Completion Certificate",
    description:
      "Hands-on training in mapping, spatial analysis and applied GIS workflows for engineering applications.",
    outcomes:
      "Prepare basic maps; understand spatial layers; perform simple analysis; present GIS outputs clearly.",
    brochureName: "",
    brochureData: "",
    status: "Published",
    onlineSessionLink: "",
    onlineSessionDate: "",
    onlineSessionTime: "",
    recordingLink: "",
    materialTitle: "Course Reading Material",
    materialDescription: "Reading material will be shared with enrolled learners.",
    materialFileName: "",
    materialFileData: "",
    assignmentTitle: "Assignment",
    assignmentInstructions: "Assignment instructions will be updated by the admin.",
  },
];

function normalizePublicAssetPath(value: string) {
  let clean = String(value || "").trim();

  clean = clean.replace(/^["']|["']$/g, "").trim();
  clean = clean.replace(/\\/g, "/");

  if (clean.startsWith("file:///")) {
    clean = clean.replace("file:///", "");
  }

  const publicUploadsIndex = clean.toLowerCase().indexOf("/public/uploads/");
  if (publicUploadsIndex >= 0) {
    clean = clean.slice(publicUploadsIndex + "/public".length);
  }

  const uploadsIndex = clean.toLowerCase().indexOf("/uploads/");
  if (uploadsIndex >= 0) {
    clean = clean.slice(uploadsIndex);
  }

  if (clean.toLowerCase().startsWith("public/uploads/")) {
    clean = "/" + clean.slice("public/".length);
  }

  if (clean.toLowerCase().startsWith("uploads/")) {
    clean = "/" + clean;
  }

  return window.__TM_ASSETS?.[clean] || clean;
}

function normalizeInstructor(instructor: Partial<Instructor>): Instructor {
  return {
    id: instructor.id || Date.now(),
    remoteId: instructor.remoteId || "",
    name: instructor.name || "Instructor",
    designation: instructor.designation || "Course Instructor",
    company: instructor.company || "TerraMatrix Academy",
    expertise: instructor.expertise || "Engineering Training",
    email: instructor.email || "",
    phone: instructor.phone || "",
    bio: instructor.bio || "Instructor profile will be updated soon.",
    photoUrl: normalizePublicAssetPath(instructor.photoUrl || "") || defaultImage,
    cvName: instructor.cvName || "",
    cvData: normalizePublicAssetPath(instructor.cvData || ""),
  };
}


function normalizeToolName(name: string) {
  const clean = name.trim();
  const lower = clean.toLowerCase();

  if (lower === "google earth") return "GEE";
  if (lower === "remote sensing") return "RS";
  if (lower === "hec-ras") return "RAS";
  if (lower === "hec-hms") return "HMS";
  if (lower === "gps survey") return "GPS";
  if (lower === "field survey") return "GPS";
  if (lower === "survey") return "GPS";
  if (lower === "drone survey") return "Drone";
  if (lower === "impact assessment") return "Kobo";
  if (lower === "hydrology") return "MODFlow";
  if (lower === "power bi") return "PowerBI";
  if (lower === "matlab") return "MATLAB";
  if (lower === "kobotoolbox") return "Kobo";
  if (lower === "computer based") return "Computational Tools";

  return clean;
}

function normalizeToolArea(area: string, name: string) {
  const cleanArea = area.trim();
  const cleanName = normalizeToolName(name).toLowerCase();

  if (["qgis", "arcgis", "gee", "rs"].includes(cleanName)) return "Geospatial Tools";
  if (["bim", "revit", "autocad", "etabs", "sap2000"].includes(cleanName)) return "Design & Analysis";
  if (["ras", "hms", "hec-ras", "hec-hms", "modflow", "cche2d", "mike"].includes(cleanName)) return "Water Resources";
  if (["kobo", "gps", "drone", "mobile gis"].includes(cleanName)) return "Field Survey";
  if (["genexpro", "matlab", "python", "powerbi"].includes(cleanName)) return "Computational Tools";
  if (["statistics", "excel", "spss", "r studio", "latex"].includes(cleanName)) return "Research & Data";

  if (cleanArea.toLowerCase() === "gis & geospatial") return "Geospatial Tools";
  if (cleanArea.toLowerCase() === "bim & civil tools") return "Design & Analysis";
  if (cleanArea.toLowerCase() === "design and analysis") return "Design & Analysis";
  if (cleanArea.toLowerCase() === "computer based") return "Computational Tools";
  if (cleanArea.toLowerCase() === "computing & modelling") return "Computational Tools";
  if (cleanArea.toLowerCase() === "geospatial tools") return "Geospatial Tools";
  if (cleanArea.toLowerCase() === "water resources") return "Water Resources";
  if (cleanArea.toLowerCase() === "field survey") return "Field Survey";
  if (cleanArea.toLowerCase() === "research & data") return "Research & Data";

  if (
    cleanArea.toLowerCase() === "water, risk & field practice" ||
    cleanArea.toLowerCase() === "water and field"
  ) {
    if (["ras", "hms", "hec-ras", "hec-hms", "modflow", "cche2d", "mike"].includes(cleanName)) {
      return "Water Resources";
    }

    return "Field Survey";
  }

  return cleanArea || "General Tools";
}

function normalizeLearningTool(tool: Partial<LearningTool>): LearningTool {
  const normalizedName = normalizeToolName(tool.name || "Tool");

  return {
    id: tool.id || Date.now(),
    area: normalizeToolArea(tool.area || "General Tools", normalizedName),
    name: normalizedName,
    icon: tool.icon || "🧩",
    logoData: tool.logoData || "",
    order: Number(tool.order || 1),
  };
}

function getToolKey(tool: LearningTool) {
  return `${tool.area.trim().toLowerCase()}::${normalizeToolName(tool.name).toLowerCase()}`;
}

function dedupeLearningTools(tools: LearningTool[]) {
  const seen = new Set<string>();
  const cleaned: LearningTool[] = [];

  tools
    .filter((tool) => tool.name.trim())
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
    .forEach((tool) => {
      const key = getToolKey(tool);
      if (seen.has(key)) return;

      seen.add(key);
      cleaned.push({ ...tool, name: normalizeToolName(tool.name) });
    });

  return cleaned;
}

function mergeWithDefaultLearningTools(savedTools: LearningTool[]) {
  const cleanedSaved = dedupeLearningTools(savedTools);
  const existingKeys = new Set(cleanedSaved.map((tool) => getToolKey(tool)));

  const missingDefaults = defaultLearningTools.filter(
    (tool) => !existingKeys.has(getToolKey(tool))
  );

  return dedupeLearningTools([...cleanedSaved, ...missingDefaults]);
}

function normalizeExpertiseKeywords(value: string) {
  return value
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .join(", ");
}

function normalizeCertification(value: string) {
  const clean = String(value || "").trim().toLowerCase();

  if (
    clean === "participation certificate" ||
    clean === "certificate of participation" ||
    clean === "participation" ||
    clean === "no" ||
    clean === "to be announced"
  ) {
    return "Participation Certificate";
  }

  return "Completion Certificate";
}

function normalizeCourse(course: Partial<Course>): Course {
  return {
    id: course.id || Date.now(),
    title: course.title || "Untitled Course",
    shortTitle: course.shortTitle || "",
    category: course.category || "Engineering Tools",
    theme: course.theme || getDefaultThemeForCategory(course.category || "Engineering Tools"),
    duration: course.duration || "To be updated",
    level: course.level || "Open",
    mode: course.mode || "Offline",
    imageUrl: normalizePublicAssetPath(course.imageUrl || "") || defaultImage,
    instructorName: course.instructorName || "TerraMatrix Faculty",
    instructorDesignation: course.instructorDesignation || "Course Instructor",
    instructorIds: Array.isArray(course.instructorIds) ? course.instructorIds : [],
    startDate: course.startDate || "To be announced",
    fee: course.fee || "To be announced",
    certificate: normalizeCertification(course.certificate || ""),
    description: course.description || "Course description will be updated soon.",
    outcomes: course.outcomes || "Learning outcomes will be updated soon.",
    brochureName: course.brochureName || "",
    brochureData: normalizePublicAssetPath(course.brochureData || ""),
    status: course.status === "Draft" ? "Draft" : "Published",
    onlineSessionLink: course.onlineSessionLink || "",
    onlineSessionDate: course.onlineSessionDate || "",
    onlineSessionTime: course.onlineSessionTime || "",
    recordingLink: course.recordingLink || "",
    materialTitle: course.materialTitle || "Course Reading Material",
    materialDescription:
      course.materialDescription ||
      "Reading material will be shared with enrolled learners.",
    materialFileName: course.materialFileName || "",
    materialFileData: normalizePublicAssetPath(course.materialFileData || ""),
    assignmentTitle: course.assignmentTitle || "Assignment",
    assignmentInstructions:
      course.assignmentInstructions ||
      "Assignment instructions will be updated by the admin.",
  };
}

function normalizeEnquiry(enquiry: Partial<Enquiry>): Enquiry {
  const rawStatus = String(enquiry.status || "New Enquiry");
  const legacyStatus = rawStatus === "New" ? "New Enquiry" : rawStatus;
  return {
    id: enquiry.id || Date.now(),
    courseId: enquiry.courseId || 0,
    courseTitle: enquiry.courseTitle || "Course",
    name: enquiry.name || "",
    email: enquiry.email || "",
    phone: enquiry.phone || "",
    organisation: enquiry.organisation || "",
    message: enquiry.message || "",
    submittedAt: enquiry.submittedAt || new Date().toLocaleString(),
    status: enquiryStatuses.includes(legacyStatus as EnquiryStatus)
      ? (legacyStatus as EnquiryStatus)
      : "New Enquiry",
    paymentLink: enquiry.paymentLink || "",
  };
}

function normalizeEnrollment(enrollment: Partial<Enrollment>): Enrollment {
  return {
    id: enrollment.id || Date.now(),
    courseId: enrollment.courseId || 0,
    courseTitle: enrollment.courseTitle || "Course",
    name: enrollment.name || "",
    email: (enrollment.email || "").trim().toLowerCase(),
    phone: enrollment.phone || "",
    organisation: enrollment.organisation || "",
    enrolledAt: enrollment.enrolledAt || new Date().toLocaleString(),
    status: enrollmentStatuses.includes(enrollment.status as EnrollmentStatus)
      ? (enrollment.status as EnrollmentStatus)
      : "Enrolled",
  };
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim().toLowerCase());
}

function getValidIndianPhone(phone: string) {
  let cleaned = phone.replace(/[\s\-()]/g, "");

  if (cleaned.startsWith("+91")) cleaned = cleaned.slice(3);
  else if (cleaned.startsWith("91") && cleaned.length === 12) cleaned = cleaned.slice(2);
  else if (cleaned.startsWith("0") && cleaned.length === 11) cleaned = cleaned.slice(1);

  if (/^[6-9]\d{9}$/.test(cleaned)) return cleaned;
  return null;
}

function getDateInputValue(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return "";
}

function csvEscape(value: string | number) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

type AdminTab =
  | "overview"
  | "levels"
  | "categories"
  | "themes"
  | "courses"
  | "videos"
  | "webinars"
  | "workshops"
  | "instructors"
  | "registrations"
  | "tools"
  | "enquiries"
  | "enrollments"
  | "payments";

const adminTabLabels: Record<AdminTab, string> = {
  overview: "Overview",
  levels: "Levels",
  categories: "Categories",
  themes: "Themes",
  courses: "Courses",
  videos: "Learning Videos",
  webinars: "Webinars",
  workshops: "Workshops",
  instructors: "Instructors",
  registrations: "Registered",
  tools: "Home Tools",
  enquiries: "Enquiries",
  enrollments: "Enrollments",
  payments: "Payments",
};

const adminSetupTabs: AdminTab[] = ["levels", "categories", "themes"];

const adminLearningHubTabs: AdminTab[] = [
  "videos",
  "webinars",
  "workshops",
  "courses",
];

const adminDirectTabs: AdminTab[] = [
  "overview",
  "instructors",
  "registrations",
  "enquiries",
  "enrollments",
  "payments",
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [adminLoading, setAdminLoading] = useState(true);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [learningTools, setLearningTools] = useState<LearningTool[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>("overview");
  const [adminLearningMenuOpen, setAdminLearningMenuOpen] = useState(false);
  const [adminSetupMenuOpen, setAdminSetupMenuOpen] = useState(false);
  const adminLearningDropdownRef = useRef<HTMLDivElement | null>(null);
  const adminSetupDropdownRef = useRef<HTMLDivElement | null>(null);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showInstructorForm, setShowInstructorForm] = useState(false);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [selectedEnrollmentCourseId, setSelectedEnrollmentCourseId] =
    useState("");
  const [manualStudent, setManualStudent] =
    useState<EnrollmentRow>(emptyEnrollmentRow);
  const [enrollmentRows, setEnrollmentRows] = useState<EnrollmentRow[]>([]);

  const [courseForm, setCourseForm] = useState<CourseForm>(emptyCourseForm);
  const [courseEditId, setCourseEditId] = useState<number | null>(null);

  const [instructorForm, setInstructorForm] =
    useState<InstructorForm>(emptyInstructorForm);
  const [instructorEditId, setInstructorEditId] = useState<number | null>(null);
  const [learningToolForm, setLearningToolForm] =
    useState<LearningToolForm>(emptyLearningToolForm);
  const [learningToolEditId, setLearningToolEditId] = useState<number | null>(null);
  const [selectedLearningArea, setSelectedLearningArea] =
    useState("Geospatial Tools");

  useEffect(() => {
    if (!getAdminToken()) {
      navigate("/admin-login", { replace: true });
      return;
    }
    void loadInitialData();
  }, [navigate]);

  useEffect(() => {
    const closeAdminDropdownOnOutsideClick = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        adminLearningDropdownRef.current &&
        !adminLearningDropdownRef.current.contains(target)
      ) {
        setAdminLearningMenuOpen(false);
      }

      if (
        adminSetupDropdownRef.current &&
        !adminSetupDropdownRef.current.contains(target)
      ) {
        setAdminSetupMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeAdminDropdownOnOutsideClick);

    return () => {
      document.removeEventListener("pointerdown", closeAdminDropdownOnOutsideClick);
    };
  }, []);

  const loadInitialData = async () => {
    try {
      const data = await loadAdminBootstrap();
      setCourses((data.courses || []).map((course) => normalizeCourse(course as Partial<Course>)));
      setInstructors(
        (data.instructors || []).map((instructor) =>
          normalizeInstructor(instructor as Partial<Instructor>)
        )
      );
      setLearningTools(
        mergeWithDefaultLearningTools(
          (data.learningTools || []).map((tool) =>
            normalizeLearningTool(tool as Partial<LearningTool>)
          )
        )
      );
      setEnquiries(
        (data.enquiries || []).map((enquiry) =>
          normalizeEnquiry(enquiry as Partial<Enquiry>)
        )
      );
      setEnrollments(
        (data.enrollments || []).map((enrollment) =>
          normalizeEnrollment(enrollment as Partial<Enrollment>)
        )
      );
      setAdminLoading(false);
    } catch (error) {
      console.error("Could not load shared TerraMatrix data.", error);
      setAdminLoading(false);
      clearAdminSession();
      alert(error instanceof Error ? error.message : "The admin session has expired.");
      navigate("/admin-login", { replace: true });
    }
  };

  const logoutAdmin = () => {
    clearAdminSession();
    navigate("/", { replace: true });
  };

  const persistCollection = async <T extends { id: number }>(
    tableName: "Courses" | "Instructors" | "Learning_Tools" | "Enquiries" | "Enrollments",
    previous: T[],
    updated: T[]
  ) => {
    const deletedIds = previous
      .filter((item) => !updated.some((next) => next.id === item.id))
      .map((item) => item.id);

    const previousById = new Map(previous.map((item) => [String(item.id), item]));
    const changedItems = updated.filter((item) => {
      const prior = previousById.get(String(item.id));
      return !prior || JSON.stringify(prior) !== JSON.stringify(item);
    });

    await Promise.all([
      ...changedItems.map((item) =>
        saveAdminRecord(tableName, item as unknown as Record<string, unknown>)
      ),
      ...deletedIds.map((id) => deleteAdminRecord(tableName, id)),
    ]);
  };

  const saveCourses = (updated: Course[]) => {
    const previous = courses;
    setCourses(updated);
    localStorage.setItem("terramatrix_courses", JSON.stringify(updated));
    void persistCollection("Courses", previous, updated).catch((error) => {
      console.error("Could not save courses.", error);
      alert(error instanceof Error ? error.message : "Could not save course details.");
      void loadInitialData();
    });
  };

  const saveInstructors = (updated: Instructor[]) => {
    const previous = instructors;
    setInstructors(updated);
    localStorage.setItem("terramatrix_instructors", JSON.stringify(updated));
    void persistCollection("Instructors", previous, updated).catch((error) => {
      console.error("Could not save instructors.", error);
      alert(error instanceof Error ? error.message : "Could not save instructor details.");
      void loadInitialData();
    });
  };

  const saveLearningTools = (updated: LearningTool[]) => {
    const sorted = dedupeLearningTools(updated);
    const previous = learningTools;
    setLearningTools(sorted);
    localStorage.setItem("terramatrix_learning_tools", JSON.stringify(sorted));
    void persistCollection("Learning_Tools", previous, sorted).catch((error) => {
      console.error("Could not save learning tools.", error);
      alert(error instanceof Error ? error.message : "Could not save learning tools.");
      void loadInitialData();
    });
  };

  const saveEnquiries = (updated: Enquiry[]) => {
    const previous = enquiries;
    setEnquiries(updated);
    localStorage.setItem("terramatrix_enquiries", JSON.stringify(updated));
    void persistCollection("Enquiries", previous, updated).catch((error) => {
      console.error("Could not update enquiries.", error);
      alert(error instanceof Error ? error.message : "Could not update enquiries.");
      void loadInitialData();
    });
  };

  const saveEnrollments = (updated: Enrollment[]) => {
    const previous = enrollments;
    setEnrollments(updated);
    localStorage.setItem("terramatrix_enrollments", JSON.stringify(updated));
    void persistCollection("Enrollments", previous, updated).catch((error) => {
      console.error("Could not update enrollments.", error);
      alert(error instanceof Error ? error.message : "Could not update enrolments.");
      void loadInitialData();
    });
  };

  const parseEnrollmentCsv = (file: File | undefined) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const text = String(reader.result || "");
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      const rows = lines
        .map((line) => line.split(",").map((cell) => cell.trim()))
        .filter((columns, index) => {
          if (index === 0 && columns.join(",").toLowerCase().includes("email")) {
            return false;
          }

          return columns.length >= 3;
        })
        .map((columns) => ({
          name: columns[0] || "",
          email: columns[1] || "",
          phone: columns[2] || "",
          organisation: columns[3] || "",
        }));

      if (rows.length === 0) {
        alert("No valid student rows found. Use CSV columns: name,email,phone,organisation");
        return;
      }

      setEnrollmentRows((current) => [...current, ...rows]);
    };

    reader.readAsText(file);
  };

  const addManualEnrollmentRow = () => {
    if (!manualStudent.name.trim()) {
      alert("Please enter student name.");
      return;
    }

    if (!isValidEmail(manualStudent.email)) {
      alert("Please enter a valid email.");
      return;
    }

    const phone = getValidIndianPhone(manualStudent.phone);

    if (!phone) {
      alert("Please enter a valid Indian mobile number.");
      return;
    }

    setEnrollmentRows((current) => [
      ...current,
      {
        ...manualStudent,
        email: manualStudent.email.trim().toLowerCase(),
        phone,
      },
    ]);

    setManualStudent(emptyEnrollmentRow);
  };

  const removeEnrollmentRow = (index: number) => {
    setEnrollmentRows((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const saveEnrollmentRows = () => {
    const selectedCourse = courses.find(
      (course) => String(course.id) === selectedEnrollmentCourseId
    );

    if (!selectedCourse) {
      alert("Please select a published course.");
      return;
    }

    if (enrollmentRows.length === 0) {
      alert("Please add at least one student or upload a CSV file.");
      return;
    }

    const validRows: EnrollmentRow[] = [];
    const invalidRows: string[] = [];

    enrollmentRows.forEach((row, index) => {
      const email = row.email.trim().toLowerCase();
      const phone = getValidIndianPhone(row.phone);

      if (!row.name.trim() || !isValidEmail(email) || !phone) {
        invalidRows.push(String(index + 1));
        return;
      }

      validRows.push({
        name: row.name.trim(),
        email,
        phone,
        organisation: row.organisation.trim(),
      });
    });

    if (invalidRows.length > 0) {
      alert(`Please correct invalid student row(s): ${invalidRows.join(", ")}`);
      return;
    }

    const newEnrollments: Enrollment[] = validRows.map((row) => ({
      id: Date.now() + Math.floor(Math.random() * 100000),
      courseId: selectedCourse.id,
      courseTitle: selectedCourse.title,
      name: row.name,
      email: row.email,
      phone: row.phone,
      organisation: row.organisation,
      enrolledAt: new Date().toLocaleString(),
      status: "Enrolled",
    }));

    const withoutDuplicates = enrollments.filter(
      (existing) =>
        !newEnrollments.some(
          (item) =>
            item.courseId === existing.courseId &&
            item.email === existing.email &&
            item.phone === existing.phone
        )
    );

    saveEnrollments([...newEnrollments, ...withoutDuplicates]);
    setEnrollmentRows([]);
    setManualStudent(emptyEnrollmentRow);
    setShowEnrollmentForm(false);
    alert(`${newEnrollments.length} student(s) enrolled.`);
  };

  const updateEnrollment = (id: number, updates: Partial<Enrollment>) => {
    saveEnrollments(
      enrollments.map((enrollment) =>
        enrollment.id === id ? { ...enrollment, ...updates } : enrollment
      )
    );
  };

  const deleteEnrollment = (id: number) => {
    saveEnrollments(enrollments.filter((enrollment) => enrollment.id !== id));
  };

  const handleFileUpload = (
    file: File | undefined,
    expected: "image" | "pdf",
    setter: (dataUrl: string, fileName: string) => void
  ) => {
    if (!file) return;
    if (expected === "image" && !file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }
    if (expected === "pdf" && file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Please upload a file smaller than 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setter(String(reader.result), file.name);
    reader.readAsDataURL(file);
  };

  const resetCourseForm = () => {
    setCourseForm(emptyCourseForm);
    setCourseEditId(null);
    setShowCourseForm(false);
  };

  const resetInstructorForm = () => {
    setInstructorForm(emptyInstructorForm);
    setInstructorEditId(null);
    setShowInstructorForm(false);
  };

  const resetLearningToolForm = () => {
    setLearningToolForm({
      ...emptyLearningToolForm,
      area: selectedLearningArea,
      order: learningTools.filter((tool) => tool.area === selectedLearningArea).length + 1,
    });
    setLearningToolEditId(null);
  };

  const createOrUpdateLearningTool = () => {
    if (!learningToolForm.name.trim()) {
      alert("Please enter the tool or skill name.");
      return;
    }

    const normalizedArea = normalizeToolArea(learningToolForm.area, learningToolForm.name);

    const toolData: LearningTool = {
      id: learningToolEditId || Date.now(),
      area: normalizedArea,
      name: normalizeToolName(learningToolForm.name),
      icon: learningToolForm.icon || "🧩",
      logoData: learningToolForm.logoData || "",
      order: Number(learningToolForm.order || learningTools.length + 1),
    };

    setSelectedLearningArea(normalizedArea);

    if (learningToolEditId) {
      saveLearningTools(
        learningTools.map((tool) => (tool.id === learningToolEditId ? toolData : tool))
      );
    } else {
      saveLearningTools([...learningTools, toolData]);
    }

    resetLearningToolForm();
  };

  const editLearningTool = (tool: LearningTool) => {
    setSelectedLearningArea(tool.area);
    setLearningToolEditId(tool.id);
    setLearningToolForm({
      area: tool.area,
      name: tool.name,
      icon: tool.icon,
      logoData: tool.logoData,
      order: tool.order,
    });
    setActiveAdminTab("tools");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteLearningTool = (id: number) => {
    saveLearningTools(learningTools.filter((tool) => tool.id !== id));
    if (learningToolEditId === id) resetLearningToolForm();
  };

  const createOrUpdateCourse = (status: "Draft" | "Published") => {
    if (!courseForm.title.trim()) {
      alert("Please enter a course title.");
      return;
    }

    const linkedInstructors = instructors.filter((instructor) =>
      courseForm.instructorIds.includes(instructor.id)
    );

    const courseData: Course = {
      id: courseEditId || Date.now(),
      title: courseForm.title.trim(),
      shortTitle: courseForm.shortTitle || "",
      category: courseForm.category || "Engineering Tools",
      theme: courseForm.theme || getDefaultThemeForCategory(courseForm.category || "Engineering Tools"),
      duration: courseForm.duration || "To be updated",
      level: courseForm.level || "Open",
      mode: courseForm.mode || "Offline",
      imageUrl: normalizePublicAssetPath(courseForm.imageUrl || "") || defaultImage,
      instructorName:
        linkedInstructors.map((instructor) => instructor.name).join(", ") ||
        "TerraMatrix Faculty",
      instructorDesignation:
        linkedInstructors
          .map((instructor) => instructor.designation)
          .filter(Boolean)
          .join(", ") || "Course Instructor",
      instructorIds: courseForm.instructorIds,
      startDate: courseForm.startDate || "To be announced",
      fee: courseForm.fee || "To be announced",
      certificate: normalizeCertification(courseForm.certificate || ""),
      description: courseForm.description || "Course description will be updated soon.",
      outcomes: buildOutcomeText(courseForm) || "Learning outcomes will be updated soon.",
      brochureName: courseForm.brochureName || "",
      brochureData: normalizePublicAssetPath(courseForm.brochureData || ""),
      status,
      onlineSessionLink: courseForm.onlineSessionLink || "",
      onlineSessionDate: courseForm.onlineSessionDate || "",
      onlineSessionTime: courseForm.onlineSessionTime || "",
      recordingLink: courseForm.recordingLink || "",
      materialTitle: courseForm.materialTitle || "Course Reading Material",
      materialDescription:
        courseForm.materialDescription ||
        "Reading material will be shared with enrolled learners.",
      materialFileName: courseForm.materialFileName || "",
      materialFileData: normalizePublicAssetPath(courseForm.materialFileData || ""),
      assignmentTitle: courseForm.assignmentTitle || "Assignment",
      assignmentInstructions:
        courseForm.assignmentInstructions ||
        "Assignment instructions will be updated by the admin.",
    };

    if (courseEditId) {
      saveCourses(
        courses.map((course) => (course.id === courseEditId ? courseData : course))
      );
    } else {
      saveCourses([courseData, ...courses]);
    }

    resetCourseForm();
  };

  const editCourse = (course: Course) => {
    const outcomeItems = parseOutcomeItems(course.outcomes);

    setCourseEditId(course.id);
    setShowCourseForm(true);
    setCourseForm({
      title: course.title,
      shortTitle: course.shortTitle || "",
      category: course.category,
      theme: course.theme || getDefaultThemeForCategory(course.category),
      duration: course.duration,
      level: course.level,
      mode: course.mode,
      imageUrl: course.imageUrl,
      instructorIds: course.instructorIds || [],
      startDate: course.startDate,
      fee: course.fee,
      certificate: normalizeCertification(course.certificate),
      description: course.description,
      outcome1: outcomeItems[0] || "",
      outcome2: outcomeItems[1] || "",
      outcome3: outcomeItems[2] || "",
      outcome4: outcomeItems[3] || "",
      outcome5: outcomeItems[4] || "",
      brochureName: course.brochureName,
      brochureData: course.brochureData,
      onlineSessionLink: course.onlineSessionLink,
      onlineSessionDate: course.onlineSessionDate,
      onlineSessionTime: course.onlineSessionTime,
      recordingLink: course.recordingLink,
      materialTitle: course.materialTitle,
      materialDescription: course.materialDescription,
      materialFileName: course.materialFileName,
      materialFileData: course.materialFileData,
      assignmentTitle: course.assignmentTitle,
      assignmentInstructions: course.assignmentInstructions,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteCourse = (id: number) => {
    saveCourses(courses.filter((course) => course.id !== id));
    if (courseEditId === id) resetCourseForm();
  };

  const toggleCourseStatus = (id: number) => {
    saveCourses(
      courses.map((course) =>
        course.id === id
          ? { ...course, status: course.status === "Published" ? "Draft" : "Published" }
          : course
      )
    );
  };

  const createOrUpdateInstructor = () => {
    if (!instructorForm.name.trim()) {
      alert("Please enter instructor name.");
      return;
    }

    const instructorData: Instructor = normalizeInstructor({
      ...instructorForm,
      id: instructorEditId || Date.now(),
      remoteId: "",
    });

    if (instructorEditId) {
      saveInstructors(
        instructors.map((instructor) =>
          instructor.id === instructorEditId ? instructorData : instructor
        )
      );
    } else {
      saveInstructors([instructorData, ...instructors]);
    }

    resetInstructorForm();
  };

  const editInstructor = (instructor: Instructor) => {
    setInstructorEditId(instructor.id);
    setShowInstructorForm(true);
    setInstructorForm({
      name: instructor.name,
      designation: instructor.designation,
      company: instructor.company,
      expertise: instructor.expertise,
      email: instructor.email,
      phone: instructor.phone,
      bio: instructor.bio,
      photoUrl: instructor.photoUrl,
      cvName: instructor.cvName,
      cvData: instructor.cvData,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteInstructor = (id: number) => {
    saveInstructors(instructors.filter((instructor) => instructor.id !== id));
    saveCourses(
      courses.map((course) => ({
        ...course,
        instructorIds: course.instructorIds.filter((instructorId) => instructorId !== id),
      }))
    );
    if (instructorEditId === id) resetInstructorForm();
  };

  const toggleInstructorSelection = (id: number) => {
    setCourseForm((current) => {
      const selected = current.instructorIds.includes(id);
      return {
        ...current,
        instructorIds: selected
          ? current.instructorIds.filter((instructorId) => instructorId !== id)
          : [...current.instructorIds, id],
      };
    });
  };

  const updateEnquiry = (id: number, updates: Partial<Enquiry>) => {
    saveEnquiries(
      enquiries.map((enquiry) =>
        enquiry.id === id ? { ...enquiry, ...updates } : enquiry
      )
    );
  };

  const deleteEnquiry = (id: number) => {
    saveEnquiries(enquiries.filter((enquiry) => enquiry.id !== id));
  };

  const exportEnquiriesCsv = () => {
    if (enquiries.length === 0) {
      alert("No enquiries available to export.");
      return;
    }

    const headers = [
      "Name",
      "Course",
      "Email",
      "Phone",
      "Organisation",
      "Submitted",
      "Status",
      "Payment Link",
      "Message",
    ];

    const rows = enquiries.map((enquiry) => [
      enquiry.name,
      enquiry.courseTitle,
      enquiry.email,
      enquiry.phone,
      enquiry.organisation || "Not provided",
      enquiry.submittedAt,
      enquiry.status,
      enquiry.paymentLink,
      enquiry.message || "",
    ]);

    const csvContent = [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `terramatrix-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (adminLoading) {
    return (
      <main className="tm3-admin-loading" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "40px" }}>
        <div style={{ width: "min(460px, 100%)", padding: "28px", border: "1px solid var(--tm-border)", borderRadius: "var(--tm-radius-xl)", background: "var(--tm-surface)", boxShadow: "var(--tm-shadow-md)", textAlign: "left" }} role="status">
          <div style={{ color: "var(--tm-gold-700)", fontSize: "12px", fontWeight: 900, letterSpacing: "1.4px", marginBottom: "8px" }}>ADMIN WORKSPACE</div>
          <h1 style={{ color: "var(--tm-ink)", fontSize: "28px", margin: "0 0 8px" }}>Loading shared academy data</h1>
          <p style={{ color: "var(--tm-muted)", margin: "0 0 16px" }}>Courses, instructors, enquiries and enrolments are being synchronised.</p>
          <div className="tm-skeleton-line" />
        </div>
      </main>
    );
  }

  const publishedCourses = courses.filter(
    (course) => course.status === "Published"
  );

  const filteredLearningTools = learningTools.filter(
    (tool) => tool.area === selectedLearningArea
  );

  const getLearningAreaCount = (area: string) =>
    learningTools.filter((tool) => tool.area === area).length;

  return (
    <main className="tm3-admin-workspace">
      <section className="tm3-admin-header" style={headerSection}>
        <div>
          <div style={eyebrow}>ADMIN PANEL</div>
          <h1 style={pageTitle}>Academy Management</h1>
          <p style={pageText}>
            
          </p>
        </div>

        <div style={adminSidePanel}>
          <div style={summaryPanel}>
            <SummaryBox label="Courses" value={courses.length} />
            <SummaryBox label="Instructors" value={instructors.length} />
            <SummaryBox label="Enquiries" value={enquiries.length} />
            <SummaryBox label="Enrolled" value={enrollments.length} />
          </div>
          <div className="tm-admin-header-actions" style={adminHeaderActionRow}>
            <button onClick={() => navigate("/")} style={homeButton}>
              <Home size={16} /> Academy home
            </button>
            <button onClick={logoutAdmin} style={logoutButton}>Logout</button>
          </div>
        </div>
      </section>

      <section className="tm3-admin-mobile-nav" aria-label="Admin workspace navigation">
        <label htmlFor="tm3-admin-section">Manage academy</label>
        <select
          id="tm3-admin-section"
          value={activeAdminTab}
          onChange={(event) => {
            setActiveAdminTab(event.target.value as AdminTab);
            setAdminLearningMenuOpen(false);
            setAdminSetupMenuOpen(false);
          }}
        >
          <option value="overview">Overview</option>
          <optgroup label="Learning setup">
            {adminSetupTabs.map((tab) => <option key={tab} value={tab}>{adminTabLabels[tab]}</option>)}
            <option value="tools">{adminTabLabels.tools}</option>
          </optgroup>
          <optgroup label="Learning hub">
            {adminLearningHubTabs.map((tab) => <option key={tab} value={tab}>{adminTabLabels[tab]}</option>)}
          </optgroup>
          <optgroup label="Operations">
            {adminDirectTabs.filter((tab) => tab !== "overview").map((tab) => (
              <option key={tab} value={tab}>{adminTabLabels[tab]}</option>
            ))}
          </optgroup>
        </select>
      </section>

      <section className="tm3-admin-tabs" style={adminTabs}>
        <button
          onClick={() => {
            setActiveAdminTab("overview");
            setAdminLearningMenuOpen(false);
            setAdminSetupMenuOpen(false);
          }}
          style={activeAdminTab === "overview" ? activeAdminTabButton : adminTabButton}
        >
          Overview
        </button>

        <div style={adminLearningDropdownWrap} ref={adminSetupDropdownRef}>
          <button
            type="button"
            onClick={() => {
              setAdminSetupMenuOpen((current) => !current);
              setAdminLearningMenuOpen(false);
            }}
            style={
              adminSetupTabs.includes(activeAdminTab)
                ? activeAdminDropdownButton
                : adminDropdownButton
            }
            aria-expanded={adminSetupMenuOpen}
            aria-controls="tm3-admin-setup-menu"
          >
            Learning Setup ▾
          </button>

          {adminSetupMenuOpen && (
            <div id="tm3-admin-setup-menu" style={adminLearningDropdownMenu}>
              {adminSetupTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveAdminTab(tab);
                    setAdminSetupMenuOpen(false);
                    setAdminLearningMenuOpen(false);
                  }}
                  style={
                    activeAdminTab === tab
                      ? activeAdminDropdownItem
                      : adminDropdownItem
                  }
                >
                  {adminTabLabels[tab]}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={adminLearningDropdownWrap} ref={adminLearningDropdownRef}>
          <button
            type="button"
            onClick={() => {
              setAdminLearningMenuOpen((current) => !current);
              setAdminSetupMenuOpen(false);
            }}
            style={
              adminLearningHubTabs.includes(activeAdminTab)
                ? activeAdminDropdownButton
                : adminDropdownButton
            }
            aria-expanded={adminLearningMenuOpen}
            aria-controls="tm3-admin-learning-menu"
          >
            Learning Hub ▾
          </button>

          {adminLearningMenuOpen && (
            <div id="tm3-admin-learning-menu" style={adminLearningDropdownMenu}>
              {adminLearningHubTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveAdminTab(tab);
                    setAdminLearningMenuOpen(false);
                  }}
                  style={
                    activeAdminTab === tab
                      ? activeAdminDropdownItem
                      : adminDropdownItem
                  }
                >
                  {adminTabLabels[tab]}
                </button>
              ))}
            </div>
          )}
        </div>

        {adminDirectTabs
          .filter((tab) => tab !== "overview")
          .map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveAdminTab(tab);
                setAdminLearningMenuOpen(false);
                setAdminSetupMenuOpen(false);
              }}
              style={activeAdminTab === tab ? activeAdminTabButton : adminTabButton}
            >
              {adminTabLabels[tab]}
            </button>
          ))}
      </section>

      {activeAdminTab === "overview" && (
      <section className="tm3-admin-overview" style={overviewSection}>
        <div style={overviewIntroCard}>
          <div>
            <div style={eyebrow}>ADMIN OVERVIEW</div>
            <h2 style={overviewTitle}>Platform Snapshot</h2>
          </div>
        </div>

        <div style={overviewGrid}>
          <div style={overviewCard}>
            <div style={overviewCardHeader}>Course Status</div>
            <div style={overviewMetricRow}>
              <span>Total Courses</span>
              <strong>{courses.length}</strong>
            </div>
            <div style={overviewMetricRow}>
              <span>Published</span>
              <strong>{courses.filter((course) => course.status === "Published").length}</strong>
            </div>
            <div style={overviewMetricRow}>
              <span>Draft</span>
              <strong>{courses.filter((course) => course.status === "Draft").length}</strong>
            </div>
          </div>

          <div style={overviewCard}>
            <div style={overviewCardHeader}>Course Readiness</div>
            <div style={overviewMetricRow}>
              <span>Instructor Assigned</span>
              <strong>{courses.filter((course) => course.instructorIds.length > 0).length}</strong>
            </div>
            <div style={overviewMetricRow}>
              <span>Meeting Link Added</span>
              <strong>{courses.filter((course) => course.onlineSessionLink).length}</strong>
            </div>
            <div style={overviewMetricRow}>
              <span>Published Courses</span>
              <strong>{publishedCourses.length}</strong>
            </div>
          </div>

          <div style={overviewCard}>
            <div style={overviewCardHeader}>Student Pipeline</div>
            <div style={overviewMetricRow}>
              <span>New Enquiries</span>
              <strong>{enquiries.filter((enquiry) => enquiry.status === "New Enquiry").length}</strong>
            </div>
            <div style={overviewMetricRow}>
              <span>Payment Link Sent</span>
              <strong>{enquiries.filter((enquiry) => enquiry.status === "Payment Link Sent").length}</strong>
            </div>
            <div style={overviewMetricRow}>
              <span>Payment Received</span>
              <strong>{enquiries.filter((enquiry) => enquiry.status === "Payment Received").length}</strong>
            </div>
          </div>

          <div style={overviewCard}>
            <div style={overviewCardHeader}>Access & Completion</div>
            <div style={overviewMetricRow}>
              <span>Enrolled Students</span>
              <strong>{enrollments.length}</strong>
            </div>
            <div style={overviewMetricRow}>
              <span>Course Completed</span>
              <strong>{enrollments.filter((item) => item.status === "Course Completed").length}</strong>
            </div>
            <div style={overviewMetricRow}>
              <span>Certificate Issued</span>
              <strong>{enrollments.filter((item) => item.status === "Certificate Issued").length}</strong>
            </div>
          </div>
        </div>

      </section>
      )}

      {showCourseForm && (
        <div className="tm3-admin-modal-backdrop" style={modalBackdrop}>
          <div className="tm3-admin-modal" style={largeFormModal}>
            <button onClick={resetCourseForm} style={formModalClose}>
              ×
            </button>

            <div style={panel}>
          <div style={eyebrow}>COURSE MANAGEMENT</div>
          <h2 style={panelTitle}>{courseEditId ? "Edit Course" : "Create Course"}</h2>

          <Field label="Full Course Title">
            <input value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} style={inputStyle} placeholder="Example: Structural Engineering and Geospatial Applications Using AutoCAD, SAP2000 and QGIS" />
          </Field>

          <Field label="Short Course Title">
            <input value={courseForm.shortTitle} onChange={(e) => setCourseForm({ ...courseForm, shortTitle: e.target.value })} style={inputStyle} placeholder="Example: AutoCAD, SAP2000 & QGIS" />
            <p style={helperText}>Used only in course cards and compact dashboard tiles. Leave blank to use the full title.</p>
          </Field>

          <div style={twoColumn}>
            <Field label="Category">
              <select
                value={courseForm.category}
                onChange={(e) => {
                  const category = e.target.value;
                  setCourseForm({
                    ...courseForm,
                    category,
                    theme: getDefaultThemeForCategory(category),
                  });
                }}
                style={inputStyle}
              >
                {getManagedCategoryOptions("courses", courseForm.category).map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </Field>

            <Field label="Theme / Topic">
              <select
                value={courseForm.theme}
                onChange={(e) => setCourseForm({ ...courseForm, theme: e.target.value })}
                style={inputStyle}
              >
                {getManagedThemeOptions(courseForm.category, courseForm.theme).map((theme) => <option key={theme} value={theme}>{theme}</option>)}
              </select>
            </Field>
          </div>

          <div style={twoColumn}>
            <Field label="Level">
              <select value={courseForm.level} onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })} style={inputStyle}>
                {getManagedLevelOptions(courseForm.level).map((level) => <option key={level} value={level}>{level}</option>)}
              </select>
            </Field>
            <Field label="Duration (in hrs.)">
              <input value={courseForm.duration} onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })} style={inputStyle} placeholder="Example: 30" />
            </Field>
          </div>

          <Field label="Mode">
            <select value={courseForm.mode} onChange={(e) => setCourseForm({ ...courseForm, mode: e.target.value })} style={inputStyle}>
              <option>Online</option>
              <option>Offline</option>
              <option>Blended</option>
            </select>
          </Field>

          <Field label="Link Instructor(s)">
            <div style={checkList}>
              {instructors.map((instructor) => (
                <label key={instructor.id} style={checkItem}>
                  <input type="checkbox" checked={courseForm.instructorIds.includes(instructor.id)} onChange={() => toggleInstructorSelection(instructor.id)} />
                  <span style={checkNameOnly}>{instructor.name}</span>
                </label>
              ))}
            </div>
          </Field>

          <div className="tm-admin-upload-grid tm-admin-upload-grid--three" style={mediaUploadGrid}>
            <UploadField
              label="Programme image"
              description="JPG, PNG or WebP · maximum 5 MB"
              accept="image/jpeg,image/png,image/webp"
              kind="image"
              value={courseForm.imageUrl}
              fileName={getFileNameFromPath(courseForm.imageUrl || "", "programme-image")}
              onSelect={(file) =>
                handleFileUpload(file, "image", (dataUrl) =>
                  setCourseForm({ ...courseForm, imageUrl: dataUrl })
                )
              }
              onRemove={() => setCourseForm({ ...courseForm, imageUrl: defaultImage })}
            />

            <UploadField
              label="Programme brochure"
              description="PDF shown through the Course Content button"
              accept="application/pdf"
              kind="pdf"
              value={courseForm.brochureData}
              fileName={courseForm.brochureName || "programme-brochure.pdf"}
              onSelect={(file) =>
                handleFileUpload(file, "pdf", (dataUrl, fileName) =>
                  setCourseForm({ ...courseForm, brochureData: dataUrl, brochureName: fileName })
                )
              }
              onRemove={() => setCourseForm({ ...courseForm, brochureName: "", brochureData: "" })}
            />

            <UploadField
              label="Learning material"
              description="Optional PDF notes or reading material"
              accept="application/pdf"
              kind="pdf"
              value={courseForm.materialFileData}
              fileName={courseForm.materialFileName || "learning-material.pdf"}
              onSelect={(file) =>
                handleFileUpload(file, "pdf", (dataUrl, fileName) =>
                  setCourseForm({ ...courseForm, materialFileData: dataUrl, materialFileName: fileName })
                )
              }
              onRemove={() => setCourseForm({ ...courseForm, materialFileName: "", materialFileData: "" })}
            />
          </div>

          <div style={twoColumn}>
            <Field label="Start Date">
              <input type="date" value={getDateInputValue(courseForm.startDate)} onChange={(e) => setCourseForm({ ...courseForm, startDate: e.target.value })} style={inputStyle} />
            </Field>
            <Field label="Fee (in Rs)">
              <input value={courseForm.fee} onChange={(e) => setCourseForm({ ...courseForm, fee: e.target.value })} style={inputStyle} placeholder="Example: 1000" />
            </Field>
          </div>

          <Field label="Certification">
            <select value={courseForm.certificate} onChange={(e) => setCourseForm({ ...courseForm, certificate: e.target.value })} style={inputStyle}>
              <option>Completion Certificate</option>
              <option>Participation Certificate</option>
            </select>
          </Field>

          <Field label="Admin Meeting Link">
            <input
              value={courseForm.onlineSessionLink}
              onChange={(e) =>
                setCourseForm({ ...courseForm, onlineSessionLink: e.target.value })
              }
              style={inputStyle}
              placeholder="Paste Google Meet / BigBlueButton link"
            />
            <p style={helperText}>
              This common meeting link will appear in the instructor and student LMS.
            </p>
          </Field>

          <Field label="Course Overview">
            <textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} style={textareaStyle} placeholder="Briefly describe what the course offers." />
          </Field>

          <div style={learningOutcomeHeader}>
            <strong>Learning Outcomes</strong>
            <span>By the end of this programme, students will be able to:</span>
          </div>

          <div style={{ ...outcomeInputGrid, marginTop: "-4px" }}>
            <Field label="Learning Outcome 1">
              <input value={courseForm.outcome1} onChange={(e) => setCourseForm({ ...courseForm, outcome1: e.target.value })} style={inputStyle} placeholder="Example: Prepare basic structural drawings using AutoCAD" />
            </Field>
            <Field label="Learning Outcome 2">
              <input value={courseForm.outcome2} onChange={(e) => setCourseForm({ ...courseForm, outcome2: e.target.value })} style={inputStyle} placeholder="Example: Model and analyse simple structural systems using SAP2000" />
            </Field>
            <Field label="Learning Outcome 3">
              <input value={courseForm.outcome3} onChange={(e) => setCourseForm({ ...courseForm, outcome3: e.target.value })} style={inputStyle} placeholder="Example: Prepare engineering maps using QGIS" />
            </Field>
            <Field label="Learning Outcome 4">
              <input value={courseForm.outcome4} onChange={(e) => setCourseForm({ ...courseForm, outcome4: e.target.value })} style={inputStyle} placeholder="Optional" />
            </Field>
            <Field label="Learning Outcome 5">
              <input value={courseForm.outcome5} onChange={(e) => setCourseForm({ ...courseForm, outcome5: e.target.value })} style={inputStyle} placeholder="Optional" />
            </Field>
          </div>
          <p style={helperText}>Add 3 to 5 outcome statements. Empty fields will be ignored.</p>

          <div style={buttonRow}>
            <button onClick={() => createOrUpdateCourse("Published")} style={primaryButton}>{courseEditId ? "Update & Publish" : "Publish Course"}</button>
            <button onClick={() => createOrUpdateCourse("Draft")} style={secondaryButton}>{courseEditId ? "Update as Draft" : "Save Draft"}</button>
            {courseEditId && <button onClick={resetCourseForm} style={plainButton}>Cancel Edit</button>}
          </div>
        </div>
          </div>
        </div>
      )}

      {showInstructorForm && (
        <div className="tm3-admin-modal-backdrop" style={modalBackdrop}>
          <div className="tm3-admin-modal" style={largeFormModal}>
            <button onClick={resetInstructorForm} style={formModalClose}>
              ×
            </button>

            <div style={compactPanel}>
              <div style={compactFormHeading}>
                <div>
                  <div style={eyebrow}>INSTRUCTOR MANAGEMENT</div>
                  <h2 style={compactPanelTitle}>{instructorEditId ? "Edit instructor" : "Add instructor"}</h2>
                  <p style={compactPanelNote}>Create the faculty profile and upload the photo and CV directly. Files are organised automatically in TerraMatrix Drive folders.</p>
                </div>
              </div>

              <div className="tm-admin-compact-grid" style={compactFormGrid}>
                <Field label="Instructor name">
                  <input value={instructorForm.name} onChange={(e) => setInstructorForm({ ...instructorForm, name: e.target.value })} style={compactInputStyle} placeholder="Example: Dr Arpan Pradhan" />
                </Field>
                <Field label="Designation">
                  <input value={instructorForm.designation} onChange={(e) => setInstructorForm({ ...instructorForm, designation: e.target.value })} style={compactInputStyle} placeholder="Assistant Professor" />
                </Field>
                <Field label="Institution / company">
                  <input value={instructorForm.company} onChange={(e) => setInstructorForm({ ...instructorForm, company: e.target.value })} style={compactInputStyle} placeholder="Institution or organisation" />
                </Field>
                <Field label="Email">
                  <input type="email" value={instructorForm.email} onChange={(e) => setInstructorForm({ ...instructorForm, email: e.target.value })} style={compactInputStyle} placeholder="name@example.com" />
                </Field>
                <Field label="Phone">
                  <input value={instructorForm.phone} onChange={(e) => setInstructorForm({ ...instructorForm, phone: e.target.value })} style={compactInputStyle} placeholder="Mobile number" />
                </Field>
                <Field label="Expertise keywords">
                  <input value={instructorForm.expertise} onChange={(e) => setInstructorForm({ ...instructorForm, expertise: e.target.value })} style={compactInputStyle} placeholder="QGIS, SAP2000, Hydrology" />
                </Field>
              </div>

              <div className="tm-admin-upload-grid tm-admin-upload-grid--two" style={mediaUploadGridTwo}>
                <UploadField
                  label="Profile photograph"
                  description="Passport-style JPG, PNG or WebP · maximum 5 MB"
                  accept="image/jpeg,image/png,image/webp"
                  kind="image"
                  value={instructorForm.photoUrl}
                  fileName={getFileNameFromPath(instructorForm.photoUrl || "", "instructor-photo")}
                  onSelect={(file) =>
                    handleFileUpload(file, "image", (dataUrl) =>
                      setInstructorForm({ ...instructorForm, photoUrl: dataUrl })
                    )
                  }
                  onRemove={() => setInstructorForm({ ...instructorForm, photoUrl: "" })}
                  compactImage
                />

                <UploadField
                  label="Resume / CV"
                  description="PDF only · maximum 5 MB"
                  accept="application/pdf"
                  kind="pdf"
                  value={instructorForm.cvData}
                  fileName={instructorForm.cvName || "instructor-cv.pdf"}
                  onSelect={(file) =>
                    handleFileUpload(file, "pdf", (dataUrl, fileName) =>
                      setInstructorForm({ ...instructorForm, cvData: dataUrl, cvName: fileName })
                    )
                  }
                  onRemove={() => setInstructorForm({ ...instructorForm, cvName: "", cvData: "" })}
                />
              </div>

              <Field label="Short professional profile">
                <textarea value={instructorForm.bio} onChange={(e) => setInstructorForm({ ...instructorForm, bio: e.target.value })} style={compactTextareaStyle} placeholder="Write a concise 3–5 line profile highlighting teaching, research and professional expertise." />
              </Field>

              <div className="tm-admin-sticky-actions" style={stickyFormActions}>
                <button onClick={createOrUpdateInstructor} style={primaryButton}>{instructorEditId ? "Update instructor" : "Add instructor"}</button>
                <button onClick={resetInstructorForm} style={plainButton}>{instructorEditId ? "Cancel edit" : "Cancel"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEnrollmentForm && (
        <div className="tm3-admin-modal-backdrop" style={modalBackdrop}>
          <div className="tm3-admin-modal" style={largeFormModal}>
            <button
              onClick={() => {
                setShowEnrollmentForm(false);
                setEnrollmentRows([]);
                setManualStudent(emptyEnrollmentRow);
              }}
              style={formModalClose}
            >
              ×
            </button>

            <div style={panel}>
              <div style={eyebrow}>ENROLL PAID STUDENTS</div>
              <h2 style={panelTitle}>Enroll Student(s) to a Course</h2>

              <Field label="Select Published Course">
                <select
                  value={selectedEnrollmentCourseId}
                  onChange={(e) => setSelectedEnrollmentCourseId(e.target.value)}
                  style={inputStyle}
                >
                  {publishedCourses.length === 0 && (
                    <option value="">No published courses available</option>
                  )}
                  {publishedCourses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </Field>

              <div style={subPanel}>
                <h3 style={subPanelTitle}>Add One Student</h3>

                <div style={twoColumn}>
                  <Field label="Student Name">
                    <input
                      value={manualStudent.name}
                      onChange={(e) =>
                        setManualStudent({
                          ...manualStudent,
                          name: e.target.value,
                        })
                      }
                      style={inputStyle}
                      placeholder="Student name"
                    />
                  </Field>

                  <Field label="Email">
                    <input
                      value={manualStudent.email}
                      onChange={(e) =>
                        setManualStudent({
                          ...manualStudent,
                          email: e.target.value,
                        })
                      }
                      style={inputStyle}
                      placeholder="email@example.com"
                    />
                  </Field>
                </div>

                <div style={twoColumn}>
                  <Field label="Phone">
                    <input
                      value={manualStudent.phone}
                      onChange={(e) =>
                        setManualStudent({
                          ...manualStudent,
                          phone: e.target.value,
                        })
                      }
                      style={inputStyle}
                      placeholder="10-digit mobile number"
                    />
                  </Field>

                  <Field label="Organisation / Institution">
                    <input
                      value={manualStudent.organisation}
                      onChange={(e) =>
                        setManualStudent({
                          ...manualStudent,
                          organisation: e.target.value,
                        })
                      }
                      style={inputStyle}
                      placeholder="Optional"
                    />
                  </Field>
                </div>

                <button onClick={addManualEnrollmentRow} style={secondaryButton}>
                  Add to Enrolment List
                </button>
              </div>

              <div style={subPanel}>
                <h3 style={subPanelTitle}>Batch Enrolment by CSV</h3>
                <p style={helperText}>
                  CSV format: name,email,phone,organisation. Header row is optional.
                </p>

                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => parseEnrollmentCsv(e.target.files?.[0])}
                  style={fileInputStyle}
                />
              </div>

              <div style={subPanel}>
                <h3 style={subPanelTitle}>
                  Students Ready to Enroll ({enrollmentRows.length})
                </h3>

                {enrollmentRows.length === 0 ? (
                  <p style={helperText}>No students added yet.</p>
                ) : (
                  <div style={enquiryTableWrap}>
                    <table style={enquiryTable}>
                      <thead>
                        <tr>
                          <th style={tableHeader}>Name</th>
                          <th style={tableHeader}>Email</th>
                          <th style={tableHeader}>Phone</th>
                          <th style={tableHeader}>Organisation</th>
                          <th style={tableHeader}>Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {enrollmentRows.map((row, index) => (
                          <tr key={`${row.email}-${index}`} style={tableRow}>
                            <td style={tableCellStrong}>{row.name}</td>
                            <td style={tableCell}>{row.email}</td>
                            <td style={tableCell}>{row.phone}</td>
                            <td style={tableCell}>
                              {row.organisation || "Not provided"}
                            </td>
                            <td style={tableCell}>
                              <button
                                onClick={() => removeEnrollmentRow(index)}
                                style={deleteButton}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div style={buttonRow}>
                <button onClick={saveEnrollmentRows} style={primaryButton}>
                  Enroll Student(s)
                </button>

                <button
                  onClick={() => {
                    setShowEnrollmentForm(false);
                    setEnrollmentRows([]);
                    setManualStudent(emptyEnrollmentRow);
                  }}
                  style={plainButton}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeAdminTab === "videos" && (
        <LearningVideoAdminPanel />
      )}

      {activeAdminTab === "webinars" && (
        <AcademyEventAdminPanel
          kind="Webinar"
          storageKey="terramatrix_webinars"
          eyebrowLabel="WEBINAR MANAGEMENT"
          titleLabel="Webinars"
          instructors={instructors}
        />
      )}

      {activeAdminTab === "workshops" && (
        <AcademyEventAdminPanel
          kind="Workshop"
          storageKey="terramatrix_workshops"
          eyebrowLabel="WORKSHOP MANAGEMENT"
          titleLabel="Workshops"
          instructors={instructors}
        />
      )}

      {adminSetupTabs.includes(activeAdminTab) && (
        <TaxonomyAdminPanel
          mode={activeAdminTab as TaxonomyMode}
          onCategoryRenamed={(oldCategory, newCategory) => {
            saveCourses(
              courses.map((course) =>
                course.category === oldCategory
                  ? { ...course, category: newCategory }
                  : course
              )
            );
          }}
          onLevelRenamed={(oldLevel, newLevel) => {
            saveCourses(
              courses.map((course) =>
                course.level === oldLevel ? { ...course, level: newLevel } : course
              )
            );
          }}
          onThemeRenamed={(oldTheme, newTheme) => {
            saveCourses(
              courses.map((course) =>
                course.theme === oldTheme ? { ...course, theme: newTheme } : course
              )
            );
          }}
        />
      )}

      {activeAdminTab === "courses" && (
      <section style={wideSection}>
        <div style={sectionHeader}>
          <div>
            <div style={eyebrow}>COURSE MANAGEMENT</div>
            <h2 style={panelTitle}>Courses</h2>
          </div>
          <button
            onClick={() => {
              setCourseForm(emptyCourseForm);
              setCourseEditId(null);
              setShowCourseForm(true);
            }}
            style={largeActionButton}
          >
            + Add Course
          </button>
        </div>

        {courses.length === 0 ? (
          <div style={emptyState}>No courses added yet. Use + Add Course to create the first course.</div>
        ) : (
          <div style={tableShell}>
            <table style={courseDataTable}>
              <colgroup>
                <col style={{ width: "29%" }} />
                <col style={{ width: "19%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "17%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "13%" }} />
              </colgroup>
              <thead style={tableHead}>
                <tr>
                  <th style={tableHeaderCell}>Course</th>
                  <th style={tableHeaderCell}>Category</th>
                  <th style={tableHeaderCell}>Level / Duration</th>
                  <th style={tableHeaderCell}>Instructor(s)</th>
                  <th style={tableHeaderCell}>Session</th>
                  <th style={tableHeaderCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} style={professionalTableRow}>
                    <td style={professionalTableCell}>
                      <div style={tableCourseCell}>
                        <div style={{ ...tableThumb, backgroundImage: `linear-gradient(rgba(23,63,53,0.08), rgba(23,63,53,0.08)), url('${course.imageUrl}')` }} />
                        <div>
                          <strong style={tablePrimaryText}>{course.title}</strong>

                        </div>
                      </div>
                    </td>
                    <td style={professionalTableCell}>
                      <span style={categoryBadge}>{course.category}</span>
                    </td>
                    <td style={professionalTableCell}>
                      <strong style={tablePrimaryText}>{course.level || "Open"}</strong>
                      <span style={tableMutedText}>{course.duration || "Duration pending"} · {course.mode}</span>
                    </td>
                    <td style={professionalTableCell}>
                      {course.instructorName ? (
                        <div style={nameStack}>
                          {course.instructorName.split(",").map((name) => (
                            <span key={name.trim()} style={instructorNameLine}>{name.trim()}</span>
                          ))}
                        </div>
                      ) : (
                        <span style={tableMutedText}>Not linked</span>
                      )}
                    </td>
                    <td style={professionalTableCell}>
                      <span style={course.onlineSessionLink ? sessionLinkReady : sessionLinkPending}>
                        Link
                      </span>
                    </td>
                    <td style={professionalTableCell}>
                      <div style={courseActionGrid}>
                        <button onClick={() => editCourse(course)} style={smallButton}>Edit</button>
                        <button onClick={() => toggleCourseStatus(course.id)} style={smallButton}>
                          {course.status === "Published" ? "Draft" : "Publish"}
                        </button>
                        <button onClick={() => deleteCourse(course.id)} style={courseDeleteButton}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>


      )}

      {activeAdminTab === "instructors" && (
      <section style={wideSection}>
        <div style={sectionHeader}>
          <div>
            <div style={eyebrow}>INSTRUCTOR MANAGEMENT</div>
            <h2 style={panelTitle}>Instructors</h2>
          </div>
          <button
            onClick={() => {
              setInstructorForm(emptyInstructorForm);
              setInstructorEditId(null);
              setShowInstructorForm(true);
            }}
            style={largeActionButton}
          >
            + Add Instructor
          </button>
        </div>

        {instructors.length === 0 ? (
          <div style={emptyState}>No instructors added yet. Use + Add Instructor to create the first profile.</div>
        ) : (
          <div style={instructorTableShell}>
            <div style={instructorGridHeader}>
              <div style={instructorGridHeaderCell}>Instructor</div>
              <div style={instructorGridHeaderCell}>Designation</div>
              <div style={instructorGridHeaderCell}>Tool Expertise</div>
              <div style={instructorGridHeaderCell}>Contact</div>
              <div style={instructorGridHeaderCell}>Actions</div>
            </div>

            {instructors.map((instructor) => (
              <div key={instructor.id} style={instructorGridRow}>
                <div style={instructorIdentityCell}>
                  <div style={{ ...tablePhoto, backgroundImage: `url('${instructor.photoUrl}')` }} />
                  <strong style={tablePrimaryText}>{instructor.name}</strong>
                </div>

                <div style={instructorGridCell}>
                  <strong style={designationLine}>{instructor.designation}</strong>
                  <span style={tableMutedText}>{instructor.company}</span>
                </div>

                <div style={instructorGridCell}>
                  <span style={tableMutedText}>
                    {formatInstructorExpertise(instructor.expertise) || "Not added"}
                  </span>
                </div>

                <div style={instructorGridCell}>
                  <span style={tableMutedText}>{instructor.email || "Email not added"}</span>
                  <span style={tableMutedText}>{instructor.phone || "Phone not added"}</span>
                </div>

                <div style={instructorActionRow}>
                  <button onClick={() => editInstructor(instructor)} style={smallButton}>Edit</button>
                  <button
                    onClick={() => deleteInstructor(instructor.id)}
                    style={deleteIconButton}
                    title="Delete instructor"
                    aria-label="Delete instructor"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>


      )}

      {activeAdminTab === "registrations" && (
        <EventRegistrationAdminPanel />
      )}

      {activeAdminTab === "tools" && (
      <section style={wideSection}>
        <div style={sectionHeader}>
          <div>
            <div style={eyebrow}>HOME PAGE TOOLS</div>
            <h2 style={panelTitle}>Home Page Tool Display</h2>
            <p style={sectionNote}>
              These category buttons are linked to the Home page Learning Areas. Select a category below to add, edit or delete the tools shown under it.
            </p>
          </div>
        </div>

        <div style={toolCategoryStrip}>
          {learningAreaOptions.map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => {
                setSelectedLearningArea(area);
                setLearningToolEditId(null);
                setLearningToolForm({
                  ...emptyLearningToolForm,
                  area,
                  order: learningTools.filter((tool) => tool.area === area).length + 1,
                });
              }}
              style={selectedLearningArea === area ? activeToolCategoryButton : toolCategoryButton}
            >
              <span>{area}</span>
              <strong>{getLearningAreaCount(area)}</strong>
            </button>
          ))}
        </div>

        <div style={toolAdminLayout}>
          <div style={toolFormCard}>
            <h3 style={miniPanelTitle}>
              {learningToolEditId ? "Edit Tool" : `Add Tool to ${selectedLearningArea}`}
            </h3>

            <Field label="Linked Home Category">
              <select
                value={learningToolForm.area}
                onChange={(e) => {
                  setSelectedLearningArea(e.target.value);
                  setLearningToolForm({ ...learningToolForm, area: e.target.value });
                }}
                style={inputStyle}
              >
                {learningAreaOptions.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </Field>

            <Field label="Tool / Skill Name">
              <input
                value={learningToolForm.name}
                onChange={(e) =>
                  setLearningToolForm({ ...learningToolForm, name: e.target.value })
                }
                style={inputStyle}
                placeholder="Example: QGIS"
              />
            </Field>

            <div style={twoColumn}>
              <Field label="Icon / Short Logo">
                <input
                  value={learningToolForm.icon}
                  onChange={(e) =>
                    setLearningToolForm({ ...learningToolForm, icon: e.target.value })
                  }
                  style={inputStyle}
                  placeholder="Example: 🛰️"
                />
              </Field>

              <Field label="Display Order">
                <input
                  type="number"
                  value={learningToolForm.order}
                  onChange={(e) =>
                    setLearningToolForm({
                      ...learningToolForm,
                      order: Number(e.target.value || 1),
                    })
                  }
                  style={inputStyle}
                />
              </Field>
            </div>

            <Field label="Optional Logo Image">
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleFileUpload(e.target.files?.[0], "image", (dataUrl) =>
                    setLearningToolForm({ ...learningToolForm, logoData: dataUrl })
                  )
                }
                style={fileInputStyle}
              />
            </Field>

            <div style={toolPreview}>
              {learningToolForm.logoData ? (
                <img src={learningToolForm.logoData} alt="Tool logo preview" style={toolLogoPreview} />
              ) : (
                <span style={toolIconPreview}>{learningToolForm.icon || "🧩"}</span>
              )}
              <span>{learningToolForm.name || "Tool preview"}</span>
            </div>

            <div style={buttonRow}>
              <button onClick={createOrUpdateLearningTool} style={primaryButton}>
                {learningToolEditId ? "Update Tool" : "+ Add Tool"}
              </button>
              <button onClick={resetLearningToolForm} style={plainButton}>
                Clear
              </button>
            </div>
          </div>

          <div style={toolListCard}>
            <h3 style={miniPanelTitle}>Tools under {selectedLearningArea}</h3>

            {filteredLearningTools.length === 0 ? (
              <p style={courseItemText}>No tools added under this category yet.</p>
            ) : (
              <div style={toolAdminList}>
                {filteredLearningTools.map((tool) => (
                  <article key={tool.id} style={toolAdminItem}>
                    <div style={toolAdminLogoBox}>
                      {tool.logoData ? (
                        <img src={tool.logoData} alt={tool.name} style={toolAdminLogo} />
                      ) : (
                        <span>{tool.icon || "🧩"}</span>
                      )}
                    </div>

                    <div>
                      <strong>{tool.name}</strong>
                      <p style={courseItemText}>{tool.area} · Order {tool.order}</p>
                    </div>

                    <div style={actionRow}>
                      <button onClick={() => editLearningTool(tool)} style={smallButton}>
                        Edit
                      </button>
                      <button onClick={() => deleteLearningTool(tool.id)} style={deleteButton}>
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      )}


      {activeAdminTab === "enrollments" && (
      <section style={wideSection}>
        <div style={sectionHeader}>
          <div>
            <div style={eyebrow}>ENROLLED STUDENTS</div>
            <h2 style={panelTitle}>Paid / Registered Student Access</h2>
          </div>

          <div style={enquiryHeaderActions}>
            <button
              onClick={() => {
                setSelectedEnrollmentCourseId(
                  publishedCourses[0] ? String(publishedCourses[0].id) : ""
                );
                setEnrollmentRows([]);
                setManualStudent(emptyEnrollmentRow);
                setShowEnrollmentForm(true);
              }}
              style={largeActionButton}
            >
              + Enroll Student(s)
            </button>
            <span style={enquiryCount}>{enrollments.length} student(s)</span>
          </div>
        </div>

        {enrollments.length === 0 ? (
          <div style={emptyEnquiry}>
            No students enrolled yet. Use the Enroll Student(s) button above
            after payment is received.
          </div>
        ) : (
          <div style={enquiryTableWrap}>
            <table style={enquiryTable}>
              <thead>
                <tr>
                  <th style={tableHeader}>Student</th>
                  <th style={tableHeader}>Course</th>
                  <th style={tableHeader}>Email</th>
                  <th style={tableHeader}>Phone</th>
                  <th style={tableHeader}>Organisation</th>
                  <th style={tableHeader}>Status</th>
                  <th style={tableHeader}>Enrolled On</th>
                  <th style={tableHeader}>Action</th>
                </tr>
              </thead>

              <tbody>
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id} style={tableRow}>
                    <td style={tableCellStrong}>{enrollment.name}</td>
                    <td style={tableCell}>{enrollment.courseTitle}</td>
                    <td style={tableCell}>{enrollment.email}</td>
                    <td style={tableCell}>{enrollment.phone}</td>
                    <td style={tableCell}>
                      {enrollment.organisation || "Not provided"}
                    </td>
                    <td style={tableCell}>
                      <select
                        value={enrollment.status}
                        onChange={(e) =>
                          updateEnrollment(enrollment.id, {
                            status: e.target.value as EnrollmentStatus,
                          })
                        }
                        style={statusSelect}
                      >
                        {enrollmentStatuses.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td style={tableCell}>{enrollment.enrolledAt}</td>
                    <td style={tableCell}>
                      <button
                        onClick={() => deleteEnrollment(enrollment.id)}
                        style={deleteButton}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>


      )}

      {activeAdminTab === "enquiries" && (
      <section style={wideSection}>
        <div style={sectionHeader}>
          <div><div style={eyebrow}>STUDENT ENQUIRIES & ENROLMENT</div><h2 style={panelTitle}>Register Submissions</h2></div>
          <div style={enquiryHeaderActions}>
            <button onClick={exportEnquiriesCsv} style={exportButton}>Export CSV</button>
            <span style={enquiryCount}>{enquiries.length} enquiry/enquiries</span>
          </div>
        </div>

        {enquiries.length === 0 ? (
          <div style={emptyEnquiry}>No enquiries yet. When a learner clicks Register, the submission will appear here.</div>
        ) : (
          <div style={enquiryTableWrap}>
            <table style={enquiryTable}>
              <thead>
                <tr>
                  <th style={tableHeader}>Name</th><th style={tableHeader}>Course</th><th style={tableHeader}>Email</th><th style={tableHeader}>Phone</th><th style={tableHeader}>Payment Link</th><th style={tableHeader}>Status</th><th style={tableHeader}>Message</th><th style={tableHeader}>Action</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((enquiry) => (
                  <tr key={enquiry.id} style={tableRow}>
                    <td style={tableCellStrong}>{enquiry.name}</td>
                    <td style={tableCell}>{enquiry.courseTitle}</td>
                    <td style={tableCell}>{enquiry.email}</td>
                    <td style={tableCell}>{enquiry.phone}</td>
                    <td style={tableCell}><input value={enquiry.paymentLink} onChange={(e) => updateEnquiry(enquiry.id, { paymentLink: e.target.value })} style={tableInput} placeholder="Paste payment link" /></td>
                    <td style={tableCell}>
                      <select value={enquiry.status} onChange={(e) => updateEnquiry(enquiry.id, { status: e.target.value as EnquiryStatus })} style={statusSelect}>
                        {enquiryStatuses.map((status) => <option key={status}>{status}</option>)}
                      </select>
                    </td>
                    <td style={tableCell}><button onClick={() => setSelectedEnquiry(enquiry)} style={messageLink}>View</button></td>
                    <td style={tableCell}><button onClick={() => deleteEnquiry(enquiry.id)} style={deleteButton}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>


      )}

      {activeAdminTab === "payments" && (
      <section style={wideSection}>
        <div style={sectionHeader}>
          <div>
            <div style={eyebrow}>PAYMENTS / ACCESS STATUS</div>
            <h2 style={panelTitle}>Payment Follow-up</h2>
          </div>
          <span style={enquiryCount}>{enquiries.length} enquiry/enquiries</span>
        </div>

        {enquiries.length === 0 ? (
          <div style={emptyEnquiry}>No payment follow-up records yet. They will appear after students register interest.</div>
        ) : (
          <div style={enquiryTableWrap}>
            <table style={enquiryTable}>
              <thead>
                <tr>
                  <th style={tableHeader}>Name</th>
                  <th style={tableHeader}>Course</th>
                  <th style={tableHeader}>Payment Link</th>
                  <th style={tableHeader}>Payment / Access Status</th>
                  <th style={tableHeader}>Quick Action</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((enquiry) => (
                  <tr key={enquiry.id} style={tableRow}>
                    <td style={tableCellStrong}>{enquiry.name}</td>
                    <td style={tableCell}>{enquiry.courseTitle}</td>
                    <td style={tableCell}>
                      <input
                        value={enquiry.paymentLink}
                        onChange={(e) =>
                          updateEnquiry(enquiry.id, { paymentLink: e.target.value })
                        }
                        style={tableInput}
                        placeholder="Paste payment link"
                      />
                    </td>
                    <td style={tableCell}>
                      <select
                        value={enquiry.status}
                        onChange={(e) =>
                          updateEnquiry(enquiry.id, {
                            status: e.target.value as EnquiryStatus,
                          })
                        }
                        style={statusSelect}
                      >
                        {enquiryStatuses.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td style={tableCell}>
                      <div style={actionRow}>
                        <button
                          onClick={() =>
                            updateEnquiry(enquiry.id, { status: "Payment Link Sent" })
                          }
                          style={smallButton}
                        >
                          Link Sent
                        </button>
                        <button
                          onClick={() =>
                            updateEnquiry(enquiry.id, { status: "Payment Received" })
                          }
                          style={smallButton}
                        >
                          Paid
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      )}

      {selectedEnquiry && (
        <div className="tm3-admin-modal-backdrop" style={modalBackdrop}>
          <div className="tm3-admin-message-modal" style={messageModal}>
            <button onClick={() => setSelectedEnquiry(null)} style={modalCloseButton}>×</button>
            <div style={eyebrow}>ENQUIRY MESSAGE</div>
            <h2 style={modalTitle}>{selectedEnquiry.name}</h2>
            <p style={modalSubTitle}>{selectedEnquiry.courseTitle}</p>
            <div style={modalInfoGrid}>
              <Detail label="Email" value={selectedEnquiry.email} />
              <Detail label="Phone" value={selectedEnquiry.phone} />
              <Detail label="Organisation" value={selectedEnquiry.organisation || "Not provided"} />
              <Detail label="Submitted" value={selectedEnquiry.submittedAt} />
              <Detail label="Status" value={selectedEnquiry.status} />
              <Detail label="Payment Link" value={selectedEnquiry.paymentLink || "Not added"} />
            </div>
            <div style={messageBox}><strong>Message / Requirement</strong><p>{selectedEnquiry.message || "No message was entered."}</p></div>
          </div>
        </div>
      )}
    </main>
  );
}

function normalizeVideo(video: Partial<LearningVideo> & { thumbnailFileId?: string }): LearningVideo {
  return {
    id: video.id || Date.now(),
    title: video.title || "Untitled Learning Video",
    category: video.category || "Geospatial Tools",
    theme: video.theme || video.category || "General",
    description: video.description || "Video description will be updated soon.",
    youtubeUrl: video.youtubeUrl || "",
    thumbnailUrl: normalizePublicAssetPath(video.thumbnailUrl || video.thumbnailFileId || "") || defaultImage,
    level: video.level || "Open",
    status: video.status === "Draft" ? "Draft" : "Published",
  };
}

function normalizeEvent(item: Partial<AcademyEvent> & { imageFileId?: string }, kind: string): AcademyEvent {
  const rawStatus = item.status || "Upcoming";

  return {
    id: item.id || Date.now(),
    title: item.title || `${kind} Title`,
    category: item.category || "Professional Practice",
    theme: item.theme || item.category || "General",
    description: item.description || "Details will be updated soon.",
    date: item.date || "",
    time: item.time || "",
    mode: item.mode || "Online",
    resourcePerson: item.resourcePerson || "TerraMatrix Faculty",
    instructorIds: Array.isArray(item.instructorIds) ? item.instructorIds : [],
    fee: item.fee || "Free",
    certification: "Participation Certificate",
    recordingLink: item.recordingLink || "",
    imageUrl: normalizePublicAssetPath(item.imageUrl || item.imageFileId || "") || defaultImage,
    status:
      rawStatus === "Draft" || rawStatus === "Completed" ? rawStatus : "Upcoming",
  };
}

function loadVideoItems() {
  try {
    const saved = localStorage.getItem("terramatrix_learning_videos");

    if (!saved) {
      const sampleItems = sampleLearningVideos.map(normalizeVideo);
      localStorage.setItem("terramatrix_learning_videos", JSON.stringify(sampleItems));
      return sampleItems;
    }

    const parsed = JSON.parse(saved) as Partial<LearningVideo>[];

    if (!Array.isArray(parsed) || parsed.length === 0) {
      const sampleItems = sampleLearningVideos.map(normalizeVideo);
      localStorage.setItem("terramatrix_learning_videos", JSON.stringify(sampleItems));
      return sampleItems;
    }

    return parsed.map(normalizeVideo);
  } catch {
    const sampleItems = sampleLearningVideos.map(normalizeVideo);
    localStorage.setItem("terramatrix_learning_videos", JSON.stringify(sampleItems));
    return sampleItems;
  }
}

function getSampleEventItems(kind: string): AcademyEvent[] {
  const sample: Partial<AcademyEvent> =
    kind === "Webinar"
      ? {
          id: 1,
          title: "Geospatial Tools for Civil Engineering Practice",
          category: "Geospatial Tools",
          theme: "QGIS and Field Mapping",
          description:
            "A focused webinar introducing how geospatial tools can support site analysis, documentation and engineering decision-making.",
          date: "2026-07-20",
          time: "18:00",
          mode: "Online",
          resourcePerson: "TerraMatrix Faculty",
          instructorIds: [1],
          fee: "Free",
          certification: "Participation Certificate",
          recordingLink: "",
          imageUrl: defaultImage,
          status: "Upcoming",
        }
      : {
          id: 1,
          title: "Hands-on QGIS Mapping Workshop",
          category: "Geospatial Tools",
          theme: "QGIS",
          description:
            "A guided workshop on map preparation, layer handling, basic spatial interpretation and project-oriented documentation.",
          date: "2026-07-27",
          time: "10:00",
          mode: "Online",
          resourcePerson: "TerraMatrix Faculty",
          instructorIds: [1],
          fee: "To be announced",
          certification: "Participation Certificate",
          recordingLink: "",
          imageUrl: defaultImage,
          status: "Upcoming",
        };

  return [normalizeEvent(sample, kind)];
}

function loadEventItems(storageKey: string, kind: string) {
  try {
    const saved = localStorage.getItem(storageKey);

    if (!saved) {
      const sampleItems = getSampleEventItems(kind);
      localStorage.setItem(storageKey, JSON.stringify(sampleItems));
      return sampleItems;
    }

    const parsed = JSON.parse(saved) as Partial<AcademyEvent>[];

    if (!Array.isArray(parsed) || parsed.length === 0) {
      const sampleItems = getSampleEventItems(kind);
      localStorage.setItem(storageKey, JSON.stringify(sampleItems));
      return sampleItems;
    }

    return parsed.map((item) => normalizeEvent(item, kind));
  } catch {
    const sampleItems = getSampleEventItems(kind);
    localStorage.setItem(storageKey, JSON.stringify(sampleItems));
    return sampleItems;
  }
}

function TaxonomyAdminPanel({
  mode,
  onCategoryRenamed,
  onLevelRenamed,
  onThemeRenamed,
}: {
  mode: TaxonomyMode;
  onCategoryRenamed?: (oldCategory: string, newCategory: string) => void;
  onLevelRenamed?: (oldLevel: string, newLevel: string) => void;
  onThemeRenamed?: (oldTheme: string, newTheme: string) => void;
}) {
  const [taxonomy, setTaxonomy] = useState<TaxonomySettings>(loadTaxonomySettings);
  const [selectedCategory, setSelectedCategory] = useState(
    taxonomy.categories[0] || taxonomyCategoryOptions[0]
  );
  const [newValue, setNewValue] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const isLevels = mode === "levels";
  const isCategories = mode === "categories";
  const list =
    mode === "levels"
      ? taxonomy.levels
      : mode === "categories"
        ? taxonomy.categories
        : taxonomy.themesByCategory[selectedCategory] || [];

  const title =
    mode === "levels"
      ? "Levels"
      : mode === "categories"
        ? "Categories"
        : "Themes";

  const resetEditing = () => {
    setEditingIndex(null);
    setEditingValue("");
  };

  const updateTaxonomy = (updated: TaxonomySettings) => {
    const normalized = saveTaxonomySettings(updated);
    setTaxonomy(normalized);

    if (!normalized.categories.includes(selectedCategory)) {
      setSelectedCategory(normalized.categories[0] || taxonomyCategoryOptions[0]);
    }
  };

  const addValue = () => {
    const clean = newValue.trim();

    if (!clean) {
      alert(`Please enter a ${title.toLowerCase().replace(/s$/, "")}.`);
      return;
    }

    if (isLevels) {
      updateTaxonomy({ ...taxonomy, levels: uniqueCategoryList([...taxonomy.levels, clean]) });
    } else if (isCategories) {
      updateTaxonomy({
        ...taxonomy,
        categories: uniqueCategoryList([...taxonomy.categories, clean]),
        themesByCategory: {
          ...taxonomy.themesByCategory,
          [clean]: taxonomy.themesByCategory[clean] || ["General"],
        },
      });
      setSelectedCategory(clean);
    } else {
      updateTaxonomy({
        ...taxonomy,
        themesByCategory: {
          ...taxonomy.themesByCategory,
          [selectedCategory]: uniqueCategoryList([
            ...(taxonomy.themesByCategory[selectedCategory] || []),
            clean,
          ]),
        },
      });
    }

    setNewValue("");
    resetEditing();
  };

  const startEdit = (index: number, value: string) => {
    setEditingIndex(index);
    setEditingValue(value);
  };

  const saveEdit = (index: number) => {
    const clean = editingValue.trim();
    const oldValue = list[index] || "";

    if (!clean) {
      alert(`${title.replace(/s$/, "")} cannot be empty.`);
      return;
    }

    if (clean === oldValue) {
      resetEditing();
      return;
    }

    if (isLevels) {
      const updatedLevels = [...taxonomy.levels];
      updatedLevels[index] = clean;
      updateTaxonomy({ ...taxonomy, levels: uniqueCategoryList(updatedLevels) });
      updateStoredLevelReferences(oldValue, clean);
      onLevelRenamed?.(oldValue, clean);
    } else if (isCategories) {
      const updatedCategories = [...taxonomy.categories];
      updatedCategories[index] = clean;

      const updatedThemes = { ...taxonomy.themesByCategory };
      updatedThemes[clean] = uniqueCategoryList([
        ...(updatedThemes[oldValue] || []),
        ...(taxonomyThemeDefaults[clean] || []),
      ]);
      delete updatedThemes[oldValue];

      updateTaxonomy({
        ...taxonomy,
        categories: uniqueCategoryList(updatedCategories),
        themesByCategory: updatedThemes,
      });
      updateStoredCategoryReferences("courses", oldValue, clean);
      onCategoryRenamed?.(oldValue, clean);
      setSelectedCategory(clean);
    } else {
      const updatedThemes = [...(taxonomy.themesByCategory[selectedCategory] || [])];
      updatedThemes[index] = clean;
      updateTaxonomy({
        ...taxonomy,
        themesByCategory: {
          ...taxonomy.themesByCategory,
          [selectedCategory]: uniqueCategoryList(updatedThemes),
        },
      });
      updateStoredThemeReferences(oldValue, clean);
      onThemeRenamed?.(oldValue, clean);
    }

    resetEditing();
  };

  const deleteValue = (index: number) => {
    if (isLevels) {
      updateTaxonomy({
        ...taxonomy,
        levels: taxonomy.levels.filter((_, currentIndex) => currentIndex !== index),
      });
    } else if (isCategories) {
      const categoryToRemove = taxonomy.categories[index];
      const updatedCategories = taxonomy.categories.filter(
        (_, currentIndex) => currentIndex !== index
      );
      const updatedThemes = { ...taxonomy.themesByCategory };
      delete updatedThemes[categoryToRemove];

      updateTaxonomy({
        ...taxonomy,
        categories: updatedCategories,
        themesByCategory: updatedThemes,
      });
    } else {
      updateTaxonomy({
        ...taxonomy,
        themesByCategory: {
          ...taxonomy.themesByCategory,
          [selectedCategory]: (taxonomy.themesByCategory[selectedCategory] || []).filter(
            (_, currentIndex) => currentIndex !== index
          ),
        },
      });
    }

    resetEditing();
  };

  return (
    <section style={wideSection}>
      <div style={sectionHeader}>
        <div>
          <div style={eyebrow}>LEARNING SETUP</div>
          <h2 style={panelTitle}>{title}</h2>
        </div>
        <span style={enquiryCount}>{list.length} item(s)</span>
      </div>

      <div style={taxonomySinglePanel}>
        <div style={contentFormCard}>
          {mode === "themes" && (
            <Field label="Category for Themes">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  resetEditing();
                }}
                style={inputStyle}
              >
                {taxonomy.categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </Field>
          )}

          <h3 style={miniPanelTitle}>
            {mode === "themes" ? `${selectedCategory} Themes` : title}
          </h3>

          <div style={categoryAddRow}>
            <input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              style={inputStyle}
              placeholder={`Add new ${mode === "themes" ? "theme / topic" : title.toLowerCase().replace(/s$/, "")}`}
            />
            <button type="button" onClick={addValue} style={primaryButton}>
              Add
            </button>
          </div>

          <div style={categoryRows}>
            {list.map((value, index) => {
              const isEditing = editingIndex === index;

              return (
                <div key={`${mode}-${index}-${value}`} style={categoryRow}>
                  <input
                    value={isEditing ? editingValue : value}
                    onChange={(e) => setEditingValue(e.target.value)}
                    readOnly={!isEditing}
                    style={{
                      ...inputStyle,
                      background: isEditing ? "#FFFFFF" : "#FBFAF6",
                      cursor: isEditing ? "text" : "default",
                    }}
                  />

                  <div style={categoryActionRow}>
                    {isEditing ? (
                      <>
                        <button type="button" onClick={() => saveEdit(index)} style={smallButton}>
                          Save
                        </button>
                        <button type="button" onClick={resetEditing} style={smallButton}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button type="button" onClick={() => startEdit(index, value)} style={smallButton}>
                        Edit
                      </button>
                    )}

                    <button type="button" onClick={() => deleteValue(index)} style={deleteButton}>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function LearningVideoAdminPanel() {
  const [videos, setVideos] = useState<LearningVideo[]>(loadVideoItems);
  const [form, setForm] = useState<LearningVideoForm>(emptyLearningVideoForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const saveVideos = (updated: LearningVideo[]) => {
    setVideos(updated);
    localStorage.setItem("terramatrix_learning_videos", JSON.stringify(updated));
  };

  const resetForm = () => {
    setForm(emptyLearningVideoForm);
    setEditId(null);
  };

  const createOrUpdateVideo = async () => {
    if (!form.title.trim()) {
      alert("Please enter the video title.");
      return;
    }

    if (!form.youtubeUrl.trim()) {
      alert("Please paste the YouTube unlisted video link.");
      return;
    }

    const videoData: LearningVideo = normalizeVideo({
      ...form,
      id: editId || Date.now(),
      title: form.title.trim(),
      theme: form.theme || form.category,
    });

    setSaving(true);
    try {
      const saved = normalizeVideo(
        await saveAdminMediaRecord("Learning_Videos", videoData as unknown as Record<string, unknown>)
      );
      if (editId) {
        saveVideos(videos.map((video) => (video.id === editId ? saved : video)));
      } else {
        saveVideos([saved, ...videos]);
      }
      resetForm();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not save the learning video.");
    } finally {
      setSaving(false);
    }
  };

  const editVideo = (video: LearningVideo) => {
    setEditId(video.id);
    setForm({
      title: video.title,
      category: video.category,
      theme: video.theme,
      description: video.description,
      youtubeUrl: video.youtubeUrl,
      thumbnailUrl: video.thumbnailUrl,
      level: video.level,
      status: video.status,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteVideo = async (id: number) => {
    if (!window.confirm("Delete this learning video?")) return;
    try {
      await deleteAdminMediaRecord("Learning_Videos", id);
      saveVideos(videos.filter((video) => video.id !== id));
      if (editId === id) resetForm();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not delete the learning video.");
    }
  };

  return (
    <section style={wideSection}>
      <div style={sectionHeader}>
        <div>
          <div style={eyebrow}>LEARNING VIDEO MANAGEMENT</div>
          <h2 style={panelTitle}>Learning Videos</h2>
          <p style={sectionNote}>
            Add YouTube unlisted videos. Published videos appear on the public
            Learning Videos page.
          </p>
        </div>
        <span style={enquiryCount}>{videos.length} video(s)</span>
      </div>

      <div style={contentAdminLayout}>
        <div style={contentFormCard}>
          <h3 style={miniPanelTitle}>
            {editId ? "Edit Learning Video" : "Add Learning Video"}
          </h3>

          <Field label="Video Title">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={inputStyle}
              placeholder="Example: Introduction to QGIS"
            />
          </Field>

          <div style={twoColumn}>
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => {
                  const category = e.target.value;
                  setForm({
                    ...form,
                    category,
                    theme: getDefaultThemeForCategory(category),
                  });
                }}
                style={inputStyle}
              >
                {getManagedCategoryOptions("videos", form.category).map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </Field>

            <Field label="Theme / Topic">
              <select
                value={form.theme}
                onChange={(e) => setForm({ ...form, theme: e.target.value })}
                style={inputStyle}
              >
                {getManagedThemeOptions(form.category, form.theme).map((theme) => (
                  <option key={theme}>{theme}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Level">
            <select
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              style={inputStyle}
            >
              {getManagedLevelOptions(form.level).map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
          </Field>

          <Field label="YouTube Unlisted Link">
            <input
              value={form.youtubeUrl}
              onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
              style={inputStyle}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </Field>

          <UploadField
            label="Video thumbnail"
            description="JPG, PNG or WebP · maximum 5 MB"
            accept="image/jpeg,image/png,image/webp"
            kind="image"
            value={form.thumbnailUrl}
            fileName={getFileNameFromPath(form.thumbnailUrl || "", "video-thumbnail")}
            onSelect={(file) =>
              readUploadFile(file, "image", (dataUrl) =>
                setForm({ ...form, thumbnailUrl: dataUrl })
              )
            }
            onRemove={() => setForm({ ...form, thumbnailUrl: defaultImage })}
          />

          <Field label="Short Description">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={textareaStyle}
              placeholder="Briefly explain what the video covers."
            />
          </Field>

          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as ContentStatus })
              }
              style={inputStyle}
            >
              <option>Published</option>
              <option>Draft</option>
            </select>
          </Field>

          <div style={buttonRow}>
            <button onClick={() => void createOrUpdateVideo()} style={primaryButton} disabled={saving}>
              {saving ? "Saving…" : editId ? "Update Video" : "Save Video"}
            </button>
            {editId && (
              <button type="button" onClick={resetForm} style={plainButton}>
                Cancel Edit
              </button>
            )}
          </div>
        </div>

        <ContentList
          emptyText="No learning videos added yet."
          items={videos.map((video) => ({
            id: video.id,
            title: video.title,
            meta: `${video.category} · ${video.theme || "General"} · ${video.status}`,
            description: video.description,
            onEdit: () => editVideo(video),
            onDelete: () => void deleteVideo(video.id),
          }))}
        />
      </div>
    </section>
  );
}

function AcademyEventAdminPanel({
  kind,
  storageKey,
  eyebrowLabel,
  titleLabel,
  instructors,
}: {
  kind: "Webinar" | "Workshop";
  storageKey: string;
  eyebrowLabel: string;
  titleLabel: string;
  instructors: Instructor[];
}) {
  const [items, setItems] = useState<AcademyEvent[]>(() =>
    loadEventItems(storageKey, kind)
  );
  const [form, setForm] = useState<AcademyEventForm>({
    ...emptyAcademyEventForm,
    status: "Upcoming",
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const formAnchorId = `${kind.toLowerCase()}-admin-form`;
  const mediaTableName = kind === "Webinar" ? "Webinars" : "Workshops";

  const saveItems = (updated: AcademyEvent[]) => {
    setItems(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const resetForm = () => {
    setForm({ ...emptyAcademyEventForm, status: "Upcoming" });
    setEditId(null);
  };

  const getLinkedInstructorNames = (instructorIds: number[]) =>
    instructors
      .filter((instructor) => instructorIds.includes(instructor.id))
      .map((instructor) => instructor.name);

  const toggleEventInstructorSelection = (id: number) => {
    setForm((current) => ({
      ...current,
      instructorIds: current.instructorIds.includes(id)
        ? current.instructorIds.filter((instructorId) => instructorId !== id)
        : [...current.instructorIds, id],
    }));
  };

  const createOrUpdateItem = async () => {
    if (!form.title.trim()) {
      alert(`Please enter the ${kind.toLowerCase()} title.`);
      return;
    }

    const linkedInstructorNames = getLinkedInstructorNames(form.instructorIds);

    const eventData = normalizeEvent(
      {
        ...form,
        id: editId || Date.now(),
        title: form.title.trim(),
        theme: form.theme || form.category,
        resourcePerson:
          linkedInstructorNames.join(", ") || form.resourcePerson || "TerraMatrix Faculty",
      },
      kind
    );

    setSaving(true);
    try {
      const saved = normalizeEvent(
        await saveAdminMediaRecord(mediaTableName, eventData as unknown as Record<string, unknown>),
        kind
      );
      if (editId) {
        saveItems(items.map((item) => (item.id === editId ? saved : item)));
      } else {
        saveItems([saved, ...items]);
      }
      resetForm();
    } catch (error) {
      alert(error instanceof Error ? error.message : `Could not save the ${kind.toLowerCase()}.`);
    } finally {
      setSaving(false);
    }
  };

  const editItem = (item: AcademyEvent) => {
    setEditId(item.id);
    setForm({
      title: item.title,
      category: item.category,
      theme: item.theme,
      description: item.description,
      date: item.date,
      time: item.time,
      mode: item.mode,
      resourcePerson: item.resourcePerson,
      instructorIds: Array.isArray(item.instructorIds) ? item.instructorIds : [],
      fee: item.fee,
      certification: "Participation Certificate",
      recordingLink: item.recordingLink || "",
      imageUrl: item.imageUrl,
      status: item.status,
    });

    setTimeout(() => {
      document
        .getElementById(formAnchorId)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const moveItemStatus = async (item: AcademyEvent, status: EventStatus) => {
    const updatedItem = normalizeEvent({ ...item, status }, kind);
    try {
      const saved = normalizeEvent(
        await saveAdminMediaRecord(mediaTableName, updatedItem as unknown as Record<string, unknown>),
        kind
      );
      saveItems(items.map((current) => (current.id === item.id ? saved : current)));
      if (editId === item.id) setForm((current) => ({ ...current, status }));
    } catch (error) {
      alert(error instanceof Error ? error.message : `Could not update the ${kind.toLowerCase()}.`);
    }
  };

  const deleteItem = async (id: number) => {
    if (!window.confirm(`Delete this ${kind.toLowerCase()}?`)) return;
    try {
      await deleteAdminMediaRecord(mediaTableName, id);
      saveItems(items.filter((item) => item.id !== id));
      if (editId === id) resetForm();
    } catch (error) {
      alert(error instanceof Error ? error.message : `Could not delete the ${kind.toLowerCase()}.`);
    }
  };

  const upcomingItems = items.filter((item) => item.status === "Upcoming");
  const completedItems = items.filter((item) => item.status === "Completed");
  const draftItems = items.filter((item) => item.status === "Draft");
  const upcomingCount = upcomingItems.length;
  const completedCount = completedItems.length;

  return (
    <section style={wideSection}>
      <div style={sectionHeader}>
        <div>
          <div style={eyebrow}>{eyebrowLabel}</div>
          <h2 style={panelTitle}>{titleLabel}</h2>
          <p style={sectionNote}>
            Add categories, topics and registration-facing details for public
            {` ${titleLabel.toLowerCase()}`}.
          </p>
        </div>
        <div style={eventStatusSummary}>
          <div style={eventStatusPill}>
            <strong>{upcomingCount}</strong>
            <span>Upcoming</span>
          </div>
          <div style={eventStatusPill}>
            <strong>{completedCount}</strong>
            <span>Completed</span>
          </div>
        </div>
      </div>

      <div style={contentAdminLayout}>
        <div style={contentFormCard}>
          <h3 style={miniPanelTitle}>
            {editId ? `Edit ${kind}` : `Add ${kind}`}
          </h3>

          <Field label={`${kind} Title`}>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={inputStyle}
              placeholder={`${kind} title`}
            />
          </Field>

          <div style={twoColumn}>
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => {
                  const category = e.target.value;
                  setForm({
                    ...form,
                    category,
                    theme: getDefaultThemeForCategory(category),
                  });
                }}
                style={inputStyle}
              >
                {getManagedCategoryOptions(kind === "Webinar" ? "webinars" : "workshops", form.category).map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </Field>

            <Field label="Theme / Topic">
              <select
                value={form.theme}
                onChange={(e) => setForm({ ...form, theme: e.target.value })}
                style={inputStyle}
              >
                {getManagedThemeOptions(form.category, form.theme).map((theme) => (
                  <option key={theme}>{theme}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Short Description">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={textareaStyle}
              placeholder={`Briefly describe the ${kind.toLowerCase()}.`}
            />
          </Field>

          <div style={twoColumn}>
            <Field label="Date">
              <input
                type="date"
                value={getDateInputValue(form.date)}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                style={inputStyle}
              />
            </Field>

            <Field label="Time">
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                style={inputStyle}
              />
            </Field>
          </div>

          <div style={twoColumn}>
            <Field label="Mode">
              <select
                value={form.mode}
                onChange={(e) => setForm({ ...form, mode: e.target.value })}
                style={inputStyle}
              >
                <option>Online</option>
                <option>Offline</option>
                <option>Hybrid</option>
              </select>
            </Field>

            <Field label="Fee">
              <input
                value={form.fee}
                onChange={(e) => setForm({ ...form, fee: e.target.value })}
                style={inputStyle}
                placeholder="Free / 500 / To be announced"
              />
            </Field>
          </div>

          <Field label="Link Instructor(s)">
            <div style={checkList}>
              {instructors.map((instructor) => (
                <label key={instructor.id} style={checkItem}>
                  <input
                    type="checkbox"
                    checked={form.instructorIds.includes(instructor.id)}
                    onChange={() => toggleEventInstructorSelection(instructor.id)}
                  />
                  <span style={checkNameOnly}>{instructor.name}</span>
                </label>
              ))}
            </div>
            <p style={helperText}>
              The selected instructor(s) will appear on the public {kind.toLowerCase()} page.
            </p>
          </Field>

          <div style={twoColumn}>
            <Field label="Certification">
              <div style={fixedValueBox}>Participation Certificate</div>
            </Field>

            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as EventStatus })
                }
                style={inputStyle}
              >
                <option>Upcoming</option>
                <option>Completed</option>
                <option>Draft</option>
              </select>
            </Field>
          </div>

          <Field label="Recording Link">
            <input
              value={form.recordingLink}
              onChange={(e) => setForm({ ...form, recordingLink: e.target.value })}
              style={inputStyle}
              placeholder="Paste recording link for completed webinar/workshop"
            />
            <p style={helperText}>Use this after the session is completed.</p>
          </Field>

          <UploadField
            label={`${kind} banner`}
            description="JPG, PNG or WebP · maximum 5 MB"
            accept="image/jpeg,image/png,image/webp"
            kind="image"
            value={form.imageUrl}
            fileName={getFileNameFromPath(form.imageUrl || "", `${kind.toLowerCase()}-banner`)}
            onSelect={(file) =>
              readUploadFile(file, "image", (dataUrl) =>
                setForm({ ...form, imageUrl: dataUrl })
              )
            }
            onRemove={() => setForm({ ...form, imageUrl: defaultImage })}
          />

          <div style={buttonRow}>
            <button type="button" onClick={() => void createOrUpdateItem()} style={primaryButton} disabled={saving}>
              {saving ? "Saving…" : editId ? `Update ${kind}` : `Save ${kind}`}
            </button>
            {editId && (
              <button onClick={resetForm} style={plainButton}>
                Cancel Edit
              </button>
            )}
          </div>
        </div>

        <div style={eventListStack}>
          <EventItemList
            title="Upcoming"
            emptyText={`No upcoming ${titleLabel.toLowerCase()} added yet.`}
            items={upcomingItems}
            onEdit={editItem}
            onDelete={(id) => void deleteItem(id)}
            onStatusChange={(item, status) => void moveItemStatus(item, status)}
          />

          <EventItemList
            title="Completed"
            emptyText={`No completed ${titleLabel.toLowerCase()} added yet.`}
            items={completedItems}
            onEdit={editItem}
            onDelete={(id) => void deleteItem(id)}
            onStatusChange={(item, status) => void moveItemStatus(item, status)}
          />

          {draftItems.length > 0 && (
            <EventItemList
              title="Draft"
              emptyText=""
              items={draftItems}
              onEdit={editItem}
              onDelete={(id) => void deleteItem(id)}
              onStatusChange={(item, status) => void moveItemStatus(item, status)}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function normalizeEventRegistration(item: Partial<EventRegistration>): EventRegistration {
  const kind =
    item.kind === "Workshop" ? "Workshop" : item.kind === "Course" ? "Course" : "Webinar";
  const rawStatus = String(item.status || "Registered");
  const cleanStatus = rawStatus;

  return {
    id: item.id || Date.now(),
    kind,
    eventId: item.eventId || 0,
    eventTitle: item.eventTitle || `${kind} Title`,
    category: item.category || "General",
    theme: item.theme || "General",
    date: item.date || "",
    time: item.time || "",
    mode: item.mode || "Online",
    certification: "Participation Certificate",
    paymentOption: item.paymentOption || "Payment details requested",
    paymentStatus: item.paymentStatus || "Pending",
    paymentReference: item.paymentReference || "",
    paymentNote: item.paymentNote || "",
    name: item.name || "Learner",
    email: item.email || "",
    phone: item.phone || "",
    organisation: item.organisation || "",
    message: item.message || "",
    submittedAt: item.submittedAt || "",
    status:
      cleanStatus === "Confirmed" ||
      cleanStatus === "Attended" ||
      cleanStatus === "Certificate Issued"
        ? cleanStatus
        : "Registered",
  };
}

function loadEventRegistered() {
  try {
    const saved = localStorage.getItem("terramatrix_event_registrations");
    if (!saved) return [] as EventRegistration[];
    return (JSON.parse(saved) as Partial<EventRegistration>[]).map(
      normalizeEventRegistration
    );
  } catch {
    return [] as EventRegistration[];
  }
}

function EventRegistrationAdminPanel() {
  const [registrations, setRegistered] = useState<EventRegistration[]>(
    loadEventRegistered
  );

  const saveRegistered = (updated: EventRegistration[]) => {
    const previous = registrations;
    setRegistered(updated);
    localStorage.setItem("terramatrix_event_registrations", JSON.stringify(updated));

    const deletedIds = previous
      .filter((item) => !updated.some((next) => next.id === item.id))
      .map((item) => item.id);

    void Promise.all([
      ...updated.map((item) =>
        saveAdminRecord("Event_Registrations", item as unknown as Record<string, unknown>)
      ),
      ...deletedIds.map((id) => deleteAdminRecord("Event_Registrations", id)),
    ]).catch((error) => {
      console.error("Could not update registrations.", error);
      alert(error instanceof Error ? error.message : "Could not update registrations.");
    });
  };

  const updateRegistration = (
    id: number,
    patch: Partial<EventRegistration>
  ) => {
    saveRegistered(
      registrations.map((item) =>
        item.id === id ? normalizeEventRegistration({ ...item, ...patch }) : item
      )
    );
  };

  const deleteRegistration = (id: number) => {
    saveRegistered(registrations.filter((item) => item.id !== id));
  };

  const exportRegisteredCsv = () => {
    const header = [
      "Type",
      "Programme",
      "Name",
      "Email",
      "Phone",
      "Organisation",
      "Registration Status",
      "Payment Option",
      "Payment Status",
      "Payment Reference",
      "Payment Note",
      "Date",
      "Time",
      "Submitted",
      "Message",
    ];

    const rows = registrations.map((item) => [
      item.kind,
      item.eventTitle,
      item.name,
      item.email,
      item.phone,
      item.organisation,
      item.status,
      item.paymentOption,
      item.paymentStatus,
      item.paymentReference,
      item.paymentNote,
      item.date,
      item.time,
      item.submittedAt,
      item.message,
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map(csvEscape).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "terramatrix-registered-learners.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section style={wideSection}>
      <div style={sectionHeader}>
        <div>
          <div style={eyebrow}>REGISTERED LEARNERS</div>
          <h2 style={panelTitle}>Registered</h2>
          <p style={sectionNote}>
            Course, webinar and workshop registrations submitted from public pages
            appear here.
          </p>
        </div>

        <div style={enquiryHeaderActions}>
          <button onClick={exportRegisteredCsv} style={exportButton}>
            Export CSV
          </button>
          <span style={enquiryCount}>{registrations.length} registered</span>
        </div>
      </div>

      {registrations.length === 0 ? (
        <div style={emptyEnquiry}>
          No registrations yet.
        </div>
      ) : (
        <div style={enquiryTableWrap}>
          <table style={enquiryTable}>
            <thead>
              <tr>
                <th style={tableHeader}>Type</th>
                <th style={tableHeader}>Programme</th>
                <th style={tableHeader}>Student</th>
                <th style={tableHeader}>Contact</th>
                <th style={tableHeader}>Schedule</th>
                <th style={tableHeader}>Payment</th>
                <th style={tableHeader}>Status</th>
                <th style={tableHeader}>Action</th>
              </tr>
            </thead>

            <tbody>
              {registrations.map((item) => (
                <tr key={item.id} style={tableRow}>
                  <td style={tableCellStrong}>{item.kind}</td>
                  <td style={tableCell}>
                    <strong>{item.eventTitle}</strong>
                    <br />
                    <span>{item.category} · {item.theme}</span>
                  </td>
                  <td style={tableCell}>
                    <strong>{item.name}</strong>
                    <br />
                    <span>{item.organisation || "Organisation not added"}</span>
                    {item.message && (
                      <>
                        <br />
                        <span>{item.message}</span>
                      </>
                    )}
                  </td>
                  <td style={tableCell}>
                    {item.email}
                    <br />
                    {item.phone}
                  </td>
                  <td style={tableCell}>
                    {item.date || "Date TBA"} {item.time || ""}
                    <br />
                    <span>{item.mode}</span>
                  </td>
                  <td style={tableCell}>
                    <strong>{item.paymentOption}</strong>
                    <br />
                    <select
                      value={item.paymentStatus}
                      onChange={(e) =>
                        updateRegistration(item.id, {
                          paymentStatus: e.target.value,
                        })
                      }
                      style={statusSelect}
                    >
                      <option>Pending</option>
                      <option>Payment Received</option>
                      <option>Not Applicable</option>
                      <option>Refunded</option>
                    </select>
                    {item.paymentReference && (
                      <>
                        <br />
                        <span>Ref: {item.paymentReference}</span>
                      </>
                    )}
                    {item.paymentNote && (
                      <>
                        <br />
                        <span>{item.paymentNote}</span>
                      </>
                    )}
                  </td>
                  <td style={tableCell}>
                    <select
                      value={item.status}
                      onChange={(e) =>
                        updateRegistration(item.id, {
                          status: e.target.value as EventRegistrationStatus,
                        })
                      }
                      style={statusSelect}
                    >
                      <option>Registered</option>
                      <option>Confirmed</option>
                      <option>Attended</option>
                      <option>Certificate Issued</option>
                    </select>
                  </td>
                  <td style={tableCell}>
                    <button
                      onClick={() => deleteRegistration(item.id)}
                      style={deleteButton}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function EventItemList({
  title,
  items,
  emptyText,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  title: string;
  items: AcademyEvent[];
  emptyText: string;
  onEdit: (item: AcademyEvent) => void;
  onDelete: (id: number) => void;
  onStatusChange: (item: AcademyEvent, status: EventStatus) => void;
}) {
  return (
    <div style={eventListCard}>
      <div style={eventListHeader}>
        <h3 style={eventListTitle}>{title}</h3>
        <span style={eventListCount}>{items.length}</span>
      </div>

      {items.length === 0 ? (
        <div style={eventListEmpty}>{emptyText}</div>
      ) : (
        <div style={eventListItems}>
          {items.map((item) => (
            <article key={item.id} style={eventListItem}>
              <div>
                <strong style={contentItemTitle}>{item.title}</strong>
                <p style={contentItemMeta}>
                  {item.category} · {item.theme || "General"}
                </p>
                <p style={contentItemText}>
                  {item.date || "Date TBA"} {item.time || ""} · {item.mode} · Participation Certificate
                  {item.recordingLink ? " · Recording added" : ""}
                </p>
                <p style={contentItemText}>
                  Instructor(s): {item.resourcePerson || "TerraMatrix Faculty"}
                </p>
              </div>

              <div style={eventActionRow}>
                <div style={eventActionLeft}>
                  {item.status === "Completed" ? (
                    <button
                      type="button"
                      onClick={() => onStatusChange(item, "Upcoming")}
                      style={statusMoveButton}
                    >
                      Move to Upcoming
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onStatusChange(item, "Completed")}
                      style={statusMoveButton}
                    >
                      Move to Completed
                    </button>
                  )}
                </div>

                <div style={eventActionRight}>
                  <button type="button" onClick={() => onEdit(item)} style={smallButton}>
                    Edit
                  </button>

                  <button type="button" onClick={() => onDelete(item.id)} style={deleteButton}>
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function ContentList({
  items,
  emptyText,
}: {
  emptyText: string;
  items: {
    id: number;
    title: string;
    meta: string;
    description: string;
    onEdit: () => void;
    onDelete: () => void;
  }[];
}) {
  if (items.length === 0) {
    return <div style={emptyState}>{emptyText}</div>;
  }

  return (
    <div style={contentListCard}>
      {items.map((item) => (
        <article key={item.id} style={contentListItem}>
          <div>
            <strong style={contentItemTitle}>{item.title}</strong>
            <p style={contentItemMeta}>{item.meta}</p>
            <p style={contentItemText}>{item.description}</p>
          </div>

          <div style={actionRow}>
            <button onClick={item.onEdit} style={smallButton}>
              Edit
            </button>
            <button onClick={item.onDelete} style={deleteButton}>
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label style={fieldBlock}><span>{label}</span>{children}</label>;
}

function UploadField({
  label,
  description,
  accept,
  kind,
  value,
  fileName,
  onSelect,
  onRemove,
  compactImage = false,
}: {
  label: string;
  description: string;
  accept: string;
  kind: "image" | "pdf";
  value: string;
  fileName: string;
  onSelect: (file: File | undefined) => void;
  onRemove: () => void;
  compactImage?: boolean;
}) {
  const hasFile = Boolean(value && value !== defaultImage);
  const Icon = kind === "image" ? ImagePlus : FileText;

  return (
    <div className="tm-admin-upload-card" style={uploadCard}>
      <div style={uploadCardPreview}>
        {kind === "image" && hasFile ? (
          <img
            src={value}
            alt={`${label} preview`}
            style={compactImage ? uploadPortraitPreview : uploadImagePreview}
          />
        ) : (
          <span style={uploadIconBox}><Icon size={24} /></span>
        )}
      </div>

      <div style={uploadCardContent}>
        <div>
          <strong style={uploadCardTitle}>{label}</strong>
          <p style={uploadCardDescription}>{description}</p>
          {hasFile && <span style={uploadFileName}>{fileName}</span>}
        </div>

        <div style={uploadActions}>
          <label style={uploadButton}>
            <UploadCloud size={15} /> {hasFile ? "Replace" : "Choose file"}
            <input
              type="file"
              accept={accept}
              onChange={(event) => {
                onSelect(event.target.files?.[0]);
                event.currentTarget.value = "";
              }}
              style={hiddenFileInput}
            />
          </label>
          {hasFile && (
            <button type="button" onClick={onRemove} style={uploadRemoveButton}>
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryBox({ label, value }: { label: string; value: number }) {
  return <div style={summaryBox}><strong>{value}</strong><span>{label}</span></div>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div style={detailBox}>
      <span style={detailLabel}>{label}</span>
      <strong style={detailValue}>{value || "Not provided"}</strong>
    </div>
  );
}

function formatInstructorExpertise(value: string) {
  return value
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const lower = item.toLowerCase();
      if (lower === "hec-ras") return "RAS";
      if (lower === "hec-hms") return "HMS";
      return item;
    })
    .join(", ");
}

function parseOutcomeItems(value: string) {
  return String(value || "")
    .split(/\r?\n|;/)
    .map((item) =>
      item
        .replace(/^\s*(?:\d+[.)-]?|[-•])\s*/, "")
        .trim()
    )
    .filter(Boolean)
    .filter((item) => {
      const lower = item.toLowerCase();
      return (
        lower !== "learning outcomes will be updated soon." &&
        lower !== "by the end of this programme, students will be able to:" &&
        lower !== "by the end of this program, students will be able to:"
      );
    })
    .slice(0, 5);
}

function buildOutcomeText(form: CourseForm) {
  return [
    form.outcome1,
    form.outcome2,
    form.outcome3,
    form.outcome4,
    form.outcome5,
  ]
    .map((item) => item.trim())
    .filter(Boolean)
    .join("\n");
}

function getFileNameFromPath(value: string, fallback: string) {
  const clean = value.trim().split("?")[0].split("#")[0];
  const fileName = clean.split("/").filter(Boolean).pop();
  return fileName || fallback;
}

function readUploadFile(
  file: File | undefined,
  expected: "image" | "pdf",
  setter: (dataUrl: string, fileName: string) => void
) {
  if (!file) return;
  if (expected === "image" && !file.type.startsWith("image/")) {
    alert("Please upload an image file.");
    return;
  }
  if (expected === "pdf" && file.type !== "application/pdf") {
    alert("Please upload a PDF file.");
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    alert("Please upload a file smaller than 5 MB.");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => setter(String(reader.result), file.name);
  reader.readAsDataURL(file);
}

const headerSection: CSSProperties = { maxWidth: "1280px", margin: "0 auto", padding: "38px 48px 20px", display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(340px, 430px)", gap: "28px", alignItems: "center" };
const eyebrow: CSSProperties = { color: "#8A661E", fontSize: "12px", fontWeight: 900, letterSpacing: "1.5px", marginBottom: "7px" };
const pageTitle: CSSProperties = { color: "var(--tm-ink)", fontFamily: "var(--tm-font-display)", fontSize: "clamp(34px, 4vw, 48px)", lineHeight: "1.04", letterSpacing: "-1.5px", margin: "0" };
const pageText: CSSProperties = { color: "#53665E", fontSize: "18px", lineHeight: "1.7", margin: 0 };
const adminSidePanel: CSSProperties = { display: "grid", gap: "10px", padding: "12px", border: "1px solid var(--tm-border)", borderRadius: "var(--tm-radius-xl)", background: "var(--tm-surface)", boxShadow: "var(--tm-shadow-md)" };
const summaryPanel: CSSProperties = { background: "var(--tm-forest-50)", border: "1px solid var(--tm-border)", borderRadius: "var(--tm-radius-lg)", padding: "12px 14px", display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "10px", alignItems: "center" };
const summaryBox: CSSProperties = { display: "flex", flexDirection: "column", gap: "2px", textAlign: "center", lineHeight: "1.15", color: "#173F35" };
const logoutButton: CSSProperties = { background: "var(--tm-danger-soft)", color: "var(--tm-danger)", border: "1px solid #e8baba", padding: "10px 14px", borderRadius: "var(--tm-radius-md)", cursor: "pointer", fontWeight: 850 };
const adminHeaderActionRow: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" };
const homeButton: CSSProperties = { background: "var(--tm-surface)", color: "var(--tm-forest-900)", border: "1px solid var(--tm-border)", padding: "10px 14px", borderRadius: "var(--tm-radius-md)", cursor: "pointer", fontWeight: 850, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "7px" };
const adminTabs: CSSProperties = {
  maxWidth: "1280px",
  margin: "0 auto",
  padding: "8px 48px 14px",
  display: "flex",
  gap: "8px",
  flexWrap: "nowrap",
  alignItems: "center",
  justifyContent: "center",
  position: "sticky",
  top: "var(--tm-header-height)",
  zIndex: 20,
  background: "color-mix(in srgb, var(--tm-canvas) 94%, transparent)",
  backdropFilter: "blur(14px)",
  borderBottom: "1px solid var(--tm-border)",
  overflow: "visible",
};

const adminTabButton: CSSProperties = {
  background: "var(--tm-surface)",
  color: "var(--tm-ink)",
  border: "1px solid var(--tm-border)",
  padding: "9px 14px",
  borderRadius: "999px",
  cursor: "pointer",
  fontWeight: 800,
  fontSize: "13px",
  whiteSpace: "nowrap",
  boxShadow: "var(--tm-shadow-sm)",
};

const activeAdminTabButton: CSSProperties = {
  ...adminTabButton,
  background: "var(--tm-forest-900)",
  color: "#FFFFFF",
  border: "1px solid var(--tm-forest-900)",
};

const adminLearningDropdownWrap: CSSProperties = {
  position: "relative",
};

const adminDropdownButton: CSSProperties = {
  ...adminTabButton,
  padding: "9px 18px",
};

const activeAdminDropdownButton: CSSProperties = {
  ...adminDropdownButton,
  background: "var(--tm-forest-900)",
  color: "#FFFFFF",
  border: "1px solid var(--tm-forest-900)",
};

const adminLearningDropdownMenu: CSSProperties = {
  position: "absolute",
  top: "44px",
  left: 0,
  minWidth: "220px",
  background: "#FFFFFF",
  border: "1px solid #E8E1D2",
  borderRadius: "14px",
  padding: "8px",
  display: "grid",
  gap: "6px",
  boxShadow: "0 18px 38px rgba(23,63,53,0.18)",
  zIndex: 80,
};

const adminDropdownItem: CSSProperties = {
  background: "#FBFAF6",
  color: "#173F35",
  border: "1px solid #E8E1D2",
  borderRadius: "10px",
  padding: "10px 12px",
  cursor: "pointer",
  fontWeight: 900,
  textAlign: "left",
};

const activeAdminDropdownItem: CSSProperties = {
  ...adminDropdownItem,
  background: "#DDE9E2",
  border: "1px solid #C8DBD1",
};

const eventStatusSummary: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "8px",
  minWidth: "230px",
};

const eventStatusPill: CSSProperties = {
  background: "#DDE9E2",
  border: "1px solid #C8DBD1",
  borderRadius: "14px",
  padding: "10px 12px",
  display: "grid",
  gap: "3px",
  textAlign: "center",
  color: "#173F35",
};

const overviewSection: CSSProperties = {
  maxWidth: "1280px",
  margin: "0 auto",
  padding: "18px 48px 38px",
  display: "grid",
  gap: "16px",
};

const overviewIntroCard: CSSProperties = {
  background: "linear-gradient(135deg, var(--tm-surface), var(--tm-forest-50))",
  border: "1px solid var(--tm-border)",
  borderRadius: "var(--tm-radius-xl)",
  padding: "22px 24px",
  boxShadow: "var(--tm-shadow-sm)",
};

const overviewTitle: CSSProperties = {
  color: "var(--tm-ink)",
  fontFamily: "var(--tm-font-display)",
  fontSize: "30px",
  letterSpacing: "-0.7px",
  margin: 0,
};

const overviewText: CSSProperties = {
  color: "#53665E",
  fontSize: "16px",
  lineHeight: "1.65",
  margin: 0,
};

const overviewGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "16px",
};

const overviewCard: CSSProperties = {
  background: "var(--tm-surface)",
  border: "1px solid var(--tm-border)",
  borderRadius: "var(--tm-radius-lg)",
  padding: "18px",
  boxShadow: "var(--tm-shadow-sm)",
  display: "grid",
  gap: "10px",
};

const overviewCardHeader: CSSProperties = {
  color: "var(--tm-gold-700)",
  fontSize: "13px",
  fontWeight: 900,
  letterSpacing: "0.8px",
  textTransform: "uppercase",
  paddingBottom: "6px",
  borderBottom: "1px solid var(--tm-border)",
};

const overviewMetricRow: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "10px",
  alignItems: "center",
  color: "var(--tm-muted)",
  fontSize: "14px",
};

const overviewNoteCard: CSSProperties = {
  background: "#DDE9E2",
  border: "1px solid #C9DDD3",
  borderRadius: "16px",
  padding: "16px 20px",
  color: "#173F35",
  display: "flex",
  gap: "8px",
  alignItems: "center",
  flexWrap: "wrap",
};

const adminActionSection: CSSProperties = {
  maxWidth: "1280px",
  margin: "0 auto",
  padding: "22px 48px 40px",
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "28px",
  alignItems: "stretch",
};

const actionCard: CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E8E1D2",
  borderRadius: "22px",
  padding: "30px",
  boxShadow: "0 14px 36px rgba(23,63,53,0.07)",
  display: "grid",
  gap: "14px",
  alignContent: "start",
};

const actionCardTitle: CSSProperties = {
  color: "#173F35",
  fontSize: "28px",
  lineHeight: "1.2",
  margin: 0,
};

const actionCardText: CSSProperties = {
  color: "#53665E",
  fontSize: "16px",
  lineHeight: "1.65",
  margin: 0,
};

const largeActionButton: CSSProperties = {
  background: "#173F35",
  color: "#FFFFFF",
  border: "none",
  padding: "15px 20px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: 900,
  fontSize: "16px",
  width: "fit-content",
};

const largeFormModal: CSSProperties = {
  background: "#F7F8F5",
  borderRadius: "22px",
  width: "min(980px, 95vw)",
  maxHeight: "88vh",
  overflow: "auto",
  position: "relative",
  padding: "18px",
  boxShadow: "0 24px 80px rgba(0,0,0,0.30)",
};

const formModalClose: CSSProperties = {
  position: "sticky",
  top: "0",
  marginLeft: "auto",
  marginBottom: "10px",
  background: "#FFFFFF",
  border: "1px solid #E8E1D2",
  borderRadius: "50%",
  width: "40px",
  height: "40px",
  fontSize: "26px",
  cursor: "pointer",
  color: "#173F35",
  display: "block",
  zIndex: 2,
};

const contentAdminLayout: CSSProperties = { display: "grid", gridTemplateColumns: "minmax(380px, 0.9fr) minmax(420px, 1.1fr)", gap: "18px", alignItems: "start" };
const categoryAdminLayout: CSSProperties = { display: "grid", gridTemplateColumns: "260px 1fr", gap: "18px", alignItems: "start" };
const taxonomySinglePanel: CSSProperties = { maxWidth: "900px", margin: "0 auto" };
const categoryGroupList: CSSProperties = { background: "#FFFFFF", border: "1px solid #E8E1D2", borderRadius: "18px", padding: "12px", display: "grid", gap: "8px", boxShadow: "0 12px 26px rgba(23,63,53,0.06)" };
const categoryGroupButton: CSSProperties = { background: "#FBFAF6", color: "#173F35", border: "1px solid #E8E1D2", borderRadius: "12px", padding: "12px", cursor: "pointer", fontWeight: 900, textAlign: "left" };
const activeCategoryGroupButton: CSSProperties = { ...categoryGroupButton, background: "#173F35", color: "#FFFFFF", border: "1px solid #173F35" };
const categoryAddRow: CSSProperties = { display: "grid", gridTemplateColumns: "1fr auto", gap: "10px", alignItems: "center", marginBottom: "14px" };
const categoryRows: CSSProperties = { display: "grid", gap: "9px" };
const categoryRow: CSSProperties = { display: "grid", gridTemplateColumns: "1fr auto", gap: "10px", alignItems: "center" };
const categoryActionRow: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px", flexWrap: "nowrap" };
const fixedValueBox: CSSProperties = {
  background: "#FBFAF6",
  border: "1px solid #D8D2C3",
  borderRadius: "11px",
  padding: "13px 14px",
  color: "#173F35",
  fontWeight: 900,
  fontSize: "15px",
  lineHeight: "1.15",
  whiteSpace: "nowrap",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const eventListStack: CSSProperties = { display: "grid", gridTemplateColumns: "1fr", gap: "14px" };
const eventListCard: CSSProperties = { background: "#FFFFFF", border: "1px solid #E8E1D2", borderRadius: "18px", padding: "14px", boxShadow: "0 12px 26px rgba(23,63,53,0.06)" };
const eventListHeader: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", marginBottom: "10px" };
const eventListTitle: CSSProperties = { color: "#173F35", fontSize: "18px", margin: 0, lineHeight: "1.1" };
const eventListCount: CSSProperties = { background: "#DDE9E2", border: "1px solid #C8DBD1", borderRadius: "999px", minWidth: "32px", height: "32px", display: "grid", placeItems: "center", color: "#173F35", fontWeight: 900 };
const eventListItems: CSSProperties = { display: "grid", gap: "10px" };
const eventListItem: CSSProperties = {
  background: "#FBFAF6",
  border: "1px solid #E8E1D2",
  borderRadius: "14px",
  padding: "13px",
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "10px",
  alignItems: "stretch",
  textAlign: "left",
};
const eventListEmpty: CSSProperties = { border: "1px dashed #C8DBD1", background: "#FBFAF6", borderRadius: "14px", padding: "18px", textAlign: "center", color: "#53665E", fontWeight: 800 };
const contentFormCard: CSSProperties = { background: "#FFFFFF", border: "1px solid #E8E1D2", borderRadius: "20px", padding: "20px", boxShadow: "0 14px 32px rgba(23,63,53,0.06)" };
const contentListCard: CSSProperties = { display: "grid", gap: "12px" };
const contentListItem: CSSProperties = { background: "#FFFFFF", border: "1px solid #E8E1D2", borderRadius: "16px", padding: "16px", display: "grid", gridTemplateColumns: "1fr auto", gap: "14px", alignItems: "center", textAlign: "left" };
const contentItemTitle: CSSProperties = {
  color: "#173F35",
  fontSize: "17px",
  lineHeight: "1.25",
  display: "block",
  width: "100%",
};
const contentItemMeta: CSSProperties = {
  color: "#8A661E",
  fontWeight: 900,
  margin: "6px 0 5px",
  fontSize: "13px",
  width: "100%",
  lineHeight: "1.35",
};
const contentItemText: CSSProperties = {
  color: "#53665E",
  margin: 0,
  lineHeight: "1.45",
  fontSize: "14px",
  width: "100%",
};
const panel: CSSProperties = { background: "#FFFFFF", border: "1px solid #E8E1D2", borderRadius: "20px", padding: "22px", boxShadow: "0 14px 36px rgba(23,63,53,0.07)" };
const compactPanel: CSSProperties = { background: "#FFFFFF", border: "1px solid #E8E1D2", borderRadius: "20px", padding: "22px", boxShadow: "0 14px 36px rgba(23,63,53,0.07)" };
const compactFormHeading: CSSProperties = { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "18px", paddingBottom: "14px", marginBottom: "16px", borderBottom: "1px solid #ECE6DA" };
const compactPanelTitle: CSSProperties = { color: "#173F35", margin: "0 0 5px", fontSize: "26px", lineHeight: "1.1" };
const compactPanelNote: CSSProperties = { color: "#60736B", margin: 0, fontSize: "13px", lineHeight: "1.5", maxWidth: "720px" };
const compactFormGrid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", columnGap: "12px", rowGap: "0" };
const subPanel: CSSProperties = { background: "#FBFAF6", border: "1px solid #E8E1D2", borderRadius: "16px", padding: "16px", margin: "16px 0" };
const subPanelTitle: CSSProperties = { color: "#173F35", margin: "0 0 14px" };
const sectionNote: CSSProperties = { color: "#53665E", fontSize: "14px", lineHeight: "1.45", margin: "6px 0 0" };
const panelTitle: CSSProperties = { color: "#173F35", margin: "0 0 18px" };
const fieldBlock: CSSProperties = { display: "grid", gap: "6px", color: "#35584D", fontSize: "13px", fontWeight: 800, marginBottom: "12px", textAlign: "left" };
const twoColumn: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" };
const outcomeInputGrid: CSSProperties = { display: "grid", gridTemplateColumns: "1fr", gap: "3px" };
const learningOutcomeHeader: CSSProperties = { display: "grid", gap: "4px", color: "#173F35", fontSize: "14px", fontWeight: 900, marginBottom: "10px" };
const inputStyle: CSSProperties = { width: "100%", boxSizing: "border-box", padding: "11px 12px", borderRadius: "10px", border: "1px solid #D8D2C3", fontSize: "14px", outline: "none", background: "#FFFFFF" };
const compactInputStyle: CSSProperties = { ...inputStyle, padding: "10px 11px", minHeight: "40px" };
const fileInputStyle: CSSProperties = { ...inputStyle, padding: "10px 12px" };
const textareaStyle: CSSProperties = { ...inputStyle, minHeight: "88px", resize: "vertical" };
const compactTextareaStyle: CSSProperties = { ...inputStyle, minHeight: "82px", resize: "vertical" };
const helperText: CSSProperties = { color: "#53665E", marginTop: "-3px", marginBottom: "13px", fontSize: "12.5px" };
const mediaUploadGrid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px", margin: "4px 0 16px" };
const mediaUploadGridTwo: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", margin: "2px 0 14px" };
const uploadCard: CSSProperties = { display: "grid", gridTemplateColumns: "78px minmax(0, 1fr)", gap: "12px", alignItems: "center", minHeight: "112px", padding: "12px", border: "1px solid #DED8CA", borderRadius: "14px", background: "#FBFAF6" };
const uploadCardPreview: CSSProperties = { width: "78px", height: "78px", display: "grid", placeItems: "center", overflow: "hidden", borderRadius: "12px", background: "#EEF3EF", border: "1px solid #D8E3DC" };
const uploadIconBox: CSSProperties = { width: "46px", height: "46px", borderRadius: "12px", display: "grid", placeItems: "center", color: "#176553", background: "#E2EFE8" };
const uploadImagePreview: CSSProperties = { width: "100%", height: "100%", objectFit: "cover" };
const uploadPortraitPreview: CSSProperties = { width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" };
const uploadCardContent: CSSProperties = { minWidth: 0, display: "grid", gap: "10px" };
const uploadCardTitle: CSSProperties = { display: "block", color: "#173F35", fontSize: "14px", lineHeight: "1.2" };
const uploadCardDescription: CSSProperties = { margin: "3px 0 0", color: "#64766E", fontSize: "11.5px", lineHeight: "1.35" };
const uploadFileName: CSSProperties = { display: "block", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "5px", color: "#8A661E", fontSize: "11.5px", fontWeight: 800 };
const uploadActions: CSSProperties = { display: "flex", gap: "7px", alignItems: "center", flexWrap: "wrap" };
const uploadButton: CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", minHeight: "34px", padding: "7px 10px", borderRadius: "9px", background: "#173F35", color: "#FFFFFF", cursor: "pointer", fontSize: "11.5px", fontWeight: 850 };
const hiddenFileInput: CSSProperties = { position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" };
const uploadRemoveButton: CSSProperties = { minHeight: "34px", padding: "7px 9px", borderRadius: "9px", background: "#FDE8E8", color: "#9B1C1C", border: "1px solid #F4C7C7", cursor: "pointer", fontSize: "11.5px", fontWeight: 850 };
const stickyFormActions: CSSProperties = { position: "sticky", bottom: 0, display: "flex", gap: "9px", justifyContent: "flex-end", paddingTop: "14px", marginTop: "4px", borderTop: "1px solid #ECE6DA", background: "#FFFFFF" };
const buttonRow: CSSProperties = { display: "flex", gap: "12px", flexWrap: "wrap" };
const primaryButton: CSSProperties = { background: "#173F35", color: "white", border: "none", padding: "13px 18px", borderRadius: "11px", cursor: "pointer", fontWeight: 800 };
const secondaryButton: CSSProperties = { background: "#DDE9E2", color: "#173F35", border: "1px solid #C9DDD3", padding: "13px 18px", borderRadius: "11px", cursor: "pointer", fontWeight: 800 };
const plainButton: CSSProperties = { background: "#F7F8F5", color: "#53665E", border: "1px solid #D8D2C3", padding: "13px 18px", borderRadius: "11px", cursor: "pointer", fontWeight: 800 };
const checkList: CSSProperties = {
  display: "grid",
  gap: "6px",
  background: "#FBFAF6",
  border: "1px solid #E8E1D2",
  borderRadius: "14px",
  padding: "10px",
  maxHeight: "142px",
  overflowY: "auto",
  paddingRight: "8px",
};

const checkItem: CSSProperties = {
  display: "flex",
  gap: "9px",
  alignItems: "center",
  color: "#173F35",
  minHeight: "26px",
};

const checkNameOnly: CSSProperties = {
  fontWeight: 800,
  fontSize: "14px",
  lineHeight: "1.15",
  color: "#173F35",
};
const wideSection: CSSProperties = { maxWidth: "1280px", margin: "0 auto", padding: "14px 48px 30px" };
const sectionHeader: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "14px" };
const toolCategoryStrip: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(6, minmax(130px, 1fr))", gap: "10px", margin: "0 0 16px" };
const toolCategoryButton: CSSProperties = { background: "#FFFFFF", border: "1px solid #E8E1D2", borderRadius: "12px", padding: "10px 12px", color: "#173F35", cursor: "pointer", display: "grid", gap: "3px", textAlign: "center", fontWeight: 850 };
const activeToolCategoryButton: CSSProperties = { ...toolCategoryButton, background: "#173F35", color: "#FFFFFF", border: "1px solid #173F35" };
const toolAdminLayout: CSSProperties = { display: "grid", gridTemplateColumns: "360px 1fr", gap: "18px", alignItems: "start" };
const toolFormCard: CSSProperties = { background: "#FFFFFF", border: "1px solid #E8E1D2", borderRadius: "16px", padding: "18px", boxShadow: "0 8px 20px rgba(23,63,53,0.04)" };
const toolListCard: CSSProperties = { ...toolFormCard };
const miniPanelTitle: CSSProperties = { color: "#173F35", margin: "0 0 14px", fontSize: "20px" };
const toolPreview: CSSProperties = { display: "flex", alignItems: "center", gap: "10px", background: "#FBFAF6", border: "1px solid #E8E1D2", borderRadius: "12px", padding: "10px 12px", marginBottom: "14px", color: "#173F35", fontWeight: 850 };
const toolLogoPreview: CSSProperties = { width: "34px", height: "34px", objectFit: "contain", borderRadius: "8px", background: "#FFFFFF", border: "1px solid #E8E1D2" };
const toolIconPreview: CSSProperties = { width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", background: "#DDE9E2", fontSize: "20px" };
const toolAdminList: CSSProperties = { display: "grid", gap: "10px" };
const toolAdminItem: CSSProperties = { display: "grid", gridTemplateColumns: "48px 1fr auto", gap: "12px", alignItems: "center", background: "#FBFAF6", border: "1px solid #E8E1D2", borderRadius: "12px", padding: "10px" };
const toolAdminLogoBox: CSSProperties = { width: "42px", height: "42px", borderRadius: "12px", background: "#DDE9E2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", overflow: "hidden" };
const toolAdminLogo: CSSProperties = { width: "100%", height: "100%", objectFit: "contain", background: "#FFFFFF" };

const tableShell: CSSProperties = { background: "#FFFFFF", border: "1px solid #E8E1D2", borderRadius: "16px", overflow: "hidden", boxShadow: "0 10px 28px rgba(23,63,53,0.05)" };
const dataTable: CSSProperties = { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" };
const courseDataTable: CSSProperties = { ...dataTable };
const instructorDataTable: CSSProperties = { ...dataTable };
const instructorTableShell: CSSProperties = { background: "#FFFFFF", border: "1px solid #E8E1D2", borderRadius: "16px", overflow: "hidden", boxShadow: "0 10px 28px rgba(23,63,53,0.05)" };
const instructorGridColumns = "24% 21% 25% 21% 9%";
const instructorGridHeader: CSSProperties = { display: "grid", gridTemplateColumns: instructorGridColumns, alignItems: "center", background: "#F5F2EA", color: "#173F35", fontSize: "11.5px", fontWeight: 900, letterSpacing: "0.55px", textTransform: "uppercase", borderBottom: "1px solid #E8E1D2" };
const instructorGridHeaderCell: CSSProperties = { padding: "10px 8px", whiteSpace: "nowrap" };
const instructorGridRow: CSSProperties = { display: "grid", gridTemplateColumns: instructorGridColumns, alignItems: "center", borderBottom: "1px solid #EEE8DB", minHeight: "66px" };
const instructorGridCell: CSSProperties = { padding: "10px 8px", color: "#35584D", fontSize: "13px", minWidth: 0 };

const tableHead: CSSProperties = { background: "#F5F2EA" };
const tableHeaderCell: CSSProperties = { textAlign: "left", color: "#173F35", fontSize: "11.5px", letterSpacing: "0.55px", textTransform: "uppercase", padding: "10px 8px", borderBottom: "1px solid #E8E1D2", whiteSpace: "nowrap" };
const professionalTableRow: CSSProperties = { borderBottom: "1px solid #EEE8DB" };
const professionalTableCell: CSSProperties = {
  padding: "10px 8px",
  verticalAlign: "middle",
  color: "#35584D",
  fontSize: "13px",
  textAlign: "left",
};

const tableCourseCell: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: "9px",
  minWidth: 0,
  textAlign: "left",
};
const instructorIdentityCell: CSSProperties = { display: "flex", alignItems: "center", gap: "8px", minWidth: 0, padding: "10px 8px" };
const tableThumb: CSSProperties = { width: "46px", height: "34px", borderRadius: "8px", backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#DDE9E2", flexShrink: 0 };
const tablePhoto: CSSProperties = { width: "36px", height: "36px", borderRadius: "9px", backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#DDE9E2", flexShrink: 0 };
const tablePrimaryText: CSSProperties = {
  color: "#173F35",
  fontSize: "13px",
  fontWeight: 900,
  display: "block",
  lineHeight: "1.25",
  textAlign: "left",
};
const tableMutedText: CSSProperties = {
  color: "#53665E",
  fontSize: "12px",
  lineHeight: "1.3",
  display: "block",
  marginTop: "3px",
  textAlign: "left",
};
const instructorNameLine: CSSProperties = { ...tableMutedText, whiteSpace: "nowrap" };
const designationLine: CSSProperties = { ...tablePrimaryText, whiteSpace: "nowrap" };
const badgeStack: CSSProperties = { display: "grid", gap: "7px", justifyItems: "start" };
const nameStack: CSSProperties = { display: "grid", gap: "2px", justifyItems: "start", textAlign: "left" };
const courseActionGrid: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", minWidth: 0, justifyItems: "stretch" };
const tableActionRow: CSSProperties = { display: "flex", gap: "7px", flexWrap: "wrap" };
const tablePillReady: CSSProperties = { display: "inline-flex", alignItems: "center", background: "#DDE9E2", color: "#173F35", padding: "5px 8px", borderRadius: "999px", fontSize: "11.5px", fontWeight: 850, marginRight: "4px", whiteSpace: "nowrap" };
const tablePillPending: CSSProperties = { ...tablePillReady, background: "#F6E6E6", color: "#8B2B2B" };
const tablePillNeutral: CSSProperties = { ...tablePillReady, background: "#F0E6CF", color: "#173F35" };
const sessionLinkReady: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#DDE9E2",
  color: "#173F35",
  border: "1px solid #BFD6C9",
  padding: "6px 8px",
  borderRadius: "8px",
  fontSize: "11.5px",
  fontWeight: 850,
  whiteSpace: "nowrap",
  minWidth: "48px",
};

const sessionLinkPending: CSSProperties = {
  ...sessionLinkReady,
  background: "#F4F1EA",
  color: "#9A9284",
  border: "1px solid #E1D9C9",
};
const emptyState: CSSProperties = { background: "#FFFFFF", border: "1px dashed #C9DDD3", borderRadius: "16px", padding: "26px", color: "#53665E", textAlign: "center", fontWeight: 800 };

const courseList: CSSProperties = { display: "grid", gap: "18px" };
const courseItem: CSSProperties = { display: "grid", gridTemplateColumns: "140px 1fr", gap: "14px", border: "1px solid #E8E1D2", borderRadius: "14px", padding: "12px", background: "#FFFFFF", textAlign: "left", boxShadow: "0 8px 20px rgba(23,63,53,0.04)" };
const courseThumb: CSSProperties = { minHeight: "108px", borderRadius: "12px", backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#DDE9E2" };
const courseItemBody: CSSProperties = { display: "flex", flexDirection: "column" };
const courseItemTop: CSSProperties = { display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "10px" };
const categoryBadge: CSSProperties = { background: "#F0E6CF", color: "#173F35", padding: "6px 9px", borderRadius: "999px", fontSize: "11.5px", fontWeight: 800, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center" };
const publishedBadge: CSSProperties = { background: "#DDE9E2", color: "#173F35", padding: "6px 9px", borderRadius: "999px", fontSize: "11.5px", fontWeight: 800, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center" };
const draftBadge: CSSProperties = { background: "#F6E6E6", color: "#8B2B2B", padding: "6px 9px", borderRadius: "999px", fontSize: "11.5px", fontWeight: 800, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center" };
const courseItemTitle: CSSProperties = { color: "#173F35", margin: "0 0 8px" };
const courseItemText: CSSProperties = { color: "#53665E", fontSize: "15px", lineHeight: "1.55", margin: "0 0 12px" };
const linkedText: CSSProperties = { color: "#8A661E", fontSize: "14px", fontWeight: 800, margin: "0 0 12px" };
const courseDetails: CSSProperties = { display: "flex", gap: "10px", flexWrap: "wrap", color: "#53665E", fontSize: "13px", fontWeight: 700, marginBottom: "14px" };
const actionRow: CSSProperties = { display: "flex", gap: "10px", flexWrap: "wrap" };
const eventActionRow: CSSProperties = {
  display: "flex",
  gap: "7px",
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  marginTop: "2px",
};

const eventActionLeft: CSSProperties = {
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
};

const eventActionRight: CSSProperties = {
  display: "flex",
  gap: "7px",
  justifyContent: "flex-end",
  alignItems: "center",
};
const smallButton: CSSProperties = { background: "#FFFFFF", color: "#173F35", border: "1px solid #C9DDD3", padding: "6px 8px", borderRadius: "8px", cursor: "pointer", fontWeight: 850, fontSize: "11.5px" };
const statusMoveButton: CSSProperties = {
  ...smallButton,
  background: "#F0E6CF",
  border: "1px solid #DEC893",
  color: "#173F35",
};
const smallLinkButton: CSSProperties = { ...smallButton, textDecoration: "none" };
const instructorActionRow: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "7px", minWidth: 0, padding: "10px 8px" };
const instructorActionLeft: CSSProperties = { display: "flex", alignItems: "center", gap: "5px", flexWrap: "nowrap" };
const deleteIconButton: CSSProperties = { width: "24px", height: "24px", borderRadius: "50%", border: "1px solid #F4C7C7", background: "#FDE8E8", color: "#9B1C1C", cursor: "pointer", fontWeight: 900, fontSize: "16px", lineHeight: "1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
const deleteButton: CSSProperties = { background: "#FDE8E8", color: "#9B1C1C", border: "1px solid #F4C7C7", padding: "6px 8px", borderRadius: "8px", cursor: "pointer", fontWeight: 850, fontSize: "11.5px" };
const courseDeleteButton: CSSProperties = { ...deleteButton, gridColumn: "1 / -1" };
const instructorList: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "18px" };
const instructorItem: CSSProperties = { background: "#FFFFFF", border: "1px solid #E8E1D2", borderRadius: "18px", padding: "16px", display: "grid", gridTemplateColumns: "100px 1fr", gap: "16px", textAlign: "left" };
const smallPhoto: CSSProperties = { width: "92px", height: "115px", borderRadius: "12px", backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#DDE9E2" };
const enquiryHeaderActions: CSSProperties = { display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" };
const exportButton: CSSProperties = { background: "#173F35", color: "#FFFFFF", border: "none", padding: "10px 14px", borderRadius: "999px", cursor: "pointer", fontWeight: 900 };
const enquiryCount: CSSProperties = { background: "#DDE9E2", color: "#173F35", padding: "10px 14px", borderRadius: "999px", fontWeight: 800 };
const emptyEnquiry: CSSProperties = { background: "#FFFFFF", border: "1px solid #E8E1D2", borderRadius: "18px", padding: "26px", color: "#53665E" };
const enquiryTableWrap: CSSProperties = { background: "#FFFFFF", border: "1px solid #E8E1D2", borderRadius: "18px", overflowX: "auto", boxShadow: "0 12px 30px rgba(23,63,53,0.06)" };
const enquiryTable: CSSProperties = { width: "100%", minWidth: "1180px", borderCollapse: "collapse", textAlign: "left" };
const tableHeader: CSSProperties = { background: "#DDE9E2", color: "#173F35", padding: "14px 12px", fontSize: "14px", fontWeight: 900, borderBottom: "1px solid #C9DDD3", whiteSpace: "nowrap" };
const tableRow: CSSProperties = { borderBottom: "1px solid #E8E1D2" };
const tableCell: CSSProperties = { padding: "12px", color: "#173F35", fontSize: "14px", verticalAlign: "middle", whiteSpace: "nowrap" };
const tableCellStrong: CSSProperties = { ...tableCell, fontWeight: 900 };
const tableInput: CSSProperties = { width: "190px", boxSizing: "border-box", padding: "9px 10px", borderRadius: "9px", border: "1px solid #D8D2C3" };
const statusSelect: CSSProperties = { ...tableInput, width: "185px" };
const messageLink: CSSProperties = { background: "transparent", color: "#8A661E", border: "none", padding: 0, fontWeight: 900, cursor: "pointer", textDecoration: "underline" };
const modalBackdrop: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  zIndex: 5000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "18px",
};

const messageModal: CSSProperties = {
  background: "#FFFFFF",
  borderRadius: "20px",
  maxWidth: "820px",
  width: "100%",
  maxHeight: "85vh",
  overflow: "auto",
  position: "relative",
  padding: "30px",
  textAlign: "left",
  boxShadow: "0 24px 70px rgba(0,0,0,0.22)",
};

const modalCloseButton: CSSProperties = {
  position: "absolute",
  top: "14px",
  right: "16px",
  background: "#FFFFFF",
  border: "1px solid #E8E1D2",
  borderRadius: "50%",
  width: "34px",
  height: "34px",
  fontSize: "22px",
  cursor: "pointer",
  color: "#173F35",
  lineHeight: "1",
};

const modalTitle: CSSProperties = {
  color: "#173F35",
  fontSize: "25px",
  lineHeight: "1.15",
  margin: "0 0 5px",
};

const modalSubTitle: CSSProperties = {
  color: "#53665E",
  fontSize: "15px",
  lineHeight: "1.25",
  fontWeight: 850,
  margin: "0 0 18px",
};

const modalInfoGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: "10px",
  marginBottom: "14px",
};

const detailBox: CSSProperties = {
  background: "#FBFAF6",
  border: "1px solid #E8E1D2",
  borderRadius: "12px",
  padding: "10px 12px",
  display: "grid",
  gap: "5px",
  minWidth: 0,
};

const detailLabel: CSSProperties = {
  color: "#173F35",
  fontSize: "13px",
  lineHeight: "1.1",
  fontWeight: 750,
};

const detailValue: CSSProperties = {
  color: "#173F35",
  fontSize: "15px",
  lineHeight: "1.22",
  fontWeight: 900,
  overflowWrap: "anywhere",
  wordBreak: "break-word",
};

const messageBox: CSSProperties = {
  background: "#FBFAF6",
  border: "1px solid #E8E1D2",
  borderRadius: "12px",
  padding: "12px 14px",
  marginBottom: "8px",
  color: "#173F35",
  fontSize: "15px",
  lineHeight: "1.35",
};
