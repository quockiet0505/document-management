
// Upload rules
export const UPLOAD_ALLOWED_MIME_TYPES = [
     // PDF
     "application/pdf",
   
     // Word
     "application/msword",
     "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
   
     // Excel
     "application/vnd.ms-excel",
     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
   
     // PowerPoint
     "application/vnd.ms-powerpoint",
     "application/vnd.openxmlformats-officedocument.presentationml.presentation",
   
     // Images
     "image/png",
     "image/jpeg",
   ] as const
   
   export const MAX_UPLOAD_FILE_SIZE = 20 * 1024 * 1024 // 20MB
   
   // Processing capabilities

   export const SUMMARY_SUPPORTED_MIME_TYPES = [
     "application/pdf",
     "application/msword",
     "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
     "text/plain",
   ] as const
   
   export const CONVERT_SUPPORTED_MIME_TYPES = [
     "application/pdf",
   ] as const
   
// helper function
   export function canUpload(mimeType: string, size?: number): boolean {
     if (!UPLOAD_ALLOWED_MIME_TYPES.includes(mimeType as any)) return false
     if (size && size > MAX_UPLOAD_FILE_SIZE) return false
     return true
   }
   
   export function canSummary(mimeType: string): boolean {
     return SUMMARY_SUPPORTED_MIME_TYPES.includes(mimeType as any)
   }
   
   export function canConvertToDocx(mimeType: string): boolean {
     return CONVERT_SUPPORTED_MIME_TYPES.includes(mimeType as any)
   }
   