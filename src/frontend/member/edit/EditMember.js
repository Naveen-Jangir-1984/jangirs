import CloseIcon from "../../../images/close.png";
import DatePicker from "../../../components/DatePicker";
import ConfirmModal from "../../../components/ConfirmModal";
import api from "../../../utils/api";
import useTranslation from "../../../hooks/useTranslation";
import useConfirm from "../../../hooks/useConfirm";
import "./EditMember.css";

const EditMember = ({ state, dispatch, getHindiText, getHindiNumbers, getEnglishText, getEnglishNumbers }) => {
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

  const handleEditMember = async () => {
    const confirmMsg = t("confirmEditMember");

    if (!(await showConfirm(confirmMsg))) return;

    const { editInput, village } = state;
    const mobileNumbers = parseMobileNumbers(editInput.mobile);
    const emails = parseEmails(editInput.email);
    const dob = formatDate(editInput.date, editInput.month, editInput.year);
    const dod = editInput.isAlive === "dead" ? formatDate(editInput.dateDeath, editInput.monthDeath, editInput.yearDeath) : "";

    const person = {
      id: editInput.id,
      name: editInput.name,
      dob,
      gender: editInput.gender,
      isAlive: editInput.isAlive === "alive",
      dod,
      village: editInput.village,
      gotra: editInput.gotra,
      mobile: mobileNumbers,
      email: emails,
    };

    const data = await api.editMember(person, village);
    if (data.result === "success") {
      dispatch({ type: "editMember", member: person });
    }
  };

  const handleClose = () => {
    dispatch({ type: "closeMemberEdit" });
  };

  const handleInputChange = (e) => {
    dispatch({ type: "editInput", attribute: e.target.name, value: e.target.value });
  };

  return (
    <div className="edit-member" style={{ display: state.isMemberEditOpen ? "flex" : "none" }}>
      <img src={CloseIcon} alt="close" className="close" onClick={handleClose} loading="lazy" />
      <div className="view">
        <input type="text" name="name" value={state.editInput.name} onChange={handleInputChange} placeholder={t("Name")} />

        <input type="text" name="mobile" value={state.editInput.mobile} onChange={handleInputChange} placeholder={t("Mobile")} />

        <DatePicker dateValue={state.editInput.date} monthValue={state.editInput.month} yearValue={state.editInput.year} onDateChange={handleInputChange} onMonthChange={handleInputChange} onYearChange={handleInputChange} isEnglish={isEnglish} getHindiNumbers={getHindiNumbers} className="dob" />

        <select name="gender" value={state.editInput.gender} onChange={handleInputChange}>
          <option value="M">{t("Male")}</option>
          <option value="F">{t("Female")}</option>
        </select>

        <select name="isAlive" value={state.editInput.isAlive} onChange={handleInputChange}>
          <option value="alive">{t("Alive")}</option>
          <option value="dead">{t("Dead")}</option>
        </select>

        {state.editInput.isAlive === "dead" && <DatePicker dateValue={state.editInput.dateDeath} monthValue={state.editInput.monthDeath} yearValue={state.editInput.yearDeath} onDateChange={handleInputChange} onMonthChange={handleInputChange} onYearChange={handleInputChange} isEnglish={isEnglish} getHindiNumbers={getHindiNumbers} dateName="dateDeath" monthName="monthDeath" yearName="yearDeath" className="dod" />}

        <input type="text" name="village" value={state.editInput.village} onChange={handleInputChange} placeholder={t("Village")} />

        {state.editInput.gender === "F" && <input type="text" name="gotra" value={state.editInput.gotra} onChange={handleInputChange} placeholder={t("Gotra")} />}

        <input type="email" name="email" value={state.editInput.email} onChange={handleInputChange} placeholder={t("Email")} />

        <button onClick={handleEditMember}>{t("UPDATE")}</button>
      </div>
      <ConfirmModal isOpen={confirmOpen} onConfirm={handleConfirm} onCancel={handleCancel} message={confirmMessage} confirmText={t("yes")} cancelText={t("no")} />
    </div>
  );
};

export default EditMember;
