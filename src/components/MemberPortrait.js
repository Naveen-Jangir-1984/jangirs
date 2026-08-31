import { memo } from "react";
import { getThambaMeta } from "../utils/thamba";

const badgeStyleBase = {
  position: "absolute",
  bottom: "-2px",
  left: "-5px",
  width: "15px",
  height: "15px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid rgba(255, 255, 255, 0.9)",
  color: "#fff",
  fontSize: "10px",
  pointerEvents: "none",
};

const MemberPortrait = memo(({ src, alt, thamba, imgClassName, imgStyle, wrapperClassName = "", wrapperStyle = {}, onClick, loading = "lazy" }) => {
  const thambaMeta = getThambaMeta(thamba);

  return (
    <span className={wrapperClassName} style={{ position: "relative", display: "inline-block", lineHeight: 0, ...wrapperStyle }}>
      <img src={src} alt={alt} className={imgClassName} style={imgStyle} onClick={onClick} loading={loading} />
      {thambaMeta && (
        <span title={thambaMeta.label} aria-label={thambaMeta.label} style={{ ...badgeStyleBase, backgroundColor: thambaMeta.backgroundColor }}>
          {thambaMeta.icon}
        </span>
      )}
    </span>
  );
});

MemberPortrait.displayName = "MemberPortrait";

export default MemberPortrait;
