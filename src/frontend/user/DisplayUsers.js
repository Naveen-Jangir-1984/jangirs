import { useState } from "react";
import CloseIcon from '../../images/close.png';
import DeleteIcon from '../../images/delete.png';
import './DisplayUsers.css';

const DisplayUsers = ({state, dispatch}) => {
	const [displayAddUser, setDisplayAddUser] = useState(false);
	const [newUser, setNewUser] = useState({
		username: '',
		password: '',
		error: false
	});
	const handleClose = () => {
		setNewUser({username: '', password: '', error: false}); 
		dispatch({type: 'closeUserEdit'});
		setDisplayAddUser(false);
	}
	const handleAddUser = async () => {
		const response = await fetch('http://115.117.107.101:27001/addNewUser', {
		method: 'post',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username: newUser.username, password: newUser.password })})
		const data = await response.json();
		if (data.result === 'success') {
			dispatch({type: 'addNewUser', newUser: newUser});
			setNewUser({ username: '', password: '', error: false });
		} else if(data.result === 'duplicate') {
			setNewUser({ ...newUser, error: true });
		}
		setDisplayAddUser(false);
	}
	const handleDeleteUser = async (username) => {
		const consent = window.confirm('Are you sure you want to delete this user ?');
		if (consent) {
			const response = await fetch('http://115.117.107.101:27001/deleteUser', {
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
							<td>{user.username}</td>
							<td>{user.password}</td>
							<td style={{textAlign: 'right'}}><img className="icons" src={DeleteIcon} alt="delete" onClick={() => handleDeleteUser(user.username)} /></td>
						</tr>)}
					</tbody>
				</table>
				<div style={{textDecoration: 'underline', fontSize: '12px'}} onClick={() => setDisplayAddUser(!displayAddUser)}>{`Click to ${displayAddUser ? 'close' : 'open'} Add User`}</div>
				<div className='user-inputs' style={{display: displayAddUser ? 'flex' : 'none'}}>
					<input name='username' placeholder='username' type='text' value={newUser.username} onChange={(e) => setNewUser({...newUser, [e.target.name]: e.target.value})} />
					<input disabled={newUser.username === ''} name='password' placeholder='password' type='password' value={newUser.password} onChange={(e) => setNewUser({...newUser, [e.target.name]: e.target.value})} />
					<button disabled={newUser.password === ''} onClick={() => handleAddUser()}>ADD</button>
				</div>
				{newUser.error && <div style={{color: 'red'}}>user already exists !</div>}
			</div>
		</div>
	);
}

export default DisplayUsers;