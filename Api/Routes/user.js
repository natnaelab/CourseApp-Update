const router = require("express").Router()
const User = require("../Models/User")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
router.post("/register", async (req, res) => {
    try {
    
      if(req.body.code != process.env.CODE){
        return res.status(400).json({ message: "The Code is invalid", status: false });
      }
      const existingUser = await User.findOne({ username: req.body.username });
      
      if (existingUser) {
        return res.status(400).json({message:"Username Already Exists",status:false});
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      req.body.password = hashedPassword

      const newUser = new User(req.body)
     
      const user = await newUser.save(req.body);
      res.status(200).json({message:"User Created Successfully","status":true})
    } catch (err) {
      res.status(500).json({message:err.message,status:false})
    
    }
  });
  

  router.post("/login", async (req, res) => {
    try {
      const user = await User.findOne({ username: req.body.username });
      if(!user){
       return res.status(404).json({"message":"Invalid Credentials","status":"false"});
      }
  
      const validPassword = await bcrypt.compare(req.body.password, user.password)
      if(!validPassword){
        return res.status(400).json({"message":"Invalid Credentials","status":"false"})
      }
  
      const token = jwt.sign({id:user._id},process.env.JWTKEY)
      res.status(200).json({
          "username":user.username,
          "token":token
      })
  
      
    } catch (err) {
      res.status(500).json(err)
      console.log(err)
    }
  });

 


  
  module.exports = router;
  