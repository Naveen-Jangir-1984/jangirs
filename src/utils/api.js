import { transliterateToHindi } from "./transliterate";

const URL = process.env.REACT_APP_API_URL;
const PORT = process.env.REACT_APP_PORT;

// Transliteration cache to avoid repeated operations for same text
const translationCache = new Map();

/**
 * Cached transliteration wrapper
 */
const transliterate = (text) => {
  if (!text) return text;
  const cacheKey = text.toLowerCase();
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }
  const result = transliterateToHindi(text);
  translationCache.set(cacheKey, result);
  return result;
};

/**
 * Centralized API service for making HTTP requests
 */
export const api = {
  /**
   * Make a POST request
   * @param {string} endpoint - API endpoint (e.g., '/addNewMember')
   * @param {object} body - Request body
   * @returns {Promise<object>} - JSON response
   */
  post: async (endpoint, body) => {
    const response = await fetch(`${URL}:${PORT}${endpoint}`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return response.json();
  },

  /**
   * Make a GET request
   * @param {string} endpoint - API endpoint
   * @returns {Promise<object>} - Response text or JSON
   */
  get: async (endpoint) => {
    const response = await fetch(`${URL}:${PORT}${endpoint}`);
    return response.text();
  },

  /**
   * Add a new member
   */
  addMember: (member, newMember, type, village) => api.post("/addNewMember", { member, newMember, type, village }),

  /**
   * Edit an existing member
   */
  editMember: (member, village) => api.post("/editMember", { member, village }),

  /**
   * Delete a member
   */
  deleteMember: (id, village) => api.post("/deleteMember", { id, village }),

  /**
   * Add a new user
   */
  addUser: (username, password, role) => api.post("/addNewUser", { username, password, role }),

  /**
   * Delete a user
   */
  deleteUser: (username) => api.post("/deleteUser", { username }),

  /**
   * Get all data
   */
  getData: () => api.get("/getData"),

  /**
   * Transliterate text to Devanagari
   * @param {string} text - Text to transliterate
   * @returns {Promise<string>} - Transliterated text
   */
  translate: async (text) => {
    return transliterate(text);
  },

  /**
   * Transliterate multiple texts at once
   * @param {string[]} texts - Array of texts to transliterate
   * @returns {Promise<string[]>} - Array of transliterated texts
   */
  translateBatch: async (texts) => {
    return texts.map((text) => transliterate(text));
  },

  /**
   * Clear translation cache
   */
  clearTranslationCache: () => {
    translationCache.clear();
  },
};

export default api;
