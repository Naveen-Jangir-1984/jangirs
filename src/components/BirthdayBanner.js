import { useState } from "react";
import useTranslation from "../hooks/useTranslation";
import { MaleProfileIcon, FemaleProfileIcon } from "../utils/imageConstants";
import { CloseIcon } from "../utils/imageConstants";
import "./BirthdayBanner.css";

/**
 * BirthdayBanner - A slim, dismissible rectangular banner shown when a member
 * has a birthday today. The banner stays fixed at the top (low opacity) until
 * the user closes it.
 *
 * Props:
 * @param {Array} members - Array of member objects celebrating birthdays today
 * @param {Array} images - Array of { id, src } member profile images
 * @param {boolean} isEnglish - Whether to render in English (true) or Hindi (false)
 * @param {Function} getHindiText - Helper to translate member names to Hindi
 * @param {Function} onClose - Callback when the banner is closed
 */
const BirthdayBanner = ({ members, images = [], isEnglish, getHindiText, onClose }) => {
  const { t } = useTranslation(isEnglish);
  const [dismissed, setDismissed] = useState(false);

  if (!members?.length || dismissed) return null;

  // Determine gender for theming: male -> blue, female -> lightpink, mixed -> gradient
  const hasMale = members.some((m) => m.gender === "M");
  const hasFemale = members.some((m) => m.gender === "F");
  const genderClass = hasMale && hasFemale ? "mixed" : hasMale ? "male" : "female";

  const names = members
    .map((m) => (isEnglish ? m.name : getHindiText?.(m.name) || m.name))
    .filter(Boolean)
    .join(", ");

  if (!names) return null;

  const message = `${t("happyBirthday")}, ${names} !!`;

  const getMemberPic = (member) => {
    const memberDP = images?.find((img) => img.id === member.id);
    return memberDP?.src || (member.gender === "M" ? MaleProfileIcon : FemaleProfileIcon);
  };

  return (
    <div className={`birthday-banner ${genderClass}`} role="status" aria-live="polite">
      <div className="birthday-banner-avatars">
        {members.map((m, i) => (
          <img key={i} className={`birthday-banner-avatar ${m.gender === "M" ? "male" : "female"}`} src={getMemberPic(m)} alt={m.name} title={m.name} loading="lazy" style={{ transform: m.gender === "F" && !images?.find((img) => img.id === m.id)?.src ? "scaleX(-1)" : "none" }} />
        ))}
      </div>
      <span className="birthday-banner-text">{message}</span>
      <img
        className="birthday-banner-close"
        src={CloseIcon}
        onClick={() => {
          setDismissed(true);
          if (onClose) onClose();
        }}
        aria-label="Close"
        title="Close"
      />
    </div>
  );
};

export default BirthdayBanner;
