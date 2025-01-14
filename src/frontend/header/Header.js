import { useState } from "react";
import './Header.css';

const Header = ({ state, dispatch, getHindiText }) => {
  const [collapsed, setCollapsed] = useState(false)
  const [searchText, setSearchText] = useState('')
  return (
    <div className='header'>
      <button onClick={() => {
        setCollapsed(!collapsed)
        dispatch({type: 'toggle-all', flag: collapsed})
      }}>{collapsed ? (state.user.language ? 'close' : 'बंद करे') : (state.user.language ? 'open' : 'खोलें')}</button>
      <input 
        name='search'
        value={searchText} 
        placeholder={state.user.language ? 'search family members' : 'परिजनों को ढूंढे'}
        onChange={(e) => setSearchText(e.target.value)} 
      />
      <button onClick={() => dispatch({type: 'language', flag: !state.user.language})}>{state.user.language ? getHindiText('hindi') : 'english'}</button>
    </div>
  );
}

export default Header;