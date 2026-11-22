// src/lib/openingHours.ts

export interface ParsedOpeningHours {
  day: string;
  time: string;
  isClosed: boolean;
}

/**
 * Robustly parses a free-text line of opening hours into day and time components.
 * Handles diverse separators (colon, hyphen, en-dash, em-dash, pipe, multiple spaces)
 * and detects closed/holiday states cleanly.
 * Prevents time splitting bugs like separating "09" onto the day and ":00 AM" onto the time.
 */
export function parseOpeningHoursLine(line: string): ParsedOpeningHours | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // 1. Check for standalone 24/7 or 24 hours
  if (/^(open\s*24\s*hours?|open\s*24\/7|24\/7|24\s*hours?)$/i.test(trimmed)) {
    return {
      day: "All Days",
      time: trimmed,
      isClosed: false,
    };
  }

  // 2. Check for closed / holiday / off (with or without day prefix)
  const closedMatch = trimmed.match(/^(.+?)(?:\s*[:\-–—|]\s*|\s+)(closed|close|holiday|off|day\s*off)$/i);
  if (closedMatch) {
    return {
      day: closedMatch[1].trim(),
      time: "Closed",
      isClosed: true,
    };
  }
  if (/^(closed|holiday|day\s*off)$/i.test(trimmed)) {
    return {
      day: "All Days",
      time: "Closed",
      isClosed: true,
    };
  }

  // 3. Look for explicit time pattern (e.g. 09:00 AM, 9 AM, 10:00, 24 Hours, etc.)
  const timeRegex = /(?:(?:\b0?[0-9]|1[0-9]|2[0-3])(?::[0-5][0-9])?\s*(?:am|pm)\b|\b(?:0?[0-9]|1[0-9]|2[0-3]):[0-5][0-9]\b|\b(?:open\s+24|24\/7|24\s*hours?)\b)/i;
  const match = trimmed.match(timeRegex);

  if (match && match.index !== undefined) {
    const rawDay = trimmed.slice(0, match.index).replace(/\s*[:\-–—|]\s*$/, "").trim();
    const rawTime = trimmed.slice(match.index).replace(/^\s*[:\-–—|]\s*/, "").trim();
    if (rawDay && rawTime) {
      return {
        day: rawDay,
        time: rawTime,
        isClosed: false,
      };
    }
  }

  // 4. Fallback: check if there is a colon preceded by a letter/word
  const colonIdx = trimmed.search(/[a-zA-Z\)]\s*:/);
  if (colonIdx !== -1) {
    const day = trimmed.slice(0, colonIdx + 1).trim();
    const time = trimmed.slice(colonIdx + 2).replace(/^[:\s]+/, "").trim();
    return {
      day,
      time,
      isClosed: /closed|off|holiday/i.test(time),
    };
  }

  // 5. Fallback: check if there is a dash or pipe preceded by a letter/word
  const dashIdx = trimmed.search(/[a-zA-Z\)]\s*[\-–—|]\s*/);
  if (dashIdx !== -1) {
    const day = trimmed.slice(0, dashIdx + 1).trim();
    const time = trimmed.slice(dashIdx + 1).replace(/^[\-–—|\s]+/, "").trim();
    if (day && time) {
      return {
        day,
        time,
        isClosed: /closed|off|holiday/i.test(time),
      };
    }
  }

  return {
    day: trimmed,
    time: "",
    isClosed: false,
  };
}
