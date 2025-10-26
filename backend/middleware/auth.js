const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret_key_here_change_this';
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if(authHeader && authHeader.startsWith('Bearer ')){
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if(err){
        return res.status(403).json({ message: 'Forbidden' });
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
}
module.exports = authenticateJWT;
module.exports.JWT_SECRET = JWT_SECRET;