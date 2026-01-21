import { describe, it, expect } from "vitest"

const BASE_URL = "http://localhost:4000"

describe("Documents API integration", () => {
  it("list documents returns array", async () => {
    const res = await fetch(`${BASE_URL}/v1/documents`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: "session=fake-session", // fake auth
      },
      body: JSON.stringify({
        organizationId: "org-1",
      }),
    })

    expect(res.status).toBe(200)

    const body = await res.json()
    expect(Array.isArray(body)).toBe(true)
  })
})
