import React, { useEffect, useState } from "react";
import { Save, Settings as SettingsIcon } from "lucide-react";
import { getStoredAdminPassword } from "../../utils/admin-auth.js";
import { getApiBase } from "../../utils/api.js";

const DEFAULT_SETTINGS = {
  organizationName: "The HBM",
  contactEmail: "office@thehbm.org",
  whatsappPhoneE164: "972587073136",
  whatsappPhoneDisplay: "0587073136",
  socialLinks: {
    instagram: "https://www.instagram.com/the__hbm/",
    facebook: "https://www.facebook.com/people/The-HBM/61573100935457/",
    linkedin: "https://www.linkedin.com/company/the-human-being-movement/",
    youtube: "https://www.youtube.com/@TheHBM",
  },
  inquiryWhatsappMessage: "אשמח לקבל פרטים נוספים על הארגון",
};

export default function SettingsManager() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("");
  const base = getApiBase();

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const response = await fetch(`${base}/api/site-settings`);
        const data = response.ok ? await response.json() : DEFAULT_SETTINGS;
        if (!cancelled) {
          setSettings({
            ...DEFAULT_SETTINGS,
            ...data,
            socialLinks: {
              ...DEFAULT_SETTINGS.socialLinks,
              ...(data?.socialLinks || {}),
            },
          });
        }
      } catch (error) {
        console.error("Failed to load site settings", error);
        if (!cancelled) {
          setSettings(DEFAULT_SETTINGS);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSettings();
    return () => {
      cancelled = true;
    };
  }, [base]);

  function updateField(field, value) {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateSocialLink(field, value) {
    setSettings((current) => ({
      ...current,
      socialLinks: {
        ...current.socialLinks,
        [field]: value,
      },
    }));
  }

  async function saveSettings() {
    setSaveStatus("Saving...");
    try {
      const response = await fetch(`${base}/api/site-settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Password": getStoredAdminPassword(),
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to save settings");
      }

      setSettings({
        ...DEFAULT_SETTINGS,
        ...(data.settings || settings),
        socialLinks: {
          ...DEFAULT_SETTINGS.socialLinks,
          ...((data.settings || settings).socialLinks || {}),
        },
      });
      setSaveStatus("Saved successfully!");
      window.setTimeout(() => setSaveStatus(""), 3000);
    } catch (error) {
      console.error("Failed to save site settings", error);
      setSaveStatus("Error saving settings");
    }
  }

  const fieldClassName =
    "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";

  if (loading) {
    return (
      <div className="bg-white rounded-[2rem] shadow-xl p-10 text-sm text-gray-500">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] shadow-xl p-8 md:p-10 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-indigo-600 mb-4">
            <SettingsIcon className="w-4 h-4" />
            Settings
          </div>
          <h2 className="text-3xl font-black text-gray-900">Site Settings</h2>
          <p className="text-sm text-gray-500 mt-2">
            Maintain shared organization contact and social metadata in the DB.
          </p>
        </div>
        <button
          type="button"
          onClick={saveSettings}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-black uppercase tracking-widest text-white shadow-lg hover:bg-indigo-500 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Settings
        </button>
      </div>

      {saveStatus ? (
        <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">
          {saveStatus}
        </div>
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <section className="space-y-5">
          <h3 className="text-lg font-black text-gray-900">Organization</h3>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
              Organization Name
            </span>
            <input
              className={fieldClassName}
              value={settings.organizationName}
              onChange={(event) => updateField("organizationName", event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
              Contact Email
            </span>
            <input
              className={fieldClassName}
              type="email"
              value={settings.contactEmail}
              onChange={(event) => updateField("contactEmail", event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
              WhatsApp E164
            </span>
            <input
              className={fieldClassName}
              value={settings.whatsappPhoneE164}
              onChange={(event) => updateField("whatsappPhoneE164", event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
              WhatsApp Display
            </span>
            <input
              className={fieldClassName}
              value={settings.whatsappPhoneDisplay}
              onChange={(event) => updateField("whatsappPhoneDisplay", event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
              Inquiry WhatsApp Message
            </span>
            <textarea
              className={`${fieldClassName} min-h-[140px]`}
              value={settings.inquiryWhatsappMessage}
              onChange={(event) =>
                updateField("inquiryWhatsappMessage", event.target.value)
              }
            />
          </label>
        </section>

        <section className="space-y-5">
          <h3 className="text-lg font-black text-gray-900">Social Links</h3>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
              Instagram
            </span>
            <input
              className={fieldClassName}
              value={settings.socialLinks.instagram}
              onChange={(event) => updateSocialLink("instagram", event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
              Facebook
            </span>
            <input
              className={fieldClassName}
              value={settings.socialLinks.facebook}
              onChange={(event) => updateSocialLink("facebook", event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
              LinkedIn
            </span>
            <input
              className={fieldClassName}
              value={settings.socialLinks.linkedin}
              onChange={(event) => updateSocialLink("linkedin", event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
              YouTube
            </span>
            <input
              className={fieldClassName}
              value={settings.socialLinks.youtube}
              onChange={(event) => updateSocialLink("youtube", event.target.value)}
            />
          </label>
        </section>
      </div>
    </div>
  );
}
