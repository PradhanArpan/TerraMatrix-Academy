import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, X } from "lucide-react";

export interface ConsentPreferences {
  essential: boolean;
  analytics: boolean;
  functional: boolean;
  timestamp: string;
  version: string;
}

const STORAGE_KEY = "tm_consent_preferences";
const CURRENT_VERSION = "2026.1";

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setVisible(true);
      } else {
        const parsed = JSON.parse(stored) as ConsentPreferences;
        if (parsed.version !== CURRENT_VERSION) {
          setVisible(true);
        }
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const savePreferences = (essentialOnly: boolean) => {
    const prefs: ConsentPreferences = {
      essential: true,
      analytics: !essentialOnly,
      functional: !essentialOnly,
      timestamp: new Date().toISOString(),
      version: CURRENT_VERSION,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // Ignore private browsing storage quota exceptions
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      className="tm3-consent-banner"
      role="region"
      aria-label="Privacy and Cookie Consent"
      aria-live="polite"
    >
      <div className="tm3-consent-banner__content">
        <div className="tm3-consent-banner__icon" aria-hidden="true">
          <ShieldCheck size={20} />
        </div>
        <div className="tm3-consent-banner__text">
          <h4>Data Privacy & Engineering Session Notice</h4>
          <p>
            TerraMatrix Academy uses essential local storage to securely manage your learning progress,
            simulations, and session tokens in compliance with India's <strong>Digital Personal Data Protection (DPDP) Act 2023</strong> and
            international data protection standards. Review our{" "}
            <Link to="/privacy">Privacy Notice</Link> and{" "}
            <Link to="/terms">Terms of Service</Link>.
          </p>
        </div>
      </div>
      <div className="tm3-consent-banner__actions">
        <button
          type="button"
          className="tm3-consent-btn tm3-consent-btn--minimal"
          onClick={() => savePreferences(true)}
        >
          Essential Only
        </button>
        <button
          type="button"
          className="tm3-consent-btn tm3-consent-btn--accept"
          onClick={() => savePreferences(false)}
        >
          Accept All
        </button>
        <button
          type="button"
          className="tm3-consent-btn tm3-consent-btn--link"
          onClick={() => setVisible(false)}
          aria-label="Dismiss banner"
        >
          <X size={15} />
        </button>
      </div>
    </aside>
  );
}
