import axios from "axios";
import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ onLogout }) => {
  const navigate = useNavigate();
  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{backgroundColor:"#04043C"}}>
      <a className="navbar-brand" href="#">
        Course
      </a>
      <button
        className="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
              <span className="nav-link">
                Home <span className="sr-only">(current)</span>
              </span>
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/upload" style={{ textDecoration: "none", color: "inherit" }}>
              <span className="nav-link">
                Upload
              </span>
            </Link>
          </li>
        </ul>
        {/* Logout Button aligned to the right */}
        <ul className="navbar-nav ml-auto">
          <li className="nav-item">
            <button
              className="btn"
              style={{backgroundColor:"#FFF",color:"#06067a"}}
              onClick={() => {
                onLogout();
                navigate("/login");
              }}
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );

}

export default Navbar;
