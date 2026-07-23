import "./SignIn.css";
import Loader from "../../components/Loader";
import SignInSkeleton from "../../components/skeleton/SignInSkeleton";

const SignIn = ({ state, dispatch }) => {
  const input = state.input;
  const current = new Date().toISOString().split("T")[0];
  return (
    <div>
      <div className="signin">
        <Loader loading={!state.users || state.users.length === 0} loadingMessage="Loading users..." skeleton={<SignInSkeleton />}>
          <select name="username" value={input.username} onChange={(e) => dispatch({ type: "input", attribute: e.target.name, value: e.target.value })}>
            <option value="">Select User</option>
            {state.users.map((user, i) => (
              <option key={i} value={user.username}>
                {user.username}
              </option>
            ))}
          </select>
          <input name="password" type="password" disabled={input.username === ""} value={input.password} placeholder="Password" onChange={(e) => dispatch({ type: "input", attribute: e.target.name, value: e.target.value })} />
          <button disabled={input.username === "" || input.password === ""} onClick={() => dispatch({ type: "signin" })}>
            SIGN IN
          </button>
          {input.error && <div style={{ color: "red", fontSize: "12px" }}>Incorrect username or password !</div>}
          <div>{`Visits: ${state.visitors.length} | Today ${state.visitors.filter((visitor) => visitor.includes(current)).length}`}</div>
        </Loader>
      </div>
    </div>
  );
};

export default SignIn;
