const express = require('express');
const User = require('../models/user');
const Message = require('../models/message');
const jwt = require("jsonwebtoken");

const { ensureLoggedIn } = require('../middleware/auth');
const router = express.Router();

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

router.get('/', ensureLoggedIn, async function (req, res, next) {
  const users = await User.all();
  return res.json({ users });
});
/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get('/:username', ensureLoggedIn, async function(req, res, next) {
  const { username } = req.params;
  const user = await User.get(username);

  return res.json({ user });
});

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get('/:username/to', ensureLoggedIn, async function(req, res, next) {
  try {
    const { username } = req.params;
    const toUserMessages = await User.messagesTo(username);
    if (!toUserMessages) {
      throw new ExpressError(`No messages to user ${username}`, 404);
    }
    return res.json({ toUserMessages });
  }
  catch(err) {
    return next(err);
  }
})

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get('/:username/from', ensureLoggedIn, async function(req, res, next) {
  try {
    const { username } = req.params;
    const fromUserMessages = await User.messagesFrom(username);
    if (!fromUserMessages) {
      throw new ExpressError(`No messages from user ${username}`, 404);
    }
    return res.json({ fromUserMessages })
  }
  catch(err) {
    return next(err);
  }
});

module.exports = router;
