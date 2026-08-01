import { useState } from "react";
import useTranslation from "../hooks/useTranslation";
import { MaleProfileIcon, FemaleProfileIcon } from "../utils/imageConstants";
import { CloseIcon } from "../utils/imageConstants";
import "./BirthdayBanner.css";

/**
 * BirthdayBanner - A slim, dismissible rectangular banner shown when a member
 * has a birthday or death anniversary today. The banner stays fixed at the
 * bottom (low opacity) until the user closes it.
 *
 * Props:
 * @param {Array} events - Array of { member, eventType } objects celebrating today
 * @param {Array} images - Array of { id, src } member profile images
 * @param {boolean} isEnglish - Whether to render in English (true) or Hindi (false)
 * @param {Function} getHindiText - Helper to translate member names to Hindi
 * @param {Function} onClose - Callback when the banner is closed
 */
const BirthdayBanner = ({ events = [], images = [], isEnglish, getHindiText, onClose }) => {
  const { t } = useTranslation(isEnglish);
  const [dismissed, setDismissed] = useState(false);

  if (!events?.length || dismissed) return null;

  const getMemberPic = (member) => {
    const memberDP = images?.find((img) => img.id === member.id);
    return memberDP?.src || (member.gender === "M" ? MaleProfileIcon : FemaleProfileIcon);
  };

  // Build message lines – birthdays first, then anniversaries
  const birthdayMembers = events.filter((evt) => evt.eventType === "birthday").map((evt) => evt.member);
  const anniversaryMembers = events.filter((evt) => evt.eventType === "anniversary").map((evt) => evt.member);

  let messages = [];
  if (birthdayMembers.length > 0) {
    const names = birthdayMembers
      .map((m) => (isEnglish ? m.name : getHindiText?.(m.name) || m.name))
      .filter(Boolean)
      .join(", ");
    if (names) {
      messages.push(`${t("happyBirthday")}, ${names} !!`);
    }
  }
  if (anniversaryMembers.length > 0) {
    const names = anniversaryMembers
      .map((m) => (isEnglish ? m.name : getHindiText?.(m.name) || m.name))
      .filter(Boolean)
      .join(", ");
    if (names) {
      messages.push(`${t("deathAnniversary")}: ${names} !!`);
    }
  }

  if (messages.length === 0) return null;

  return (
    <div className="birthday-banner" role="status" aria-live="polite">
      <div className="birthday-banner-avatars">
        {events.map((evt, i) => (
          <div key={i} className={`birthday-banner-avatar`}>
            <img src={getMemberPic(evt.member)} alt={evt.member.name} title={evt.member.name} loading="lazy" style={{ transform: evt.member.gender === "F" && !images?.find((img) => img.id === evt.member.id)?.src ? "scaleX(-1)" : "none" }} />
            <span className="birthday-banner-text">{messages[i]}</span>
          </div>
        ))}
      </div>
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
