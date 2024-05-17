// take the cookie, check the token and verify the token, intersect any of the process. 
// verify the user in any scenario. 
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "Not Authenticated!" });

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
    if (err) return res.status(403).json({ message: "Token is not Valid!" });
    req.userId = payload.id;

    // run the next process 
    next();
  });
};
