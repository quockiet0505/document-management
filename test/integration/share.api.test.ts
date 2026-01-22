import { describe, it, expect } from "vitest"

const BASE_URL = "http://localhost:4000"

// share my document
describe("Share api integration, share doc", ()=>{
     it("list shared documents wiring works", async () => {
          const res = await fetch(`${BASE_URL}/v1/shares/my-documents`, {
            method: "GET",
            headers: {
              cookie: "session=fake-session",
            },
          })
        
          expect([200, 401]).toContain(res.status)
        })
})

// revoke share document
describe("Share api integration, revoke share", ()=>{
     it("revoke share wiring works", async () => {
          const res = await fetch(`${BASE_URL}/v1/shares/share-fake-id`, {
            method: "DELETE",
            headers: {
              cookie: "session=fake-session",
            },
          })
        
          expect([200, 401, 403, 404]).toContain(res.status)
        })
})