const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  // Allow preflight OPTIONS requests to pass through.
  if (req.method === "OPTIONS") {
    return next();
  }

  // Look for the token in either "authorization" or "token" header.
  const authHeader = req.headers.authorization || req.headers.token;

  if (!authHeader) {
    return res.status(401).json({
     message:"Your are not Authenticated",
     status:false
    });
  }

  // Remove "Bearer " prefix if present.
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

  jwt.verify(token, process.env.JWTKEY, (err, user) => {
    if (err) {
      return res.status(401).json({
        message:"Your are not Authenticated",
        status:false
      });
    }
    req.user = user;
    next();
  });
};

module.exports = authenticate;
