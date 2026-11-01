// src/lib/hubDesignStore.ts
import { BusinessRecord, getBusinessById } from "./businessStore";

export type ThemePreset = 
  | "modern_slate" 
  | "midnight_amber" 
  | "emerald_luxe" 
  | "clean_minimal" 
  | "royal_indigo";

export type ButtonStyle = "rounded" | "pill" | "square";
export type CardStyle = "glass" | "flat" | "elevated" | "bordered";
export type DarkModeSetting = "light" | "dark" | "auto";

export type PageButtonType = 
  | "review" 
  | "whatsapp" 
  | "instagram" 
  | "facebook" 
  | "youtube" 
  | "call" 
  | "directions" 
  | "website" 
  | "email" 
  | "menu" 
  | "booking" 
  | "maps" 
  | "custom";

export type PageSectionType = 
  | "about" 
  | "photos" 
  | "offers" 
  | "hours" 
  | "faqs" 
  | "testimonials" 
  | "video";

export interface PageDesignRecord {
  business_id: string;
  hub_enabled: boolean;
  logo_url?: string;
  cover_url?: string;
  tagline?: string;
  address?: string;
  maps_link?: string;
  theme_preset: ThemePreset;
  primary_color: string;
  accent_color: string;
  bg_color: string;
  font: string;
  button_style: ButtonStyle;
  card_style: CardStyle;
  dark_mode: DarkModeSetting;
  show_powered_by: boolean;
  page_language: string;
  texts: {
    write_review_btn: string;
    call_btn: string;
    directions_btn: string;
    about_heading: string;
    photos_heading: string;
    offers_heading: string;
    hours_heading: string;
    faqs_heading: string;
    testimonials_heading: string;
    disclaimer: string;
    [key: string]: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface PageButtonRecord {
  id: string;
  business_id: string;
  type: PageButtonType;
  label: string;
  url_or_value: string;
  icon?: string;
  sort_order: number;
  visible: boolean;
  created_at?: string;
}

export interface PageSectionRecord {
  id: string;
  business_id: string;
  type: PageSectionType;
  content: any;
  sort_order: number;
  visible: boolean;
  created_at?: string;
}

export interface PagePhotoRecord {
  id: string;
  business_id: string;
  image_url: string;
  caption?: string;
  sort_order: number;
  created_at?: string;
}

export interface ClickEventRecord {
  id: string;
  business_id: string;
  button_type: string;
  source: "qr" | "nfc" | "web";
  created_at: string;
}

// Preset definitions with full styling tokens
export const THEME_PRESET_CONFIGS: Record<ThemePreset, {
  name: string;
  primary_color: string;
  accent_color: string;
  bg_color: string;
  font: string;
  button_style: ButtonStyle;
  card_style: CardStyle;
  dark_mode: DarkModeSetting;
}> = {
  modern_slate: {
    name: "Modern Slate (ZenTap Dark)",
    primary_color: "#ff7a00",
    accent_color: "#ff7a00",
    bg_color: "#0e1015",
    font: "Outfit",
    button_style: "rounded",
    card_style: "glass",
    dark_mode: "dark",
  },
  midnight_amber: {
    name: "Midnight Amber",
    primary_color: "#f59e0b",
    accent_color: "#fbbf24",
    bg_color: "#09090b",
    font: "Outfit",
    button_style: "pill",
    card_style: "elevated",
    dark_mode: "dark",
  },
  emerald_luxe: {
    name: "Emerald Luxe",
    primary_color: "#10b981",
    accent_color: "#34d399",
    bg_color: "#061a14",
    font: "Plus Jakarta Sans",
    button_style: "rounded",
    card_style: "glass",
    dark_mode: "dark",
  },
  clean_minimal: {
    name: "Clean Minimalist (Light)",
    primary_color: "#0f172a",
    accent_color: "#2563eb",
    bg_color: "#f8fafc",
    font: "Outfit",
    button_style: "pill",
    card_style: "bordered",
    dark_mode: "light",
  },
  royal_indigo: {
    name: "Royal Indigo",
    primary_color: "#6366f1",
    accent_color: "#818cf8",
    bg_color: "#0c0f1d",
    font: "Plus Jakarta Sans",
    button_style: "rounded",
    card_style: "glass",
    dark_mode: "dark",
  },
};

const DEFAULT_TEXTS = {
  write_review_btn: "Write a Review",
  call_btn: "Call Now",
  directions_btn: "Get Directions",
  about_heading: "About Us",
  photos_heading: "Photo Gallery",
  offers_heading: "Special Offers",
  hours_heading: "Opening Hours",
  faqs_heading: "Frequently Asked Questions",
  testimonials_heading: "What Customers Say",
  disclaimer: "Honest feedback helps genuine local businesses grow.",
};

const HUB_DESIGN_STORAGE_PREFIX = "zentap_hub_design_";
const HUB_BUTTONS_STORAGE_PREFIX = "zentap_hub_buttons_";
const HUB_SECTIONS_STORAGE_PREFIX = "zentap_hub_sections_";
const HUB_PHOTOS_STORAGE_PREFIX = "zentap_hub_photos_";
const HUB_CLICKS_STORAGE_KEY = "zentap_hub_click_events";

// -------------------------------------------------------------
// Get or initialize Page Design
// -------------------------------------------------------------
export function getPageDesign(businessId: string): PageDesignRecord {
  if (typeof window === "undefined") {
    return createDefaultPageDesign(businessId);
  }

  try {
    const raw = localStorage.getItem(`${HUB_DESIGN_STORAGE_PREFIX}${businessId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error reading page design from localStorage:", e);
  }

  const def = createDefaultPageDesign(businessId);
  savePageDesign(def);
  return def;
}

export function createDefaultPageDesign(businessId: string): PageDesignRecord {
  const biz = getBusinessById(businessId);
  const preset = THEME_PRESET_CONFIGS.modern_slate;

  return {
    business_id: businessId,
    hub_enabled: false,
    logo_url: "",
    cover_url: "",
    tagline: biz ? `${biz.city ? `${biz.city} • ` : ""}Welcome to our official digital hub` : "Welcome to our official digital hub",
    address: biz?.address || (biz?.city ? `${biz.city}, India` : ""),
    maps_link: biz?.review_url || "",
    theme_preset: "modern_slate",
    primary_color: preset.primary_color,
    accent_color: preset.accent_color,
    bg_color: preset.bg_color,
    font: preset.font,
    button_style: preset.button_style,
    card_style: preset.card_style,
    dark_mode: preset.dark_mode,
    show_powered_by: true,
    page_language: "en",
    texts: { ...DEFAULT_TEXTS },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function savePageDesign(design: PageDesignRecord): PageDesignRecord {
  const updated = {
    ...design,
    updated_at: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`${HUB_DESIGN_STORAGE_PREFIX}${design.business_id}`, JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving page design to localStorage:", e);
    }
  }

  return updated;
}

// -------------------------------------------------------------
// Page Buttons Management
// -------------------------------------------------------------
export function getPageButtons(businessId: string): PageButtonRecord[] {
  if (typeof window === "undefined") {
    return createDefaultButtons(businessId);
  }

  try {
    const raw = localStorage.getItem(`${HUB_BUTTONS_STORAGE_PREFIX}${businessId}`);
    if (raw) {
      const parsed: PageButtonRecord[] = JSON.parse(raw);
      return parsed.sort((a, b) => a.sort_order - b.sort_order);
    }
  } catch (e) {
    console.error("Error reading page buttons from localStorage:", e);
  }

  const defaults = createDefaultButtons(businessId);
  savePageButtons(businessId, defaults);
  return defaults;
}

export function createDefaultButtons(businessId: string): PageButtonRecord[] {
  const biz = getBusinessById(businessId);
  const now = new Date().toISOString();

  const list: PageButtonRecord[] = [
    {
      id: `btn_${businessId}_review`,
      business_id: businessId,
      type: "review",
      label: "Write a 5-Star Review",
      url_or_value: `/r/${biz?.slug || businessId}/review`,
      icon: "Star",
      sort_order: 0,
      visible: true,
      created_at: now,
    },
    {
      id: `btn_${businessId}_call`,
      business_id: businessId,
      type: "call",
      label: "Call Us",
      url_or_value: biz?.phone || "+919274560880",
      icon: "Phone",
      sort_order: 1,
      visible: !!biz?.phone,
      created_at: now,
    },
    {
      id: `btn_${businessId}_directions`,
      business_id: businessId,
      type: "directions",
      label: "Directions",
      url_or_value: biz?.review_url || "",
      icon: "MapPin",
      sort_order: 2,
      visible: true,
      created_at: now,
    },
    {
      id: `btn_${businessId}_whatsapp`,
      business_id: businessId,
      type: "whatsapp",
      label: "WhatsApp Chat",
      url_or_value: biz?.whatsapp_number || biz?.phone || "+919274560880",
      icon: "MessageCircle",
      sort_order: 3,
      visible: true,
      created_at: now,
    },
    {
      id: `btn_${businessId}_instagram`,
      business_id: businessId,
      type: "instagram",
      label: "Instagram",
      url_or_value: (biz as any)?.instagram_handle || biz?.instagram || biz?.instagram_url || "zentap.in",
      icon: "Instagram",
      sort_order: 4,
      visible: true,
      created_at: now,
    },
  ];

  return list;
}

export function savePageButtons(businessId: string, buttons: PageButtonRecord[]): PageButtonRecord[] {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`${HUB_BUTTONS_STORAGE_PREFIX}${businessId}`, JSON.stringify(buttons));
    } catch (e) {
      console.error("Error saving page buttons:", e);
    }
  }
  return buttons;
}

export function addPageButton(businessId: string, button: Omit<PageButtonRecord, "id" | "business_id">): PageButtonRecord {
  const current = getPageButtons(businessId);
  const newBtn: PageButtonRecord = {
    ...button,
    id: `btn_${businessId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    business_id: businessId,
    sort_order: button.sort_order ?? current.length,
    created_at: new Date().toISOString(),
  };

  const updated = [...current, newBtn];
  savePageButtons(businessId, updated);
  return newBtn;
}

export function updatePageButton(businessId: string, buttonId: string, patch: Partial<PageButtonRecord>): PageButtonRecord[] {
  const current = getPageButtons(businessId);
  const updated = current.map((b) => (b.id === buttonId ? { ...b, ...patch } : b));
  savePageButtons(businessId, updated);
  return updated;
}

export function deletePageButton(businessId: string, buttonId: string): PageButtonRecord[] {
  const current = getPageButtons(businessId);
  const updated = current.filter((b) => b.id !== buttonId);
  savePageButtons(businessId, updated);
  return updated;
}

// -------------------------------------------------------------
// Page Sections Management
// -------------------------------------------------------------
export function getPageSections(businessId: string): PageSectionRecord[] {
  if (typeof window === "undefined") {
    return createDefaultSections(businessId);
  }

  try {
    const raw = localStorage.getItem(`${HUB_SECTIONS_STORAGE_PREFIX}${businessId}`);
    if (raw) {
      const parsed: PageSectionRecord[] = JSON.parse(raw);
      return parsed.sort((a, b) => a.sort_order - b.sort_order);
    }
  } catch (e) {
    console.error("Error reading page sections from localStorage:", e);
  }

  const defaults = createDefaultSections(businessId);
  savePageSections(businessId, defaults);
  return defaults;
}

export function createDefaultSections(businessId: string): PageSectionRecord[] {
  const biz = getBusinessById(businessId);
  const now = new Date().toISOString();

  return [
    {
      id: `sec_${businessId}_about`,
      business_id: businessId,
      type: "about",
      content: {
        text: `Welcome to ${biz?.name || "our business"}! We take pride in delivering premier service, top craftsmanship, and genuine hospitality to every visitor.`,
      },
      sort_order: 0,
      visible: true,
      created_at: now,
    },
    {
      id: `sec_${businessId}_hours`,
      business_id: businessId,
      type: "hours",
      content: {
        schedule: [
          { days: "Mon - Sat", hours: "10:00 AM - 09:00 PM" },
          { days: "Sunday", hours: "11:00 AM - 06:00 PM" },
        ],
      },
      sort_order: 1,
      visible: true,
      created_at: now,
    },
    {
      id: `sec_${businessId}_photos`,
      business_id: businessId,
      type: "photos",
      content: {
        title: "Store & Atmosphere",
      },
      sort_order: 2,
      visible: true,
      created_at: now,
    },
    {
      id: `sec_${businessId}_faqs`,
      business_id: businessId,
      type: "faqs",
      content: {
        items: [
          { q: "Do you offer parking?", a: "Yes, dedicated parking is available right in front of our store." },
          { q: "What payment modes are accepted?", a: "UPI, Cards, Cash, and Net Banking." },
        ],
      },
      sort_order: 3,
      visible: true,
      created_at: now,
    },
  ];
}

export function savePageSections(businessId: string, sections: PageSectionRecord[]): PageSectionRecord[] {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`${HUB_SECTIONS_STORAGE_PREFIX}${businessId}`, JSON.stringify(sections));
    } catch (e) {
      console.error("Error saving page sections:", e);
    }
  }
  return sections;
}

export function updatePageSection(businessId: string, sectionId: string, patch: Partial<PageSectionRecord>): PageSectionRecord[] {
  const current = getPageSections(businessId);
  const updated = current.map((s) => (s.id === sectionId ? { ...s, ...patch } : s));
  savePageSections(businessId, updated);
  return updated;
}

export function addPageSection(businessId: string, section: Omit<PageSectionRecord, "id" | "business_id">): PageSectionRecord {
  const current = getPageSections(businessId);
  const newSec: PageSectionRecord = {
    ...section,
    id: `sec_${businessId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    business_id: businessId,
    sort_order: section.sort_order ?? current.length,
    created_at: new Date().toISOString(),
  };

  const updated = [...current, newSec];
  savePageSections(businessId, updated);
  return newSec;
}

export function deletePageSection(businessId: string, sectionId: string): PageSectionRecord[] {
  const current = getPageSections(businessId);
  const updated = current.filter((s) => s.id !== sectionId);
  savePageSections(businessId, updated);
  return updated;
}

// -------------------------------------------------------------
// Page Photos (Gallery) Management
// -------------------------------------------------------------
export function getPagePhotos(businessId: string): PagePhotoRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(`${HUB_PHOTOS_STORAGE_PREFIX}${businessId}`);
    if (raw) {
      const parsed: PagePhotoRecord[] = JSON.parse(raw);
      return parsed.sort((a, b) => a.sort_order - b.sort_order);
    }
  } catch (e) {
    console.error("Error reading page photos:", e);
  }

  return [];
}

export function savePagePhotos(businessId: string, photos: PagePhotoRecord[]): PagePhotoRecord[] {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`${HUB_PHOTOS_STORAGE_PREFIX}${businessId}`, JSON.stringify(photos));
    } catch (e) {
      console.error("Error saving photos:", e);
    }
  }
  return photos;
}

export function addPagePhoto(businessId: string, imageUrl: string, caption?: string): PagePhotoRecord {
  const current = getPagePhotos(businessId);
  const newPhoto: PagePhotoRecord = {
    id: `photo_${businessId}_${Date.now()}`,
    business_id: businessId,
    image_url: imageUrl,
    caption: caption || "",
    sort_order: current.length,
    created_at: new Date().toISOString(),
  };

  const updated = [...current, newPhoto];
  savePagePhotos(businessId, updated);
  return newPhoto;
}

export function deletePagePhoto(businessId: string, photoId: string): PagePhotoRecord[] {
  const current = getPagePhotos(businessId);
  const updated = current.filter((p) => p.id !== photoId);
  savePagePhotos(businessId, updated);
  return updated;
}

// -------------------------------------------------------------
// Duplicate Design from another Business
// -------------------------------------------------------------
export function duplicatePageDesign(sourceBizId: string, targetBizId: string) {
  const sourceDesign = getPageDesign(sourceBizId);
  const sourceButtons = getPageButtons(sourceBizId);
  const sourceSections = getPageSections(sourceBizId);
  const sourcePhotos = getPagePhotos(sourceBizId);

  const newDesign: PageDesignRecord = {
    ...sourceDesign,
    business_id: targetBizId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  savePageDesign(newDesign);

  const newButtons: PageButtonRecord[] = sourceButtons.map((b) => ({
    ...b,
    id: `btn_${targetBizId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    business_id: targetBizId,
  }));
  savePageButtons(targetBizId, newButtons);

  const newSections: PageSectionRecord[] = sourceSections.map((s) => ({
    ...s,
    id: `sec_${targetBizId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    business_id: targetBizId,
  }));
  savePageSections(targetBizId, newSections);

  const newPhotos: PagePhotoRecord[] = sourcePhotos.map((p) => ({
    ...p,
    id: `photo_${targetBizId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    business_id: targetBizId,
  }));
  savePagePhotos(targetBizId, newPhotos);
}

// -------------------------------------------------------------
// Click Events & Telemetry
// -------------------------------------------------------------
export function logClickEvent(
  businessId: string,
  buttonType: string,
  source: "qr" | "nfc" | "web" = "web"
): ClickEventRecord {
  const event: ClickEventRecord = {
    id: `clk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    business_id: businessId,
    button_type: buttonType,
    source,
    created_at: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(HUB_CLICKS_STORAGE_KEY);
      const list: ClickEventRecord[] = raw ? JSON.parse(raw) : [];
      list.push(event);
      localStorage.setItem(HUB_CLICKS_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error("Error logging click event:", e);
    }
  }

  return event;
}

export function getAllClickEvents(businessId?: string): ClickEventRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HUB_CLICKS_STORAGE_KEY);
    const list: ClickEventRecord[] = raw ? JSON.parse(raw) : [];
    if (businessId) {
      return list.filter((c) => c.business_id === businessId);
    }
    return list;
  } catch {
    return [];
  }
}
