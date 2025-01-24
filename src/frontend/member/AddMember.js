import { useState } from 'react';
import CloseIcon from '../../images/close.png';
import './AddMember.css';

const AddMember = ({state, dispatch}) => {
  const months = ['Januray', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [type, setType] = useState('');
  const [newMember, setNewMember] = useState({
    name: '',
    mobile: [],
    email: [],
    children: [],
    wives: [],
    dob: '',
    isAlive: 'alive',
    gender: 'M',
    village: '',
    gotra: ''
  });
  const handleAddMember = async () => {
    if(type === 'child') {
      let person = undefined;
      if(newMember.gender === 'M') {
        person = {
          id: state.member ? ((state.member.id * 10) + (state.member.children.length + 1)) : 0,
          name: newMember.name,
          children: [],
          wives: [],
          mobile: newMember.mobile,
          dob: newMember.dob !== '' ? `${newMember.dob.split('-')[2]} ${months[Number(newMember.dob.split('-')[1]) - 1]} ${newMember.dob.split('-')[0]}` : '',
          isAlive: newMember.isAlive === 'alive' ? true : false,
          gender: 'M',
          village: newMember.village,
          email: newMember.email,
          isCollapsed: false,
        }
      } else {
        person = {
          id: state.member ? ((state.member.id * 10) + (state.member.children.length + 1)) : 0,
          name: newMember.name,
          mobile: newMember.mobile,
          dob: newMember.dob !== '' ? `${newMember.dob.split('-')[2]} ${months[Number(newMember.dob.split('-')[1]) - 1]} ${newMember.dob.split('-')[0]}` : '',
          isAlive: newMember.isAlive === 'alive' ? true : false,
          gender: 'F',
          village: newMember.village,
          email: newMember.email  
        }   
      }
      const response = await fetch('http://115.117.107.101:27001/addNewMember', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ member: state.member, newMember: person, type: type, village: state.village })})
      const data = await response.json();
      if (data.result === 'success') {
        dispatch({
          type: 'addMember', 
          member: {
            id: state.member ? ((state.member.id * 10) + (state.member.children.length + 1)) : 0,
            name: newMember.name,
            children: [],
            wives: [],
            mobile: newMember.mobile,
            dob: newMember.dob !== '' ? `${newMember.dob.split('-')[2]} ${months[Number(newMember.dob.split('-')[1]) - 1]} ${newMember.dob.split('-')[0]}` : '',
            isAlive: newMember.isAlive === 'alive' ? true : false,
            gender: newMember.gender,
            village: newMember.village,
            email: newMember.email,
            isCollapsed: false,
          }, 
          memberType: type
        });
      }
    } else if (type === 'wife') {
      const response = await fetch('http://115.117.107.101:27001/addNewMember', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ member: state.member, newMember: {
        id: state.member ? (state.member.id * 10) : 0,
        name: newMember.name,
        dob: newMember.dob,
        isAlive: newMember.isAlive === 'alive' ? true : false,
        gender: 'F',
        village: newMember.village,
        gotra: newMember.gotra,
      }, type: type, village: state.village })})
      const data = await response.json();
      if (data.result === 'success') {
        dispatch({
          type: 'addMember', 
          member: {
            id: state.member ? (state.member.id * 10) : 0,
            name: newMember.name,
            dob: newMember.dob,
            isAlive: newMember.isAlive === 'alive' ? true : false,
            gender: 'F',
            village: newMember.village,
            gotra: newMember.gotra,
          }, 
          memberType: type
        });      
      }
    }
    setType('');
    setNewMember({
      name: '',
      mobile: [],
      email: [],
      children: [],
      wives: [],
      dob: '',
      isAlive: 'alive',
      gender: 'M',
      village: '',
      gotra: ''
    });
  }
	const handleClose = () => {
		dispatch({type: 'closeMemberEdit'});
    setType('');
    setNewMember({
      name: '',
      mobile: [],
      email: [],
      children: [],
      wives: [],
      dob: '',
      isAlive: true,
      gender: 'M',
      village: '',
      gotra: ''
    });
	}
  return (
    <div className="add-member" style={{display: state.isMemberEditOpen ? 'flex' : 'none'}}>
			<img src={CloseIcon} alt='close' className='close' onClick={() => handleClose()} />
      <div className='view'>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value=''>-- type --</option>
          <option value='child'>Child</option>
          <option value='wife'>Wife</option>
        </select>
        <input disabled={type === ''} type='text' name='name' value={newMember.name} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})} placeholder='name' />
        <input disabled={type === ''} type='text' name='mobile' value={newMember.mobile} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})} placeholder='mobile' maxLength='10' />
        <input disabled={type === ''} type='date' name='dob' value={newMember.dob} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})} />
        <select disabled={type === '' || type === 'wife'} name='gender' value={type === 'wife' ? 'F' : newMember.gender} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})}>
          <option value='M'>Male</option>
          <option value='F'>Female</option>
        </select>
        <select disabled={type === ''} name='isAlive' value={newMember.isAlive} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})}>
          <option value='alive'>Alive</option>
          <option value='dead'>Dead</option>
        </select>
        <input disabled={type === ''} type='text' name='village' value={newMember.village} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})} placeholder='village' />
        {type === 'wife' ? <input type='text' name='gotra' value={newMember.gotra} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})} placeholder='gotra' /> : ''}
        <input disabled={type === ''} type='email' name='email' value={newMember.email} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})} placeholder='email' />
        <button disabled={type === '' || newMember.name === '' || newMember.gender === '' || newMember.isAlive === ''} onClick={() => handleAddMember()}>Add</button>
      </div>
    </div>
  );
};

export default AddMember;