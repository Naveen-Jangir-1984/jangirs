import CloseIcon from '../../../images/close.png';
import MaleProfileImage from '../../../images/male.png';
import FemaleProfileImage from '../../../images/female.png';
// import DOBIcon from '../../../images/birth.png';
// import DODIcon from '../../../images/death.png';
import MobileIcon from '../../../images/mobile.jpg';
import EmailIcon from '../../../images/email.png';
import './DisplayMember.css';
const URL = process.env.REACT_APP_API_URL;
const PORT = process.env.REACT_APP_PORT;

const DisplayMember = ({ state, dispatch, getHindiText, getHindiNumbers }) => {
  // calculate age
  const memberImage = state.images.find(image => image.id === state.memberToBeDisplayed.id);
  const memberDOB = state.memberToBeDisplayed.dob ? state.memberToBeDisplayed.dob : '';
  const memberDOD = state.memberToBeDisplayed.dod ? state.memberToBeDisplayed.dod : '';
  const memberMobiles = state.memberToBeDisplayed.mobile ? state.memberToBeDisplayed.mobile : [];
  const memberEmails = state.memberToBeDisplayed.email ? state.memberToBeDisplayed.email : [];
  const months = ['January', 'Februray', 'March', 'April', 'May', 'May', 'June', 'July', 'August', 'Septemeber', 'October', 'November', 'December']
  const getAge = (dobString, dodString) => {
    if (dobString.length === 0) return 0;
    const dob = dobString.split(' ');
    if(dobString.length && dodString.length === 0) {
      var today = new Date();
      var age = today.getFullYear() - Number(dob[2]);
      var m = today.getMonth() - Number(months.indexOf(dob[1]));
      if (m < 0 || (m === 0 && today.getDate() < Number(dob[0]))) {
        age--;
      }
      return age;
    } else if(dobString.length && dodString.length) {
      const dod = dodString.split(' ');
      age = Number(dod[2]) - Number(dob[2]);
      m = Number(months.indexOf(dod[1])) - Number(months.indexOf(dob[1]));
      if (m < 0 || (m === 0 && Number(dod[0]) < Number(dob[0]))) {
        age--;
      }
      return age;
    }
  }
  const handleAddMember = async () => {
    dispatch({type: 'openMemberAdd', member: state.memberToBeDisplayed});
  }
  const handleEditMember = async () => {
    dispatch({type: 'openMemberEdit', member: state.memberToBeDisplayed});
  }
  const handleDeleteMember = async (id) => {
    const consent = window.confirm(state.user.language ? 'Are you sure you want to delete the member?' : 'क्या आप वाकई सदस्य को हटाना चाहते हैं?');
    if (consent) {
      const response = await fetch(`${URL}:${PORT}/deleteMember`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: id, village: state.village })})
      const data = await response.json();
      if (data.result === 'success') {
        dispatch({type: 'deleteMember', id: id});
      }
    }
  }
  return (
    <div className='details' style={{ display: state.isMemberDisplayOpen ? 'flex' : 'none', filter: state.isMemberEditOpen ? 'blur(20px)' : 'none' }}>
      <img src={CloseIcon} alt='close' className='close' onClick={() => dispatch({type: 'closeMemberDisplay'})} />
      <div className='view'>
        <img style={{boxShadow: state.memberToBeDisplayed.isAlive ? '0 0 50px lightgreen' : '0 0 50px #f55'}} src={memberImage ? memberImage.src : state.memberToBeDisplayed.gender === 'M' ? MaleProfileImage : FemaleProfileImage} alt={state.memberToBeDisplayed.name} />
        <div className='info'>
          <div>{state.user.language ? state.memberToBeDisplayed.name : getHindiText(state.memberToBeDisplayed.name, 'name')} {memberDOB && state.user.language ? <sup>Age: {getAge(memberDOB ? memberDOB : '', memberDOD ? memberDOD : '')}</sup> : memberDOB && !state.user.language ? <sup>उम्र: {getHindiNumbers(getAge(memberDOB ? memberDOB : '', memberDOD ? memberDOD : '').toString())}</sup> : ''}</div>
          {memberDOB && !state.user.language ? 
          <div className='dob'>
            {/* <img className='icons' src={DOBIcon} alt='birth' /> */}
            <span style={{fontWeight: 'bolder'}}>जन्म:</span>
            <span>{`${getHindiNumbers(memberDOB.split(' ')[0])} ${getHindiText(memberDOB.split(' ')[1], 'months')} ${getHindiNumbers(memberDOB.split(' ')[2])}`}</span>
          </div> : memberDOB && state.user.language ? 
          <div className='dob'>
            {/* <img className='icons' src={DOBIcon} alt='birth' /> */}
            <span style={{fontWeight: 'bolder'}}>Birth:</span>
            <span>{memberDOB}</span>
          </div> : ''}
          {memberDOD && !state.user.language ? 
          <div className='dod'>
            {/* <img className='icons' src={DODIcon} alt='death' /> */}
            <span style={{fontWeight: 'bolder'}}>मृत्यु:</span>
            <span>{`${getHindiNumbers(memberDOD.split(' ')[0])} ${getHindiText(memberDOD.split(' ')[1], 'months')} ${getHindiNumbers(memberDOD.split(' ')[2])}`}</span>
          </div> : memberDOD && state.user.language ?
          <div className='dod'>
            {/* <img className='icons' src={DODIcon} alt='death' /> */}
            <span style={{fontWeight: 'bolder'}}>Death:</span>
            <span>{memberDOD}</span>
          </div> : ''}
          {memberMobiles.length ? <div className='view-mobile'>
            <img className='icons' src={MobileIcon} alt='mobile' />
            <span className='view-mobile'>{memberMobiles.map((mobile, i) => <a key={i} href={`tel: ${mobile}`} onClick={(e) => e.stopPropagation()}>{mobile}</a>)}</span>
          </div> : ''}
          {memberEmails.length ? <div className='view-email'>
            <img className='icons' src={EmailIcon} alt='email' />
            <span className='view-email'>{memberEmails.map((email, i) => <a key={i} href={`mailto: ${email}`} onClick={(e) => e.stopPropagation()}>{email}</a>)}</span>
          </div> : ''}
          <div className='view-actions'>
            {state.user.role === 'admin' ? <button onClick={() => handleAddMember()}>{state.user.language ? 'ADD_MEMBER' : 'सदस्य_जोड़ें'}</button> : ''}
            {state.user.role === 'admin' ? <button onClick={() => handleEditMember()}>{state.user.language ? 'UPDATE' : 'नवीनीकरण'}</button> : ''}
            {state.user.role === 'admin' ? <button onClick={() => handleDeleteMember(state.memberToBeDisplayed.id)}>{state.user.language ? 'DELETE' : 'हटाएँ'}</button> : ''}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DisplayMember;