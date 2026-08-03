import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { MaleProfileIcon, FemaleProfileIcon } from "../../utils/imageConstants";
import { MONTHS } from "../../utils/constants";
import useTranslation from "../../hooks/useTranslation";
import "./GenerationMosaic.css";

/**
 * GenerationMosaic - A photomosaic grid that groups all members by generation.
 * Each generation is rendered as a horizontal section with member photo tiles.
 * Tapping a tile opens the member's detail profile.
 *
 * Props:
 * @param {Object} state - Global app state (from reducer)
 * @param {Function} dispatch - Reducer dispatch
 * @param {Array} members - Flattened member list for the current village
 * @param {Function} getHindiText - English→Hindi translation helper
 * @param {Function} getHindiNumbers - English→Hindi number conversion
 * @param {boolean} isModalOpen - Whether any modal is currently open
 */
const GenerationMosaic = ({ state, dispatch, dulania, moruwa, tatija, getHindiText, getHindiNumbers, isModalOpen }) => {
  const isEnglish = state.user?.language;
  const { t } = useTranslation(isEnglish);
  const containerRef = useRef(null);
  const [activeGen, setActiveGen] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const sectionRefs = useRef({});

  /**
   * Compute age from DOB, optionally up to a death date.
   * @param {string} dobString - "D M YYYY"
   * @param {string} [dodString] - "D M YYYY" (optional)
   * @returns {{ years: number, months: number, days: number }}
   */
  const getAge = useCallback((dobString, dodString) => {
    if (!dobString) return null;
    const parts = dobString.split(" ");
    if (parts.length !== 3) return null;
    const monthIndex = MONTHS.indexOf(parts[1]);
    if (monthIndex === -1) return null;
    const birthDate = new Date(parseInt(parts[2]), monthIndex, parseInt(parts[0]));
    const endDate = dodString
      ? (() => {
          const dParts = dodString.split(" ");
          const dMonthIndex = MONTHS.indexOf(dParts[1]);
          return new Date(parseInt(dParts[2]), dMonthIndex, parseInt(dParts[0]));
        })()
      : new Date();
    let years = endDate.getFullYear() - birthDate.getFullYear();
    let months = endDate.getMonth() - birthDate.getMonth();
    let days = endDate.getDate() - birthDate.getDate();
    if (days < 0) {
      months--;
      const prevMonth = new Date(endDate.getFullYear(), endDate.getMonth() - 1, birthDate.getDate());
      days = Math.floor((endDate - prevMonth) / (1000 * 60 * 60 * 24));
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    return { years: Math.max(0, years), months: Math.max(0, months), days: Math.max(0, days) };
  }, []);

  /**
   * Format age as a short string, e.g. "72y" or "6m" or "3d".
   * For very young children (under 2), show months.
   */
  const formatAgeShort = useCallback(
    (age, isEnglish) => {
      if (!age) return "";
      if (age.years >= 2) {
        const val = isEnglish ? age.years : getHindiNumbers?.(age.years.toString()) || age.years;
        return `${val}${isEnglish ? "y" : "y"}`;
      }
      if (age.years >= 1) {
        const val = isEnglish ? `${age.years}y ${age.months}m` : `${getHindiNumbers?.(age.years.toString()) || age.years}y ${getHindiNumbers?.(age.months.toString()) || age.months}m`;
        return val;
      }
      if (age.months >= 1) {
        const val = isEnglish ? `${age.months}m` : `${getHindiNumbers?.(age.months.toString()) || age.months}m`;
        return val;
      }
      const val = isEnglish ? `${age.days}d` : `${getHindiNumbers?.(age.days.toString()) || age.days}d`;
      return val;
    },
    [getHindiNumbers],
  );

  /**
   * Build generation groups by traversing the currently selected village's tree.
   * Each village's root member stores its absolute generation number
   * (Tatija root = 1, Moruwa root = 8, Dulania roots = 11). Every child
   * below the root adds 1 generation, matching the family-tree convention.
   * Wives share the generation of their husband. Generations are displayed
   * relative to the active village selection (sorted by generation number).
   */
  const generationGroups = useMemo(() => {
    const groups = {};
    const seen = new Set();

    // Add a single member (no spouse) to the generation.
    const addSingle = (member, gen) => {
      if (!member || !member.name) return;
      if (member.id != null && seen.has(member.id)) return;
      if (member.id != null) seen.add(member.id);
      const g = gen != null ? gen : member.generation != null ? member.generation : 1;
      if (!groups[g]) groups[g] = [];
      groups[g].push({ type: "single", member });
    };

    // Add a couple (husband + his wives) as one paired tile.
    const addCouple = (husband, wives, gen) => {
      if (!husband || !husband.name) return;
      if (husband.id != null && seen.has(husband.id)) return;
      if (husband.id != null) seen.add(husband.id);
      const validWives = (wives || []).filter((w) => w && w.name);
      // If there are no valid wives, render the husband as a single tile.
      if (validWives.length === 0) {
        addSingle(husband, gen);
        return;
      }
      // Mark wives as added so they are not rendered separately.
      validWives.forEach((w) => {
        if (w.id != null) seen.add(w.id);
      });
      const g = gen != null ? gen : husband.generation != null ? husband.generation : 1;
      if (!groups[g]) groups[g] = [];
      groups[g].push({ type: "couple", husband, wives: validWives });
    };

    const traverse = (node, gen) => {
      if (!node) return;
      // Male with wives → couple tile; otherwise single tile.
      if (node.gender === "M" && node.wives?.length) {
        addCouple(node, node.wives, gen);
      } else {
        addSingle(node, gen);
      }
      // Children (male lineage) get gen+1
      if (node.gender === "M" && node.children?.length) {
        node.children.forEach((child) => traverse(child, gen + 1));
      }
    };

    // Use only the currently selected village's tree (state.village)
    const selectedVillage = state.village || "dulania";
    const selectedTree = selectedVillage === "tatija" ? tatija : selectedVillage === "moruwa" ? moruwa : dulania;

    (selectedTree || []).forEach((root) => {
      const rootGen = root.generation != null ? root.generation : 1;
      traverse(root, rootGen);
    });

    // Sort generations ascending
    const sorted = Object.entries(groups)
      .map(([gen, items]) => ({
        generation: parseInt(gen, 10),
        items,
        // Count total individuals (couples count as husband + wives)
        count: items.reduce((sum, item) => sum + (item.type === "couple" ? 1 + item.wives.length : 1), 0),
      }))
      .sort((a, b) => a.generation - b.generation);

    return sorted;
  }, [state.village, dulania, moruwa, tatija]);

  /**
   * Scroll to a specific generation section.
   */
  const scrollToGeneration = useCallback((gen) => {
    const el = sectionRefs.current[gen];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveGen(gen);
    }
  }, []);

  /**
   * Handle member tile click — open the member display modal.
   */
  const handleMemberClick = useCallback(
    (member, e) => {
      e.stopPropagation();
      dispatch({ type: "openMemberDisplay", member });
    },
    [dispatch],
  );

  /**
   * Track scroll position for scroll-to-top visibility and active nav chip.
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Show/hide scroll-to-top button
      setShowScrollTop(container.scrollTop > 200);

      // Determine which generation is currently visible (for nav highlight)
      const scrollTop = container.scrollTop;
      let closestGen = null;
      let closestDist = Infinity;

      Object.entries(sectionRefs.current).forEach(([gen, el]) => {
        if (!el) return;
        const offsetTop = el.offsetTop;
        const dist = Math.abs(offsetTop - scrollTop);
        if (dist < closestDist) {
          closestDist = dist;
          closestGen = parseInt(gen, 10);
        }
      });

      if (closestGen !== null && closestGen !== activeGen) {
        setActiveGen(closestGen);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll, { passive: true });
  }, [activeGen]);

  /**
   * Scroll to top of the mosaic.
   */
  const scrollToTop = useCallback(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /**
   * Compute intro text for a generation.
   */
  const getGenerationIntro = useCallback(
    (gen, count) => {
      if (isEnglish) {
        return `Meet Generation ${gen} — ${count} member${count !== 1 ? "s" : ""} of the Jangir family tree.`;
      }
      const genText = getHindiText?.(`Generation ${gen}`) || `पीढ़ी ${gen}`;
      const countText = getHindiNumbers?.(count.toString()) || count;
      return `${genText} — जांगिर वंश वृक्ष के ${countText} सदस्य।`;
    },
    [isEnglish, getHindiText, getHindiNumbers],
  );

  /**
   * Get the display name for a member.
   */
  const getDisplayName = useCallback(
    (member) => {
      if (!member.name) return "";
      return isEnglish ? member.name : getHindiText?.(member.name) || member.name;
    },
    [isEnglish, getHindiText],
  );

  /**
   * Get the photo source for a member.
   */
  const getMemberPhoto = useCallback(
    (member) => {
      if (!member) return null;
      const memberImg = state.images?.find((img) => img.id === member.id);
      if (memberImg?.src) return memberImg.src;
      return null;
    },
    [state.images],
  );

  /**
   * Get the default icon for a member based on gender.
   * Falls back to a female icon when no member is provided.
   */
  const getDefaultIcon = useCallback((member) => {
    if (!member) return FemaleProfileIcon;
    return member.gender === "M" ? MaleProfileIcon : FemaleProfileIcon;
  }, []);

  // Empty state
  if (!generationGroups.length) {
    return (
      <div className={`generation-mosaic ${isModalOpen ? "slide-out" : ""}`} ref={containerRef}>
        <div className="mosaic-empty">
          <span className="mosaic-empty-icon">🖼️</span>
          <span>{isEnglish ? "No members found" : "कोई सदस्य नहीं मिला"}</span>
        </div>
      </div>
    );
  }

  // Determine the overall generation range for the nav bar
  const genRange = generationGroups.length > 0 ? { min: generationGroups[0].generation, max: generationGroups[generationGroups.length - 1].generation } : { min: 1, max: 1 };

  return (
    <div className={`generation-mosaic ${isModalOpen ? "slide-out" : ""}`} ref={containerRef}>
      {/* Navigation bar for quick generation jumping */}
      {generationGroups.length > 3 && (
        <div className="mosaic-nav-bar">
          {generationGroups.map((group) => (
            <span key={group.generation} className={`mosaic-nav-chip ${activeGen === group.generation ? "active" : ""}`} onClick={() => scrollToGeneration(group.generation)}>
              {isEnglish ? `Gen ${group.generation}` : `पीढ़ी ${getHindiNumbers?.(group.generation.toString()) || group.generation}`}
            </span>
          ))}
        </div>
      )}

      {/* Generation sections */}
      {generationGroups.map((group, groupIndex) => {
        const genLabel = isEnglish ? `Generation ${group.generation}` : `पीढ़ी ${getHindiNumbers?.(group.generation.toString()) || group.generation}`;
        const countLabel = isEnglish ? `${group.count} member${group.count !== 1 ? "s" : ""}` : `${getHindiNumbers?.(group.count.toString()) || group.count} सदस्य`;
        const intro = groupIndex === 0 || groupIndex === generationGroups.length - 1 ? getGenerationIntro(group.generation, group.count) : null;

        return (
          <div
            key={group.generation}
            className="generation-section"
            ref={(el) => {
              sectionRefs.current[group.generation] = el;
            }}
            style={{ animationDelay: `${groupIndex * 0.08}s` }}
          >
            {/* Generation header */}
            <div className="generation-header">
              <span className="generation-number">{genLabel}</span>
              <span className="generation-count">{countLabel}</span>
            </div>

            {/* Intro text for first/last generations */}
            {/* {intro && <p className="generation-intro">{intro}</p>} */}

            {/* Member tiles */}
            <div className="generation-tiles">
              {group.items.map((item, itemIdx) => {
                if (item.type === "couple") {
                  const h = item.husband;
                  const w = item.wives[0]; // show first wife in pair
                  const hPhoto = getMemberPhoto(h);
                  const hIcon = hPhoto || getDefaultIcon(h);
                  const wPhoto = w ? getMemberPhoto(w) : null;
                  const wIcon = wPhoto || getDefaultIcon(w);
                  const hAlive = h.isAlive !== false;
                  const wAlive = w ? w.isAlive !== false : true;
                  const hName = getDisplayName(h);
                  const wName = w ? getDisplayName(w) : "";
                  const hKey = `couple-${h.id ?? h.name}`;

                  return (
                    <div key={hKey} className="member-tile couple-tile" title={`${hName} & ${wName || "(wife)"}`}>
                      {/* Husband (left) */}
                      <div
                        className="couple-member couple-husband"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMemberClick(h, e);
                        }}
                      >
                        <div className="member-tile-photo-wrapper male">
                          <img className={`member-tile-photo ${!hAlive ? "deceased" : ""}`} src={hIcon} alt={hName} loading="lazy" />
                          <span className={`member-tile-status-dot ${hAlive ? "alive" : "deceased"}`} />
                        </div>
                        <span className={`member-tile-name ${!hAlive ? "deceased" : ""}`}>{hName}</span>
                      </div>
                      {/* Connector */}
                      {/* <span className="couple-connector">💍</span> */}
                      {/* Wife (right) */}
                      <div
                        className="couple-member couple-wife"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (w) handleMemberClick(w, e);
                        }}
                      >
                        <div className="member-tile-photo-wrapper female">
                          <img
                            className={`member-tile-photo ${!wAlive ? "deceased" : ""}`}
                            src={wIcon}
                            alt={wName}
                            loading="lazy"
                            style={{
                              transform: !wPhoto && w && w.village ? "scaleX(-1)" : "none",
                            }}
                          />
                          <span className={`member-tile-status-dot ${wAlive ? "alive" : "deceased"}`} />
                        </div>
                        <span className={`member-tile-name ${!wAlive ? "deceased" : ""}`}>{wName}</span>
                      </div>
                    </div>
                  );
                }

                // Single member tile
                const member = item.member;
                const photoSrc = getMemberPhoto(member);
                const defaultIcon = getDefaultIcon(member);
                const isAlive = member.isAlive !== false;
                const age = getAge(member.dob, member.dod);
                const ageStr = formatAgeShort(age, isEnglish);
                const displayName = getDisplayName(member);

                return (
                  <div key={member.id ?? member.name} className={`member-tile ${!isAlive ? "deceased" : ""}`} onClick={(e) => handleMemberClick(member, e)} title={displayName}>
                    <div className={`member-tile-photo-wrapper ${member.gender === "M" ? "male" : "female"}`}>
                      <img
                        className={`member-tile-photo ${!isAlive ? "deceased" : ""}`}
                        src={photoSrc || defaultIcon}
                        alt={displayName}
                        loading="lazy"
                        style={{
                          transform: !photoSrc && member.gender === "F" && member.village ? "scaleX(-1)" : "none",
                        }}
                      />
                      <span className={`member-tile-status-dot ${isAlive ? "alive" : "deceased"}`} />
                    </div>
                    <span className={`member-tile-name ${!isAlive ? "deceased" : ""}`}>{displayName}</span>
                    {ageStr && <span className="member-tile-age">{ageStr}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Scroll-to-top button */}
      <button className={`mosaic-scroll-top ${showScrollTop ? "visible" : ""}`} onClick={scrollToTop} title={isEnglish ? "Scroll to top" : "ऊपर जाएं"} aria-label="Scroll to top">
        ⬆
      </button>
    </div>
  );
};

export default GenerationMosaic;
