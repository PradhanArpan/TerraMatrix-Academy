import heroImage from "../assets/hero-dam.jpg";

declare global { interface Window { __TM_ASSETS?: Record<string, string> } }

export type Instructor = {
  id: number;
  name: string;
  designation: string;
  company: string;
  affiliation?: string;
  expertise: string;
  email: string;
  phone: string;
  bio: string;
  photoUrl: string;
  cvName?: string;
  cvData?: string;
  status?: string;
  displayOrder?: number;
};

export type Course = {
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

export type AcademyEvent = {
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
  status: "Draft" | "Published" | "Upcoming" | "Completed";
};

export type LearningVideo = {
  id: number;
  title: string;
  category: string;
  theme: string;
  description: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  level: string;
  status: "Draft" | "Published";
};

export function readStoredArray<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function normalizePublicAssetPath(value: unknown, fallback = ""): string {
  let clean = String(value || "").trim().replace(/^["']|["']$/g, "").replace(/\\/g, "/");
  const fallbackValue = fallback || heroImage;
  if (!clean) return fallbackValue;
  if (/^(?:data:|blob:|https?:)/i.test(clean)) return clean;
  if (clean.startsWith("file:///")) clean = clean.slice(8);
  const publicUploads = clean.toLowerCase().indexOf("/public/uploads/");
  if (publicUploads >= 0) clean = clean.slice(publicUploads + "/public".length);
  const uploads = clean.toLowerCase().indexOf("/uploads/");
  if (uploads >= 0) clean = clean.slice(uploads);
  if (clean.toLowerCase().startsWith("public/uploads/")) clean = "/" + clean.slice(7);
  if (clean.toLowerCase().startsWith("uploads/")) clean = "/" + clean;
  const assets = typeof window !== "undefined" ? window.__TM_ASSETS : undefined;
  return assets?.[clean] || clean || fallbackValue;
}

export function normalizeCourse(value: Partial<Course>): Course {
  const instructorIds = Array.isArray(value.instructorIds)
    ? value.instructorIds.map(Number).filter(Number.isFinite)
    : [];
  return {
    id: Number(value.id || Date.now()),
    title: String(value.title || "Untitled programme"),
    shortTitle: String(value.shortTitle || ""),
    category: String(value.category || "Engineering Programme"),
    theme: String(value.theme || "Applied Engineering"),
    duration: String(value.duration || "To be announced"),
    level: String(value.level || "Open to All"),
    mode: String(value.mode || "Blended"),
    imageUrl: normalizePublicAssetPath(value.imageUrl, heroImage),
    instructorName: String(value.instructorName || "TerraMatrix Faculty"),
    instructorDesignation: String(value.instructorDesignation || "Programme Faculty"),
    instructorIds,
    startDate: String(value.startDate || "To be announced"),
    fee: String(value.fee || "To be announced"),
    certificate: normalizeCertification(String(value.certificate || "")),
    description: String(value.description || "Programme details will be published shortly."),
    outcomes: String(value.outcomes || ""),
    brochureName: String(value.brochureName || ""),
    brochureData: normalizePublicAssetPath(value.brochureData),
    status: value.status === "Draft" ? "Draft" : "Published",
    onlineSessionLink: String(value.onlineSessionLink || ""),
    onlineSessionDate: String(value.onlineSessionDate || ""),
    onlineSessionTime: String(value.onlineSessionTime || ""),
    recordingLink: String(value.recordingLink || ""),
    materialTitle: String(value.materialTitle || ""),
    materialDescription: String(value.materialDescription || ""),
    materialFileName: String(value.materialFileName || ""),
    materialFileData: normalizePublicAssetPath(value.materialFileData),
    assignmentTitle: String(value.assignmentTitle || ""),
    assignmentInstructions: String(value.assignmentInstructions || ""),
  };
}

export function normalizeInstructor(value: Partial<Instructor>): Instructor {
  return {
    id: Number(value.id || Date.now()),
    name: String(value.name || "Instructor"),
    designation: String(value.designation || "Faculty / Industry Expert"),
    company: String(value.company || value.affiliation || "TerraMatrix Academy"),
    affiliation: String(value.affiliation || value.company || "TerraMatrix Academy"),
    expertise: String(value.expertise || "Engineering Education"),
    email: String(value.email || ""),
    phone: String(value.phone || ""),
    bio: String(value.bio || ""),
    photoUrl: normalizePublicAssetPath(value.photoUrl, heroImage),
    cvName: String(value.cvName || ""),
    cvData: normalizePublicAssetPath(value.cvData),
    status: String(value.status || "Active"),
    displayOrder: Number(value.displayOrder || 0),
  };
}

export function normalizeEvent(value: Partial<AcademyEvent>): AcademyEvent {
  return {
    id: Number(value.id || Date.now()),
    title: String(value.title || "Untitled event"),
    category: String(value.category || "Engineering Learning"),
    theme: String(value.theme || "Professional Learning"),
    description: String(value.description || "Event details will be published shortly."),
    date: String(value.date || ""),
    time: String(value.time || ""),
    mode: String(value.mode || "Online"),
    resourcePerson: String(value.resourcePerson || "TerraMatrix Faculty"),
    instructorIds: Array.isArray(value.instructorIds) ? value.instructorIds.map(Number) : [],
    fee: String(value.fee || "To be announced"),
    certification: normalizeCertification(String(value.certification || "")),
    recordingLink: String(value.recordingLink || ""),
    imageUrl: normalizePublicAssetPath(value.imageUrl, heroImage),
    status:
      value.status === "Draft" || value.status === "Completed" || value.status === "Upcoming"
        ? value.status
        : "Published",
  };
}

export function normalizeVideo(value: Partial<LearningVideo>): LearningVideo {
  return {
    id: Number(value.id || Date.now()),
    title: String(value.title || "Learning video"),
    category: String(value.category || "Engineering Learning"),
    theme: String(value.theme || "Applied Engineering"),
    description: String(value.description || "Video details will be published shortly."),
    youtubeUrl: String(value.youtubeUrl || ""),
    thumbnailUrl: normalizePublicAssetPath(value.thumbnailUrl, heroImage),
    level: String(value.level || "Open to All"),
    status: value.status === "Draft" ? "Draft" : "Published",
  };
}

export function loadCourses(onlyPublished = true): Course[] {
  const data = readStoredArray<Partial<Course>>("terramatrix_courses").map(normalizeCourse);
  return onlyPublished ? data.filter((course) => course.status === "Published") : data;
}

export function loadInstructors(): Instructor[] {
  return readStoredArray<Partial<Instructor>>("terramatrix_instructors")
    .map(normalizeInstructor)
    .filter((item) => item.status !== "Inactive")
    .sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999) || a.name.localeCompare(b.name));
}

export function loadEvents(kind: "webinars" | "workshops"): AcademyEvent[] {
  return readStoredArray<Partial<AcademyEvent>>(`terramatrix_${kind}`)
    .map(normalizeEvent)
    .filter((item) => item.status !== "Draft");
}

export function loadVideos(): LearningVideo[] {
  return readStoredArray<Partial<LearningVideo>>("terramatrix_learning_videos")
    .map(normalizeVideo)
    .filter((item) => item.status === "Published");
}

export function normalizeCertification(value: string): string {
  const clean = value.trim().toLowerCase();
  if (!clean || clean.includes("participation") || clean === "no" || clean.includes("announced")) {
    return "Participation Certificate";
  }
  return "Completion Certificate";
}

export function formatDate(value: string): string {
  const clean = String(value || "").trim();
  if (!clean || clean.toLowerCase().includes("announced")) return clean || "To be announced";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(clean)
    ? new Date(`${clean}T00:00:00`)
    : new Date(clean.replace(/-/g, " "));
  if (Number.isNaN(date.getTime())) return clean;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatFee(value: string): string {
  const clean = String(value || "").trim();
  if (!clean) return "To be announced";
  if (/free|announced|tba/i.test(clean)) return clean;
  const numeric = Number(clean.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(numeric) || numeric <= 0) return clean;
  return `₹${numeric.toLocaleString("en-IN")}`;
}

export function parseOutcomes(value: string): string[] {
  return String(value || "")
    .split(/\r?\n|;/)
    .map((item) => item.replace(/^\s*(?:\d+[.)-]?|[-•])\s*/, "").trim())
    .filter(Boolean)
    .filter((item) => !/learning outcomes will be updated|by the end of this/i.test(item))
    .slice(0, 8);
}

export function getCourseInstructors(course: Course, instructors: Instructor[]): Instructor[] {
  const linked = instructors.filter((item) => course.instructorIds.includes(item.id));
  if (linked.length) return linked;
  return [
    {
      id: 0,
      name: course.instructorName,
      designation: course.instructorDesignation,
      company: "TerraMatrix Academy",
      expertise: course.theme,
      email: "",
      phone: "",
      bio: "",
      photoUrl: heroImage,
    },
  ];
}

export function deriveShortTitle(course: Pick<Course, "title" | "shortTitle">): string {
  if (course.shortTitle.trim()) return course.shortTitle.trim();
  const using = course.title.match(/\busing\s+(.+)$/i)?.[1];
  if (using) return using.trim();
  return course.title.length > 54 ? `${course.title.slice(0, 54).trim()}…` : course.title;
}
