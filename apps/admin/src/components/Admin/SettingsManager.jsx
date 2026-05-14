import React, { useEffect, useState } from "react";
import {
  Film,
  Save,
  Settings as SettingsIcon,
  Trash2,
  Upload,
} from "lucide-react";
import { getStoredAdminPassword } from "../../utils/admin-auth.js";
import { getApiBase, resolveAssetUrl } from "../../utils/api.js";
import { deleteUploadedFile, uploadFile } from "../../utils/upload.js";
import { applyPublicBrandSettings } from "../../config/public-brand.js";

function IosToggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={Boolean(disabled)}
      onClick={() => {
        if (!disabled) onChange(!checked);
      }}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
        checked ? "bg-emerald-500" : "bg-gray-300"
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function ToggleRow({ label, description, checked, onChange, disabled }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50/90 p-4">
      <div className="min-w-0 pr-2">
        <p className="text-xs font-black uppercase tracking-widest text-gray-800">
          {label}
        </p>
        {description ? (
          <p className="mt-1 text-sm leading-snug text-gray-500">{description}</p>
        ) : null}
      </div>
      <IosToggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

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
  siteMedia: {
    joinMovementVideoUrl:
      "https://test-org-site-media-files.nyc3.digitaloceanspaces.com/legacy/wordpress-media/2025/05/banner-video.mp4",
  },
  brevo: {
    newsletterListKey: "newsletter",
    ctaBypassEmailArchitect: false,
    bePartUsesEmailArchitect: false,
    appendGeneralListToCta: false,
    listIdsOverride: "",
    syncSmsAttributeToBrevo: true,
  },
};

const DEFAULT_BREVO_PROVIDER_DRAFT = {
  emailProvider: "smtp",
  brevoApiUrl: "https://api.brevo.com/v3",
  brevoApiKey: "",
  brevoSenderName: "The HBM",
  brevoSenderEmail: "",
  brevoAutomationEnabled: false,
};

export default function SettingsManager() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [activePanel, setActivePanel] = useState("organization");
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("");
  const [mediaUploadStatus, setMediaUploadStatus] = useState("");
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [joinMovementPreviewMode, setJoinMovementPreviewMode] = useState("portrait");
  const [brevoListCatalog, setBrevoListCatalog] = useState([]);
  const [providerDraft, setProviderDraft] = useState(DEFAULT_BREVO_PROVIDER_DRAFT);
  const [providerKeyMeta, setProviderKeyMeta] = useState({
    masked: "",
    source: "none",
  });
  const [brevoConnectionStatus, setBrevoConnectionStatus] = useState("");
  const [testListEmail, setTestListEmail] = useState("");
  const [testListKey, setTestListKey] = useState("");
  const [testListName, setTestListName] = useState("CTA test");
  const [testListStatus, setTestListStatus] = useState("");
  /** Only POST /automation-settings after Brevo tab loaded provider (avoid resetting DB on org-only save). */
  const [providerConfigHydrated, setProviderConfigHydrated] = useState(false);
  const base = getApiBase();

  function mergeSettings(data = {}, fallback = settings) {
    return {
      ...DEFAULT_SETTINGS,
      ...fallback,
      ...data,
      siteMedia: {
        ...DEFAULT_SETTINGS.siteMedia,
        ...(fallback?.siteMedia || {}),
        ...(data?.siteMedia || {}),
      },
      socialLinks: {
        ...DEFAULT_SETTINGS.socialLinks,
        ...(fallback?.socialLinks || {}),
        ...(data?.socialLinks || {}),
      },
      brevo: {
        ...DEFAULT_SETTINGS.brevo,
        ...(fallback?.brevo || {}),
        ...(data?.brevo || {}),
      },
    };
  }

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const response = await fetch(`${base}/api/site-settings`);
        const data = response.ok ? await response.json() : DEFAULT_SETTINGS;
        if (!cancelled) {
          setSettings(mergeSettings(data, DEFAULT_SETTINGS));
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

  function refreshBrevoListCatalog() {
    fetch(`${base}/api/brevo-list-catalog`)
      .then((res) => (res.ok ? res.json() : { entries: [] }))
      .then((data) => {
        setBrevoListCatalog(Array.isArray(data?.entries) ? data.entries : []);
      })
      .catch(() => setBrevoListCatalog([]));
  }

  useEffect(() => {
    refreshBrevoListCatalog();
  }, [base]);

  useEffect(() => {
    if (activePanel !== "brevo" || !base) return;
    let cancelled = false;
    fetch(`${base}/api/automation-settings`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.providerConfig || cancelled) return;
        const pc = data.providerConfig;
        setProviderDraft({
          emailProvider: pc.emailProvider || "smtp",
          brevoApiUrl: pc.brevoApiUrl || "https://api.brevo.com/v3",
          brevoApiKey: "",
          brevoSenderName: pc.brevoSenderName || "The HBM",
          brevoSenderEmail: pc.brevoSenderEmail || "",
          brevoAutomationEnabled: Boolean(pc.brevoAutomationEnabled),
        });
        setProviderKeyMeta({
          masked: pc.brevoApiKeyMasked || "",
          source: pc.brevoApiKeySource || "none",
        });
        setProviderConfigHydrated(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [activePanel, base]);

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

  function updateSiteMedia(field, value) {
    setSettings((current) => ({
      ...current,
      siteMedia: {
        ...current.siteMedia,
        [field]: value,
      },
    }));
  }

  function updateBrevoField(field, value) {
    setSettings((current) => ({
      ...current,
      brevo: {
        ...DEFAULT_SETTINGS.brevo,
        ...(current.brevo || {}),
        [field]: value,
      },
    }));
  }

  async function persistSettings(nextSettings) {
    const response = await fetch(`${base}/api/site-settings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Password": getStoredAdminPassword(),
      },
      body: JSON.stringify(nextSettings),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to save settings");
    }

    const merged = mergeSettings(data.settings || nextSettings, nextSettings);
    setSettings(merged);
    applyPublicBrandSettings(merged);
    return merged;
  }

  async function handleJoinMovementUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadingMedia(true);
    setMediaUploadStatus("Uploading...");

    let uploadedUrl = "";
    try {
      const previousUrl = settings.siteMedia.joinMovementVideoUrl;
      const result = await uploadFile(file, { keyPrefix: "cms/site-settings" });
      if (!result.success || !result.url) {
        throw new Error(result.error || "Upload failed");
      }
      uploadedUrl = result.url;

      const nextSettings = mergeSettings({
        siteMedia: {
          joinMovementVideoUrl: uploadedUrl,
        },
      });

      await persistSettings(nextSettings);
      setJoinMovementPreviewMode("portrait");
      setMediaUploadStatus("Upload complete and saved.");

      if (previousUrl && previousUrl !== uploadedUrl) {
        deleteUploadedFile(previousUrl).catch(() => {});
      }
    } catch (error) {
      console.error("Failed to upload Join The Movement media", error);
      if (uploadedUrl) {
        deleteUploadedFile(uploadedUrl).catch(() => {});
      }
      setMediaUploadStatus(
        error instanceof Error ? error.message : "Upload failed",
      );
    } finally {
      setUploadingMedia(false);
      window.setTimeout(() => setMediaUploadStatus(""), 4000);
    }
  }

  async function clearJoinMovementVideo() {
    const previousUrl = settings.siteMedia.joinMovementVideoUrl;
    try {
      const nextSettings = mergeSettings({
        siteMedia: {
          joinMovementVideoUrl: "",
        },
      });
      await persistSettings(nextSettings);
      setJoinMovementPreviewMode("portrait");
      setMediaUploadStatus("Removed and saved.");

      if (previousUrl) {
        deleteUploadedFile(previousUrl).catch(() => {});
      }
    } catch (error) {
      console.error("Failed to remove Join The Movement media", error);
      setMediaUploadStatus(
        error instanceof Error ? error.message : "Failed to remove media",
      );
    }

    window.setTimeout(() => setMediaUploadStatus(""), 4000);
  }

  async function saveSettings() {
    setSaveStatus("Saving...");
    try {
      await persistSettings(settings);
      if (providerConfigHydrated) {
        const automationRes = await fetch(`${base}/api/automation-settings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Admin-Password": getStoredAdminPassword(),
          },
          body: JSON.stringify({
            providerConfig: {
              emailProvider: providerDraft.emailProvider,
              brevoApiUrl: providerDraft.brevoApiUrl,
              brevoApiKey: providerDraft.brevoApiKey,
              brevoSenderName: providerDraft.brevoSenderName,
              brevoSenderEmail: providerDraft.brevoSenderEmail,
              brevoAutomationEnabled: providerDraft.brevoAutomationEnabled,
            },
          }),
        });
        const automationBody = await automationRes.json().catch(() => ({}));
        if (!automationRes.ok) {
          throw new Error(
            automationBody.error || "Failed to save Email / Brevo provider config",
          );
        }
        setProviderDraft((p) => ({ ...p, brevoApiKey: "" }));
      }
      refreshBrevoListCatalog();
      setSaveStatus("Saved successfully!");
      window.setTimeout(() => setSaveStatus(""), 3000);
    } catch (error) {
      console.error("Failed to save site settings", error);
      setSaveStatus(
        error instanceof Error ? error.message : "Error saving settings",
      );
    }
  }

  async function checkBrevoConnection() {
    setBrevoConnectionStatus("Checking…");
    try {
      const r = await fetch(`${base}/api/providers/status`, {
        headers: { "X-Admin-Password": getStoredAdminPassword() },
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d?.error || "Status check failed");
      setBrevoConnectionStatus(
        d?.brevo?.connected ? "Brevo: connected" : d?.brevo?.message || "Brevo: check",
      );
    } catch (e) {
      setBrevoConnectionStatus(
        e instanceof Error ? e.message : "Brevo check failed",
      );
    }
    window.setTimeout(() => setBrevoConnectionStatus(""), 8000);
  }

  async function sendTestListSubscription() {
    setTestListStatus("Sending…");
    try {
      const r = await fetch(`${base}/api/brevo-test-list-subscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Password": getStoredAdminPassword(),
        },
        body: JSON.stringify({
          email: testListEmail.trim(),
          listKey: testListKey,
          displayName: testListName.trim() || "CTA test",
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d?.error || "Request failed");
      setTestListStatus(
        `Added to list(s) ${JSON.stringify(d.listIds)} — check Brevo automations.`,
      );
    } catch (e) {
      setTestListStatus(e instanceof Error ? e.message : "Failed");
    }
    window.setTimeout(() => setTestListStatus(""), 10000);
  }

  const fieldClassName =
    "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";
  const joinMovementPreviewUrl = resolveAssetUrl(
    settings.siteMedia.joinMovementVideoUrl,
  );

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

      <div className="mb-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setActivePanel("organization")}
          className={`rounded-2xl px-4 py-2 text-xs font-black uppercase tracking-widest transition-colors ${
            activePanel === "organization"
              ? "bg-indigo-600 text-white shadow-lg"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Organization
        </button>
        <button
          type="button"
          onClick={() => setActivePanel("media")}
          className={`rounded-2xl px-4 py-2 text-xs font-black uppercase tracking-widest transition-colors ${
            activePanel === "media"
              ? "bg-indigo-600 text-white shadow-lg"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Site Media
        </button>
        <button
          type="button"
          onClick={() => setActivePanel("brevo")}
          className={`rounded-2xl px-4 py-2 text-xs font-black uppercase tracking-widest transition-colors ${
            activePanel === "brevo"
              ? "bg-indigo-600 text-white shadow-lg"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Brevo
        </button>
      </div>

      {activePanel === "organization" ? (
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
      ) : activePanel === "brevo" ? (
        <div className="space-y-8 max-w-3xl">
          <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-5">
            <h3 className="text-lg font-black text-gray-900">Brevo &amp; CTAs</h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              Mirrors the <strong>Email Architect → Setup → Brevo provider</strong>{" "}
              block for day-to-day ops. Provider credentials are stored in the same
              database row as Email Architect (single source of truth). The{" "}
              <strong>Email Architect bypass</strong> toggle below only affects{" "}
              <em>automatic</em> triggers fired from public registration / newsletter
              forms; you can change it anytime without a deploy.
            </p>
          </div>

          <section className="space-y-5 rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-sm font-black uppercase tracking-widest text-gray-800">
                Brevo provider
              </h4>
              <span className="rounded-full bg-violet-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-violet-700">
                Key: {providerKeyMeta.source}
                {providerKeyMeta.masked ? ` · ${providerKeyMeta.masked}` : ""}
              </span>
            </div>

            <label className="block">
              <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">
                Email provider
              </span>
              <select
                className={fieldClassName}
                value={providerDraft.emailProvider}
                onChange={(e) =>
                  setProviderDraft((p) => ({
                    ...p,
                    emailProvider: e.target.value,
                  }))
                }
              >
                <option value="smtp">SMTP</option>
                <option value="brevo">Brevo</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">
                Brevo API URL
              </span>
              <input
                className={fieldClassName}
                value={providerDraft.brevoApiUrl}
                onChange={(e) =>
                  setProviderDraft((p) => ({
                    ...p,
                    brevoApiUrl: e.target.value,
                  }))
                }
                placeholder="https://api.brevo.com/v3"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">
                Brevo API key override
              </span>
              <input
                type="password"
                className={fieldClassName}
                value={providerDraft.brevoApiKey}
                onChange={(e) =>
                  setProviderDraft((p) => ({
                    ...p,
                    brevoApiKey: e.target.value,
                  }))
                }
                placeholder={
                  providerKeyMeta.masked || "Leave empty to keep current key"
                }
              />
              <p className="mt-2 text-[10px] font-bold text-gray-400">
                Leave empty when saving to keep the existing env or database key.
              </p>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Sender name
                </span>
                <input
                  className={fieldClassName}
                  value={providerDraft.brevoSenderName}
                  onChange={(e) =>
                    setProviderDraft((p) => ({
                      ...p,
                      brevoSenderName: e.target.value,
                    }))
                  }
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Sender email
                </span>
                <input
                  className={fieldClassName}
                  type="email"
                  value={providerDraft.brevoSenderEmail}
                  onChange={(e) =>
                    setProviderDraft((p) => ({
                      ...p,
                      brevoSenderEmail: e.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <ToggleRow
              label="Allow Brevo automation mode (Email flows)"
              description="Lets Email Architect flows use Brevo template / automation delivery modes. Independent of the public CTA bypass below."
              checked={providerDraft.brevoAutomationEnabled}
              onChange={(v) =>
                setProviderDraft((p) => ({ ...p, brevoAutomationEnabled: v }))
              }
            />

            <button
              type="button"
              onClick={checkBrevoConnection}
              className="w-full rounded-xl bg-violet-600 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-violet-700"
            >
              Test Brevo status
            </button>
            {brevoConnectionStatus ? (
              <p className="text-xs font-semibold text-gray-600">
                {brevoConnectionStatus}
              </p>
            ) : null}
          </section>

          <section className="space-y-4 rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
            <h4 className="text-sm font-black uppercase tracking-widest text-gray-800">
              List ID catalog
            </h4>
            <p className="text-sm text-gray-500">
              Optional override of server env{" "}
              <span className="font-mono text-xs">BREVO_LIST_IDS</span>. Same
              format, e.g.{" "}
              <span className="font-mono text-xs">
                general:3,event:5,video:9,newsletter:10
              </span>
              . When filled, this <strong>replaces</strong> the env map for this
              deployment (admin only).
            </p>
            <textarea
              className={`${fieldClassName} min-h-[88px] font-mono text-xs`}
              value={settings.brevo?.listIdsOverride ?? ""}
              onChange={(e) => updateBrevoField("listIdsOverride", e.target.value)}
              placeholder="Leave empty to use BREVO_LIST_IDS from environment"
            />
          </section>

          <section className="space-y-4 rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
            <h4 className="text-sm font-black uppercase tracking-widest text-gray-800">
              Public CTA routing
            </h4>

            <label className="block">
              <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">
                “Be Part” / newsletter list key
              </span>
              <select
                className={fieldClassName}
                value={settings.brevo?.newsletterListKey || ""}
                onChange={(e) =>
                  updateBrevoField("newsletterListKey", e.target.value)
                }
              >
                <option value="">Default (heuristic from catalog)</option>
                {brevoListCatalog.map((entry) => (
                  <option key={entry.key} value={entry.key}>
                    {entry.key} → list #{entry.id}
                  </option>
                ))}
              </select>
            </label>

            <ToggleRow
              label="Sync phone (SMS) to Brevo contacts"
              description="OFF: we do not send the SMS field on Brevo upserts (fewer errors when one phone is used with different emails). The public marketing checkbox will mention email only. Use when you are not running Brevo SMS automations."
              checked={settings.brevo?.syncSmsAttributeToBrevo !== false}
              onChange={(v) => updateBrevoField("syncSmsAttributeToBrevo", v)}
            />

            <ToggleRow
              label="Bypass Email Architect for site CTAs"
              description="ON: experience and video-popup registrations skip local Email Architect triggers (Brevo owns those paths). “Be Part” is controlled separately below."
              checked={Boolean(settings.brevo?.ctaBypassEmailArchitect)}
              onChange={(v) => updateBrevoField("ctaBypassEmailArchitect", v)}
            />

            <ToggleRow
              label="“Be Part” uses Email Architect (onNewsletterSignup)"
              description="When the CTA bypass above is ON, turn this ON to still fire the newsletter trigger through Email Architect while contacts are added to the Brevo list. OFF: only Brevo automations (no local trigger)."
              checked={Boolean(settings.brevo?.bePartUsesEmailArchitect)}
              onChange={(v) => updateBrevoField("bePartUsesEmailArchitect", v)}
            />

            <ToggleRow
              label="Also add “general” list"
              description="When a specific list key is chosen for a CTA, also subscribe to the general id from the catalog (if defined)."
              checked={Boolean(settings.brevo?.appendGeneralListToCta)}
              onChange={(v) => updateBrevoField("appendGeneralListToCta", v)}
            />
          </section>

          <section className="space-y-4 rounded-[1.5rem] border border-amber-100 bg-amber-50/40 p-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-amber-900">
              Test list subscription
            </h4>
            <p className="text-sm text-amber-900/80">
              Creates/updates a contact in Brevo and adds them to the selected list
              — useful to verify list-entry automations without submitting the real
              site form.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-600">
                  Email
                </span>
                <input
                  className={fieldClassName}
                  type="email"
                  value={testListEmail}
                  onChange={(e) => setTestListEmail(e.target.value)}
                  placeholder="you@company.com"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-600">
                  List key
                </span>
                <select
                  className={fieldClassName}
                  value={testListKey}
                  onChange={(e) => setTestListKey(e.target.value)}
                >
                  <option value="">Select…</option>
                  {brevoListCatalog.map((entry) => (
                    <option key={entry.key} value={entry.key}>
                      {entry.key} → #{entry.id}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-600">
                  Display name
                </span>
                <input
                  className={fieldClassName}
                  value={testListName}
                  onChange={(e) => setTestListName(e.target.value)}
                />
              </label>
            </div>
            <button
              type="button"
              onClick={sendTestListSubscription}
              disabled={!testListEmail.trim() || !testListKey}
              className="w-full rounded-xl bg-amber-600 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add test contact to list
            </button>
            {testListStatus ? (
              <p className="text-xs font-semibold text-amber-900">{testListStatus}</p>
            ) : null}
          </section>
        </div>
      ) : (
          <div className="rounded-[2rem] border border-gray-100 bg-gray-50 p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <Film className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-gray-900">
                  Join The Movement Media
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Upload the reel/video shown on the home page under
                  {" "}
                  <span className="font-semibold text-gray-700">
                    Join The Movement
                  </span>
                  . Files are stored in object storage under the site settings media folder.
                  Large site media supports up to 500 MB.
                </p>
              </div>
            </div>

            {mediaUploadStatus ? (
              <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                {mediaUploadStatus}
              </div>
            ) : null}

            <div className="mt-6 space-y-5">
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
                  Movement Video URL
                </span>
                <input
                  className={fieldClassName}
                  value={settings.siteMedia.joinMovementVideoUrl}
                  onChange={(event) =>
                    updateSiteMedia("joinMovementVideoUrl", event.target.value)
                  }
                  placeholder="https://..."
                />
              </label>

              <div className="flex flex-wrap gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-gray-900 px-5 py-3 text-sm font-black uppercase tracking-widest text-white shadow-lg hover:bg-black">
                  <Upload className="h-4 w-4" />
                  {uploadingMedia ? "Uploading..." : "Upload Video"}
                  <input
                    type="file"
                    className="hidden"
                    accept="video/*"
                    onChange={handleJoinMovementUpload}
                    disabled={uploadingMedia}
                  />
                </label>

                <button
                  type="button"
                  onClick={clearJoinMovementVideo}
                  className="inline-flex items-center gap-2 rounded-2xl border border-red-200 px-5 py-3 text-sm font-black uppercase tracking-widest text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </button>
              </div>

              {joinMovementPreviewUrl ? (
                joinMovementPreviewMode === "portrait" ? (
                  <div className="mx-auto w-full max-w-[320px]">
                    <div className="relative aspect-[9/16] overflow-hidden rounded-[2rem] border-[6px] border-gray-900 bg-black shadow-2xl">
                      <video
                        src={joinMovementPreviewUrl}
                        controls
                        muted
                        playsInline
                        onLoadedMetadata={(event) => {
                          const { videoWidth, videoHeight } = event.currentTarget;
                          if (!videoWidth || !videoHeight) return;
                          setJoinMovementPreviewMode(
                            videoHeight > videoWidth ? "portrait" : "landscape",
                          );
                        }}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-black shadow-sm">
                    <video
                      src={joinMovementPreviewUrl}
                      controls
                      muted
                      playsInline
                      onLoadedMetadata={(event) => {
                        const { videoWidth, videoHeight } = event.currentTarget;
                        if (!videoWidth || !videoHeight) return;
                        setJoinMovementPreviewMode(
                          videoHeight > videoWidth ? "portrait" : "landscape",
                        );
                      }}
                      className="aspect-video max-h-[520px] w-full object-contain"
                    />
                  </div>
                )
              ) : (
                <div className="rounded-[2rem] border border-dashed border-gray-300 bg-white px-6 py-12 text-center text-sm font-semibold text-gray-400">
                  No media selected yet.
                </div>
              )}
            </div>
          </div>
      )}
    </div>
  );
}
