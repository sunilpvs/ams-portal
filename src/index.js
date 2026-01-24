import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import {AppContextProvider} from "./context/AppContext";

// Dynamically set favicon based on environment (dev vs prod) with a safe fallback.
const setFavicon = () => {
  const isProd = process.env.NODE_ENV === "production";
  const publicUrl = process.env.PUBLIC_URL || "";
  const devIcon = `${publicUrl}/assets/LOGO.png`;
  const prodIcon = `${publicUrl}/assets/LOGO_PROD.png`;
  const chosenIcon = isProd ? prodIcon : devIcon;

  const link = document.querySelector("link[rel~='icon']") || document.createElement("link");
  link.rel = "icon";
  link.type = "image/png";
  link.href = chosenIcon;

  // Fallback to dev icon if prod icon is missing.
  link.onerror = () => {
    if (link.href !== devIcon) {
      link.href = devIcon;
    }
  };

  document.head.appendChild(link);
};

setFavicon();

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <BrowserRouter>
        <AppContextProvider>
            <App />
        </AppContextProvider>
    </BrowserRouter>
  </StrictMode>
);
