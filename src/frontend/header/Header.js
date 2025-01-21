import { useState } from "react";
import AddUserIcon from '../../images/add.png'
import SignOutIcon from '../../images/signout.png'
import './Header.css';

const Header = ({ state, dispatch, getHindiText }) => {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className='header'>
      <button onClick={() => {
        setCollapsed(!collapsed)
        dispatch({type: 'toggle-all', flag: collapsed})
      }}>{collapsed ? (state.user.language ? 'close' : 'बंद करे') : (state.user.language ? 'Open' : 'खोलें')}</button>
      <select value={state.village} onChange={(e) => dispatch({type: 'village', village: e.target.value})}>
        {state.villages.map((village, i) => <option key={i} value={village}>{state.user.language ? village.replace(village.charAt(0), village.charAt(0).toUpperCase()) : getHindiText(village.replace(village.charAt(0), village.charAt(0).toUpperCase()), 'village')}</option>)}
      </select>
      {state.user.username === 'bsjangir' && <img className='addIcon' src={AddUserIcon} alt='add' onClick={() => dispatch({type: 'openAddUser'})} />}
      <img className='signout' src={SignOutIcon} alt='signout' onClick={() => dispatch({type: 'signout'})} />
      <button onClick={() => dispatch({type: 'language', flag: !state.user.language})}>{state.user.language ? getHindiText('Hindi') : 'English'}</button>
    </div>
  );
}

export default Header;