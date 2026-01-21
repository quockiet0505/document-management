import { describe, it, expect } from "vitest"

const BASE_URL = "http://localhost:4000"

interface LoginResponse {
  token: string;
  userId: string | number;
}

describe("Auth API integration", () => {
  it("login returns token", async () => {
    const res = await fetch(`${BASE_URL}/v1/auth/login`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: "kiet@gmail.com",
        password: "12345678",
      }),
    })

    // check status
    expect(res.status).toBe(200)

    // check response body
    const body = (await res.json()) as LoginResponse

    // check token and userId
    expect(body.token).toBeDefined()
    expect(body.userId).toBeDefined()
  })
})
