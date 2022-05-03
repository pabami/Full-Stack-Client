import React from "react";
import { Link } from "react-router-dom";

function PageNotFound() {
  return (
    <div>
      <h1>Page Not Found :/</h1>
      <h1>
        Go to the Homepage: <Link to="/"> Home Page</Link>
      </h1>
    </div>
  );
}

export default PageNotFound;
