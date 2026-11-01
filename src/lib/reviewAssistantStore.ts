// src/lib/reviewAssistantStore.ts
import { getAllBusinesses, getBusinessById } from "./businessStore";

export type ReviewLanguage = "english" | "hinglish" | "gujarati_roman" | "hindi_roman" | "mixed";
export type ReviewTone = "friendly" | "professional" | "casual" | "warm";
export type ReviewLength = "short" | "medium" | "long";
export type ReviewOptionKind = "product" | "aspect";
export type ReviewEventType = "copied" | "opened_google";

export interface ReviewConfigRecord {
  business_id: string;
  ai_review_enabled: boolean;
  language: ReviewLanguage;
  tone: ReviewTone;
  default_length: ReviewLength;
  highlights: string;
  facebook_url?: string | null;
  website_url?: string | null;
  address?: string | null;
  google_review_link?: string | null;
  show_icons: {
    instagram?: boolean;
    whatsapp?: boolean;
    facebook?: boolean;
    website?: boolean;
  };
  monthly_generation_cap: number;
  model_override_id?: string | null;
  suggestions_count?: number;
  voice_input_enabled?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReviewOptionRecord {
  id: string;
  business_id: string;
  kind: ReviewOptionKind;
  label: string;
  sort_order: number;
  active: boolean;
  created_at: string;
}

export interface ReviewGenerationRecord {
  id: string;
  business_id: string;
  tag_id?: string | null;
  stars: number;
  length: ReviewLength;
  language: ReviewLanguage;
  option_ids: string[];
  output_text: string;
  ip_hash?: string | null;
  model_id?: string | null;
  model_label?: string | null;
  created_at: string;
}

export interface ReviewEventRecord {
  id: string;
  business_id: string;
  generation_id?: string | null;
  event: ReviewEventType;
  created_at: string;
}

export interface PrivateFeedbackRecord {
  id: string;
  business_id: string;
  business_name?: string;
  stars: number;
  feedback_text: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  tag_code?: string | null;
  created_at: string;
}

export const PRESET_ASPECTS: string[] = [
  "Cleanliness",
  "Nice Staff",
  "Good Behaviour",
  "Excellent Quality",
  "Fair Pricing",
  "Fast Service",
  "Good Ambience",
  "Value for Money",
  "Hygiene",
  "Professional Team",
  "On-time Delivery",
  "Easy Parking",
];

const CONFIG_STORAGE_KEY = "zentap_v2_review_configs";
const OPTIONS_STORAGE_KEY = "zentap_v2_review_options";
const GENERATIONS_STORAGE_KEY = "zentap_v2_review_generations";
const EVENTS_STORAGE_KEY = "zentap_v2_review_events";
const FEEDBACK_STORAGE_KEY = "zentap_v2_private_feedback";

// Default seed options for demo / unconfigured businesses
function createDefaultSeedOptions(businessId: string): ReviewOptionRecord[] {
  const now = new Date().toISOString();
  return PRESET_ASPECTS.map((label, idx) => ({
    id: `opt-${businessId}-${idx + 1}`,
    business_id: businessId,
    kind: "aspect",
    label,
    sort_order: idx + 1,
    active: true,
    created_at: now,
  }));
}

// -------------------------------------------------------------
// CONFIGURATION MANAGEMENT
// -------------------------------------------------------------
export function getBusinessReviewConfig(businessId: string): ReviewConfigRecord {
  if (typeof window === "undefined") {
    return createDefaultConfig(businessId);
  }

  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    const configs: ReviewConfigRecord[] = raw ? JSON.parse(raw) : [];
    const found = configs.find((c) => c.business_id === businessId);
    if (found) return found;

    // Create & save default
    const fresh = createDefaultConfig(businessId);
    configs.push(fresh);
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(configs));
    return fresh;
  } catch {
    return createDefaultConfig(businessId);
  }
}

function createDefaultConfig(businessId: string): ReviewConfigRecord {
  const biz = getBusinessById(businessId);
  const now = new Date().toISOString();
  return {
    business_id: businessId,
    ai_review_enabled: false, // Default is STRICTLY false
    language: "english",
    tone: "friendly",
    default_length: "medium",
    highlights: "Polite staff and fast courteous service.\nVery neat, clean and organized premises.\nGenuine and authentic quality.",
    facebook_url: "",
    website_url: "",
    address: biz?.city ? `${biz.city}, Gujarat, India` : "Ahmedabad, Gujarat",
    google_review_link: biz?.review_url || "",
    show_icons: {
      instagram: true,
      whatsapp: true,
      facebook: true,
      website: true,
    },
    monthly_generation_cap: 300,
    created_at: now,
    updated_at: now,
  };
}

export function updateBusinessReviewConfig(
  businessId: string,
  updates: Partial<ReviewConfigRecord>
): ReviewConfigRecord {
  const current = getBusinessReviewConfig(businessId);
  const updated: ReviewConfigRecord = {
    ...current,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
      let configs: ReviewConfigRecord[] = raw ? JSON.parse(raw) : [];
      const idx = configs.findIndex((c) => c.business_id === businessId);
      if (idx >= 0) {
        configs[idx] = updated;
      } else {
        configs.push(updated);
      }
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(configs));
    } catch (err) {
      console.warn("updateBusinessReviewConfig error:", err);
    }
  }

  return updated;
}

// -------------------------------------------------------------
// OPTIONS MANAGEMENT (PRODUCTS & ASPECTS)
// -------------------------------------------------------------
export function getAllReviewOptions(businessId: string): ReviewOptionRecord[] {
  if (typeof window === "undefined") return createDefaultSeedOptions(businessId);

  try {
    const raw = localStorage.getItem(OPTIONS_STORAGE_KEY);
    let all: ReviewOptionRecord[] = raw ? JSON.parse(raw) : [];
    let bizOptions = all.filter((o) => o.business_id === businessId);

    if (bizOptions.length === 0) {
      // Seed with standard presets
      const seeded = createDefaultSeedOptions(businessId);
      all = [...all, ...seeded];
      localStorage.setItem(OPTIONS_STORAGE_KEY, JSON.stringify(all));
      return seeded;
    }

    return bizOptions.sort((a, b) => a.sort_order - b.sort_order);
  } catch {
    return createDefaultSeedOptions(businessId);
  }
}

export function addReviewOption(
  businessId: string,
  kind: ReviewOptionKind,
  label: string
): ReviewOptionRecord {
  const options = getAllReviewOptions(businessId);
  const maxOrder = options.reduce((max, o) => Math.max(max, o.sort_order), 0);
  const newOption: ReviewOptionRecord = {
    id: `opt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    business_id: businessId,
    kind,
    label: label.trim(),
    sort_order: maxOrder + 1,
    active: true,
    created_at: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(OPTIONS_STORAGE_KEY);
      let all: ReviewOptionRecord[] = raw ? JSON.parse(raw) : [];
      all.push(newOption);
      localStorage.setItem(OPTIONS_STORAGE_KEY, JSON.stringify(all));
    } catch (err) {
      console.warn("addReviewOption error:", err);
    }
  }

  return newOption;
}

export function updateReviewOption(
  id: string,
  updates: Partial<ReviewOptionRecord>
): ReviewOptionRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(OPTIONS_STORAGE_KEY);
    let all: ReviewOptionRecord[] = raw ? JSON.parse(raw) : [];
    const idx = all.findIndex((o) => o.id === id);
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...updates };
      localStorage.setItem(OPTIONS_STORAGE_KEY, JSON.stringify(all));
      return all.filter((o) => o.business_id === all[idx].business_id);
    }
    return [];
  } catch {
    return [];
  }
}

export function deleteReviewOption(id: string): void {
  if (typeof window === "undefined") return;

  try {
    const raw = localStorage.getItem(OPTIONS_STORAGE_KEY);
    let all: ReviewOptionRecord[] = raw ? JSON.parse(raw) : [];
    all = all.filter((o) => o.id !== id);
    localStorage.setItem(OPTIONS_STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.warn("deleteReviewOption error:", err);
  }
}

export function reorderReviewOptions(businessId: string, optionIdsInOrder: string[]): ReviewOptionRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(OPTIONS_STORAGE_KEY);
    let all: ReviewOptionRecord[] = raw ? JSON.parse(raw) : [];
    all = all.map((o) => {
      if (o.business_id === businessId) {
        const newOrder = optionIdsInOrder.indexOf(o.id);
        if (newOrder >= 0) {
          return { ...o, sort_order: newOrder + 1 };
        }
      }
      return o;
    });
    localStorage.setItem(OPTIONS_STORAGE_KEY, JSON.stringify(all));
    return all.filter((o) => o.business_id === businessId).sort((a, b) => a.sort_order - b.sort_order);
  } catch {
    return [];
  }
}

export function addPresetsForBusiness(businessId: string, presetLabels: string[]): ReviewOptionRecord[] {
  const existing = getAllReviewOptions(businessId);
  const existingLabels = new Set(existing.map((o) => o.label.toLowerCase().trim()));

  const added: ReviewOptionRecord[] = [];
  presetLabels.forEach((label) => {
    if (!existingLabels.has(label.toLowerCase().trim())) {
      const opt = addReviewOption(businessId, "aspect", label);
      added.push(opt);
    }
  });

  return getAllReviewOptions(businessId);
}

// -------------------------------------------------------------
// GENERATIONS & TELEMETRY
// -------------------------------------------------------------
export function logReviewGeneration(data: {
  business_id: string;
  tag_id?: string | null;
  stars: number;
  length: ReviewLength;
  language: ReviewLanguage;
  option_ids: string[];
  output_text: string;
  ip_hash?: string | null;
}): ReviewGenerationRecord {
  const newGen: ReviewGenerationRecord = {
    id: `gen-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    ...data,
    created_at: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(GENERATIONS_STORAGE_KEY);
      let list: ReviewGenerationRecord[] = raw ? JSON.parse(raw) : [];
      list.unshift(newGen);
      // Keep up to 500 generations
      if (list.length > 500) list = list.slice(0, 500);
      localStorage.setItem(GENERATIONS_STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
      console.warn("logReviewGeneration storage error:", err);
    }
  }

  return newGen;
}

export function getRecentGenerationsForBusiness(businessId: string, limit: number = 20): ReviewGenerationRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(GENERATIONS_STORAGE_KEY);
    const list: ReviewGenerationRecord[] = raw ? JSON.parse(raw) : [];
    return list.filter((g) => g.business_id === businessId).slice(0, limit);
  } catch {
    return [];
  }
}

// -------------------------------------------------------------
// EVENTS LOGGING (COPIED & OPENED_GOOGLE)
// -------------------------------------------------------------
export function logReviewEvent(businessId: string, event: ReviewEventType, generationId?: string | null): ReviewEventRecord {
  const newEvent: ReviewEventRecord = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    business_id: businessId,
    generation_id: generationId || null,
    event,
    created_at: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
      let list: ReviewEventRecord[] = raw ? JSON.parse(raw) : [];
      list.unshift(newEvent);
      if (list.length > 1000) list = list.slice(0, 1000);
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
      console.warn("logReviewEvent error:", err);
    }
  }

  return newEvent;
}

// -------------------------------------------------------------
// PRIVATE FEEDBACK MANAGEMENT
// -------------------------------------------------------------
export function submitPrivateFeedback(data: {
  business_id: string;
  stars: number;
  feedback_text: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  tag_code?: string | null;
}): PrivateFeedbackRecord {
  const biz = getBusinessById(data.business_id);
  const newFeedback: PrivateFeedbackRecord = {
    id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    business_id: data.business_id,
    business_name: biz?.name || "Business",
    stars: data.stars,
    feedback_text: data.feedback_text.trim(),
    customer_name: data.customer_name?.trim() || null,
    customer_phone: data.customer_phone?.trim() || null,
    tag_code: data.tag_code || null,
    created_at: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      let list: PrivateFeedbackRecord[] = raw ? JSON.parse(raw) : [];
      list.unshift(newFeedback);
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
      console.warn("submitPrivateFeedback error:", err);
    }
  }

  return newFeedback;
}

export function getAllPrivateFeedback(businessId?: string): PrivateFeedbackRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    const list: PrivateFeedbackRecord[] = raw ? JSON.parse(raw) : [];
    if (!businessId || businessId === "all") return list;
    return list.filter((f) => f.business_id === businessId);
  } catch {
    return [];
  }
}

// -------------------------------------------------------------
// USAGE METRICS CALCULATOR
// -------------------------------------------------------------
export function getReviewUsageStats(businessId: string): {
  todayGenerations: number;
  monthGenerations: number;
  copiedClicks: number;
  openedGoogleClicks: number;
} {
  if (typeof window === "undefined") {
    return { todayGenerations: 0, monthGenerations: 0, copiedClicks: 0, openedGoogleClicks: 0 };
  }

  try {
    const rawGen = localStorage.getItem(GENERATIONS_STORAGE_KEY);
    const gens: ReviewGenerationRecord[] = rawGen ? JSON.parse(rawGen) : [];
    const rawEvt = localStorage.getItem(EVENTS_STORAGE_KEY);
    const evts: ReviewEventRecord[] = rawEvt ? JSON.parse(rawEvt) : [];

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const currentMonthStr = now.toISOString().slice(0, 7);

    const bizGens = gens.filter((g) => g.business_id === businessId);
    const bizEvts = evts.filter((e) => e.business_id === businessId);

    const todayGenerations = bizGens.filter((g) => g.created_at.slice(0, 10) === todayStr).length;
    const monthGenerations = bizGens.filter((g) => g.created_at.slice(0, 7) === currentMonthStr).length;
    const copiedClicks = bizEvts.filter((e) => e.event === "copied").length;
    const openedGoogleClicks = bizEvts.filter((e) => e.event === "opened_google").length;

    return {
      todayGenerations,
      monthGenerations,
      copiedClicks,
      openedGoogleClicks,
    };
  } catch {
    return { todayGenerations: 0, monthGenerations: 0, copiedClicks: 0, openedGoogleClicks: 0 };
  }
}
