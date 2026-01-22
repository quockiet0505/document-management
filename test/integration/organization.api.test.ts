import { describe, it, expect } from "vitest"

const BASE_URL = "http://localhost:4000"

// list orgs of user
describe("Org api integration, list", ()=>{
     it("my-orgs wiring works", async () => {
          const res = await fetch(`${BASE_URL}/v1/organization/my-orgs`, {
            method: "GET",
            headers: {
              cookie: "session=fake-session",
            },
          })
        
          //assert status is 200 or 401
          expect([200, 401]).toContain(res.status)
        })
})
// test create org
describe("Org api integration, create", ()=>{
     it("create org wiring works", async () => {
          const res = await fetch(`${BASE_URL}/v1/organization/create`, {
            method: "POST",
            headers: {
              "content-type": "application/json",
              cookie: "session=fake-session",
            },
            body: JSON.stringify({
              nameOrg: "Test Org",
            }),
          })
        
          // expect fail
          expect([200, 400, 401]).toContain(res.status)
        })
        
})
