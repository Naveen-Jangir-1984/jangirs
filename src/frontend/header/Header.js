import { useState } from "react";
import SignOutIcon from '../../images/signout.png'
import './Header.css';

const Header = ({ state, dispatch, getHindiText }) => {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className='header'>
      <button onClick={() => {
        setCollapsed(!collapsed)
        dispatch({type: 'toggle-all', flag: collapsed})
      }}>{collapsed ? (state.user.language ? 'close' : 'बंद करे') : (state.user.language ? 'open' : 'खोलें')}</button>
      <select value={state.village} onChange={(e) => dispatch({type: 'village', village: e.target.value})}>
        <option value='dulania'>{state.user.language ? 'Dulania' : getHindiText('Dulania', 'village')}</option>
        <option value='moruwa'>{state.user.language ? 'Moruwa' : getHindiText('Moruwa', 'village')}</option>
      </select>
      <img className='signout' src={SignOutIcon} alt='signout' onClick={() => dispatch({type: 'signout'})} />
      <button onClick={() => dispatch({type: 'language', flag: !state.user.language})}>{state.user.language ? getHindiText('hindi') : 'english'}</button>
    </div>
  );
}

export default Header;