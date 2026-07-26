import { useState } from "react";
import { SignOutIcon, UserEditIcon } from "../../utils/imageConstants";
import useTranslation from "../../hooks/useTranslation";
import useConfirm from "../../hooks/useConfirm";
import { ConfirmModal } from "../../components/modals";
import "./Header.css";

const Header = ({ state, dispatch, getHindiText, getHindiNumbers, isModalOpen, onConfirmChange, activeView, setActiveView, onExportPDF, exportStatus }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showNavIcons, setShowNavIcons] = useState(false);
  const isEnglish = state.user.language;
  const { t } = useTranslation(isEnglish);
  const { isOpen: confirmOpen, message: confirmMessage, showConfirm, handleConfirm, handleCancel } = useConfirm();

  const handleSignOut = async () => {
    onConfirmChange(true);
    const consent = await showConfirm("confirmSignout");
    onConfirmChange(false);
    if (consent) dispatch({ type: "signout" });
  };

  const handleExportClick = async () => {
    if (exportStatus === "loading" || exportStatus === "capturing" || exportStatus === "generating") return;
    onConfirmChange(true);
    const confirmKey = activeView === "calendar" ? "confirmExportCalendar" : "confirmExportTree";
    const consent = await showConfirm(confirmKey);
    onConfirmChange(false);
    if (consent && onExportPDF) onExportPDF();
  };

  const handleNavClick = (view) => {
    setActiveView(view);
    setShowNavIcons(false);
  };

  const shouldSlideOut = isModalOpen || confirmOpen;
  const isExporting = exportStatus === "loading" || exportStatus === "capturing" || exportStatus === "generating";

  return (
    <>
      <div className="header-wrapper">
        <button className="toggle-language" onClick={() => dispatch({ type: "language", flag: !state.user.language })}>
          {isEnglish ? t("Hindi") : t("English")}
        </button>
        <div className={"header" + (shouldSlideOut ? " slide-out" : "")}>
          <select value={state.village} onChange={(e) => dispatch({ type: "village", village: e.target.value })}>
            {state.villages.map((village, i) => {
              const range = state.generationRanges[village];
              const rangeText = range ? (isEnglish ? " (" + range.min + " - " + range.max + ")" : " (" + getHindiNumbers(range.min.toString()) + " - " + getHindiNumbers(range.max.toString()) + ")") : "";
              const villageName = isEnglish ? village.replace(village.charAt(0), village.charAt(0).toUpperCase()) : getHindiText(village.replace(village.charAt(0), village.charAt(0).toUpperCase()), "village");
              return (
                <option key={i} value={village}>
                  {villageName}
                  {rangeText}
                </option>
              );
            })}
          </select>

          <span className="view-toggle-icon icons" onClick={handleExportClick} title={t("exportPDF")} style={{ opacity: isExporting ? 0.5 : 1, cursor: isExporting ? "wait" : "pointer" }}>
            {isExporting ? "⏳" : "📄"}
          </span>

          <div className="breadcrumb-wrapper">
            <span className={"view-toggle-icon icons breadcrumb-icon" + (showNavIcons ? " active" : "")} onClick={() => setShowNavIcons(!showNavIcons)}>
              {"\uD83C\uDFE0"}
            </span>

            {showNavIcons && (
              <div className="breadcrumb-dropdown">
                {activeView === "tree" ? (
                  <>
                    <span className={"breadcrumb-item" + (activeView === "calendar" ? " active" : "")} onClick={() => handleNavClick("calendar")}>
                      <span>{"📅"}</span>
                      <span>{t("calendar") || "Calendar"}</span>
                    </span>
                    <span className={"breadcrumb-item" + (activeView === "connectionMap" ? " active" : "")} onClick={() => handleNavClick("connectionMap")}>
                      <span>{"🗺️"}</span>
                      <span>{t("familyConnections") || "Family Connections"}</span>
                    </span>
                  </>
                ) : activeView === "calendar" ? (
                  <>
                    <span className={"breadcrumb-item" + (activeView === "tree" ? " active" : "")} onClick={() => handleNavClick("tree")}>
                      <span>{"🌳"}</span>
                      <span>{t("family") || "Family"}</span>
                    </span>
                    <span className={"breadcrumb-item" + (activeView === "connectionMap" ? " active" : "")} onClick={() => handleNavClick("connectionMap")}>
                      <span>{"🗺️"}</span>
                      <span>{t("familyConnections") || "Family Connections"}</span>
                    </span>
                  </>
                ) : activeView === "connectionMap" ? (
                  <>
                    <span className={"breadcrumb-item" + (activeView === "tree" ? " active" : "")} onClick={() => handleNavClick("tree")}>
                      <span>{"🌳"}</span>
                      <span>{t("family") || "Family"}</span>
                    </span>
                    <span className={"breadcrumb-item" + (activeView === "calendar" ? " active" : "")} onClick={() => handleNavClick("calendar")}>
                      <span>{"📅"}</span>
                      <span>{t("calendar") || "Calendar"}</span>
                    </span>
                  </>
                ) : null}
              </div>
            )}
          </div>

          {state.user.role === "admin" ? <img className="icons" src={UserEditIcon} alt="editUser" onClick={() => dispatch({ type: "openUserEdit" })} loading="lazy" /> : ""}

          <img className="signout" src={SignOutIcon} alt="signout" onClick={() => handleSignOut()} loading="lazy" />

          {activeView === "tree" && (
            <button
              onClick={() => {
                setCollapsed(!collapsed);
                if (collapsed) dispatch({ type: "reset-collapse" });
                else dispatch({ type: "toggle-all", flag: false });
              }}
            >
              {collapsed ? t("Close") : t("Open")}
            </button>
          )}
        </div>
      </div>
      <ConfirmModal isOpen={confirmOpen} onConfirm={handleConfirm} onCancel={handleCancel} message={t(confirmMessage)} confirmText={t("yes")} cancelText={t("no")} />
    </>
  );
};

export default Header;
