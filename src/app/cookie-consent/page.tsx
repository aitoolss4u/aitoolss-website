"use client";

import { useEffect, useState } from "react";
import PublicSiteChrome from "@/components/public-site-chrome";

const STORAGE_KEY = "aitoolss-cookie-preferences-v1";

type SavedPreferences = { essential: true; optionalAnalytics: boolean; savedAt: string };

export const metadata = {
  title: "Cookie & Consent Preferences",
  description: "Review the browser storage and optional analytics preferences for AIToolss.",
};

export default function CookieConsentPage() {
  const [optionalAnalytics, setOptionalAnalytics] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const savedPreferences = JSON.parse(raw) as Partial<SavedPreferences>;
        setOptionalAnalytics(savedPreferences.optionalAnalytics === true);
      }
    } catch {
      setStorageError(true);
    } finally {
      setStorageReady(true);
    }
  }, []);

  function savePreferences(nextValue = optionalAnalytics) {
    try {
      const preferences: SavedPreferences = {
        essential: true,
        optionalAnalytics: nextValue,
        savedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      setOptionalAnalytics(nextValue);
      setSaved(true);
      setStorageError(false);
    } catch {
      setSaved(false);
      setStorageError(true);
    }
  }

  return (
    <PublicSiteChrome>
      <main className="info-page">
        <section className="info-article">
          <p className="section-kicker">PRIVACY CONTROLS</p>
          <h1 className="mt-3 text-4xl font-light tracking-tight sm:text-5xl">Cookie &amp; consent preferences.</h1>
          <p className="section-description mt-4 max-w-2xl text-base leading-7">
            Manage the preference saved by this browser. Essential session storage is always available for core site functions. Optional analytics are off by default.
          </p>

          <div className="consent-preferences-panel mt-8">
            <div className="consent-preference-row">
              <div>
                <h2>Essential storage</h2>
                <p>Used for core functions such as maintaining supported sign-in sessions and site security. This setting cannot be switched off here.</p>
              </div>
              <label className="consent-toggle">
                <input type="checkbox" checked disabled readOnly aria-label="Essential storage is always enabled" />
                <span>Always on</span>
              </label>
            </div>
            <div className="consent-preference-row">
              <div>
                <h2>Optional analytics preference</h2>
                <p>Your choice is stored locally in this browser. The current implementation does not load an optional analytics service from this setting, so saving an enabled preference does not activate a tracker by itself.</p>
              </div>
              <label className="consent-toggle">
                <input type="checkbox" checked={optionalAnalytics} disabled={!storageReady} onChange={(event) => { setOptionalAnalytics(event.target.checked); setSaved(false); }} />
                <span>{optionalAnalytics ? "Allowed" : "Off"}</span>
              </label>
            </div>
            <div className="consent-actions">
              <button type="button" className="consent-secondary-button" onClick={() => savePreferences(false)}>Reject optional</button>
              <button type="button" className="consent-primary-button" disabled={!storageReady} onClick={() => savePreferences()}>Save preferences</button>
            </div>
            <p className="consent-status" role="status" aria-live="polite">
              {storageError ? "This browser could not read or save preferences. Check its storage/privacy settings and try again." : saved ? "Your preference has been saved in this browser." : storageReady ? "No changes saved yet." : "Loading saved preference…"}
            </p>
          </div>
          <p className="mt-6 text-sm leading-7 text-muted">
            For details on how the website is intended to handle information, see the <a className="font-semibold text-violet-700 underline underline-offset-4" href="/privacy">Privacy Policy</a>. Cookie and storage behavior may change as site features are added; this page does not represent that unconfigured tracking services are active.
          </p>
        </section>
      </main>
    </PublicSiteChrome>
  );
}
