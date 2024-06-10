import _ from "lodash";
import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FooterButton } from "../components/LayoutSC";
import {
  getCookieConsentValue,
  resetCookieConsentValue,
} from "react-cookie-consent";

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
