import { useCallback } from "react";
import { PlusIcon, MinusIcon, MaleProfileIcon, FemaleProfileIcon, MobileIcon, AddMemberIcon, EditMemberIcon, SMSIcon } from "../../utils/imageConstants";
import { useMemberCounts, useImageMap } from "../../hooks/useMemberStats";
import { collectMobileNumbers } from "../../utils/treeUtils";
import useTranslation from "../../hooks/useTranslation";
import "./Tree.css";

const Tree = ({ state, dispatch, getHindiText, getHindiNumbers }) => {
  // Pre-compute all member counts once when state.members changes
  const memberCounts = useMemberCounts(state.members);

  // Create O(1) image lookup map
  const imageMap = useImageMap(state.images);

  // Translation hook
  const isEnglish = state.user?.language;
  const { t } = useTranslation(isEnglish);

  // Memoized SMS click handler
  const handleSMSClick = useCallback((e, member) => {
    e.stopPropagation();
    const mobileNumbers = collectMobileNumbers(member);
    const recipients = mobileNumbers.join("; ");
    window.location.href = `sms:${recipients}`;
  }, []);

  const handleAddMember = useCallback(
    (e, member) => {
      e.stopPropagation();
      dispatch({ type: "openMemberAdd", member: member });
    },
    [dispatch],
  );

  const handleEditMember = useCallback(
    (e, member) => {
      e.stopPropagation();
      dispatch({ type: "openMemberEdit", member: member });
    },
    [dispatch],
  );

  const handleDisplayMember = useCallback(
    (e, member) => {
      e.stopPropagation();
      dispatch({ type: "openMemberDisplay", member: member });
    },
    [dispatch],
  );

  const displayMember = (member, depth, generation = 1, isFirstInGeneration = true) => {
    // O(1) lookups using maps
    const memberDP = imageMap.get(member.id);
    const counts = memberCounts.get(member.id) || { alive: 0, dead: 0 };

    return (
      <div key={member.id} style={{ marginLeft: `${depth}px`, position: "relative" }}>
        {isFirstInGeneration && <span style={{ position: "absolute", top: "-7px", left: "45px", fontSize: "8px", color: "black", zIndex: 1 }}>{isEnglish ? generation : getHindiNumbers(generation.toString())}</span>}
        <div className="member-card" style={{ backgroundColor: member.gender === "M" ? "#eee" : "#fdd" }} onClick={() => dispatch({ type: "toggle", id: member.id })}>
          <img className="toggle-icons" src={member.children?.length && member.isCollapsed ? PlusIcon : MinusIcon} alt={member.isCollapsed ? "+" : ""} loading="lazy" />
          <img className="display-pic" style={{ borderColor: member.isAlive ? "green" : "#f55" }} src={memberDP || (member.gender === "M" ? MaleProfileIcon : FemaleProfileIcon)} alt={member.id} onClick={(e) => handleDisplayMember(e, member)} loading="lazy" />
          {member.name !== "" ? <div style={{ color: member.isAlive ? "black" : "red" }}>{isEnglish ? member.name : getHindiText(member.name)}</div> : ""}
          {state.user.role === "admin" && member.mobile?.length ? (
            <a className="mobile-icons" href={`tel: ${member.mobile[0]}`}>
              <img onClick={(e) => e.stopPropagation()} src={MobileIcon} alt={member.mobile[0]} loading="lazy" />
            </a>
          ) : (
            ""
          )}
          {state.user.role === "admin" && member.mobile?.length ? <img className="mobile-icons" src={SMSIcon} alt={member.id} onClick={(e) => handleSMSClick(e, member)} loading="lazy" /> : ""}
          {member.gender === "F" && member.village ? <div style={{ marginBottom: "5px", fontSize: "8px" }}>{isEnglish ? member.village : getHindiText(member.village, "village")}</div> : ""}
          {member.gender === "F" && member.gotra && <div style={{ marginBottom: "5px", fontSize: "8px" }}>{isEnglish ? member.gotra : getHindiText(member.gotra, "gotra")}</div>}
          {member.wives?.length
            ? member.wives?.map((wife) => {
                const wifeDP = imageMap.get(wife.id);
                return (
                  <div className="member-wife-card" key={wife.id}>
                    <img
                      className="display-pic"
                      style={{ borderColor: wife.isAlive ? "green" : "#f55" }}
                      src={wifeDP || FemaleProfileIcon}
                      alt={wife.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch({ type: "openMemberDisplay", member: wife });
                      }}
                      loading="lazy"
                    />
                    {wife.name !== "" ? <div style={{ color: wife.isAlive ? "black" : "red" }}>{isEnglish ? wife.name : getHindiText(wife.name)}</div> : ""}
                    {wife.village !== "" ? <div style={{ marginBottom: "5px", fontSize: "8px" }}>{isEnglish ? wife.village : getHindiText(wife.village, "village")}</div> : ""}
                    {wife.gotra ? <div style={{ marginBottom: "5px", fontSize: "8px" }}>{isEnglish ? wife.gotra : getHindiText(wife.gotra, "gotra")}</div> : ""}
                  </div>
                );
              })
            : ""}
          {member.gender === "M" && member.village && <div style={{ fontSize: "8px", fontWeight: "bolder" }}>( {isEnglish ? `${t("settledIn")} ${member.village}` : `${getHindiText(member.village, "village")} ${t("in")} ${t("settled")}`} )</div>}
          <span className="memberCount">
            {isEnglish ? (
              <span>
                <span style={{ fontSize: "8px" }}>{counts.alive}</span>
                <span style={{ color: "red", fontSize: "6px" }}>{"/" + counts.dead}</span>
              </span>
            ) : (
              <span>
                <span style={{ fontSize: "8px" }}>{getHindiNumbers(counts.alive.toString())}</span>
                <span style={{ color: "red", fontSize: "6px" }}>{"/" + getHindiNumbers(counts.dead.toString())}</span>
              </span>
            )}
          </span>
          <div className="member-icons">
            {state.user.role === "admin" && member.gender === "M" ? <img src={AddMemberIcon} alt="add" onClick={(e) => handleAddMember(e, member)} loading="lazy" /> : ""}
            {state.user.role === "admin" ? <img src={EditMemberIcon} alt="edit" onClick={(e) => handleEditMember(e, member)} loading="lazy" /> : ""}
          </div>
        </div>
        <div style={{ display: member.isCollapsed ? "none" : "block" }}>{member.gender === "M" ? member.children?.map((child, index) => displayMember(child, depth + 5, generation + 1, index === 0)) : ""}</div>
      </div>
    );
  };
  return (
    // <div className='tree'>{state.members.map(member => displayMember(member, state.village === 'moruwa' ? 3 : 0))}</div>
    <div className="tree">{state.members.map((member, index) => displayMember(member, 0, member.generation || 1, index === 0))}</div>
  );
};

export default Tree;
