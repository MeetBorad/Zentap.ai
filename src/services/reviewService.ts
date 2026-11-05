/**
 * ZenTap.ai — Review Business Logic Service
 *
 * Encapsulates review template generation, rating sentiments,
 * and review submission logic outside of React UI components.
 */

export interface ReviewDraftOptions {
  businessName: string;
  city?: string;
  rating: number;
  length: "short" | "medium" | "detailed";
  selectedTags: string[];
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
  if (tags.length === 0) return "quality service";
  if (tags.length === 1) return tags[0].toLowerCase();
  if (tags.length === 2) return `${tags[0].toLowerCase()} and ${tags[1].toLowerCase()}`;
  return `${tags.slice(0, -1).map((t) => t.toLowerCase()).join(", ")} and ${tags[tags.length - 1].toLowerCase()}`;
}

/**
 * Generate a personalized review draft based on star rating, length, and selected aspects.
 */
export function generateReviewDraft({
  businessName,
  city = "Ahmedabad",
  rating,
  length,
  selectedTags,
}: ReviewDraftOptions): string {
  const tagsText = formatTagsSentence(selectedTags);

  const templates = {
    short: {
      5: `Loved the service at ${businessName}! Highlight was definitely the ${tagsText}. Highly recommend!`,
      4: `Great overall experience at ${businessName}. Really appreciated the ${tagsText}.`,
      3: `${businessName} provides decent assistance. Experience with ${tagsText} was okay.`,
      2: `Service had some points to improve, especially around ${tagsText}.`,
      1: `Had an underwhelming experience with ${businessName} regarding ${tagsText}.`,
    },
    medium: {
      5: `I had a wonderful experience at ${businessName} in ${city}! The team displayed utmost ${tagsText} throughout their setup. Fast response and friendly support made the entire onboarding seamless. Highly recommended for any business looking to modernize!`,
      4: `Very solid experience at ${businessName}. The staff demonstrated excellent ${tagsText}. Setup was fast and the service works just as promised. Worth trying out.`,
      3: `Average experience visiting ${businessName}. The ${tagsText} were standard. Hoping to see more feature updates in the near future.`,
      2: `The experience had several hurdles. While ${tagsText} were partly present, communication could be improved for next time.`,
      1: `Unfortunately did not match expectations. Issues encountered primarily related to ${tagsText}. Hope the team addresses this feedback promptly.`,
    },
    detailed: {
      5: `${businessName} in ${city} is revolutionizing digital networking and local customer services. My experience was exceptional, characterized by notable ${tagsText}. The entire interaction was completely frictionless, and the team provided thorough guidance. Excellent value, top-tier professionalism, and highly recommended!`,
      4: `Highly satisfied with ${businessName}. Their service delivered on all fronts with outstanding ${tagsText}. Minor queries were answered promptly, making this a great local technological service in ${city}.`,
      3: `An okay experience with ${businessName}. The core concept is practical, and ${tagsText} were reasonably executed. However, workflow speeds and support follow-ups could use additional refinement. Good base service with room for growth.`,
      2: `My visit to ${businessName} was below expectation. Even though ${tagsText} was noted, the overall execution and customer handoff had delays. Needs more attentiveness to customer requirements.`,
      1: `Disappointed with the overall service from ${businessName}. The interaction around ${tagsText} fell far short of professional standards. Hope management reviews client onboarding to fix these bottlenecks.`,
    },
  };

  const clampedRating = Math.max(1, Math.min(5, Math.round(rating))) as 1 | 2 | 3 | 4 | 5;
  return templates[length][clampedRating] || templates[length][5];
}
