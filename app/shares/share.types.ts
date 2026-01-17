// interfaces
export interface ShareDocumentInput {
     documentId: string
     userId: string
     permission: "view" | "edit"
   }
   
export interface RevokeShareInput {
     shareId: string
   }
   