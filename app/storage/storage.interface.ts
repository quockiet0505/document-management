export interface PresignedUpload {
     uploadUrl: string
     storageKey: string
}
   
export interface PresignedDownload {
     downloadUrl: string
     expiresIn: number
}
   
// add upload buffer input
export interface UploadBufferInput {
     buffer: Buffer
     fileName: string
     mimeType: string
}

// export interface UploadBufferInput {
//      buffer: Uint8Array
//      fileName: string
//      mimeType: string
// }
   
   
export interface StorageProvider {
     getUploadUrl(params: {
       fileName: string
       mimeType: string
     }): Promise<PresignedUpload>
   
     getDownloadUrl(params: {
       storageKey: string
     }): Promise<PresignedDownload>

     // add 
     uploadBuffer(input: UploadBufferInput): Promise<{
          storageKey: string
     }>
}
   