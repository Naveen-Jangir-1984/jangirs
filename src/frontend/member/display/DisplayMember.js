import CloseIcon from "../../../images/close.png";
import MaleProfileImage from "../../../images/male.png";
import FemaleProfileImage from "../../../images/female.png";
// import DOBIcon from '../../../images/birth.png';
// import DODIcon from '../../../images/death.png';
import MobileIcon from "../../../images/mobile.jpg";
import EmailIcon from "../../../images/email.png";
import "./DisplayMember.css";
const URL = process.env.REACT_APP_API_URL;
const PORT = process.env.REACT_APP_PORT;

const DisplayMember = ({ state, dispatch, getHindiText, getHindiNumbers }) => {
  // calculate age
  const memberImage = state.images.find((image) => image.id === state.memberToBeDisplayed.id);
  const memberDOB = state.memberToBeDisplayed.dob ? state.memberToBeDisplayed.dob : "";
  const memberDOD = state.memberToBeDisplayed.dod ? state.memberToBeDisplayed.dod : "";
  const memberMobiles = state.memberToBeDisplayed.mobile ? state.memberToBeDisplayed.mobile : [];
  const memberEmails = state.memberToBeDisplayed.email ? state.memberToBeDisplayed.email : [];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const getAge = (dobString, dodString) => {
    if (!dobString || dobString.length === 0) return { years: 0, months: 0, days: 0 };
    const dobParts = dobString.split(" ");
    const birthDate = new Date(dobParts[2], months.indexOf(dobParts[1]), dobParts[0]);
    const endDate = !dodString || dodString.length === 0 ? new Date() : new Date(dodString.split(" ")[2], months.indexOf(dodString.split(" ")[1]), dodString.split(" ")[0]);
    let years = endDate.getFullYear() - birthDate.getFullYear();
    let monthsDiff = endDate.getMonth() - birthDate.getMonth();
    let daysDiff = endDate.getDate() - birthDate.getDate();
    if (daysDiff < 0) {
      monthsDiff--;
      const prevMonth = new Date(endDate.getFullYear(), endDate.getMonth() - 1, birthDate.getDate());
      daysDiff += (endDate - prevMonth) / (1000 * 60 * 60 * 24);
    }
    if (monthsDiff < 0) {
      years--;
      monthsDiff += 12;
    }
    return { years: Math.max(0, years), months: Math.max(0, monthsDiff), days: Math.max(0, Math.floor(daysDiff)) };
  };
  const handleAddMember = async () => {
    dispatch({ type: "openMemberAdd", member: state.memberToBeDisplayed });
  };
  const handleEditMember = async () => {
    dispatch({ type: "openMemberEdit", member: state.memberToBeDisplayed });
  };
  const handleDeleteMember = async (id) => {
    const consent = window.confirm(state.user.language ? "Are you sure you want to delete the member?" : "क्या आप वाकई सदस्य को हटाना चाहते हैं?");
    if (consent) {
      const response = await fetch(`${URL}:${PORT}/deleteMember`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id, village: state.village }),
      });
      const data = await response.json();
      if (data.result === "success") {
        dispatch({ type: "deleteMember", id: id });
      }
    }
  };
  return (
    <div className="details" style={{ display: state.isMemberDisplayOpen ? "flex" : "none", filter: state.isMemberEditOpen ? "blur(20px)" : "none" }}>
      <img src={CloseIcon} alt="close" className="close" onClick={() => dispatch({ type: "closeMemberDisplay" })} loading="lazy" />
      <div className="view">
        <img style={{ boxShadow: state.memberToBeDisplayed.isAlive ? "0 0 50px lightgreen" : "0 0 50px #f55" }} src={memberImage ? memberImage.src : state.memberToBeDisplayed.gender === "M" ? MaleProfileImage : FemaleProfileImage} alt={state.memberToBeDisplayed.name} loading="lazy" />
        <div className="info">
          <div>
            {state.user.language ? state.memberToBeDisplayed.name : getHindiText(state.memberToBeDisplayed.name, "name")}{" "}
            {memberDOB && state.user.language ? (
              <sup>
                Age:{" "}
                {(() => {
                  const age = getAge(memberDOB, memberDOD);
                  const parts = [];
                  if (age.years > 0) parts.push(age.years + " years");
                  if (age.months > 0) parts.push(age.months + " months");
                  if (age.days > 0) parts.push(age.days + " days");
                  return parts.join(" ");
                })()}
              </sup>
            ) : memberDOB && !state.user.language ? (
              <sup>
                उम्र:{" "}
                {(() => {
                  const age = getAge(memberDOB, memberDOD);
                  const parts = [];
                  if (age.years > 0) parts.push(getHindiNumbers(age.years.toString()) + " साल");
                  if (age.months > 0) parts.push(getHindiNumbers(age.months.toString()) + " महीने");
                  if (age.days > 0) parts.push(getHindiNumbers(age.days.toString()) + " दिन");
                  return parts.join(" ");
                })()}
              </sup>
            ) : (
              ""
            )}
          </div>
          {memberDOB && !state.user.language ? (
            <div className="dob">
              {/* <img className='icons' src={DOBIcon} alt='birth' loading='lazy' /> */}
              <span style={{ fontWeight: "bolder" }}>जन्म:</span>
              <span>{`${getHindiNumbers(memberDOB.split(" ")[0])} ${getHindiText(memberDOB.split(" ")[1], "months")} ${getHindiNumbers(memberDOB.split(" ")[2])}`}</span>
            </div>
          ) : memberDOB && state.user.language ? (
            <div className="dob">
              {/* <img className='icons' src={DOBIcon} alt='birth' loading='lazy' /> */}
              <span style={{ fontWeight: "bolder" }}>Birth:</span>
              <span>{memberDOB}</span>
            </div>
          ) : (
            ""
          )}
          {memberDOD && !state.user.language ? (
            <div className="dod">
              {/* <img className='icons' src={DODIcon} alt='death' loading='lazy' /> */}
              <span style={{ fontWeight: "bolder" }}>मृत्यु:</span>
              <span>{`${getHindiNumbers(memberDOD.split(" ")[0])} ${getHindiText(memberDOD.split(" ")[1], "months")} ${getHindiNumbers(memberDOD.split(" ")[2])}`}</span>
            </div>
          ) : memberDOD && state.user.language ? (
            <div className="dod">
              {/* <img className='icons' src={DODIcon} alt='death' loading='lazy' /> */}
              <span style={{ fontWeight: "bolder" }}>Death:</span>
              <span>{memberDOD}</span>
            </div>
          ) : (
            ""
          )}
          {memberMobiles.length ? (
            <div className="view-mobile">
              <img className="icons" src={MobileIcon} alt="mobile" loading="lazy" />
              <span className="view-mobile">
                {memberMobiles.map((mobile, i) => (
                  <a key={i} href={`tel: ${mobile}`} onClick={(e) => e.stopPropagation()}>
                    {mobile}
                  </a>
                ))}
              </span>
            </div>
          ) : (
            ""
          )}
          {memberEmails.length ? (
            <div className="view-email">
              <img className="icons" src={EmailIcon} alt="email" loading="lazy" />
              <span className="view-email">
                {memberEmails.map((email, i) => (
                  <a key={i} href={`mailto: ${email}`} onClick={(e) => e.stopPropagation()}>
                    {email}
                  </a>
                ))}
              </span>
            </div>
          ) : (
            ""
          )}
          <div className="view-actions">
            {state.user.role === "admin" && state.memberToBeDisplayed.gender === "M" ? <button onClick={() => handleAddMember()}>{state.user.language ? "ADD_MEMBER" : "सदस्य_जोड़ें"}</button> : ""}
            {state.user.role === "admin" ? <button onClick={() => handleEditMember()}>{state.user.language ? "UPDATE" : "नवीनीकरण"}</button> : ""}
            {state.user.role === "admin" ? <button onClick={() => handleDeleteMember(state.memberToBeDisplayed.id)}>{state.user.language ? "DELETE" : "हटाएँ"}</button> : ""}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplayMember;
