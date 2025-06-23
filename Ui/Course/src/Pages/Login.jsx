import React, { useState } from "react";
import { CircularProgress } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import Req from "../../Req";
const Login = ({ onLogin }) => {

  const [formValues, setFormValues] = useState({
    username: "",
    password: "",
  });

  

 
  const [loading,setloading] = useState(false)
  const [error,seterror] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };


  const handleSubmit = async(e) => {
    e.preventDefault()
    setloading(true)
    await Req.post("/user/login",{username:formValues.username,password:formValues.password})
    .then((res)=>{
      if(res.status === 200){
        localStorage.setItem("CurrentUser",JSON.stringify(res.data))
        onLogin(res.data)
      }

    
  }).catch((err)=>{
     seterror(err.response.data.message)
     setloading(false)
     
  })
  };
  
  return (
    <form    onSubmit={handleSubmit} className="w-100 p-4 mt-4" style={{ maxWidth: "400px", margin: "0 auto" }}>
      <h3 className="text-center mb-4">Login</h3>
      
      {/* Email Input */}
      <div className="form-outline mb-3">
        <label htmlFor="username" className="form-label">
          Username
        </label>
        <input
           type="text"
           name="username" // Use "name" instead of "id"
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
         name="password" // Use "name" instead of "id"
         className="form-control"
         placeholder="Enter your password"
         value={formValues.password}
         onChange={handleInputChange}
         required
        />
      </div>

     

      {/* Sign In Button */}

      
      <button
        type="submit"
        className="btn btn-block w-100"
        style={{backgroundColor:"#06067a",color:"white"}}
      >
       
        {loading ? <CircularProgress size="25px" sx={{color:"white",}}/>:"Sign in"}
      </button>

      {error && <p className="text-danger mt-2">{error}</p>}
      <Link to="/register">
        Register account
      </Link>
      
    </form>

    
    
  );
};

export default Login;
