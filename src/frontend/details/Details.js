import CloseIcon from '../../images/close.png'
import './Details.css'

const Details = ({ state, dispatch, getHindiText, getHindiNumbers }) => {
  // calculate age
  const months = ['January', 'Februray', 'March', 'April', 'May', 'May', 'June', 'July', 'August', 'Septemeber', 'October', 'November', 'December']
  const getAge = (dateString) => {
    if (!dateString.length) return ''
    const dob = dateString.split(' ')
    var today = new Date();
    var age = today.getFullYear() - Number(dob[2]);
    var m = today.getMonth() - Number(months.indexOf(dob[1]));
    if (m < 0 || (m === 0 && today.getDate() < Number(dob[0]))) {
      age--;
    }
    return age;
  }
  const handleDeleteMember = async (id) => {
    const consent = window.confirm('Are you sure you want to delete this member?');
    if (consent) {
      const response = await fetch('http://115.117.107.101:27001/deleteMember', {
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
    <div className='details' style={{ display: state.view ? 'flex' : 'none' }}>
      <img src={CloseIcon} alt='close' className='close' onClick={() => dispatch({type: 'exitView'})} />
      <div className='view'>
        {state.viewData.src && <img src={state.viewData.src} alt={state.viewData.name} />}
        <div>{state.user.language ? state.viewData.name : getHindiText(state.viewData.name, 'name')} {state.viewData.dob?.length && state.user.language ? <sup>{getAge(state.viewData.dob)}</sup> : <sup>{getHindiNumbers(getAge(state.viewData.dob).toString())}</sup>}</div>
        {state.viewData.dob?.length && !state.user.language ? <div>{`${getHindiNumbers(state.viewData.dob.split(' ')[0])} ${getHindiText(state.viewData.dob.split(' ')[1], 'months')} ${getHindiNumbers(state.viewData.dob.split(' ')[2])}`}</div> : <div>{state.viewData.dob}</div>}
        {state.viewData.mobile.length ? <div className='view-mobile'>{state.viewData.mobile.map((mo, i) => <a key={i} href={`tel: ${mo}`} onClick={(e) => e.stopPropagation()}>{mo}</a>)}</div> : ''}
        {state.viewData.email.length ? <div className='view-email'>{state.viewData.email.map((em, i) => <a key={i} href={`mailto: ${em}`} onClick={(e) => e.stopPropagation()}>{em}</a>)}</div> : ''}
        {state.user.role === 'admin' && <button onClick={() => handleDeleteMember(state.viewData.id)}>Delete</button>}
      </div>
    </div>
  );
}

export default Details;