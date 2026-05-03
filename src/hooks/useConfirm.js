import { useState, useCallback, useRef } from "react";

/**
 * Custom hook to manage confirm modal state
 * Use this as a drop-in replacement for window.confirm()
 *
 * @returns {object} { isOpen, message, showConfirm, handleConfirm, handleCancel }
 *
 * @example
 * const { isOpen, message, showConfirm, handleConfirm, handleCancel } = useConfirm();
 *
 * // Instead of: if (!window.confirm("Are you sure?")) return;
 * // Use: const confirmed = await showConfirm("Are you sure?");
 * //      if (!confirmed) return;
 *
 * return (
 *   <>
 *     <ConfirmModal
 *       isOpen={isOpen}
 *       onConfirm={handleConfirm}
 *       onCancel={handleCancel}
 *       message={message}
 *     />
 *     <button onClick={async () => {
 *       const confirmed = await showConfirm("Delete this item?");
 *       if (confirmed) deleteItem();
 *     }}>Delete</button>
 *   </>
 * );
 */
const useConfirm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const resolveRef = useRef(null);

  const showConfirm = useCallback((msg) => {
    return new Promise((resolve) => {
      setMessage(msg);
      setIsOpen(true);
      resolveRef.current = resolve;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    setMessage("");
    if (resolveRef.current) {
      resolveRef.current(true);
      resolveRef.current = null;
    }
  }, []);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    setMessage("");
    if (resolveRef.current) {
      resolveRef.current(false);
      resolveRef.current = null;
    }
  }, []);

  return {
    isOpen,
    message,
    showConfirm,
    handleConfirm,
    handleCancel,
  };
};

export default useConfirm;
