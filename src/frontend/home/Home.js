import { lazy } from "react";
import Filter from "../filter/Filter";
import Footer from "../footer/Footer";
import Header from "../header/Header";
import Tree from "../tree/Tree";
import "./Home.css";
const DisplayMember = lazy(() => import("../member/display/DisplayMember"));
const AddMember = lazy(() => import("../member/add/AddMember"));
const EditMember = lazy(() => import("../member/edit/EditMember"));
const DisplayUsers = lazy(() => import("../user/DisplayUsers"));

const Home = ({ state, dispatch, members, getHindiText, getHindiNumbers, getEnglishText, getEnglishNumbers }) => {
  return (
    <div className="home">
      <Header state={state} dispatch={dispatch} getHindiText={getHindiText} />
      <Filter state={state} dispatch={dispatch} members={members} getHindiText={getHindiText} getHindiNumbers={getHindiNumbers} />
      <Tree state={state} dispatch={dispatch} getHindiText={getHindiText} getHindiNumbers={getHindiNumbers} />
      <Footer state={state} />
      {state.isMemberDisplayOpen ? <DisplayMember state={state} dispatch={dispatch} getHindiText={getHindiText} getHindiNumbers={getHindiNumbers} /> : ""}
      {state.isUserEditOpen ? <DisplayUsers state={state} dispatch={dispatch} getHindiText={getHindiText} getHindiNumbers={getHindiNumbers} /> : ""}
      {state.isMemberAddOpen ? <AddMember state={state} dispatch={dispatch} getHindiText={getHindiText} getHindiNumbers={getHindiNumbers} getEnglishText={getEnglishText} getEnglishNumbers={getEnglishNumbers} /> : ""}
      {state.isMemberEditOpen ? <EditMember state={state} dispatch={dispatch} getHindiText={getHindiText} getHindiNumbers={getHindiNumbers} getEnglishText={getEnglishText} getEnglishNumbers={getEnglishNumbers} /> : ""}
    </div>
  );
};

export default Home;
