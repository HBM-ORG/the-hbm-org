import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

class FlowsErrorBoundary extends React.Component {
  state = { hasError: false, retryKey: 0 };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error("FlowsErrorBoundary:", error, info);
  }
  handleRetry = () => {
    this.setState({ hasError: false, retryKey: (s) => s.retryKey + 1 });
  };
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex items-center justify-center p-10 bg-[#f8f9fc]">
          <div className="bg-white border border-gray-200 rounded-2xl p-10 max-w-md text-center shadow-lg">
            <h3 className="text-lg font-black text-gray-800 mb-2">
              Connection Error
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              The Flows panel could not load. Check your connection and try
              again.
            </p>
            <button
              type="button"
              onClick={this.handleRetry}
              className="bg-gray-900 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return React.cloneElement(React.Children.only(this.props.children), {
      key: this.state.retryKey,
    });
  }
}
import {
  Calendar,
  MapPin,
  Edit3,
  Trash2,
  Plus,
  GripVertical,
  Image as ImageIcon,
  Video,
  Contrast,
  Heart,
  History,
  Users,
  Star,
  ArrowLeft,
  Palette,
  HelpCircle,
  Download,
  Database,
  BarChart3,
  ExternalLink,
  Save,
  Copy,
  Settings,
  Eye,
  Upload,
  Mail,
  Smartphone,
  Monitor,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Wand2,
  Zap,
  X,
  MonitorPlay,
  Lock,
  Unlock,
  AlignLeft,
  Activity,
  Flame,
  RefreshCw,
  ShieldCheck,
  Filter,
  UserCircle,
  List,
} from "lucide-react";
import VisualEventEditor from "../components/Admin/VisualEventEditor";
import CtaFormFieldsEditor from "../components/Admin/CtaFormFieldsEditor";
import EmailEngine from "../components/Admin/EmailEngine";
import SiteContentManager from "../components/Admin/SiteContentManager";
import AnalyticsDashboard from "../components/Admin/AnalyticsDashboard";
import CookieConsentLogs from "../components/Admin/CookieConsentLogs";
import SettingsManager from "../components/Admin/SettingsManager.jsx";
import { useEvents } from "../context/EventsContext";
import { getApiBase, resolveAssetUrl } from "../utils/api";
import { getStoredAdminPassword } from "../utils/admin-auth.js";
import { deleteUploadedFile, uploadFile } from "../utils/upload";
import { useAdminAuth } from "../hooks/useAdminAuth.js";
import { toDateTimeLocalValue } from "../utils/datetime-local.js";

const AdminDashboard = () => {
  const {
    checkingAuth,
    error,
    isAuthenticated,
    login,
    password,
    setPassword,
  } = useAdminAuth();

  const { events: initialEvents, setEvents: setGlobalEvents } = useEvents();
  const [events, setEvents] = useState(initialEvents);
  const [isEditing, setIsEditing] = useState(false);
  const [isVisualEditing, setIsVisualEditing] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [saveStatus, setSaveStatus] = useState("");
  const [galleryImages, setGalleryImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({});
  const [registrationsList, setRegistrationsList] = useState([]);
  const [automationConfig, setAutomationConfig] = useState(null);
  const [emailEngineStatus, setEmailEngineStatus] = useState("loading"); // 'loading', 'online', 'error'
  const [videoEventConfig, setVideoEventConfig] = useState(null);
  const [brevoListCatalog, setBrevoListCatalog] = useState([]);
  const [activeFlowId, setActiveFlowId] = useState("registration_confirmed");
  const [previewDevice, setPreviewDevice] = useState("desktop");

  const [activeTab, setActiveTab] = useState("essentials");
  const [topView, setTopView] = useState("events");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEvent, setFilterEvent] = useState("all");
  const [filterSource, setFilterSource] = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [crmViewMode, setCrmViewMode] = useState("byPerson"); // 'byPerson' | 'byRegistration'
  const [crmSortBy, setCrmSortBy] = useState("countDesc"); // countDesc | countAsc | name | lastDateDesc | lastDateAsc
  const [selectedContactEmail, setSelectedContactEmail] = useState(null);
  const [contactProfileData, setContactProfileData] = useState(null);
  const [contactProfileLoading, setContactProfileLoading] = useState(false);
  const [contactProfileError, setContactProfileError] = useState(null);
  const [contactSyncStatus, setContactSyncStatus] = useState("");
  const [crmConfirmDialog, setCrmConfirmDialog] = useState(null);

  const refetchRegistrations = () => {
    const base = getApiBase();
    fetch(`${base}/api/registrations`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setRegistrationsList(Array.isArray(data) ? data : []))
      .catch(() => setRegistrationsList([]));
  };

  const deleteRegistrationsForContact = async (email) => {
    const normalizedEmail = String(email || "").trim();
    if (!normalizedEmail) return;
    const base = getApiBase();
    const response = await fetch(
      `${base}/api/registrations/by-contact?email=${encodeURIComponent(normalizedEmail)}`,
      {
        method: "DELETE",
        headers: {
          "X-Admin-Password": getStoredAdminPassword(),
        },
      },
    );
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body?.error || "Failed to delete contact registrations");
    }
    if (
      selectedContactEmail &&
      selectedContactEmail.toLowerCase() === normalizedEmail.toLowerCase()
    ) {
      setSelectedContactEmail(null);
    }
    refetchRegistrations();
  };

  const deleteRegistrationRecord = async (registrationId, registrationEmail) => {
    if (!registrationId) return;
    const base = getApiBase();
    const response = await fetch(`${base}/api/registrations/${registrationId}`, {
      method: "DELETE",
      headers: {
        "X-Admin-Password": getStoredAdminPassword(),
      },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body?.error || "Failed to delete registration");
    }
    refetchRegistrations();
    if (
      selectedContactEmail &&
      String(registrationEmail || "").toLowerCase().trim() ===
        selectedContactEmail.toLowerCase()
    ) {
      setContactProfileData((prev) =>
        prev
          ? {
              ...prev,
              registrations: (prev.registrations || []).filter(
                (x) => x.id !== registrationId,
              ),
            }
          : null,
      );
    }
  };

  const loadContactProfile = useCallback((email, { reset = false } = {}) => {
    const normalizedEmail = String(email || "").trim();
    if (!normalizedEmail) return;
    const encodedEmail = encodeURIComponent(normalizedEmail);
    const base = getApiBase() || "";
    const url = base
      ? `${base.replace(/\/$/, "")}/api/crm/contact?email=${encodedEmail}`
      : `/api/crm/contact?email=${encodedEmail}`;
    setContactProfileLoading(true);
    if (reset) {
      setContactProfileData(null);
      setContactProfileError(null);
    }
    fetch(url)
      .then((res) => {
        if (!res.ok)
          return res
            .json()
            .then((body) =>
              Promise.reject({ message: body?.error || res.statusText, status: res.status }),
            );
        return res.json();
      })
      .then((data) => {
        if (data && data.contact) {
          setContactProfileData(data.contact);
          setContactProfileError(null);
        } else {
          setContactProfileData(null);
          setContactProfileError("Invalid response");
        }
      })
      .catch((err) => {
        console.error("[CRM profile fetch failed]", err);
        setContactProfileData(null);
        setContactProfileError(err?.message || "Network error");
      })
      .finally(() => setContactProfileLoading(false));
  }, []);

  const handleProviderResync = async (email) => {
    const normalizedEmail = String(email || "").trim();
    if (!normalizedEmail) return;
    setContactSyncStatus("Resyncing providers...");
    try {
      const base = getApiBase() || "";
      const response = await fetch(
        `${base}/api/providers/contact/resync`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Admin-Password": getStoredAdminPassword(),
          },
          body: JSON.stringify({ email: normalizedEmail }),
        },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Failed to resync providers");
      }
      setContactSyncStatus("Provider sync complete.");
      loadContactProfile(normalizedEmail, { reset: false });
    } catch (error) {
      console.error(error);
      setContactSyncStatus(
        error instanceof Error ? error.message : "Provider sync failed",
      );
    } finally {
      window.setTimeout(() => setContactSyncStatus(""), 4000);
    }
  };

  // Sync local events when context updates (e.g. after API fetch on load) so list doesn't revert
  useEffect(() => {
    if (!isEditing && Array.isArray(initialEvents)) {
      setEvents(initialEvents);
    }
  }, [initialEvents, isEditing]);

  useEffect(() => {
    const base = getApiBase();

    fetch(`${base}/api/registrations/stats`)
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => setStats(data || {}))
      .catch(() => setStats({}));

    fetch(`${base}/api/registrations`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setRegistrationsList(Array.isArray(data) ? data : []))
      .catch(() => setRegistrationsList([]));

    fetch(`${base}/api/automation-settings`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && (data.flows || data.smtp !== undefined)) {
          setAutomationConfig(data);
          setEmailEngineStatus("online");
        } else {
          setEmailEngineStatus("error");
        }
      })
      .catch(() => setEmailEngineStatus("error"));

    fetch(`${base}/api/video-event`, {
      headers: (() => {
        const pw = getStoredAdminPassword();
        return pw ? { "X-Admin-Password": pw } : {};
      })(),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setVideoEventConfig(data))
      .catch(() => {});

    fetch(`${base}/api/brevo-list-catalog`)
      .then((res) => (res.ok ? res.json() : { entries: [] }))
      .then((data) =>
        setBrevoListCatalog(Array.isArray(data?.entries) ? data.entries : []),
      )
      .catch(() => setBrevoListCatalog([]));
  }, []);

  useEffect(() => {
    if (!selectedContactEmail) {
      setContactProfileData(null);
      setContactProfileError(null);
      return;
    }
    loadContactProfile(selectedContactEmail, { reset: true });
  }, [loadContactProfile, selectedContactEmail]);

  // Aggregate registrations by person (email or phone+name)
  const contactsAggregated = useMemo(() => {
    const list = Array.isArray(registrationsList) ? registrationsList : [];
    const byKey = new Map();
    list.forEach((reg) => {
      const email = (reg.email || "").trim().toLowerCase();
      const key =
        email ||
        `${(reg.phone || "").trim()}_${(reg.name || "").toLowerCase().trim()}`;
      if (!key) return;
      if (!byKey.has(key)) {
        byKey.set(key, {
          key,
          name: reg.name || "—",
          email: reg.email || "",
          phone: reg.phone || "",
          registrations: [],
          eventIds: [],
          eventNames: [],
          sources: [],
        });
      }
      const c = byKey.get(key);
      c.registrations.push(reg);
      if (reg.eventId && !c.eventIds.includes(reg.eventId))
        c.eventIds.push(reg.eventId);
      if (reg.eventName && !c.eventNames.includes(reg.eventName))
        c.eventNames.push(reg.eventName);
      if (reg.source && !c.sources.includes(reg.source))
        c.sources.push(reg.source);
    });
    return Array.from(byKey.values()).map((c) => ({
      ...c,
      count: c.registrations.length,
      lastDate: c.registrations.length
        ? c.registrations.reduce(
            (max, r) => (new Date(r.date) > new Date(max) ? r.date : max),
            c.registrations[0].date,
          )
        : null,
    }));
  }, [registrationsList]);

  const applyCrmFilters = (items, isContactList) => {
    const search = (searchTerm || "").toLowerCase().trim();
    const from = filterDateFrom ? new Date(filterDateFrom) : null;
    const to = filterDateTo ? new Date(filterDateTo) : null;
    return items.filter((item) => {
      const regs = isContactList ? item.registrations : [item];
      const matchSearch =
        !search ||
        (item.name || "").toLowerCase().includes(search) ||
        (item.email || "").toLowerCase().includes(search) ||
        (item.phone || "").toLowerCase().includes(search);
      const matchEvent =
        filterEvent === "all" ||
        regs.some(
          (r) => (r.eventId || "").toString() === filterEvent.toString(),
        );
      const matchSource =
        filterSource === "all" ||
        regs.some(
          (r) => (r.source || "").toLowerCase() === filterSource.toLowerCase(),
        );
      const matchDate =
        (!from && !to) ||
        regs.some((r) => {
          const d = r.date ? new Date(r.date) : null;
          if (!d) return false;
          if (from && d < from) return false;
          if (to && d > to) return false;
          return true;
        });
      return matchSearch && matchEvent && matchSource && matchDate;
    });
  };

  const sortedContacts = useMemo(() => {
    const filtered = applyCrmFilters(contactsAggregated, true);
    const sorted = [...filtered];
    switch (crmSortBy) {
      case "countDesc":
        sorted.sort((a, b) => b.count - a.count);
        break;
      case "countAsc":
        sorted.sort((a, b) => a.count - b.count);
        break;
      case "name":
        sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "lastDateDesc":
        sorted.sort(
          (a, b) => new Date(b.lastDate || 0) - new Date(a.lastDate || 0),
        );
        break;
      case "lastDateAsc":
        sorted.sort(
          (a, b) => new Date(a.lastDate || 0) - new Date(b.lastDate || 0),
        );
        break;
      default:
        sorted.sort((a, b) => b.count - a.count);
    }
    return sorted;
  }, [
    contactsAggregated,
    crmViewMode,
    searchTerm,
    filterEvent,
    filterSource,
    filterDateFrom,
    filterDateTo,
    crmSortBy,
  ]);

  const filteredRegistrations = useMemo(() => {
    const filtered = applyCrmFilters(registrationsList, false);
    return [...filtered].sort(
      (a, b) => new Date(b.date || 0) - new Date(a.date || 0),
    );
  }, [
    registrationsList,
    searchTerm,
    filterEvent,
    filterSource,
    filterDateFrom,
    filterDateTo,
  ]);

  const uniqueSources = useMemo(() => {
    const set = new Set();
    (registrationsList || []).forEach((r) => r.source && set.add(r.source));
    return Array.from(set).sort();
  }, [registrationsList]);

  const handleLogin = async (e) => {
    e.preventDefault();
    await login();
  };

  const handleEdit = (event, mode = "standard") => {
    if (event.isLocked && mode !== "view") {
      alert("This event is locked. Please unlock it first to edit.");
      return;
    }
    if (!event.folderName) {
      event.folderName = `event-${event.id}-${Date.now()}`;
    }
    setCurrentEvent(event);
    setIsEditing(true);
    setIsVisualEditing(mode === "visual");
    setActiveTab("essentials");
    setGalleryImages(Array.isArray(event.gallery) ? event.gallery : []);
  };

  const handleDelete = (id) => {
    const event = events.find((e) => e.id === id);
    if (event?.isLocked) {
      alert("This event is locked. Please unlock it first before deleting.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this event?")) {
      const updatedEvents = events.filter((e) => e.id !== id);
      setEvents(updatedEvents);
      saveToBackend(updatedEvents);
    }
  };

  const handleToggleLock = (event) => {
    const updatedEvents = events.map((e) => {
      if (e.id === event.id) {
        return { ...e, isLocked: !e.isLocked };
      }
      return e;
    });
    setEvents(updatedEvents);
    saveToBackend(updatedEvents);
  };

  const handleDuplicate = (event) => {
    if (event.isLocked) {
      alert("This event is locked. Unlock it first to duplicate.");
      return;
    }
    const newId = Math.max(...events.map((e) => Number(e.id) || 0)) + 1;
    const duplicatedEvent = {
      ...event,
      id: newId,
      title: {
        en: `Copy of ${event.title.en || event.title}`,
        he: event.title.he,
      },
      status: "draft",
    };
    const updatedEvents = [duplicatedEvent, ...events];
    setEvents(updatedEvents);
    saveToBackend(updatedEvents);
    handleEdit(duplicatedEvent);
  };

  const handleAddNew = () => {
    const newId =
      events.length > 0
        ? Math.max(...events.map((e) => Number(e.id) || 0)) + 1
        : 1;
    const folderName = `event-${Date.now()}`;

    setCurrentEvent({
      id: newId,
      title: { en: "New Event", he: "אירוע חדש" },
      date: "2026-01-01",
      location: "HBM office, Raanana",
      description: { en: "Description here...", he: "תיאור כאן..." },
      image: "",
      folderName: folderName,
      imageCount: 0,
      registrationLink: "",
      gallery: [],
      participants: 0,
      tags: [],
      status: "draft",
      heroVideo: "",
      partners: [],
      faqs: [],
      highlights: [],
      socialProof: { capacity: 50, attendingCount: 0 },
      hostNote: { message: "", author: "The HBM Team" },
      locationParams: { addressText: "", googleMapsEmbedUrl: "" },
      registration: { status: "open", externalUrl: "", whatsappLink: "" },
      visuals: { brightness: 100, blur: 0, videoScale: 1 },
    });
    setGalleryImages([]);
    setIsEditing(true);
    setIsVisualEditing(false);
    setActiveTab("essentials");
  };

  const handleSaveEvent = (e) => {
    if (e) e.preventDefault();
    const existing = events.find((ev) => ev.id === currentEvent.id);
    // Preserve isLocked and other meta from existing event so lock survives save/refresh
    const eventToSave = {
      ...currentEvent,
      imageCount: galleryImages.length,
      ...(existing && {
        isLocked: existing.isLocked,
      }),
    };
    let updatedEvents;
    if (existing) {
      updatedEvents = events.map((ev) =>
        ev.id === eventToSave.id ? eventToSave : ev,
      );
    } else {
      updatedEvents = [eventToSave, ...events];
    }
    updatedEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
    setEvents(updatedEvents);
    if (!isVisualEditing) setIsEditing(false);
    saveToBackend(updatedEvents);
  };

  const exportToCSV = () => {
    const isByPerson = crmViewMode === "byPerson";
    const dataToExport = isByPerson ? sortedContacts : filteredRegistrations;
    if (dataToExport.length === 0)
      return alert("No data to export for current filters");
    const headers = isByPerson
      ? [
          "Name",
          "Email",
          "Phone",
          "RegistrationCount",
          "Events",
          "Sources",
          "LastRegistration",
        ]
      : [
          "Name",
          "Email",
          "Phone",
          "Source",
          "Event",
          "EventId",
          "Date",
          "Status",
          "Language",
        ];
    const rows = isByPerson
      ? dataToExport.map((contact) => [
          `"${(contact.name || "").replace(/"/g, '""')}"`,
          `"${(contact.email || "").replace(/"/g, '""')}"`,
          `"${(contact.phone || "").replace(/"/g, '""')}"`,
          `"${String(contact.count || 0).replace(/"/g, '""')}"`,
          `"${(contact.eventNames || []).join(" | ").replace(/"/g, '""')}"`,
          `"${(contact.sources || []).join(" | ").replace(/"/g, '""')}"`,
          `"${contact.lastDate ? new Date(contact.lastDate).toLocaleString() : ""}"`,
        ])
      : dataToExport.map((r) => [
          `"${(r.name || "").replace(/"/g, '""')}"`,
          `"${(r.email || "").replace(/"/g, '""')}"`,
          `"${(r.phone || "").replace(/"/g, '""')}"`,
          `"${(r.source || "").replace(/"/g, '""')}"`,
          `"${(r.eventName || "").replace(/"/g, '""')}"`,
          `"${(r.eventId || "").toString().replace(/"/g, '""')}"`,
          `"${r.date ? new Date(r.date).toLocaleString() : ""}"`,
          `"${r.status || "confirmed"}"`,
          `"${r.language || ""}"`,
        ]);
    const csvContent =
      "\uFEFF" +
      headers.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.body.appendChild(document.createElement("a"));
    link.href = url;
    link.download = `HBM_CRM_Export_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    document.body.removeChild(link);
  };

  const saveToBackend = async (data) => {
    setSaveStatus("Saving...");
    try {
      const base = getApiBase();
      const adminPassword = getStoredAdminPassword();
      const apiUrl = `${base}/api/save-events`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Password": adminPassword,
        },
        body: JSON.stringify({ events: data }),
      });
      const result = await response.json();
      if (result.success) {
        setSaveStatus("Saved successfully!");
        setGlobalEvents(data);
        setTimeout(() => setSaveStatus(""), 3000);
      }
    } catch (err) {
      console.error(err);
      setSaveStatus("Error saving");
    }
  };

  const saveVideoEventToBackend = async () => {
    setSaveStatus("Saving...");
    try {
      const base = getApiBase();
      const adminPassword = getStoredAdminPassword();
      const response = await fetch(`${base}/api/video-event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Password": adminPassword,
        },
        body: JSON.stringify(videoEventConfig),
      });
      const result = await response.json();
      if (result.success) {
        setSaveStatus("Saved successfully!");
        setTimeout(() => setSaveStatus(""), 3000);
      }
    } catch (err) {
      console.error(err);
      setSaveStatus("Error saving");
    }
  };

  const MEDIA_GALLERY_MAX = 20;

  const handleGalleryUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter((f) =>
      (f.type || "").startsWith("image/"),
    );
    if (imageFiles.length === 0) {
      alert(
        "Media Gallery accepts only images (e.g. JPG, PNG). Please select image files.",
      );
      e.target.value = "";
      return;
    }
    if (imageFiles.length < files.length) {
      alert(
        `${files.length - imageFiles.length} non-image file(s) were skipped. Only images are allowed in Media Gallery.`,
      );
    }

    const galleryList = currentEvent.gallery || [];
    const currentCount = galleryList.length;
    if (currentCount >= MEDIA_GALLERY_MAX) {
      alert(
        `Media Gallery is limited to ${MEDIA_GALLERY_MAX} items. Remove some to add more.`,
      );
      e.target.value = "";
      return;
    }

    let folderName = currentEvent.folderName;
    if (!folderName) {
      folderName = `event-${currentEvent.id || Date.now()}`;
      handleChange("folderName", folderName);
    }

    setUploading(true);
    const addedPaths = [];
    try {
      const maxToAdd = MEDIA_GALLERY_MAX - currentCount;
      for (let i = 0; i < Math.min(imageFiles.length, maxToAdd); i++) {
        const result = await uploadFile(imageFiles[i], {
          keyPrefix: `events/${folderName}`,
        });

        if (!result.success || !result.url) {
          alert(result.error || "Upload failed");
          continue;
        }
        addedPaths.push(result.url);
      }
      if (addedPaths.length > 0) {
        const newGallery = [
          ...(currentEvent.gallery || []),
          ...addedPaths,
        ].slice(0, MEDIA_GALLERY_MAX);
        handleChange("gallery", newGallery);
      }
      if (files.length > maxToAdd && maxToAdd > 0) {
        alert(
          `Only ${maxToAdd} item(s) added. Media Gallery max is ${MEDIA_GALLERY_MAX}.`,
        );
      }
    } catch (err) {
      console.error("Bulk upload error:", err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteImage = (galleryItem) => {
    if (!window.confirm("Remove this item from the gallery?")) return;
    const newGallery = (currentEvent.gallery || []).filter(
      (item) => item !== galleryItem,
    );
    handleChange("gallery", newGallery);
    const filename = galleryItem.includes("/")
      ? galleryItem.split("/").pop()
      : galleryItem;
    const folderName = currentEvent.folderName;
    if (folderName && filename) {
      deleteUploadedFile(galleryItem).catch((err) => console.error(err));
    }
  };

  const handleAssetUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const folderName = currentEvent?.folderName || "video-event";
    try {
      const keyPrefix =
        type === "partners"
          ? `events/${folderName}/partners`
          : `events/${folderName}`;
      const result = await uploadFile(file, { keyPrefix });
      if (result.success && result.url) {
        const fullPath = result.url;

        if (currentEvent && currentEvent.folderName) {
          if (type === "hero") handleChange("heroVideo", fullPath);
          if (type === "thumbnail") handleChange("thumbnail", fullPath);
          if (type === "image") handleChange("image", fullPath);
          if (type === "partners") {
            const newPartner = {
              name: "New Partner",
              logo: fullPath,
              website: "",
            };
            handleChange("partners", [
              ...(currentEvent.partners || []),
              newPartner,
            ]);
          }
        } else if (type === "videoEventImage") {
          setVideoEventConfig((prev) => ({ ...prev, image: fullPath }));
        }
      } else {
        console.error("Asset upload failed", result.error);
      }
    } catch (err) {
      console.error("Asset upload failed", err);
    }
  };

  const handleChange = (field, value, lang = null) => {
    if (lang) {
      setCurrentEvent((prev) => ({
        ...prev,
        [field]: { ...prev[field], [lang]: value },
      }));
    } else {
      setCurrentEvent((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleNestedChange = (parent, field, value) => {
    setCurrentEvent((prev) => ({
      ...prev,
      [parent]: { ...(prev[parent] || {}), [field]: value },
    }));
  };

  const handleVisualUpdate = (field, value) => {
    setCurrentEvent((prev) => {
      if (field.includes(".")) {
        const parts = field.split(".");
        if (parts.length === 2) {
          const [parent, child] = parts;
          return { ...prev, [parent]: { ...prev[parent], [child]: value } };
        } else if (parts.length === 3) {
          const [parent, index, child] = parts;
          if (Array.isArray(prev[parent])) {
            const newArray = [...prev[parent]];
            newArray[parseInt(index)] = {
              ...newArray[parseInt(index)],
              [child]: value,
            };
            return { ...prev, [parent]: newArray };
          }
        }
      }
      return { ...prev, [field]: value };
    });
  };

  const handleArrayChange = (field, index, subfield, value) => {
    const newArray = [...(currentEvent[field] || [])];
    newArray[index] = { ...newArray[index], [subfield]: value };
    handleChange(field, newArray);
  };

  const addArrayItem = (field, template) => {
    handleChange(field, [...(currentEvent[field] || []), template]);
  };

  const removeArrayItem = (field, index) => {
    const newArray = [...(currentEvent[field] || [])];
    newArray.splice(index, 1);
    handleChange(field, newArray);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-96 text-center">
          <div
            className="mx-auto mb-4 w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
          <p className="text-xs font-black uppercase tracking-widest text-gray-500">
            Restoring session
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-96">
          <h2 className="text-2xl font-bold mb-6 text-center tracking-tighter uppercase font-black">
            Admin Protocol
          </h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Access Key"
              className="w-full p-4 bg-gray-50 border rounded-xl font-bold text-center"
            />
            {error && (
              <p className="text-red-500 text-xs font-bold text-center uppercase tracking-widest">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all"
            >
              Authenticate
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD] p-8 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
              <Heart className="w-8 h-8 text-purple-600 fill-purple-600/20" />{" "}
              Event Architect
            </h1>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1 ml-11">
              Command Center v4.2.0
            </p>
          </div>

          {emailEngineStatus === "error" && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-800 font-medium">
                Backend offline. Start it with:{" "}
                <code className="bg-amber-100 px-2 py-0.5 rounded text-xs font-mono">
                  npm run dev:admin
                </code>{" "}
                so Email Architect, Site Content, and CRM data load from the
                server.
              </p>
            </div>
          )}
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border">
            <a
              href="/"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-purple-600 font-bold transition-colors text-xs uppercase tracking-widest"
            >
              <ExternalLink className="w-4 h-4" /> Live Site
            </a>
            <div className="w-px h-6 bg-gray-100"></div>
            {saveStatus && (
              <span className="font-bold text-[10px] text-green-600 uppercase tracking-widest px-3">
                {saveStatus}
              </span>
            )}
            <button
              onClick={handleAddNew}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Experience
            </button>
          </div>
        </div>

        {!isEditing && (
          <div className="flex bg-gray-100/50 backdrop-blur-sm self-start p-1.5 rounded-2xl border border-white/40 shadow-inner mb-8 w-fit">
            <button
              onClick={() => setTopView("events")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${topView === "events" ? "bg-white text-gray-900 shadow-xl" : "text-gray-400 hover:text-gray-600"}`}
            >
              <Calendar className="w-4 h-4" /> Experiences
            </button>
            <button
              onClick={() => setTopView("registrations")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${topView === "registrations" ? "bg-white text-gray-900 shadow-xl" : "text-gray-400 hover:text-gray-600"}`}
            >
              <Database className="w-4 h-4" /> CRM Database
            </button>
            <button
              onClick={() => setTopView("emails")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative ${topView === "emails" ? "bg-white text-purple-600 shadow-xl" : "text-gray-400 hover:text-gray-600"}`}
            >
              <Zap className="w-4 h-4" /> Email Architect
              {/* Status Indicator */}
              <span
                className={`absolute right-2 top-2 w-2 h-2 rounded-full ${emailEngineStatus === "online" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : emailEngineStatus === "error" ? "bg-red-500 animate-pulse" : "bg-yellow-500"}`}
                title={`Engine Status: ${emailEngineStatus}`}
              />
            </button>
            <div className="w-px h-8 bg-gray-200 mx-2 self-center"></div>
            <button
              onClick={() => setTopView("videoevent")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${topView === "videoevent" ? "bg-white text-red-500 shadow-xl" : "text-gray-400 hover:text-red-400"}`}
            >
              <MonitorPlay className="w-4 h-4" /> Video Event
            </button>
            <div className="w-px h-8 bg-gray-200 mx-2 self-center"></div>
            <button
              onClick={() => setTopView("content")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${topView === "content" ? "bg-white text-emerald-600 shadow-xl" : "text-gray-400 hover:text-emerald-500"}`}
            >
              <AlignLeft className="w-4 h-4" /> Site Content
            </button>
            <div className="w-px h-8 bg-gray-200 mx-2 self-center"></div>
            <button
              onClick={() => setTopView("analytics")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${topView === "analytics" ? "bg-white text-orange-500 shadow-xl" : "text-gray-400 hover:text-orange-400"}`}
            >
              <Activity className="w-4 h-4" /> Analytics
            </button>
            <div className="w-px h-8 bg-gray-200 mx-2 self-center"></div>
            <button
              onClick={() => setTopView("cookies")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${topView === "cookies" ? "bg-white text-blue-600 shadow-xl" : "text-gray-400 hover:text-blue-500"}`}
            >
              <ShieldCheck className="w-4 h-4" /> Cookie Logs
            </button>
            <div className="w-px h-8 bg-gray-200 mx-2 self-center"></div>
            <button
              onClick={() => setTopView("settings")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${topView === "settings" ? "bg-white text-indigo-600 shadow-xl" : "text-gray-400 hover:text-indigo-500"}`}
            >
              <Settings className="w-4 h-4" /> Settings
            </button>
          </div>
        )}

        <div className="main-viewport">
          {topView === "content" && !isEditing && (
            <div className="animate-in fade-in duration-500">
              <SiteContentManager />
            </div>
          )}
          {topView === "emails" && !isEditing && (
            <div className="h-[calc(100vh-250px)] animate-in fade-in slide-in-from-bottom-4 duration-500">
              <FlowsErrorBoundary>
                <EmailEngine />
              </FlowsErrorBoundary>
            </div>
          )}
          {topView === "analytics" && !isEditing && (
            <div className="h-[calc(100vh-250px)] animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white rounded-[2rem] shadow-xl overflow-hidden">
              <AnalyticsDashboard
                onOpenCookieLogs={() => setTopView("cookies")}
              />
            </div>
          )}
          {topView === "cookies" && !isEditing && (
            <div className="h-[calc(100vh-250px)] animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CookieConsentLogs />
            </div>
          )}
          {topView === "settings" && !isEditing && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SettingsManager />
            </div>
          )}
          {!isEditing && topView === "events" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
              {events.map((event, idx) => (
                <div
                  key={event.id}
                  className={`bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border group ${idx === 0 ? "border-amber-400 ring-4 ring-amber-400/20 scale-[1.02]" : "border-gray-100"}`}
                >
                  {idx === 0 && (
                    <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white text-center text-[10px] font-black uppercase tracking-widest py-1">
                      ✨ Next Experience
                    </div>
                  )}
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    {(() => {
                      const toSrc = (path) =>
                        !path
                          ? path
                          : resolveAssetUrl(
                              path.startsWith("/") || path.startsWith("http")
                                ? path
                                : `/${path}`,
                            );
                      if (event.thumbnail || event.image) {
                        return (
                          <img
                            src={toSrc(event.thumbnail || event.image)}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.style.display = "none";
                              const fallback = e.target.nextElementSibling;
                              if (fallback) fallback.classList.remove("hidden");
                            }}
                          />
                        );
                      }
                      if (event.heroVideo) {
                        return (
                          <video
                            src={toSrc(event.heroVideo)}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            playsInline
                            autoPlay
                            onError={(e) => {
                              e.target.style.display = "none";
                              const fallback = e.target.nextElementSibling;
                              if (fallback) fallback.classList.remove("hidden");
                            }}
                          />
                        );
                      }
                      return (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ImageIcon className="w-12 h-12" />
                        </div>
                      );
                    })()}
                    <div className="hidden w-full h-full absolute inset-0 flex items-center justify-center text-gray-300 bg-gray-100">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2 items-center">
                      <button
                        onClick={() => handleEdit(event, "visual")}
                        className={`bg-white/90 backdrop-blur p-2 rounded-lg shadow-sm transition-all ${event.isLocked ? "opacity-50 cursor-not-allowed" : "hover:bg-white"}`}
                        disabled={event.isLocked}
                        title={
                          event.isLocked ? "Event is locked" : "Visual edit"
                        }
                      >
                        <Palette className="w-4 h-4 text-purple-600" />
                      </button>
                      {event.isLocked && (
                        <span className="px-2 py-1 rounded text-[10px] font-black uppercase bg-amber-100 text-amber-800 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-black uppercase ${event.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                      >
                        {event.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                        {event.title.en || event.title}
                      </h3>
                      <button
                        onClick={() => handleToggleLock(event)}
                        title={event.isLocked ? "Unlock Event" : "Lock Event"}
                        className={`p-1.5 rounded-lg transition-colors ${event.isLocked ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}
                      >
                        {event.isLocked ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          <Unlock className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 font-bold mb-4 flex items-center gap-1 uppercase tracking-widest">
                      <Calendar className="w-3 h-3 text-purple-400" />{" "}
                      {new Date(event.date).toLocaleDateString("he-IL")}
                    </p>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-blue-50/50 p-3 rounded-xl text-center">
                        <span className="block text-2xl font-black text-blue-600">
                          {stats[event.id] || 0}
                        </span>
                        <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">
                          Regs
                        </span>
                      </div>
                      <div className="bg-purple-50/50 p-3 rounded-xl text-center">
                        <span className="block text-2xl font-black text-purple-600">
                          {event.imageCount || 0}
                        </span>
                        <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest">
                          Photos
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(event)}
                        className={`flex-1 ${event.isLocked ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gray-900 hover:bg-black text-white"} py-3 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 shadow-sm transition-all tracking-widest`}
                      >
                        <Settings className="w-4 h-4" /> Manage
                      </button>
                      <button
                        onClick={() => handleDuplicate(event)}
                        className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-all font-bold tracking-widest"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className={`p-3 rounded-xl transition-all font-bold tracking-widest ${event.isLocked ? "bg-gray-100 text-gray-300 cursor-not-allowed" : "bg-red-50 text-red-500 hover:bg-red-100"}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isEditing && topView === "registrations" && (
            <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden animate-in fade-in duration-500 border">
              <div className="p-8 border-b border-gray-100 bg-gray-50/30">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter">
                      Community Intelligence
                    </h2>
                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">
                      {crmViewMode === "byPerson"
                        ? `${sortedContacts.length} contacts · ${registrationsList.length} total registrations`
                        : `${filteredRegistrations.length} registrations`}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setCrmViewMode("byPerson")}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${crmViewMode === "byPerson" ? "bg-gray-900 text-white shadow-lg" : "bg-white border text-gray-500 hover:bg-gray-50"}`}
                    >
                      <UserCircle className="w-4 h-4" /> By person
                    </button>
                    <button
                      onClick={() => setCrmViewMode("byRegistration")}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${crmViewMode === "byRegistration" ? "bg-gray-900 text-white shadow-lg" : "bg-white border text-gray-500 hover:bg-gray-50"}`}
                    >
                      <List className="w-4 h-4" /> By registration
                    </button>
                    <button
                      onClick={exportToCSV}
                      className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-green-100 ml-2"
                    >
                      <Download className="w-4 h-4" /> Export
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[180px] max-w-[240px]">
                    <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search name, email, phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-white border rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold w-full"
                    />
                  </div>
                  <select
                    value={filterEvent}
                    onChange={(e) => setFilterEvent(e.target.value)}
                    className="bg-white border rounded-xl px-4 py-2.5 text-xs font-bold"
                  >
                    <option value="all">All events</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title?.en || ev.title || ev.id}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value)}
                    className="bg-white border rounded-xl px-4 py-2.5 text-xs font-bold"
                  >
                    <option value="all">All sources</option>
                    {uniqueSources.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={filterDateFrom}
                      onChange={(e) => setFilterDateFrom(e.target.value)}
                      className="bg-white border rounded-xl px-3 py-2 text-[10px] font-bold"
                      title="From date"
                    />
                    <span className="text-gray-400 text-[10px]">–</span>
                    <input
                      type="date"
                      value={filterDateTo}
                      onChange={(e) => setFilterDateTo(e.target.value)}
                      className="bg-white border rounded-xl px-3 py-2 text-[10px] font-bold"
                      title="To date"
                    />
                  </div>
                  <select
                    value={crmSortBy}
                    onChange={(e) => setCrmSortBy(e.target.value)}
                    className="bg-white border rounded-xl px-4 py-2.5 text-xs font-bold flex items-center gap-1"
                  >
                    <option value="countDesc">Most registrations first</option>
                    <option value="countAsc">Fewest registrations first</option>
                    <option value="name">Name A–Z</option>
                    <option value="lastDateDesc">Newest activity first</option>
                    <option value="lastDateAsc">Oldest activity first</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                {crmViewMode === "byPerson" ? (
                  <table className="w-full text-sm text-left">
                    <thead className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50 border-b">
                      <tr>
                        <th className="px-8 py-4">Contact</th>
                        <th className="px-8 py-4">Email / Phone</th>
                        <th className="px-8 py-4 text-center">
                          # Registrations
                        </th>
                        <th className="px-8 py-4">Events</th>
                        <th className="px-8 py-4">Last registration</th>
                        <th className="px-8 py-4">Sources</th>
                        <th className="px-8 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {sortedContacts.map((contact) => (
                        <tr
                          key={contact.key}
                          className="hover:bg-blue-50/30 transition-colors"
                        >
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center font-black text-purple-600 text-[10px] shrink-0">
                                {(contact.name || "?")
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div className="font-black text-gray-900 text-xs min-w-0">
                                {contact.name}
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="text-gray-600 font-bold text-xs">
                              {contact.email || "—"}
                            </div>
                            <div className="text-gray-400 text-[10px]">
                              {contact.phone || "—"}
                            </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-xl bg-purple-100 text-purple-700 font-black text-sm">
                              {contact.count}
                            </span>
                          </td>
                          <td className="px-8 py-5 max-w-[200px]">
                            <div className="flex flex-wrap gap-1">
                              {contact.eventNames.slice(0, 3).map((e) => (
                                <span
                                  key={e}
                                  className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[9px] font-bold truncate max-w-[120px]"
                                  title={e}
                                >
                                  {e}
                                </span>
                              ))}
                              {contact.eventNames.length > 3 && (
                                <span
                                  className="text-[9px] text-gray-400 font-bold"
                                  title={contact.eventNames.join(", ")}
                                >
                                  +{contact.eventNames.length - 3}
                                </span>
                              )}
                              {contact.eventNames.length === 0 && (
                                <span className="text-gray-300 text-[9px]">
                                  —
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-5 text-[10px] text-gray-500 font-bold">
                            {contact.lastDate
                              ? new Date(contact.lastDate).toLocaleDateString(
                                  undefined,
                                  { dateStyle: "short" },
                                )
                              : "—"}
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-wrap gap-1">
                              {contact.sources.map((s) => (
                                <span
                                  key={s}
                                  className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[8px] font-black uppercase"
                                >
                                  {s}
                                </span>
                              ))}
                              {contact.sources.length === 0 && (
                                <span className="text-gray-300 text-[9px]">
                                  —
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedContactEmail(
                                    (contact.email || "").trim() || null,
                                  )
                                }
                                className="text-[10px] font-bold text-[#6160AB] hover:underline uppercase tracking-wider"
                              >
                                View profile
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const email = (contact.email || "").trim();
                                  if (!email) return;
                                  setCrmConfirmDialog({
                                    title: "Delete Contact",
                                    message: `Delete all ${contact.count} registration(s) for this contact?`,
                                    confirmLabel: "Delete Contact",
                                    action: "deleteContact",
                                    email,
                                  });
                                }}
                                className="text-[10px] font-bold text-red-600 hover:underline uppercase tracking-wider"
                              >
                                Delete contact
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {sortedContacts.length === 0 && (
                        <tr>
                          <td
                            colSpan="7"
                            className="px-8 py-20 text-center text-gray-400 font-bold uppercase text-xs italic tracking-widest"
                          >
                            No contacts match filters
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-sm text-left">
                    <thead className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50 border-b">
                      <tr>
                        <th className="px-8 py-4">Participant</th>
                        <th className="px-8 py-4">Email / Phone</th>
                        <th className="px-8 py-4">Event</th>
                        <th className="px-8 py-4">Date</th>
                        <th className="px-8 py-4">Source</th>
                        <th className="px-8 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredRegistrations.map((reg, idx) => (
                        <tr
                          key={reg.id || idx}
                          className="hover:bg-blue-50/30 transition-colors"
                        >
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center font-black text-purple-600 text-[10px]">
                                {(reg.name || "?")
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div className="font-black text-gray-900 text-xs">
                                {reg.name}
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="text-gray-600 font-bold text-xs">
                              {reg.email || "—"}
                            </div>
                            <div className="text-gray-400 text-[10px]">
                              {reg.phone || "—"}
                            </div>
                          </td>
                          <td className="px-8 py-5 text-[10px] font-bold text-gray-600">
                            {reg.eventName || "—"}
                          </td>
                          <td className="px-8 py-5 text-[10px] text-gray-500">
                            {reg.date
                              ? new Date(reg.date).toLocaleString(undefined, {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                })
                              : "—"}
                          </td>
                          <td className="px-8 py-5">
                            <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-[8px] font-black uppercase">
                              {reg.source || "Direct"}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedContactEmail(
                                    (reg.email || "").trim() || null,
                                  )
                                }
                                className="text-[10px] font-bold text-[#6160AB] hover:underline uppercase tracking-wider"
                              >
                                View contact
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!reg.id) return;
                                  setCrmConfirmDialog({
                                    title: "Delete Registration",
                                    message: "Delete this registration?",
                                    confirmLabel: "Delete Registration",
                                    action: "deleteRegistration",
                                    registrationId: reg.id,
                                    registrationEmail: reg.email || "",
                                  });
                                }}
                                className="text-[10px] font-bold text-red-600 hover:underline uppercase tracking-wider"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredRegistrations.length === 0 && (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-8 py-20 text-center text-gray-400 font-bold uppercase text-xs italic tracking-widest"
                          >
                            No registrations match filters
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {selectedContactEmail && (
            <div
              className="fixed inset-0 z-50 flex justify-end bg-black/30"
              onClick={() => setSelectedContactEmail(null)}
              onKeyDown={(e) => e.key === "Escape" && setSelectedContactEmail(null)}
              role="dialog"
              aria-modal="true"
              aria-label="Contact profile"
            >
              <div
                className="w-full max-w-lg bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300"
                onClick={(e) => e.stopPropagation()}
                role="document"
              >
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
                  <h3 className="text-lg font-black text-gray-900">
                    Contact profile
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedContactEmail(null)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6">
                  {contactProfileLoading ? (
                    <div className="py-12 text-center text-gray-500 font-bold">
                      Loading profile…
                    </div>
                  ) : !contactProfileData ? (
                    <div className="py-8 px-4 text-center">
                      <p className="text-red-600 font-bold mb-2">
                        Could not load profile.
                      </p>
                      {contactProfileError && (
                        <p className="text-sm text-gray-500 mb-2">
                          {contactProfileError}
                        </p>
                      )}
                      {(import.meta.env.DEV || contactProfileError === "API Endpoint not found") && (
                        <p className="text-xs text-gray-400 mt-4 max-w-[280px] mx-auto leading-relaxed">
                          {contactProfileError === "API Endpoint not found"
                            ? "סגור את השרת (Ctrl+C) והרץ שוב: npm run dev — כך גם Vite (4200) וגם השרת (3001) עולים עם ה-route /api/crm/contact. אם זו סביבת פריסה, העלה מחדש את שירות ה-API."
                            : "הרץ את השרת על פורט 3001 (npm run dev מריץ גם אותו). הבקשות ל-/api עוברות דרך הפרוקסי."}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setContactProfileError(null);
                          const email = selectedContactEmail;
                          if (!email) return;
                          loadContactProfile(email, { reset: false });
                        }}
                        className="mt-4 px-4 py-2 rounded-xl bg-[#6160AB] text-white text-xs font-bold uppercase tracking-wider hover:opacity-90"
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
                        <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center font-black text-purple-600 text-lg">
                          {(contactProfileData.name || "?")
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-gray-900">
                            {contactProfileData.name || "—"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {contactProfileData.email || "—"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {contactProfileData.phone || "—"}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {contactProfileData.registrationCount
                              || contactProfileData.registrations?.length
                              || 0}{" "}
                            registration(s)
                          </p>
                        </div>
                      </div>
                      {contactSyncStatus ? (
                        <div className="mb-6 rounded-2xl border border-[#6160AB]/15 bg-[#6160AB]/5 px-4 py-3 text-xs font-bold text-[#6160AB]">
                          {contactSyncStatus}
                        </div>
                      ) : null}
                      <section className="mb-6">
                        <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">
                          Connected systems
                        </h4>
                        <div className="grid gap-3">
                          {["brevo", "espocrm"].map((providerKey) => {
                            const sync = (contactProfileData.providerSyncs || []).find(
                              (entry) => entry.provider === providerKey,
                            );
                            const providerMeta =
                              contactProfileData.providerStatus?.[providerKey] || {};
                            const isConfigured = Boolean(providerMeta.configured);
                            return (
                              <div
                                key={providerKey}
                                className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-gray-900">
                                      {providerKey === "brevo" ? "Brevo" : "EspoCRM"}
                                    </p>
                                    <p className="mt-1 text-[11px] text-gray-500">
                                      {sync?.syncStatus
                                        ? `Sync: ${sync.syncStatus}`
                                        : isConfigured
                                          ? "Configured but not synced yet"
                                          : "Not configured"}
                                    </p>
                                  </div>
                                  <span
                                    className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${
                                      sync?.isBlocklisted || sync?.isUnsubscribed
                                        ? "bg-red-50 text-red-600"
                                        : sync?.syncStatus === "synced"
                                          ? "bg-green-50 text-green-600"
                                          : "bg-gray-200 text-gray-500"
                                    }`}
                                  >
                                    {sync?.isBlocklisted
                                      ? "Blocklisted"
                                      : sync?.isUnsubscribed
                                        ? "Unsubscribed"
                                        : sync?.syncStatus || "idle"}
                                  </span>
                                </div>
                                <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] text-gray-600">
                                  <div>
                                    <span className="block text-[9px] font-black uppercase tracking-widest text-gray-400">
                                      Last sync
                                    </span>
                                    <span>
                                      {sync?.lastSyncedAt
                                        ? new Date(sync.lastSyncedAt).toLocaleString()
                                        : "—"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="block text-[9px] font-black uppercase tracking-widest text-gray-400">
                                      Last event
                                    </span>
                                    <span>
                                      {sync?.lastEventType || "—"}
                                      {sync?.lastEventAt
                                        ? ` · ${new Date(sync.lastEventAt).toLocaleDateString()}`
                                        : ""}
                                    </span>
                                  </div>
                                </div>
                                {sync?.lastError ? (
                                  <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-[11px] text-red-600">
                                    {sync.lastError}
                                  </p>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      </section>
                      <section className="mb-6">
                        <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">
                          Registrations
                        </h4>
                        <div className="rounded-xl border border-gray-100 overflow-hidden">
                          <table className="w-full text-xs">
                            <thead className="bg-gray-50 text-[10px] font-black text-gray-500 uppercase">
                              <tr>
                                <th className="px-3 py-2 text-left">Event</th>
                                <th className="px-3 py-2 text-left">Date</th>
                                <th className="px-3 py-2 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {(contactProfileData.registrations || []).map(
                                (r) => (
                                  <tr key={r.id}>
                                    <td className="px-3 py-2 font-bold text-gray-700">
                                      {r.eventName || "—"}
                                    </td>
                                    <td className="px-3 py-2 text-gray-500">
                                      {r.date
                                        ? new Date(r.date).toLocaleDateString(
                                            undefined,
                                            { dateStyle: "short" },
                                          )
                                        : "—"}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (!r.id) return;
                                          setCrmConfirmDialog({
                                            title: "Delete Registration",
                                            message: "Delete this registration?",
                                            confirmLabel: "Delete Registration",
                                            action: "deleteRegistration",
                                            registrationId: r.id,
                                            registrationEmail: r.email || "",
                                          });
                                        }}
                                        className="text-[10px] font-bold text-red-600 hover:underline"
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </tr>
                                ),
                              )}
                            </tbody>
                          </table>
                        </div>
                      </section>
                      {(contactProfileData.emailActivity?.length > 0) && (
                        <section className="mb-6">
                          <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">
                            Email activity
                          </h4>
                          <ul className="space-y-1 text-xs text-gray-600">
                            {contactProfileData.emailActivity.map((a) => (
                              <li
                                key={a.id}
                                className="flex justify-between items-center py-1 border-b border-gray-50"
                              >
                                <span>
                                  {a.stepType || a.flowId || "—"} ·{" "}
                                  {a.status || "—"}
                                </span>
                                <span className="text-gray-400 text-[10px]">
                                  {a.sentAt
                                    ? new Date(a.sentAt).toLocaleDateString(
                                        undefined,
                                        { dateStyle: "short" },
                                      )
                                    : "—"}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </section>
                      )}
                      {(contactProfileData.contactSubmissions?.length > 0) && (
                        <section className="mb-6">
                          <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">
                            Contact submissions
                          </h4>
                          <div className="space-y-3">
                            {contactProfileData.contactSubmissions.map((entry) => (
                              <div
                                key={entry.id}
                                className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    {entry.type || "General"}
                                  </span>
                                  <span className="text-[10px] text-gray-400">
                                    {entry.createdAt
                                      ? new Date(entry.createdAt).toLocaleString()
                                      : "—"}
                                  </span>
                                </div>
                                <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                                  {entry.message}
                                </p>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}
                      {(contactProfileData.providerTimeline?.length > 0) && (
                        <section className="mb-6">
                          <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">
                            Provider timeline
                          </h4>
                          <ul className="space-y-2 text-xs text-gray-600">
                            {contactProfileData.providerTimeline.map((entry) => (
                              <li
                                key={entry.id}
                                className="rounded-2xl border border-gray-100 bg-white px-4 py-3"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <span className="font-black text-gray-800 uppercase tracking-wide text-[10px]">
                                    {entry.provider} · {entry.eventType}
                                  </span>
                                  <span className="text-[10px] text-gray-400">
                                    {entry.createdAt
                                      ? new Date(entry.createdAt).toLocaleString()
                                      : "—"}
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </section>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleProviderResync(contactProfileData.email)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-[10px] font-black uppercase tracking-wider hover:opacity-90"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Resync providers
                        </button>
                        <a
                          href={`${getApiBase() || ""}/api/crm/contact/export?email=${encodeURIComponent(contactProfileData.email)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6160AB] text-white text-[10px] font-black uppercase tracking-wider hover:opacity-90"
                        >
                          <Download className="w-4 h-4" />
                          Export profile
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setCrmConfirmDialog({
                              title: "Delete Contact",
                              message: "Delete all registrations for this contact?",
                              confirmLabel: "Delete Contact",
                              action: "deleteContact",
                              email: contactProfileData.email,
                            });
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase tracking-wider hover:opacity-90"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete contact
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {crmConfirmDialog && (
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4"
              onClick={() => setCrmConfirmDialog(null)}
              role="dialog"
              aria-modal="true"
              aria-label={crmConfirmDialog.title}
            >
              <div
                className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl border border-gray-100"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-black text-gray-900">
                  {crmConfirmDialog.title}
                </h3>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                  {crmConfirmDialog.message}
                </p>
                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setCrmConfirmDialog(null)}
                    className="rounded-2xl border border-gray-200 px-5 py-3 text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const dialog = crmConfirmDialog;
                      setCrmConfirmDialog(null);
                      try {
                        if (dialog.action === "deleteContact") {
                          await deleteRegistrationsForContact(dialog.email);
                        } else if (dialog.action === "deleteRegistration") {
                          await deleteRegistrationRecord(
                            dialog.registrationId,
                            dialog.registrationEmail,
                          );
                        }
                      } catch (error) {
                        console.error(error);
                      }
                    }}
                    className="rounded-2xl bg-red-500 px-5 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-red-600"
                  >
                    {crmConfirmDialog.confirmLabel}
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isEditing && topView === "videoevent" && videoEventConfig?.title && (
            <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden animate-in fade-in duration-500 border p-8">
              <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
                    <MonitorPlay className="w-6 h-6 text-red-500" />
                    Video Event Configuration
                  </h2>
                  <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">
                    Controls the popup registration on the events page
                  </p>
                </div>
                <button
                  onClick={saveVideoEventToBackend}
                  className="bg-red-500 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>

              <div className="mb-8 flex items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-gray-50/80 p-5">
                <div className="min-w-0 pr-2">
                  <span className="block text-sm font-black uppercase tracking-widest text-gray-900">
                    Published on site
                  </span>
                  <span className="mt-1 block text-xs font-medium leading-relaxed text-gray-500">
                    When off, visitors do not see the video event block and cannot
                    submit registrations for it.
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={videoEventConfig.published !== false}
                  aria-label="Published on public site"
                  onClick={() =>
                    setVideoEventConfig((p) => ({
                      ...p,
                      published: !(p.published !== false),
                    }))
                  }
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                    videoEventConfig.published !== false
                      ? "bg-emerald-500"
                      : "bg-gray-300"
                  } cursor-pointer`}
                >
                  <span
                    className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                      videoEventConfig.published !== false
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
                      Title (EN)
                    </label>
                    <input
                      type="text"
                      value={videoEventConfig.title.en}
                      onChange={(e) =>
                        setVideoEventConfig((p) => ({
                          ...p,
                          title: { ...p.title, en: e.target.value },
                        }))
                      }
                      className="w-full p-4 bg-gray-50 rounded-xl border-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
                      Title (HE)
                    </label>
                    <input
                      type="text"
                      value={videoEventConfig.title.he}
                      onChange={(e) =>
                        setVideoEventConfig((p) => ({
                          ...p,
                          title: { ...p.title, he: e.target.value },
                        }))
                      }
                      className="w-full p-4 bg-gray-50 rounded-xl border-none font-bold text-right"
                      dir="rtl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
                        Date
                      </label>
                      <input
                        type="date"
                        value={
                          videoEventConfig.date
                            ? videoEventConfig.date.split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          setVideoEventConfig((p) => ({
                            ...p,
                            date: new Date(e.target.value).toISOString(),
                          }))
                        }
                        className="w-full p-4 bg-gray-50 rounded-xl border-none font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
                        Time
                      </label>
                      <input
                        type="time"
                        value={videoEventConfig.time}
                        onChange={(e) =>
                          setVideoEventConfig((p) => ({
                            ...p,
                            time: e.target.value,
                          }))
                        }
                        className="w-full p-4 bg-gray-50 rounded-xl border-none font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
                      Location
                    </label>
                    <input
                      type="text"
                      value={videoEventConfig.location}
                      onChange={(e) =>
                        setVideoEventConfig((p) => ({
                          ...p,
                          location: e.target.value,
                        }))
                      }
                      className="w-full p-4 bg-gray-50 rounded-xl border-none font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest">
                      Hero Image (Cover)
                    </label>
                    <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden mb-4 relative border border-gray-200">
                      {videoEventConfig.image ? (
                        <img
                          src={resolveAssetUrl(videoEventConfig.image)}
                          alt="Cover"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-gray-300">
                          <ImageIcon className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={videoEventConfig.image}
                        onChange={(e) =>
                          setVideoEventConfig((p) => ({
                            ...p,
                            image: e.target.value,
                          }))
                        }
                        className="flex-1 p-4 bg-gray-50 rounded-xl border-none font-bold text-xs"
                        placeholder="URL or relative path"
                      />
                      <label className="cursor-pointer bg-gray-900 text-white px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-colors flex items-center justify-center">
                        <Upload className="w-4 h-4" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) =>
                            handleAssetUpload(e, "videoEventImage")
                          }
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">
                      Popup registration form
                    </label>
                    <CtaFormFieldsEditor
                      value={videoEventConfig.formFields}
                      legacyRegistrationFields={videoEventConfig.registrationFields}
                      onChange={(next) =>
                        setVideoEventConfig((p) => ({
                          ...p,
                          formFields: next,
                        }))
                      }
                    />
                  </div>

                  <div className="mt-6">
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
                      Brevo list (video popup CTA)
                    </label>
                    <p className="text-[9px] text-gray-500 mb-2">
                      Key from{" "}
                      <span className="font-mono">BREVO_LIST_IDS</span>. Empty =
                      server heuristic (typically{" "}
                      <span className="font-mono">video</span>
                      ).
                    </p>
                    <select
                      value={videoEventConfig.brevoListKey || ""}
                      onChange={(e) =>
                        setVideoEventConfig((p) => ({
                          ...p,
                          brevoListKey: e.target.value,
                        }))
                      }
                      className="w-full p-4 bg-gray-50 rounded-xl border-none font-bold text-xs"
                    >
                      <option value="">Default (heuristic from env)</option>
                      {brevoListCatalog.map((entry) => (
                        <option key={entry.key} value={entry.key}>
                          {entry.key} → list #{entry.id}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isEditing &&
            currentEvent &&
            (isVisualEditing ? (
              <VisualEventEditor
                event={currentEvent}
                onUpdate={handleVisualUpdate}
                onSave={handleSaveEvent}
                onClose={() => setIsEditing(false)}
                onUpload={handleAssetUpload}
              />
            ) : (
              <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border">
                <div className="p-8 border-b bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 text-gray-500 font-black uppercase text-[10px] bg-white border px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 tracking-tighter">
                        Event Protocol
                      </h2>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        System Object ID: {currentEvent.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl">
                    {(() => {
                      const isPastEvent =
                        currentEvent?.date &&
                        new Date(currentEvent.date) < new Date();
                      const tabs = isPastEvent
                        ? ["essentials", "media"]
                        : [
                            "essentials",
                            "media",
                            "content",
                            "settings",
                            "registrations",
                          ];
                      return tabs.map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                        >
                          {tab}
                        </button>
                      ));
                    })()}
                  </div>
                </div>

                <form onSubmit={handleSaveEvent} className="p-10">
                  {activeTab === "essentials" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
                            Experience Title
                          </label>
                          <input
                            type="text"
                            value={
                              currentEvent.title?.en ?? currentEvent.title ?? ""
                            }
                            onChange={(e) =>
                              handleChange("title", e.target.value, "en")
                            }
                            className="w-full p-4 bg-gray-50 rounded-2xl border-none font-black text-gray-900"
                            placeholder="e.g. Community Evening"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
                            Time & Date
                          </label>
                          <input
                            type="datetime-local"
                            value={toDateTimeLocalValue(currentEvent.date)}
                            onChange={(e) =>
                              handleChange(
                                "date",
                                e.target.value
                                  ? new Date(e.target.value).toISOString()
                                  : "",
                              )
                            }
                            className="w-full p-4 bg-gray-50 rounded-2xl border-none font-black text-gray-900"
                          />
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
                            Strategic Location
                          </label>
                          <input
                            type="text"
                            value={currentEvent.location}
                            onChange={(e) =>
                              handleChange("location", e.target.value)
                            }
                            className="w-full p-4 bg-gray-50 rounded-2xl border-none font-black text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
                            Brief Description
                          </label>
                          <textarea
                            rows="5"
                            value={
                              currentEvent.description?.en ??
                              (typeof currentEvent.description === "string"
                                ? currentEvent.description
                                : "")
                            }
                            onChange={(e) =>
                              handleChange("description", e.target.value, "en")
                            }
                            className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-gray-700 leading-relaxed"
                            placeholder="Short description of the event"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "content" && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                      {/* Highlights */}
                      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-black flex items-center gap-2">
                            <Star className="w-5 h-5 text-amber-500" />{" "}
                            Experience Highlights
                          </h3>
                          <button
                            type="button"
                            onClick={() =>
                              addArrayItem("highlights", {
                                title: "",
                                description: "",
                              })
                            }
                            className="text-xs font-black text-purple-600 uppercase"
                          >
                            + Add Highlight
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {(currentEvent.highlights || []).map((item, idx) => (
                            <div
                              key={idx}
                              className="p-6 bg-gray-50 rounded-2xl relative"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  removeArrayItem("highlights", idx)
                                }
                                className="absolute top-2 right-2 text-gray-300 hover:text-red-500"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <input
                                placeholder="Title"
                                value={item.title}
                                onChange={(e) =>
                                  handleArrayChange(
                                    "highlights",
                                    idx,
                                    "title",
                                    e.target.value,
                                  )
                                }
                                className="w-full bg-white border-none rounded-lg p-2 mb-2 font-bold text-sm"
                              />
                              <textarea
                                placeholder="Description"
                                value={item.description}
                                onChange={(e) =>
                                  handleArrayChange(
                                    "highlights",
                                    idx,
                                    "description",
                                    e.target.value,
                                  )
                                }
                                className="w-full bg-white border-none rounded-lg p-2 text-xs"
                                rows="3"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Host Note */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                          <h3 className="text-xl font-black mb-6 flex items-center gap-2 font-black tracking-tight">
                            <Users className="w-5 h-5 text-blue-500" /> Host
                            Connection
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">
                                Host Message
                              </label>
                              <textarea
                                value={currentEvent.hostNote?.message}
                                onChange={(e) =>
                                  handleNestedChange(
                                    "hostNote",
                                    "message",
                                    e.target.value,
                                  )
                                }
                                className="w-full p-4 bg-gray-50 rounded-xl border-none text-sm font-medium"
                                rows="4"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">
                                  Author Name
                                </label>
                                <input
                                  value={currentEvent.hostNote?.author}
                                  onChange={(e) =>
                                    handleNestedChange(
                                      "hostNote",
                                      "author",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full p-4 bg-gray-50 rounded-xl border-none font-bold text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">
                                  Avatar URL
                                </label>
                                <input
                                  value={currentEvent.hostNote?.avatar}
                                  onChange={(e) =>
                                    handleNestedChange(
                                      "hostNote",
                                      "avatar",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full p-4 bg-gray-50 rounded-xl border-none text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                          <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black flex items-center gap-2">
                              <HelpCircle className="w-5 h-5 text-purple-500" />{" "}
                              Intelligence (FAQs)
                            </h3>
                            <button
                              type="button"
                              onClick={() =>
                                addArrayItem("faqs", {
                                  question: "",
                                  answer: "",
                                })
                              }
                              className="text-xs font-black text-purple-600 uppercase"
                            >
                              + Add FAQ
                            </button>
                          </div>
                          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {(currentEvent.faqs || []).map((faq, idx) => (
                              <div
                                key={idx}
                                className="p-4 bg-gray-50 rounded-xl relative"
                              >
                                <button
                                  type="button"
                                  onClick={() => removeArrayItem("faqs", idx)}
                                  className="absolute top-2 right-2 text-gray-300 hover:text-red-500"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                                <input
                                  placeholder="Question"
                                  value={faq.question}
                                  onChange={(e) =>
                                    handleArrayChange(
                                      "faqs",
                                      idx,
                                      "question",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full bg-white border-none rounded-lg p-2 mb-2 font-bold text-xs"
                                />
                                <textarea
                                  placeholder="Answer"
                                  value={faq.answer}
                                  onChange={(e) =>
                                    handleArrayChange(
                                      "faqs",
                                      idx,
                                      "answer",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full bg-white border-none rounded-lg p-2 text-[10px]"
                                  rows="2"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "settings" && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Map & Location */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                          <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-red-500" />{" "}
                            Geo-Targeting
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">
                                Display Address
                              </label>
                              <input
                                value={currentEvent.locationParams?.addressText}
                                onChange={(e) =>
                                  handleNestedChange(
                                    "locationParams",
                                    "addressText",
                                    e.target.value,
                                  )
                                }
                                className="w-full p-4 bg-gray-50 rounded-xl border-none font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">
                                Google Maps Embed URL / Link
                              </label>
                              <textarea
                                value={
                                  currentEvent.locationParams
                                    ?.googleMapsEmbedUrl
                                }
                                onChange={(e) =>
                                  handleNestedChange(
                                    "locationParams",
                                    "googleMapsEmbedUrl",
                                    e.target.value,
                                  )
                                }
                                className="w-full p-4 bg-gray-50 rounded-xl border-none font-mono text-[10px]"
                                rows="4"
                                placeholder="Paste <iframe> or direct Google Maps link"
                              />
                              <p className="text-[9px] text-gray-400 mt-2 font-medium">
                                💡 For best results, go to Google Maps → Share →
                                Embed a map and paste the iframe here.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Status & Capacity */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                          <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-gray-500" />{" "}
                            Engine Config
                          </h3>
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">
                                Protocol Status
                              </label>
                              <select
                                value={currentEvent.status}
                                onChange={(e) =>
                                  handleChange("status", e.target.value)
                                }
                                className="w-full p-4 bg-gray-900 text-white rounded-xl border-none font-black text-xs uppercase tracking-widest"
                              >
                                <option value="draft">Draft Protocol</option>
                                <option value="published">Global Deploy</option>
                                <option value="past">Archive Only</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">
                                Target Capacity
                              </label>
                              <input
                                type="number"
                                value={currentEvent.socialProof?.capacity || 50}
                                onChange={(e) =>
                                  handleNestedChange(
                                    "socialProof",
                                    "capacity",
                                    parseInt(e.target.value),
                                  )
                                }
                                className="w-full p-4 bg-gray-50 rounded-xl border-none font-black"
                              />
                            </div>
                          </div>

                          <div className="mt-6 pt-6 border-t border-gray-100">
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">
                              Brevo list (event registration CTA)
                            </label>
                            <p className="text-[9px] text-gray-500 mb-2 font-medium">
                              Key from{" "}
                              <span className="font-mono">BREVO_LIST_IDS</span>.
                              Empty = server uses the default heuristic (event /
                              general lists from contact profile).
                            </p>
                            <select
                              value={
                                currentEvent.registration?.brevoListKey || ""
                              }
                              onChange={(e) =>
                                handleNestedChange(
                                  "registration",
                                  "brevoListKey",
                                  e.target.value,
                                )
                              }
                              className="w-full p-4 bg-gray-50 rounded-xl border-none font-bold text-xs"
                            >
                              <option value="">
                                Default (heuristic from env)
                              </option>
                              {brevoListCatalog.map((entry) => (
                                <option key={entry.key} value={entry.key}>
                                  {entry.key} → list #{entry.id}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="mt-6 pt-6 border-t border-gray-100">
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
                              Registration form (CTA)
                            </label>
                            <CtaFormFieldsEditor
                              value={currentEvent.registration?.formFields}
                              onChange={(next) =>
                                handleNestedChange(
                                  "registration",
                                  "formFields",
                                  next,
                                )
                              }
                            />
                          </div>

                          <div className="mt-8 pt-8 border-t grid grid-cols-1 gap-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                Visual Editor Access
                              </span>
                              <button
                                type="button"
                                onClick={() => setIsVisualEditing(true)}
                                className="bg-purple-50 text-purple-600 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border border-purple-100"
                              >
                                Open Designer
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Partners */}
                      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-black flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />{" "}
                            Ecosystem Partners
                          </h3>
                          <button
                            type="button"
                            onClick={() =>
                              addArrayItem("partners", {
                                name: "",
                                logo: "",
                                website: "",
                              })
                            }
                            className="text-xs font-black text-purple-600 uppercase"
                          >
                            + Add Partner
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          {(currentEvent.partners || []).map((partner, idx) => (
                            <div
                              key={idx}
                              className="p-4 bg-gray-50 rounded-2xl relative border border-gray-100 group/partner"
                            >
                              <button
                                type="button"
                                onClick={() => removeArrayItem("partners", idx)}
                                className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover/partner:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <div className="w-full aspect-video bg-white rounded-lg mb-2 overflow-hidden border border-gray-100 flex items-center justify-center p-2 relative group-hover/partner:border-purple-200 transition-all">
                                {partner.logo ? (
                                  <img
                                    src={partner.logo}
                                    className="h-full w-full object-contain"
                                  />
                                ) : (
                                  <ImageIcon className="w-6 h-6 text-gray-200" />
                                )}
                                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/partner:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                                  <Upload className="w-5 h-5 text-white" />
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files[0];
                                      if (!file) return;
                                      uploadFile(file, {
                                        keyPrefix: `events/${currentEvent.folderName}/partners`,
                                      }).then((result) => {
                                        if (result.success && result.url) {
                                          handleArrayChange(
                                            "partners",
                                            idx,
                                            "logo",
                                            result.url,
                                          );
                                        }
                                      });
                                    }}
                                  />
                                </label>
                              </div>
                              <input
                                placeholder="Name"
                                value={partner.name}
                                onChange={(e) =>
                                  handleArrayChange(
                                    "partners",
                                    idx,
                                    "name",
                                    e.target.value,
                                  )
                                }
                                className="w-full bg-white border-none rounded-lg p-2 mb-2 font-bold text-[10px]"
                              />
                              <input
                                placeholder="Website"
                                value={partner.website}
                                onChange={(e) =>
                                  handleArrayChange(
                                    "partners",
                                    idx,
                                    "website",
                                    e.target.value,
                                  )
                                }
                                className="w-full bg-white border-none rounded-lg p-2 text-[8px] font-mono"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "media" && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                      <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-xl">
                        <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                          <Video className="w-6 h-6 text-purple-400" /> Hero
                          Cinema
                        </h3>
                        <div className="flex gap-4 items-center">
                          <input
                            type="text"
                            value={currentEvent.heroVideo || ""}
                            onChange={(e) =>
                              handleChange("heroVideo", e.target.value)
                            }
                            className="flex-1 p-4 bg-white/10 rounded-2xl border-white/10 text-white font-mono text-xs"
                            placeholder="/assets/events/.../hero.mp4"
                          />
                          <label className="cursor-pointer bg-white text-gray-900 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all">
                            Upload video (MP4 / WebM)
                            <input
                              type="file"
                              className="hidden"
                              accept="video/mp4,video/webm,video/quicktime"
                              onChange={(e) => handleAssetUpload(e, "hero")}
                            />
                          </label>
                        </div>
                        {currentEvent.heroVideo && (
                          <div className="mt-6 rounded-2xl overflow-hidden bg-black/50 aspect-video max-h-64">
                            <video
                              key={currentEvent.heroVideo}
                              src={resolveAssetUrl(currentEvent.heroVideo)}
                              controls
                              preload="auto"
                              className="w-full h-full object-contain"
                              playsInline
                            />
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest">
                            Hero Image (Details)
                          </label>
                          <div className="flex gap-3">
                            <input
                              type="text"
                              value={currentEvent.image}
                              onChange={(e) =>
                                handleChange("image", e.target.value)
                              }
                              className="flex-1 p-4 bg-gray-50 rounded-2xl border-none font-bold"
                            />
                            <label className="cursor-pointer bg-gray-900 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                              <ImageIcon className="w-4 h-4" />
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleAssetUpload(e, "image")}
                              />
                            </label>
                          </div>
                        </div>
                        {currentEvent?.date &&
                          new Date(currentEvent.date) >= new Date() && (
                            <div>
                              <label className="block text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest">
                                Card Thumbnail (List)
                              </label>
                              <div className="flex gap-3">
                                <input
                                  type="text"
                                  value={currentEvent.thumbnail}
                                  onChange={(e) =>
                                    handleChange("thumbnail", e.target.value)
                                  }
                                  className="flex-1 p-4 bg-gray-50 rounded-2xl border-none font-bold"
                                />
                                <label className="cursor-pointer bg-gray-900 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                                  <ImageIcon className="w-4 h-4" />
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleAssetUpload(e, "thumbnail")
                                    }
                                  />
                                </label>
                              </div>
                            </div>
                          )}
                      </div>

                      <div className="bg-gray-50 p-8 rounded-3xl border border-dashed border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-black flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-gray-400" />{" "}
                            Media Gallery
                            <span className="text-xs font-bold text-gray-400 normal-case tracking-normal">
                              (max 20)
                            </span>
                          </h3>
                          <label
                            className={`cursor-pointer px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all ${
                              (currentEvent.gallery || []).length >= 20 ||
                              uploading
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-gray-900 text-white hover:bg-black"
                            }`}
                          >
                            {uploading ? (
                              "Processing..."
                            ) : (
                              <>
                                <Upload className="w-4 h-4" /> Bulk Upload
                              </>
                            )}
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              multiple
                              onChange={handleGalleryUpload}
                              disabled={
                                uploading ||
                                (currentEvent.gallery || []).length >= 20
                              }
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">
                          Images only (no video). HEIC is converted to JPG
                          automatically. Use JPG or PNG for best results.
                        </p>
                        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4">
                          {(currentEvent.gallery || []).map((item, idx) => {
                            const pathOnly =
                              typeof item === "string" &&
                              (item.startsWith("http") ||
                                item.startsWith("/assets"))
                                ? item
                                : `/assets/events/${currentEvent.folderName || ""}/${item || ""}`;
                            const src = resolveAssetUrl(pathOnly);
                            const isVideo =
                              /\.(mp4|mov|webm|MP4|MOV|WEBM)$/i.test(
                                item || "",
                              );
                            return (
                              <div
                                key={idx}
                                className="relative group aspect-square rounded-2xl overflow-hidden shadow-sm shadow-gray-200 bg-gray-100 flex items-center justify-center"
                              >
                                {isVideo ? (
                                  <video
                                    src={src}
                                    className="w-full h-full object-cover"
                                    muted
                                    playsInline
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                      const next =
                                        e.currentTarget.nextElementSibling;
                                      if (next) next.classList.remove("hidden");
                                    }}
                                  />
                                ) : (
                                  <img
                                    src={src}
                                    alt=""
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                      const next =
                                        e.currentTarget.nextElementSibling;
                                      if (next) next.classList.remove("hidden");
                                    }}
                                  />
                                )}
                                <div className="hidden absolute inset-0 bg-gray-700 flex items-center justify-center">
                                  <ImageIcon className="w-8 h-8 text-gray-500" />
                                </div>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteImage(item)}
                                    className="bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-all"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                          {(currentEvent.gallery || []).length === 0 && (
                            <div className="col-span-full py-12 px-6 text-center text-gray-300 font-bold uppercase text-[10px] tracking-widest border border-dashed rounded-2xl">
                              <div>Empty Gallery</div>
                              {(currentEvent.image ||
                                currentEvent.heroVideo ||
                                currentEvent.thumbnail ||
                                (currentEvent.imageBubbles || []).length > 0) && (
                                <div className="mt-3 text-[9px] font-semibold normal-case tracking-normal text-gray-400">
                                  This event still has hero or detail media configured
                                  outside the gallery manager.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "registrations" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100 text-center">
                          <h3 className="text-blue-400 font-black uppercase text-[10px] tracking-widest mb-2">
                            Cohort Success
                          </h3>
                          <p className="text-5xl font-black text-blue-600">
                            {stats[currentEvent.id] || 0}
                          </p>
                        </div>
                        <div className="bg-purple-50/50 p-8 rounded-3xl border border-purple-100 text-center">
                          <h3 className="text-purple-400 font-black uppercase text-[10px] tracking-widest mb-2">
                            Global Impact
                          </h3>
                          <p className="text-5xl font-black text-purple-600">
                            {Object.values(stats).reduce((a, b) => a + b, 0)}
                          </p>
                        </div>
                        <div className="bg-gray-50/50 p-8 rounded-3xl border border-gray-100 text-center">
                          <h3 className="text-gray-400 font-black uppercase text-[10px] tracking-widest mb-2">
                            Waitlist
                          </h3>
                          <p className="text-5xl font-black text-gray-300">0</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-12 flex gap-4 pt-8 border-t">
                    <button
                      type="submit"
                      className="bg-purple-600 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-purple-100 hover:bg-purple-700 hover:-translate-y-1 transition-all flex items-center gap-2"
                    >
                      <Save className="w-5 h-5" /> Deploy Update
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-100 text-gray-400 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all"
                    >
                      Abort Changes
                    </button>
                  </div>
                </form>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
