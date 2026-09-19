// Date formatting shared across pages. Dates in content files are plain
// YYYY-MM-DD strings; they're parsed as local midnight so the displayed day
// never shifts with the viewer's time zone.

/** "July 4, 2026" (or "Jul 4, 2026" with style 'medium'). */
export function formatDate(date: string, style: 'long' | 'medium' = 'long') {
  return new Intl.DateTimeFormat('en-US', { dateStyle: style }).format(new Date(`${date}T00:00:00`));
}

/** Formats a date that may be only partly known: "2026", "July 2026", or
 * "July 4, 2026". Anything else (e.g. "Unknown") is returned unchanged. */
export function formatPartialDate(date: string) {
  if (/^\d{4}$/.test(date)) return date;
  if (/^\d{4}-\d{2}$/.test(date)) {
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' }).format(new Date(`${date}-01T00:00:00`));
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return formatDate(date);
  return date;
}
