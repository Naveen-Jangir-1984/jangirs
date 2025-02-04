import { useState } from 'react';
import CloseIcon from '../../../images/close.png';
import './AddMember.css';
const URL = process.env.REACT_APP_API_URL;
const PORT = process.env.REACT_APP_PORT;

const AddMember = ({state, dispatch, getHindiText, getHindiNumbers}) => {
  const dates = [];
  for(let i=1; i<=31; i++) {
    dates.push(i);
  }
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthsHindi = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितम्बर', 'अक्टूबर', 'नवम्बर', 'दिसम्बर'];
  const currentYear = new Date().getFullYear();
  const years = [];
  for(let i=currentYear; i>=1200; i--) {
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
    dateDeath: '',
    monthDeath: '',
    yearDeath: '',
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
          id: state.memberToBeAdded ? ((state.memberToBeAdded.id * 10) + (state.memberToBeAdded.children.length + 1)) : 0,
          name: newMember.name,
          children: [],
          wives: [],
          mobile: mobileNumbers,
          email: newMember.email !== '' ? newMember.email.replaceAll(' ', '').split(',') : [],
          dob: newMember.date !== '' && newMember.month !== '' && newMember.year !== '' ? newMember.date + ' ' + newMember.month + ' ' + newMember.year : '',
          isAlive: newMember.isAlive === 'alive' ? true : false,
          dod: newMember.dateDeath !== '' && newMember.monthDeath !== '' && newMember.yearDeath !== '' ? newMember.dateDeath + ' ' + newMember.monthDeath + ' ' + newMember.yearDeath : '',
          gender: 'M',
          village: newMember.village,
          isCollapsed: false,
        }
      } else {
        person = {
          id: state.memberToBeAdded ? ((state.memberToBeAdded.id * 10) + (state.memberToBeAdded.children.length + 1)) : 0,
          name: newMember.name,
          mobile: mobileNumbers,
          email: newMember.email !== '' ? newMember.email.replaceAll(' ', '').split(',') : [],
          dob: newMember.date !== '' && newMember.month !== '' && newMember.year !== '' ? newMember.date + ' ' + newMember.month + ' ' + newMember.year : '',
          isAlive: newMember.isAlive === 'alive' ? true : false,
          dod: newMember.dateDeath !== '' && newMember.monthDeath !== '' && newMember.yearDeath !== '' ? newMember.dateDeath + ' ' + newMember.monthDeath + ' ' + newMember.yearDeath : '',
          gender: 'F',
          village: newMember.village
        }   
      }
      const response = await fetch(`${URL}:${PORT}/addNewMember`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ member: state.memberToBeAdded, newMember: person, type: type, village: state.village })})
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
        id: state.memberToBeAdded ? (state.memberToBeAdded.id * 10) : 0,
        name: newMember.name,
        mobile: mobileNumbers,
        email: newMember.email !== '' ? newMember.email.replaceAll(' ', '').split(',') : [],
        dob: newMember.date !== '' && newMember.month !== '' && newMember.year !== '' ? newMember.date + ' ' + newMember.month + ' ' + newMember.year : '',
        isAlive: newMember.isAlive === 'alive' ? true : false,
        dod: newMember.dateDeath !== '' && newMember.monthDeath !== '' && newMember.yearDeath !== '' ? newMember.dateDeath + ' ' + newMember.monthDeath + ' ' + newMember.yearDeath : '',
        gender: 'F',
        village: newMember.village,
        gotra: newMember.gotra,
      }
      const response = await fetch(`${URL}:${PORT}/addNewMember`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ member: state.memberToBeAdded, newMember: person, type: type, village: state.village })})
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
      dateDeath: '',
      monthDeath: '',
      yearDeath: '',
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
      dateDeath: '',
      monthDeath: '',
      yearDeath: '',
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
          <option value=''>{state.user.language ? 'User?' : 'सदस्य?'}</option>
          <option value='child'>{state.user.language ? 'Child' : 'औलाद'}</option>
          <option value='wife'>{state.user.language ? 'Wife' : 'पत्नी'}</option>
        </select>
        <input disabled={type === ''} type='text' name='name' value={newMember.name} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})} placeholder='Name (optional)' />
        <input disabled={type === ''} type='text' name='mobile' value={newMember.mobile} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})} placeholder='Mobile (optional)' />
        <div className='dob'>
          <select disabled={type === ''} name='date' value={newMember.date} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})}>
            <option value=''>{state.user.language ? 'DD' : 'दिन'}</option>
            {dates.map((date, i) => <option key={i} value={date}>{state.user.language ? date : getHindiNumbers(date.toString())}</option>)}
          </select>
          <select disabled={type === ''} name='month' value={newMember.month} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})}>
            <option value=''>{state.user.language ? 'MM' : 'महिना'}</option>
            {months.map((month, i) => <option key={i} value={month}>{state.user.language ? month : monthsHindi[i]}</option>)}
          </select>
          <select disabled={type === ''} name='year' value={newMember.year} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})}>
            <option value=''>{state.user.language ? 'YYYY' : 'साल'}</option>
            {years.map((year, i) => <option key={i} value={year}>{state.user.language ? year : getHindiNumbers(year.toString())}</option>)}
          </select>
        </div>
        <select disabled={type === '' || type === 'wife'} name='gender' value={type === 'wife' ? 'F' : newMember.gender} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})}>
          <option value='M'>{state.user.language ? 'Male' : 'पुरुष'}</option>
          <option value='F'>{state.user.language ? 'Female' : 'महिला'}</option>
        </select>
        <select disabled={type === ''} name='isAlive' value={newMember.isAlive} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})}>
          <option value='alive'>{state.user.language ? 'Alive' : 'जिंदा'}</option>
          <option value='dead'>{state.user.language ? 'Dead' : 'मृत'}</option>
        </select>
        {newMember.isAlive === 'dead' && <div className='dob'>
          <select disabled={type === ''} name='dateDeath' value={newMember.dateDeath} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})}>
            <option value=''>{state.user.language ? 'DD' : 'दिन'}</option>
            {dates.map((date, i) => <option key={i} value={date}>{state.user.language ? date : getHindiNumbers(date.toString())}</option>)}
          </select>
          <select disabled={type === ''} name='monthDeath' value={newMember.monthDeath} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})}>
            <option value=''>{state.user.language ? 'MM' : 'महिना'}</option>
            {months.map((month, i) => <option key={i} value={month}>{state.user.language ? month : monthsHindi[i]}</option>)}
          </select>
          <select disabled={type === ''} name='yearDeath' value={newMember.yearDeath} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})}>
            <option value=''>{state.user.language ? 'YYYY' : 'साल'}</option>
            {years.map((year, i) => <option key={i} value={year}>{state.user.language ? year : getHindiNumbers(year.toString())}</option>)}
          </select>
        </div>}
        <input disabled={type === ''} type='text' name='village' value={newMember.village} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})} placeholder='Village (optional)' />
        {type === 'wife' ? <input type='text' name='gotra' value={newMember.gotra} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})} placeholder='Gotra (optional)' /> : ''}
        <input disabled={type === ''} type='email' name='email' value={newMember.email} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})} placeholder='Email (optional)' />
        <button disabled={type === ''} onClick={() => handleAddMember()}>{state.user.language ? 'ADD' : 'जोड़ें'}</button>
      </div>
    </div>
  );
};

export default AddMember;