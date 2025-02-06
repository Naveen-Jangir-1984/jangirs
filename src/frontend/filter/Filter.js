import './Filter.css';

const Filter = ({ state, dispatch, members, getHindiText, getHindiNumbers }) => {
  const male = state.filters.male;
  const female = state.filters.female;
  // count alive and married males
  let aliveAndMarriedMales = 0;
  const traverseAliveAndMarriedMales = (member) => {
    member.gender === 'M' && member.isAlive && member.wives?.length && aliveAndMarriedMales++;
    member.gender === 'M' && member.children?.map(child => traverseAliveAndMarriedMales(child));
  }
  const getAliveAndMarriedMales = () => {
    aliveAndMarriedMales = 0;
    members.forEach(member => traverseAliveAndMarriedMales(member));
    return aliveAndMarriedMales;
  }
  // count dead and married males
  let deadAndMarriedMales = 0;
  const traverseDeadAndMarriedMales = (member) => {
    member.gender === 'M' && !member.isAlive && member.wives?.length && deadAndMarriedMales++;
    member.gender === 'M' && member.children?.map(child => traverseDeadAndMarriedMales(child));
  }
  const getDeadAndMarriedMales = () => {
    deadAndMarriedMales = 0;
    members.forEach(member => traverseDeadAndMarriedMales(member));
    return deadAndMarriedMales;
  }
  // count alive and unmarried males
  let aliveAndUnmarriedMales = 0;
  const traverseAliveAndUnmarriedMales = (member) => {
    member.gender === 'M' && member.isAlive && member.wives?.length === 0 && aliveAndUnmarriedMales++;
    member.gender === 'M' && member.children?.map(child => traverseAliveAndUnmarriedMales(child));
  }
  const getAliveAndUnmarriedMales = () => {
    aliveAndUnmarriedMales = 0;
    members.forEach(member => traverseAliveAndUnmarriedMales(member));
    return aliveAndUnmarriedMales;
  }
  // count dead and unmarried males
  let deadAndUnmarriedMales = 0;
  const traverseDeadAndUnmarriedMales = (member) => {
    member.gender === 'M' && !member.isAlive && member.wives?.length === 0 && deadAndUnmarriedMales++;
    member.gender === 'M' && member.children?.map(child => traverseDeadAndUnmarriedMales(child));
  }
  const getDeadAndUnmarriedMales = () => {
    deadAndUnmarriedMales = 0;
    members.forEach(member => traverseDeadAndUnmarriedMales(member));
    return deadAndUnmarriedMales;
  }
  // count alive and married females
  let aliveAndMarriedFemales = 0;
  const traverseAliveAndMarriedFemales = (member) => {
    member.gender === 'F' && member.isAlive && member.village !== undefined && aliveAndMarriedFemales++
    member.gender === 'M' && member.children?.map(m => traverseAliveAndMarriedFemales(m))
  }
  const getAliveAndMarriedFemales = () => {
    aliveAndMarriedFemales = 0;
    members.forEach(member => traverseAliveAndMarriedFemales(member))
    return aliveAndMarriedFemales;
  }
  // count married and dead females
  let deadAndMarriedFemales = 0;
  const traverseDeadAndMarriedFemales = (member) => {
    member.gender === 'F' && !member.isAlive && member.village !== undefined && deadAndMarriedFemales++
    member.gender === 'M' && member.children?.map(m => traverseDeadAndMarriedFemales(m))
  }
  const getDeadAndMarriedFemales = () => {
    deadAndMarriedFemales = 0;
    members.forEach(member => traverseDeadAndMarriedFemales(member))
    return deadAndMarriedFemales;
  }
  // count unmarried and alive females
  let aliveAndUnmarriedFemales = 0;
  const traverseAliveAndUnmarriedFemales = (member) => {
    member.gender === 'F' && member.isAlive && member.village === undefined && aliveAndUnmarriedFemales++
    member.gender === 'M' && member.children?.map(child => traverseAliveAndUnmarriedFemales(child))
  }
  const getAliveAndUnmarriedFemales = () => {
    aliveAndUnmarriedFemales = 0;
    members.forEach(member => traverseAliveAndUnmarriedFemales(member))
    return aliveAndUnmarriedFemales;
  }
  // count unmarried and dead females
  let deadAndUnmarriedFemales = 0;
  const traverseDeadAndUnmarriedFemales = (member) => {
    member.gender === 'F' && !member.isAlive && member.village === undefined && deadAndUnmarriedFemales++
    member.gender === 'M' && member.children?.map(child => traverseDeadAndUnmarriedFemales(child))
  }
  const getDeadAndUnmarriedFemales = () => {
    deadAndUnmarriedFemales = 0;
    members.forEach(member => traverseDeadAndUnmarriedFemales(member))
    return deadAndUnmarriedFemales;
  }
  // count villages for men
  let villagesForMales = [];
  const traverseVillagesForMales = (member) => {
    member.gender === 'M' && member.wives?.length && member.wives[0].village?.length && villagesForMales.push(member.wives[0].village);
    member.gender === 'M' && member.children?.map((child) => traverseVillagesForMales(child));
  };
  const getVillagesForMales = () => {
    villagesForMales = [];
    members.forEach(member => traverseVillagesForMales(member));
    return villagesForMales.filter((item, index, self) => self.indexOf(item) === index).sort();
  };
  // count gotras for men
  let gotrasForMales = [];
  const traverseGotrasForMales = (member) => {
    member.gender === 'M' && member.wives?.length && member.wives[0].gotra?.length && gotrasForMales.push(member.wives[0].gotra);
    member.gender === 'M' && member.children?.map(child => traverseGotrasForMales(child));
  };
  const getGotrasForMales = () => {
    gotrasForMales = [];
    members.forEach(member => traverseGotrasForMales(member));
    return gotrasForMales.filter((item, index, self) => self.indexOf(item) === index).sort();
  };
  // count villages for for village dropdown
  let villagesForMalesCountForDropdown = 0;
  const traverseForMaleMembersWithVillages = (member, village) => {
    member.wives?.length && member.wives[0].village === village && villagesForMalesCountForDropdown++;
    member.gender === 'M' && member.children?.forEach(member => traverseForMaleMembersWithVillages(member, village));
  };
  const getMaleMembersWithVillages = (village) => {
    villagesForMalesCountForDropdown = 0;
    members.forEach((member) => traverseForMaleMembersWithVillages(member, village));
    return villagesForMalesCountForDropdown;
  };
  // count gotras for for gotra dropdown
  let gotraForMalesCountForDropdown = 0;
  const traverseForMaleMembersWithGotra = (member, gotra) => {
    member.wives?.length && member.wives[0].gotra === gotra && gotraForMalesCountForDropdown++;
    member.gender === 'M' && member.children?.forEach(member => traverseForMaleMembersWithGotra(member, gotra));
  };
  const getMaleMembersWithGotras = (gotra) => {
    gotraForMalesCountForDropdown = 0;
    members.forEach(member => traverseForMaleMembersWithGotra(member, gotra));
    return gotraForMalesCountForDropdown;
  };
  // count villages for women
  let villagesForFemales = [];
  const traverseVillagesForFemales = (member) => {
    member.gender === 'F' && member.village !== undefined && villagesForFemales.push(member.village);
    member.gender === 'M' && member.children?.map(child => traverseVillagesForFemales(child));
  };
  const getVillagesForFemales = () => {
    villagesForFemales = [];
    members.forEach(member => traverseVillagesForFemales(member));
    return villagesForFemales.filter((item, index, self) => self.indexOf(item) === index).sort();
  };
  // count gotras for women
  let gotrasForFemales = [];
  const traverseGotrasForFemales = (member) => {
    member.gender === 'F' && member.gotra !== undefined && gotrasForFemales.push(member.gotra);
    member.gender === 'M' && member.children?.map(child => traverseGotrasForFemales(child));
  };
  const getGotrasForFemales = () => {
    gotrasForFemales = [];
    members.forEach(member => traverseGotrasForFemales(member));
    return gotrasForFemales.filter((item, index, self) => self.indexOf(item) === index).sort();
  };
  // count villages for for village dropdown
  let villagesForFemalesCountForDropdown = 0;
  const traverseForFemaleMembersWithVillages = (member, village) => {
    member.gender === 'F' && member.village !== undefined && member.village === village && villagesForFemalesCountForDropdown++;
    member.gender === 'M' && member.children?.forEach(member => traverseForFemaleMembersWithVillages(member, village));
  };
  const getFemaleMembersWithVillages = (village) => {
    villagesForFemalesCountForDropdown = 0;
    members.forEach(member => traverseForFemaleMembersWithVillages(member, village));
    return villagesForFemalesCountForDropdown;
  };
  // count gotras for for gotra dropdown
  let gotraForFemalesCountForDropdown = 0;
  const traverseForFemaleMembersWithGotra = (member, gotra) => {
    member.gender === 'F' && member.gotra !== undefined && member.gotra === gotra && gotraForFemalesCountForDropdown++;
    member.gender === 'M' && member.children?.forEach(member => traverseForFemaleMembersWithGotra(member, gotra));
  };
  const getFemaleMembersWithGotras = (gotra) => {
    gotraForFemalesCountForDropdown = 0;
    members.forEach(member => traverseForFemaleMembersWithGotra(member, gotra));
    return gotraForFemalesCountForDropdown;
  };
  return (
    <div className='filter' style={{filter: state.isMemberDisplayOpen || state.isMemberAddOpen || state.isMemberEditOpen ? 'blur(20px)' : 'none'}}>
      <div className='filter-label'>{state.user.language ? 'Men' : 'पुरुष'}</div>
      <div className='filter-men'>
        <select name='village' value={male.village} onChange={(e) => dispatch({ type: 'male-selection', village: e.target.value, gotra: '' })}>
          <option value=''>{state.user.language ? `village (${getVillagesForMales().length})` : `ससुराल (${getHindiNumbers(getVillagesForMales().length.toString())})`}</option>
          {getVillagesForMales().map((village, i) => <option key={i} value={village}>{state.user.language ? `${village} (${getMaleMembersWithVillages(village)})` : `${getHindiText(village, 'village')} (${getHindiNumbers(getMaleMembersWithVillages(village).toString())})`}</option>)}
        </select>
        <label>
          <span>{state.user.language ? 
            <><span>{`Married (${getAliveAndMarriedMales()}`}</span><span style={{fontSize: '8px', color: 'red'}}>{`/${getDeadAndMarriedMales()}`}</span>{`)`}</> : 
            <><span>{`विवाहित (${getHindiNumbers(getAliveAndMarriedMales().toString())}`}</span><span style={{fontSize: '8px', color: 'red'}}>{`/${getHindiNumbers(getDeadAndMarriedMales().toString())}`}</span>{`)`}</>
          }</span>
          {' '}
          <span>{state.user.language ? 
            <><span>{`Unmarried (${getAliveAndUnmarriedMales()}`}</span><span style={{fontSize: '8px', color: 'red'}}>{`/${getDeadAndUnmarriedMales()})`}</span></> : 
            <><span>{`अविवाहित (${getHindiNumbers(getAliveAndUnmarriedMales().toString())}`}</span><span style={{fontSize: '8px', color: 'red'}}>{`/${getHindiNumbers(getDeadAndUnmarriedMales().toString())}`}</span>{`)`}</>
          }</span>
        </label>
        <select name='gotra' value={male.gotra} onChange={(e) => dispatch({ type: 'male-selection', village: '', gotra: e.target.value })}>
          <option value=''>{state.user.language ? `gotra (${getGotrasForMales().length})` : `गोत्र (${getHindiNumbers(getGotrasForMales().length.toString())})`}</option>
          {getGotrasForMales().map((gotra, i) => <option key={i} value={gotra}>{state.user.language ? `${gotra} (${getMaleMembersWithGotras(gotra)})` : `${getHindiText(gotra, 'gotra')} (${getHindiNumbers(getMaleMembersWithGotras(gotra).toString())})`}</option>)}
        </select>
      </div>
      <div className='filter-label'>{state.user.language ? 'Women' : 'महिलाएं'}</div>
      <div className='filter-women'>
        <select name='village' value={female.village} onChange={(e) => dispatch({ type: 'female-selection', village: e.target.value, gotra: '' })}>
          <option value=''>{state.user.language ? `village (${getVillagesForFemales().length})` : `ससुराल (${getHindiNumbers(getVillagesForFemales().length.toString())})`}</option>
          {getVillagesForFemales().map((village, i) => <option key={i} value={village}>{state.user.language ? `${village} (${getFemaleMembersWithVillages(village)})` : `${getHindiText(village, 'village')} (${getHindiNumbers(getFemaleMembersWithVillages(village).toString())})`}</option>)}
        </select>
        <label>
          <span>{state.user.language ? 
            <><span>{`Married (${getAliveAndMarriedFemales()}`}</span><span style={{fontSize: '8px', color: 'red'}}>{`/${getDeadAndMarriedFemales()})`}</span></> : 
            <><span>{`विवाहित (${getHindiNumbers(getAliveAndMarriedFemales().toString())}`}</span><span style={{fontSize: '8px', color: 'red'}}>{`/${getHindiNumbers(getDeadAndMarriedFemales().toString())}`}</span>{`)`}</>
          }</span>
          {' '}
          <span>{state.user.language ? 
            <><span>{`Unmarried (${getAliveAndUnmarriedFemales()}`}</span><span style={{fontSize: '8px', color: 'red'}}>{`/${getDeadAndUnmarriedFemales()} )`}</span></> : 
            <><span>{`अविवाहित (${getHindiNumbers(getAliveAndUnmarriedFemales().toString())}`}</span><span style={{fontSize: '8px', color: 'red'}}>{`/${getHindiNumbers(getDeadAndUnmarriedFemales().toString())}`}</span>{`)`}</>
          }</span>
        </label>
        <select name='gotra' value={female.gotra} onChange={(e) => dispatch({ type: 'female-selection', village: '', gotra: e.target.value })}>
          <option value=''>{state.user.language ? `gotra (${getGotrasForFemales().length})` : `गोत्र (${getHindiNumbers(getGotrasForFemales().length.toString())})`}</option>
          {getGotrasForFemales().map((gotra, i) => <option key={i} value={gotra}>{state.user.language ? `${gotra} (${getFemaleMembersWithGotras(gotra)})` : `${getHindiText(gotra, 'gotra')} (${getHindiNumbers(getFemaleMembersWithGotras(gotra).toString())})`}</option>)}
        </select>
      </div>
    </div>
  );
}

export default Filter;