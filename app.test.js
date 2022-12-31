import supertest from "supertest"
import app from './apptest.js'

test("should respond with a 200 status code", async () => {
    const response = await request(app).post("/users").send({
      username: "username",
      password: "password"
    })
    expect(response.statusCode).toBe(200)
  })