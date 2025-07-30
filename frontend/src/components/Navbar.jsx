<<<<<<< HEAD
import { PlusIcon } from "lucide-react";
import React from "react";
import { Link } from "react-router";

const Navbar = () => {
  return (
    <header className="bg-secondary/10 border-b border-base-content/10">
      <div className="mx-auto max-w-6xl px-4 p-4">
        <div className="flex items-center justify-between">
=======
import { PlusIcon, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const Navbar = ({ onSearchChange }) => {
  const [term, setTerm] = useState("");
  const {
    isLoading,
    isAuthenticated,
    error,
    loginWithRedirect: login,
    logout: auth0Logout,
    user,
  } = useAuth0();

  const signup = () =>
    login({ authorizationParams: { screen_hint: "signup" } });

  const logout = () =>
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });

  useEffect(() => {
    const id = setTimeout(() => {
      onSearchChange?.(term.trim());
    }, 300);
    return () => clearTimeout(id);
  }, [term, onSearchChange]);

  if (isLoading) {
    return (
      <header className="bg-secondary/10 border-b border-base-content/10">
        <div className="mx-auto max-w-6xl px-4 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold font-mono tracking-tight">
              ThinkPad
            </h1>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-secondary/10 border-b border-base-content/10">
      <div className="mx-auto max-w-6xl px-4 p-4">
        <div className="flex items-center justify-between gap-4">
>>>>>>> 884855a (New Features)
          <Link to={"/"}>
            <h1 className="text-3xl font-bold font-mono tracking-tight">
              ThinkPad
            </h1>
          </Link>
          <div className="flex items-center gap-4">
<<<<<<< HEAD
            <Link to={"/create"} className="btn btn-secondary">
              <PlusIcon />
              <span>New Note</span>
            </Link>
=======
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center gap-2">
                  <div className="join">
                    <input
                      value={term}
                      onChange={(e) => setTerm(e.target.value)}
                      className="input input-bordered join-item w-64"
                      placeholder="Search notes by title…"
                      aria-label="Search notes by title"
                    />
                    <button
                      type="button"
                      className="btn join-item btn-secondary"
                      tabIndex={-1}
                    >
                      <Search className="w-4 h-4" />
                    </button>
                    {term && (
                      <button
                        type="button"
                        className="btn join-item btn-outline hover:btn-ghost"
                        onClick={() => setTerm("")}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                <Link to={"/create"} className="btn btn-secondary">
                  <PlusIcon />
                  <span>New Note</span>
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{user?.email}</span>
                  <button onClick={logout} className="btn btn-secondary">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                {error && (
                  <p className="text-red-500 text-sm">Error: {error.message}</p>
                )}
                <button onClick={signup} className="btn btn-secondary">
                  Signup
                </button>
                <button onClick={login} className="btn btn-secondary">
                  Login
                </button>
              </>
            )}
>>>>>>> 884855a (New Features)
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
