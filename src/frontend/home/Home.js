import Details from "../details/Details";
import Filter from "../filter/Filter";
import Footer from "../footer/Footer";
import Header from "../header/Header";
import AddMember from "../member/AddMember";
import EditMember from "../member/EditMember";
import Tree from "../tree/Tree";
import DisplayUsers from "../user/DisplayUsers";
import './Home.css';

const Home = ({ state, dispatch, members, getHindiText, getHindiNumbers }) => {
  return (
    <div className='home'>
      <Header 
        state={state} 
        dispatch={dispatch} 
        getHindiText={getHindiText} 
      />
      <Filter 
        state={state} 
        dispatch={dispatch} 
        members={members}
        getHindiText={getHindiText} 
        getHindiNumbers={getHindiNumbers}
      />
      <Tree 
        state={state} 
        dispatch={dispatch}
        getHindiText={getHindiText}  
        getHindiNumbers={getHindiNumbers}
      />
      <Footer state={state} />
      <Details
        state={state} 
        dispatch={dispatch}
        getHindiText={getHindiText}  
        getHindiNumbers={getHindiNumbers}
      />
      <DisplayUsers
        state={state} 
        dispatch={dispatch}
        getHindiText={getHindiText}  
        getHindiNumbers={getHindiNumbers}
      />
      <AddMember
        state={state} 
        dispatch={dispatch}
        getHindiText={getHindiText}  
        getHindiNumbers={getHindiNumbers}
      />
      <EditMember
        state={state} 
        dispatch={dispatch}
        getHindiText={getHindiText}  
        getHindiNumbers={getHindiNumbers}
      />
    </div>
  );
}

export default Home;