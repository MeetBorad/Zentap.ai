/**
 * ZenTap.ai — Review Business Logic Service
 *
 * Encapsulates review template generation, rating sentiments,
 * humanized AI-style multi-angle suggestions, custom experience blending,
 * and review submission logic outside of React UI components.
 */

export interface ReviewDraftOptions {
  businessName: string;
  city?: string;
  rating: number;
  length: "short" | "medium" | "detailed";
  selectedTags: string[];
  customNotes?: string;
}

export interface ReviewSentiment {
  isPositive: boolean;
  requiresPrivateResolution: boolean;
  label: string;
  desc: string;
}

export const REVIEW_RATING_METAS: Record<number, ReviewSentiment> = {
  1: { isPositive: false, requiresPrivateResolution: true, label: "Needs Improvement", desc: "(1 Star)" },
  2: { isPositive: false, requiresPrivateResolution: true, label: "Could be Better", desc: "(2 Stars)" },
  3: { isPositive: true, requiresPrivateResolution: false, label: "Satisfactory", desc: "(3 Stars)" },
  4: { isPositive: true, requiresPrivateResolution: false, label: "Great Experience!", desc: "(4 Stars)" },
  5: { isPositive: true, requiresPrivateResolution: false, label: "Loved it!", desc: "(5 Stars)" },
};

export const DEFAULT_REVIEW_TAGS = [
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
] as const;

/**
 * Format a list of tag strings into a grammatically natural clause.
 */
export function formatTagsSentence(tags: string[]): string {
  if (!tags || tags.length === 0) return "quality service";
  if (tags.length === 1) return tags[0].toLowerCase();
  if (tags.length === 2) return `${tags[0].toLowerCase()} and ${tags[1].toLowerCase()}`;
  return `${tags.slice(0, -1).map((t) => t.toLowerCase()).join(", ")} and ${tags[tags.length - 1].toLowerCase()}`;
}

/**
 * Helper to naturalize user-entered experience notes (e.g. "bought purse nice", "bought 2 paird of cloth")
 */
function cleanExperienceNote(rawNotes?: string): { clause: string; sentence: string } | null {
  if (!rawNotes || !rawNotes.trim()) return null;
  const trimmed = rawNotes.trim().replace(/[.,;]+$/, "");
  if (!trimmed) return null;

  // Capitalize first character
  const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  const sentence = capitalized.endsWith(".") ? capitalized : `${capitalized}.`;

  return {
    clause: trimmed,
    sentence,
  };
}

/**
 * Generate 2 to 3 distinct, humanized review suggestions based on:
 * - Star rating
 * - Custom customer experience input (e.g., "bought purse nice", "bought 2 pairs of clothes")
 * - Selected aspect tags
 * - Review length (short, medium, detailed)
 */
export function generateReviewSuggestions({
  businessName,
  city = "Ahmedabad",
  rating,
  length,
  selectedTags,
  customNotes,
}: ReviewDraftOptions): string[] {
  const tagsText = formatTagsSentence(selectedTags);
  const clampedRating = Math.max(1, Math.min(5, Math.round(rating))) as 1 | 2 | 3 | 4 | 5;
  const noteObj = cleanExperienceNote(customNotes);

  // When rating is 1 or 2 stars (Google Anti-Gating compliant polite feedback)
  if (clampedRating <= 2) {
    if (noteObj) {
      return [
        `Visited ${businessName} for ${noteObj.clause}. Service had notable areas to improve, particularly regarding ${tagsText}.`,
        `Regarding ${noteObj.clause} at ${businessName}, the overall experience fell below expectations around ${tagsText}. Hope management addresses this.`,
        `Encountered difficulties at ${businessName} with ${noteObj.clause}. Communication and ${tagsText} could definitely be improved for future clients.`
      ];
    }
    return [
      `Service at ${businessName} had several points to improve, especially around ${tagsText}.`,
      `Had an underwhelming experience with ${businessName} regarding ${tagsText}. Hope to see better standards next time.`,
      `The visit fell below expectations. While the concept is clear, execution regarding ${tagsText} needs more attention.`
    ];
  }

  // 3 Stars (Neutral / Satisfactory)
  if (clampedRating === 3) {
    if (noteObj) {
      return [
        `${businessName} provides decent service. ${noteObj.sentence} Experience with ${tagsText} was average but acceptable.`,
        `Visited for ${noteObj.clause}. Overall okay experience at ${businessName}; ${tagsText} were standard with room to improve.`,
        `Fair experience at ${businessName} regarding ${noteObj.clause}. Staff was okay and ${tagsText} was reasonable.`
      ];
    }
    return [
      `${businessName} provides decent assistance. Experience with ${tagsText} was okay.`,
      `Average experience visiting ${businessName}. The ${tagsText} were standard. Hoping to see more feature updates in the near future.`,
      `Fair service at ${businessName}. Good base setup and acceptable ${tagsText}, with room for further refinement.`
    ];
  }

  // 4 & 5 Stars: Generate 3 unique humanized angles
  // ANGLE 1: Experience & Purchase Focus
  // ANGLE 2: Hospitality, Staff & Atmosphere Focus
  // ANGLE 3: Quality, Speed & Repeat Recommendation Focus

  if (length === "short") {
    if (noteObj) {
      return [
        `Loved my experience at ${businessName}! ${noteObj.sentence} The ${tagsText} was truly impressive.`,
        `Super friendly staff at ${businessName}. ${noteObj.sentence} Really appreciated their ${tagsText}!`,
        `Great value and top quality at ${businessName}. ${noteObj.sentence} 10/10 for ${tagsText}!`,
      ];
    }
    return [
      `Loved the service at ${businessName}! Highlight was definitely the ${tagsText}. Highly recommend!`,
      `Great overall experience at ${businessName}. Really appreciated the polite staff and ${tagsText}.`,
      `Super fast, reliable, and convenient. The ${tagsText} at ${businessName} was top-notch!`,
    ];
  }

  if (length === "detailed") {
    if (noteObj) {
      return [
        `${businessName} in ${city} delivered an outstanding customer experience! ${noteObj.sentence} From the moment I arrived, the emphasis on ${tagsText} was clearly evident. Everything was handled with utmost care and transparency. Would recommend them without any hesitation!`,
        `Cannot say enough good things about ${businessName}. ${noteObj.sentence} Their team went above and beyond with exceptional ${tagsText} and genuine hospitality. It is rare to see this level of dedication and attention to customer comfort in ${city}. Truly worth every star!`,
        `If you are looking for exceptional quality and reliability in ${city}, ${businessName} is the best place to choose. ${noteObj.sentence} Their commitment to ${tagsText} is second to none, making the entire interaction smooth and completely hassle-free. Five stars all the way!`,
      ];
    }
    return [
      `${businessName} in ${city} is setting a benchmark for quality and customer service. My experience was exceptional, characterized by notable ${tagsText}. The entire interaction was completely frictionless, and the team provided thorough guidance. Excellent value, top-tier professionalism, and highly recommended!`,
      `Highly satisfied with ${businessName}. What stood out most was the warm, welcoming environment and outstanding ${tagsText}. Every inquiry was answered promptly and courteously, making this one of our best service experiences in ${city}.`,
      `Phenomenal standard of work by ${businessName} in ${city}. Their proactive approach, attention to detail, and ${tagsText} make them a standout choice. A flawless experience from start to finish that I will gladly recommend to friends and colleagues!`,
    ];
  }

  // Default: Medium (3-4 natural sentences)
  if (noteObj) {
    return [
      `I had a wonderful experience at ${businessName} in ${city}! ${noteObj.sentence} The team displayed utmost ${tagsText} throughout. Fast response and friendly support made everything completely seamless. Highly recommended!`,
      `Very impressed with the hospitality and service at ${businessName}. ${noteObj.sentence} The staff showed great ${tagsText} and answered every query patiently. Definitely coming back again!`,
      `Top-notch quality and fantastic service at ${businessName}! ${noteObj.sentence} You can really feel their dedication to ${tagsText} and fair pricing. One of the best places in ${city}!`,
    ];
  }

  return [
    `I had a wonderful experience at ${businessName} in ${city}! The team displayed utmost ${tagsText} throughout their setup. Fast response and friendly support made the entire onboarding seamless. Highly recommended for anyone looking for quality!`,
    `Very solid experience at ${businessName}. The staff demonstrated excellent ${tagsText}. Setup was fast, welcoming, and the service works just as promised. Worth trying out!`,
    `Great value and top-tier professionalism at ${businessName} in ${city}. Highlight was definitely the ${tagsText}. Genuine, efficient, and thoroughly satisfying customer service!`,
  ];
}

/**
 * Generate a personalized review draft based on star rating, length, selected aspects,
 * and optional custom experience notes.
 */
export function generateReviewDraft(options: ReviewDraftOptions, variantIndex: number = 0): string {
  const suggestions = generateReviewSuggestions(options);
  if (suggestions.length === 0) {
    return `Great experience at ${options.businessName}! Highly recommended.`;
  }
  const safeIndex = Math.max(0, Math.min(suggestions.length - 1, variantIndex));
  return suggestions[safeIndex];
}
