// interfaces
// export interface ShareDocumentInput {
//      documentId: string
//      userId: string
//      permission: "view" | "edit"
//    }
   
// export interface RevokeShareInput {
//      shareId: string
//    }
  
export interface ShareDocumentRequest {
  id: string
  userId: string
  permission: "view" | "edit"
}

export interface RevokeShareRequest {
  id: string
}
