import { useState } from 'react';
import CloseIcon from '../../images/close.png';
import './AddMember.css';

const AddMember = ({state, dispatch}) => {
  const dates = [];
  for(let i=1; i<=31; i++) {
    dates.push(i);
  }
  const months = ['Januray', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentYear = new Date().getFullYear();
  const years = [];
  for(let i=currentYear; i>=1900; i--) {
    years.push(i);
  }
  const [type, setType] = useState('');
  const [newMember, setNewMember] = useState({
    name: '',
    mobile: '',
    email: '',
    children: [],
    wives: [],
    date: '',
    month: '',
    year: '',
    isAlive: 'alive',
    gender: 'M',
    village: '',
    gotra: ''
  });
  const handleAddMember = async () => {
    if(type === 'child') {
      const mobileNumbers = [];
      const mobiles = newMember.mobile !== '' ? newMember.mobile.replaceAll(' ', '').split(',') : [];
      for(let i=0; i<mobiles.length; i++) {
        mobileNumbers.push(Number(mobiles[i]));
      }
      let person = undefined;
      if(newMember.gender === 'M') {
        person = {
          id: state.member ? ((state.member.id * 10) + (state.member.children.length + 1)) : 0,
          name: newMember.name,
          children: [],
          wives: [],
          mobile: mobileNumbers,
          email: newMember.email !== '' ? newMember.email.replaceAll(' ', '').split(',') : [],
          dob: newMember.date !== '' && newMember.month !== '' && newMember.year !== '' ? newMember.date + ' ' + newMember.month + ' ' + newMember.year : '',
          isAlive: newMember.isAlive === 'alive' ? true : false,
          gender: 'M',
          village: newMember.village,
          isCollapsed: false,
        }
      } else {
        person = {
          id: state.member ? ((state.member.id * 10) + (state.member.children.length + 1)) : 0,
          name: newMember.name,
          mobile: mobileNumbers,
          email: newMember.email !== '' ? newMember.email.replaceAll(' ', '').split(',') : [],
          dob: newMember.date !== '' && newMember.month !== '' && newMember.year !== '' ? newMember.date + ' ' + newMember.month + ' ' + newMember.year : '',
          isAlive: newMember.isAlive === 'alive' ? true : false,
          gender: 'F',
          village: newMember.village
        }   
      }
      const response = await fetch('http://115.117.107.101:27001/addNewMember', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ member: state.member, newMember: person, type: type, village: state.village })})
      const data = await response.json();
      if (data.result === 'success') {
        dispatch({type: 'addMember', member: person, memberType: type});
      }
    } else if (type === 'wife') {
      const mobileNumbers = [];
      const mobiles = newMember.mobile !== '' ? newMember.mobile.replaceAll(' ', '').split(',') : [];
      for(let i=0; i<mobiles.length; i++) {
        mobileNumbers.push(Number(mobiles[i]));
      }
      const person = {
        id: state.member ? (state.member.id * 10) : 0,
        name: newMember.name,
        mobile: mobileNumbers,
        email: newMember.email !== '' ? newMember.email.replaceAll(' ', '').split(',') : [],
        dob: newMember.date !== '' && newMember.month !== '' && newMember.year !== '' ? newMember.date + ' ' + newMember.month + ' ' + newMember.year : '',
        isAlive: newMember.isAlive === 'alive' ? true : false,
        gender: 'F',
        village: newMember.village,
        gotra: newMember.gotra,
      }
      const response = await fetch('http://115.117.107.101:27001/addNewMember', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ member: state.member, newMember: person, type: type, village: state.village })})
      const data = await response.json();
      if (data.result === 'success') {
        dispatch({type: 'addMember', member: person, memberType: type});      
      }
    }
    setType('');
    setNewMember({
      name: '',
      mobile: '',
      email: '',
      children: [],
      wives: [],
      date: '',
      month: '',
      year: '',
      isAlive: 'alive',
      gender: 'M',
      village: '',
      gotra: ''
    });
  }
	const handleClose = () => {
		dispatch({type: 'closeMemberAdd'});
    setType('');
    setNewMember({
      name: '',
      mobile: '',
      email: '',
      children: [],
      wives: [],
      date: '',
      month: '',
      year: '',
      isAlive: true,
      gender: 'M',
      village: '',
      gotra: ''
    });
	}
  return (
    <div className="add-member" style={{display: state.isMemberAddOpen ? 'flex' : 'none'}}>
			<img src={CloseIcon} alt='close' className='close' onClick={() => handleClose()} />
      <div className='view'>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value=''>User Type?</option>
          <option value='child'>Child</option>
          <option value='wife'>Wife</option>
        </select>
        <input disabled={type === ''} type='text' name='name' value={newMember.name} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})} placeholder='Name (optional)' />
        <input disabled={type === ''} type='text' name='mobile' value={newMember.mobile} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})} placeholder='Mobile (optional)' />
        <div className='dob'>
          <select disabled={type === ''} name='date' value={newMember.date} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})}>
            <option value=''>DD</option>
            {dates.map((date, i) => <option key={i} value={date}>{date}</option>)}
          </select>
          <select disabled={type === ''} name='month' value={newMember.month} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})}>
            <option value=''>MM</option>
            {months.map((month, i) => <option key={i} value={month}>{month}</option>)}
          </select>
          <select disabled={type === ''} name='year' value={newMember.year} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})}>
            <option value=''>YYYY</option>
            {years.map((year, i) => <option key={i} value={year}>{year}</option>)}
          </select>
        </div>
        <select disabled={type === '' || type === 'wife'} name='gender' value={type === 'wife' ? 'F' : newMember.gender} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})}>
          <option value='M'>Male</option>
          <option value='F'>Female</option>
        </select>
        <select disabled={type === ''} name='isAlive' value={newMember.isAlive} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})}>
          <option value='alive'>Alive</option>
          <option value='dead'>Dead</option>
        </select>
        <input disabled={type === ''} type='text' name='village' value={newMember.village} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})} placeholder='Village (optional)' />
        {type === 'wife' ? <input type='text' name='gotra' value={newMember.gotra} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})} placeholder='Gotra (optional)' /> : ''}
        <input disabled={type === ''} type='email' name='email' value={newMember.email} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})} placeholder='Email (optional)' />
        <button disabled={type === ''} onClick={() => handleAddMember()}>ADD</button>
      </div>
    </div>
  );
};

export default AddMember;