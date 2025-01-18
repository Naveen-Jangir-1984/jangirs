import PlusIcon from '../../images/plus.png'
import MinusIcon from '../../images/minus.png'
import MaleProfileIcon from '../../images/male.png'
import FemaleProfileIcon from '../../images/female.png'
import MobileIcon from '../../images/mobile.jpg'
import SMSIcon from '../../images/sms.png'
import './Tree.css'

const Tree = ({ state, dispatch, getHindiText, getHindiNumbers }) => {
  // count alive members
  let count = 0;
  const traverseCount = (member, flag) => {
    flag ? member.isAlive && count++ : member.isAlive && member.gender === "M" && count++;
    member.children?.forEach(child => traverseCount(child, false));
    member.wives?.forEach(child => traverseCount(child, true));
  };
  const countMembers = (member) => {
    count = 0;
    member.children?.forEach(member => traverseCount(member, false));
    member.wives?.forEach(member => traverseCount(member, true));
    return member.isAlive ? count + 1 : count;
  };

  // count dead members
  let countDead;
  const traverseDeadCount = (member, flag) => {
    flag ? !member.isAlive && countDead++ : !member.isAlive && member.gender === "M" && countDead++;
    member.children?.forEach(child => traverseDeadCount(child, false));
    member.wives?.forEach(child => traverseDeadCount(child, true));
  };
  const countDeadMembers = (member) => {
    countDead = 0;
    member.gender === 'M' && member.children?.forEach((member) => traverseDeadCount(member, false));
    member.wives?.forEach((member) => traverseDeadCount(member, true));
    return !member.isAlive ? countDead + 1 : countDead;
  };
  // get all mobils numbers
  let mobileNumbers = []
  const traverseMembersForMobile = (member) => {
    member.mobile !== undefined && member.mobile?.length && mobileNumbers.push(member.mobile[0])
    member.gender === 'M' && member.children?.map(child => traverseMembersForMobile(child))
  }
  const getMembersMobileNumbers = (member) => {
    mobileNumbers = []
    member.mobile !== undefined && member.mobile?.length && mobileNumbers.push(member.mobile[0])
    member.gender === 'M' && member.children?.map(child => traverseMembersForMobile(child))
  }
  // handle sms click
  const handleSMSClick = (e, member) => {
    e.stopPropagation();
    getMembersMobileNumbers(member);
    const recipients = mobileNumbers.join('; ');
    // const messageBody = encodeURIComponent('SAVE ! बचाओ !');
    // window.location.href = `sms:${recipients}&body=${messageBody}`;
    window.location.href = `sms:${recipients}`;
    // or
    // window.location.href = 'mailto:';  // For email on mobile devices
  };
  const displayMember = (member, depth) => {
    return (
      <div key={member.id} style={{marginLeft: `${depth}px`}}>
        <div className='member-card' style={{backgroundColor: member.gender === 'M' ? '#eee' : '#fdd'}} onClick={() => dispatch({type: 'toggle', id: member.id})}>
          <img className='toggle-icons' src={member.children?.length && member.isCollapsed ? PlusIcon : MinusIcon} alt={member.isCollapsed ? '+' : ''} />
          <img className='display-pic' src={member.dp ? member.dp?.src : member.gender === 'M' ? MaleProfileIcon : FemaleProfileIcon} alt={member.id} onClick={(e) => {e.stopPropagation(); dispatch({type: 'view', member: member});}} />
          {member.name && <div style={{color: member.isAlive ? 'black' : 'red'}}>{state.user.language ? member.name : getHindiText(member.name)}</div>}
          {member.mobile?.length && <a className="mobile-icons" href={`tel: ${member.mobile[0]}`}><img onClick={(e) => e.stopPropagation()} src={MobileIcon} alt={member.mobile[0]} /></a>}
          {member.mobile?.length && <img className='mobile-icons' src={SMSIcon} alt={member.id} onClick={(e) => handleSMSClick(e, member)} />}
          {member.wives?.map(wife => <div className='member-wife-card' key={wife.id}>
            <img className='display-pic' src={wife.dp ? wife.dp?.src : FemaleProfileIcon} alt={wife.id} onClick={(e) => {e.stopPropagation(); dispatch({type: 'view', member: wife});}} />
            {wife.name && <div style={{color: wife.isAlive ? 'black' : 'red'}}>{state.user.language ? wife.name : getHindiText(wife.name)}</div>}
            {wife.village && <div style={{marginBottom: '5px', fontSize: '7px'}}>{state.user.language ? wife.village : getHindiText(wife.village, 'village')}</div>}
            {/* {wife.gotra && <div style={{marginBottom: '10px'}}>.</div>} */}
            {wife.gotra && <div style={{marginBottom: '5px', fontSize: '7px'}}>{state.user.language ? wife.gotra : getHindiText(wife.gotra, 'gotra')}</div>}
          </div>)}
          <span className="memberCount" style={{}}>
            {state.user.language ?
              <span>
                <span style={{ fontSize: "8px" }}>{countMembers(member)}</span>
                <span style={{ color: "red", fontSize: "6px" }}>
                  {"/" + countDeadMembers(member)}
                </span>
              </span> :
              <span>
                <span style={{ fontSize: "8px" }}>
                  {getHindiNumbers(countMembers(member).toString())}
                </span>
                <span style={{ color: "red", fontSize: "6px" }}>
                  {"/" + getHindiNumbers(countDeadMembers(member).toString())}
                </span>
              </span>
            }
          </span>
        </div>
        <div style={{display: member.isCollapsed ? 'none' : 'block'}}>
          {member.gender === 'M' && member.children?.map(child => displayMember(child, depth + 5))}
        </div>
      </div>
    );
  }
  return (
    <div className='tree'>{state.members.map(member => displayMember(member, 0))}</div>
  );
}

export default Tree;