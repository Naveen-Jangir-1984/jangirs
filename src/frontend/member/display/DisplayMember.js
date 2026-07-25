import { useState, useRef, useCallback } from "react";
import { MaleProfileIcon as MaleProfileImage, FemaleProfileIcon as FemaleProfileImage, MobileIcon, EmailIcon, UploadIcon, DeleteIcon } from "../../../utils/imageConstants";
import { MONTHS } from "../../../utils/constants";
import api from "../../../utils/api";
import { fetchMemberImages } from "../../../utils/getImages";
import useTranslation from "../../../hooks/useTranslation";
import useConfirm from "../../../hooks/useConfirm";
import { ConfirmModal, ImageCropModal } from "../../../components/modals";
import { exportMemberSubtreeAsPDF } from "../../../utils/exportPDF";
import "./DisplayMember.css";

const DisplayMember = ({ state, dispatch, getHindiText, getHindiNumbers, onConfirmChange }) => {
  const isEnglish = state.user.language;
  const { t } = useTranslation(isEnglish);
  const { isOpen: confirmOpen, message: confirmMessage, showConfirm, handleConfirm, handleCancel } = useConfirm();
  const memberImage = state.images.find((image) => image.id === state.memberToBeDisplayed.id);

  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [pdfExportStatus, setPdfExportStatus] = useState("");

  const showConfirmWithSlide = async (message) => {
    onConfirmChange?.(true);
    const result = await showConfirm(message);
    onConfirmChange?.(false);
    return result;
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setUploadStatus("error");
      setUploadMessage(t("invalidFileType") || "Invalid file type.");
      setTimeout(() => {
        setUploadStatus("");
        setUploadMessage("");
      }, 3000);
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setUploadStatus("error");
      setUploadMessage(t("fileTooLarge") || "File too large.");
      setTimeout(() => {
        setUploadStatus("");
        setUploadMessage("");
      }, 3000);
      return;
    }
    setSelectedFile(file);
    setCropModalOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCropConfirm = async (croppedBlob) => {
    setCropModalOpen(false);
    setSelectedFile(null);
    setUploadStatus("uploading");
    setUploadMessage(t("uploadingPhoto") || "Uploading...");
    try {
      const croppedFile = new File([croppedBlob], "photo.jpg", { type: "image/jpeg" });
      const result = await api.uploadCroppedPhoto(state.memberToBeDisplayed.id, croppedFile);
      if (result.result === "success") {
        setUploadStatus("success");
        setUploadMessage(t("photoUploaded") || "Uploaded!");
        const updatedImages = await fetchMemberImages();
        dispatch({ type: "updateImages", images: updatedImages });
        setTimeout(() => {
          setUploadStatus("");
          setUploadMessage("");
        }, 3000);
      } else {
        setUploadStatus("error");
        setUploadMessage(result.message || t("uploadFailed") || "Failed.");
      }
    } catch (error) {
      setUploadStatus("error");
      setUploadMessage(error.message || t("uploadError") || "Error.");
    }
  };

  const handleCropCancel = () => {
    setCropModalOpen(false);
    setSelectedFile(null);
  };

  const handlePhotoDelete = async () => {
    if (!(await showConfirmWithSlide("confirmDeletePhoto"))) return;
    setUploadStatus("uploading");
    setUploadMessage(t("deletingPhoto") || "Deleting...");
    try {
      const result = await api.deletePhoto(state.memberToBeDisplayed.id);
      if (result.result === "success") {
        setUploadStatus("success");
        setUploadMessage(t("photoDeleted") || "Deleted!");
        const updatedImages = await fetchMemberImages();
        dispatch({ type: "updateImages", images: updatedImages });
        setTimeout(() => {
          setUploadStatus("");
          setUploadMessage("");
        }, 3000);
      } else {
        setUploadStatus("error");
        setUploadMessage(result.message || t("deleteFailed") || "Failed.");
      }
    } catch (error) {
      setUploadStatus("error");
      setUploadMessage(error.message || t("deleteError") || "Error.");
    }
  };

  const memberDOB = state.memberToBeDisplayed.dob || "";
  const memberDOD = state.memberToBeDisplayed.dod || "";
  const memberMobiles = state.memberToBeDisplayed.mobile || [];
  const memberEmails = state.memberToBeDisplayed.email || [];

  const getAge = (dobString, dodString) => {
    if (!dobString || dobString.length === 0) return { years: 0, months: 0, days: 0 };
    const dobParts = dobString.split(" ");
    const birthDate = new Date(dobParts[2], MONTHS.indexOf(dobParts[1]), dobParts[0]);
    const endDate = !dodString || dodString.length === 0 ? new Date() : new Date(dodString.split(" ")[2], MONTHS.indexOf(dodString.split(" ")[1]), dodString.split(" ")[0]);
    let years = endDate.getFullYear() - birthDate.getFullYear();
    let monthsDiff = endDate.getMonth() - birthDate.getMonth();
    let daysDiff = endDate.getDate() - birthDate.getDate();
    if (daysDiff < 0) {
      monthsDiff--;
      const prevMonth = new Date(endDate.getFullYear(), endDate.getMonth() - 1, birthDate.getDate());
      daysDiff += (endDate - prevMonth) / (1000 * 60 * 60 * 24);
    }
    if (monthsDiff < 0) {
      years--;
      monthsDiff += 12;
    }
    return { years: Math.max(0, years), months: Math.max(0, monthsDiff), days: Math.max(0, Math.floor(daysDiff)) };
  };

  const handleAddMember = () => dispatch({ type: "openMemberAdd", member: state.memberToBeDisplayed });
  const handleEditMember = () => dispatch({ type: "openMemberEdit", member: state.memberToBeDisplayed });
  const handleDeleteMember = async (id) => {
    if (!(await showConfirmWithSlide("confirmDeleteMember"))) return;
    const data = await api.deleteMember(id, state.village);
    if (data.result === "success") dispatch({ type: "deleteMember", id });
  };

  const handleExportPDF = async () => {
    onConfirmChange(true);
    const consent = await showConfirm("confirmExportSubtreePDF");
    onConfirmChange(false);

    if (consent) {
      setPdfExportStatus("generating");
      try {
        await exportMemberSubtreeAsPDF(state.memberToBeDisplayed, {
          village: state.village,
          isEnglish,
          getHindiText,
          getHindiNumbers,
          images: state.images,
          onProgress: (status) => {
            if (status === "done") setPdfExportStatus("");
            else if (status === "error") setPdfExportStatus("error");
          },
        });
      } catch (err) {
        setPdfExportStatus("error");
        setTimeout(() => setPdfExportStatus(""), 3000);
      }
    }
  };

  const handleClose = () => {
    if (cropModalOpen) handleCropCancel();
    else if (!confirmOpen) dispatch({ type: "closeMemberDisplay" });
  };

  // Find family member images for circular border display
  const getFamilyMemberImage = (memberId) => {
    const img = state.images.find((image) => image.id === memberId);
    return img ? img.src : null;
  };

  // Tree traversal: find the parent male node whose children array contains the target member id
  const findParentNode = (nodes, targetId) => {
    for (const node of nodes) {
      if (!node) continue;
      // Check if this male node has the target member as a child
      if (node.children && node.children.some((child) => child && child.id === targetId)) {
        return node;
      }
      // Recursively search in children (only male children)
      if (node.children) {
        for (const child of node.children) {
          if (child && child.gender === "M") {
            const found = findParentNode([child], targetId);
            if (found) return found;
          }
        }
      }
    }
    return null;
  };

  // Tree traversal: find the male node whose wives array contains the target female member id
  const findHusbandNode = (nodes, targetId) => {
    for (const node of nodes) {
      if (!node) continue;
      // Check if this male node has the target female as a wife
      if (node.wives && node.wives.some((wife) => wife && wife.id === targetId)) {
        return node;
      }
      // Recursively search in children (only male children)
      if (node.children) {
        for (const child of node.children) {
          if (child && child.gender === "M") {
            const found = findHusbandNode([child], targetId);
            if (found) return found;
          }
        }
      }
    }
    return null;
  };

  const isMale = state.memberToBeDisplayed.gender === "M";
  const currentId = state.memberToBeDisplayed.id;

  // Find father (the male node whose children includes current member)
  const fatherNode = findParentNode(state.members, currentId);
  const father = fatherNode
    ? {
        ...fatherNode,
        imageSrc: getFamilyMemberImage(fatherNode.id) || MaleProfileImage,
        type: "father",
        isAlive: fatherNode.isAlive !== undefined ? fatherNode.isAlive : true,
      }
    : null;

  // Find mother (first wife of the father node)
  const mother =
    fatherNode && fatherNode.wives && fatherNode.wives.length > 0
      ? {
          ...fatherNode.wives[0],
          imageSrc: getFamilyMemberImage(fatherNode.wives[0].id) || FemaleProfileImage,
          type: "mother",
          isAlive: fatherNode.wives[0].isAlive !== undefined ? fatherNode.wives[0].isAlive : true,
        }
      : null;

  // Find husband (for female members: the male node whose wives array includes current member)
  const husbandNode = findHusbandNode(state.members, currentId);
  const husband = husbandNode
    ? {
        ...husbandNode,
        imageSrc: getFamilyMemberImage(husbandNode.id) || MaleProfileImage,
        type: "husband",
        isAlive: husbandNode.isAlive !== undefined ? husbandNode.isAlive : true,
      }
    : null;

  const familyMembers = isMale
    ? [
        // Existing wives
        ...(state.memberToBeDisplayed.wives || []).map((wife) => ({
          ...wife,
          imageSrc: getFamilyMemberImage(wife.id) || FemaleProfileImage,
          type: "wife",
          isAlive: wife.isAlive !== undefined ? wife.isAlive : true,
        })),
        // Existing children
        ...(state.memberToBeDisplayed.children || []).map((child) => ({
          ...child,
          imageSrc: getFamilyMemberImage(child.id) || (child.gender === "M" ? MaleProfileImage : FemaleProfileImage),
          type: "child",
          isAlive: child.isAlive !== undefined ? child.isAlive : true,
        })),
      ]
    : // For female members, show husband + children from the husband's children array
      husbandNode
      ? [
          // Husband first
          husband,
          // Then children
          ...(husbandNode.children || []).map((child) => ({
            ...child,
            imageSrc: getFamilyMemberImage(child.id) || (child.gender === "M" ? MaleProfileImage : FemaleProfileImage),
            type: "child",
            isAlive: child.isAlive !== undefined ? child.isAlive : true,
          })),
        ]
      : [];

  // Calculate positions around the circular border (clockwise from top)
  // Orbit radius = half-image (12.5vh) + padding (10px) + half-thumbnail (12px) = 12.5vh + 22px
  // CSS translate(-50%,-50%) centers the thumbnail on the calculated point
  const getCircularPosition = (index, total) => {
    const angleDeg = (index / total) * 360;
    const angleRad = (angleDeg * Math.PI) / 180;
    const sin = Math.sin(angleRad);
    const cos = Math.cos(angleRad);
    const left = `calc(50% + ${sin * 12.5}vh + ${sin * 22}px)`;
    const top = `calc(50% - ${cos * 12.5}vh - ${cos * 22}px)`;
    return { left, top };
  };

  const handleDisplayMember = useCallback(
    (e, member) => {
      e.stopPropagation();
      dispatch({ type: "openMemberDisplay", member: member });
    },
    [dispatch],
  );

  const totalFamily = familyMembers.length;

  return (
    <div className="details" style={{ display: state.isMemberDisplayOpen ? "flex" : "none" }} onClick={handleClose}>
      <div className="view" onClick={(e) => e.stopPropagation()}>
        {/* Father thumbnail - top left corner */}
        {father && (
          <div className="parent-thumbnail parent-thumbnail-left" title={father.name || t("Father")}>
            <span className="parent-thumbnail-relation">{t("Father")}</span>
            <img src={father.imageSrc} alt={father.name || t("Father")} className="parent-thumbnail-img" loading="lazy" style={{ border: `2px solid ${father.isAlive ? "green" : "#f55"}` }} onClick={(e) => handleDisplayMember(e, father)} />
            <span className="parent-thumbnail-name">{father.name ? (isEnglish ? father.name : getHindiText(father.name, "name")) : t("Father")}</span>
          </div>
        )}
        {/* Mother thumbnail - top right corner */}
        {mother && (
          <div className="parent-thumbnail parent-thumbnail-right" title={mother.name || t("Mother")}>
            <span className="parent-thumbnail-relation">{t("Mother")}</span>
            <img src={mother.imageSrc} alt={mother.name || t("Mother")} className="parent-thumbnail-img" loading="lazy" style={{ border: `2px solid ${mother.isAlive ? "green" : "#f55"}` }} onClick={(e) => handleDisplayMember(e, mother)} />
            <span className="parent-thumbnail-name">{mother.name ? (isEnglish ? mother.name : getHindiText(mother.name, "name")) : t("Mother")}</span>
          </div>
        )}
        <div className="profile-image-container">
          {/* Family thumbnails arranged clockwise along circular border */}
          {familyMembers.length > 0 &&
            familyMembers.map((member, i) => {
              const pos = getCircularPosition(i, totalFamily);
              // const defaultIcon = member.type === "wife" ? FemaleProfileImage : member.gender === "M" ? MaleProfileImage : FemaleProfileImage;
              // const isDefaultFemale = defaultIcon === FemaleProfileImage;
              const borderColor = member.isAlive ? "green" : "#f55";
              return (
                <div key={i} className="family-thumbnail-wrapper" style={{ left: pos.left, top: pos.top }} title={member.name || (member.type === "wife" ? t("wife") : t("child"))}>
                  <div style={{ display: "flex" }}>
                    <div style={{ zIndex: 1 }}>
                      <span className="family-thumbnail-relation">
                        {member.type === "wife" ? t("Wife") : member.type === "husband" ? t("Husband") : member.gender === "M" ? t("Son") : t("Daughter")}
                        {/* {member.type !== "husband" && member.type !== "wife" ? ` (${isEnglish ? i : getHindiNumbers(i.toString())})` : ""} */}
                      </span>
                      <img src={member.imageSrc} alt={member.name || `${member.type} ${i + 1}`} className="family-thumbnail" loading="lazy" style={{ border: `2px solid ${borderColor}` }} onClick={(e) => handleDisplayMember(e, member)} />
                      <span className="family-thumbnail-name">{member.name ? (isEnglish ? member.name : getHindiText(member.name, "name")) : member.type === "wife" ? t("wife") : t("child")}</span>
                    </div>
                    {member.wives && member.wives.length > 0 && state.memberToBeDisplayed.id !== member.wives[0].id && (
                      <div style={{ marginLeft: "-15px", zIndex: 0 }} title={member.wives[0].name || t("Daughter-In-Law")}>
                        <span className="family-thumbnail-relation">{t("Daughter-In-Law")}</span>
                        <img src={getFamilyMemberImage(member.wives[0].id) || FemaleProfileImage} alt={member.wives[0].name || `${member.wives[0].type} ${i + 1}`} className="family-thumbnail" loading="lazy" style={{ border: `2px solid ${member.wives[0].isAlive ? "green" : "#f55"}` }} onClick={(e) => handleDisplayMember(e, member.wives[0])} />
                        <span className="family-thumbnail-name">{member.wives[0].name ? (isEnglish ? member.wives[0].name : getHindiText(member.wives[0].name, "name")) : member.wives[0].type === "wife" ? t("wife") : t("child")}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          <img style={{ boxShadow: `0 0 20px ${state.memberToBeDisplayed.isAlive ? "green" : "#f55"}`, transform: !memberImage && state.memberToBeDisplayed.gender === "F" && state.memberToBeDisplayed.gotra ? "scaleX(-1)" : "none" }} src={memberImage ? memberImage.src : state.memberToBeDisplayed.gender === "M" ? MaleProfileImage : FemaleProfileImage} alt={state.memberToBeDisplayed.name} loading="lazy" />
          {state.user.role === "admin" && (
            <label className="upload-photo-btn" title={t("uploadPhoto") || "Upload Photo"}>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileSelect} ref={fileInputRef} style={{ display: "none" }} disabled={uploadStatus === "uploading"} />
              <img src={UploadIcon} alt="upload" className="upload-icon" />
            </label>
          )}
          {state.user.role === "admin" && memberImage && (
            <button className="delete-photo-btn" title={t("deletePhoto") || "Delete Photo"} onClick={handlePhotoDelete} disabled={uploadStatus === "uploading"}>
              <img src={DeleteIcon} alt="delete" className="delete-icon" />
            </button>
          )}
          {uploadStatus && (
            <div className={"upload-status " + uploadStatus}>
              {uploadStatus === "uploading" && <span className="spinner"></span>}
              <span>{uploadMessage}</span>
            </div>
          )}
        </div>
        <div className="info">
          <div>{isEnglish ? state.memberToBeDisplayed.name : getHindiText(state.memberToBeDisplayed.name, "name")}</div>
          {memberDOB && (
            <div className="age">
              <span style={{ fontWeight: "bolder" }}>{t("Age")}</span>
              <span>
                {isEnglish
                  ? (function () {
                      const age = getAge(memberDOB, memberDOD);
                      const parts = [];
                      if (age.years > 0) parts.push(age.years + " " + t("years"));
                      if (age.months > 0) parts.push(age.months + " " + t("months"));
                      if (age.days > 0) parts.push(age.days + " " + t("days"));
                      return parts.join(" ");
                    })()
                  : (function () {
                      const age = getAge(memberDOB, memberDOD);
                      const parts = [];
                      if (age.years > 0) parts.push(getHindiNumbers(age.years.toString()) + " " + t("years"));
                      if (age.months > 0) parts.push(getHindiNumbers(age.months.toString()) + " " + t("months"));
                      if (age.days > 0) parts.push(getHindiNumbers(age.days.toString()) + " " + t("days"));
                      return parts.join(" ");
                    })()}
              </span>
            </div>
          )}
          {memberDOB && !isEnglish ? (
            <div className="dob">
              <span style={{ fontWeight: "bolder" }}>{t("Birth")}</span>
              <span>{getHindiNumbers(memberDOB.split(" ")[0]) + " " + getHindiText(memberDOB.split(" ")[1], "months") + " " + getHindiNumbers(memberDOB.split(" ")[2])}</span>
            </div>
          ) : memberDOB && isEnglish ? (
            <div className="dob">
              <span style={{ fontWeight: "bolder" }}>{t("Birth")}</span>
              <span>{memberDOB}</span>
            </div>
          ) : null}
          {memberDOD && !isEnglish ? (
            <div className="dod">
              <span style={{ fontWeight: "bolder" }}>{t("Death")}</span>
              <span>{getHindiNumbers(memberDOD.split(" ")[0]) + " " + getHindiText(memberDOD.split(" ")[1], "months") + " " + getHindiNumbers(memberDOD.split(" ")[2])}</span>
            </div>
          ) : memberDOD && isEnglish ? (
            <div className="dod">
              <span style={{ fontWeight: "bolder" }}>{t("Death")}</span>
              <span>{memberDOD}</span>
            </div>
          ) : null}
          {state.memberToBeDisplayed.village && (
            <div className="village">
              <span style={{ fontWeight: "bolder" }}>{t("Village")}</span>
              <span>{isEnglish ? state.memberToBeDisplayed.village : getHindiText(state.memberToBeDisplayed.village, "village")}</span>
            </div>
          )}
          {state.memberToBeDisplayed.gotra && (
            <div className="gotra">
              <span style={{ fontWeight: "bolder" }}>{t("Gotra")}</span>
              <span>{isEnglish ? state.memberToBeDisplayed.gotra : getHindiText(state.memberToBeDisplayed.gotra, "gotra")}</span>
            </div>
          )}
          {memberMobiles.length ? (
            <div className="view-mobile">
              <img className="icons" src={MobileIcon} alt="mobile" loading="lazy" />
              <span className="view-mobile">
                {memberMobiles.map(function (mobile, i) {
                  return (
                    <a
                      key={i}
                      href={"tel: " + mobile}
                      onClick={function (e) {
                        e.stopPropagation();
                      }}
                    >
                      {mobile}
                    </a>
                  );
                })}
              </span>
            </div>
          ) : null}
          {memberEmails.length ? (
            <div className="view-email">
              <img className="icons" src={EmailIcon} alt="email" loading="lazy" />
              <span className="view-email">
                {memberEmails.map(function (email, i) {
                  return (
                    <a
                      key={i}
                      href={"mailto: " + email}
                      onClick={function (e) {
                        e.stopPropagation();
                      }}
                    >
                      {email}
                    </a>
                  );
                })}
              </span>
            </div>
          ) : null}
          <div className="view-actions">
            {state.user.role === "admin" ? (
              <button
                className="display-member-button delete"
                onClick={function () {
                  handleDeleteMember(state.memberToBeDisplayed.id);
                }}
              >
                {t("DELETE")}
              </button>
            ) : null}
            <button className="display-member-button export-pdf" onClick={handleExportPDF} disabled={pdfExportStatus === "generating"}>
              {pdfExportStatus === "generating" ? t("exporting") : t("exportPDF")}
            </button>
            {state.user.role === "admin" && state.memberToBeDisplayed.gender === "M" ? (
              <button className="display-member-button add" onClick={handleAddMember}>
                {t("ADD_MEMBER")}
              </button>
            ) : null}
            {state.user.role === "admin" ? (
              <button className="display-member-button update" onClick={handleEditMember}>
                {t("UPDATE")}
              </button>
            ) : null}
            <button
              className="display-member-button cancel"
              onClick={function () {
                dispatch({ type: "closeMemberDisplay" });
              }}
            >
              {t("CANCEL")}
            </button>
          </div>
        </div>
      </div>
      <ConfirmModal isOpen={confirmOpen} onConfirm={handleConfirm} onCancel={handleCancel} message={t(confirmMessage)} confirmText={t("yes")} cancelText={t("no")} />
      <ImageCropModal isOpen={cropModalOpen} imageFile={selectedFile} onConfirm={handleCropConfirm} onCancel={handleCropCancel} isEnglish={isEnglish} />
    </div>
  );
};

export default DisplayMember;
