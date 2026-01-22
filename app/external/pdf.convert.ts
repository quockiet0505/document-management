import ConvertApi from "convertapi"
import dotenv from "dotenv"
import path from "path"
import fs from "fs/promises"
import os from "os"

// Load env
dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
  override: true,
})

const API_SECRET = process.env.CONVERTAPI_SECRET
if (!API_SECRET) {
  throw new Error("CONVERTAPI_SECRET not set")
}

// init client
const convertapi = new ConvertApi(API_SECRET)


//   Convert PDF buffer -> DOCX buffer

export async function convertPdfToDocxFromBuffer(
     pdfBuffer: Buffer,
     fileName = "input.pdf"
   ): Promise<Buffer> {
   
     // Tạo file tạm
     const tmpDir = os.tmpdir()
     const pdfPath = path.join(tmpDir, `${Date.now()}-${fileName}`)
     const docxPath = pdfPath.replace(".pdf", ".docx")
   
     await fs.writeFile(pdfPath, pdfBuffer)
   
     //  Convert bằng FILE PATH
     const result = await convertapi.convert(
       "docx",
       { File: pdfPath },
       "pdf"
     )
   
     //  Download file kết quả
     await result.saveFiles(tmpDir)
   
     const docxBuffer = await fs.readFile(docxPath)
   
     // Cleanup
     await fs.unlink(pdfPath)
     await fs.unlink(docxPath)
   
     return docxBuffer
   }