import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
<<<<<<< HEAD
import { BrowserRouter } from "react-router";
=======
import { Auth0Provider } from "@auth0/auth0-react";
import { BrowserRouter } from "react-router-dom";
>>>>>>> 884855a (New Features)
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
<<<<<<< HEAD
      <App />
=======
      <Auth0Provider
        domain={import.meta.env.VITE_AUTH0_DOMAIN}
        clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        }}
        cacheLocation="localstorage"
      >
        <App />
      </Auth0Provider>
>>>>>>> 884855a (New Features)
      <Toaster />
    </BrowserRouter>
  </StrictMode>
);
