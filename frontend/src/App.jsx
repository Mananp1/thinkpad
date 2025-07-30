import React, { useEffect } from "react";
import { Route, Routes } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";
import HomePage from "./pages/HomePage";
import CreatePage from "./pages/CreatePage";
import NoteDetailPage from "./pages/NoteDetailPage";
import RequireAuth from "./components/RequireAuth";

const TokenManager = ({ children }) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  useEffect(() => {
    const getToken = async () => {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently({
            authorizationParams: {
              audience: import.meta.env.VITE_AUTH0_AUDIENCE,
            },
          });
          localStorage.setItem("auth0_token", token);
        } catch (error) {
          console.error("Error getting token:", error);
        }
      } else {
        localStorage.removeItem("auth0_token");
      }
    };

    getToken();
  }, [isAuthenticated, getAccessTokenSilently]);

  return children;
};

const App = () => {
  return (
    <TokenManager>
      <div data-theme="winter">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/create"
            element={
              <RequireAuth>
                <CreatePage />
              </RequireAuth>
            }
          />
          <Route
            path="/notes/:id"
            element={
              <RequireAuth>
                <NoteDetailPage />
              </RequireAuth>
            }
          />
        </Routes>
      </div>
    </TokenManager>
  );
};

export default App;
