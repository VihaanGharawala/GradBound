export const MAJORS = [
  { name: "Computer Science", category: "STEM" },
  { name: "Data Science", category: "STEM" },
  { name: "Electrical Engineering", category: "STEM" },
  { name: "Mechanical Engineering", category: "STEM" },
  { name: "Civil Engineering", category: "STEM" },
  { name: "Biotechnology", category: "STEM" },
  { name: "Business Analytics", category: "Business" },
  { name: "Finance", category: "Business" },
  { name: "MBA", category: "Business" },
  { name: "Marketing", category: "Business" },
  { name: "Economics", category: "Business" },
  { name: "Psychology", category: "Humanities" },
  { name: "International Relations", category: "Humanities" },
  { name: "Public Policy", category: "Humanities" },
  { name: "Architecture", category: "Humanities" },
];

export function getMajorCategory(majorName) {
  const found = MAJORS.find((m) => m.name === majorName);
  return found ? found.category : "STEM";
}

export const UNDERGRAD_MAJOR_GROUPS = [
  {
    group: "Computing, AI & Security",
    majors: [
      "Cybersecurity / Information Security",
      "Computer Science & Software Engineering",
      "Computer Engineering",
      "Artificial Intelligence & Machine Learning",
      "Data Science & Analytics",
      "Information Technology & Cloud Computing",
      "Computer Networks & Systems",
      "Business Information Systems",
      "Game Design & Development",
    ],
  },
  {
    group: "Engineering & Applied Sciences",
    majors: [
      "Mechanical Engineering",
      "Electrical & Electronics Engineering",
      "Civil & Environmental Engineering",
      "Industrial & Systems Engineering",
      "Chemical Engineering",
      "Biomedical Engineering",
      "Aerospace Engineering",
      "Mechatronics & Robotics",
      "Architectural Engineering",
      "Petroleum Engineering",
      "Nuclear Engineering",
      "Materials Science & Engineering",
      "Construction Management & Quantity Surveying",
    ],
  },
  {
    group: "Business, Finance & Commerce",
    majors: [
      "Finance & Banking",
      "Accounting & Audit",
      "Business Administration & Management",
      "Marketing & Digital Communications",
      "Supply Chain & Logistics Management",
      "Business Analytics",
      "Economics",
      "International Business",
      "Human Resource Management",
      "Tourism & Hospitality Management",
      "Event & Festival Management",
      "Advertising, PR & Brand Management",
      "Insurance & Risk Management",
      "Real Estate Management",
      "Entrepreneurship & Innovation",
    ],
  },
  {
    group: "Media, Arts & Design",
    majors: [
      "Graphic Design & Visual Communication",
      "Digital Media & Motion Graphics",
      "Architecture & Sustainable Design",
      "Interior Design",
      "Journalism & Mass Communication",
      "Fine Art & Studio Art",
      "Illustration",
      "Product & Industrial Design",
      "3D Animation & Game Art",
      "Fashion Design",
      "Fashion Marketing & Merchandising",
      "Film & Television Production",
      "Theater & Performing Arts",
      "Music & Sound Production",
    ],
  },
  {
    group: "Humanities, Social Sciences & Law",
    majors: [
      "Psychology",
      "International Relations & Global Affairs",
      "Law / Commercial Law",
      "Public Policy & Governance",
      "Sociology & Cultural Studies",
      "Political Science",
      "Anthropology",
      "History & Archaeology",
      "Philosophy & Ethics",
      "English Language & Literature",
      "Arabic Language & Literature",
      "Middle Eastern & Islamic Studies",
      "Social Work",
      "Education & Teaching",
      "Special Education",
    ],
  },
  {
    group: "Health & Natural Sciences",
    majors: [
      "Biotechnology & Bioinformatics",
      "Public Health",
      "Applied Mathematics / Statistics",
      "Applied Physics / Chemistry",
      "Biology / Life Sciences",
      "Environmental Science & Sustainability",
      "Medicine (MBBS)",
      "Dental Surgery",
      "Pharmacy",
      "Nursing",
      "Nutrition & Dietetics",
      "Veterinary Medicine",
      "Agriculture & Food Sciences",
    ],
  },
];

export const OTHER_MAJOR = "Other / Custom Major";

export const UNDERGRAD_UNIVERSITIES = [
  { name: "NYU Abu Dhabi (NYUAD)", tier: 1 },
  { name: "Khalifa University (KU)", tier: 1 },
  { name: "Rochester Institute of Technology Dubai (RIT Dubai)", tier: 2 },
  { name: "American University of Sharjah (AUS)", tier: 2 },
  { name: "Heriot-Watt University Dubai", tier: 2 },
  { name: "United Arab Emirates University (UAEU)", tier: 2 },
  { name: "University of Birmingham Dubai", tier: 2 },
  { name: "Sorbonne University Abu Dhabi", tier: 2 },
  { name: "Zayed University (ZU)", tier: 2 },
  { name: "American University in Dubai (AUD)", tier: 2 },
  { name: "University of Sharjah (UOS)", tier: 2 },
  { name: "Middlesex University Dubai", tier: 2 },
  { name: "University of Wollongong in Dubai (UOWD)", tier: 2 },
  { name: "Manipal Academy of Higher Education Dubai", tier: 2 },
  { name: "Gulf Medical University (GMU)", tier: 2 },
  { name: "Abu Dhabi University (ADU)", tier: 3 },
  { name: "Ajman University", tier: 3 },
  { name: "Canadian University Dubai (CUD)", tier: 3 },
  { name: "Higher Colleges of Technology (HCT)", tier: 3 },
  { name: "Amity University Dubai", tier: 3 },
  { name: "RAK Medical and Health Sciences University (RAKMHSU)", tier: 3 },
];

export const OTHER_UNIVERSITY = "Other / International University";

export function getUniversityTier(universityName) {
  const found = UNDERGRAD_UNIVERSITIES.find((u) => u.name === universityName);
  return found ? found.tier : 3;
}

// Top 20 destinations for Master's degrees
export const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "United Arab Emirates",
  "India",
  "Singapore",
  "Netherlands",
  "France",
  "Switzerland",
  "Sweden",
  "Ireland",
  "Japan",
  "South Korea",
  "Italy",
  "Spain",
  "New Zealand",
  "China",
  "Malaysia",
];

export const COUNTRY_CODES = {
  "United States": "US",
  "United Kingdom": "GB",
  Canada: "CA",
  Germany: "DE",
  Australia: "AU",
  "United Arab Emirates": "AE",
  India: "IN",
  Singapore: "SG",
  Netherlands: "NL",
  France: "FR",
  Switzerland: "CH",
  Sweden: "SE",
  Ireland: "IE",
  Japan: "JP",
  "South Korea": "KR",
  Italy: "IT",
  Spain: "ES",
  "New Zealand": "NZ",
  China: "CN",
  Malaysia: "MY",
};

export const COUNTRY_FLAGS = {
  "United States": "🇺🇸",
  "United Kingdom": "🇬🇧",
  Canada: "🇨🇦",
  Germany: "🇩🇪",
  Australia: "🇦🇺",
  "United Arab Emirates": "🇦🇪",
  India: "🇮🇳",
  Singapore: "🇸🇬",
  Netherlands: "🇳🇱",
  France: "🇫🇷",
  Switzerland: "🇨🇭",
  Sweden: "🇸🇪",
  Ireland: "🇮🇪",
  Japan: "🇯🇵",
  "South Korea": "🇰🇷",
  Italy: "🇮🇹",
  Spain: "🇪🇸",
  "New Zealand": "🇳🇿",
  China: "🇨🇳",
  Malaysia: "🇲🇾",
};

export const UNIVERSITY_TIERS = [
  "Top-Ranked (Tier 1)",
  "Mid-Ranked (Tier 2)",
  "Emerging / Regional (Tier 3)",
];

// Covers the full annual tuition spread represented in universityDataset.js
// (currently roughly $1,500 to $58,240/year).
export const BUDGET_RANGES = [
  "Under $5,000/yr",
  "$5,000 - $10,000/yr",
  "$10,000 - $15,000/yr",
  "$15,000 - $20,000/yr",
  "$20,000 - $30,000/yr",
  "$30,000 - $40,000/yr",
  "$40,000 - $50,000/yr",
  "$50,000+/yr",
];

export const TIER_COLORS = {
  Safety: {
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200 dark:border-emerald-500/30",
    bar: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  },
  Target: {
    text: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-50 dark:bg-yellow-500/10",
    border: "border-yellow-200 dark:border-yellow-500/30",
    bar: "bg-yellow-500",
    badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300",
  },
  Reach: {
    text: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-500/10",
    border: "border-rose-200 dark:border-rose-500/30",
    bar: "bg-rose-500",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  },
  Unlikely: {
    text: "text-slate-500 dark:text-slate-400",
    bg: "bg-slate-50 dark:bg-slate-500/10",
    border: "border-slate-200 dark:border-slate-500/30",
    bar: "bg-slate-400",
    badge: "bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300",
  },
};