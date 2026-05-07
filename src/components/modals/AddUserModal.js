import { useState, useEffect } from "react";
import useTranslation from "../../hooks/useTranslation";
import "./modals.css";

/**
 * Add User modal with form inputs
 * Styled consistently with ImageCropModal
 */
const AddUserModal = ({ isOpen, onConfirm, onCancel, isEnglish = true, error = false }) => {
  const { t } = useTranslation(isEnglish);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setUsername("");
      setPassword("");
      setRole("user");
      setIsProcessing(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!username || !password || !role) return;

    setIsProcessing(true);
    try {
      await onConfirm({ username, password, role });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setUsername("");
    setPassword("");
    setRole("user");
    onCancel();
  };

  const isFormValid = username.trim() !== "" && password.trim() !== "" && role !== "";

  if (!isOpen) return null;

  return (
    <div
      className="add-user-modal-overlay"
      onClick={(e) => {
        e.stopPropagation();
        handleCancel();
      }}
    >
      <div className="add-user-modal" onClick={(e) => e.stopPropagation()}>
        <div className="add-user-form">
          <div className="add-user-input-group">
            {/* <div>{t("Username")}</div> */}
            <input type="text" name="username" placeholder={t("Username")} value={username} onChange={(e) => setUsername(e.target.value)} disabled={isProcessing} autoFocus />
          </div>

          <div className="add-user-input-group">
            {/* <div>{t("Password")}</div> */}
            <input type="password" name="password" placeholder={t("Password")} value={password} onChange={(e) => setPassword(e.target.value)} disabled={isProcessing || username.trim() === ""} />
          </div>

          <div className="add-user-input-group">
            {/* <div>{t("Role")}</div> */}
            <select name="role" value={role} onChange={(e) => setRole(e.target.value)} disabled={isProcessing || password.trim() === ""}>
              <option value="user">{t("User")}</option>
              <option value="admin">{t("Admin")}</option>
            </select>
          </div>

          {error && <div className="add-user-error">{t("userExists")}</div>}
        </div>

        <div className="add-user-actions">
          <button className="add-user-cancel-btn" onClick={handleCancel} disabled={isProcessing}>
            {t("Cancel")}
          </button>
          <button className="add-user-confirm-btn" onClick={handleConfirm} disabled={isProcessing || !isFormValid}>
            {isProcessing ? t("processing") : t("ADD")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
