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
  // count villages for men
  let villagesForMales = [];
  const traverseVillagesForMales = (member) => {
    member.gender === 'M' && member.wives?.length && member.wives[0].village?.length && villagesForMales.push(member.wives[0].village);
    member.gender === 'M' && member.children?.map((child) => traverseVillagesForMales(child));
  };
  const getVillagesForMales = () => {
    villagesForMales = [];
    state.members.forEach(member => traverseVillagesForMales(member));
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
  // count villages for women
  let villagesForFemales = [];
  const traverseVillagesForFemales = (member) => {
    member.gender === 'F' && member.village !== undefined && villagesForFemales.push(member.village);
    member.children?.map(child => traverseVillagesForFemales(child));
  };
  const getVillagesForFemales = () => {
    villagesForFemales = [];
    state.members.forEach(member => traverseVillagesForFemales(member));
    return villagesForFemales.filter((item, index, self) => self.indexOf(item) === index).sort();
  };
  // count gotras for women
  let gotrasForFemales = [];
  const traverseGotrasForFemales = (member) => {
    member.gender === 'F' && member.gotra !== undefined && gotrasForFemales.push(member.gotra);
    member.children?.map(child => traverseGotrasForFemales(child));
  };
  const getGotrasForFemales = () => {
    gotrasForFemales = [];
    state.members.forEach(member => traverseGotrasForFemales(member));
    return gotrasForFemales.filter((item, index, self) => self.indexOf(item) === index).sort();
  };
  // count villages for for village dropdown
  let villagesForFemalesCountForDropdown = 0;
  const traverseForFemaleMembersWithVillages = (member, village) => {
    member.gender === 'F' && member.village !== undefined && member.village === village && villagesForFemalesCountForDropdown++;
    member.children?.forEach(member => traverseForFemaleMembersWithVillages(member, village));
  };
  const getFemaleMembersWithVillages = (village) => {
    villagesForFemalesCountForDropdown = 0;
    state.members[0].children?.forEach(member => traverseForFemaleMembersWithVillages(member, village));
    return villagesForFemalesCountForDropdown;
  };
  // count gotras for for gotra dropdown
  let gotraForFemalesCountForDropdown = 0;
  const traverseForFemaleMembersWithGotra = (member, gotra) => {
    member.gender === 'F' && member.gotra !== undefined && member.gotra === gotra && gotraForFemalesCountForDropdown++;
    member.children?.forEach(member => traverseForFemaleMembersWithGotra(member, gotra));
  };
  const getFemaleMembersWithGotras = (gotra) => {
    gotraForFemalesCountForDropdown = 0;
    state.members[0].children?.forEach(member => traverseForFemaleMembersWithGotra(member, gotra));
    return gotraForFemalesCountForDropdown;
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
          <option value=''>{state.user.language ? `village (${getVillagesForFemales().length})` : `ससुराल (${getHindiNumbers(getVillagesForFemales().length.toString())})`}</option>
          {getVillagesForFemales().map((village, i) => <option key={i} value={village}>{state.user.language ? `${village} (${getFemaleMembersWithVillages(village)})` : `${getHindiText(village, 'village')} (${getHindiNumbers(getFemaleMembersWithVillages(village).toString())})`}</option>)}
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
          <option value=''>{state.user.language ? `gotra (${getGotrasForFemales().length})` : `गोत्र (${getHindiNumbers(getGotrasForFemales().length.toString())})`}</option>
          {getGotrasForFemales().map((gotra, i) => <option key={i} value={gotra}>{state.user.language ? `${gotra} (${getFemaleMembersWithGotras(gotra)})` : `${getHindiText(gotra, 'gotra')} (${getHindiNumbers(getFemaleMembersWithGotras(gotra).toString())})`}</option>)}
        </select>
      </fieldset>
    </div>
  );
}

export default Filter;