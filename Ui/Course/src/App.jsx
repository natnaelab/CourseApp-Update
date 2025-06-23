import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/Login";
import Home from "./Pages/Home";
import Navbar from "./Components/Navbar";
import Upload from "./Pages/Upload";
import { getUser } from "./UserProfile";
import axios from "axios";
import Register from "./Pages/Register";
import Update from "./Pages/Update";
import Create from "./Pages/Create";
function App() {
  const [user, setUserState] = useState(getUser());

  const handleLogin = (userData) => {
    setUserState(userData);
  };

  const handleLogout = async () => {
    setUserState(null);
    localStorage.removeItem("CurrentUser");

    try {
      await axios.get("/api/user/logout");
    } catch (error) {
      throw error;
    }
  };

  return (
    <BrowserRouter>
      {user && <Navbar onLogout={handleLogout} />}

      <Routes>
        <Route path="/">
          <Route
            index
            element={user ? <Home /> : <Navigate to="/login" replace />}
          />
          <Route path="/register" element={
            !user ? (
              <Register></Register> 
            ) : <Navigate to="/" replace></Navigate>
          }></Route>
          <Route
            path="/login"
            element={
              !user ? (
                <Login onLogin={handleLogin} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/upload"
            element={user ? <Upload /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/update/:id"
            element={user ? <Update /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/create"
            element={user ? <Create /> : <Navigate to="/login" replace />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;