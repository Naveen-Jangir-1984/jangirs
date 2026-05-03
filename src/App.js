import CryptoJS from "crypto-js";
import { lazy, Suspense, useReducer, useState, useEffect, useCallback } from "react";
import { BGDImage } from "./utils/imageConstants";
import { fetchMemberImages } from "./utils/getImages";
import { INITIAL_NEW_MEMBER, INITIAL_NEW_USER, INITIAL_EDIT_INPUT, INITIAL_FILTERS, INITIAL_INPUT } from "./utils/constants";
import { addMemberToTree, editMemberInTree, deleteMemberFromTree, toggleMemberCollapse, toggleAllMembers, getMalesByVillage, getMalesByGotra, getFemalesByVillage, getFemalesByGotra, extractInitialCollapseStates, restoreCollapseStates } from "./utils/treeUtils";
import { transliterateToHindi as transliterateHindi } from "./utils/transliterate";
import "./App.css";

const SignIn = lazy(() => import("./frontend/signin/SignIn"));
const Home = lazy(() => import("./frontend/home/Home"));
const URL = process.env.REACT_APP_API_URL;
const port = process.env.REACT_APP_PORT;
const secretKey = process.env.REACT_APP_SECRET_KEY;

const decryptData = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

const App = () => {
  const [isServerDown, setIsServerDown] = useState("Connecting...");
  const [members, setMembers] = useState([]);
  const [englishToHindi, setEnglishToHindi] = useState();
  const [hindiToEnglish, setHindiToEnglish] = useState();

  const initialState = {
    user: undefined,
    users: [],
    images: [],
    dulania: [],
    moruwa: [],
    tatija: [],
    members: [],
    villages: [],
    village: "",
    filters: INITIAL_FILTERS,
    newUser: INITIAL_NEW_USER,
    newMember: INITIAL_NEW_MEMBER,
    input: INITIAL_INPUT,
    editInput: INITIAL_EDIT_INPUT,
    memberToBeDisplayed: "",
    memberToBeAdded: "",
    memberToBeEdited: "",
    isUserAddOpen: false,
    isMemberDisplayOpen: false,
    isUserEditOpen: false,
    isMemberAddOpen: false,
    isMemberEditOpen: false,
    visitors: "",
    initialCollapseStates: new Map(),
  };
  // Tree traversal functions are now imported from utils/treeUtils.js
  // invert englishToHindi to hindiToEnglish
  const invertEnglishToHindi = (obj) => {
    const result = {};
    for (const [category, values] of Object.entries(obj)) {
      result[category] = {};
      for (const [eng, hin] of Object.entries(values)) {
        // Capitalize each segment separated by hyphens but keep hyphens
        const formattedEnglish = eng
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join("-");

        // Invert mapping: Hindi → English (formatted)
        result[category][hin] = formattedEnglish;
      }
    }
    return result;
  };
  // convert hindi to english text
  const getEnglishText = (text, attribute) => {
    return text?.length
      ? text
          ?.split(" ")
          .map((word) => (attribute === "village" ? hindiToEnglish.villages[word] : attribute === "gotra" ? hindiToEnglish.gotras[word] : attribute === "months" ? hindiToEnglish.months[word] : hindiToEnglish.names[word]) || word)
          .join(" ")
      : "";
  };
  // convert hindi to english numbers
  const getEnglishNumbers = (text) => {
    const len = text.length;
    let result = "";
    for (let i = 0; i < len; i++) {
      result += hindiToEnglish.numbers[text.charAt(i)];
    }
    return result;
  };
  // convert english to hindi text
  const getHindiText = (text, attribute) => {
    if (!text?.length) return "";

    return text
      .split(" ")
      .map((word) => {
        const key = word.toLowerCase();
        let translation;

        if (attribute === "village") {
          translation = englishToHindi?.villages?.[key];
        } else if (attribute === "gotra") {
          translation = englishToHindi?.gotras?.[key];
        } else if (attribute === "months") {
          translation = englishToHindi?.months?.[key];
        } else {
          translation = englishToHindi?.names?.[key];
        }

        // Use custom transliteration as fallback for names, villages, and gotras
        if (!translation && attribute !== "months") {
          try {
            translation = transliterateHindi(word);
          } catch (e) {
            translation = word;
          }
        }

        return translation || word;
      })
      .join(" ");
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

  // Update englishToHindi cache with new member data
  const updateEnglishToHindi = (member) => {
    if (!englishToHindi) return;

    setEnglishToHindi((prev) => {
      const updated = { ...prev };

      // Add name translation if not exists
      if (member.name) {
        const nameKey = member.name.toLowerCase();
        if (!updated.names[nameKey]) {
          try {
            updated.names = { ...updated.names, [nameKey]: transliterateHindi(member.name) };
          } catch (e) {
            // Ignore errors
          }
        }
      }

      // Add village translation if not exists
      if (member.village) {
        const villageKey = member.village.toLowerCase();
        if (!updated.villages[villageKey]) {
          try {
            updated.villages = { ...updated.villages, [villageKey]: transliterateHindi(member.village) };
          } catch (e) {
            // Ignore errors
          }
        }
      }

      // Add gotra translation if not exists
      if (member.gotra) {
        const gotraKey = member.gotra.toLowerCase();
        if (!updated.gotras[gotraKey]) {
          try {
            updated.gotras = { ...updated.gotras, [gotraKey]: transliterateHindi(member.gotra) };
          } catch (e) {
            // Ignore errors
          }
        }
      }

      return updated;
    });
  };

  // Village/Gotra traversal functions are now imported from utils/treeUtils.js
  const reducer = (state, action) => {
    switch (action.type) {
      case "fetch_success":
        const db = action.initialState;
        const updatedMembersOnReload = action.village === "dulania" ? db.dulania : action.village === "moruwa" ? db.moruwa : action.village === "tatija" ? db.tatija : [];
        setMembers(updatedMembersOnReload);
        // Extract initial collapse states from all villages
        const allCollapseStates = new Map([...extractInitialCollapseStates(db.dulania), ...extractInitialCollapseStates(db.moruwa), ...extractInitialCollapseStates(db.tatija)]);
        return {
          user: action.user,
          users: db.users,
          dulania: db.dulania,
          moruwa: db.moruwa,
          tatija: db.tatija,
          members: updatedMembersOnReload,
          villages: db.villages,
          village: action.village,
          images: action.images || [],
          filters: INITIAL_FILTERS,
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
          isMemberEditOpen: state.isMemberEditOpen,
          visitors: db.visitors,
          initialCollapseStates: allCollapseStates,
        };
      case "openUserEdit":
        return {
          ...state,
          newUser: INITIAL_NEW_USER,
          isUserAddOpen: false,
          isUserEditOpen: true,
        };
      case "closeUserEdit":
        return {
          ...state,
          newUser: INITIAL_NEW_USER,
          isUserAddOpen: false,
          isUserEditOpen: false,
        };
      case "addNewUser":
        return {
          ...state,
          users: [...state.users, action.newUser],
          newUser: INITIAL_NEW_USER,
          isUserEditOpen: false,
        };
      case "deleteUser":
        return {
          ...state,
          users: state.users.filter((user) => user.username !== action.username),
          isUserEditOpen: false,
        };
      case "openMemberAdd":
        return {
          ...state,
          newMember: INITIAL_NEW_MEMBER,
          memberToBeAdded: action.member,
          memberToBeEdited: "",
          isMemberAddOpen: true,
        };
      case "closeMemberAdd":
        return {
          ...state,
          newMember: INITIAL_NEW_MEMBER,
          memberToBeAdded: "",
          memberToBeEdited: "",
          isMemberAddOpen: false,
          isMemberEditOpen: false,
        };
      case "openMemberEdit":
        return {
          ...state,
          editInput: {
            id: action.member.id,
            name: action.member.name ? action.member.name : "",
            mobile: action.member.mobile && action.member.mobile.length ? action.member.mobile.toString().replaceAll(",", ", ") : "",
            date: action.member.dob ? action.member.dob.split(" ")[0] : "",
            month: action.member.dob ? action.member.dob.split(" ")[1] : "",
            year: action.member.dob ? action.member.dob.split(" ")[2] : "",
            dateDeath: action.member.dod ? action.member.dod.split(" ")[0] : "",
            monthDeath: action.member.dod ? action.member.dod.split(" ")[1] : "",
            yearDeath: action.member.dod ? action.member.dod.split(" ")[2] : "",
            gender: action.member.gender ? action.member.gender : "",
            village: action.member.village ? action.member.village : "",
            gotra: action.member.gotra ? action.member.gotra : "",
            isAlive: action.member.isAlive ? "alive" : "dead",
            email: action.member.email && action.member.email.length ? action.member.email.toString().replaceAll(",", ", ") : "",
          },
          memberToBeEdited: action.member,
          isMemberEditOpen: true,
        };
      case "closeMemberEdit":
        return {
          ...state,
          editInput: INITIAL_EDIT_INPUT,
          memberToBeAdded: "",
          memberToBeEdited: "",
          isMemberAddOpen: false,
          isMemberEditOpen: false,
        };
      case "addMember":
        const updatedMembersPostAddMember = state.members.map((member) => addMemberToTree(member, state.memberToBeAdded.id, action.member, action.memberType));
        setMembers(updatedMembersPostAddMember);
        // Update englishToHindi with new member's name/village/gotra
        updateEnglishToHindi(action.member);
        return {
          ...state,
          members: updatedMembersPostAddMember,
          memberToBeAdded: "",
          memberToBeEdited: "",
          isMemberAddOpen: false,
          isMemberEditOpen: false,
        };
      case "editMember":
        const updatedMembersPostEditMember = state.members.map((member) => editMemberInTree(member, action.member));
        setMembers(updatedMembersPostEditMember);
        // Update englishToHindi with edited member's name/village/gotra
        updateEnglishToHindi(action.member);
        return {
          ...state,
          members: updatedMembersPostEditMember,
          memberToBeDisplayed: action.member, // Update displayed member with new data
          editInput: INITIAL_EDIT_INPUT,
          memberToBeAdded: "",
          memberToBeEdited: "",
          isMemberAddOpen: false,
          isMemberEditOpen: false,
        };
      case "deleteMember":
        const updatedMembersPostDeleteMember = state.members.map((member) => deleteMemberFromTree(member, action.id));
        setMembers(updatedMembersPostDeleteMember);
        return {
          ...state,
          members: updatedMembersPostDeleteMember,
          memberToBeDisplayed: "",
          memberToBeAdded: "",
          memberToBeEdited: "",
          isMemberDisplayOpen: false,
          isMemberAddOpen: false,
          isMemberEditOpen: false,
        };
      case "editInputNewMember":
        return {
          ...state,
          newMember: {
            ...state.newMember,
            [action.attribute]: action.value,
          },
        };
      case "editInputNewUser":
        return {
          ...state,
          newUser: {
            ...state.newUser,
            [action.attribute]: action.value,
          },
        };
      case "openAddNewUser":
        return {
          ...state,
          newUser: INITIAL_NEW_USER,
          isUserAddOpen: true,
        };
      case "closeAddNewUser":
        return {
          ...state,
          newUser: INITIAL_NEW_USER,
          isUserAddOpen: false,
        };
      case "input":
        return {
          ...state,
          input: {
            ...state.input,
            [action.attribute]: action.value,
          },
        };
      case "editInput":
        return {
          ...state,
          editInput: {
            ...state.editInput,
            [action.attribute]: action.value,
          },
        };
      case "signin":
        const error = state.users.find((user) => user.username === state.input.username && user.password === state.input.password);
        if (error) {
          setMembers(state.dulania);
          return {
            ...state,
            user: {
              username: state.input.username,
              password: state.input.password,
              role: state.users.find((user) => user.username === state.input.username).role,
              language: false,
            },
            village: "dulania",
            members: state.dulania,
            input: INITIAL_INPUT,
            newUser: INITIAL_NEW_USER,
            newMember: INITIAL_NEW_MEMBER,
            editInput: INITIAL_EDIT_INPUT,
          };
        } else {
          return {
            ...state,
            input: {
              ...state.input,
              error: true,
            },
          };
        }
      case "signout":
        sessionStorage.removeItem("appState");
        setMembers([]);
        return {
          ...state,
          user: undefined,
          filters: INITIAL_FILTERS,
          input: INITIAL_INPUT,
          newUser: INITIAL_NEW_USER,
          newMember: INITIAL_NEW_MEMBER,
          editInput: INITIAL_EDIT_INPUT,
          memberToBeDisplayed: "",
          memberToBeAdded: "",
          memberToBeEdited: "",
          isUserAddOpen: false,
          isMemberDisplayOpen: false,
          isUserEditOpen: false,
          isMemberAddOpen: false,
          isMemberEditOpen: false,
        };
      case "toggle":
        return {
          ...state,
          members: state.members.map((member) => toggleMemberCollapse(member, action.id)),
        };
      case "toggle-all":
        return {
          ...state,
          members: state.members.map((member) => toggleAllMembers(member, action.flag)),
        };
      case "reset-collapse":
        return {
          ...state,
          members: state.members.map((member) => restoreCollapseStates(member, state.initialCollapseStates)),
        };
      case "language":
        return {
          ...state,
          user: {
            ...state.user,
            language: action.flag,
          },
        };
      case "village":
        const updatedMembersPostVillageChange = action.village === "dulania" ? state.dulania : action.village === "moruwa" ? state.moruwa : action.village === "tatija" ? state.tatija : [];
        setMembers(updatedMembersPostVillageChange);
        return {
          ...state,
          members: updatedMembersPostVillageChange,
          village: action.village,
        };
      case "male-selection":
        return {
          ...state,
          members: action.village ? getMalesByVillage(members, action.village) : action.gotra ? getMalesByGotra(members, action.gotra) : members,
          filters: {
            male: {
              village: action.village,
              gotra: action.gotra,
            },
            female: {
              village: "",
              gotra: "",
            },
          },
        };
      case "female-selection":
        return {
          ...state,
          members: action.village ? getFemalesByVillage(members, action.village) : action.gotra ? getFemalesByGotra(members, action.gotra) : members,
          filters: {
            male: {
              village: "",
              gotra: "",
            },
            female: {
              village: action.village,
              gotra: action.gotra,
            },
          },
        };
      case "openMemberDisplay":
        return {
          ...state,
          isMemberDisplayOpen: true,
          memberToBeDisplayed: action.member,
          memberToBeAdded: "",
          memberToBeEdited: "",
        };
      case "closeMemberDisplay":
        return {
          ...state,
          isMemberDisplayOpen: false,
          memberToBeDisplayed: "",
          memberToBeAdded: "",
          memberToBeEdited: "",
        };
      case "updateImages":
        return {
          ...state,
          images: action.images || [],
        };
      default:
        return state;
    }
  };
  const fetchData = useCallback(async (user, village) => {
    try {
      // Fetch data and images in parallel
      const [dataResponse, memberImages] = await Promise.all([fetch(`${URL}:${port}/getData`), fetchMemberImages()]);
      const data = await dataResponse.text();
      const db = decryptData(data);
      sessionStorage.setItem(
        "appState",
        JSON.stringify({
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
            search: "",
            male: {
              village: "",
              gotra: "",
            },
            female: {
              village: "",
              gotra: "",
            },
          },
          input: {
            username: "",
            password: "",
            error: false,
          },
          newUser: {
            username: "",
            password: "",
            role: "user",
            error: false,
          },
          newMember: {
            type: "",
            name: "",
            mobile: "",
            email: "",
            date: "",
            month: "",
            year: "",
            dateDeath: "",
            monthDeath: "",
            yearDeath: "",
            isAlive: "alive",
            gender: "M",
            village: "",
            gotra: "",
          },
          editInput: {
            id: "",
            name: "",
            mobile: "",
            date: "",
            month: "",
            year: "",
            dateDeath: "",
            monthDeath: "",
            yearDeath: "",
            gender: "",
            village: "",
            gotra: "",
            email: "",
            isAlive: "",
          },
          memberToBeDisplayed: "",
          memberToBeAdded: "",
          memberToBeEdited: "",
          isUserAddOpen: false,
          isMemberDisplayOpen: false,
          isUserEditOpen: false,
          isMemberAddOpen: false,
          isMemberEditOpen: false,
          visitors: db.visitors,
        }),
      );
      setEnglishToHindi(db.englishToHindi);
      setHindiToEnglish(invertEnglishToHindi(db.englishToHindi));
      setIsServerDown("");
      dispatch({ type: "fetch_success", initialState: db, user: user, village: village, images: memberImages });
    } catch (error) {
      setIsServerDown("Server down. Please try again later.");
      dispatch({ type: "fetch_error", initialState: {}, user: user });
    }
  }, []);
  const [state, dispatch] = useReducer(reducer, initialState, (initial) => {
    const storedState = sessionStorage.getItem("appState");
    return storedState ? JSON.parse(storedState) : initial;
  });
  useEffect(() => {
    const storedState = sessionStorage.getItem("appState");
    if (storedState) {
      fetchData(JSON.parse(storedState).user, JSON.parse(storedState).village);
    } else {
      fetchData(undefined, "dulania");
    }
  }, [fetchData]);
  useEffect(() => {
    sessionStorage.setItem("appState", JSON.stringify(state));
  }, [state]);
  const info = <div style={{ padding: "1rem 2rem", borderRadius: "7px", backgroundColor: isServerDown === "Connecting..." ? "lightgreen" : "lightpink" }}>{isServerDown}</div>;
  return (
    <div className="app">
      {isServerDown !== "" ? info : <Suspense fallback={<div style={{ padding: "1rem 2rem", borderRadius: "7px", backgroundColor: "lightgrey" }}>Please wait...</div>}>{state.user ? <Home state={state} dispatch={dispatch} members={members} getHindiText={getHindiText} getHindiNumbers={getHindiNumbers} getEnglishText={getEnglishText} getEnglishNumbers={getEnglishNumbers} /> : <SignIn state={state} dispatch={dispatch} />}</Suspense>}
      <img className="bgd-image" src={BGDImage} alt="mata" loading="lazy" />
    </div>
  );
};

export default App;
