import { useState } from "react";
import CloseIcon from '../../images/close.png';
import DeleteIcon from '../../images/delete.png';
import './DisplayUsers.css';
const URL = process.env.REACT_APP_API_URL;
const PORT = process.env.REACT_APP_PORT;

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
	const handleAddNewUser = () => {
		setNewUser({username: '', password: '', role: 'user', error: false});
		setDisplayAddUser(!displayAddUser);
	}
	const handleAddUser = async () => {
		const consent = window.confirm(state.user.language ? 'Are you sure you want to add the user?' : 'क्या आप वाकई इस उपयोगकर्ता को जोड़ना चाहते हैं?');
		if(consent) {
			const response = await fetch(`${URL}:${PORT}/addNewUser`, {
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
	}
	const handleDeleteUser = async (username) => {
		const consent = window.confirm(state.user.language ? 'Are you sure you want to delete the user?' : 'क्या आप वाकई इस उपयोगकर्ता को हटाना चाहते हैं?');
		if (consent) {
			const response = await fetch(`${URL}:${PORT}/deleteUser`, {
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
				<div style={{textDecoration: 'underline', fontSize: '14px'}} onClick={() => handleAddNewUser()}>{state.user.language ? `${displayAddUser ? 'Close' : 'Open'} Add User Panel` : `${displayAddUser ? 'बंद करें' : 'उपयोगकर्ता जोड़ें'}`}</div>
				<div className='user-inputs' style={{display: displayAddUser ? 'flex' : 'none'}}>
					<input name='username' placeholder={state.user.language ? 'Username' : 'उपयोगकर्ता नाम' } type='text' value={newUser.username} onChange={(e) => setNewUser({...newUser, [e.target.name]: e.target.value})} />
					<input disabled={newUser.username === ''} name='password' placeholder={state.user.language ? 'Password' : 'पासवर्ड'} type='password' value={newUser.password} onChange={(e) => setNewUser({...newUser, [e.target.name]: e.target.value})} />
					<select disabled={newUser.password === ''} name='role' value={newUser.role} onChange={(e) => setNewUser({...newUser, [e.target.name]: e.target.value})}>
						<option value='user'>{state.user.language ? 'User' : 'उपयोगकर्ता'}</option>
						<option value='admin'>{state.user.language ? 'User' : 'व्यवस्थापक'}</option>
					</select>
					<button disabled={newUser.password === '' || newUser.role === ''} onClick={() => handleAddUser()}>{state.user.language ? 'ADD' : 'जोड़ें'}</button>
				</div>
				{newUser.error && <div style={{color: 'red'}}>{state.user.language ? 'user already exists !' : 'उपयोगकर्ता पहले से मौजूद है !'}</div>}
				<table>
					<thead>
						<tr>
							<th style={{textAlign: 'left'}}>{state.user.language ? 'Username' : 'उपयोगकर्ता'}</th>
							<th style={{textAlign: 'left'}}>{state.user.language ? 'Password' : 'पासवर्ड'}</th>
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