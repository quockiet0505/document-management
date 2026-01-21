import { describe, it, expect, beforeEach } from "vitest"
import { DocumentsService } from "../../app/documents/documents.service"
import { DocumentsRepo } from "../mocks/documents.repo"
import { cache } from "../mocks/cache"
import { APIError } from "encore.dev/api"
import { organizations } from "~encore/clients"

const userId = "user-1"
const orgId = "org-1"
const docId = "doc-1"

beforeEach(() => {
  Object.values(DocumentsRepo).forEach(fn => fn.mockReset())
  Object.values(cache).forEach(fn => fn.mockReset())
})

// test for getDocumentById
describe("DocumentsService.getDocumentById", () => {
  it("returns cached document if cache hit", async () => {
    const cachedDoc = { id: docId }

    cache.get.mockResolvedValue(cachedDoc)

    const result = await DocumentsService.getDocumentById(
      userId,
      docId
    )

    expect(result).toEqual(cachedDoc)
    expect(DocumentsRepo.getDocumentById).not.toHaveBeenCalled()
  })

  it("throws NotFound if document does not exist", async () => {
    cache.get.mockResolvedValue(null)
    DocumentsRepo.getDocumentById.mockResolvedValue(null)

    await expect(
      DocumentsService.getDocumentById(userId, docId)
    ).rejects.toBeInstanceOf(APIError)
  })
})

// test for createDocument
describe("DocumentsService.createDocument", () =>{
     it("creates document when user is org member", async () =>{
          DocumentsRepo.isOrgMember.mockResolvedValue(null);

          await expect(
               DocumentsService.createDocument(userId, {
                    organizationId: "org-1",
                    name: "Test document 1",
                    mimeType: "application/pdf",
                    size: 1024,
                    storageKey: "storage-key-1"
               } as any) 
          ).rejects.toBeInstanceOf(APIError);
     })

     it("creates document is a member, version 1", async()=>{
          DocumentsRepo.isOrgMember.mockResolvedValue({role:"member"});

          DocumentsRepo.createDocument.mockResolvedValue({
               id: "doc-1",
               latestVersion: "1"
          });

          const result = await DocumentsService.createDocument(userId, {
               organizationId: "org-1",
               name: "Test document 2",
               mimeType: "application/pdf",
               size: 1024,
               storageKey: "storage-key-1"
          } as any)

          // check call create document
          expect(DocumentsRepo.createDocument).toHaveBeenCalled()

          // check call create document version with version 1
          expect(DocumentsRepo.createDocumentVersion).toHaveBeenCalledWith(
               expect.objectContaining({ version: 1 })
          )

          // check expected result = doc-1
          expect(result.id).toBe("doc-1")

          })
})

// test for update document
describe("DocumentsService.updateDocument", () =>{
     // allow owner to update
     it("updates document when user is owner", async ()=>{
          // mock get document id
          DocumentsRepo.getDocumentById.mockResolvedValue({
               id: "doc-1",
               owner: "user-1",
               organizationId: "org-1"
          })


          DocumentsRepo.isOrgMember.mockResolvedValue({role:"admin"}); 

          const res = await DocumentsService.updateDocument(
               userId,
               docId,
               { name: "update name"} as any
          )

          expect(res.success).toBe(true)
     })

     // block non-owner non-admin
     it("blocks update document when non-admin, non-owner", async() =>{
          // mock get document id
          DocumentsRepo.getDocumentById.mockResolvedValue({
               id: "doc-1",
               owner: "user-2",
               organizationId: "org-1"
          })

          // mock value role, isOrgMember
          DocumentsRepo.isOrgMember.mockResolvedValue({role:"member"})
          // mock permission = view
          DocumentsRepo.getSharePermission.mockResolvedValue({permission:"view"})

          await expect(
               DocumentsService.updateDocument(
                    "user-1",
                    "doc-1",
                    { name: "update name"} as any
               )
          ).rejects.toBeInstanceOf(APIError)
     })
})


// upload new version
describe("DocumentsService.uploadNewVersion", () =>{
     // increment version when owner uploadNewVersion
     it("increments version when owner upload new version", async ()=>{
          // mock get document id
          DocumentsRepo.getDocumentById.mockResolvedValue({
               id: "doc-1",
               userId: "user-1",
               organizationId: "org-1",
               latestVersion: 2,

          })

          // admin update new version
          DocumentsRepo.isOrgMember.mockResolvedValue({role:"admin"});

          const res = await DocumentsService.uploadNewVersion(
               userId,
               docId,
               {
                    mimeType: "application/pdf",
                    size: 2048,
                    storageKey: "storage-key-3"
               } as any
          )

          // check called with version 3
          expect(DocumentsRepo.createDocumentVersion).toHaveBeenCalledWith(
               expect.objectContaining({version: 3})
          )

          // check res version: 3
          expect(res.newVersion).toBe(3)
     })
})

// soft delete document
describe("DocumentsService.softDeleteDocument", ()=>{
     // allow admin to soft delete
     it("soft deletes document when user admin", async () =>{
          // mock get document id 
          DocumentsRepo.getDocumentById.mockResolvedValue({
               id: "doc-1",
               ownerId: "user-1",
               organizationId: "org-1",
          })

          // admin delete
          DocumentsRepo.isOrgMember.mockResolvedValue({role: "admin"})

          const res = await DocumentsService.softDeleteDocument(
               "user-2",
               "doc-1"
          )
          // check success when admin soft delete
          expect(res.success).toBe(true)
          expect(DocumentsRepo.softDeleteDocument).toHaveBeenCalled
     })

     // allow owner to soft delete
     it("soft deletes document when user is owner", async () =>{
          // mock get document id 
          DocumentsRepo.getDocumentById.mockResolvedValue({
               id: "doc-1",
               ownerId: "user-1",
               organizationId: "org-1",
          })

          // member delete , owner document
          DocumentsRepo.isOrgMember.mockResolvedValue({role: "member"})
          const res = await DocumentsService.softDeleteDocument(
               "user-1",
               "doc-1"
          )
          // check success when owner soft delete
          expect(res.success).toBe(true)
          expect(DocumentsRepo.softDeleteDocument).toHaveBeenCalled
     })

})

// get summary
describe("DocumentsService.getDocumentSummary", () =>{
      // mock get document id 
      beforeEach(() => {
          DocumentsRepo.getDocumentById.mockResolvedValue({
            id: "doc-1",
            ownerId: "user-1",
            organizationId: "org-1",
          })
     })

     // case 1: cache hit
     it("returns document summary, cache hit", async ()=>{
          // mock cache
          cache.get.mockResolvedValue({ summary: "cached-summary"})

          // is a member in organization
          DocumentsRepo.isOrgMember.mockResolvedValue({ role: "member"})

          const result = await DocumentsService.getSummary(
               userId,
               docId
          )

          // expect cache get called, success
          expect(result.summary).toBe("cached-summary")
          expect(DocumentsRepo.getDocumentSummary).not.toHaveBeenCalled()
          expect(cache.set).not.toHaveBeenCalled()

     })

     // case 2: cache miss, DB summary
     it("fetch doc summary from DB, cache miss", async()=>{
          // mock cache miss
          cache.get.mockResolvedValue(null)

           // is a member in organization
           DocumentsRepo.isOrgMember.mockResolvedValue({ role: "member"})

          // mock DB summary
          DocumentsRepo.getDocumentSummary.mockResolvedValue({
               summary: "db-summary"
          })

          const result = await DocumentsService.getSummary(
               userId,
               docId
          )

          // expect fetched from DB
          expect(result.summary).toBe("db-summary")
          expect(DocumentsRepo.getDocumentSummary).toHaveBeenCalled()

          expect(cache.set).toHaveBeenCalledWith(
               `doc:summary:${docId}`,
               { summary: "db-summary"},
               300000
               // TTL
          )
     })

     // case 3: cache miss, DB summary null
     it("returns null summary when does not cache", async()=>{
          cache.get.mockResolvedValue(null)
          DocumentsRepo.getDocumentSummary.mockResolvedValue(null)

           // is a member in organization
           DocumentsRepo.isOrgMember.mockResolvedValue({ role: "member"})

          const result = await DocumentsService.getSummary(
               userId,
               docId
          )

          // expect null summary
          expect(result.summary).toBeNull()
          // expect(cache.set).not.toHaveBeenCalled()
          const summaryCacheCall = cache.set.mock.calls.find(
               call => call[0] === `doc:summary:${docId}`
          ) 
          expect(summaryCacheCall).toBeUndefined()
     })

     // check permission PermissionDenied
     it("throws PermissionDenied when user not org member", async()=>{
          cache.get.mockResolvedValue(null)

          // not a member in organization
          DocumentsRepo.isOrgMember.mockResolvedValue(null)

          await expect(
               DocumentsService.getSummary(
                    userId,
                    docId
               )
          ).rejects.toBeInstanceOf(APIError)
     })
})

// listDocuments
describe("DocumentsService.listDocuments", () => {
     const input = {
       organizationId: "org-1",
     } as any
   
     // permission check, not org member
     it("throws PermissionDenied if user is not org member", async () => {
       DocumentsRepo.isOrgMember.mockResolvedValue(null)
   
       await expect(
         DocumentsService.listDocuments("user-1", input)
       ).rejects.toBeInstanceOf(APIError)
     })
   
     // return documents if org member
     it("returns documents if user is org member", async () => {
       DocumentsRepo.isOrgMember.mockResolvedValue({ role: "member" })
   
       DocumentsRepo.listDocuments.mockResolvedValue([
         { id: "doc-1" },
         { id: "doc-2" },
       ])
   
       const result = await DocumentsService.listDocuments("user-1", input)
   
       expect(DocumentsRepo.listDocuments).toHaveBeenCalledWith(input)
       expect(result).toHaveLength(2)
     })
   })
   
// search
describe("DocumentsService.search", () =>{
     const input = {
          organizationId: "org-1",
          keyword: "report"
     } as any

     // permission check, not org member
     it("throws permission denied if user not in org", async()=>{
          // Mock not isOrgMember
          DocumentsRepo.isOrgMember.mockResolvedValue(null)

          // expect search to throw
          await expect(
               DocumentsService.search("user-1", input)
          ).rejects.toBeInstanceOf(APIError)
     })

     // return search results if org member
     it("returns search results if user is org member", async() =>{
          // mock isOrgMember
          DocumentsRepo.isOrgMember.mockResolvedValue({ role: "member"})

          DocumentsRepo.searchDocuments.mockResolvedValue([
               { id: "doc-1"},
               { id: "doc-2"}
          ])

          const result = await DocumentsService.search("user-1", input)

          expect(DocumentsRepo.searchDocuments).toHaveBeenCalledWith(input)
          expect(result).toHaveLength(2)
     })
})
// listDocumentVersions
describe("DocumentsService.listDocumentVersions", () =>{
     const doc = "doc-1"
     // permission check, not org member
     it("throws permission denied of user is not in org", async()=>{
          // mock getDocumentById
          DocumentsRepo.getDocumentById.mockResolvedValue({
               id: doc,
               organizationId: "org-1"
          })
          // mock isOrgMember = null
          DocumentsRepo.isOrgMember.mockResolvedValue(null)
          await expect(
               DocumentsService.listDocumentVersions("user-1", doc)
          ).rejects.toBeInstanceOf(APIError)
     })

     // return list document versions if org member
     it("returns list document versions if user is org member", async()=>{
          // mock getDocumentById
          DocumentsRepo.getDocumentById.mockResolvedValue({
               id: doc,
               organizationId: "org-1"
          })
          // mock isOrgMember = member
          DocumentsRepo.isOrgMember.mockResolvedValue({ role: "member"})

          DocumentsRepo.listDocumentVersions.mockResolvedValue([
               { version: 1},
               { version: 2}
          ])

          const result = await DocumentsService.listDocumentVersions(
               "user-1",
               doc
          )

          expect(DocumentsRepo.listDocumentVersions).toHaveBeenCalledWith(doc)
          expect(result).toHaveLength(2)
     })
})