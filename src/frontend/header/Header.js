import { useState } from "react";
import { SignOutIcon, UserEditIcon } from "../../utils/imageConstants";
import useTranslation from "../../hooks/useTranslation";
import useConfirm from "../../hooks/useConfirm";
import { ConfirmModal } from "../../components/modals";
import "./Header.css";

const Header = ({ state, dispatch, getHindiText, getHindiNumbers }) => {
  const [collapsed, setCollapsed] = useState(false);
  const isEnglish = state.user.language;
  const { t } = useTranslation(isEnglish);
  const { isOpen: confirmOpen, message: confirmMessage, showConfirm, handleConfirm, handleCancel } = useConfirm();

  const handleSignOut = async () => {
    const consent = await showConfirm("confirmSignout");
    if (consent) {
      dispatch({ type: "signout" });
    }
  };
  return (
    <>
      <div className="header">
        <button className="toggle-language" onClick={() => dispatch({ type: "language", flag: !state.user.language })}>
          {isEnglish ? t("Hindi") : t("English")}
        </button>
        <select value={state.village} onChange={(e) => dispatch({ type: "village", village: e.target.value })}>
          {state.villages.map((village, i) => {
            const range = state.generationRanges?.[village];
            const rangeText = range ? (isEnglish ? ` (${range.min} - ${range.max})` : ` (${getHindiNumbers(range.min.toString())} - ${getHindiNumbers(range.max.toString())})`) : "";
            const villageName = isEnglish ? village.replace(village.charAt(0), village.charAt(0).toUpperCase()) : getHindiText(village.replace(village.charAt(0), village.charAt(0).toUpperCase()), "village");
            return (
              <option key={i} value={village}>
                {villageName}
                {rangeText}
              </option>
            );
          })}
        </select>
        {state.user.role === "admin" ? <img className="icons" src={UserEditIcon} alt="editUser" onClick={() => dispatch({ type: "openUserEdit" })} loading="lazy" /> : ""}
        <img className="signout" src={SignOutIcon} alt="signout" onClick={() => handleSignOut()} loading="lazy" />
        <button
          onClick={() => {
            setCollapsed(!collapsed);
            if (collapsed) {
              // Currently expanded (Close button shown), restore to initial state
              dispatch({ type: "reset-collapse" });
            } else {
              // Currently collapsed (Open button shown), expand all
              dispatch({ type: "toggle-all", flag: false });
            }
          }}
        >
          {collapsed ? t("Close") : t("Open")}
        </button>
      </div>
      <ConfirmModal isOpen={confirmOpen} onConfirm={handleConfirm} onCancel={handleCancel} message={t(confirmMessage)} confirmText={t("yes")} cancelText={t("no")} />
    </>
  );
};

export default Header;
