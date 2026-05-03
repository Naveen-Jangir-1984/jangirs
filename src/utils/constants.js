// Date/Time constants
export const DATES = Array.from({ length: 31 }, (_, i) => i + 1);

export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const MONTHS_HINDI = ["जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितम्बर", "अक्टूबर", "नवम्बर", "दिसम्बर"];

export const getYears = (from = new Date().getFullYear(), to = 1200) => Array.from({ length: from - to + 1 }, (_, i) => from - i);

// Initial state constants for reducer
export const INITIAL_NEW_MEMBER = {
  type: "",
  name: "",
  mobile: "",
  email: "",
  date: "",
  month: "",
  year: "",
  dateDeath: "",
  monthDeath: "",
  yearDeath: "",
  isAlive: "alive",
  gender: "M",
  village: "",
  gotra: "",
};

export const INITIAL_NEW_USER = {
  username: "",
  password: "",
  role: "user",
  error: false,
};

export const INITIAL_EDIT_INPUT = {
  id: "",
  name: "",
  mobile: "",
  date: "",
  month: "",
  year: "",
  dateDeath: "",
  monthDeath: "",
  yearDeath: "",
  gender: "",
  village: "",
  gotra: "",
  email: "",
  isAlive: "",
};

export const INITIAL_FILTERS = {
  search: "",
  male: {
    village: "",
    gotra: "",
  },
  female: {
    village: "",
    gotra: "",
  },
};

export const INITIAL_INPUT = {
  username: "",
  password: "",
  error: false,
};
