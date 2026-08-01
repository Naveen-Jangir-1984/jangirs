/**
 * Static English to Hindi Translation Dictionary
 * For translating English words/phrases to Hindi equivalents (meaning-based)
 * Different from transliteration which converts spelling phonetically
 */

// Common UI labels and actions
const UI_LABELS = {
  // Navigation & Actions
  home: "घर",
  back: "वापस",
  next: "अगला",
  previous: "पिछला",
  save: "सहेजें",
  cancel: "रद्द करें",
  delete: "हटाएं",
  edit: "संपादित करें",
  add: "जोड़ें",
  remove: "निकालें",
  search: "खोजें",
  filter: "फ़िल्टर",
  clear: "साफ़ करें",
  submit: "सबमिट करें",
  confirm: "पुष्टि करें",
  ok: "ठीक है",
  yes: "हाँ",
  no: "नहीं",
  close: "बंद करें",
  open: "खोलें",
  view: "देखें",
  download: "डाउनलोड",
  upload: "अपलोड",
  share: "साझा करें",
  print: "प्रिंट करें",
  role: "भूमिका",
  refresh: "रिफ्रेश",
  loading: "लोड हो रहा है",
  "please wait": "कृपया प्रतीक्षा करें",
  update: "अपडेट करें",
  "add member": "सदस्य जोड़ें",
  "add user": "उपयोगकर्ता जोड़ें",
  "drag to position": "स्थिति में खींचें, ज़ूम के लिए बटन या स्क्रॉल का उपयोग करें",
  "processing...": "प्रोसेसिंग...",

  // Status & Messages
  success: "सफल",
  error: "त्रुटि",
  warning: "चेतावनी",
  info: "जानकारी",
  failed: "विफल",
  pending: "लंबित",
  completed: "पूर्ण",
  active: "सक्रिय",
  inactive: "निष्क्रिय",
  online: "ऑनलाइन",
  offline: "ऑफलाइन",

  // Common words
  name: "नाम",
  email: "ईमेल",
  phone: "फ़ोन",
  mobile: "मोबाइल",
  address: "पता",
  city: "शहर",
  state: "राज्य",
  country: "देश",
  date: "तारीख",
  time: "समय",
  password: "पासवर्ड",
  username: "उपयोगकर्ता",
  login: "लॉगिन",
  logout: "लॉगआउट",
  "sign in": "साइन इन",
  "sign out": "साइन आउट",
  "sign up": "साइन अप",
  register: "पंजीकरण",
  profile: "प्रोफ़ाइल",
  settings: "सेटिंग्स",
  help: "मदद",
  about: "के बारे में",
  contact: "संपर्क",
  user: "उपयोगकर्ता",
  admin: "व्यवस्थापक",
  hindi: "हिंदी",
  english: "अंग्रेज़ी",

  // Date picker placeholders
  dd: "दिन",
  mm: "माह",
  yyyy: "वर्ष",
};

// Family-related terms
const FAMILY_TERMS = {
  family: "परिवार",
  "family tree": "वंशवृक्ष",
  member: "सदस्य",
  members: "सदस्य",
  "member?": "सदस्य?",
  father: "पिता",
  mother: "माता",
  son: "पुत्र",
  daughter: "पुत्री",
  brother: "भाई",
  sister: "बहन",
  husband: "पति",
  wife: "पत्नी",
  child: "बच्चा",
  children: "बच्चे",
  grandfather: "दादा",
  grandmother: "दादी",
  grandson: "पोता",
  granddaughter: "पोती",
  uncle: "चाचा",
  aunt: "चाची",
  cousin: "चचेरा भाई/बहन",
  nephew: "भतीजा",
  niece: "भतीजी",
  "father-in-law": "ससुर",
  "mother-in-law": "सास",
  "son-in-law": "दामाद",
  "daughter-in-law": "बहू",
  "brother-in-law": "साला/जीजा",
  "sister-in-law": "साली/भाभी",
  parents: "माता-पिता",
  spouse: "जीवनसाथी",
  ancestor: "पूर्वज",
  descendant: "वंशज",
  generation: "पीढ़ी",
  lineage: "वंश",
  clan: "कुल",
  gotra: "गोत्र",
  village: "गाँव",
  birthplace: "जन्मस्थान",

  // Life events
  birth: "जन्म",
  "birth:": "जन्म:",
  death: "मृत्यु",
  "death:": "मृत्यु:",
  marriage: "विवाह",
  wedding: "शादी",
  "date of birth": "जन्म तिथि",
  "date of death": "मृत्यु तिथि",
  alive: "जीवित",
  dead: "मृत",
  deceased: "स्वर्गवासी",
  married: "विवाहित",
  unmarried: "अविवाहित",

  // Gender
  male: "पुरुष",
  female: "महिला",
  gender: "लिंग",
  men: "पुरुष",
  women: "महिलाएं",

  // Age
  age: "आयु",
  "age:": "आयु:",
  "age ": "उम्र: ",
  years: "वर्ष",
  year: "साल",
  months: "महीने",
  month: "महीना",
  days: "दिन",
  day: "दिन",

  // Location
  in: "में",
  settled: "बसे हुए",
  "settled in": "में बसे हुए",
  settledIn: "Settled in", // English label for display
};

// Time-related terms
const TIME_TERMS = {
  today: "आज",
  yesterday: "कल",
  tomorrow: "कल",
  day: "दिन",
  week: "सप्ताह",
  calendar: "पंचांग",
  month: "महीना",
  year: "वर्ष",
  morning: "सुबह",
  afternoon: "दोपहर",
  evening: "शाम",
  night: "रात",

  // Days
  sunday: "रविवार",
  monday: "सोमवार",
  tuesday: "मंगलवार",
  wednesday: "बुधवार",
  thursday: "गुरुवार",
  friday: "शुक्रवार",
  saturday: "शनिवार",

  // Months
  january: "जनवरी",
  february: "फ़रवरी",
  march: "मार्च",
  april: "अप्रैल",
  may: "मई",
  june: "जून",
  july: "जुलाई",
  august: "अगस्त",
  september: "सितंबर",
  october: "अक्टूबर",
  november: "नवंबर",
  december: "दिसंबर",
};

// Numbers (as words)
const NUMBER_WORDS = {
  zero: "शून्य",
  one: "एक",
  two: "दो",
  three: "तीन",
  four: "चार",
  five: "पाँच",
  six: "छह",
  seven: "सात",
  eight: "आठ",
  nine: "नौ",
  ten: "दस",
  hundred: "सौ",
  thousand: "हज़ार",
  lakh: "लाख",
  crore: "करोड़",
  first: "पहला",
  second: "दूसरा",
  third: "तीसरा",
  fourth: "चौथा",
  fifth: "पाँचवाँ",
};

// Common phrases
const PHRASES = {
  welcome: "स्वागत है",
  "thank you": "धन्यवाद",
  please: "कृपया",
  sorry: "क्षमा करें",
  hello: "नमस्ते",
  goodbye: "अलविदा",
  "good morning": "सुप्रभात",
  "good night": "शुभ रात्रि",
  "how are you": "आप कैसे हैं",
  "i am fine": "मैं ठीक हूँ",
  "no data": "कोई डेटा नहीं",
  "no results": "कोई परिणाम नहीं",
  "not found": "नहीं मिला",
  "are you sure": "क्या आप सुनिश्चित हैं",
  "select all": "सभी चुनें",
  "select none": "कोई नहीं चुनें",
  "show more": "और दिखाएं",
  "show less": "कम दिखाएं",
  "read more": "और पढ़ें",
  "learn more": "और जानें",

  // App-specific confirmation messages
  "confirm signout": "क्या आप वाकई साइन आउट करना चाहते हैं?",
  "confirm add member": "क्या आप वाकई इस सदस्य को जोड़ना चाहते हैं?",
  "confirm edit member": "क्या आप वाकई इस सदस्य को अपडेट करना चाहते हैं?",
  "confirm delete member": "क्या आप वाकई इस सदस्य को हटाना चाहते हैं?",
  "confirm add user": "क्या आप वाकई इस व्यक्ति को नए {{role}} के रूप में जोड़ना चाहते हैं?",
  "confirm delete user": "क्या आप वाकई इस व्यक्ति को हटाना चाहते हैं?",
  "user exists": "उपयोगकर्ता पहले से मौजूद है!",
  "add a new user": "एक नया उपयोगकर्ता जोड़ें",
  "cancel add user": "उपयोगकर्ता जोड़ना रद्द करें",
  "confirm delete photo": "क्या आप वाकई इस फोटो को हटाना चाहते हैं?",

  // Calendar events
  birthday: "जन्मदिन",
  "happy birthday": "जन्मदिन की शुभकामनाएं",
  "death anniversary": "पुण्यतिथि",
  anniversary: "पुण्यतिथि",
  "upcoming events": "आगामी कार्यक्रम",
  "no events this month": "इस महीने कोई कार्यक्रम नहीं",
  "days left": "दिन शेष",
  "upcoming birthdays": "आगामी जन्मदिन",
  "upcoming anniversaries": "आगामी पुण्यतिथि",
  "age at death": "मृत्यु के समय आयु",
  "past events": "पिछले कार्यक्रम",

  // Footer message
  confidentiality: "यह जानकारी डुलानिया जांगिड़ समाज के लिए गोपनीय है और नवीन जांगिड़ (पुत्र श्री बहादुर सिंह जांगिड़) द्वारा संरक्षित है।",

  // Export PDF
  pdf: "पीडीएफ",
  exporting: "निर्यात हो रहा है...",
  "pdf exported successfully": "पीडीएफ सफलतापूर्वक निर्यात हुआ",
  "pdf export failed": "पीडीएफ निर्यात विफल रहा",
  "export member directory": "सदस्य निर्देशिका निर्यात करें",
  "confirm export tree": "क्या आप वाकई वंशवृक्ष को पीडीएफ के रूप में निर्यात करना चाहते हैं?",
  "confirm export calendar": "क्या आप वाकई पंचांग को पीडीएफ के रूप में निर्यात करना चाहते हैं?",
  "confirm export subtree pdf": "क्या आप वाकई इस सदस्य की उप-शाखा को पीडीएफ के रूप में निर्यात करना चाहते हैं?",
  "confirm export connection map": "क्या आप वाकई संपर्क मानचित्र को पीडीएफ के रूप में निर्यात करना चाहते हैं?",
  "confirm export geographic map": "क्या आप वाकई भौगोलिक मानचित्र को पीडीएफ के रूप में निर्यात करना चाहते हैं?",
  "connection map": "संपर्क मानचित्र",
  "geographic map": "भौगोलिक मानचित्र",
  "connection map title": "संपर्क मानचित्र",
  "gotra connections": "गोत्र",
  "village connections": "गाँव",
  "total gotras": "कुल गोत्र",
  "total connections": "कुल संबंध",
  "node size": "गोत्र आवृत्ति",
  "zoom to fit": "फिट करने के लिए ज़ूम करें",
  statistics: "सांख्यिकी",
  legend: "किंवदंती",
  "in laws": "ससुराल",
  "in law network": "ससुराल नेटवर्क",
  "in law connections": "ससुराल संबंध",
  "family connections": "संबंध",
  "married to": "से शादी की",
  "in law title": "ससुराल नेटवर्क",
  "in law family": "ससुराल परिवार",
  "jangir family": "जांगिड़ परिवार",
  "connection count": "संपर्क संख्या",
  connection: "संपर्क",
  "marriage type": "विवाह प्रकार",
  "wife marriage": "पत्नी का विवाह",
  "daughter marriage": "बेटी का विवाह",
  "search members": "सदस्यों की खोज करें",
  "no results found": "कोई परिणाम नहीं मिला",
  "search placeholder": "सदस्यों की खोज करें...",
  "all locations": "सभी स्थान",
  ancestral: "पारंपरिक",
  "wives villages": "पत्नियों के गाँव",
  migration: "Migration",
  "ancestral village": "पारंपरिक गाँव",
  "daughters villages": "बेटियों के गाँव",
  print: "प्रिंट करें",
};

// Combine all dictionaries
const DICTIONARY = {
  ...UI_LABELS,
  ...FAMILY_TERMS,
  ...TIME_TERMS,
  ...NUMBER_WORDS,
  ...PHRASES,
};

/**
 * Translate English text to Hindi using static dictionary
 * @param {string} text - English text to translate
 * @param {string} fallback - Optional fallback if translation not found (defaults to original text)
 * @returns {string} - Hindi translation or fallback
 */
function translateToHindi(text, fallback = null) {
  if (!text) return text;

  const key = text.toLowerCase().trim();
  return DICTIONARY[key] || fallback || text;
}

/**
 * Translate multiple words/phrases
 * @param {string[]} texts - Array of English texts
 * @returns {string[]} - Array of Hindi translations
 */
function translateMany(texts) {
  return texts.map((text) => translateToHindi(text));
}

/**
 * Check if a translation exists for the given text
 * @param {string} text - English text to check
 * @returns {boolean} - True if translation exists
 */
function hasTranslation(text) {
  if (!text) return false;
  return DICTIONARY.hasOwnProperty(text.toLowerCase().trim());
}

/**
 * Get all available translations
 * @returns {Object} - The complete dictionary
 */
function getDictionary() {
  return { ...DICTIONARY };
}

/**
 * Add custom translations at runtime
 * @param {Object} translations - Object with english: hindi pairs
 */
function addTranslations(translations) {
  Object.entries(translations).forEach(([eng, hin]) => {
    DICTIONARY[eng.toLowerCase().trim()] = hin;
  });
}

// Export for both ES modules and CommonJS
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    translateToHindi,
    translateMany,
    hasTranslation,
    getDictionary,
    addTranslations,
    // Export individual dictionaries for selective use
    UI_LABELS,
    FAMILY_TERMS,
    TIME_TERMS,
    NUMBER_WORDS,
    PHRASES,
  };
}

export { translateToHindi, translateMany, hasTranslation, getDictionary, addTranslations, UI_LABELS, FAMILY_TERMS, TIME_TERMS, NUMBER_WORDS, PHRASES };
