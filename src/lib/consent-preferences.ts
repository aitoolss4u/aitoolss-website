export const CONSENT_STORAGE_KEY = "aitoolss-cookie-preferences-v2";
export const LEGACY_CONSENT_STORAGE_KEY = "aitoolss-cookie-preferences-v1";

export type ConsentPreferences = {
  essential: true;
  analytics: boolean;
  advertising: boolean;
  updatedAt: string;
  version: 2;
};

export function readConsentPreferences(): ConsentPreferences | null {
  try {
    const current = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (current) {
      const parsed = JSON.parse(current) as Partial<ConsentPreferences>;
      if (parsed.version === 2 && typeof parsed.analytics === "boolean" && typeof parsed.advertising === "boolean") {
        return {
          essential: true,
          analytics: parsed.analytics,
          advertising: parsed.advertising,
          updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
          version: 2,
        };
      }
    }

    const legacy = window.localStorage.getItem(LEGACY_CONSENT_STORAGE_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy) as { optionalAnalytics?: unknown };
      return {
        essential: true,
        analytics: parsed.optionalAnalytics === true,
        advertising: false,
        updatedAt: new Date().toISOString(),
        version: 2,
      };
    }
  } catch {
    return null;
  }
  return null;
}

export function saveConsentPreferences(analytics: boolean, advertising: boolean): ConsentPreferences {
  const preferences: ConsentPreferences = {
    essential: true,
    analytics,
    advertising,
    updatedAt: new Date().toISOString(),
    version: 2,
  };
  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(preferences));
  window.localStorage.removeItem(LEGACY_CONSENT_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("aitoolss:consent-updated", { detail: preferences }));
  return preferences;
}
