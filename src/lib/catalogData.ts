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
    instructorName: String(value.instructorName || "TerraMatrix Instructor"),
    instructorDesignation: String(value.instructorDesignation || "Programme Instructor"),
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
    designation: String(value.designation || "Instructor / Industry Expert"),
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

export function normalizeEvent(value: Partial<AcademyEvent> & { imageFileId?: string }): AcademyEvent {
  return {
    id: Number(value.id || Date.now()),
    title: String(value.title || "Untitled event"),
    category: String(value.category || "Engineering Learning"),
    theme: String(value.theme || "Professional Learning"),
    description: String(value.description || "Event details will be published shortly."),
    date: String(value.date || ""),
    time: String(value.time || ""),
    mode: String(value.mode || "Online"),
    resourcePerson: String(value.resourcePerson || "TerraMatrix Instructor"),
    instructorIds: Array.isArray(value.instructorIds) ? value.instructorIds.map(Number) : [],
    fee: String(value.fee || "To be announced"),
    certification: normalizeCertification(String(value.certification || "")),
    recordingLink: String(value.recordingLink || ""),
    imageUrl: normalizePublicAssetPath(value.imageUrl || value.imageFileId, heroImage),
    status:
      value.status === "Draft" || value.status === "Completed" || value.status === "Upcoming"
        ? value.status
        : "Published",
  };
}

export function normalizeVideo(value: Partial<LearningVideo> & { thumbnailFileId?: string }): LearningVideo {
  return {
    id: Number(value.id || Date.now()),
    title: String(value.title || "Learning video"),
    category: String(value.category || "Engineering Learning"),
    theme: String(value.theme || "Applied Engineering"),
    description: String(value.description || "Video details will be published shortly."),
    youtubeUrl: String(value.youtubeUrl || ""),
    thumbnailUrl: normalizePublicAssetPath(value.thumbnailUrl || value.thumbnailFileId, heroImage),
    level: String(value.level || "Open to All"),
    status: value.status === "Draft" ? "Draft" : "Published",
  };
}

export const DEFAULT_INSTRUCTORS: Instructor[] = [
  {
    id: 1,
    name: "Dr. Arpan Pradhan",
    designation: "Founder & Principal Consultant",
    company: "TerraMatrix Academy",
    affiliation: "Terra Matrix Engineering Consultant",
    expertise: "Geotechnical Engineering, GIS, Water Resources, Python",
    email: "dr.arpanpradhan@gmail.com",
    phone: "",
    bio: "Civil and geotechnical engineering specialist with extensive research and consulting background in spatial analytics, river basin modeling, and computational methods.",
    photoUrl: "/uploads/instructors/arpan.jpg",
    cvName: "Arpan.pdf",
    cvData: "/uploads/instructors/Arpan.pdf",
    status: "Active",
    displayOrder: 1,
  },
  {
    id: 2,
    name: "Dr. Aniket Bhalkikar",
    designation: "Structural Engineering Consultant",
    company: "TerraMatrix Academy",
    affiliation: "TerraMatrix Academy",
    expertise: "Structural Analysis, SAP2000, ETABS, Finite Element Modeling",
    email: "",
    phone: "",
    bio: "Specialist in structural systems, advanced computer-aided finite element modeling, dynamic analysis, and seismic design verification.",
    photoUrl: "/uploads/instructors/aniket.jpg",
    cvName: "Aniket.pdf",
    cvData: "/uploads/instructors/Aniket.pdf",
    status: "Active",
    displayOrder: 2,
  },
  {
    id: 3,
    name: "Dr. Asit Kumar",
    designation: "Senior Geospatial Specialist",
    company: "TerraMatrix Academy",
    affiliation: "TerraMatrix Academy",
    expertise: "Remote Sensing, QGIS, Satellite Image Processing, Geomorphology",
    email: "",
    phone: "",
    bio: "Expert in earth observation, multispectral satellite data processing, digital elevation modeling, and applied geographic information systems.",
    photoUrl: "/uploads/instructors/asit.jpg",
    cvName: "Asit.pdf",
    cvData: "/uploads/instructors/Asit.pdf",
    status: "Active",
    displayOrder: 3,
  },
  {
    id: 4,
    name: "Ms. Neha Anil Choudhari",
    designation: "BIM & Structural Drafting Specialist",
    company: "TerraMatrix Academy",
    affiliation: "TerraMatrix Academy",
    expertise: "AutoCAD, Autodesk Revit, BIM Coordination, Structural Detailing",
    email: "",
    phone: "",
    bio: "Industry practitioner specializing in architectural modeling, structural reinforcement detailing, BIM interoperability, and professional engineering documentation.",
    photoUrl: "/uploads/instructors/neha.jpg",
    cvName: "Neha.pdf",
    cvData: "/uploads/instructors/Neha.pdf",
    status: "Active",
    displayOrder: 4,
  },
  {
    id: 5,
    name: "Dr. Sovan Sankalp",
    designation: "Geospatial & Environmental Engineer",
    company: "TerraMatrix Academy",
    affiliation: "TerraMatrix Academy",
    expertise: "QGIS, Spatial Data Infrastructure, Field Survey, Hydrologic Systems",
    email: "",
    phone: "",
    bio: "Specialist in geospatial technology applications, catchment delineation, terrain analysis, and environmental data workflows for civil infrastructure.",
    photoUrl: "/uploads/instructors/sovan.jpg",
    cvName: "Sovan.pdf",
    cvData: "/uploads/instructors/Sovan.pdf",
    status: "Active",
    displayOrder: 5,
  },
];

export const DEFAULT_COURSES: Course[] = [
  {
    id: 1,
    title: "Industry-Oriented Training on Structural Engineering and Geospatial Applications",
    shortTitle: "Structural Engineering & GIS",
    category: "Engineering Tools",
    theme: "Structural & Geospatial",
    duration: "60 Hours",
    level: "Intermediate",
    mode: "Blended",
    imageUrl: "/domain-civil.jpg",
    instructorName: "Ms. Neha Anil Choudhari, Dr. Aniket Bhalkikar, Dr. Sovan Sankalp",
    instructorDesignation: "Industry Practitioners & Academic Specialists",
    instructorIds: [4, 2, 5],
    startDate: "2026-08-01",
    fee: "₹2,499",
    certificate: "Completion Certificate",
    description: "Hands-on, multi-module training bridging architectural drafting in AutoCAD, structural analysis in SAP2000, and geospatial analysis in QGIS.",
    outcomes: "Master AutoCAD drafting conventions and detailing;\nPerform 3D structural frame modeling in SAP2000;\nExecute GIS spatial mapping and terrain overlays in QGIS;\nDeliver integrated engineering project documentation.",
    brochureName: "SE-GIS.pdf",
    brochureData: "/uploads/documents/SE-GIS.pdf",
    status: "Published",
    onlineSessionLink: "",
    onlineSessionDate: "",
    onlineSessionTime: "",
    recordingLink: "",
    materialTitle: "Structural Detailing & Geospatial Manuals",
    materialDescription: "Comprehensive CAD templates, SAP2000 tutorial files, and QGIS sample vector layers.",
    materialFileName: "SE-GIS.pdf",
    materialFileData: "/uploads/documents/SE-GIS.pdf",
    assignmentTitle: "Integrated Engineering Project",
    assignmentInstructions: "Complete structural analysis for a multi-story building and prepare the site layout plan in QGIS.",
  },
  {
    id: 2,
    title: "GIS Applications for Civil & Environmental Engineers",
    shortTitle: "GIS Applications",
    category: "Geospatial Tools",
    theme: "GIS and Mapping",
    duration: "30 Hours",
    level: "Foundation",
    mode: "Online",
    imageUrl: "/course-gis.jpg",
    instructorName: "Dr. Sovan Sankalp, Dr. Asit Kumar",
    instructorDesignation: "Geospatial Specialists",
    instructorIds: [5, 3],
    startDate: "2026-08-15",
    fee: "₹1,999",
    certificate: "Completion Certificate",
    description: "Hands-on training in vector/raster data handling, digital elevation models, terrain analysis, coordinate systems, and cartographic map composition.",
    outcomes: "Understand coordinate reference systems and projections;\nDigitize and georeference survey data in QGIS;\nProcess DEM rasters for watershed slope and drainage analysis;\nExport publication-ready engineering map layouts.",
    brochureName: "",
    brochureData: "",
    status: "Published",
    onlineSessionLink: "",
    onlineSessionDate: "",
    onlineSessionTime: "",
    recordingLink: "",
    materialTitle: "QGIS Practice Datasets",
    materialDescription: "Elevation models, river shapefiles, and satellite geotiffs.",
    materialFileName: "",
    materialFileData: "",
    assignmentTitle: "Terrain & Watershed Mapping",
    assignmentInstructions: "Generate a slope and drainage density map for the designated river basin.",
  },
  {
    id: 3,
    title: "Applied Hydrologic & Hydraulic River Modeling using HEC-RAS & HEC-HMS",
    shortTitle: "River & Flood Modeling",
    category: "Water Resources",
    theme: "Hydrology & Hydraulics",
    duration: "40 Hours",
    level: "Advanced",
    mode: "Online",
    imageUrl: "/course-hydrology.jpg",
    instructorName: "Dr. Arpan Pradhan",
    instructorDesignation: "Principal Water Resources Consultant",
    instructorIds: [1],
    startDate: "2026-09-01",
    fee: "₹3,499",
    certificate: "Completion Certificate",
    description: "Comprehensive 1D and 2D unsteady flow modeling, flood inundation mapping, dam breach analysis, and catchment runoff simulation.",
    outcomes: "Set up meteorological and precipitation runoff models in HEC-HMS;\nBuild 1D/2D hydrodynamic river geometries in HEC-RAS;\nSimulate flood wave propagation and water surface elevations;\nMap flood risk zones and generate engineering flood reports.",
    brochureName: "",
    brochureData: "",
    status: "Published",
    onlineSessionLink: "",
    onlineSessionDate: "",
    onlineSessionTime: "",
    recordingLink: "",
    materialTitle: "HEC-RAS Example Projects & River Bathymetry",
    materialDescription: "Terrain meshes, river hydrographs, and bridge structure geometry files.",
    materialFileName: "",
    materialFileData: "",
    assignmentTitle: "2D Dam Breach Inundation Model",
    assignmentInstructions: "Simulate spillway outflow and map downstream travel times across the floodplain.",
  },
  {
    id: 4,
    title: "Revit Architecture & BIM Coordination for Modern Construction",
    shortTitle: "Revit & BIM Coordination",
    category: "Design & Analysis",
    theme: "BIM and Modeling",
    duration: "35 Hours",
    level: "Intermediate",
    mode: "Online",
    imageUrl: "/course-revit.jpg",
    instructorName: "Ms. Neha Anil Choudhari",
    instructorDesignation: "BIM Specialist",
    instructorIds: [4],
    startDate: "2026-09-10",
    fee: "₹2,999",
    certificate: "Completion Certificate",
    description: "Parametric 3D building modeling, family creation, clash detection, structural-architectural coordination, and construction scheduling.",
    outcomes: "Build parametric architectural and structural Revit elements;\nExtract automated material quantities and schedules;\nPerform multi-disciplinary clash analysis in Navisworks;\nCreate professional construction documentation sets.",
    brochureName: "",
    brochureData: "",
    status: "Published",
    onlineSessionLink: "",
    onlineSessionDate: "",
    onlineSessionTime: "",
    recordingLink: "",
    materialTitle: "Revit Family Libraries & Model Templates",
    materialDescription: "Pre-configured project templates, beam-column families, and drafting views.",
    materialFileName: "",
    materialFileData: "",
    assignmentTitle: "Commercial Building BIM Model",
    assignmentInstructions: "Model a 4-story RCC building with complete sheets and quantity takeoffs.",
  },
  {
    id: 5,
    title: "Python for Civil & Environmental Engineers: Numerical Modeling to Data Science",
    shortTitle: "Python for Engineers",
    category: "Computational Tools",
    theme: "Scientific Computing",
    duration: "30 Hours",
    level: "Foundation",
    mode: "Online",
    imageUrl: "/domain-computational.jpg",
    instructorName: "Dr. Arpan Pradhan",
    instructorDesignation: "Principal Consultant",
    instructorIds: [1],
    startDate: "2026-09-20",
    fee: "₹1,999",
    certificate: "Completion Certificate",
    description: "From basic scripting to automated civil engineering calculations, spatial analysis with GeoPandas, matrix stress solvers, and statistical insights.",
    outcomes: "Automate repetitive engineering spreadsheet calculations with Python;\nPerform numerical matrix computations using NumPy and SciPy;\nProcess shapefiles and geospatial rasters using GeoPandas and Rasterio;\nGenerate interactive data visualizations and engineering dashboards.",
    brochureName: "",
    brochureData: "",
    status: "Published",
    onlineSessionLink: "",
    onlineSessionDate: "",
    onlineSessionTime: "",
    recordingLink: "",
    materialTitle: "Jupyter Notebooks & Python Scripts",
    materialDescription: "Complete runnable notebooks for concrete design, beam deflection, and GIS workflows.",
    materialFileName: "",
    materialFileData: "",
    assignmentTitle: "Automated Hydrologic Data Pipeline",
    assignmentInstructions: "Write a Python script to ingest rainfall data, calculate intensity-duration curves, and plot results.",
  },
];

export const DEFAULT_WEBINARS: AcademyEvent[] = [
  {
    id: 101,
    title: "Geospatial Tools for Civil Engineering Practice",
    category: "Geospatial Tools",
    theme: "QGIS and Field Mapping",
    description: "A focused technical webinar on how geospatial intelligence, remote sensing, and GIS tools support modern infrastructure design and decision making.",
    date: "2026-07-20",
    time: "18:00 IST",
    mode: "Online (Live)",
    resourcePerson: "Dr. Sovan Sankalp, Dr. Asit Kumar",
    instructorIds: [5, 3],
    fee: "Free",
    certification: "Participation Certificate",
    recordingLink: "",
    imageUrl: "/domain-geospatial.jpg",
    status: "Upcoming",
  },
  {
    id: 102,
    title: "Next-Gen 2D Flood Inundation Modeling with HEC-RAS 6.x",
    category: "Water Resources",
    theme: "Hydraulic Modeling",
    description: "Live demonstration of setting up 2D computational meshes, Manning's roughness spatial layers, and interpreting breach wave velocities.",
    date: "2026-08-10",
    time: "17:00 IST",
    mode: "Online (Live)",
    resourcePerson: "Dr. Arpan Pradhan",
    instructorIds: [1],
    fee: "Free",
    certification: "Participation Certificate",
    recordingLink: "",
    imageUrl: "/course-hydrology.jpg",
    status: "Upcoming",
  },
];

export const DEFAULT_WORKSHOPS: AcademyEvent[] = [
  {
    id: 201,
    title: "Hands-on QGIS & Satellite Terrain Analysis Workshop",
    category: "Geospatial Tools",
    theme: "QGIS",
    description: "An intensive weekend hands-on workshop guiding participants step-by-step from raw satellite GeoTIFFs to publication-quality watershed maps.",
    date: "2026-07-27",
    time: "10:00 IST",
    mode: "Online (Interactive)",
    resourcePerson: "Dr. Sovan Sankalp",
    instructorIds: [5],
    fee: "₹499",
    certification: "Participation Certificate",
    recordingLink: "",
    imageUrl: "/domain-geospatial.jpg",
    status: "Upcoming",
  },
  {
    id: 202,
    title: "Practical Structural Analysis & Code Compliance using SAP2000",
    category: "Structural Engineering",
    theme: "SAP2000",
    description: "Direct practical workshop on applying dead, live, wind, and seismic load combinations to 3D concrete moment frames in SAP2000.",
    date: "2026-08-22",
    time: "10:00 IST",
    mode: "Online (Interactive)",
    resourcePerson: "Dr. Aniket Bhalkikar",
    instructorIds: [2],
    fee: "₹799",
    certification: "Participation Certificate",
    recordingLink: "",
    imageUrl: "/domain-civil.jpg",
    status: "Upcoming",
  },
];

export const DEFAULT_VIDEOS: LearningVideo[] = [
  {
    id: 301,
    title: "Introduction to QGIS: Interface, Projections and Layer Types",
    category: "Geospatial Tools",
    theme: "QGIS",
    description: "A clear primer on understanding vector layers, raster datasets, and setting correct UTM coordinate reference systems.",
    youtubeUrl: "https://www.youtube.com/watch?v=kCmNVtg3D3A",
    thumbnailUrl: "/domain-geospatial.jpg",
    level: "Foundation",
    status: "Published",
  },
  {
    id: 302,
    title: "3D Frame Modeling & Load Assignment in SAP2000",
    category: "Structural Engineering",
    theme: "SAP2000",
    description: "Step-by-step guide on creating grid lines, defining beam/column sections, and applying gravity and lateral load cases.",
    youtubeUrl: "https://www.youtube.com/watch?v=uU3VqgZgI0U",
    thumbnailUrl: "/domain-civil.jpg",
    level: "Intermediate",
    status: "Published",
  },
  {
    id: 303,
    title: "HEC-RAS 2D Hydrodynamic Flood Simulation Walkthrough",
    category: "Water Resources",
    theme: "HEC-RAS",
    description: "Learn how to import terrain surfaces, draw 2D flow computation areas, and view dynamic depth velocity animations.",
    youtubeUrl: "https://www.youtube.com/watch?v=Vl8q4lVjU_Q",
    thumbnailUrl: "/course-hydrology.jpg",
    level: "Intermediate",
    status: "Published",
  },
];

export function loadCourses(onlyPublished = true): Course[] {
  const stored = readStoredArray<Partial<Course>>("terramatrix_courses");
  const data = (stored.length ? stored : DEFAULT_COURSES).map(normalizeCourse);
  return onlyPublished ? data.filter((course) => course.status === "Published") : data;
}

export function loadInstructors(): Instructor[] {
  const stored = readStoredArray<Partial<Instructor>>("terramatrix_instructors");
  const data = (stored.length ? stored : DEFAULT_INSTRUCTORS).map(normalizeInstructor);
  return data
    .filter((item) => item.status !== "Inactive")
    .sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999) || a.name.localeCompare(b.name));
}

export function loadEvents(kind: "webinars" | "workshops"): AcademyEvent[] {
  const stored = readStoredArray<Partial<AcademyEvent>>(`terramatrix_${kind}`);
  const defaults = kind === "webinars" ? DEFAULT_WEBINARS : DEFAULT_WORKSHOPS;
  return (stored.length ? stored : defaults)
    .map(normalizeEvent)
    .filter((item) => item.status !== "Draft");
}

export function loadVideos(): LearningVideo[] {
  const stored = readStoredArray<Partial<LearningVideo>>("terramatrix_learning_videos");
  return (stored.length ? stored : DEFAULT_VIDEOS)
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
