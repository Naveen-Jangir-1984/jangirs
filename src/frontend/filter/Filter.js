import { useState } from "react";
import './Filter.css';

const Filter = ({ state, dispatch, getHindiText, getHindiNumbers }) => {
  // const [aliveAndMarriedMales, setAliveAndMarriedMales] = useState(0);
  // const [deadAndMarriedMales, setDeadAndMarriedMales] = useState(0);
  const [men, setMen] = useState({
    village: '',
    gotra: ''
  })
  const [women, setWomen] = useState({
    village: '',
    gotra: ''
  })
  // count alive and married males
  let aliveAndMarriedMales = 0;
  const traverseAliveAndMarriedMales = (member) => {
    member.gender === 'M' && member.isAlive && member.wives?.length && aliveAndMarriedMales++;
    member.gender === 'M' && member.children?.map(child => traverseAliveAndMarriedMales(child));
  }
  const getAliveAndMarriedMales = () => {
    aliveAndMarriedMales = 0;
    state.members[0].gender === 'M' && state.members[0].isAlive && state.members[0].wives?.length && aliveAndMarriedMales++;
    state.members[0].gender === 'M' && state.members[0].children?.map(member => traverseAliveAndMarriedMales(member));
    return aliveAndMarriedMales;
  }
  // count dead and married males
  let deadAndMarriedMales = 0;
  const traverseDeadAndMarriedMales = (member) => {
    member.gender === 'M' && !member.isAlive && member.wives?.length && deadAndMarriedMales++;
    member.gender === 'M' && member.children?.map(child => traverseDeadAndMarriedMales(child));
  }
  const getDeadAndMarriedMales = () => {
    aliveAndMarriedMales = 0;
    state.members[0].gender === 'M' && !state.members[0].isAlive && state.members[0].wives?.length && deadAndMarriedMales++;
    state.members[0].gender === 'M' && state.members[0].children?.map(member => traverseDeadAndMarriedMales(member));
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
    state.members[0].gender === 'M' && state.members[0].isAlive && state.members[0].wives?.length === 0 && aliveAndUnmarriedMales++;
    state.members[0].gender === 'M' && state.members[0].children?.map(member => traverseAliveAndUnmarriedMales(member));
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
    state.members[0].gender === 'M' && !state.members[0].isAlive && state.members[0].wives?.length === 0 && deadAndUnmarriedMales++;
    state.members[0].gender === 'M' && state.members[0].children?.map(member => traverseDeadAndUnmarriedMales(member));
    return deadAndUnmarriedMales;
  }
  // count alive and married females
  let aliveAndMarriedFemales = 0;
  const traverseAliveAndMarriedFemales = (member) => {
    member.gender === 'F' && member.isAlive && member.village !== undefined && aliveAndMarriedFemales++
    member.children?.map(m => traverseAliveAndMarriedFemales(m))
  }
  const getAliveAndMarriedFemales = () => {
    aliveAndMarriedFemales = 0;
    state.members[0].children?.map(member => traverseAliveAndMarriedFemales(member))
    return aliveAndMarriedFemales;
  }
  // count married and dead females
  let deadAndMarriedFemales = 0;
  const traverseDeadAndMarriedFemales = (member) => {
    member.gender === 'F' && !member.isAlive && member.village !== undefined && deadAndMarriedFemales++
    member.children?.map(m => traverseDeadAndMarriedFemales(m))
  }
  const getDeadAndMarriedFemales = () => {
    deadAndMarriedFemales = 0;
    state.members[0].children?.map(member => traverseDeadAndMarriedFemales(member))
    return deadAndMarriedFemales;
  }
  // count unmarried and alive females
  let aliveAndUnmarriedFemales = 0;
  const traverseAliveAndUnmarriedFemales = (member) => {
    member.gender === 'F' && member.isAlive && member.village === undefined && aliveAndUnmarriedFemales++
    member.children?.map(child => traverseAliveAndUnmarriedFemales(child))
  }
  const getAliveAndUnmarriedFemales = () => {
    aliveAndUnmarriedFemales = 0;
    state.members[0].children?.map(member => traverseAliveAndUnmarriedFemales(member))
    return aliveAndUnmarriedFemales;
  }
  // count unmarried and dead females
  let deadAndUnmarriedFemales = 0;
  const traverseDeadAndUnmarriedFemales = (member) => {
    member.gender === 'F' && !member.isAlive && member.village === undefined && deadAndUnmarriedFemales++
    member.children?.map(child => traverseDeadAndUnmarriedFemales(child))
  }
  const getDeadAndUnmarriedFemales = () => {
    deadAndUnmarriedFemales = 0;
    state.members[0].children?.map(member => traverseDeadAndUnmarriedFemales(member))
    return deadAndUnmarriedFemales;
  }
  // count villages for men (works only with 1 wife)
  const villagesForMales = [];
  const traverseVillagesForMales = (member) => {
    member.gender === 'M' && member.wives?.length && member.wives[0].village?.length && villagesForMales.push(member.wives[0].village);
    member.gender === 'M' && member.children?.map((child) => traverseVillagesForMales(child));
  };
  const getVillagesForMales = () => {
    state.members.forEach(member => traverseVillagesForMales(member));
    return villagesForMales.filter((item, index, self) => self.indexOf(item) === index).sort();
  };
  // count gotras for men
  const gotrasForMales = [];
  const traverseGotrasForMales = (member) => {
    member.gender === 'M' && member.wives?.length && member.wives[0].gotra?.length && gotrasForMales.push(member.wives[0].gotra);
    member.gender === 'M' && member.children?.map(child => traverseGotrasForMales(child));
  };
  const getGotrasForMales = () => {
    state.members.forEach(member => traverseGotrasForMales(member));
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
    state.members[0].wives?.length && state.members[0].wives[0].village === village && villagesForMalesCountForDropdown++;
    state.members[0].gender === 'M' && state.members[0].children?.forEach((member) => traverseForMaleMembersWithVillages(member, village));
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
    state.members[0].wives?.length && state.members[0].wives[0].gotra === gotra && gotraForMalesCountForDropdown++;
    state.members[0].gender === 'M' && state.members[0].children?.forEach(member => traverseForMaleMembersWithGotra(member, gotra));
    return gotraForMalesCountForDropdown;
  };
  return (
    <div className='filter'>
      <fieldset className='filter-men'>
        <legend>{state.user.language ? 'Men' : 'पुरुष'}</legend>
        <select name='village' value={men.village} onChange={(e) => setMen({ ...men, [e.target.name]: e.target.value })}>
          <option value=''>{state.user.language ? `village (${getVillagesForMales().length})` : `ससुराल (${getHindiNumbers(getVillagesForMales().length.toString())})`}</option>
          {getVillagesForMales().map((village, i) => <option key={i} value={village}>{state.user.language ? `${village} (${getMaleMembersWithVillages(village)})` : `${getHindiText(village, 'village')} (${getHindiNumbers(getMaleMembersWithVillages(village).toString())})`}</option>)}
        </select>
        <div>
          <span>{state.user.language ? 
            `Married (${getAliveAndMarriedMales()} / ${getDeadAndMarriedMales()})` : 
            `विवाहित (${getHindiNumbers(getAliveAndMarriedMales().toString())} / ${getHindiNumbers(getDeadAndMarriedMales().toString())})`
          }</span>
          <span>{state.user.language ? 
            `Unmarried (${getAliveAndUnmarriedMales()} / ${getDeadAndUnmarriedMales()})` : 
            `अविवाहित (${getHindiNumbers(getAliveAndUnmarriedMales().toString())} / ${getHindiNumbers(getDeadAndUnmarriedMales().toString())})`
          }</span>
        </div>
        <select name='gotra' value={men.gotra} onChange={(e) => setMen({ ...men, [e.target.name]: e.target.value })}>
          <option value=''>{state.user.language ? `gotra (${getGotrasForMales().length})` : `गोत्र (${getHindiNumbers(getGotrasForMales().length.toString())})`}</option>
          {getGotrasForMales().map((gotra, i) => <option key={i} value={gotra}>{state.user.language ? `${gotra} (${getMaleMembersWithGotras(gotra)})` : `${getHindiText(gotra, 'gotra')} (${getHindiNumbers(getMaleMembersWithGotras(gotra).toString())})`}</option>)}
        </select>
      </fieldset>
      <fieldset className='filter-women'>
        <legend>{state.user.language ? 'Women' : 'महिलाएं'}</legend>
        <select name='village' value={women.village} onChange={(e) => setWomen({ ...women, [e.target.name]: e.target.value })}>
          <option value=''>{state.user.language ? 'village' : 'ससुराल'}</option>
        </select>
        <div>
          <span>{state.user.language ? 
            `Married (${getAliveAndMarriedFemales()} / ${getDeadAndMarriedFemales()})` : 
            `विवाहित (${getHindiNumbers(getAliveAndMarriedFemales().toString())} / ${getHindiNumbers(getDeadAndMarriedFemales().toString())})`
          }</span>
          <span>{state.user.language ? 
            `Unmarried (${getAliveAndUnmarriedFemales()} / ${getDeadAndUnmarriedFemales()} )` : 
            `अविवाहित (${getHindiNumbers(getAliveAndUnmarriedFemales().toString())} / ${getHindiNumbers(getDeadAndUnmarriedFemales().toString())})`
          }</span>
        </div>
        <select name='gotra' value={women.gotra} onChange={(e) => setWomen({ ...women, [e.target.name]: e.target.value })}>
          <option value=''>{state.user.language ? 'gotra' : 'गोत्र'}</option>
        </select>
      </fieldset>
    </div>
  );
}

export default Filter;