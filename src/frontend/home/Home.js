import { lazy } from "react";
import Details from "../details/Details";
import Filter from "../filter/Filter";
import Footer from "../footer/Footer";
import Header from "../header/Header";
import Tree from "../tree/Tree";
import './Home.css';
const AddMember = lazy(() => import("../member/AddMember"));
const EditMember = lazy(() => import("../member/EditMember"));
const DisplayUsers  = lazy(() => import("../user/DisplayUsers"));

const Home = ({ state, dispatch, members, getHindiText, getHindiNumbers }) => {
  return (
    <div className='home'>
      <Header state={state} dispatch={dispatch} getHindiText={getHindiText} />
      <Filter state={state} dispatch={dispatch} members={members} getHindiText={getHindiText} getHindiNumbers={getHindiNumbers} />
      <Tree state={state} dispatch={dispatch} getHindiText={getHindiText} getHindiNumbers={getHindiNumbers} />
      <Footer state={state} />
      {state.view ? <Details state={state} dispatch={dispatch} getHindiText={getHindiText} getHindiNumbers={getHindiNumbers} /> : ''}
      {state.isUserEditOpen ? <DisplayUsers state={state} dispatch={dispatch} getHindiText={getHindiText} getHindiNumbers={getHindiNumbers} /> : ''}
      {state.isMemberAddOpen ? <AddMember state={state} dispatch={dispatch} getHindiText={getHindiText} getHindiNumbers={getHindiNumbers} /> : ''}
      {state.isMemberEditOpen ? <EditMember state={state} dispatch={dispatch} getHindiText={getHindiText} getHindiNumbers={getHindiNumbers} /> : ''}
    </div>
  );
}

export default Home;