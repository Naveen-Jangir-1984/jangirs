import "./Footer.css";

const Footer = ({ state }) => {
  return (
    <div className="footer">
      <div>{state.user.language ? "This information is confidential to Dulania Jangir Samaaj and protected by Naveen Jangir (s/o Bahadur Singh Jangir)." : "यह जानकारी डुलानिया जांगिड़ समाज के लिए गोपनीय है और नवीन जांगिड़ (पुत्र बहादुर सिंह जांगिड़) द्वारा संरक्षित है।"}</div>
    </div>
  );
};

export default Footer;
