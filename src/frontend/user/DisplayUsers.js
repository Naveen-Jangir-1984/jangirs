import { useState } from "react";
import CloseIcon from '../../images/close.png';
import DeleteIcon from '../../images/delete.png';
import './DisplayUsers.css';

const DisplayUsers = ({state, dispatch}) => {
	const [displayAddUser, setDisplayAddUser] = useState(false);
	const [newUser, setNewUser] = useState({
		username: '',
		password: '',
		role: 'user',
		error: false
	});
	const handleClose = () => {
		setNewUser({username: '', password: '', role: 'user', error: false}); 
		dispatch({type: 'closeUserEdit'});
		setDisplayAddUser(false);
	}
	const handleAddUser = async () => {
		const response = await fetch(`${process.env.REACT_APP_API_URL}/addNewUser`, {
		method: 'post',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username: newUser.username, password: newUser.password, role: newUser.role })})
		const data = await response.json();
		if (data.result === 'success') {
			dispatch({type: 'addNewUser', newUser: newUser});
			setNewUser({ username: '', password: '', role: 'user', error: false });
		} else if(data.result === 'duplicate') {
			setNewUser({ ...newUser, error: true });
		}
		setDisplayAddUser(false);
	}
	const handleDeleteUser = async (username) => {
		const consent = window.confirm('Are you sure you want to delete this user ?');
		if (consent) {
			const response = await fetch(`${process.env.REACT_APP_API_URL}/deleteUser`, {
			method: 'post',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username: username })})
			const data = await response.json();
			if (data.result === 'success') {
				dispatch({type: 'deleteUser', username: username});
			}
			setDisplayAddUser(false);
		}
	}
	return (
		<div className='display-users' style={{display: state.isUserEditOpen ? 'flex' : 'none'}}>
			<img src={CloseIcon} alt='close' className='close' onClick={() => handleClose()} />
			<div className='view'>
				<div style={{textDecoration: 'underline', fontSize: '14px'}} onClick={() => setDisplayAddUser(!displayAddUser)}>{`Click to ${displayAddUser ? 'close' : 'open'} Add User`}</div>
				<div className='user-inputs' style={{display: displayAddUser ? 'flex' : 'none'}}>
					<input name='username' placeholder='Username (mandatory)' type='text' value={newUser.username} onChange={(e) => setNewUser({...newUser, [e.target.name]: e.target.value})} />
					<input disabled={newUser.username === ''} name='password' placeholder='Password (mandatory)' type='password' value={newUser.password} onChange={(e) => setNewUser({...newUser, [e.target.name]: e.target.value})} />
					<select disabled={newUser.password === ''} name='role' value={newUser.role} onChange={(e) => setNewUser({...newUser, [e.target.name]: e.target.value})}>
						<option value='user'>User</option>
						<option value='admin'>Admin</option>
					</select>
					<button disabled={newUser.password === '' || newUser.role === ''} onClick={() => handleAddUser()}>ADD</button>
				</div>
				{newUser.error && <div style={{color: 'red'}}>user already exists !</div>}
				<table>
					<thead>
						<tr>
							<th style={{textAlign: 'left'}}>Username</th>
							<th style={{textAlign: 'left'}}>Password</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{state.users.map((user, i) => <tr key={i}>
							<td style={{
								color: user.role === 'admin' ? 'red' : 'black',
								fontWeight: user.role === 'admin' ? 'bold' : 'normal'
							 }}>{user.username}</td>
							<td>{user.password}</td>
							<td style={{textAlign: 'right'}}>
								{state.user.username !== user.username && <img className="icons" src={DeleteIcon} alt="delete" onClick={() => handleDeleteUser(user.username)} />}
							</td>
						</tr>)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default DisplayUsers;