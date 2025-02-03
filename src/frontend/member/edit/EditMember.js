// import { useState } from 'react';
import CloseIcon from '../../../images/close.png';
import './EditMember.css';
const URL = process.env.REACT_APP_API_URL;
const PORT = process.env.REACT_APP_PORT;

const EditMember = ({state, dispatch}) => {
  const dates = [];
  for(let i=1; i<=31; i++) {
    dates.push(i);
  }
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentYear = new Date().getFullYear();
  const years = [];
  for(let i=currentYear; i>=1900; i--) {
    years.push(i);
  }
  const handleEditMember = async () => {
    const consent = window.confirm('Are you sure you want to edit this member?');
    if(consent) {
      const mobileNumbers = [];
      const mobiles = state.editInput.mobile !== '' ? state.editInput.mobile.replaceAll(' ', '').split(',') : [];
      for(let i=0; i<mobiles.length; i++) {
        mobileNumbers.push(Number(mobiles[i]));
      }
      const person = {
        id: state.editInput.id,
        name: state.editInput.name,
        dob: state.editInput.date !== '' && state.editInput.month !== '' && state.editInput.year !== '' ? state.editInput.date + ' ' + state.editInput.month + ' ' + state.editInput.year : '',
        gender: state.editInput.gender,
        isAlive: state.editInput.isAlive === 'alive' ? true : false,
        dod: state.editInput.isAlive === 'dead' && state.editInput.dateDeath !== '' && state.editInput.monthDeath !== '' && state.editInput.yearDeath !== '' ? state.editInput.dateDeath + ' ' + state.editInput.monthDeath + ' ' + state.editInput.yearDeath : '',
        village: state.editInput.village,
        gotra: state.editInput.gotra,
        mobile: mobileNumbers,
        email: state.editInput.email !== '' ? state.editInput.email.replaceAll(' ', '').split(',') : [],
      }
      const response = await fetch(`${URL}:${PORT}/editMember`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ member: person, village: state.village })})
      const data = await response.json();
      if (data.result === 'success') {
        dispatch({type: 'editMember', member: person});   
      }
    }
  }
	const handleClose = () => {
		dispatch({type: 'closeMemberEdit'});
	}
  return (
    <div className="edit-member" style={{display: state.isMemberEditOpen ? 'flex' : 'none'}}>
			<img src={CloseIcon} alt='close' className='close' onClick={() => handleClose()} />
      <div className='view'>
        <input type='text' name='name' value={state.editInput.name} onChange={(e) => dispatch({type: 'editInput', attribute: e.target.name, value: e.target.value})} placeholder='Name (optional)' />
        <input type='text' name='mobile' value={state.editInput.mobile} onChange={(e) => dispatch({type: 'editInput', attribute: e.target.name, value: e.target.value})} placeholder='Mobile (optional)' />
        <div className='dob'>
          <select name='date' value={state.editInput.date} onChange={(e) => dispatch({type: 'editInput', attribute: e.target.name, value: e.target.value})}>
            <option value=''>DD</option>
            {dates.map((date, i) => <option key={i} value={date}>{date}</option>)}
          </select>
          <select name='month' value={state.editInput.month} onChange={(e) => dispatch({type: 'editInput', attribute: e.target.name, value: e.target.value})}>
            <option value=''>MM</option>
            {months.map((month, i) => <option key={i} value={month}>{month}</option>)}
          </select>
          <select name='year' value={state.editInput.year} onChange={(e) => dispatch({type: 'editInput', attribute: e.target.name, value: e.target.value})}>
            <option value=''>YYYY</option>
            {years.map((year, i) => <option key={i} value={year}>{year}</option>)}
          </select>
        </div>
        <select name='gender' value={state.editInput.gender} onChange={(e) => dispatch({type: 'editInput', attribute: e.target.name, value: e.target.value})}>
          <option value='M'>Male</option>
          <option value='F'>Female</option>
        </select>
        <select name='isAlive' value={state.editInput.isAlive} onChange={(e) => dispatch({type: 'editInput', attribute: e.target.name, value: e.target.value})}>
          <option value='alive'>Alive</option>
          <option value='dead'>Dead</option>
        </select>
        {state.editInput.isAlive === 'dead' && <div className='dob'>
          <select name='dateDeath' value={state.editInput.dateDeath} onChange={(e) => dispatch({type: 'editInput', attribute: e.target.name, value: e.target.value})}>
            <option value=''>DD</option>
            {dates.map((date, i) => <option key={i} value={date}>{date}</option>)}
          </select>
          <select name='monthDeath' value={state.editInput.monthDeath} onChange={(e) => dispatch({type: 'editInput', attribute: e.target.name, value: e.target.value})}>
            <option value=''>MM</option>
            {months.map((month, i) => <option key={i} value={month}>{month}</option>)}
          </select>
          <select name='yearDeath' value={state.editInput.yearDeath} onChange={(e) => dispatch({type: 'editInput', attribute: e.target.name, value: e.target.value})}>
            <option value=''>YYYY</option>
            {years.map((year, i) => <option key={i} value={year}>{year}</option>)}
          </select>
        </div>}
        <input type='text' name='village' value={state.editInput.village} onChange={(e) => dispatch({type: 'editInput', attribute: e.target.name, value: e.target.value})} placeholder='Village (optional)' />
        <input type='text' name='gotra' value={state.editInput.gotra} onChange={(e) => dispatch({type: 'editInput', attribute: e.target.name, value: e.target.value})} placeholder='Gotra (optional)' />
        <input type='email' name='email' value={state.editInput.email} onChange={(e) => dispatch({type: 'editInput', attribute: e.target.name, value: e.target.value})} placeholder='Email (optional)' />
        <button onClick={() => handleEditMember()}>UPDATE</button>
      </div>
    </div>
  );
};

export default EditMember;