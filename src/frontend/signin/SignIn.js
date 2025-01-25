import './SignIn.css'

const SignIn = ({ state, dispatch }) => {
  const input = state.input  
  return (
    <div>
      <div className='signin'>
        <select name='username' value={input.username} onChange={(e) => dispatch({type: 'input', attribute: e.target.name, value: e.target.value })}>
          {state.users.map((user, i) => <option key={i} value={user.username}>{user.username}</option>)}
        </select>
        <input 
          name='password'
          type='password'
          disabled={input.username === ''}
          value={input.password} 
          placeholder='password' 
          onChange={(e) => dispatch({type: 'input', attribute: e.target.name, value: e.target.value })}
        />
        <button 
          disabled={input.username === '' || input.password === ''}
          onClick={() => dispatch({ type: 'signin'})}
        >Sign In</button>
        {input.error && <div style={{color: 'red'}}>incorrect username or password !</div>}
      </div>
    </div>
  );
}

export default SignIn;