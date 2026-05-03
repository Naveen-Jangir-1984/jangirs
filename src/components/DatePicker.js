import React, { memo } from "react";
import { DATES, MONTHS, MONTHS_HINDI, getYears } from "../utils/constants";
import "./DatePicker.css";

/**
 * Reusable DatePicker component for selecting date, month, and year
 */
const DatePicker = memo(({ dateValue, monthValue, yearValue, onDateChange, onMonthChange, onYearChange, disabled = false, isEnglish = true, getHindiNumbers, dateName = "date", monthName = "month", yearName = "year", className = "date-picker" }) => {
  const years = getYears();

  return (
    <div className={className}>
      <select name={dateName} value={dateValue} onChange={onDateChange} disabled={disabled}>
        <option value="">{isEnglish ? "DD" : "दिन"}</option>
        {DATES.map((date) => (
          <option key={date} value={date}>
            {isEnglish ? date : getHindiNumbers?.(date.toString()) || date}
          </option>
        ))}
      </select>

      <select name={monthName} value={monthValue} onChange={onMonthChange} disabled={disabled}>
        <option value="">{isEnglish ? "MM" : "महिना"}</option>
        {MONTHS.map((month, i) => (
          <option key={month} value={month}>
            {isEnglish ? month : MONTHS_HINDI[i]}
          </option>
        ))}
      </select>

      <select name={yearName} value={yearValue} onChange={onYearChange} disabled={disabled}>
        <option value="">{isEnglish ? "YYYY" : "साल"}</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {isEnglish ? year : getHindiNumbers?.(year.toString()) || year}
          </option>
        ))}
      </select>
    </div>
  );
});

DatePicker.displayName = "DatePicker";

export default DatePicker;
