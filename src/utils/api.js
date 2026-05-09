import CryptoJS from "crypto-js";
import { transliterateToHindi } from "./transliterate";

const URL = process.env.REACT_APP_API_URL;
const PORT = process.env.REACT_APP_PORT;
const SECRET_KEY = process.env.REACT_APP_SECRET_KEY;

// Transliteration cache to avoid repeated operations for same text
const translationCache = new Map();

/**
 * Decrypt data using AES
 */
const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
};

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
   * Add a new member (uses HTTP API)
   */
  addMember: async (member, newMember, type, village) => {
    return api.post("/addNewMember", { member, newMember, type, village });
  },

  /**
   * Edit an existing member (uses HTTP API)
   */
  editMember: async (member, village) => {
    return api.post("/editMember", { member, village });
  },

  /**
   * Delete a member (uses HTTP API)
   */
  deleteMember: async (id, village) => {
    return api.post("/deleteMember", { id, village });
  },

  /**
   * Add a new user (uses HTTP API)
   */
  addUser: async (username, password, role) => {
    return api.post("/addNewUser", { username, password, role });
  },

  /**
   * Delete a user (uses HTTP API)
   */
  deleteUser: async (username) => {
    return api.post("/deleteUser", { username });
  },

  /**
   * Get all data (uses HTTP API)
   */
  getData: async () => {
    const encryptedData = await api.get("/getData");
    return decryptData(encryptedData);
  },

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

  /**
   * Upload a photo for a member with automatic face detection and cropping
   * @param {number} memberId - The member's ID
   * @param {File} file - The image file to upload
   * @returns {Promise<object>} - Upload result
   */
  uploadPhoto: async (memberId, file) => {
    const formData = new FormData();
    formData.append("memberId", memberId);
    formData.append("photo", file);

    const response = await fetch(`${URL}:${PORT}/uploadPhoto`, {
      method: "POST",
      body: formData,
    });
    return response.json();
  },

  /**
   * Delete a member's photo
   * @param {number} memberId - The member's ID
   * @returns {Promise<object>} - Delete result
   */
  deletePhoto: async (memberId) => {
    const response = await fetch(`${URL}:${PORT}/deletePhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId }),
    });
    return response.json();
  },

  /**
   * Upload a pre-cropped photo for a member (no face detection)
   * @param {number} memberId - The member's ID
   * @param {File} file - The already-cropped image file
   * @returns {Promise<object>} - Upload result
   */
  uploadCroppedPhoto: async (memberId, file) => {
    const formData = new FormData();
    formData.append("memberId", memberId);
    formData.append("photo", file);

    const response = await fetch(`${URL}:${PORT}/uploadCroppedPhoto`, {
      method: "POST",
      body: formData,
    });
    return response.json();
  },
};

export default api;
