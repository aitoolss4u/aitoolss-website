"use client";

import { useEffect, useState } from "react";
import PublicSiteChrome from "@/components/public-site-chrome";
import CmsPageContent from "@/components/cms-page-content";
import LegalPageLinks from "@/components/legal-page-links";

const STORAGE_KEY = "aitoolss-cookie-preferences-v1";
type SavedPreferences = { essential: true; optionalAnalytics: boolean; savedAt: string };

export default function CookieConsentPage() {
  const [optionalAnalytics, setOptionalAnalytics] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const hydrateSavedPreference = () => {
      if (cancelled) return;
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
    };
    const timer = window.setTimeout(hydrateSavedPreference, 0);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, []);

  function savePreferences(nextValue = optionalAnalytics) {
    try {
      const preferences: SavedPreferences = { essential: true, optionalAnalytics: nextValue, savedAt: new Date().toISOString() };
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
      <main className="info-page"><article className="info-article">
        <CmsPageContent slug="cookie-consent" fallbackTitle="Cookie Policy & Consent Preferences" fallbackIntro="Learn how AIToolss uses essential browser storage, how the optional analytics preference works, and how to manage your choice. Last updated: November 6, 2026." preserveChildren>
          <div className="consent-preferences-panel mt-8">
            <div className="consent-preference-row">
              <div><h2>Essential storage</h2><p>Used for core functions such as supported sign-in sessions, preference storage and site security. This setting cannot be switched off here.</p></div>
              <label className="consent-toggle"><input type="checkbox" checked disabled readOnly aria-label="Essential storage is always enabled" /><span>Always on</span></label>
            </div>
            <div className="consent-preference-row">
              <div><h2>Optional analytics preference</h2><p>Your choice is stored locally in this browser. The current implementation does not load an optional analytics service from this setting, so saving an enabled preference does not activate a tracker by itself.</p></div>
              <label className="consent-toggle"><input type="checkbox" aria-label="Optional analytics preference" checked={optionalAnalytics} disabled={!storageReady} onChange={(event) => { setOptionalAnalytics(event.target.checked); setSaved(false); }} /><span>{optionalAnalytics ? "Allowed" : "Off"}</span></label>
            </div>
            <div className="consent-actions">
              <button type="button" className="consent-secondary-button" onClick={() => savePreferences(false)}>Reject optional</button>
              <button type="button" className="consent-primary-button" disabled={!storageReady} onClick={() => savePreferences()}>Save preferences</button>
            </div>
            <p className="consent-status" role="status" aria-live="polite">{storageError ? "This browser could not read or save preferences. Check its storage/privacy settings and try again." : saved ? "Your preference has been saved in this browser." : storageReady ? "No changes saved yet." : "Loading saved preference…"}</p>
          </div>
          <div className="cms-fallback-body mt-8">
            <h2>1. What cookies and browser storage are</h2>
            <p>Cookies are small values stored by a website in your browser. Local storage is another browser feature that can remember a setting on the device. These technologies can support sign-in, security, preferences and other website functions.</p>
            <h2>2. Essential storage</h2>
            <p>Some storage may be necessary for the website to work, maintain supported administrative sessions, protect forms or remember settings. These functions are not offered as an advertising or cross-site tracking feature.</p>
            <h2>3. Optional analytics</h2>
            <p>The control above stores your optional analytics preference in this browser under the key used by this site. At present, the preference control itself does not load an analytics provider. If analytics are introduced, the implementation must respect applicable consent requirements and this page should identify the provider and purpose before activation.</p>
            <h2>4. Advertising technologies</h2>
            <p>AIToolss does not represent that Google advertising cookies or personalized ads are currently active. If advertising is added, this policy must be updated to identify Google and any other advertising vendors, explain how advertising cookies may be used, and provide applicable personalized-advertising opt-out information. Google users can review <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-violet-700 underline">Google Ads Settings</a>.</p>
            <h2>5. Third-party websites and embedded services</h2>
            <p>When you open an external tool or provider website, that provider may set its own cookies or use similar technologies. AIToolss does not control storage on third-party websites. Review their privacy and cookie notices before using them.</p>
            <h2>6. Managing your browser settings</h2>
            <p>You can change or clear cookies and local storage through your browser settings. Blocking all storage may affect sign-in or other essential functions. You can return to this page at any time to change the optional preference saved by this browser.</p>
            <h2>7. Related information</h2>
            <p>For broader details about information handling, see the <a href="/privacy" className="font-semibold text-violet-700 underline">Privacy Policy</a>. Use of the site is also governed by the <a href="/terms" className="font-semibold text-violet-700 underline">Terms &amp; Conditions</a> and <a href="/disclaimer" className="font-semibold text-violet-700 underline">Disclaimer</a>. Questions can be sent through <a href="/contact-us" className="font-semibold text-violet-700 underline">Contact Us</a>.</p>
            <h2>8. Updates</h2>
            <p>We may update this page when browser technologies, providers or legal requirements change. The date at the top indicates the latest substantive review.</p>
          </div>
        </CmsPageContent>
        <LegalPageLinks />
      </article></main>
    </PublicSiteChrome>
  );
}
