import { LocalStorage } from "./local.storage"
import { S3Storage } from "./s3.storage"
import type { StorageProvider } from "./storage.interface"

let storage: StorageProvider

// export function getStorage(): StorageProvider {
//   if (!storage) {
//     storage = new LocalStorage()
//   }
//   return storage
// }

export function getStorage(): StorageProvider {
     if (!storage) {
       storage =
         process.env.STORAGE_DRIVER === "s3"
           ? new S3Storage()
           : new LocalStorage()
     }
     return storage
   }