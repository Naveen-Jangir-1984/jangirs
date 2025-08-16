import CloseIcon from "../../images/close.png";
import DeleteIcon from "../../images/delete.png";
import AddIcon from "../../images/add.png";
import MinusIcon from "../../images/minus.png";
import "./DisplayUsers.css";
const URL = process.env.REACT_APP_API_URL;
const PORT = process.env.REACT_APP_PORT;

const DisplayUsers = ({ state, dispatch }) => {
  const handleClose = () => {
    dispatch({ type: "closeUserEdit" });
  };
  const handleAddUser = async () => {
    const consent = window.confirm(state.user.language ? "Are you sure you want to add the user?" : "क्या आप वाकई उपयोगकर्ता को जोड़ना चाहते हैं?");
    if (consent) {
      const response = await fetch(`${URL}:${PORT}/addNewUser`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: state.newUser.username, password: state.newUser.password, role: state.newUser.role }),
      });
      const data = await response.json();
      if (data.result === "success") {
        dispatch({ type: "addNewUser", newUser: state.editInputNewUser });
      } else if (data.result === "duplicate") {
        dispatch({ type: "editInputNewUser", newUser: { ...state.newUser, error: true } });
      }
    }
  };
  const handleDeleteUser = async (username) => {
    const consent = window.confirm(state.user.language ? "Are you sure you want to delete the user?" : "क्या आप वाकई उपयोगकर्ता को हटाना चाहते हैं?");
    if (consent) {
      const response = await fetch(`${URL}:${PORT}/deleteUser`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username }),
      });
      const data = await response.json();
      if (data.result === "success") {
        dispatch({ type: "deleteUser", username: username });
      }
    }
  };
  return (
    <div className="display-users" style={{ display: state.isUserEditOpen ? "flex" : "none" }}>
      <img src={CloseIcon} alt="close" className="close" onClick={() => handleClose()} loading="lazy" />
      <div className="view">
        <div className="new-user" onClick={() => dispatch({ type: state.isUserAddOpen ? "closeAddNewUser" : "openAddNewUser" })}>
          <div>{state.user.language ? `${state.isUserAddOpen ? "Cancel" : "Open"} to Add User` : `${state.isUserAddOpen ? "उपभोक्ता जोड़ना रद्द करें" : "उपयोगकर्ता जोड़ने के लिए खोलें"}`}</div>
          <img className="icons" src={state.isUserAddOpen ? MinusIcon : AddIcon} alt={state.isUserAddOpen ? "close" : "open"} loading="lazy" />
        </div>
        <div className="user-inputs" style={{ display: state.isUserAddOpen ? "flex" : "none" }}>
          <input name="username" placeholder={state.user.language ? "Username" : "उपयोगकर्ता नाम"} type="text" value={state.newUser.username} onChange={(e) => dispatch({ type: "editInputNewUser", attribute: e.target.name, value: e.target.value })} />
          <input disabled={state.newUser.username === ""} name="password" placeholder={state.user.language ? "Password" : "पासवर्ड"} type="password" value={state.newUser.password} onChange={(e) => dispatch({ type: "editInputNewUser", attribute: e.target.name, value: e.target.value })} />
          <select disabled={state.newUser.password === ""} name="role" value={state.newUser.role} onChange={(e) => dispatch({ type: "editInputNewUser", attribute: e.target.name, value: e.target.value })}>
            <option value="user">{state.user.language ? "User" : "उपयोगकर्ता"}</option>
            <option value="admin">{state.user.language ? "User" : "व्यवस्थापक"}</option>
          </select>
          <button disabled={state.newUser.password === "" || state.newUser.role === ""} onClick={() => handleAddUser()}>
            {state.user.language ? "ADD" : "जोड़ें"}
          </button>
        </div>
        {state.newUser.error && <div style={{ color: "red" }}>{state.user.language ? "User already exists !" : "उपयोगकर्ता पहले से मौजूद है !"}</div>}
        <table>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>{state.user.language ? "Username" : "उपयोगकर्ता"}</th>
              <th style={{ textAlign: "left" }}>{state.user.language ? "Password" : "पासवर्ड"}</th>
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
    </div>
  );
};

export default DisplayUsers;
