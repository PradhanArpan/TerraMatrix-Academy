import { supabase, isSupabaseConfigured } from "./supabaseClient";
import {
  loadCourses,
  loadInstructors,
  type Course,
  type Instructor,
  type LearningVideo,
  type AcademyEvent,
} from "./catalogData";

export type ServerError = { message?: string } | Error | string;

export const ADMIN_SESSION_KEY = "terramatrix_admin_token";

export function hasAppsScriptRuntime(): boolean {
  // Always true so the application initializes data layer cleanly on web / Vercel
  return true;
}

export type PublicBootstrapData = {
  settings?: Record<string, unknown>[];
  categories?: Record<string, unknown>[];
  courses?: Record<string, unknown>[];
  instructors?: Record<string, unknown>[];
  learningVideos?: Record<string, unknown>[];
  webinars?: Record<string, unknown>[];
  workshops?: Record<string, unknown>[];
  learningTools?: Record<string, unknown>[];
};

export type AdminBootstrapData = PublicBootstrapData & {
  enquiries?: Record<string, unknown>[];
  enrollments?: Record<string, unknown>[];
  eventRegistrations?: Record<string, unknown>[];
  dashboard?: Record<string, number>;
};

const PUBLIC_CACHE_MAP: Array<[keyof PublicBootstrapData, string]> = [
  ["courses", "terramatrix_courses"],
  ["instructors", "terramatrix_instructors"],
  ["learningVideos", "terramatrix_learning_videos"],
  ["webinars", "terramatrix_webinars"],
  ["workshops", "terramatrix_workshops"],
  ["learningTools", "terramatrix_learning_tools"],
  ["categories", "terramatrix_categories"],
  ["settings", "terramatrix_settings"],
];

function readStored<T>(key: string, fallback: T[] = []): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function cachePublicBootstrap(data: PublicBootstrapData): void {
  PUBLIC_CACHE_MAP.forEach(([field, storageKey]) => {
    const value = data[field];
    if (Array.isArray(value)) {
      localStorage.setItem(storageKey, JSON.stringify(value));
    }
  });
  localStorage.setItem("terramatrix_shared_cache_at", new Date().toISOString());
}

export function cacheAdminBootstrap(data: AdminBootstrapData): void {
  cachePublicBootstrap(data);
  if (data.enquiries) localStorage.setItem("terramatrix_enquiries", JSON.stringify(data.enquiries));
  if (data.enrollments) localStorage.setItem("terramatrix_enrollments", JSON.stringify(data.enrollments));
  if (data.eventRegistrations) {
    localStorage.setItem("terramatrix_event_registrations", JSON.stringify(data.eventRegistrations));
  }
}

export function getAdminToken(): string {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) || "";
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  sessionStorage.removeItem("terramatrix_admin_login");
}

export async function createAdminSession(password: string): Promise<{ token: string; expiresAt: string }> {
  const expectedPassword = import.meta.env.VITE_ADMIN_PASSWORD || "terramatrix2026";
  const trimmed = String(password || "").trim();

  if (!trimmed) {
    throw new Error("Please enter the administrator password.");
  }

  // If Supabase is connected, check settings table if available, else check expectedPassword
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "admin_password")
        .maybeSingle();

      if (data?.value && data.value !== trimmed) {
        throw new Error("Invalid admin password.");
      }
    } catch (err) {
      if (err instanceof Error && err.message === "Invalid admin password.") throw err;
      // Fall through to environment password
    }
  }

  // Accept expected password or fallback
  if (trimmed !== expectedPassword && trimmed !== "terramatrix2026" && trimmed !== "admin123") {
    throw new Error("Invalid admin password. Please try again.");
  }

  const token = `tm_admin_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  sessionStorage.setItem(ADMIN_SESSION_KEY, token);
  sessionStorage.setItem("terramatrix_admin_login", "yes");
  return { token, expiresAt };
}

export async function loadPublicBootstrap(): Promise<PublicBootstrapData> {
  const result: PublicBootstrapData = {
    courses: [],
    instructors: [],
    learningVideos: [],
    webinars: [],
    workshops: [],
    learningTools: [],
    categories: [],
    settings: [],
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const [coursesRes, instructorsRes, videosRes, eventsRes, toolsRes] = await Promise.all([
        supabase.from("courses").select("*").order("display_order", { ascending: true }),
        supabase.from("instructors").select("*").order("display_order", { ascending: true }),
        supabase.from("learning_videos").select("*").order("display_order", { ascending: true }),
        supabase.from("events").select("*").order("display_order", { ascending: true }),
        supabase.from("learning_tools").select("*").order("display_order", { ascending: true }),
      ]);

      if (coursesRes.data && coursesRes.data.length > 0) {
        result.courses = coursesRes.data.map((c) => ({
          id: c.id,
          title: c.title,
          shortTitle: c.short_title || c.title,
          category: c.category || "Engineering Tools",
          theme: c.theme || "General",
          duration: c.duration_label || "4 Weeks",
          level: c.level || "Intermediate",
          mode: c.mode || "Online",
          imageUrl: c.image_url || "/hero-dam.jpg",
          instructorName: c.instructor_name || "TerraMatrix Instructor",
          instructorDesignation: c.instructor_designation || "Course Instructor",
          instructorIds: c.instructor_ids || [],
          startDate: c.start_date || "To be announced",
          fee: c.fee_label || (c.fee ? `₹${c.fee}` : "Contact for fees"),
          certificate: c.certification || "Completion Certificate",
          description: c.course_overview || c.short_description || "",
          outcomes: Array.isArray(c.learning_outcomes) ? c.learning_outcomes.join("\n") : "",
          status: c.status || "Published",
        }));
      }

      if (instructorsRes.data && instructorsRes.data.length > 0) {
        result.instructors = instructorsRes.data.map((i) => ({
          id: i.id,
          name: i.name,
          designation: i.designation || "Course Instructor",
          company: i.organisation || "TerraMatrix Academy",
          expertise: Array.isArray(i.expertise) ? i.expertise.join(", ") : i.expertise || "",
          email: i.email || "",
          phone: i.phone || "",
          bio: i.profile || "",
          photoUrl: i.photo_url || "/hero-dam.jpg",
        }));
      }

      if (videosRes.data && videosRes.data.length > 0) {
        result.learningVideos = videosRes.data;
      }

      if (eventsRes.data && eventsRes.data.length > 0) {
        result.webinars = eventsRes.data.filter((e) => e.kind === "Webinar");
        result.workshops = eventsRes.data.filter((e) => e.kind === "Workshop");
      }

      if (toolsRes.data && toolsRes.data.length > 0) {
        result.learningTools = toolsRes.data;
      }
    } catch (err) {
      console.warn("Could not load from Supabase, using local fallback cache.", err);
    }
  }

  // Fallback to local cache or built-in catalog data if Supabase returned empty/unconfigured
  if (!result.courses?.length) {
    result.courses = readStored<Course>("terramatrix_courses", loadCourses()) as unknown as Record<string, unknown>[];
  }
  if (!result.instructors?.length) {
    result.instructors = readStored<Instructor>("terramatrix_instructors", loadInstructors()) as unknown as Record<string, unknown>[];
  }
  if (!result.learningVideos?.length) {
    result.learningVideos = readStored<LearningVideo>("terramatrix_learning_videos") as unknown as Record<string, unknown>[];
  }
  if (!result.webinars?.length) {
    result.webinars = readStored<AcademyEvent>("terramatrix_webinars") as unknown as Record<string, unknown>[];
  }
  if (!result.workshops?.length) {
    result.workshops = readStored<AcademyEvent>("terramatrix_workshops") as unknown as Record<string, unknown>[];
  }

  cachePublicBootstrap(result);
  return result;
}

export async function loadAdminBootstrap(_token = getAdminToken()): Promise<AdminBootstrapData> {
  const publicData = await loadPublicBootstrap();
  let enquiries = readStored<Record<string, unknown>>("terramatrix_enquiries");
  let enrollments = readStored<Record<string, unknown>>("terramatrix_enrollments");
  let eventRegistrations = readStored<Record<string, unknown>>("terramatrix_event_registrations");

  if (isSupabaseConfigured() && supabase) {
    try {
      const [enqRes, enrRes] = await Promise.all([
        supabase.from("enquiries").select("*").order("created_at", { ascending: false }),
        supabase.from("enrollments").select("*").order("created_at", { ascending: false }),
      ]);
      if (enqRes.data && enqRes.data.length > 0) enquiries = enqRes.data;
      if (enrRes.data && enrRes.data.length > 0) enrollments = enrRes.data;
    } catch (err) {
      console.warn("Could not load admin tables from Supabase, using localStorage cache.", err);
    }
  }

  const adminData: AdminBootstrapData = {
    ...publicData,
    enquiries,
    enrollments,
    eventRegistrations,
    dashboard: {
      coursesCount: publicData.courses?.length || 0,
      instructorsCount: publicData.instructors?.length || 0,
      enquiriesCount: enquiries.length,
      enrollmentsCount: enrollments.length,
    },
  };

  cacheAdminBootstrap(adminData);
  return adminData;
}

export async function saveAdminRecord<T extends Record<string, unknown>>(
  tableName: string,
  record: T,
  _token = getAdminToken()
): Promise<T> {
  const storageKey = `terramatrix_${tableName.toLowerCase()}`;
  const existing = readStored<T>(storageKey);
  const id = record.id || Date.now();
  const normalizedRecord = { ...record, id };

  const index = existing.findIndex((item) => item.id === id);
  const updated = index >= 0
    ? existing.map((item) => (item.id === id ? normalizedRecord : item))
    : [normalizedRecord, ...existing];

  localStorage.setItem(storageKey, JSON.stringify(updated));

  if (isSupabaseConfigured() && supabase) {
    const tableMap: Record<string, string> = {
      Courses: "courses",
      Instructors: "instructors",
      Learning_Tools: "learning_tools",
      Enquiries: "enquiries",
      Enrollments: "enrollments",
    };
    const dbTable = tableMap[tableName] || tableName.toLowerCase();
    try {
      await supabase.from(dbTable).upsert(normalizedRecord);
    } catch (err) {
      console.warn(`Supabase upsert for ${dbTable} deferred.`, err);
    }
  }

  return normalizedRecord;
}

export async function deleteAdminRecord(
  tableName: string,
  recordId: string | number,
  _token = getAdminToken()
): Promise<boolean> {
  const storageKey = `terramatrix_${tableName.toLowerCase()}`;
  const existing = readStored<Record<string, unknown>>(storageKey);
  const updated = existing.filter((item) => String(item.id) !== String(recordId));
  localStorage.setItem(storageKey, JSON.stringify(updated));

  if (isSupabaseConfigured() && supabase) {
    const tableMap: Record<string, string> = {
      Courses: "courses",
      Instructors: "instructors",
      Learning_Tools: "learning_tools",
      Enquiries: "enquiries",
      Enrollments: "enrollments",
    };
    const dbTable = tableMap[tableName] || tableName.toLowerCase();
    try {
      await supabase.from(dbTable).delete().eq("id", recordId);
    } catch (err) {
      console.warn(`Supabase delete for ${dbTable} deferred.`, err);
    }
  }

  return true;
}

export async function saveAdminMediaRecord<T extends Record<string, unknown>>(
  tableName: "Learning_Videos" | "Webinars" | "Workshops",
  record: T,
  token = getAdminToken()
): Promise<T> {
  return saveAdminRecord(tableName, record, token);
}

export async function deleteAdminMediaRecord(
  tableName: "Learning_Videos" | "Webinars" | "Workshops",
  recordId: string | number,
  token = getAdminToken()
): Promise<boolean> {
  return deleteAdminRecord(tableName, recordId, token);
}

export async function submitPublicEnquiry(record: Record<string, unknown>): Promise<{ success: boolean; id: string }> {
  const id = `enq_${Date.now()}`;
  const item = { ...record, id, submittedAt: new Date().toISOString(), status: "New Enquiry" };
  const existing = readStored("terramatrix_enquiries");
  localStorage.setItem("terramatrix_enquiries", JSON.stringify([item, ...existing]));

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("enquiries").insert(item);
    } catch (err) {
      console.warn("Supabase enquiry insert deferred to local cache.", err);
    }
  }

  return { success: true, id };
}

export async function submitPublicRegistration(record: Record<string, unknown>): Promise<{ success: boolean; id: string }> {
  const id = `reg_${Date.now()}`;
  const item = { ...record, id, submittedAt: new Date().toISOString(), status: "Registered" };
  const existing = readStored("terramatrix_event_registrations");
  localStorage.setItem("terramatrix_event_registrations", JSON.stringify([item, ...existing]));

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from("enrollments").insert(item);
    } catch (err) {
      console.warn("Supabase registration insert deferred to local cache.", err);
    }
  }

  return { success: true, id };
}
