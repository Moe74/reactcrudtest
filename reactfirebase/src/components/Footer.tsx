import * as React from "react";
import {
  getCookieConsentValue,
  resetCookieConsentValue,
} from "react-cookie-consent";
import { FooterButton } from "../components/LayoutSC";

interface FooterProps {}

const Footer: React.FunctionComponent<FooterProps> = (p) => {
  const resetCookie = React.useMemo(
    () => () => {
      resetCookieConsentValue("Abgehts");
      window.location.reload();
    },
    []
  );
  const cookiesSet = getCookieConsentValue("Abgehts") === "true";
  return (
    <>
      <div style={{ float: "left" }}></div>
      <div style={{ float: "right" }}>
        {cookiesSet && (
          <FooterButton onClick={resetCookie} isActive={false}>
            reset Cookies
          </FooterButton>
        )}
      </div>
    </>
  );
};
export default Footer;
