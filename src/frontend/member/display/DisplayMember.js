import { useState, useRef } from "react";
import { CloseIcon, MaleProfileIcon as MaleProfileImage, FemaleProfileIcon as FemaleProfileImage, MobileIcon, EmailIcon, UploadIcon, DeleteIcon } from "../../../utils/imageConstants";
import { MONTHS } from "../../../utils/constants";
import api from "../../../utils/api";
import { fetchMemberImages } from "../../../utils/getImages";
import useTranslation from "../../../hooks/useTranslation";
import useConfirm from "../../../hooks/useConfirm";
import ConfirmModal from "../../../components/ConfirmModal";
import ImageCropModal from "../../../components/ImageCropModal";
import "./DisplayMember.css";

const DisplayMember = ({ state, dispatch, getHindiText, getHindiNumbers }) => {
  const isEnglish = state.user.language;
  const { t } = useTranslation(isEnglish);
  const { isOpen: confirmOpen, message: confirmMessage, showConfirm, handleConfirm, handleCancel } = useConfirm();
  const memberImage = state.images.find((image) => image.id === state.memberToBeDisplayed.id);

  // Photo upload state
  const [uploadStatus, setUploadStatus] = useState(""); // "uploading", "success", "error", ""
  const [uploadMessage, setUploadMessage] = useState("");
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Handle file selection - opens crop modal
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setUploadStatus("error");
      setUploadMessage(t("invalidFileType") || "Invalid file type. Please upload JPEG, PNG, or WebP.");
      setTimeout(() => {
        setUploadStatus("");
        setUploadMessage("");
      }, 3000);
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setUploadStatus("error");
      setUploadMessage(t("fileTooLarge") || "File is too large. Maximum size is 50MB.");
      setTimeout(() => {
        setUploadStatus("");
        setUploadMessage("");
      }, 3000);
      return;
    }

    // Open crop modal
    setSelectedFile(file);
    setCropModalOpen(true);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle crop confirmation - upload the cropped image
  const handleCropConfirm = async (croppedBlob) => {
    setCropModalOpen(false);
    setSelectedFile(null);

    setUploadStatus("uploading");
    setUploadMessage(t("uploadingPhoto") || "Uploading photo...");

    try {
      // Create a File from the blob
      const croppedFile = new File([croppedBlob], "photo.jpg", { type: "image/jpeg" });
      const result = await api.uploadCroppedPhoto(state.memberToBeDisplayed.id, croppedFile);

      if (result.result === "success") {
        setUploadStatus("success");
        setUploadMessage(t("photoUploaded") || "Photo uploaded successfully!");

        // Refresh images from server and update state
        const updatedImages = await fetchMemberImages();
        dispatch({ type: "updateImages", images: updatedImages });

        // Clear status after 3 seconds
        setTimeout(() => {
          setUploadStatus("");
          setUploadMessage("");
        }, 3000);
      } else {
        setUploadStatus("error");
        setUploadMessage(result.message || t("uploadFailed") || "Upload failed. Please try again.");
      }
    } catch (error) {
      setUploadStatus("error");
      setUploadMessage(error.message || t("uploadError") || "An error occurred during upload.");
    }
  };

  // Handle crop cancel
  const handleCropCancel = () => {
    setCropModalOpen(false);
    setSelectedFile(null);
  };

  // Handle photo deletion
  const handlePhotoDelete = async () => {
    const confirmMsg = t("confirm delete photo") || "Are you sure you want to delete this photo?";

    if (!(await showConfirm(confirmMsg))) return;

    setUploadStatus("uploading");
    setUploadMessage(t("deletingPhoto") || "Deleting photo...");

    try {
      const result = await api.deletePhoto(state.memberToBeDisplayed.id);

      if (result.result === "success") {
        setUploadStatus("success");
        setUploadMessage(t("photoDeleted") || "Photo deleted successfully!");

        // Refresh images from server and update state
        const updatedImages = await fetchMemberImages();
        dispatch({ type: "updateImages", images: updatedImages });

        // Clear status after 3 seconds
        setTimeout(() => {
          setUploadStatus("");
          setUploadMessage("");
        }, 3000);
      } else {
        setUploadStatus("error");
        setUploadMessage(result.message || t("deleteFailed") || "Delete failed. Please try again.");
      }
    } catch (error) {
      setUploadStatus("error");
      setUploadMessage(error.message || t("deleteError") || "An error occurred during deletion.");
    }
  };
  const memberDOB = state.memberToBeDisplayed.dob || "";
  const memberDOD = state.memberToBeDisplayed.dod || "";
  const memberMobiles = state.memberToBeDisplayed.mobile || [];
  const memberEmails = state.memberToBeDisplayed.email || [];

  // Calculate age helper
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

  const handleAddMember = () => {
    dispatch({ type: "openMemberAdd", member: state.memberToBeDisplayed });
  };

  const handleEditMember = () => {
    dispatch({ type: "openMemberEdit", member: state.memberToBeDisplayed });
  };

  const handleDeleteMember = async (id) => {
    const confirmMsg = t("confirmDeleteMember");

    if (!(await showConfirm(confirmMsg))) return;

    const data = await api.deleteMember(id, state.village);
    if (data.result === "success") {
      dispatch({ type: "deleteMember", id: id });
    }
  };

  return (
    <div className="details" style={{ display: state.isMemberDisplayOpen ? "flex" : "none", filter: state.isMemberEditOpen ? "blur(20px)" : "none" }}>
      <img src={CloseIcon} alt="close" className="close" onClick={() => dispatch({ type: "closeMemberDisplay" })} loading="lazy" />
      <div className="view">
        <div className="profile-image-container">
          <img style={{ boxShadow: state.memberToBeDisplayed.isAlive ? "0 0 50px lightgreen" : "0 0 50px #f55" }} src={memberImage ? memberImage.src : state.memberToBeDisplayed.gender === "M" ? MaleProfileImage : FemaleProfileImage} alt={state.memberToBeDisplayed.name} loading="lazy" />
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
            <div className={`upload-status ${uploadStatus}`}>
              {uploadStatus === "uploading" && <span className="spinner"></span>}
              <span>{uploadMessage}</span>
            </div>
          )}
        </div>
        <div className="info">
          <div>
            {isEnglish ? state.memberToBeDisplayed.name : getHindiText(state.memberToBeDisplayed.name, "name")}{" "}
            {memberDOB && isEnglish ? (
              <sup>
                {t("Age")}{" "}
                {(() => {
                  const age = getAge(memberDOB, memberDOD);
                  const parts = [];
                  if (age.years > 0) parts.push(age.years + " " + t("years"));
                  if (age.months > 0) parts.push(age.months + " " + t("months"));
                  if (age.days > 0) parts.push(age.days + " " + t("days"));
                  return parts.join(" ");
                })()}
              </sup>
            ) : memberDOB && !isEnglish ? (
              <sup>
                {t("Age")}{" "}
                {(() => {
                  const age = getAge(memberDOB, memberDOD);
                  const parts = [];
                  if (age.years > 0) parts.push(getHindiNumbers(age.years.toString()) + " " + t("years"));
                  if (age.months > 0) parts.push(getHindiNumbers(age.months.toString()) + " " + t("months"));
                  if (age.days > 0) parts.push(getHindiNumbers(age.days.toString()) + " " + t("days"));
                  return parts.join(" ");
                })()}
              </sup>
            ) : (
              ""
            )}
          </div>
          {memberDOB && !isEnglish ? (
            <div className="dob">
              {/* <img className='icons' src={DOBIcon} alt='birth' loading='lazy' /> */}
              <span style={{ fontWeight: "bolder" }}>{t("Birth")}</span>
              <span>{`${getHindiNumbers(memberDOB.split(" ")[0])} ${getHindiText(memberDOB.split(" ")[1], "months")} ${getHindiNumbers(memberDOB.split(" ")[2])}`}</span>
            </div>
          ) : memberDOB && isEnglish ? (
            <div className="dob">
              {/* <img className='icons' src={DOBIcon} alt='birth' loading='lazy' /> */}
              <span style={{ fontWeight: "bolder" }}>{t("Birth")}</span>
              <span>{memberDOB}</span>
            </div>
          ) : (
            ""
          )}
          {memberDOD && !isEnglish ? (
            <div className="dod">
              {/* <img className='icons' src={DODIcon} alt='death' loading='lazy' /> */}
              <span style={{ fontWeight: "bolder" }}>{t("Death")}</span>
              <span>{`${getHindiNumbers(memberDOD.split(" ")[0])} ${getHindiText(memberDOD.split(" ")[1], "months")} ${getHindiNumbers(memberDOD.split(" ")[2])}`}</span>
            </div>
          ) : memberDOD && isEnglish ? (
            <div className="dod">
              {/* <img className='icons' src={DODIcon} alt='death' loading='lazy' /> */}
              <span style={{ fontWeight: "bolder" }}>{t("Death")}</span>
              <span>{memberDOD}</span>
            </div>
          ) : (
            ""
          )}
          {memberMobiles.length ? (
            <div className="view-mobile">
              <img className="icons" src={MobileIcon} alt="mobile" loading="lazy" />
              <span className="view-mobile">
                {memberMobiles.map((mobile, i) => (
                  <a key={i} href={`tel: ${mobile}`} onClick={(e) => e.stopPropagation()}>
                    {mobile}
                  </a>
                ))}
              </span>
            </div>
          ) : (
            ""
          )}
          {memberEmails.length ? (
            <div className="view-email">
              <img className="icons" src={EmailIcon} alt="email" loading="lazy" />
              <span className="view-email">
                {memberEmails.map((email, i) => (
                  <a key={i} href={`mailto: ${email}`} onClick={(e) => e.stopPropagation()}>
                    {email}
                  </a>
                ))}
              </span>
            </div>
          ) : (
            ""
          )}
          <div className="view-actions">
            {state.user.role === "admin" && state.memberToBeDisplayed.gender === "M" ? <button onClick={() => handleAddMember()}>{t("ADD_MEMBER")}</button> : ""}
            {state.user.role === "admin" ? <button onClick={() => handleEditMember()}>{t("UPDATE")}</button> : ""}
            {state.user.role === "admin" ? <button onClick={() => handleDeleteMember(state.memberToBeDisplayed.id)}>{t("DELETE")}</button> : ""}
          </div>
        </div>
      </div>
      <ConfirmModal isOpen={confirmOpen} onConfirm={handleConfirm} onCancel={handleCancel} message={confirmMessage} confirmText={t("yes")} cancelText={t("no")} />
      <ImageCropModal isOpen={cropModalOpen} imageFile={selectedFile} onConfirm={handleCropConfirm} onCancel={handleCropCancel} isEnglish={isEnglish} />
    </div>
  );
};

export default DisplayMember;
