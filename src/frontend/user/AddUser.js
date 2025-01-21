import { useState } from "react";
import CloseIcon from '../../images/close.png';
import './AddUser.css';

const AddUser = ({state, dispatch}) => {
	const [userType, setUserType] = useState('');
	const [newUser, setNewUser] = useState({
		username: '',
		password: '',
		error: false
	});
	const [memberType, setMemberType] = useState('');
	const [newMember, setNewMember] = useState({
		id: '',
		name: '',
		wives: [],
		children: [],
		isAlive: true,
		gender: ''
	});
	const handleClose = () => {
		setUserType('');
		setNewUser({username: '', password: '', error: false}); 
		dispatch({type: 'exitAddUser'});
	}
	const handleAddUser = async () => {
		const response = await fetch('http://localhost:27001/addNewUser', {
		method: 'post',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username: newUser.username, password: newUser.password })})
		const data = await response.json();
		if (data.result === 'success') {
			dispatch({type: 'addNewUser', newUser: newUser});
			setUserType('');
			setNewUser({ username: '', password: '', error: false });
		} else if(data.result === 'duplicate') {
			setNewUser({ ...newUser, error: true });
		}
	}
	return (
		<div className='add' style={{display: state.isAddUserOpen ? 'flex' : 'none'}}>
			<div className='view'>
				<img src={CloseIcon} alt='close' className='close' onClick={() => handleClose()} />
				<select name='userType' value={userType} onChange={(e) => setUserType(e.target.value)}>
					<option value=''>-- user --</option>
					<option value='user'>User</option>
					<option value='member'>Member</option>
				</select>
				{
					userType === 'user' ?
					<div className='user-inputs'>
						<input disabled={userType === ''} name='username' placeholder='username' type='text' value={newUser.username} onChange={(e) => setNewUser({...newUser, [e.target.name]: e.target.value})} />
						<input disabled={newUser.username === ''} name='password' placeholder='password' type='password' value={newUser.password} onChange={(e) => setNewUser({...newUser, [e.target.name]: e.target.value})} />
						<button disabled={newUser.password === ''} onClick={async () => handleAddUser()}>Add User</button>
						{newUser.error && <div style={{color: 'red'}}>user already exist !</div>}
					</div> :
					userType === 'member' ? 
					<div className='member-inputs'>
						<select name='memberType' value={memberType} onChange={(e) => setMemberType(e.target.value)}>
							<option value=''>-- member --</option>
							<option value='user'>Child</option>
							<option value='member'>Wife</option>
						</select>
						<input name='username' type='text' value={newMember.name} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})} />
						<select name='gender' value={newMember.gender} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})}>
							<option value=''>-- gender --</option>
							<option value='M'>Male</option>
							<option value='F'>Female</option>
						</select>					
					</div> : ''
				}				
			</div>
		</div>
	);
}

export default AddUser;