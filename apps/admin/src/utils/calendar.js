export const generateGoogleCalendarUrl = ({ title, description, location, startTime, endTime }) => {
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    console.error("Invalid dates provided to calendar utility:", { startTime, endTime });
    return "#";
  }

  const format = (d) => d.toISOString().replace(/-|:|\.\d+/g, "");
  const start = format(startDate);
  const end = format(endDate);

  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}&dates=${start}/${end}`;
};

const escapeIcsText = (value) =>
  String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");

const formatIcsUtc = (d) => d.toISOString().replace(/-|:|\.\d+/g, "");

export const downloadIcsFile = async ({ title, description, location, startTime, endTime, id }) => {
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    console.error("Invalid dates provided to calendar utility:", { startTime, endTime });
    return;
  }

  const start = formatIcsUtc(startDate);
  const end = formatIcsUtc(endDate);
  const stamp = formatIcsUtc(new Date());
  const uidSlug = `${String(id || title || "event").replace(/[^a-zA-Z0-9_-]/g, "-")}-${start.replace(/[^\w]/g, "")}`;
  const uid = `${uidSlug}@thehbm.org`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//The HBM//Event Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    "SEQUENCE:0",
    "STATUS:CONFIRMED",
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  const icsData = lines.join("\r\n");

  const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
  const file =
    typeof File !== "undefined"
      ? new File([blob], "event.ics", { type: "text/calendar;charset=utf-8" })
      : null;

  if (file && navigator.share && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: title || "HBM Event",
        text: title || "HBM Event",
        files: [file],
      });
      return;
    } catch (_err) {
      // Fall through to download.
    }
  }

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "event.ics");
  link.setAttribute("target", "_blank");
  link.setAttribute("rel", "noopener noreferrer");
  document.body.appendChild(link);

  if ("download" in HTMLAnchorElement.prototype) {
    link.click();
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  document.body.removeChild(link);
  window.setTimeout(() => window.URL.revokeObjectURL(url), 30_000);
};
