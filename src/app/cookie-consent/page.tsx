"use client";

import { useEffect, useState } from "react";
import PublicSiteChrome from "@/components/public-site-chrome";
import CmsPageContent from "@/components/cms-page-content";
import LegalPageLinks from "@/components/legal-page-links";
import { readConsentPreferences, saveConsentPreferences } from "@/lib/consent-preferences";

export default function CookieConsentPage() {
  const [analytics, setAnalytics] = useState(false);
  const [advertising, setAdvertising] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    try {
      const preferences = readConsentPreferences();
      if (preferences) {
        setAnalytics(preferences.analytics);
        setAdvertising(preferences.advertising);
      }
    } catch {
      setStorageError(true);
    } finally {
      setStorageReady(true);
    }
  }, []);

  function savePreferences(nextAnalytics = analytics, nextAdvertising = advertising) {
    try {
      saveConsentPreferences(nextAnalytics, nextAdvertising);
      setAnalytics(nextAnalytics);
      setAdvertising(nextAdvertising);
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
        <CmsPageContent slug="cookie-consent" fallbackTitle="Cookie Policy & Consent Preferences" fallbackIntro="Learn how AIToolss uses essential browser storage, optional analytics and advertising technologies, and how to manage your choices. Last updated: November 6, 2026." preserveChildren>
          <div className="consent-preferences-panel mt-8">
            <div className="consent-preference-row">
              <div><h2>Essential storage</h2><p>Required for core site functions, security and remembering your privacy choices. This category cannot be switched off using this panel.</p></div>
              <label className="consent-toggle"><input type="checkbox" checked disabled readOnly aria-label="Essential storage is always enabled" /><span>Always on</span></label>
            </div>
            <div className="consent-preference-row">
              <div><h2>Analytics</h2><p>Allows Google Analytics measurement tags to load only if you allow this category and an Analytics measurement ID has been configured by AIToolss. Analytics is not currently configured or active.</p></div>
              <label className="consent-toggle"><input type="checkbox" aria-label="Analytics consent" checked={analytics} disabled={!storageReady} onChange={(event) => { setAnalytics(event.target.checked); setSaved(false); }} /><span>{analytics ? "Allowed" : "Off"}</span></label>
            </div>
            <div className="consent-preference-row">
              <div><h2>Advertising</h2><p>Allows Google advertising tags to load only if you allow this category and an AdSense client ID has been configured. AdSense and advertising cookies are not currently configured or active.</p></div>
              <label className="consent-toggle"><input type="checkbox" aria-label="Advertising consent" checked={advertising} disabled={!storageReady} onChange={(event) => { setAdvertising(event.target.checked); setSaved(false); }} /><span>{advertising ? "Allowed" : "Off"}</span></label>
            </div>
            <div className="consent-actions">
              <button type="button" className="consent-secondary-button" onClick={() => savePreferences(false, false)}>Reject optional</button>
              <button type="button" className="consent-primary-button" disabled={!storageReady} onClick={() => savePreferences()}>Save preferences</button>
            </div>
            <p className="consent-status" role="status" aria-live="polite">{storageError ? "This browser could not read or save preferences. Check its storage/privacy settings and try again." : saved ? "Your preferences have been saved in this browser." : storageReady ? "Your current saved choices are shown above. You can change them and save at any time." : "Loading saved preferences…"}</p>
          </div>
          <div className="cms-fallback-body mt-8">
            <h2>1. What cookies and browser storage are</h2>
            <p>Cookies are small values stored by a website in your browser. Local storage is another browser feature that can remember a setting on the device. These technologies can support sign-in, security, preferences, analytics and advertising functions.</p>
            <h2>2. Essential storage</h2>
            <p>Some storage may be necessary for the website to work, maintain supported administrative sessions, protect forms or remember your settings. These functions are not offered as an advertising or cross-site tracking feature.</p>
            <h2>3. Analytics technologies</h2>
            <p>If Google Analytics is introduced, it may use cookies, device or online identifiers and similar technologies to measure visits, interactions and website performance. Google Analytics will be loaded only after the Analytics category is enabled and the measurement ID is configured. At present, no Google Analytics measurement ID is configured and the service is not active.</p>
            <h2>4. Advertising technologies and Google AdSense</h2>
            <p>If Google AdSense or another advertising service is introduced, Google and its partners may use cookies, web beacons, IP addresses or similar identifiers to serve, limit, personalize and measure advertising, prevent fraud and report performance. Third parties may place and read cookies on your browser or use web beacons and IP addresses as a result of ad serving. Advertising tags will be blocked unless the Advertising category is enabled and the relevant integration is configured. At present, AdSense is not configured and advertising is not active.</p>
            <p>Depending on your settings and applicable requirements, ads may be personalized or non-personalized. You can manage Google personalized ads through <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-violet-700 underline">Google Ads Settings</a> and certain participating vendors through <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="font-semibold text-violet-700 underline">aboutads.info choices</a>. You can read <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="font-semibold text-violet-700 underline">how Google uses data from partner sites</a>.</p>
            <h2>5. Consent controls and withdrawal</h2>
            <p>Optional categories are off by default for visitors who have not made a choice. The consent manager stores your selection in this browser and prevents configured Google tags from loading until you allow the relevant category. You can change or withdraw your choice at any time using this page. Clearing browser storage may reset your choice and cause the consent banner to appear again.</p>
            <p>Consent Mode communicates relevant consent signals to supported Google tags. It does not itself provide a consent banner, replace legal advice, or guarantee compliance with every country’s requirements. Before advertising is launched to users in the EEA, United Kingdom or Switzerland, AIToolss must use a Google-certified consent management platform where Google’s publisher rules require one.</p>
            <h2>6. Third-party websites and embedded services</h2>
            <p>When you open an external tool or provider website, that provider may set its own cookies or use similar technologies. AIToolss does not control storage on third-party websites. Review their privacy and cookie notices before using them.</p>
            <h2>7. Managing your browser settings</h2>
            <p>You can change or clear cookies and local storage through your browser settings. Blocking all storage may affect sign-in or other essential functions. You can return to this page at any time to change the optional preferences saved by this browser.</p>
            <h2>8. Related information</h2>
            <p>For broader details about information handling, see the <a href="/privacy" className="font-semibold text-violet-700 underline">Privacy Policy</a>. Use of the site is also governed by the <a href="/terms" className="font-semibold text-violet-700 underline">Terms &amp; Conditions</a> and <a href="/disclaimer" className="font-semibold text-violet-700 underline">Disclaimer</a>. Questions can be sent through <a href="/contact-us" className="font-semibold text-violet-700 underline">Contact Us</a>.</p>
            <h2>9. Updates</h2>
            <p>We may update this page when browser technologies, providers or legal requirements change. The date at the top indicates the latest substantive review.</p>
          </div>
        </CmsPageContent>
        <LegalPageLinks />
      </article></main>
    </PublicSiteChrome>
  );
}
