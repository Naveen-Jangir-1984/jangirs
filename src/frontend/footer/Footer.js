import useTranslation from "../../hooks/useTranslation";
import "./Footer.css";

const Footer = ({ state }) => {
  const isEnglish = state.user?.language;
  const { t } = useTranslation(isEnglish);

  return (
    <div className="footer">
      <div>{t("confidentiality")}</div>
    </div>
  );
};

export default Footer;
