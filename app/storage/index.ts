import { LocalStorage } from "./local.storage"
import { S3Storage } from "./s3.storage"
import type { StorageProvider } from "./storage.interface"

import dotenv from "dotenv"
import path from "path"
// LOAD ENV FIRST!
dotenv.config({ 
  path: path.resolve(process.cwd(), '.env'),
  override: true 
})

let storage: StorageProvider

// console
console.log("---------Storage---------")
console.log("Storage Drive:", process.env.STORAGE_DRIVE || 'not set')

export function getStorage(): StorageProvider {
     if (!storage) {
     

       storage =
          ("s3" == process.env.STORAGE_DRIVE) 
           ? new S3Storage()
           : new LocalStorage()
     }
     return storage
   }