import CryptoJS from "crypto-js";
import { lazy, Suspense, useReducer, useState, useEffect } from 'react';
import BGDImage from './images/mata-mandir.jpg';
import { IMAGES } from "./utils/getImages";
import './App.css';
const SignIn = lazy(() => import("./frontend/signin/SignIn"));
const Home = lazy(() => import("./frontend/home/Home"));
const URL = process.env.REACT_APP_API_URL;
const port = process.env.REACT_APP_PORT;
const secretKey = process.env.REACT_APP_SECRET_KEY;

const decryptData = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

const App = () => {
  const [isServerDown, setIsServerDown] = useState('Connecting...');
  const [images] = useState(IMAGES);
  const [members, setMembers] = useState([]);
  const [englishToHindi, setEnglishToHindi] = useState();
  const initialState = {
    user: undefined,
    users: [],
    images: [],
    dulania: [],
    moruwa: [],
    tatija: [],
    members: [],
    villages: [],
    village: '',
    filters: {
      search: '',
      male: {
        village: '',
        gotra: ''
      },
      female: {
        village: '',
        gotra: ''
      }
    },
    newUser: {
      username: '',
      password: '',
      role: 'user',
      error: false
    },
    newMember: {
      type: '',
      name: '',
      mobile: '',
      email: '',
      date: '',
      month: '',
      year: '',
      dateDeath: '',
      monthDeath: '',
      yearDeath: '',
      isAlive: 'alive',
      gender: 'M',
      village: '',
      gotra: ''
    },
    input: {
      username: '',
      password: '',
      error: false
    },
    editInput: {
      id: '',
      name: '',
      mobile: '',
      date: '',
      month: '',
      year: '',
      dateDeath: '',
      monthDeath: '',
      yearDeath: '',
      gender: '',
      village: '',
      gotra: '',
      email: '',
      isAlive: ''
    },
    memberToBeDisplayed: '',
    memberToBeAdded: '',
    memberToBeEdited: '',
    isUserAddOpen: false,
    isMemberDisplayOpen: false,
    isUserEditOpen: false,
    isMemberAddOpen: false,
    isMemberEditOpen: false
  }
  // traverse to add a member
  const addMember = (tree, id, member, type) => {
    if (!tree) return null;
    if (tree.id === id && type === 'child') {
      if (tree.children) {
        tree.children.push(member);
      } else {
        tree.children = [member];
      }
      return tree;
    }
    else if(tree.id === id && type === 'wife') {
      if (tree.wives) {
        tree.wives.push(member);
      } else {
        tree.wives = [member]
      }
      return tree;
    }
    tree.children?.forEach(child => addMember(child, id, member, type));
    return tree;
  }
  // traverse to edit a member
  const editMemberById = (tree, member) => {
    if (!tree) return null;
    if (tree.id === member.id) {
      tree.name = member.name;
      tree.gender = member.gender;
      tree.isAlive = member.isAlive;
      tree.dob = member.dob;
      tree.dod = member.dod;
      tree.village = member.village;
      tree.gotra = member.gotra;
      tree.email = member.email;
      tree.mobile = member.mobile;
    }
    if (tree.children) {
      tree.children = tree.children.map(child => {
        if(child.id === member.id) {
          child.name = member.name;
          child.gender = member.gender;
          child.isAlive = member.isAlive;
          child.dob = member.dob;
          child.dod = member.dod;
          child.village = member.village;
          child.gotra = member.gotra;
          child.email = member.email;
          child.mobile = member.mobile;
        }
        return child;
      });
    }
    tree.children?.forEach(child => editMemberById(child, member));
    if(tree.wives) {
      tree.wives = tree.wives.map(wife => {
        if(wife.id === member.id) {
          wife.name = member.name;
          wife.gender = member.gender;
          wife.isAlive = member.isAlive;
          wife.dob = member.dob;
          wife.dod = member.dod;
          wife.village = member.village;
          wife.gotra = member.gotra;
          wife.email = member.email;
          wife.mobile = member.mobile;
        }
        return wife;
      });      
    }
    tree.wives?.forEach(wife => editMemberById(wife, member));
    return tree;
  };
  // traverse to delete a member
  const deleteMemberById = (tree, id) => {
    if (!tree) return null;
    if (tree.children) {
      tree.children = tree.children.filter(child => child.id !== id);
    }
    tree.children?.forEach(child => deleteMemberById(child, id));
    if(tree.wives) {
      tree.wives = tree.wives.filter(wife => wife.id !== id);      
    }
    tree.wives?.forEach(wife => deleteMemberById(wife, id));
    return tree;
  };
  // traverse members to expand or collapse
  const traverseMemberToExpandOrCollapse = (member, id) => {
    if(member.id === id && member.gender === 'M') {
      member.isCollapsed = !member.isCollapsed
    }
    member.children?.map(child => traverseMemberToExpandOrCollapse(child, id))
    return member;
  }
  // traverse members to either expand all or collapse all
  const traverseMemberToExpandOrCollapseAll = (member, flag) => {
    member.isCollapsed = flag
    member.gender === 'M' && member.children?.map(child => traverseMemberToExpandOrCollapseAll(child, flag))
    return member;
  }
  // convert english to hindi text
  const getHindiText = (text, attribute) => {
    return text?.length
      ? text
        ?.split(" ")
        .map(
          (word) =>
            (attribute === "village"
              ? englishToHindi.villages[word.toLowerCase()]
              : attribute === "gotra"
                ? englishToHindi.gotras[word.toLowerCase()]
                : attribute === "months"
                  ? englishToHindi.months[word.toLowerCase()]
                  : englishToHindi.names[word.toLowerCase()]
            ) || word,
        )
        .join(" ")
      : "";
  };
  // convert english to hindi numbers
  const getHindiNumbers = (text) => {
    const len = text.length;
    let result = "";
    for (let i = 0; i < len; i++) {
      result += englishToHindi.numbers[text.charAt(i)];
    }
    return result;
  };
  // get village members
  const traverseMaleVillageMembers = (members, village) => {
    let result = [];
    for (const member of members) {
      if (member.wives?.length && member.wives[0].village === village) {
        result.push(member);
      }
      if (member.gender === 'M' && member.children?.length) {
        result = result.concat(traverseMaleVillageMembers(member.children, village));
      }
    }
    return result;
  };
  // get village members
  const traverseFemaleVillageMembers = (members, village) => {
    let result = [];
      for (const member of members) {
      if (member.gender === 'F' && member.gotra !== undefined && member.village === village) {
        result.push(member);
      }  
      if (member.gender === 'M' && member.children?.length) {
        result = result.concat(traverseFemaleVillageMembers(member.children, village));
      }
    }  
    return result;
  };
  // get gotra members
  const traverseMaleGotraMembers = (members, gotra) => {
    let result = [];  
    for (const member of members) {
      if (member.wives?.length && member.wives[0].gotra === gotra) {
        result.push(member);
      }  
      if (member.gender === 'M' && member.children?.length) {
        result = result.concat(traverseMaleGotraMembers(member.children, gotra));
      }
    }  
    return result;
  };
  const traverseFemaleGotraMembers = (members, gotra) => {
    let result = [];  
    for (const member of members) {
      if (member.gender === 'F' && member.village !== undefined && member.gotra === gotra) {
        result.push(member);
      }  
      if (member.gender === 'M' && member.children?.length) {
        result = result.concat(traverseFemaleGotraMembers(member.children, gotra));
      }
    }  
    return result;
  };
  const reducer = (state, action) => {
    switch (action.type) {
      case 'fetch_success':
        const db = action.initialState;
        const updatedMembersOnReload = action.village === 'dulania' ? db.dulania : action.village === 'moruwa' ? db.moruwa : action.village === 'tatija' ? db.tatija : []
        setMembers(updatedMembersOnReload);
        return {
          user: action.user,
          users: db.users,
          dulania: db.dulania,
          moruwa: db.moruwa,
          tatija: db.tatija,
          members: updatedMembersOnReload,
          villages: db.villages,
          village: action.village,
          images: images,
          filters: {
            search: '',
            male: {
              village: '',
              gotra: ''
            },
            female: {
              village: '',
              gotra: ''
            }
          },
          newUser: state.newUser,
          newMember: state.newMember,
          input: state.input,
          editInput: state.editInput,
          memberToBeDisplayed: state.memberToBeDisplayed,
          memberToBeAdded: state.memberToBeAdded,
          memberToBeEdited: state.memberToBeEdited,
          isUserAddOpen: state.isUserAddOpen,
          isMemberDisplayOpen: state.isMemberDisplayOpen,
          isUserEditOpen: state.isUserEditOpen,
          isMemberAddOpen: state.isMemberAddOpen,
          isMemberEditOpen: state.isMemberEditOpen
        };
      case 'openUserEdit':
        return {
          ...state,
          newUser: {
            username: '',
            password: '',
            role: 'user',
            error: false
          },
          isUserAddOpen: false,
          isUserEditOpen: true
        };
      case 'closeUserEdit':
        return {
          ...state,
          newUser: {
            username: '',
            password: '',
            role: 'user',
            error: false
          },
          isUserAddOpen: false,
          isUserEditOpen: false
        };
      case 'addNewUser':
        return {
          ...state,
          users: [...state.users, action.newUser],
          newUser: {
            username: '',
            password: '',
            role: 'user',
            error: false
          },
          isUserEditOpen: false
        };
      case 'deleteUser':
        return {
          ...state,
          users: state.users.filter(user => user.username !== action.username),
          isUserEditOpen: false
        };
      case 'openMemberAdd':
        return {
          ...state,
          newMember: {
            type: '',
            name: '',
            mobile: '',
            email: '',
            date: '',
            month: '',
            year: '',
            dateDeath: '',
            monthDeath: '',
            yearDeath: '',
            isAlive: 'alive',
            gender: 'M',
            village: '',
            gotra: ''
          },
          memberToBeAdded: action.member,
          memberToBeEdited: '',
          isMemberAddOpen: true
        };
      case 'closeMemberAdd':
        return {
          ...state,
          newMember: {
            type: '',
            name: '',
            mobile: '',
            email: '',
            date: '',
            month: '',
            year: '',
            dateDeath: '',
            monthDeath: '',
            yearDeath: '',
            isAlive: 'alive',
            gender: 'M',
            village: '',
            gotra: ''
          },
          memberToBeAdded: '',
          memberToBeEdited: '',
          isMemberAddOpen: false,
          isMemberEditOpen: false
        };
      case 'openMemberEdit':
        return {
          ...state,
          editInput: {
            id: action.member.id,
            name: action.member.name ? action.member.name : '',
            mobile: action.member.mobile && action.member.mobile.length ? action.member.mobile.toString().replaceAll(',', ', ') : '',
            date: action.member.dob ? action.member.dob.split(' ')[0] : '',
            month: action.member.dob ? action.member.dob.split(' ')[1] : '',
            year: action.member.dob ? action.member.dob.split(' ')[2] : '',
            dateDeath: action.member.dod ? action.member.dod.split(' ')[0] : '',
            monthDeath: action.member.dod ? action.member.dod.split(' ')[1] : '',
            yearDeath: action.member.dod ? action.member.dod.split(' ')[2] : '',
            gender: action.member.gender ? action.member.gender : '',
            village: action.member.village ? action.member.village : '',
            gotra: action.member.gotra ? action.member.gotra : '',
            isAlive: action.member.isAlive ? 'alive' : 'dead',
            email: action.member.email && action.member.email.length ? action.member.email.toString().replaceAll(',', ', ') : ''
          },
          memberToBeEdited: action.member,
          isMemberEditOpen: true
        };
      case 'closeMemberEdit':
        return {
          ...state,
          editInput: {
            id: '',
            name: '',
            mobile: '',
            date: '',
            month: '',
            year: '',
            dateDeath: '',
            monthDeath: '',
            yearDeath: '',
            gender: '',
            village: '',
            gotra: '',
            email: '',
            isAlive: ''
          },
          memberToBeAdded: '',
          memberToBeEdited: '',
          isMemberAddOpen: false,
          isMemberEditOpen: false
        };
      case 'addMember':
        const updatedMembersPostAddMember = state.members.map(member => addMember(member, state.memberToBeAdded.id, action.member, action.memberType))
        setMembers(updatedMembersPostAddMember);
        return {
          ...state,
          members: updatedMembersPostAddMember,
          memberToBeAdded: '',
          memberToBeEdited: '',
          isMemberAddOpen: false,
          isMemberEditOpen: false
        };
      case 'editMember':
        const updatedMembersPostEditMember = state.members.map(member => editMemberById(member, action.member));
        setMembers(updatedMembersPostEditMember);
        return {
          ...state,
          members: updatedMembersPostEditMember,
          editInput: {
            id: '',
            name: '',
            mobile: '',
            date: '',
            month: '',
            year: '',
            dateDeath: '',
            monthDeath: '',
            yearDeath: '',
            gender: '',
            village: '',
            gotra: '',
            email: '',
            isAlive: ''
          },
          memberToBeAdded: '',
          memberToBeEdited: '',
          isMemberAddOpen: false,
          isMemberEditOpen: false
        };
      case 'deleteMember':
      const updatedMembersPostDeleteMember = state.members.map(member => deleteMemberById(member, action.id));
      setMembers(updatedMembersPostDeleteMember);
      return {
        ...state,
        members: updatedMembersPostDeleteMember,
        memberToBeDisplayed: '',
        memberToBeAdded: '',
        memberToBeEdited: '',
        isMemberDisplayOpen: false,
        isMemberAddOpen: false,
        isMemberEditOpen: false
      };
      case 'editInputNewMember':
        return {
          ...state,
          newMember: {
            ...state.newMember,
            [action.attribute]: action.value
          }
        };
      case 'editInputNewUser':
        return {
          ...state,
          newUser: {
            ...state.newUser,
            [action.attribute]: action.value
          }
        };
      case 'openAddNewUser':
        return {
          ...state,
          newUser: {
            username: '',
            password: '',
            role: 'user',
            error: false
          },
          isUserAddOpen: true
        };
      case 'closeAddNewUser':
        return {
          ...state,
          newUser: {
            username: '',
            password: '',
            role: 'user',
            error: false
          },
          isUserAddOpen: false
        };
      case 'input':
        return {
          ...state,
          input: {
            ...state.input,
            [action.attribute]: action.value
          }
        };
      case 'editInput':
        return {
          ...state,
          editInput: {
            ...state.editInput,
            [action.attribute]: action.value
          }
        };
      case 'signin':
        const error = state.users.find(user => user.username === state.input.username && user.password === state.input.password)
        if(error) {
          setMembers(state.dulania);
          return {
            ...state,
            user: {
              username: state.input.username,
              password: state.input.password,
              role: state.users.find(user => user.username === state.input.username).role,
              language: false
            },
            village: 'dulania',
            members: state.dulania,
            input: {
              username: '',
              password: '',
              error: false
            },
            newUser: {
              username: '',
              password: '',
              role: 'user',
              error: false
            },
            newMember: {
              type: '',
              name: '',
              mobile: '',
              email: '',
              date: '',
              month: '',
              year: '',
              dateDeath: '',
              monthDeath: '',
              yearDeath: '',
              isAlive: 'alive',
              gender: 'M',
              village: '',
              gotra: ''
            },
            editInput: {
              id: '',
              name: '',
              mobile: '',
              date: '',
              month: '',
              year: '',
              dateDeath: '',
              monthDeath: '',
              yearDeath: '',
              gender: '',
              village: '',
              gotra: '',
              email: '',
              isAlive: ''
            }
          };
        } else {
          return {
            ...state,
            input: {
              ...state.input,
              error: true
            }
          }
        };
      case 'signout':
        sessionStorage.removeItem('appState');
        setMembers([]);
        return {
          ...state,
          user: undefined,
          filters: {
            search: '',
            male: {
              village: '',
              gotra: ''
            },
            female: {
              village: '',
              gotra: ''
            }
          },
          input: {
            username: '',
            password: '',
            error: false
          },
          newUser: {
            username: '',
            password: '',
            role: 'user',
            error: false
          },
          newMember: {
            type: '',
            name: '',
            mobile: '',
            email: '',
            date: '',
            month: '',
            year: '',
            dateDeath: '',
            monthDeath: '',
            yearDeath: '',
            isAlive: 'alive',
            gender: 'M',
            village: '',
            gotra: ''
          },
          editInput: {
            id: '',
            name: '',
            mobile: '',
            date: '',
            month: '',
            year: '',
            dateDeath: '',
            monthDeath: '',
            yearDeath: '',
            gender: '',
            village: '',
            gotra: '',
            email: '',
            isAlive: ''
          },
          memberToBeDisplayed: '',
          memberToBeAdded: '',
          memberToBeEdited: '',
          isUserAddOpen: false,
          isMemberDisplayOpen: false,
          isUserEditOpen: false,
          isMemberAddOpen: false,
          isMemberEditOpen: false,
        };
      case 'toggle':
        return {
          ...state,
          members: state.members.map(member => traverseMemberToExpandOrCollapse(member, action.id))
        };
      case 'toggle-all':
        return {
          ...state,
          members: state.members.map(member => traverseMemberToExpandOrCollapseAll(member, action.flag))
        };
      case 'language':
        return {
          ...state,
          user: {
            ...state.user,
            language: action.flag
          }
        };
      case 'village':
        const updatedMembersPostVillageChange = action.village === 'dulania' ? state.dulania : action.village === 'moruwa' ? state.moruwa : action.village === 'tatija' ? state.tatija : [];
        setMembers(updatedMembersPostVillageChange);
        return {
          ...state,
          members: updatedMembersPostVillageChange,
          village: action.village
        };
      case 'male-selection':
        return {
          ...state,
          members: action.village ? traverseMaleVillageMembers(members, action.village) : action.gotra ? traverseMaleGotraMembers(members, action.gotra) : members,
          filters: {
            male: {
              village: action.village,
              gotra: action.gotra
            },
            female: {
              village: '',
              gotra: ''
            }
          }
        };
      case 'female-selection':
        return {
          ...state,
          members: action.village ? traverseFemaleVillageMembers(members, action.village) : action.gotra ? traverseFemaleGotraMembers(members, action.gotra) : members,
          filters: {
            male: {
              village: '',
              gotra: ''
            },
            female: {
              village: action.village,
              gotra: action.gotra
            }
          }
        };
      case 'openMemberDisplay':
        return {
          ...state,
          isMemberDisplayOpen: true,
          memberToBeDisplayed: action.member,
          memberToBeAdded: '',
          memberToBeEdited: '',
        };
      case 'closeMemberDisplay':
        return {
          ...state,
          isMemberDisplayOpen: false,
          memberToBeDisplayed: '',
          memberToBeAdded: '',
          memberToBeEdited: '',
        };
      default:
        return state;
    }
  }
  const fetchData = async (user, village) => {
    try {
      const response = await fetch(`${URL}:${port}/getData`);
      const data = await response.text();
      const db = decryptData(data);
      sessionStorage.setItem('appState', JSON.stringify({
        user: user,
        users: db.users,
        dulania: db.dulania,
        moruwa: db.moruwa,
        tatija: db.tatija,
        members: db.dulania,
        villages: db.villages,
        // images: db.images,
        village: village,
        filters: {
          search: '',
          male: {
            village: '',
            gotra: ''
          },
          female: {
            village: '',
            gotra: ''
          }
        },
        input: {
          username: '',
          password: '',
          error: false
        },
        newUser: {
          username: '',
          password: '',
          role: 'user',
          error: false
        },
        newMember: {
          type: '',
          name: '',
          mobile: '',
          email: '',
          date: '',
          month: '',
          year: '',
          dateDeath: '',
          monthDeath: '',
          yearDeath: '',
          isAlive: 'alive',
          gender: 'M',
          village: '',
          gotra: ''
        },
        editInput: {
          id: '',
          name: '',
          mobile: '',
          date: '',
          month: '',
          year: '',
          dateDeath: '',
          monthDeath: '',
          yearDeath: '',
          gender: '',
          village: '',
          gotra: '',
          email: '',
          isAlive: ''
        },
        memberToBeDisplayed: '',
        memberToBeAdded: '',
        memberToBeEdited: '',
        isUserAddOpen: false,
        isMemberDisplayOpen: false,
        isUserEditOpen: false,
        isMemberAddOpen: false,
        isMemberEditOpen: false
      }));
      setEnglishToHindi(db.englishToHindi);
      setIsServerDown('');
      dispatch({ type: 'fetch_success', initialState: db, user: user, village: village });
    } catch (error) {
      setIsServerDown('Server down. Please try again later.');
      dispatch({ type: 'fetch_error', initialState: {}, user: user });
    }
  };
  const [state, dispatch] = useReducer(reducer, initialState, (initial) => {
    const storedState = sessionStorage.getItem('appState');
    return storedState ? JSON.parse(storedState) : initial;
  });
  useEffect(() => {
    const storedState = sessionStorage.getItem('appState');
    if(storedState) {
      fetchData(JSON.parse(storedState).user, JSON.parse(storedState).village);
    } else {
      fetchData(undefined, 'dulania');
    }
  }, []);
  useEffect(() => {
    sessionStorage.setItem('appState', JSON.stringify(state));
  }, [state]);
  const info = <div style={{ padding: '1rem 2rem', borderRadius: '7px', backgroundColor: isServerDown === 'Connecting...' ? 'lightgreen' : 'lightpink' }}>{isServerDown}</div>;
  return (
    <div className="app">
      { isServerDown !== '' ?
      info :
      <Suspense fallback={<div style={{ padding: '1rem 2rem', borderRadius: '7px', backgroundColor: 'lightgrey'}}>Please wait...</div>}>
        {
          state.user ?
          <Home
            state={state} 
            dispatch={dispatch} 
            members={members}
            getHindiText={getHindiText} 
            getHindiNumbers={getHindiNumbers}
          /> :
          <SignIn state={state} dispatch={dispatch} />
        }
      </Suspense> }
      <img className="bgd-image" src={BGDImage} alt="mata" loading='lazy' />
    </div>
  );
}

export default App;
