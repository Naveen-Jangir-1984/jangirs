import { lazy, Suspense, useState } from "react";
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
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const isModalOpen = state.isMemberDisplayOpen || state.isUserEditOpen || state.isMemberAddOpen || state.isMemberEditOpen || isConfirmOpen;

  return (
    <div className={`home ${isModalOpen ? "modal-open" : ""}`}>
      <Header state={state} dispatch={dispatch} getHindiText={getHindiText} getHindiNumbers={getHindiNumbers} isModalOpen={isModalOpen} onConfirmChange={setIsConfirmOpen} />
      <Filter state={state} dispatch={dispatch} members={members} getHindiText={getHindiText} getHindiNumbers={getHindiNumbers} isModalOpen={isModalOpen} />
      <Tree state={state} dispatch={dispatch} getHindiText={getHindiText} getHindiNumbers={getHindiNumbers} isModalOpen={isModalOpen} />
      <Footer state={state} />
      <Suspense fallback={null}>
        {state.isMemberDisplayOpen && <DisplayMember state={state} dispatch={dispatch} getHindiText={getHindiText} getHindiNumbers={getHindiNumbers} onConfirmChange={setIsConfirmOpen} />}
        {state.isUserEditOpen && <DisplayUsers state={state} dispatch={dispatch} getHindiText={getHindiText} getHindiNumbers={getHindiNumbers} onConfirmChange={setIsConfirmOpen} />}
        {state.isMemberAddOpen && <AddMember state={state} dispatch={dispatch} getHindiText={getHindiText} getHindiNumbers={getHindiNumbers} getEnglishText={getEnglishText} getEnglishNumbers={getEnglishNumbers} onConfirmChange={setIsConfirmOpen} />}
        {state.isMemberEditOpen && <EditMember state={state} dispatch={dispatch} getHindiText={getHindiText} getHindiNumbers={getHindiNumbers} getEnglishText={getEnglishText} getEnglishNumbers={getEnglishNumbers} onConfirmChange={setIsConfirmOpen} />}
      </Suspense>
    </div>
  );
};

export default Home;
