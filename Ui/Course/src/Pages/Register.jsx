import React, { useState } from "react";
import { CircularProgress } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

import Req from "../../Req";
import { Bounce, toast, ToastContainer } from "react-toastify";
const Register = () => {
  const [formValues, setFormValues] = useState({
    username: "",
    password: "",
    code: "",
  });

  const [loading, setloading] = useState(false);
  const [error, seterror] = useState(null);
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setloading(true);
    await Req.post("/user/register", {
      username: formValues.username,
      password: formValues.password,
      code: formValues.code,
    })
      .then((res) => {
        toast.success(res.data.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
        setloading(false)
        setTimeout(() => {
            navigate("/login")
        }, 1200);
      })
      .catch((err) => {
        seterror(err.response.data.message);
        setloading(false);
      });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-100 p-4 mt-4"
      style={{ maxWidth: "400px", margin: "0 auto" }}
    >
      <h3 className="text-center mb-4">Register</h3>

      {/* Email Input */}
      <div className="form-outline mb-3">
        <label htmlFor="username" className="form-label">
          Username
        </label>
        <input
          type="text"
          name="username"
          className="form-control"
          placeholder="Enter your username"
          value={formValues.username}
          onChange={handleInputChange}
          required
        />
      </div>

      {/* Password Input */}
      <div className="form-outline mb-3">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <input
          type="password"
          name="password" 
          className="form-control"
          placeholder="Enter your password"
          value={formValues.password}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-outline mb-3">
        <label htmlFor="code" className="form-label">
          Code
        </label>
        <input
          type="text"
          name="code" 
          className="form-control"
          placeholder="Enter the code"
          value={formValues.code}
          onChange={handleInputChange}
          required
        />
      </div>

      <button type="submit" className="btn btn-block w-100" style={{backgroundColor:"#06067a",color:"white"}}>
        {loading ? (
          <CircularProgress size="25px" sx={{ color: "white" }} />
        ) : (
          "Register"
        )}
      </button>
      {error && <p className="text-danger mt-2">{error}</p>}
      <Link to="/login">
        Login account
      </Link>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </form>
  );
};

export default Register;
