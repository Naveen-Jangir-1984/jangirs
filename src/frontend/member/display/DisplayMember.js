import CloseIcon from '../../../images/close.png'
import MaleProfileImage from '../../../images/male.png';
import FemaleProfileImage from '../../../images/female.png';
import './DisplayMember.css'

const DisplayMember = ({ state, dispatch, getHindiText, getHindiNumbers }) => {
  // calculate age
  const memberImage = state.images.find(image => image.id === state.memberToBeDisplayed.id);
  const memberDOB = state.memberToBeDisplayed.dob ? state.memberToBeDisplayed.dob : '';
  const memberMobiles = state.memberToBeDisplayed.mobile ? state.memberToBeDisplayed.mobile : [];
  const memberEmails = state.memberToBeDisplayed.email ? state.memberToBeDisplayed.email : [];
  const months = ['January', 'Februray', 'March', 'April', 'May', 'May', 'June', 'July', 'August', 'Septemeber', 'October', 'November', 'December']
  const getAge = (dateString) => {
    if (dateString.length === '') return 0;
    const dob = dateString.split(' ')
    var today = new Date();
    var age = today.getFullYear() - Number(dob[2]);
    var m = today.getMonth() - Number(months.indexOf(dob[1]));
    if (m < 0 || (m === 0 && today.getDate() < Number(dob[0]))) {
      age--;
    }
    return age;
  }
  const handleEditMember = async () => {
    dispatch({type: 'openMemberEdit', member: state.memberToBeDisplayed});
  }
  const handleDeleteMember = async (id) => {
    const consent = window.confirm('Are you sure you want to delete this member?');
    if (consent) {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/deleteMember`, {
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
    <div className='details' style={{ display: state.isMemberDisplayOpen ? 'flex' : 'none' }}>
      <img src={CloseIcon} alt='close' className='close' onClick={() => dispatch({type: 'closeMemberDisplay'})} />
      <div className='view'>
        <img style={{borderColor: state.memberToBeDisplayed.isAlive ? 'green' : '#f55'}} src={memberImage ? memberImage.src : state.memberToBeDisplayed.gender === 'M' ? MaleProfileImage : FemaleProfileImage} alt={state.memberToBeDisplayed.name} />
        <div>{state.user.language ? state.memberToBeDisplayed.name : getHindiText(state.memberToBeDisplayed.name, 'name')} {memberDOB && state.user.language ? <sup>{getAge(memberDOB ? memberDOB : '')}</sup> : memberDOB && !state.user.language ? <sup>{getHindiNumbers(getAge(memberDOB ? memberDOB : '').toString())}</sup> : ''}</div>
        {memberDOB && !state.user.language ? <div>{`${getHindiNumbers(memberDOB.split(' ')[0])} ${getHindiText(memberDOB.split(' ')[1], 'months')} ${getHindiNumbers(memberDOB.split(' ')[2])}`}</div> : <div>{memberDOB}</div>}
        <div className='view-mobile'>{memberMobiles.map((mobile, i) => <a key={i} href={`tel: ${mobile}`} onClick={(e) => e.stopPropagation()}>{mobile}</a>)}</div>
        <div className='view-email'>{memberEmails.map((email, i) => <a key={i} href={`mailto: ${email}`} onClick={(e) => e.stopPropagation()}>{email}</a>)}</div>
        <div className='view-actions'>
          {state.user.role === 'admin' ? <button onClick={() => handleEditMember()}>UPDATE</button> : ''}
          {state.user.role === 'admin' ? <button onClick={() => handleDeleteMember(state.memberToBeDisplayed.id)}>DELETE</button> : ''}
        </div>
      </div>
    </div>
  );
}

export default DisplayMember;