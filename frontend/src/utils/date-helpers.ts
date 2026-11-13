import { format, parseISO, isValid, isBefore } from "date-fns";

export function parseValidDate(isoString: string): Date | null {
  try {
    const d = parseISO(isoString);
    return isValid(d) ? d : null;
  } catch {
    return null;
  }
}

export function formatEventDate(isoString: string): string {
  const d = parseValidDate(isoString);
  if (!d) return "Date TBD";
  return format(d, "EEE, MMM d, yyyy");
}

export function formatEventTime(isoString: string): string {
  const d = parseValidDate(isoString);
  if (!d) return "Time TBD";
  return format(d, "h:mm a");
}

export function formatEventDateTime(isoString: string): string {
  const d = parseValidDate(isoString);
  if (!d) return "Date & Time TBD";
  return format(d, "EEE, MMM d, yyyy • h:mm a");
}

export function getDateBadge(isoString: string): { month: string; day: string } {
  const d = parseValidDate(isoString);
  if (!d) return { month: "TBD", day: "--" };
  return {
    month: format(d, "MMM").toUpperCase(),
    day: format(d, "d"),
  };
}

export function isPastEvent(isoString: string): boolean {
  const d = parseValidDate(isoString);
  if (!d) return false;
  return isBefore(d, new Date());
}
