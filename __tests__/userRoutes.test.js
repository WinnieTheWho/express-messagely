const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const Message = require("../models/message");

let _token;

describe("Users Routes Test", function () {

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

    let userLogin = await request(app)
      .post("/auth/login")
      .send({ username: "test1", password: "password" });

    _token = userLogin.body.token;

    let u2 = await User.register({
      username: "test2",
      password: "password2",
      first_name: "Test2",
      last_name: "Testy2",
      phone: "+14155550001",
    });

    let message2 = await Message.create({
      from_username: "test2",
      to_username: "test1",
      body: "hello am second message!"
    })

  });

  /** GET /users/ => all users */
  describe("GET /users", function () {
    test("can get all users", async function () {

      let response = await request(app)
        .get("/users")
        .send({ "_token": _token });
      expect(response.statusCode).toEqual(200);
    });

    test("not authorized to get users", async function () {
      let response = await request(app)
        .get("/users")
      expect(response.statusCode).toEqual(401);
    });
  });

  /** GET /:username => details of users */
  describe("GET /:username", function () {
    test("can get user details", async function () {

      let response = await request(app)
        .get("/users/test1")
        .send({ "_token": _token });
      expect(response.statusCode).toEqual(200);
      expect(response.body.user.username).toEqual("test1");
    });

    test("not authorized to get user details", async function () {
      let invalidToken = _token + "z"
      let response = await request(app)
        .get("/users/test1")
        .send({ "_token": invalidToken });
      expect(response.statusCode).toEqual(401);
    });
  });

  /** GET /:username/to => messages from user */
  describe("GET /:username/to", function () {

    test("can get messages to user", async function () {
      let response = await request(app)
        .get("/users/test1/to")
        .send({ "_token": _token });
      expect(response.statusCode).toEqual(200);
    })

    test("no messages to user", async function () {
      let response = await request(app)
        .get("/users/test2/to")
        .send({ "_token": _token });
      expect(response.statusCode).toEqual(404);
    })
  })


  /** GET /:username/from - get messages from user*/
  describe("GET /:username/from", function () {
    test("can get messages from user", async function () {
      let response = await request(app)
        .get("/users/test2/from")
        .send({ "_token": _token });
        expect(response.statusCode).toEqual(200);
    })

    test("no messages from user", async function () {
      let response = await request(app)
        .get("/users/test1/from")
        .send({ "_token": _token });
      expect(response.statusCode).toEqual(404);
    })
  })
});

afterAll(async function () {
  await db.end();
});