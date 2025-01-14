import PlusIcon from '../../images/plus.png'
import MinusIcon from '../../images/minus.png'
import MaleProfileIcon from '../../images/male.png'
import FemaleProfileIcon from '../../images/female.png'
import './Tree.css'

const Tree = ({ state, dispatch, getHindiText, getHindiNumbers }) => {
  const displayMember = (member, depth) => {
    return (
      <div key={member.id} style={{marginLeft: `${depth}px`}}>
        <div className='member-card' style={{backgroundColor: member.gender === 'M' ? '#eee' : '#fdd', color: member.isAlive ? 'black' : 'red'}} onClick={() => dispatch({type: 'toggle', id: member.id})}>
          <img className='toggle-icons' src={member.children?.length && member.isCollapsed ? PlusIcon : MinusIcon} alt={member.isCollapsed ? '+' : ''} />
          <img className='display-pic' src={member.dp ? member.dp?.src : member.gender === 'M' ? MaleProfileIcon : FemaleProfileIcon} alt={member.id} />
          <div>{state.user.language ? member.name : getHindiText(member.name)}</div>
          {member.wives?.map(wife => <div className='member-wife-card' key={wife.id}>
            <img className='display-pic' src={wife.dp ? wife.dp?.src : FemaleProfileIcon} alt={wife.id} />
            <div>{state.user.language ? wife.name : getHindiText(wife.name)}</div>
            <div>{state.user.language ? wife.village : getHindiText(wife.village, 'village')}</div>
            <div>{state.user.language ? wife.gotra : getHindiText(wife.gotra, 'gotra')}</div>
          </div>)}
        </div>
        <div style={{display: member.isCollapsed ? 'none' : 'block'}}>
          {member.children?.map(child => displayMember(child, depth + 3))}
        </div>
      </div>
    );
  }
  return (
    <div className='tree'>{displayMember(state.members[0], 0)}</div>
  );
}

export default Tree;