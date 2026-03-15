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
};

export default function SettingsManager() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [activePanel, setActivePanel] = useState("organization");
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("");
  const [mediaUploadStatus, setMediaUploadStatus] = useState("");
  const [uploadingMedia, setUploadingMedia] = useState(false);
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
            siteMedia: {
              ...DEFAULT_SETTINGS.siteMedia,
              ...(data?.siteMedia || {}),
            },
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

  function updateSiteMedia(field, value) {
    setSettings((current) => ({
      ...current,
      siteMedia: {
        ...current.siteMedia,
        [field]: value,
      },
    }));
  }

  async function handleJoinMovementUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadingMedia(true);
    setMediaUploadStatus("Uploading...");

    try {
      const previousUrl = settings.siteMedia.joinMovementVideoUrl;
      const result = await uploadFile(file, { keyPrefix: "cms/site-settings" });
      if (!result.success || !result.url) {
        throw new Error(result.error || "Upload failed");
      }

      updateSiteMedia("joinMovementVideoUrl", result.url);
      setMediaUploadStatus("Upload complete. Save settings to publish.");

      if (previousUrl && previousUrl !== result.url) {
        deleteUploadedFile(previousUrl).catch(() => {});
      }
    } catch (error) {
      console.error("Failed to upload Join The Movement media", error);
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
    updateSiteMedia("joinMovementVideoUrl", "");
    setMediaUploadStatus("Removed. Save settings to publish.");

    if (previousUrl) {
      deleteUploadedFile(previousUrl).catch(() => {});
    }
    window.setTimeout(() => setMediaUploadStatus(""), 4000);
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
        siteMedia: {
          ...DEFAULT_SETTINGS.siteMedia,
          ...((data.settings || settings).siteMedia || {}),
        },
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
      ) : (
        <section className="space-y-6">
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
                <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-black shadow-sm">
                  <video
                    src={joinMovementPreviewUrl}
                    controls
                    muted
                    playsInline
                    className="aspect-[9/16] max-h-[520px] w-full object-cover"
                  />
                </div>
              ) : (
                <div className="rounded-[2rem] border border-dashed border-gray-300 bg-white px-6 py-12 text-center text-sm font-semibold text-gray-400">
                  No media selected yet.
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
