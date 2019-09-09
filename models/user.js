/** User class for message.ly */



/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
    const result = await db.query (
      `INSERT INTO users (
        username,
        password, 
        first_name, 
        last_name, 
        phone
      ) 
      VALUES ($1, $2, $3, $4, $5)
      RETURNING username, password, first_name, last_name, phone`, 
      [username, password, first_name, last_name, phone]);

      return result.rows[0]
   }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    try{
    const result = await db.query(
      "SELECT password FROM users WHERE username =$1", 
      [username]);
      let user = result.row[0];

    if (user) {
      let isAuthorized = await (bcrypt.compare(password, user.password) === true);
        return isAuthorized;
      } else {
        throw new ExpressError("Invalid username/password"); 
      }
    } catch(err) {
      return next(err);
    }
   }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) { }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) { }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) { }
}


module.exports = User;