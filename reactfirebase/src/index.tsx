import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import App from "./App";
import CookieConsent from "react-cookie-consent";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

// @Aytac: die Bibliothek Global State habe ich bereits installiert !!!

root.render(
  <React.StrictMode>
    <CookieConsent
      location={"bottom"}
      onAccept={() => window.location.reload()}
      cookieName="Abgehts"
    >
      This website uses cookies to enhance the user experience.
    </CookieConsent>
    <App />
  </React.StrictMode>
);
