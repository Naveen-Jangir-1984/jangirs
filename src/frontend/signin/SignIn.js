import { useState } from "react";
import './SignIn.css'

const SignIn = ({ state, dispatch }) => {
  const [input, setInput] = useState({
    username: '',
    password: ''
  })
  return (
    <div>
      <div className='signin'>
        {/* <select name='username' value={ input.username } onChange={(e) => setInput({ ...input, [e.target.name]: e.target.value })}>
          <option value=''>-- name --</option>
          { state.users.map((user, i) => <option key={i} value={user.username}>{user.firstname}</option>) }
        </select> */}
        <input 
          name='username' 
          value={ input.username } 
          placeholder='username' 
          onChange={(e) => setInput({ ...input, [e.target.name]: e.target.value })}
        />
        <input 
          name='password' 
          disabled={ input.username === '' }
          value={ input.password } 
          placeholder='password' 
          onChange={(e) => setInput({ ...input, [e.target.name]: e.target.value })}
        />
        <button 
          disabled={ input.username === '' || input.password === '' }
          onClick={() => dispatch({ type: 'signin', input: input })}
        >sign in</button>
      </div>
    </div>
  );
}

export default SignIn;