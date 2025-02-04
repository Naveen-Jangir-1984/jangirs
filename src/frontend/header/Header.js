import { useState } from "react";
import SignOutIcon from '../../images/signout.png'
import UserEditIcon from '../../images/user.png'
// import MemberEditIcon from '../../images/member.png'
import './Header.css';

const Header = ({ state, dispatch, getHindiText }) => {
  const [collapsed, setCollapsed] = useState(false);
  const handleSignOut = () => {
    const consent = window.confirm('Are you sure you want to sign out?');
    if(consent) {
      dispatch({type: 'signout'});
    }
  }
  return (
    <div className='header'>
      <button className='toggle-language' onClick={() => dispatch({type: 'language', flag: !state.user.language})}>{state.user.language ? getHindiText('Hindi') : 'English'}</button>
      <select value={state.village} onChange={(e) => dispatch({type: 'village', village: e.target.value})}>
        {state.villages.map((village, i) => <option key={i} value={village}>{state.user.language ? village.replace(village.charAt(0), village.charAt(0).toUpperCase()) : getHindiText(village.replace(village.charAt(0), village.charAt(0).toUpperCase()), 'village')}</option>)}
      </select>
      {state.user.role === 'admin' ? <img className='icons' src={UserEditIcon} alt='editUser' onClick={() => dispatch({type: 'openUserEdit'})} /> : ''}
      <img className='signout' src={SignOutIcon} alt='signout' onClick={() => handleSignOut()} />
      <button onClick={() => {
        setCollapsed(!collapsed)
        dispatch({type: 'toggle-all', flag: collapsed})
      }}>{collapsed ? (state.user.language ? 'close' : 'बंद करे') : (state.user.language ? 'Open' : 'खोलें')}</button>
    </div>
  );
}

export default Header;