import { useState } from "react";
import CloseIcon from '../../images/close.png';
import DeleteIcon from '../../images/delete.png';
import './DisplayUsers.css';

const DisplayUsers = ({state, dispatch}) => {
	const [newUser, setNewUser] = useState({
		username: '',
		password: '',
		error: false
	});
	const handleClose = () => {
		setNewUser({username: '', password: '', error: false}); 
		dispatch({type: 'closeUserEdit'});
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
	}
	const handleDeleteUser = async (username) => {
		const response = await fetch('http://115.117.107.101:27001/deleteUser', {
		method: 'post',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username: username })})
		const data = await response.json();
		if (data.result === 'success') {
			dispatch({type: 'deleteUser', username: username});
		}
	}
	return (
		<div className='display-users' style={{display: state.isUserEditOpen ? 'flex' : 'none'}}>
			<div className='view'>
				<img src={CloseIcon} alt='close' className='close' onClick={() => handleClose()} />
				<div className='user-inputs'>
					<input name='username' placeholder='username' type='text' value={newUser.username} onChange={(e) => setNewUser({...newUser, [e.target.name]: e.target.value})} />
					<input disabled={newUser.username === ''} name='password' placeholder='password' type='password' value={newUser.password} onChange={(e) => setNewUser({...newUser, [e.target.name]: e.target.value})} />
				</div>
				<button disabled={newUser.password === ''} onClick={() => handleAddUser()}>Add User</button>
				{newUser.error && <div style={{color: 'red'}}>user already exists !</div>}
				<table>
					<tbody>
						{state.users.map((user, i) => <tr key={i}>
							<td>{user.username}</td>
							<td>{user.password}</td>
							<td><img className="icons" src={DeleteIcon} alt="delete" onClick={() => handleDeleteUser(user.username)} /></td>
						</tr>)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default DisplayUsers;