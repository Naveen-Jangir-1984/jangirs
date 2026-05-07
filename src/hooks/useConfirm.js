import { useState, useCallback, useRef } from "react";

/**
 * Custom hook to manage confirm modal state
 * Use this as a drop-in replacement for window.confirm()
 *
 * @returns {object} { isOpen, message, showConfirm, handleConfirm, handleCancel }
 *
 * @example
 * const { isOpen, message, showConfirm, handleConfirm, handleCancel } = useConfirm();
 * const { t } = useTranslation(isEnglish);
 *
 * // Instead of: if (!window.confirm("Are you sure?")) return;
 * // Use: const confirmed = await showConfirm("confirmKey"); // Pass translation KEY, not translated text
 * //      if (!confirmed) return;
 *
 * return (
 *   <>
 *     <ConfirmModal
 *       isOpen={isOpen}
 *       onConfirm={handleConfirm}
 *       onCancel={handleCancel}
 *       message={t(message)} // Translate at render time so language changes work
 *     />
 *     <button onClick={async () => {
 *       const confirmed = await showConfirm("confirmDeleteItem"); // Pass key, not t("confirmDeleteItem")
 *       if (confirmed) deleteItem();
 *     }}>Delete</button>
 *   </>
 * );
 */
const useConfirm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messageParams, setMessageParams] = useState({});
  const resolveRef = useRef(null);

  const showConfirm = useCallback((msg, params = {}) => {
    return new Promise((resolve) => {
      setMessage(msg);
      setMessageParams(params);
      setIsOpen(true);
      resolveRef.current = resolve;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    setMessage("");
    setMessageParams({});
    if (resolveRef.current) {
      resolveRef.current(true);
      resolveRef.current = null;
    }
  }, []);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    setMessage("");
    setMessageParams({});
    if (resolveRef.current) {
      resolveRef.current(false);
      resolveRef.current = null;
    }
  }, []);

  return {
    isOpen,
    message,
    messageParams,
    showConfirm,
    handleConfirm,
    handleCancel,
  };
};

export default useConfirm;
