import React, { memo } from "react";
import "./modals.css";

/**
 * Reusable Modal component
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Function to call when modal is closed
 * @param {React.ReactNode} children - Content to display in the modal
 * @param {string} className - Additional CSS classes for the modal
 */
const Modal = memo(({ isOpen, onClose, children, className = "" }) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div className={`modal ${className}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
});

Modal.displayName = "Modal";

export default Modal;
