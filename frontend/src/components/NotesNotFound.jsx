import { NotebookIcon } from "lucide-react";
import React from "react";
import { Link } from "react-router";

import { useAuth0 } from "@auth0/auth0-react";

const NotesNotFound = () => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6 max-w-md mx-auto text-center">
      <div className="bg-secondary/10 rounded-md p-8">
        <NotebookIcon className="size-10" />
      </div>
      <h3 className="text-2xl font-bold">No Notes yet</h3>
      <p className="text-base-content/70">
        Ready to create you first note and organize?!
      </p>
      {isAuthenticated ? (
        <Link to={"/create"} className="btn btn-secondary">
          Creat Your first Note
        </Link>
      ) : (
        <button
          className="btn btn-secondary"
          onClick={() => loginWithRedirect()}
        >
          Log in
        </button>
      )}
    </div>
  );
};

export default NotesNotFound;
