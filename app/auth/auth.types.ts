// all interface
export interface RegisterInput {
     email: string
     password: string
     fullName: string
     phone?: string
   }
   
   export interface LoginInput {
     email: string
     password: string
   }
   
   export interface AuthData {
     userID: string
   }
   
   export interface AuthContext {
     userId: string
     organizationId: string
     role: "admin" | "member"
   }
   
// interface request
export interface RegisterRequest extends RegisterInput {}

export interface LoginRequest extends LoginInput {}

