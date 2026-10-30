/**
 * Google Analytics 4 (GA4) Integration & Event Tracking Helper
 * Measurement ID: G-XFM1PXQ03E
 */

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-XFM1PXQ03E";

declare global {
  interface Window {
    gtag?: (
      command: "config" | "event" | "consent" | "js" | "set",
      targetIdOrAction: string | Date,
      configOrParams?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

// Track page views (for both App Router navigation and SPA active view changes)
export const trackPageView = (url: string, title?: string) => {
  if (typeof window === "undefined" || !window.gtag) return;
  try {
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: title || document.title,
    });
  } catch (err) {
    console.debug("[GA4] pageview error:", err);
  }
};

// Generic event tracking
export const trackEvent = (action: string, params: Record<string, any> = {}) => {
  if (typeof window === "undefined" || !window.gtag) return;
  try {
    window.gtag("event", action, params);
  } catch (err) {
    console.debug("[GA4] event error:", err);
  }
};

// High-Value Conversion & Interactive Event Helpers
export const trackCtaClick = (ctaName: string, destination?: string) => {
  trackEvent("click_cta", {
    cta_name: ctaName,
    destination: destination || "",
    timestamp: new Date().toISOString(),
  });
};

export const trackPhoneClick = (phoneNumber: string = "+919274560880", location: string = "general") => {
  trackEvent("click_phone", {
    phone_number: phoneNumber,
    click_location: location,
  });
};

export const trackWhatsAppClick = (location: string = "general", businessName?: string) => {
  trackEvent("click_whatsapp", {
    click_location: location,
    business_name: businessName || "ZenTap Direct",
  });
};

export const trackEmailClick = (email: string = "contact@zentapdigitalsolutions.com", location: string = "general") => {
  trackEvent("click_email", {
    email,
    click_location: location,
  });
};

export const trackOutboundClick = (url: string, label: string) => {
  trackEvent("click_outbound", {
    outbound_url: url,
    link_label: label,
  });
};

export const trackContactFormSubmit = (formType: string, meta: Record<string, any> = {}) => {
  trackEvent("submit_contact_form", {
    form_type: formType,
    ...meta,
  });
};

export const trackReviewSentiment = (rating: number, mode: "google_redirect" | "private_feedback", slug?: string) => {
  trackEvent("review_interaction", {
    rating,
    action_type: mode,
    slug: slug || "general",
  });
};
