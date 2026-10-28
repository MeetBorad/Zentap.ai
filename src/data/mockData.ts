export interface StandeeItem {
  id: string;
  serial: string;
  businessName: string;
  location: string;
  tapsTotal: number;
  tapsToday: number;
  status: "online" | "idle" | "offline";
  batteryPct: number;
  signalStrength: number;
  destination: "google" | "yelp" | "tripadvisor" | "wifi";
  destinationUrl: string;
  lastTapAgo: string;
  model: string;
  color: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  source: "google" | "private_intercept";
  date: string;
  comment: string;
  sentiment: "positive" | "neutral" | "negative";
  status: "published" | "intercepted" | "replied";
  standeeLocation: string;
  aiSuggestedReply: string;
  ownerReply?: string;
}

export const INITIAL_STANDEES: StandeeItem[] = [
  {
    id: "st-101",
    serial: "ZT-8821-A",
    businessName: "The Urban Bistro & Lounge",
    location: "Front Checkout Station #1",
    tapsTotal: 1428,
    tapsToday: 48,
    status: "online",
    batteryPct: 98,
    signalStrength: 99,
    destination: "google",
    destinationUrl: "https://g.page/r/urban-bistro/review",
    lastTapAgo: "14s ago",
    model: "Matte Obsidian Glass Standee",
    color: "Obsidian Black",
  },
  {
    id: "st-102",
    serial: "ZT-8821-B",
    businessName: "The Urban Bistro & Lounge",
    location: "Bar & Cocktail Counter",
    tapsTotal: 964,
    tapsToday: 32,
    status: "online",
    batteryPct: 94,
    signalStrength: 98,
    destination: "google",
    destinationUrl: "https://g.page/r/urban-bistro/review",
    lastTapAgo: "4m ago",
    model: "Matte Obsidian Glass Standee",
    color: "Obsidian Black",
  },
  {
    id: "st-103",
    serial: "ZT-8821-C",
    businessName: "The Urban Bistro & Lounge",
    location: "Outdoor Patio Entrance",
    tapsTotal: 520,
    tapsToday: 19,
    status: "online",
    batteryPct: 88,
    signalStrength: 92,
    destination: "google",
    destinationUrl: "https://g.page/r/urban-bistro/review",
    lastTapAgo: "18m ago",
    model: "Weatherproof Acrylic Pro",
    color: "Charcoal Grey",
  },
  {
    id: "st-104",
    serial: "ZT-9412-A",
    businessName: "Cafe Milano",
    location: "Main Espresso Register",
    tapsTotal: 2140,
    tapsToday: 67,
    status: "online",
    batteryPct: 97,
    signalStrength: 100,
    destination: "google",
    destinationUrl: "https://g.page/r/cafemilano/review",
    lastTapAgo: "2m ago",
    model: "Brushed Brass Custom Edition",
    color: "Champagne Gold",
  },
];

export const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    author: "Elena Rostova",
    rating: 5,
    source: "google",
    date: "12 minutes ago",
    comment: "Tapped the sleek standee on my way out! The wild mushroom truffle risotto was unbelievable. Best service in town.",
    sentiment: "positive",
    status: "replied",
    standeeLocation: "Front Checkout Station #1",
    aiSuggestedReply: "Elena, thank you so much for the glowing review! Our chef takes tremendous pride in the wild mushroom truffle risotto. See you again soon!",
    ownerReply: "Elena, thank you so much for the glowing review! Our chef takes tremendous pride in the wild mushroom truffle risotto. See you again soon!",
  },
  {
    id: "rev-2",
    author: "Marcus Chen",
    rating: 5,
    source: "google",
    date: "45 minutes ago",
    comment: "Super convenient NFC tap to leave a review right from my phone! Great craft cocktails and relaxed vibe.",
    sentiment: "positive",
    status: "published",
    standeeLocation: "Bar & Cocktail Counter",
    aiSuggestedReply: "Marcus, delighted you enjoyed both our cocktail selections and the effortless tap experience! Looking forward to having you back at the bar.",
  },
  {
    id: "rev-3",
    author: "David K.",
    rating: 2,
    source: "private_intercept",
    date: "2 hours ago",
    comment: "The main course took 35 minutes to arrive and was slightly lukewarm. Staff was polite, but timing was off.",
    sentiment: "negative",
    status: "intercepted",
    standeeLocation: "Outdoor Patio Entrance",
    aiSuggestedReply: "Hi David, thank you for sharing your feedback directly with management. We apologize for the kitchen delay today. A manager would love to offer you a complimentary dessert on your next visit.",
  },
  {
    id: "rev-4",
    author: "Priya Sharma",
    rating: 5,
    source: "google",
    date: "3 hours ago",
    comment: "Loved the ambiance and attentive waitstaff. Will definitely host our team dinner here next month!",
    sentiment: "positive",
    status: "published",
    standeeLocation: "Front Checkout Station #1",
    aiSuggestedReply: "Priya, thank you for choosing us! We would be honored to host your team dinner next month. Feel free to contact our events coordinator directly.",
  },
];

export const FLEET_METRICS = {
  totalDeployed: 1842,
  activeVenues: 620,
  monthlyTaps: 148900,
  verifiedReviews: 45382,
  averageRatingGain: "+1.1 Stars",
  onlineTelemetry: "99.8%",
  batchReady: "Batch #48-A (5,000 blank NTAG216 encoded)",
};
