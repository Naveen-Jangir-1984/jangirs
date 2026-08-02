import { useState, useRef, useEffect, useCallback } from "react";
import { flattenTree, fuzzySearch } from "../utils/searchUtils";
import { MaleProfileIcon, FemaleProfileIcon } from "../utils/imageConstants";
import useTranslation from "../hooks/useTranslation";
import "./GlobalSearchBar.css";

// Feature-detect the Web Speech API (Chrome, Edge, Safari support it)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const isSpeechSupported = !!SpeechRecognition;

/**
 * GlobalSearchBar - Fuzzy search across all members with auto-suggest dropdown
 * Dispatches openMemberDisplay to navigate to the selected member
 */
const GlobalSearchBar = ({ members, village, dispatch, getHindiText, isEnglish, images }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [allFlatMembers, setAllFlatMembers] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceTimer = useRef(null);
  const recognitionRef = useRef(null);
  const voiceErrorTimer = useRef(null);
  const { t } = useTranslation(isEnglish);

  // Flatten members for the selected village once when data changes
  useEffect(() => {
    const flat = flattenTree(members || [], village);
    setAllFlatMembers(flat);
  }, [members, village]);

  // Debounced search
  const performSearch = useCallback(
    (searchQuery) => {
      if (!searchQuery || searchQuery.trim().length < 1) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      const searchResults = fuzzySearch(searchQuery, allFlatMembers, 15, getHindiText);
      setResults(searchResults);
      setSelectedIndex(-1);
      setShowDropdown(searchResults.length > 0);
    },
    [allFlatMembers, getHindiText],
  );

  // Voice search using the Web Speech API (Hindi locale hi-IN)
  const toggleVoiceSearch = useCallback(() => {
    if (!isSpeechSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "hi-IN"; // Hindi (falls back to en-IN on browsers without Hindi models)
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setQuery("");
      setResults([]);
      setShowDropdown(false);
    };

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";

      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      // Combine final + interim transcript as the live query
      const spoken = (final || interim).trim();
      setQuery(spoken);

      // Trigger the debounced search immediately for live feedback
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => performSearch(spoken), 100);
    };

    recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      setIsListening(false);

      // Show a clear, user-friendly message for the most common failures
      let messageKey = "";
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        messageKey = "voiceMicDenied";
      } else if (event.error === "no-speech") {
        messageKey = "voiceNoSpeech";
      } else if (event.error === "audio-capture") {
        messageKey = "voiceNoMic";
      } else if (event.error === "network") {
        messageKey = "voiceNetwork";
      } else {
        messageKey = "voiceSearchFailed";
      }

      const message = t(messageKey) || messageKey;
      setVoiceError(message);

      if (voiceErrorTimer.current) clearTimeout(voiceErrorTimer.current);
      voiceErrorTimer.current = setTimeout(() => setVoiceError(""), 6000);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn("Could not start speech recognition:", e);
      setIsListening(false);
      const message = t("voiceSearchFailed") || "Voice search failed";
      setVoiceError(message);
      if (voiceErrorTimer.current) clearTimeout(voiceErrorTimer.current);
      voiceErrorTimer.current = setTimeout(() => setVoiceError(""), 6000);
    }
  }, [isListening, performSearch, t]);

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort?.();
      if (voiceErrorTimer.current) clearTimeout(voiceErrorTimer.current);
    };
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Clear previous debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce search by 300ms
    debounceTimer.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  const handleInputFocus = () => {
    if (results.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleMemberClick = (resultItem) => {
    setQuery("");
    setResults([]);
    setShowDropdown(false);
    dispatch({ type: "openMemberDisplay", member: resultItem.member });
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!showDropdown || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleMemberClick(results[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowDropdown(false);
        inputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const items = dropdownRef.current.querySelectorAll(".global-search-result-item");
      if (items[selectedIndex]) {
        items[selectedIndex].scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target) && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Highlight matching text in a string
  const highlightMatch = (text, queryStr) => {
    if (!text || !queryStr) return text;

    const lowerText = text.toLowerCase();
    const lowerQuery = queryStr.toLowerCase().trim();

    // Try to find the match position
    let matchIndex = lowerText.indexOf(lowerQuery);
    if (matchIndex === -1) {
      // Try fuzzy finding first/last char position
      matchIndex = lowerText.indexOf(lowerQuery[0]);
    }
    if (matchIndex === -1) return text;

    const before = text.slice(0, matchIndex);
    const match = text.slice(matchIndex, matchIndex + queryStr.length);
    const after = text.slice(matchIndex + queryStr.length);

    return (
      <>
        {before}
        <strong className="global-search-highlight">{match}</strong>
        {after}
      </>
    );
  };

  // Get a preview of which field matched
  const getFieldPreview = (matchedFields) => {
    if (!matchedFields || matchedFields.length === 0) return null;

    const field = matchedFields[0];
    let label = "";
    switch (field.field) {
      case "mobile":
        label = "📱";
        break;
      case "email":
        label = "✉️";
        break;
      case "village":
        label = "🏘️";
        break;
      case "gotra":
        label = "🪷";
        break;
      default:
        label = "";
    }

    if (field.field === "name") return null; // Don't show label for name matches
    return (
      <span className="global-search-field-badge">
        {label} {field.value}
      </span>
    );
  };

  const getVillageBadge = (sourceVillage) => {
    const names = {
      dulania: "Dulania",
      moruwa: "Moruwa",
      tatija: "Tatija",
    };
    return <span className={`global-search-village-badge ${sourceVillage}`}>{isEnglish ? names[sourceVillage] : getHindiText?.(names[sourceVillage], "village")}</span>;
  };

  return (
    <div className="global-search-container">
      <div className="global-search-input-wrapper">
        <span className="global-search-icon">🔍</span>
        <input ref={inputRef} type="text" className="global-search-input" placeholder={t("searchPlaceholder") || "Search members..."} value={query} onChange={handleInputChange} onFocus={handleInputFocus} onKeyDown={handleKeyDown} aria-label="Search members" autoComplete="off" />
        <button className={`global-search-mic ${isListening ? "listening" : ""} ${!isSpeechSupported ? "disabled" : ""}`} onClick={toggleVoiceSearch} disabled={!isSpeechSupported} title={isListening ? t("listening") || "Listening..." : !isSpeechSupported ? t("voiceSearchUnsupported") || "Voice search not supported in this browser" : t("voiceSearch") || "Search by voice"} aria-label={isListening ? t("listening") || "Stop listening" : t("voiceSearch") || "Voice search"}>
          {isListening ? "🔴" : "🎤"}
        </button>
        {query && (
          <button
            className="global-search-clear"
            onClick={() => {
              setQuery("");
              setResults([]);
              setShowDropdown(false);
              inputRef.current?.focus();
            }}
          >
            ✕
          </button>
        )}
      </div>

      {voiceError && <div className="global-search-voice-error">⚠️ {voiceError}</div>}

      {showDropdown ? (
        <div className="global-search-dropdown" ref={dropdownRef}>
          {results.map((item, index) => {
            const member = item.member;
            const displayName = isEnglish ? member.name : getHindiText?.(member.name, "name") || member.name;
            const memberImg = images.find((img) => img.id === member.id);
            const defaultIcon = member.gender === "M" ? MaleProfileIcon : FemaleProfileIcon;
            const borderColor = member.isAlive ? "green" : "#f55";

            return (
              <div key={member.id} className={`global-search-result-item ${index === selectedIndex ? "selected" : ""}`} onClick={() => handleMemberClick(item)} onMouseEnter={() => setSelectedIndex(index)}>
                <div className="global-search-result-main">
                  <span className="global-search-result-name" style={{ color: member.isAlive ? "inherit" : "#f55" }}>
                    <img src={memberImg?.src || defaultIcon} alt="" style={{ width: "22px", height: "22px", borderRadius: "50%", objectFit: "cover", border: `2px solid ${borderColor}`, flexShrink: 0 }} loading="lazy" />
                    <span>{highlightMatch(displayName, query)}</span>
                    {/* <span>{getVillageBadge(item.sourceVillage)}</span> */}
                    <span>{getFieldPreview(item.matchedFields)}</span>
                    <span>{member.mobile?.length > 0 && !item.matchedFields?.some((f) => f.field === "mobile") && <span className="global-search-field-badge">📱 {member.mobile[0]}</span>}</span>
                  </span>
                  <span className="global-search-result-status">
                    <span>{member.isAlive ? "" : "💀"}</span>
                    <span>{member.gender === "M" ? "♂️" : "♀️"}</span>
                  </span>
                </div>
              </div>
            );
          })}
          {results.length === 0 && query.trim().length >= 1 && <div className="global-search-no-results">{t("noResults") || "No members found"}</div>}
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default GlobalSearchBar;
