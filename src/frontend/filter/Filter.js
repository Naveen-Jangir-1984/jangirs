import { useMemberStats } from "../../hooks/useMemberStats";
import useTranslation from "../../hooks/useTranslation";
import "./Filter.css";

const Filter = ({ state, dispatch, members, getHindiText, getHindiNumbers }) => {
  const male = state.filters.male;
  const female = state.filters.female;
  const isEnglish = state.user.language;
  const { t } = useTranslation(isEnglish);

  // Use memoized statistics - computed once per members change
  const stats = useMemberStats(members);

  // Helper to format numbers based on language
  const formatNum = (num) => (isEnglish ? num : getHindiNumbers(num.toString()));

  return (
    <div className="filter">
      <div className="filter-label">{t("Men")}</div>
      <div className="filter-men">
        <select name="village" value={male.village} onChange={(e) => dispatch({ type: "male-selection", village: e.target.value, gotra: "" })}>
          <option value="">{`${t("village")} (${formatNum(stats.maleVillages.length)})`}</option>
          {stats.maleVillages.map((village, i) => (
            <option key={i} value={village}>
              {isEnglish ? `${village} (${stats.maleVillageCount[village] || 0})` : `${getHindiText(village, "village")} (${formatNum(stats.maleVillageCount[village] || 0)})`}
            </option>
          ))}
        </select>
        <label>
          <span>
            <span>{`${t("Married")} (${formatNum(stats.maleAliveMarried)}`}</span>
            <span style={{ fontSize: "8px", color: "red" }}>{`/${formatNum(stats.maleDeadMarried)}`}</span>
            {`)`}
          </span>{" "}
          <span>
            <span>{`${t("Unmarried")} (${formatNum(stats.maleAliveUnmarried)}`}</span>
            <span style={{ fontSize: "8px", color: "red" }}>{`/${formatNum(stats.maleDeadUnmarried)})`}</span>
          </span>
        </label>
        <select name="gotra" value={male.gotra} onChange={(e) => dispatch({ type: "male-selection", village: "", gotra: e.target.value })}>
          <option value="">{`${t("gotra")} (${formatNum(stats.maleGotras.length)})`}</option>
          {stats.maleGotras.map((gotra, i) => (
            <option key={i} value={gotra}>
              {isEnglish ? `${gotra} (${stats.maleGotraCount[gotra] || 0})` : `${getHindiText(gotra, "gotra")} (${formatNum(stats.maleGotraCount[gotra] || 0)})`}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-label">{t("Women")}</div>
      <div className="filter-women">
        <select name="village" value={female.village} onChange={(e) => dispatch({ type: "female-selection", village: e.target.value, gotra: "" })}>
          <option value="">{`${t("village")} (${formatNum(stats.femaleVillages.length)})`}</option>
          {stats.femaleVillages.map((village, i) => (
            <option key={i} value={village}>
              {isEnglish ? `${village} (${stats.femaleVillageCount[village] || 0})` : `${getHindiText(village, "village")} (${formatNum(stats.femaleVillageCount[village] || 0)})`}
            </option>
          ))}
        </select>
        <label>
          <span>
            <span>{`${t("Married")} (${formatNum(stats.femaleAliveMarried)}`}</span>
            <span style={{ fontSize: "8px", color: "red" }}>{`/${formatNum(stats.femaleDeadMarried)})`}</span>
          </span>{" "}
          <span>
            <span>{`${t("Unmarried")} (${formatNum(stats.femaleAliveUnmarried)}`}</span>
            <span style={{ fontSize: "8px", color: "red" }}>{`/${formatNum(stats.femaleDeadUnmarried)})`}</span>
          </span>
        </label>
        <select name="gotra" value={female.gotra} onChange={(e) => dispatch({ type: "female-selection", village: "", gotra: e.target.value })}>
          <option value="">{`${t("gotra")} (${formatNum(stats.femaleGotras.length)})`}</option>
          {stats.femaleGotras.map((gotra, i) => (
            <option key={i} value={gotra}>
              {isEnglish ? `${gotra} (${stats.femaleGotraCount[gotra] || 0})` : `${getHindiText(gotra, "gotra")} (${formatNum(stats.femaleGotraCount[gotra] || 0)})`}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Filter;
