import { useState } from 'react';
import CloseIcon from '../../images/close.png';
import './AddMember.css';

const AddMember = ({state, dispatch}) => {
  const dates = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 23, 24, 25, 26, 27,28, 29, 30, 31];
  const months = ['Januray', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2014, 2013, 3012, 2011, 2010, 2009, 2008, 2007, 2006, 2005, 2004, 2003, 2002, 2001, 2000, 1999, 1998, 1997, 1996, 1995, 1994, 1993, 1992, 1991, 1990]
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
      let person = undefined;
      if(newMember.gender === 'M') {
        person = {
          id: state.member ? ((state.member.id * 10) + (state.member.children.length + 1)) : 0,
          name: newMember.name,
          children: [],
          wives: [],
          mobile: newMember.mobile !== '' ? [newMember.mobile] : [],
          dob: newMember.date !== '' && newMember.month !== '' && newMember.year !== '' ? newMember.date + ' ' + newMember.month + ' ' + newMember.year : '',
          isAlive: newMember.isAlive === 'alive' ? true : false,
          gender: 'M',
          village: newMember.village,
          email: newMember.email !== '' ? [newMember.email] : [],
          isCollapsed: false,
        }
      } else {
        person = {
          id: state.member ? ((state.member.id * 10) + (state.member.children.length + 1)) : 0,
          name: newMember.name,
          mobile: newMember.mobile !== '' ? [newMember.mobile] : [],
          dob: newMember.date !== '' && newMember.month !== '' && newMember.year !== '' ? newMember.date + ' ' + newMember.month + ' ' + newMember.year : '',
          isAlive: newMember.isAlive === 'alive' ? true : false,
          gender: 'F',
          village: newMember.village,
          email: newMember.email !== '' ? [newMember.email] : [],
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
      const person = {
        id: state.member ? (state.member.id * 10) : 0,
        name: newMember.name,
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
		dispatch({type: 'closeMemberEdit'});
    setType('');
    setNewMember({
      name: '',
      mobile: [],
      email: [],
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
        <div className='dob'>
          <select disabled={type === ''} name='date' value={newMember.date} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})}>
            <option value=''>date</option>
            {dates.map((date, i) => <option key={i} value={date}>{date}</option>)}
          </select>
          <select disabled={type === ''} name='month' value={newMember.month} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})}>
            <option value=''>month</option>
            {months.map((month, i) => <option key={i} value={month}>{month}</option>)}
          </select>
          <select disabled={type === ''} name='year' value={newMember.year} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})}>
            <option value=''>year</option>
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
        <input disabled={type === ''} type='text' name='village' value={newMember.village} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})} placeholder='village' />
        {type === 'wife' ? <input type='text' name='gotra' value={newMember.gotra} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})} placeholder='gotra' /> : ''}
        <input disabled={type === ''} type='email' name='email' value={newMember.email} onChange={(e) => setNewMember({...newMember, [e.target.name]: e.target.value})} placeholder='email' />
        <button disabled={type === ''} onClick={() => handleAddMember()}>Add</button>
      </div>
    </div>
  );
};

export default AddMember;