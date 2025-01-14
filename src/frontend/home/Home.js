import Filter from "../filter/Filter";
import Header from "../header/Header";
import Tree from "../tree/Tree";
import './Home.css';

const Home = ({ state, dispatch, getHindiText, getHindiNumbers }) => {
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
        getHindiText={getHindiText} 
        getHindiNumbers={getHindiNumbers}
      />
      <Tree 
        state={state} 
        dispatch={dispatch} 
        getHindiText={getHindiText}  
        getHindiNumbers={getHindiNumbers}
      />
    </div>
  );
}

export default Home;