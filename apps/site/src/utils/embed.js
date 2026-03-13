export function isEmbedPreview() {
  if (typeof window === "undefined") return false;

  const params = new URLSearchParams(window.location.search);
  return params.get("embedPreview") === "1";
}
