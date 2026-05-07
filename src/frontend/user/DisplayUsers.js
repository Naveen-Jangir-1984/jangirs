import { DeleteIcon } from "../../utils/imageConstants";
import { ConfirmModal, AddUserModal } from "../../components/modals";
import api from "../../utils/api";
import useTranslation from "../../hooks/useTranslation";
import useConfirm from "../../hooks/useConfirm";
import "./DisplayUsers.css";

const DisplayUsers = ({ state, dispatch }) => {
  const isEnglish = state.user.language;
  const { t } = useTranslation(isEnglish);
  const { isOpen: confirmOpen, message: confirmMessage, messageParams: confirmParams, showConfirm, handleConfirm, handleCancel } = useConfirm();

  // Translate params at render time so language changes update properly
  const translatedParams = confirmParams.role ? { ...confirmParams, role: t(confirmParams.role) } : confirmParams;

  const handleClose = () => {
    // Close layer by layer - only close DisplayUsers if no child modals are open
    if (state.isUserAddOpen) {
      dispatch({ type: "closeAddNewUser" });
    } else if (!confirmOpen) {
      dispatch({ type: "closeUserEdit" });
    }
  };

  const handleAddUser = async ({ username, password, role }) => {
    const roleKey = role.charAt(0).toUpperCase() + role.slice(1);
    if (!(await showConfirm("confirmAddUser", { role: roleKey }))) return;

    const data = await api.addUser(username, password, role);
    if (data.result === "success") {
      dispatch({ type: "addNewUser", newUser: { username, password, role } });
    } else if (data.result === "duplicate") {
      dispatch({ type: "editInputNewUser", newUser: { username, password, role, error: true } });
    }
  };

  const handleCancelAddUser = () => {
    dispatch({ type: "closeAddNewUser" });
  };

  const handleDeleteUser = async (username) => {
    if (!(await showConfirm("confirmDeleteUser"))) return;

    const data = await api.deleteUser(username);
    if (data.result === "success") {
      dispatch({ type: "deleteUser", username: username });
    }
  };

  return (
    <div className="display-users" style={{ display: state.isUserEditOpen ? "flex" : "none" }} onClick={handleClose}>
      <div className="users-container" onClick={(e) => e.stopPropagation()}>
        <div className="view">
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: "left", width: "50%" }}>{t("User")}</th>
                <th style={{ textAlign: "left", width: "45%" }}>{t("Password")}</th>
                <th style={{ width: "5%" }}></th>
              </tr>
            </thead>
            <tbody>
              {state.users.map((user, i) => (
                <tr key={i}>
                  <td
                    style={{
                      color: user.role === "admin" ? "red" : "black",
                      fontWeight: user.role === "admin" ? "bold" : "normal",
                    }}
                  >
                    {user.username}
                  </td>
                  <td>{user.password}</td>
                  <td style={{ textAlign: "right" }}>{state.user.username !== user.username && <img className="icons" src={DeleteIcon} alt="delete" onClick={() => handleDeleteUser(user.username)} loading="lazy" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="view-actions">
          <button className="display-user-button cancel" onClick={handleClose}>
            {t("CANCEL")}
          </button>
          <button className="display-user-button add" onClick={() => dispatch({ type: "openAddNewUser" })}>
            {t("ADD")}
          </button>
        </div>
      </div>
      <AddUserModal isOpen={state.isUserAddOpen} onConfirm={handleAddUser} onCancel={handleCancelAddUser} isEnglish={isEnglish} error={state.newUser?.error} />
      <ConfirmModal isOpen={confirmOpen} onConfirm={handleConfirm} onCancel={handleCancel} message={t(confirmMessage, translatedParams)} confirmText={t("yes")} cancelText={t("no")} />
    </div>
  );
};

export default DisplayUsers;
