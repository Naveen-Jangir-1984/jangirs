import CloseIcon from "../../../images/close.png";
import MaleProfileImage from "../../../images/male.png";
import FemaleProfileImage from "../../../images/female.png";
import MobileIcon from "../../../images/mobile.jpg";
import EmailIcon from "../../../images/email.png";
import { MONTHS } from "../../../utils/constants";
import api from "../../../utils/api";
import useTranslation from "../../../hooks/useTranslation";
import useConfirm from "../../../hooks/useConfirm";
import ConfirmModal from "../../../components/ConfirmModal";
import "./DisplayMember.css";

const DisplayMember = ({ state, dispatch, getHindiText, getHindiNumbers }) => {
  const isEnglish = state.user.language;
  const { t } = useTranslation(isEnglish);
  const { isOpen: confirmOpen, message: confirmMessage, showConfirm, handleConfirm, handleCancel } = useConfirm();
  const memberImage = state.images.find((image) => image.id === state.memberToBeDisplayed.id);
  const memberDOB = state.memberToBeDisplayed.dob || "";
  const memberDOD = state.memberToBeDisplayed.dod || "";
  const memberMobiles = state.memberToBeDisplayed.mobile || [];
  const memberEmails = state.memberToBeDisplayed.email || [];

  // Calculate age helper
  const getAge = (dobString, dodString) => {
    if (!dobString || dobString.length === 0) return { years: 0, months: 0, days: 0 };
    const dobParts = dobString.split(" ");
    const birthDate = new Date(dobParts[2], MONTHS.indexOf(dobParts[1]), dobParts[0]);
    const endDate = !dodString || dodString.length === 0 ? new Date() : new Date(dodString.split(" ")[2], MONTHS.indexOf(dodString.split(" ")[1]), dodString.split(" ")[0]);

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

  const handleAddMember = () => {
    dispatch({ type: "openMemberAdd", member: state.memberToBeDisplayed });
  };

  const handleEditMember = () => {
    dispatch({ type: "openMemberEdit", member: state.memberToBeDisplayed });
  };

  const handleDeleteMember = async (id) => {
    const confirmMsg = t("confirmDeleteMember");

    if (!(await showConfirm(confirmMsg))) return;

    const data = await api.deleteMember(id, state.village);
    if (data.result === "success") {
      dispatch({ type: "deleteMember", id: id });
    }
  };

  return (
    <div className="details" style={{ display: state.isMemberDisplayOpen ? "flex" : "none", filter: state.isMemberEditOpen ? "blur(20px)" : "none" }}>
      <img src={CloseIcon} alt="close" className="close" onClick={() => dispatch({ type: "closeMemberDisplay" })} loading="lazy" />
      <div className="view">
        <img style={{ boxShadow: state.memberToBeDisplayed.isAlive ? "0 0 50px lightgreen" : "0 0 50px #f55" }} src={memberImage ? memberImage.src : state.memberToBeDisplayed.gender === "M" ? MaleProfileImage : FemaleProfileImage} alt={state.memberToBeDisplayed.name} loading="lazy" />
        <div className="info">
          <div>
            {isEnglish ? state.memberToBeDisplayed.name : getHindiText(state.memberToBeDisplayed.name, "name")}{" "}
            {memberDOB && isEnglish ? (
              <sup>
                {t("Age")}{" "}
                {(() => {
                  const age = getAge(memberDOB, memberDOD);
                  const parts = [];
                  if (age.years > 0) parts.push(age.years + " " + t("years"));
                  if (age.months > 0) parts.push(age.months + " " + t("months"));
                  if (age.days > 0) parts.push(age.days + " " + t("days"));
                  return parts.join(" ");
                })()}
              </sup>
            ) : memberDOB && !isEnglish ? (
              <sup>
                {t("Age")}{" "}
                {(() => {
                  const age = getAge(memberDOB, memberDOD);
                  const parts = [];
                  if (age.years > 0) parts.push(getHindiNumbers(age.years.toString()) + " " + t("years"));
                  if (age.months > 0) parts.push(getHindiNumbers(age.months.toString()) + " " + t("months"));
                  if (age.days > 0) parts.push(getHindiNumbers(age.days.toString()) + " " + t("days"));
                  return parts.join(" ");
                })()}
              </sup>
            ) : (
              ""
            )}
          </div>
          {memberDOB && !isEnglish ? (
            <div className="dob">
              {/* <img className='icons' src={DOBIcon} alt='birth' loading='lazy' /> */}
              <span style={{ fontWeight: "bolder" }}>{t("Birth")}</span>
              <span>{`${getHindiNumbers(memberDOB.split(" ")[0])} ${getHindiText(memberDOB.split(" ")[1], "months")} ${getHindiNumbers(memberDOB.split(" ")[2])}`}</span>
            </div>
          ) : memberDOB && isEnglish ? (
            <div className="dob">
              {/* <img className='icons' src={DOBIcon} alt='birth' loading='lazy' /> */}
              <span style={{ fontWeight: "bolder" }}>{t("Birth")}</span>
              <span>{memberDOB}</span>
            </div>
          ) : (
            ""
          )}
          {memberDOD && !isEnglish ? (
            <div className="dod">
              {/* <img className='icons' src={DODIcon} alt='death' loading='lazy' /> */}
              <span style={{ fontWeight: "bolder" }}>{t("Death")}</span>
              <span>{`${getHindiNumbers(memberDOD.split(" ")[0])} ${getHindiText(memberDOD.split(" ")[1], "months")} ${getHindiNumbers(memberDOD.split(" ")[2])}`}</span>
            </div>
          ) : memberDOD && isEnglish ? (
            <div className="dod">
              {/* <img className='icons' src={DODIcon} alt='death' loading='lazy' /> */}
              <span style={{ fontWeight: "bolder" }}>{t("Death")}</span>
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
            {state.user.role === "admin" && state.memberToBeDisplayed.gender === "M" ? <button onClick={() => handleAddMember()}>{t("ADD_MEMBER")}</button> : ""}
            {state.user.role === "admin" ? <button onClick={() => handleEditMember()}>{t("UPDATE")}</button> : ""}
            {state.user.role === "admin" ? <button onClick={() => handleDeleteMember(state.memberToBeDisplayed.id)}>{t("DELETE")}</button> : ""}
          </div>
        </div>
      </div>
      <ConfirmModal isOpen={confirmOpen} onConfirm={handleConfirm} onCancel={handleCancel} message={confirmMessage} confirmText={t("yes")} cancelText={t("no")} />
    </div>
  );
};

export default DisplayMember;
