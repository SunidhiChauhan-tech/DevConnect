import jwt from 'jsonwebtoken'

const generateToken = (userId) => {
  // jwt.sign() creates a new token
  // First argument: payload — data we want to store inside the token
  // Second argument: secret — used to sign and later verify the token
  // Third argument: options — when the token expires
  
  const token = jwt.sign(
    { id: userId },                    // payload — we store user's MongoDB _id
    process.env.JWT_SECRET,            // secret key from .env
    { expiresIn: process.env.JWT_EXPIRE }  // token expires in 7 days
  )

  return token
}

export default generateToken