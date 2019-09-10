const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const Message = require("../models/message");

let _token1;
let _token2;
let message;

describe("Message Routes Test", function () {

  beforeEach(async function () {
    await db.query("DELETE FROM messages");
    await db.query("DELETE FROM users");

    let u1 = await User.register({
      username: "test1",
      password: "password",
      first_name: "Test1",
      last_name: "Testy1",
      phone: "+14155550000",
    });

    let userLogin1 = await request(app)
      .post("/auth/login")
      .send({ username: "test1", password: "password" });

    _token1 = userLogin1.body.token;

    let u2 = await User.register({
      username: "test2",
      password: "password2",
      first_name: "Test2",
      last_name: "Testy2",
      phone: "+14155550001",
    });


    message = await Message.create({
      from_username: "test2",
      to_username: "test1",
      body: "hello am second message!"
    })

  });

  /** GET /:id  => get detail of message. */
  describe("GET /:id", function () {
    test("get details of one message", async function () {
      // console.log(message.id);
      // console.log(_token2);
      // console.log(_token1);
      
      let userLogin2 = await request(app)
        .post('/auth/login')
        .send({ username: "test2", password: "password2" })

      console.log(userLogin2.body);
      _token2 = userLogin2.body.token;
      let a = jwt.decode(_token2);
      console.log(a);

      let response = await request(app)
        .get(`/messages/${message.id}`)
        .send({ "_token": _token2 });

      expect(response.statusCode).toEqual(200);
    });
  });


});



afterAll(async function () {
  await db.end();
});