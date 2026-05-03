import CloseIcon from "../../images/close.png";
import DeleteIcon from "../../images/delete.png";
import AddIcon from "../../images/add.png";
import MinusIcon from "../../images/minus.png";
import ConfirmModal from "../../components/ConfirmModal";
import api from "../../utils/api";
import useTranslation from "../../hooks/useTranslation";
import useConfirm from "../../hooks/useConfirm";
import "./DisplayUsers.css";

const DisplayUsers = ({ state, dispatch }) => {
  const isEnglish = state.user.language;
  const { t } = useTranslation(isEnglish);
  const { isOpen: confirmOpen, message: confirmMessage, showConfirm, handleConfirm, handleCancel } = useConfirm();

  const handleClose = () => {
    dispatch({ type: "closeUserEdit" });
  };

  const handleAddUser = async () => {
    const confirmMsg = t("confirmAddUser");

    if (!(await showConfirm(confirmMsg))) return;

    const data = await api.addUser(state.newUser.username, state.newUser.password, state.newUser.role);
    if (data.result === "success") {
      dispatch({ type: "addNewUser", newUser: state.editInputNewUser });
    } else if (data.result === "duplicate") {
      dispatch({ type: "editInputNewUser", newUser: { ...state.newUser, error: true } });
    }
  };

  const handleDeleteUser = async (username) => {
    const confirmMsg = t("confirmDeleteUser");

    if (!(await showConfirm(confirmMsg))) return;

    const data = await api.deleteUser(username);
    if (data.result === "success") {
      dispatch({ type: "deleteUser", username: username });
    }
  };

  return (
    <div className="display-users" style={{ display: state.isUserEditOpen ? "flex" : "none" }}>
      <img src={CloseIcon} alt="close" className="close" onClick={handleClose} loading="lazy" />
      <div className="view">
        <div className="new-user" onClick={() => dispatch({ type: state.isUserAddOpen ? "closeAddNewUser" : "openAddNewUser" })}>
          <div>{state.isUserAddOpen ? t("cancelAddUser") : t("openToAddUser")}</div>
          <img className="icons" src={state.isUserAddOpen ? MinusIcon : AddIcon} alt={state.isUserAddOpen ? "close" : "open"} loading="lazy" />
        </div>

        <div className="user-inputs" style={{ display: state.isUserAddOpen ? "flex" : "none" }}>
          <input name="username" placeholder={t("Username")} type="text" value={state.newUser.username} onChange={(e) => dispatch({ type: "editInputNewUser", attribute: e.target.name, value: e.target.value })} />
          <input disabled={state.newUser.username === ""} name="password" placeholder={t("Password")} type="password" value={state.newUser.password} onChange={(e) => dispatch({ type: "editInputNewUser", attribute: e.target.name, value: e.target.value })} />
          <select disabled={state.newUser.password === ""} name="role" value={state.newUser.role} onChange={(e) => dispatch({ type: "editInputNewUser", attribute: e.target.name, value: e.target.value })}>
            <option value="user">{t("User")}</option>
            <option value="admin">{t("Admin")}</option>
          </select>
          <button disabled={state.newUser.password === "" || state.newUser.role === ""} onClick={handleAddUser}>
            {t("ADD")}
          </button>
        </div>

        {state.newUser.error && <div style={{ color: "red" }}>{t("userExists")}</div>}

        <table>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>{t("Username")}</th>
              <th style={{ textAlign: "left" }}>{t("Password")}</th>
              <th></th>
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
      <ConfirmModal isOpen={confirmOpen} onConfirm={handleConfirm} onCancel={handleCancel} message={confirmMessage} confirmText={t("yes")} cancelText={t("no")} />
    </div>
  );
};

export default DisplayUsers;
