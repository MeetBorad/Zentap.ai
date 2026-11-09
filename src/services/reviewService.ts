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
  length?: "short" | "medium" | "detailed";
  selectedTags: string[];
  customNotes?: string;
  seed?: number;
  language?: string;
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
  seed = 0,
  language = "english",
}: ReviewDraftOptions): string[] {
  const tagsText = formatTagsSentence(selectedTags);
  const clampedRating = Math.max(1, Math.min(5, Math.round(rating))) as 1 | 2 | 3 | 4 | 5;
  const noteObj = cleanExperienceNote(customNotes);
  const cleanSeed = Math.abs(Math.floor(seed || 0));

  const isGujlish = String(language || "").toLowerCase().includes("gu");
  const isHinglish = String(language || "").toLowerCase().includes("hi") || String(language || "").toLowerCase().includes("hinglish");

  if (clampedRating >= 4) {
    if (isGujlish) {
      if (noteObj) {
        return [
          `Bahu saras experience rahyo ${businessName} ma! ${noteObj.sentence} ${tagsText} ekdum mast che. Strongly recommend!`,
          `${businessName} nu kaam ane service khub j saru che. ${noteObj.sentence} Staff pan friendly che ane ${tagsText} perfect hatu.`,
          `Superb quality and great assistance at ${businessName}. ${noteObj.sentence} 10/10 for ${tagsText}!`,
        ];
      }
      return [
        `${businessName} ma bahu saras service mali! ${tagsText} khub j gamyu. Badha ne recommend karu chu!`,
        `Khub j saras experience rahyo ${businessName} sathe. Staff no nature helpful che ane ${tagsText} ekdum badhiya che!`,
        `Superb work at ${businessName}! Fast service ane reliable team. 5 stars for ${tagsText}!`,
      ];
    }

    if (isHinglish) {
      if (noteObj) {
        return [
          `Bahut hi badiya experience raha ${businessName} ke saath! ${noteObj.sentence} ${tagsText} ekdum top quality thi. Highly recommended!`,
          `${businessName} ki service sach me lajawab hai. ${noteObj.sentence} Staff ka behavior bohot polite tha aur ${tagsText} time pe hua!`,
          `Overall shandar service! ${businessName} par ${noteObj.sentence} ${tagsText} kaafi badhiya laga. 5/5 stars!`,
        ];
      }
      return [
        `Bahut badiya experience raha ${businessName} ke sath! ${tagsText} ekdum mast thi. Definitely recommend karunga!`,
        `${businessName} ki service sach me kaafi impressive hai. Polite staff aur ${tagsText} ekdum perfect tha!`,
        `Shandar service aur reliable kaam at ${businessName}. ${tagsText} ke liye 5 stars!`,
      ];
    }
  }

  // When rating is 1 or 2 stars (Google Anti-Gating compliant polite feedback)
  if (clampedRating <= 2) {
    if (noteObj) {
      const sets = [
        [
          `Visited ${businessName} for ${noteObj.clause}. Service had notable areas to improve, particularly regarding ${tagsText}.`,
          `Regarding ${noteObj.clause} at ${businessName}, the overall experience fell below expectations around ${tagsText}. Hope management addresses this.`,
          `Encountered difficulties at ${businessName} with ${noteObj.clause}. Communication and ${tagsText} could definitely be improved for future clients.`
        ],
        [
          `Had an unsatisfactory encounter at ${businessName} regarding ${noteObj.clause}. The ${tagsText} was not up to the mark.`,
          `Expected much better support for ${noteObj.clause} at ${businessName}. Significant improvements needed in ${tagsText}.`,
          `My visit to ${businessName} for ${noteObj.clause} fell short of expectations, especially concerning ${tagsText}.`
        ]
      ];
      return sets[cleanSeed % sets.length];
    }
    const sets = [
      [
        `Service at ${businessName} had several points to improve, especially around ${tagsText}.`,
        `Had an underwhelming experience with ${businessName} regarding ${tagsText}. Hope to see better standards next time.`,
        `The visit fell below expectations. While the concept is clear, execution regarding ${tagsText} needs more attention.`
      ],
      [
        `Disappointed with the recent service at ${businessName}. Found ${tagsText} lacking and hope management takes note.`,
        `Overall interaction at ${businessName} was below standard. Room for serious refinement in ${tagsText}.`,
        `Hoped for a better standard at ${businessName}. Quality of ${tagsText} needs re-evaluation.`
      ]
    ];
    return sets[cleanSeed % sets.length];
  }

  // 3 Stars (Neutral / Satisfactory)
  if (clampedRating === 3) {
    if (noteObj) {
      const sets = [
        [
          `${businessName} provides decent service. ${noteObj.sentence} Experience with ${tagsText} was average but acceptable.`,
          `Visited for ${noteObj.clause}. Overall okay experience at ${businessName}; ${tagsText} were standard with room to improve.`,
          `Fair experience at ${businessName} regarding ${noteObj.clause}. Staff was okay and ${tagsText} was reasonable.`
        ],
        [
          `Standard visit to ${businessName} for ${noteObj.clause}. Satisfactory ${tagsText}, though there is scope for better consistency.`,
          `Decent interaction at ${businessName}. ${noteObj.sentence} The ${tagsText} met baseline expectations.`,
          `Okay visit overall. Had ${noteObj.clause} at ${businessName}; ${tagsText} was acceptable.`
        ]
      ];
      return sets[cleanSeed % sets.length];
    }
    const sets = [
      [
        `${businessName} provides decent assistance. Experience with ${tagsText} was okay.`,
        `Average experience visiting ${businessName}. The ${tagsText} were standard. Hoping to see more feature updates in the near future.`,
        `Fair service at ${businessName}. Good base setup and acceptable ${tagsText}, with room for further refinement.`
      ],
      [
        `Satisfactory experience at ${businessName}. Service around ${tagsText} was acceptable.`,
        `Standard visit to ${businessName} in ${city}. The ${tagsText} was okay, with potential for more polish.`,
        `Balanced service at ${businessName}. Good effort with ${tagsText}, though could be improved.`
      ]
    ];
    return sets[cleanSeed % sets.length];
  }

  // 4 & 5 Stars: Generate 3 unique humanized reviews per set
  if (length === "short") {
    if (noteObj) {
      const sets = [
        [
          `Loved my experience at ${businessName}! ${noteObj.sentence} The ${tagsText} was truly impressive.`,
          `Super friendly staff at ${businessName}. ${noteObj.sentence} Really appreciated their ${tagsText}!`,
          `Great value and top quality at ${businessName}. ${noteObj.sentence} 10/10 for ${tagsText}!`,
        ],
        [
          `Had a wonderful visit to ${businessName}! ${noteObj.sentence} Loved the quick ${tagsText}.`,
          `Delighted with ${businessName}. ${noteObj.sentence} Special shoutout for their great ${tagsText}!`,
          `Smooth experience at ${businessName}. ${noteObj.sentence} Can't beat their ${tagsText}!`,
        ]
      ];
      return sets[cleanSeed % sets.length];
    }
    const sets = [
      [
        `Loved the service at ${businessName}! Highlight was definitely the ${tagsText}. Highly recommend!`,
        `Great overall experience at ${businessName}. Really appreciated the polite staff and ${tagsText}.`,
        `Super fast, reliable, and convenient. The ${tagsText} at ${businessName} was top-notch!`,
      ],
      [
        `Really pleased with ${businessName} in ${city}! Top marks for their ${tagsText}.`,
        `Fantastic experience at ${businessName}. Impressive ${tagsText} and warm people!`,
        `Cannot fault the service at ${businessName}. 10/10 for their ${tagsText}!`,
      ]
    ];
    return sets[cleanSeed % sets.length];
  }

  if (length === "detailed") {
    if (noteObj) {
      const sets = [
        [
          `${businessName} in ${city} delivered an outstanding customer experience! ${noteObj.sentence} From the moment I arrived, the emphasis on ${tagsText} was clearly evident. Everything was handled with utmost care and transparency. Would recommend them without any hesitation!`,
          `Cannot say enough good things about ${businessName}. ${noteObj.sentence} Their team went above and beyond with exceptional ${tagsText} and genuine hospitality. It is rare to see this level of dedication and attention to customer comfort in ${city}. Truly worth every star!`,
          `If you are looking for exceptional quality and reliability in ${city}, ${businessName} is the best place to choose. ${noteObj.sentence} Their commitment to ${tagsText} is second to none, making the entire interaction smooth and completely hassle-free. Five stars all the way!`,
        ],
        [
          `My visit to ${businessName} completely surpassed expectations! ${noteObj.sentence} What stood out most was their meticulous approach to ${tagsText}. The staff was incredibly knowledgeable, attentive, and welcoming. Truly one of the finest service teams in ${city}!`,
          `From start to finish, ${businessName} provided exceptional quality. ${noteObj.sentence} Their outstanding ${tagsText} and seamless coordination made everything feel effortless. Highly impressed and looking forward to returning!`,
          `A stellar experience with ${businessName} in ${city}! ${noteObj.sentence} It's so refreshing to see such dedication to customer satisfaction and premium ${tagsText}. An absolute pleasure from beginning to end!`,
        ]
      ];
      return sets[cleanSeed % sets.length];
    }
    const sets = [
      [
        `${businessName} in ${city} is setting a benchmark for quality and customer service. My experience was exceptional, characterized by notable ${tagsText}. The entire interaction was completely frictionless, and the team provided thorough guidance. Excellent value, top-tier professionalism, and highly recommended!`,
        `Highly satisfied with ${businessName}. What stood out most was the warm, welcoming environment and outstanding ${tagsText}. Every inquiry was answered promptly and courteously, making this one of our best service experiences in ${city}.`,
        `Phenomenal standard of work by ${businessName} in ${city}. Their proactive approach, attention to detail, and ${tagsText} make them a standout choice. A flawless experience from start to finish that I will gladly recommend to friends and colleagues!`,
      ],
      [
        `An absolute pleasure visiting ${businessName} in ${city}. Their remarkable dedication to ${tagsText} and genuine customer care truly make them shine. The entire process was seamless and efficient. 5 stars well deserved!`,
        `Top marks for ${businessName}! The attention given to ${tagsText} created a stress-free and very pleasant experience. Extremely courteous professionals and outstanding quality throughout.`,
        `Cannot recommend ${businessName} highly enough. Every detail regarding ${tagsText} was addressed with perfection. A shining example of customer-first service in ${city}!`,
      ]
    ];
    return sets[cleanSeed % sets.length];
  }

  // Default: Medium (3-4 natural sentences) — 4 distinct sets for rich cycling
  if (noteObj) {
    const sets = [
      [
        `I had a wonderful experience at ${businessName} in ${city}! ${noteObj.sentence} The team displayed utmost ${tagsText} throughout. Fast response and friendly support made everything completely seamless. Highly recommended!`,
        `Very impressed with the hospitality and service at ${businessName}. ${noteObj.sentence} The staff showed great ${tagsText} and answered every query patiently. Definitely coming back again!`,
        `Top-notch quality and fantastic service at ${businessName}! ${noteObj.sentence} You can really feel their dedication to ${tagsText} and fair pricing. One of the best places in ${city}!`,
      ],
      [
        `Genuinely delighted with my visit to ${businessName}! ${noteObj.sentence} Their attention to ${tagsText} really sets them apart. Everything was handled efficiently with a warm, welcoming attitude.`,
        `Outstanding service from start to finish at ${businessName}. ${noteObj.sentence} The focus on ${tagsText} made all the difference. Will definitely be recommending to friends and family in ${city}!`,
        `A truly 5-star experience at ${businessName}! ${noteObj.sentence} Super friendly people, prompt attention, and phenomenal ${tagsText}. Keep up the great work!`,
      ],
      [
        `Cannot recommend ${businessName} enough! ${noteObj.sentence} Extremely satisfied with their prompt response and exceptional ${tagsText}. Everything was smooth and well-managed.`,
        `Had a great encounter at ${businessName} today. ${noteObj.sentence} It's rare to find such high standards of ${tagsText} combined with warm customer care. Truly memorable!`,
        `Spot-on service at ${businessName}! ${noteObj.sentence} From their welcoming attitude to the top-tier ${tagsText}, they completely exceeded my expectations.`,
      ],
      [
        `Five stars all the way for ${businessName}! ${noteObj.sentence} Their dedication to ${tagsText} was evident throughout. Smooth, fast, and completely hassle-free from start to end!`,
        `Remarkable service at ${businessName} in ${city}. ${noteObj.sentence} Appreciated their professionalism and great attention to ${tagsText}. Highly recommended!`,
        `Loved every bit of my visit to ${businessName}. ${noteObj.sentence} The team delivered top-quality ${tagsText} without any delay. A fantastic local business!`,
      ]
    ];
    return sets[cleanSeed % sets.length];
  }

  const sets = [
    [
      `I had a wonderful experience at ${businessName} in ${city}! The team displayed utmost ${tagsText} throughout their setup. Fast response and friendly support made the entire onboarding seamless. Highly recommended for anyone looking for quality!`,
      `Very solid experience at ${businessName}. The staff demonstrated excellent ${tagsText}. Setup was fast, welcoming, and the service works just as promised. Worth trying out!`,
      `Great value and top-tier professionalism at ${businessName} in ${city}. Highlight was definitely the ${tagsText}. Genuine, efficient, and thoroughly satisfying customer service!`,
    ],
    [
      `Truly impressive service from the team at ${businessName}! What stood out immediately was their ${tagsText}. Friendly atmosphere and quick assistance from start to finish.`,
      `Had a fantastic visit to ${businessName} in ${city}. They clearly take pride in their ${tagsText}. Will gladly come back and recommend to others!`,
      `Exceptional hospitality and flawless service at ${businessName}. The ${tagsText} exceeded expectations. Definitely a 5-star experience!`,
    ],
    [
      `Everything at ${businessName} was handled with genuine care and efficiency. Their focus on ${tagsText} made a noticeable positive difference.`,
      `Super pleased with the standard of service at ${businessName}. Quick turnaround, polite team, and remarkable ${tagsText}. Five stars!`,
      `Consistently high quality and warm guidance at ${businessName} in ${city}. Their ${tagsText} is commendable. A truly seamless experience!`,
    ],
    [
      `A standout business in ${city}! The staff at ${businessName} was courteous, and their dedication to ${tagsText} is second to none.`,
      `Great atmosphere and prompt customer support at ${businessName}. 10/10 recommendation for their ${tagsText} and fair pricing!`,
      `Very happy with my visit to ${businessName}. They take customer satisfaction seriously, especially regarding ${tagsText}. Will return for sure!`,
    ]
  ];
  return sets[cleanSeed % sets.length];
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
