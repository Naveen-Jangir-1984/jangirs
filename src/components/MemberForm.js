import React, { memo } from "react";
import DatePicker from "./DatePicker";
import "./MemberForm.css";

/**
 * Reusable MemberForm component for Add/Edit member operations
 */
const MemberForm = memo(({ formData, onInputChange, isEnglish = true, getHindiNumbers, disabled = false, showTypeSelect = false, showGotraForWife = false, showGenderSelect = true }) => {
  const handleChange = (e) => {
    onInputChange(e.target.name, e.target.value);
  };

  return (
    <div className="member-form">
      {showTypeSelect && (
        <select name="type" value={formData.type || ""} onChange={handleChange}>
          <option value="">{isEnglish ? "Member?" : "सदस्य?"}</option>
          <option value="child">{isEnglish ? "Child" : "औलाद"}</option>
          <option value="wife">{isEnglish ? "Wife" : "पत्नी"}</option>
        </select>
      )}

      <input type="text" name="name" value={formData.name || ""} onChange={handleChange} placeholder={isEnglish ? "Name" : "नाम"} disabled={disabled} />

      <input type="text" name="mobile" value={formData.mobile || ""} onChange={handleChange} placeholder={isEnglish ? "Mobile" : "मोबाइल"} disabled={disabled} />

      <DatePicker dateValue={formData.date || ""} monthValue={formData.month || ""} yearValue={formData.year || ""} onDateChange={handleChange} onMonthChange={handleChange} onYearChange={handleChange} disabled={disabled} isEnglish={isEnglish} getHindiNumbers={getHindiNumbers} dateName="date" monthName="month" yearName="year" className="dob" />

      {showGenderSelect && (
        <select name="gender" value={formData.gender || "M"} onChange={handleChange} disabled={disabled || formData.type === "wife"}>
          <option value="M">{isEnglish ? "Male" : "पुरुष"}</option>
          <option value="F">{isEnglish ? "Female" : "महिला"}</option>
        </select>
      )}

      <select name="isAlive" value={formData.isAlive || "alive"} onChange={handleChange} disabled={disabled}>
        <option value="alive">{isEnglish ? "Alive" : "जिंदा"}</option>
        <option value="dead">{isEnglish ? "Dead" : "मृत"}</option>
      </select>

      {formData.isAlive === "dead" && <DatePicker dateValue={formData.dateDeath || ""} monthValue={formData.monthDeath || ""} yearValue={formData.yearDeath || ""} onDateChange={handleChange} onMonthChange={handleChange} onYearChange={handleChange} disabled={disabled} isEnglish={isEnglish} getHindiNumbers={getHindiNumbers} dateName="dateDeath" monthName="monthDeath" yearName="yearDeath" className="dod" />}

      <input type="text" name="village" value={formData.village || ""} onChange={handleChange} placeholder={isEnglish ? "Village" : "गाँव"} disabled={disabled} />

      {(showGotraForWife || formData.type === "wife" || formData.gender === "F") && <input type="text" name="gotra" value={formData.gotra || ""} onChange={handleChange} placeholder={isEnglish ? "Gotra" : "गोत्र"} disabled={disabled} />}

      <input type="email" name="email" value={formData.email || ""} onChange={handleChange} placeholder={isEnglish ? "Email" : "ईमेल"} disabled={disabled} />
    </div>
  );
});

MemberForm.displayName = "MemberForm";

export default MemberForm;
