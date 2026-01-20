// mock encore.dev/api
export class APIError extends Error {
     constructor(public code: string, message: string) {
       super(message)
     }
   }
   
   export const ErrCode = {
     NotFound: "not_found",
     PermissionDenied: "permission_denied",
     Internal: "internal",
     Unauthenticated: "unauthenticated",
     InvalidArgument: "invalid_argument",
     AlreadyExists: "already_exists",
   }
   
   export const getAuthData = () => ({
     userID: 'test-user-123',
     organizationID: 'test-org-123',
     email: 'test@example.com',
   })