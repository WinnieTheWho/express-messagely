const express = require('express');
const User = require('../models/user');
const { SECRET_KEY } = require("../config");
const jwt = require("jsonwebtoken");
const ExpressError = require("../expressError");


const router = express.Router();

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post('/login', async function(req, res, next) {
  try {
    const { username, password } = req.body;
    const result = await User.authenticate(username, password);
    
    if (result === true) {
      // User.updateLoginTimestamp(username);
      let token = jwt.sign({ username }, SECRET_KEY);
      return res.json({ token });
    }
    throw new ExpressError("Invalid user/password", 400);
  }
  catch(err) {
    return next(err);
  }
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post('/register', async function (req, res, next) {
  try {
    // Register user in models
    const userInfo = req.body;
    const result = await User.register(userInfo)
    let token;
    // If registering returns no errors
    if (result) {
      // Update timestamp
      User.updateLoginTimestamp(result.username);

      // Generate token 
      let payload = { username: result.username };
      token = jwt.sign(payload, SECRET_KEY);
    } 
    return res.json({ token });
  }
  catch (err) {
    return next(err);
  }
});



module.exports = router