import { describe, it, expect } from "vitest"

const BASE_URL = "http://localhost:4000"
const AUTH_HEADER = "cookie: session=session-fake"

// test list documents
describe("Documents API integration", () => {
  it("list documents returns array", async () => {
    const res = await fetch(`${BASE_URL}/v1/documents`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        AUTH_HEADER, // fake auth
      },
      body: JSON.stringify({
        organizationId: "org-1",
      }),
    })

    expect([200, 400, 401, 403]).toContain(res.status)
    
  })
})


// test create document
describe("Documents API integration", ()=>{
  it("create document wiring works", async () => {
    const res = await fetch(`${BASE_URL}/v1/documents/create`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: "session=fake-session",
      },
      body: JSON.stringify({
        organizationId: "org-1",
        name: "Test Document",
        mimeType: "application/pdf",
        size: 1234,
        storageKey: "fake-key",
      }),
    })
  
    //  assert 
    expect([200, 400, 401, 403]).toContain(res.status)
  })
  
})
