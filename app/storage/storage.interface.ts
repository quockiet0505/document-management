export interface PresignedUpload {
     uploadUrl: string
     storageKey: string
}
   
export interface PresignedDownload {
     downloadUrl: string
     expiresIn: number
}
   
export interface StorageProvider {
     getUploadUrl(params: {
       fileName: string
       mimeType: string
     }): Promise<PresignedUpload>
   
     getDownloadUrl(params: {
       storageKey: string
     }): Promise<PresignedDownload>
}
   