"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  readConsentPreferences,
  saveConsentPreferences,
  type ConsentPreferences,
} from "@/lib/consent-preferences";

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
  }
}

function ensureGoogleTagQueue() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || ((...args: unknown[]) => { window.dataLayer?.push(args); });
  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });
}

function loadScript(id: string, src: string, attributes?: Record<string, string>) {
  if (document.getElementById(id)) return;
  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  script.dataset.consentManaged = "true";
  Object.entries(attributes || {}).forEach(([key, value]) => script.setAttribute(key, value));
  document.head.appendChild(script);
}

export default function ConsentManager() {
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analyticsChoice, setAnalyticsChoice] = useState(false);
  const [advertisingChoice, setAdvertisingChoice] = useState(false);

  useEffect(() => {
    const saved = readConsentPreferences();
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydrate saved consent from browser storage after mount.
      setPreferences(saved);
      setAnalyticsChoice(saved.analytics);
      setAdvertisingChoice(saved.advertising);
    } else {
      setPreferences({ essential: true, analytics: false, advertising: false, updatedAt: "", version: 2 });
      setShowBanner(true);
    }

    const onConsentUpdated = (event: Event) => {
      const detail = (event as CustomEvent<ConsentPreferences>).detail;
      if (!detail) return;
      setPreferences(detail);
      setAnalyticsChoice(detail.analytics);
      setAdvertisingChoice(detail.advertising);
      setShowBanner(false);
    };
    window.addEventListener("aitoolss:consent-updated", onConsentUpdated);
    return () => window.removeEventListener("aitoolss:consent-updated", onConsentUpdated);
  }, []);

  useEffect(() => {
    if (!preferences) return;

    const analyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID?.trim();
    const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim();
    const hasGoogleService = Boolean((preferences.analytics && analyticsId) || (preferences.advertising && adsenseClient));

    if (analyticsId || adsenseClient) {
      ensureGoogleTagQueue();
      window.gtag?.("consent", "update", {
        analytics_storage: preferences.analytics && analyticsId ? "granted" : "denied",
        ad_storage: preferences.advertising && adsenseClient ? "granted" : "denied",
        ad_user_data: preferences.advertising && adsenseClient ? "granted" : "denied",
        ad_personalization: preferences.advertising && adsenseClient ? "granted" : "denied",
      });
    }

    if (preferences.analytics && analyticsId) {
      loadScript("aitoolss-google-analytics", `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analyticsId)}`);
      window.gtag?.("js", new Date());
      window.gtag?.("config", analyticsId, { anonymize_ip: true });
    } else {
      document.getElementById("aitoolss-google-analytics")?.remove();
    }

    if (preferences.advertising && adsenseClient) {
      loadScript(
        "aitoolss-google-adsense",
        `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(adsenseClient)}`,
        { crossorigin: "anonymous" },
      );
    } else {
      document.getElementById("aitoolss-google-adsense")?.remove();
    }

    if (!hasGoogleService && !analyticsId && !adsenseClient) return;
  }, [preferences]);

  function save(analytics: boolean, advertising: boolean) {
    try {
      const next = saveConsentPreferences(analytics, advertising);
      setPreferences(next);
      setShowBanner(false);
      setCustomizing(false);
    } catch {
      setShowBanner(true);
    }
  }

  if (!showBanner) return null;

  return (
    <section className="site-consent-banner" role="dialog" aria-modal="false" aria-labelledby="site-consent-title">
      <div className="site-consent-copy">
        <p className="site-consent-eyebrow">Your privacy choices</p>
        <h2 id="site-consent-title">Cookies &amp; privacy preferences</h2>
        <p>We use essential storage to run this website. With your permission, we may also use analytics to understand site usage and advertising technologies to support ads. Optional Google tags remain blocked until you choose to allow the relevant category. Read our <Link href="/privacy">Privacy Policy</Link> and <Link href="/cookie-consent">Cookie Policy</Link>.</p>
        {customizing && (
          <div className="site-consent-options">
            <label><input type="checkbox" checked disabled readOnly /> <span><strong>Essential</strong><small>Required for core site functions.</small></span><em>Always on</em></label>
            <label><input type="checkbox" checked={analyticsChoice} onChange={(event) => setAnalyticsChoice(event.target.checked)} /> <span><strong>Analytics</strong><small>Allows Google Analytics measurement if configured.</small></span></label>
            <label><input type="checkbox" checked={advertisingChoice} onChange={(event) => setAdvertisingChoice(event.target.checked)} /> <span><strong>Advertising</strong><small>Allows Google advertising tags if configured.</small></span></label>
          </div>
        )}
      </div>
      <div className="site-consent-actions">
        {customizing ? (
          <>
            <button type="button" className="site-consent-button site-consent-secondary" onClick={() => save(false, false)}>Reject optional</button>
            <button type="button" className="site-consent-button site-consent-primary" onClick={() => save(analyticsChoice, advertisingChoice)}>Save choices</button>
          </>
        ) : (
          <>
            <button type="button" className="site-consent-button site-consent-secondary" onClick={() => save(false, false)}>Reject optional</button>
            <button type="button" className="site-consent-button site-consent-secondary" onClick={() => setCustomizing(true)}>Customize</button>
            <button type="button" className="site-consent-button site-consent-primary" onClick={() => save(true, true)}>Accept all</button>
          </>
        )}
      </div>
    </section>
  );
}
