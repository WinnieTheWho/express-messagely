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
      }    
    } 
    catch(err) {
      return next(err);
    }
   }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) { 
    const result = await db.query(
      `UPDATE users
        SET last_login_at = current_timestamp
        WHERE username = $1
        RETURNING username, last_login_at`, 
        [username]);

    if(!result.row[0]){
      throw new ExpressError(`No such user: ${username}`, 404);
    }

    return result.rows[0];
   }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { 
    const result = await db.query(
      `SELECT username,
              first_name, 
              last_name,
              phone
      FROM users`
    );
    
    if(!result.row[0]){
      throw new ExpressError(`There are no users`, 404);
    }

    let users = result.rows;

    return users;
   }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `SELECT username, 
              first_name,
              last_name, 
              phone, 
              join_at,
              last_login_at
      FROM users 
      WHERE username = $1`,
      [username]
    );

    let u = result.rows[0]
    
    if(!u){
      throw new ExpressError(`No such user: ${username}`, 404);
    }
    
   return res.json(u); 
   }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const result = await db.query(
      `SELECT m.id,
              m.from_username,
              f.first_name AS from_first_name,
              f.last_name AS from_last_name,
              f.phone AS from_phone,
              m.to_username,
              t.first_name AS to_first_name,
              t.last_name AS to_last_name,
              t.phone AS to_phone,
              m.body,
              m.sent_at,
              m.read_at
      FROM messages AS m
          JOIN users AS f ON m.from_username = f.username
          JOIN users AS t ON m.to_username = t.username
      WHERE m.from_username = $1`,
      [username]);
      
      let messages = result.rows

      if(!messages) {
        throw new ExpressError(`There are no messages from: ${username}`, 404)
      }

      return {
        id: m.id,
        to_user: {
          username: m.to_username,
          first_name: m.to_first_name,
          last_name: m.to_last_name,
          phone: m.to_phone,
        },
        body: m.body, 
        sent_at: m.sent_at,
        read_at: m.read_at,
      }
   }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) { 
    const result = await db.query(
      `SELECT m.id,
              m.from_username,
              f.first_name AS from_first_name,
              f.last_name AS from_last_name,
              f.phone AS from_phone,
              m.to_username,
              t.first_name AS to_first_name,
              t.last_name AS to_last_name,
              t.phone AS to_phone,
              m.body,
              m.sent_at,
              m.read_at
      FROM messages AS m
          JOIN users AS f ON m.from_username = f.username
          JOIN users AS t ON m.to_username = t.username
      WHERE m.to_username = $1`,
      [username]);
      
    let messages = result.rows

    if(!messages) {
      throw new ExpressError(`There are no messages from: ${username}`, 404)
    }

    return {
      id: m.id,
      from_user: {
        username: m.from_username,
        first_name: m.from_first_name,
        last_name: m.from_last_name,
        phone: m.from_phone,
      },
      body: m.body, 
      sent_at: m.sent_at, 
      read_at: m.read_at, 
    };
  }
}


module.exports = User;