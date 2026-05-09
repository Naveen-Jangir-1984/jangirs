import { useCallback } from "react";
import { translateToHindi } from "../utils/translate";

/**
 * Key mapping from app-specific keys to translate.js dictionary keys
 * This allows backward compatibility with existing code while using centralized translations
 */
const KEY_MAP = {
  // Date picker
  DD: "dd",
  MM: "mm",
  YYYY: "yyyy",

  // Gender
  Male: "male",
  Female: "female",

  // Status
  Alive: "alive",
  Dead: "dead",

  // Form fields
  Name: "name",
  Mobile: "mobile",
  Email: "email",
  Village: "village",
  Gotra: "gotra",
  Password: "password",
  Username: "username",

  // Actions
  ADD: "add",
  ADD_MEMBER: "add member",
  ADD_USER: "add user",
  UPDATE: "update",
  DELETE: "delete",
  CANCEL: "cancel",
  Open: "open",
  Close: "close",
  Cancel: "cancel",
  Confirm: "confirm",
  OK: "ok",
  yes: "yes",
  no: "no",

  // Member types
  "Member?": "member?",
  Child: "child",
  Wife: "wife",

  // Labels
  Men: "men",
  Women: "women",
  Birth: "birth",
  "Birth:": "birth",
  Death: "death",
  "Death:": "death",
  Age: "age",
  "Age:": "age",
  Hindi: "hindi",
  English: "english",
  User: "user",
  Admin: "admin",

  // Messages
  years: "years",
  months: "months",
  days: "days",
  village: "village",
  gotra: "gotra",
  Married: "married",
  Unmarried: "unmarried",
  in: "in",
  settled: "settled",

  // Confirmations
  confirmSignout: "confirm signout",
  confirmAddMember: "confirm add member",
  confirmEditMember: "confirm edit member",
  confirmDeleteMember: "confirm delete member",
  confirmDeletePhoto: "confirm delete photo",
  confirmAddUser: "confirm add user",
  confirmDeleteUser: "confirm delete user",
  userExists: "user exists",
  cancelAddUser: "cancel add user",
  addANewUser: "add a new user",
  settledIn: "settled in",
  confidentiality: "confidentiality",
  adjustPhoto: "adjust photo",
  dragToPosition: "drag to position",
  processing: "processing...",
};

/**
 * English text for keys that need special English translations (not just the key itself)
 */
const ENGLISH_TEXT = {
  confirmSignout: "Are you sure you want to sign out?",
  confirmAddMember: "Are you sure you want to add the member?",
  confirmEditMember: "Are you sure you want to update the member?",
  confirmDeleteMember: "Are you sure you want to delete the member?",
  confirmDeletePhoto: "Are you sure you want to delete this photo?",
  confirmAddUser: "Are you sure you want to add this person as a new {{role}}?",
  confirmDeleteUser: "Are you sure you want to delete this person?",
  userExists: "User already exists!",
  addANewUser: "Add a new User",
  cancelAddUser: "Cancel to Add User",
  settledIn: "Settled in",
  ADD_MEMBER: "ADD MEMBER",
  ADD_USER: "ADD USER",
  CANCEL: "CANCEL",
  Birth: "Birth",
  "Birth:": "Birth",
  Death: "Death",
  "Death:": "Death",
  Age: "Age",
  "Age:": "Age",
  confidentiality: "This information is confidential to Dulania Jangir Samaaj and protected by Naveen Jangir (s/o Bahadur Singh Jangir).",
  yes: "Yes",
  no: "No",
  adjustPhoto: "Adjust Photo",
  dragToPosition: "Drag to position, use buttons or scroll to zoom",
  processing: "Processing...",
  Confirm: "Confirm",
};

/**
 * Custom hook for translations using centralized translate.js dictionary
 * @param {boolean} isEnglish - Whether to use English (true) or Hindi (false)
 * @returns {object} - Translation function
 */
export const useTranslation = (isEnglish) => {
  /**
   * Translation function
   * @param {string} key - Translation key
   * @returns {string} - Translated text
   */
  const t = useCallback(
    (key, params = {}) => {
      let text;
      if (isEnglish) {
        // Return special English text if available, otherwise return the key
        text = ENGLISH_TEXT[key] || key;
      } else {
        // Map the key to translate.js format
        const mappedKey = KEY_MAP[key] || key.toLowerCase();

        // Get Hindi translation from centralized dictionary
        const translation = translateToHindi(mappedKey);

        // If translation is same as input (not found), return original key
        text = translation !== mappedKey ? translation : key;
      }

      // Replace {{variable}} placeholders with values from params
      return text.replace(/\{\{(\w+)\}\}/g, (_, name) => params[name] ?? `{{${name}}}`);
    },
    [isEnglish],
  );

  return { t, isLoading: false };
};

export default useTranslation;
