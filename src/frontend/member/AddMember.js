import { useState } from 'react';
import CloseIcon from '../../images/close.png';
import './AddMember.css';

const AddMember = ({state, dispatch}) => {
  const [type, setType] = useState('');
  const [newMember, setNewMember] = useState({
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
  const handleAddMember = () => {
    if(type === 'child') {
      dispatch({
        type: 'addMember', 
        member: {
          id: state.member ? ((state.member.id * 10) + (state.member.children.length + 1)) : 0,
          name: newMember.name,
          children: [],
          wives: [],
          mobile: [newMember.mobile],
          dob: newMember.dob,
          isAlive: newMember.isAlive,
          gender: newMember.gender,
          village: newMember.village,
          email: [newMember.email],
          isCollapsed: false,
        }, 
        memberType: type
      });
    } else if (type === 'wife') {
      dispatch({
        type: 'addMember', 
        member: {
          id: state.member ? (state.member.id * 10) : 0,
          name: newMember.name,
          dob: newMember.dob,
          isAlive: newMember.isAlive,
          gender: newMember.gender,
          village: newMember.village,
          gotra: newMember.gotra,
        }, 
        memberType: type
      });      
    }
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
        <input type='text' name='name' value={newMember.name} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})} placeholder='name' />
        <input type='text' name='mobile' value={newMember.mobile} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})} placeholder='mobile' maxLength='10' />
        <input type='date' name='dob' value={newMember.dob} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})} />
        <select name='gender' value={newMember.gender} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})}>
          <option value='M'>Male</option>
          <option value='F'>Female</option>
        </select>
        <select name='isAlive' value={newMember.isAlive} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})}>
          <option value={true}>Alive</option>
          <option value={false}>Dead</option>
        </select>
        <input type='text' name='village' value={newMember.village} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})} placeholder='village' />
        {type === 'wife' && <input type='text' name='gotra' value={newMember.gotra} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})} placeholder='gotra' /> }
        <input type='email' name='email' value={newMember.email} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})} placeholder='email' />
        <button onClick={() => handleAddMember()}>Add</button>
      </div>
    </div>
  );
};

export default AddMember;