// Domain Constants: Filter Options
export const PLATFORMS = [
  "Any",
  "Instagram",
  "TikTok",
  "User Generated Content",
  "YouTube",
  "Twitter",
  "Twitch",
  "Amazon"
] as const;

export const NICHES = [
  "Popular",
  "Lifestyle",
  "Beauty",
  "Fashion",
  "Travel",
  "Health & Fitness",
  "Food & Drink",
  "Family & Children",
  "Comedy & Entertainment",
  "Art & Photography",
  "Music & Dance",
  "Model",
  "Animals & Pets",
  "Adventure & Outdoors",
  "Education",
  "Entrepreneur & Business",
  "Athlete & Sports",
  "Gaming",
  "Technology",
  "LGBTQ2+",
  "Healthcare",
  "Actor",
  "Automotive",
  "Vegan",
  "Celebrity & Public Figure",
  "Skilled Trades",
  "Cannabis"
] as const;

export const CONTENT_TYPES = [
  "Photos",
  "Videos",
  "Reels",
  "Stories",
  "Live",
  "Mixed"
] as const;

export const GENDERS = ["Any", "Male", "Female", "Non-binary"] as const;

export const AGE_RANGES = [
  "Any",
  "13-17",
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55+"
] as const;

export const LANGUAGES = [
  "Any",
  "English",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Italian",
  "Chinese",
  "Japanese",
  "Korean",
  "Arabic",
  "Hindi",
  "Russian"
] as const;

export const ETHNICITIES = [
  "Any",
  "Asian",
  "Black",
  "Caucasian",
  "Hispanic",
  "Middle Eastern",
  "Mixed",
  "Other"
] as const;

export type Platform = typeof PLATFORMS[number];
export type Niche = typeof NICHES[number];
export type ContentType = typeof CONTENT_TYPES[number];
export type Gender = typeof GENDERS[number];
export type AgeRange = typeof AGE_RANGES[number];
export type Language = typeof LANGUAGES[number];
export type Ethnicity = typeof ETHNICITIES[number];
