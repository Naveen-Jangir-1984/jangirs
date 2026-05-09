import DatePicker from "../../../components/DatePicker";
import { ConfirmModal } from "../../../components/modals";
import api from "../../../utils/api";
import useTranslation from "../../../hooks/useTranslation";
import useConfirm from "../../../hooks/useConfirm";
import "./AddMember.css";

const AddMember = ({ state, dispatch, getHindiText, getHindiNumbers, getEnglishText, getEnglishNumbers }) => {
  const isEnglish = state.user.language;
  const { t } = useTranslation(isEnglish);
  const { isOpen: confirmOpen, message: confirmMessage, showConfirm, handleConfirm, handleCancel } = useConfirm();

  // Helper to parse mobile numbers
  const parseMobileNumbers = (mobileStr) => {
    if (!mobileStr) return [];
    return mobileStr.replaceAll(" ", "").split(",").filter(Boolean).map(Number);
  };

  // Helper to parse emails
  const parseEmails = (emailStr) => {
    if (!emailStr) return [];
    return emailStr.replaceAll(" ", "").split(",").filter(Boolean);
  };

  // Helper to format date string
  const formatDate = (date, month, year) => {
    if (date && month && year) {
      return `${date} ${month} ${year}`;
    }
    return "";
  };

  const handleAddMember = async () => {
    if (!(await showConfirm("confirmAddMember"))) return;

    const { newMember, memberToBeAdded, village } = state;
    const mobileNumbers = parseMobileNumbers(newMember.mobile);
    const emails = parseEmails(newMember.email);
    const dob = formatDate(newMember.date, newMember.month, newMember.year);
    const dod = formatDate(newMember.dateDeath, newMember.monthDeath, newMember.yearDeath);
    const isAlive = newMember.isAlive === "alive";

    let person;
    if (newMember.type === "child") {
      const baseId = memberToBeAdded ? memberToBeAdded.id * 10 + (memberToBeAdded.children.length + 1) : 0;
      person = {
        id: baseId,
        name: newMember.name,
        mobile: mobileNumbers,
        email: emails,
        dob,
        dod,
        isAlive,
        gender: newMember.gender,
        village: newMember.village,
        ...(newMember.gender === "M" && { children: [], wives: [], isCollapsed: false }),
      };
    } else if (newMember.type === "wife") {
      person = {
        id: memberToBeAdded ? memberToBeAdded.id * 10 : 0,
        name: newMember.name,
        mobile: mobileNumbers,
        email: emails,
        dob,
        dod,
        isAlive,
        gender: "F",
        village: newMember.village,
        gotra: newMember.gotra,
      };
    }

    if (person) {
      const data = await api.addMember(memberToBeAdded, person, newMember.type, village);
      if (data.result === "success") {
        dispatch({ type: "addMember", member: person, memberType: newMember.type });
      }
    }
  };

  const handleClose = () => {
    dispatch({ type: "closeMemberAdd" });
  };

  const handleInputChange = (e) => {
    dispatch({ type: "editInputNewMember", attribute: e.target.name, value: e.target.value });
  };

  const isFormDisabled = state.newMember.type === "";
  const isAddDisabled = state.newMember.type === "" || !state.newMember.name.trim();

  return (
    <div className="add-member" style={{ display: state.isMemberAddOpen ? "flex" : "none" }} onClick={handleClose}>
      <div className="view" onClick={(e) => e.stopPropagation()}>
        <select name="type" value={state.newMember.type} onChange={handleInputChange}>
          <option value="">{t("Member?")}</option>
          <option value="child">{t("Child")}</option>
          <option value="wife">{t("Wife")}</option>
        </select>

        <input disabled={isFormDisabled} type="text" name="name" value={state.newMember.name} onChange={handleInputChange} placeholder={t("Name")} />

        <input disabled={isFormDisabled} type="text" name="mobile" value={state.newMember.mobile} onChange={handleInputChange} placeholder={t("Mobile")} />

        <DatePicker dateValue={state.newMember.date} monthValue={state.newMember.month} yearValue={state.newMember.year} onDateChange={handleInputChange} onMonthChange={handleInputChange} onYearChange={handleInputChange} disabled={isFormDisabled} isEnglish={isEnglish} getHindiNumbers={getHindiNumbers} className="dob" />

        <select disabled={isFormDisabled || state.newMember.type === "wife"} name="gender" value={state.newMember.type === "wife" ? "F" : state.newMember.gender} onChange={handleInputChange}>
          <option value="M">{t("Male")}</option>
          <option value="F">{t("Female")}</option>
        </select>

        <select disabled={isFormDisabled} name="isAlive" value={state.newMember.isAlive} onChange={handleInputChange}>
          <option value="alive">{t("Alive")}</option>
          <option value="dead">{t("Dead")}</option>
        </select>

        {state.newMember.isAlive === "dead" && <DatePicker dateValue={state.newMember.dateDeath} monthValue={state.newMember.monthDeath} yearValue={state.newMember.yearDeath} onDateChange={handleInputChange} onMonthChange={handleInputChange} onYearChange={handleInputChange} disabled={isFormDisabled} isEnglish={isEnglish} getHindiNumbers={getHindiNumbers} dateName="dateDeath" monthName="monthDeath" yearName="yearDeath" className="dob" />}

        <input disabled={isFormDisabled} type="text" name="village" value={state.newMember.village} onChange={handleInputChange} placeholder={t("Village")} />

        {state.newMember.type === "wife" && <input type="text" name="gotra" value={state.newMember.gotra} onChange={handleInputChange} placeholder={t("Gotra")} />}

        <input disabled={isFormDisabled} type="email" name="email" value={state.newMember.email} onChange={handleInputChange} placeholder={t("Email")} />

        <div className="add-member-buttons">
          <button className="add-member-button cancel" onClick={handleClose}>
            {t("CANCEL")}
          </button>
          <button className="add-member-button ok" disabled={isAddDisabled} onClick={handleAddMember}>
            {t("ADD")}
          </button>
        </div>
      </div>
      <ConfirmModal isOpen={confirmOpen} onConfirm={handleConfirm} onCancel={handleCancel} message={t(confirmMessage)} confirmText={t("yes")} cancelText={t("no")} />
    </div>
  );
};

export default AddMember;
