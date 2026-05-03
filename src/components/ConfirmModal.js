import React, { memo } from "react";
import Modal from "./Modal";

/**
 * ConfirmModal - A styled modal to replace native window.confirm() dialogs
 * Features: 0.7 opacity transparent background, 30vh height, 80vw width, 2px blur backdrop
 *
 * @param {boolean} isOpen - Whether the confirm dialog is shown
 * @param {function} onConfirm - Function to call when user confirms
 * @param {function} onCancel - Function to call when user cancels
 * @param {string} message - The confirmation message to display
 * @param {string} confirmText - Text for the confirm button (default: "OK")
 * @param {string} cancelText - Text for the cancel button (default: "Cancel")
 */
const ConfirmModal = memo(({ isOpen, onConfirm, onCancel, message, confirmText = "OK", cancelText = "Cancel" }) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} className="confirm-modal">
      <div className="modal-content">
        <p>{message}</p>
        <div className="confirm-buttons">
          <button className="confirm-button cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="confirm-button ok" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
});

ConfirmModal.displayName = "ConfirmModal";

export default ConfirmModal;
