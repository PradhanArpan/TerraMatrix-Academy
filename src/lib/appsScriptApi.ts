export type ServerError = { message?: string } | Error | string;

type GoogleScriptRunner = {
  withSuccessHandler: (handler: (value: unknown) => void) => GoogleScriptRunner;
  withFailureHandler: (handler: (error: ServerError) => void) => GoogleScriptRunner;
  [key: string]: unknown;
};

declare global {
  interface Window {
    google?: {
      script?: {
        run?: GoogleScriptRunner;
      };
    };
  }
}

export const ADMIN_SESSION_KEY = "terramatrix_admin_token";

export function hasAppsScriptRuntime(): boolean {
  return Boolean(window.google?.script?.run);
}

export function callServer<T>(functionName: string, ...args: unknown[]): Promise<T> {
  return new Promise((resolve, reject) => {
    const runner = window.google?.script?.run;

    if (!runner) {
      reject(new Error("Google Apps Script runtime is unavailable."));
      return;
    }

    const callable = runner
      .withSuccessHandler((value: unknown) => resolve(value as T))
      .withFailureHandler((error: ServerError) => {
        if (typeof error === "string") {
          reject(new Error(error));
          return;
        }

        reject(new Error(error instanceof Error ? error.message : error?.message || "Server request failed."));
      })[functionName];

    if (typeof callable !== "function") {
      reject(new Error(`Server function '${functionName}' is unavailable.`));
      return;
    }

    (callable as (...callArgs: unknown[]) => void)(...args);
  });
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

export function cachePublicBootstrap(data: PublicBootstrapData): void {
  PUBLIC_CACHE_MAP.forEach(([field, storageKey]) => {
    const value = data[field];
    localStorage.setItem(storageKey, JSON.stringify(Array.isArray(value) ? value : []));
  });
  localStorage.setItem("terramatrix_shared_cache_at", new Date().toISOString());
}

export function cacheAdminBootstrap(data: AdminBootstrapData): void {
  cachePublicBootstrap(data);
  localStorage.setItem("terramatrix_enquiries", JSON.stringify(data.enquiries || []));
  localStorage.setItem("terramatrix_enrollments", JSON.stringify(data.enrollments || []));
  localStorage.setItem(
    "terramatrix_event_registrations",
    JSON.stringify(data.eventRegistrations || [])
  );
}

export function getAdminToken(): string {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) || "";
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  sessionStorage.removeItem("terramatrix_admin_login");
}

export async function loadPublicBootstrap(): Promise<PublicBootstrapData> {
  const data = await callServer<PublicBootstrapData>("getPublicCatalogData");
  cachePublicBootstrap(data);
  return data;
}

export async function createAdminSession(password: string): Promise<{ token: string; expiresAt: string }> {
  return callServer("createAdminSession", password);
}

export async function loadAdminBootstrap(token = getAdminToken()): Promise<AdminBootstrapData> {
  const data = await callServer<AdminBootstrapData>("getAdminBootstrap", token);
  cacheAdminBootstrap(data);
  return data;
}

export async function saveAdminRecord<T extends Record<string, unknown>>(
  tableName: string,
  record: T,
  token = getAdminToken()
): Promise<T> {
  return callServer<T>("saveAdminRecord", token, tableName, record);
}

export async function deleteAdminRecord(
  tableName: string,
  recordId: string | number,
  token = getAdminToken()
): Promise<boolean> {
  return callServer<boolean>("deleteAdminRecord", token, tableName, String(recordId));
}

export async function saveAdminMediaRecord<T extends Record<string, unknown>>(
  tableName: "Learning_Videos" | "Webinars" | "Workshops",
  record: T,
  token = getAdminToken()
): Promise<T> {
  return callServer<T>("saveAdminMediaRecord", token, tableName, record);
}

export async function deleteAdminMediaRecord(
  tableName: "Learning_Videos" | "Webinars" | "Workshops",
  recordId: string | number,
  token = getAdminToken()
): Promise<boolean> {
  return callServer<boolean>("deleteAdminMediaRecord", token, tableName, String(recordId));
}

export async function submitPublicEnquiry(record: Record<string, unknown>): Promise<{ success: boolean; id: string }> {
  return callServer("submitPublicEnquiry", record);
}

export async function submitPublicRegistration(record: Record<string, unknown>): Promise<{ success: boolean; id: string }> {
  return callServer("submitPublicRegistration", record);
}
