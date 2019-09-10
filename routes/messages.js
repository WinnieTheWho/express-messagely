const express = require('express');
const User = require('../models/user');
const Message = require('../models/message');
const { SECRET_KEY } = require("../config");
const jwt = require("jsonwebtoken");

const { ensureLoggedIn, ensureCorrectUser } = require('../middleware/auth');
const router = express.Router();


/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get('/:id', ensureLoggedIn, async function(req, res, next) {
  try {
    const { id } = req.params;
    const message = await Message.get(id);
    if (message) {
      console.log(message);
      return res.json({ message });
    }
  }
  catch(err) {
    return next(err);
  }
})

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post('/', ensureLoggedIn, async function(req, res, next) {
  try {
    const { from_username, to_username, body } = req.body;
    const message = await Message.create({ from_username, to_username, body });
    return res.json({ message });
  }
  catch(err) {
    return next(err);
  }
})


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/


router.post('/:id/read', ensureLoggedIn, async function(req, res, next) {
  try {
    const { id } = req.params;
    const message = await Message.markRead(id);

    return res.json({ message });
  }
  catch(err) {
    return next(err);
  }
});


module.exports = router;