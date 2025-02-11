import CloseIcon from '../../../images/close.png';
import './AddMember.css';
const URL = process.env.REACT_APP_API_URL;
// const PORT = process.env.REACT_APP_PORT;

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
  const handleAddMember = async () => {
    const consent = window.confirm(state.user.language ? 'Are you sure you want to add the member?' : 'क्या आप वाकई सदस्य जोड़ना चाहते हैं?');
    if(consent) {
      if(state.newMember.type === 'child') {
        const mobileNumbers = [];
        const mobiles = state.newMember.mobile !== '' ? state.newMember.mobile.replaceAll(' ', '').split(',') : [];
        for(let i=0; i<mobiles.length; i++) {
          mobileNumbers.push(Number(mobiles[i]));
        }
        let person = undefined;
        if(state.newMember.gender === 'M') {
          person = {
            id: state.memberToBeAdded ? ((state.memberToBeAdded.id * 10) + (state.memberToBeAdded.children.length + 1)) : 0,
            name: state.newMember.name,
            children: [],
            wives: [],
            mobile: mobileNumbers,
            email: state.newMember.email !== '' ? state.newMember.email.replaceAll(' ', '').split(',') : [],
            dob: state.newMember.date !== '' && state.newMember.month !== '' && state.newMember.year !== '' ? state.newMember.date + ' ' + state.newMember.month + ' ' + state.newMember.year : '',
            isAlive: state.newMember.isAlive === 'alive' ? true : false,
            dod: state.newMember.dateDeath !== '' && state.newMember.monthDeath !== '' && state.newMember.yearDeath !== '' ? state.newMember.dateDeath + ' ' + state.newMember.monthDeath + ' ' + state.newMember.yearDeath : '',
            gender: 'M',
            village: state.newMember.village,
            isCollapsed: false,
          }
        } else {
          person = {
            id: state.memberToBeAdded ? ((state.memberToBeAdded.id * 10) + (state.memberToBeAdded.children.length + 1)) : 0,
            name: state.newMember.name,
            mobile: mobileNumbers,
            email: state.newMember.email !== '' ? state.newMember.email.replaceAll(' ', '').split(',') : [],
            dob: state.newMember.date !== '' && state.newMember.month !== '' && state.newMember.year !== '' ? state.newMember.date + ' ' + state.newMember.month + ' ' + state.newMember.year : '',
            isAlive: state.newMember.isAlive === 'alive' ? true : false,
            dod: state.newMember.dateDeath !== '' && state.newMember.monthDeath !== '' && state.newMember.yearDeath !== '' ? state.newMember.dateDeath + ' ' + state.newMember.monthDeath + ' ' + state.newMember.yearDeath : '',
            gender: 'F',
            village: state.newMember.village
          }   
        }
        const response = await fetch(`${URL}/addNewMember`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member: state.memberToBeAdded, newMember: person, type: state.newMember.type, village: state.village })})
        const data = await response.json();
        if (data.result === 'success') {
          dispatch({type: 'addMember', member: person, memberType: state.newMember.type});
        }
      } else if (state.newMember.type === 'wife') {
        const mobileNumbers = [];
        const mobiles = state.newMember.mobile !== '' ? state.newMember.mobile.replaceAll(' ', '').split(',') : [];
        for(let i=0; i<mobiles.length; i++) {
          mobileNumbers.push(Number(mobiles[i]));
        }
        const person = {
          id: state.memberToBeAdded ? (state.memberToBeAdded.id * 10) : 0,
          name: state.newMember.name,
          mobile: mobileNumbers,
          email: state.newMember.email !== '' ? state.newMember.email.replaceAll(' ', '').split(',') : [],
          dob: state.newMember.date !== '' && state.newMember.month !== '' && state.newMember.year !== '' ? state.newMember.date + ' ' + state.newMember.month + ' ' + state.newMember.year : '',
          isAlive: state.newMember.isAlive === 'alive' ? true : false,
          dod: state.newMember.dateDeath !== '' && state.newMember.monthDeath !== '' && state.newMember.yearDeath !== '' ? state.newMember.dateDeath + ' ' + state.newMember.monthDeath + ' ' + state.newMember.yearDeath : '',
          gender: 'F',
          village: state.newMember.village,
          gotra: state.newMember.gotra,
        }
        const response = await fetch(`${URL}/addNewMember`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member: state.memberToBeAdded, newMember: person, type: state.newMember.type, village: state.village })})
        const data = await response.json();
        if (data.result === 'success') {
          dispatch({type: 'addMember', member: person, memberType: state.newMember.type});      
        }
      }
    }
  }
	const handleClose = () => {
		dispatch({type: 'closeMemberAdd'});
	}
  return (
    <div className="add-member" style={{display: state.isMemberAddOpen ? 'flex' : 'none'}}>
			<img src={CloseIcon} alt='close' className='close' onClick={() => handleClose()} />
      <div className='view'>
        <select name='type' value={state.newMember.type} onChange={(e) => dispatch({type: 'editInputNewMember', attribute: e.target.name, value: e.target.value})}>
          <option value=''>{state.user.language ? 'Member?' : 'सदस्य?'}</option>
          <option value='child'>{state.user.language ? 'Child' : 'औलाद'}</option>
          <option value='wife'>{state.user.language ? 'Wife' : 'पत्नी'}</option>
        </select>
        <input disabled={state.newMember.type === ''} type='text' name='name' value={state.newMember.name} onChange={(e) => dispatch({type: 'editInputNewMember', attribute: e.target.name, value: e.target.value})} placeholder={state.user.language ? 'Name' : 'नाम'} />
        <input disabled={state.newMember.type === ''} type='text' name='mobile' value={state.newMember.mobile} onChange={(e) => dispatch({type: 'editInputNewMember', attribute: e.target.name, value: e.target.value})} placeholder={state.user.language ? 'Mobile' : 'मोबाइल'} />
        <div className='dob'>
          <select disabled={state.newMember.type === ''} name='date' value={state.newMember.date} onChange={(e) => dispatch({type: 'editInputNewMember', attribute: e.target.name, value: e.target.value})}>
            <option value=''>{state.user.language ? 'DD' : 'दिन'}</option>
            {dates.map((date, i) => <option key={i} value={date}>{state.user.language ? date : getHindiNumbers(date.toString())}</option>)}
          </select>
          <select disabled={state.newMember.type === ''} name='month' value={state.newMember.month} onChange={(e) => dispatch({type: 'editInputNewMember', attribute: e.target.name, value: e.target.value})}>
            <option value=''>{state.user.language ? 'MM' : 'महिना'}</option>
            {months.map((month, i) => <option key={i} value={month}>{state.user.language ? month : monthsHindi[i]}</option>)}
          </select>
          <select disabled={state.newMember.type === ''} name='year' value={state.newMember.year} onChange={(e) => dispatch({type: 'editInputNewMember', attribute: e.target.name, value: e.target.value})}>
            <option value=''>{state.user.language ? 'YYYY' : 'साल'}</option>
            {years.map((year, i) => <option key={i} value={year}>{state.user.language ? year : getHindiNumbers(year.toString())}</option>)}
          </select>
        </div>
        <select disabled={state.newMember.type === '' || state.newMember.type === 'wife'} name='gender' value={state.newMember.type === 'wife' ? 'F' : state.newMember.gender} onChange={(e) => dispatch({type: 'editInputNewMember', attribute: e.target.name, value: e.target.value})}>
          <option value='M'>{state.user.language ? 'Male' : 'पुरुष'}</option>
          <option value='F'>{state.user.language ? 'Female' : 'महिला'}</option>
        </select>
        <select disabled={state.newMember.type === ''} name='isAlive' value={state.newMember.isAlive} onChange={(e) => dispatch({type: 'editInputNewMember', attribute: e.target.name, value: e.target.value})}>
          <option value='alive'>{state.user.language ? 'Alive' : 'जिंदा'}</option>
          <option value='dead'>{state.user.language ? 'Dead' : 'मृत'}</option>
        </select>
        {state.newMember.isAlive === 'dead' && <div className='dob'>
          <select disabled={state.newMember.type === ''} name='dateDeath' value={state.newMember.dateDeath} onChange={(e) => dispatch({type: 'editInputNewMember', attribute: e.target.name, value: e.target.value})}>
            <option value=''>{state.user.language ? 'DD' : 'दिन'}</option>
            {dates.map((date, i) => <option key={i} value={date}>{state.user.language ? date : getHindiNumbers(date.toString())}</option>)}
          </select>
          <select disabled={state.newMember.type === ''} name='monthDeath' value={state.newMember.monthDeath} onChange={(e) => dispatch({type: 'editInputNewMember', attribute: e.target.name, value: e.target.value})}>
            <option value=''>{state.user.language ? 'MM' : 'महिना'}</option>
            {months.map((month, i) => <option key={i} value={month}>{state.user.language ? month : monthsHindi[i]}</option>)}
          </select>
          <select disabled={state.newMember.type === ''} name='yearDeath' value={state.newMember.yearDeath} onChange={(e) => dispatch({type: 'editInputNewMember', attribute: e.target.name, value: e.target.value})}>
            <option value=''>{state.user.language ? 'YYYY' : 'साल'}</option>
            {years.map((year, i) => <option key={i} value={year}>{state.user.language ? year : getHindiNumbers(year.toString())}</option>)}
          </select>
        </div>}
        <input disabled={state.newMember.type === ''} type='text' name='village' value={state.newMember.village} onChange={(e) => dispatch({type: 'editInputNewMember', attribute: e.target.name, value: e.target.value})} placeholder={state.user.language ? 'Village' : 'गाँव'} />
        {state.newMember.type === 'wife' ? <input type='text' name='gotra' value={state.newMember.gotra} onChange={(e) => dispatch({type: 'editInputNewMember', attribute: e.target.name, value: e.target.value})} placeholder={state.user.language ? 'Gotra' : 'गोत्र'} /> : ''}
        <input disabled={state.newMember.type === ''} type='email' name='email' value={state.newMember.email} onChange={(e) => dispatch({type: 'editInputNewMember', attribute: e.target.name, value: e.target.value})} placeholder={state.user.language ? 'Email' : 'ईमेल'} />
        <button disabled={state.newMember.type === ''} onClick={() => handleAddMember()}>{state.user.language ? 'ADD' : 'जोड़ें'}</button>
      </div>
    </div>
  );
};

export default AddMember;