// app/local-upload/local-upload.api.ts
import { api } from "encore.dev/api"
import fs from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"

const UPLOAD_DIR = path.join(process.cwd(), "uploads")

// Tạo thư mục uploads nếu chưa có
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR)
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
  }
}

// PUT /__local_upload/:key
export const handleLocalUpload = api.raw(
  { 
    method: "PUT", 
    path: "/__local_upload/:key", 
    expose: true,
  },
  async (req, res) => {
    await ensureUploadDir()

    // Extract key from URL path
    const url = new URL(req.url ?? "/", "http://localhost")
    const segments = url.pathname.split("/").filter(Boolean)
    const key = segments[segments.length - 1]
    const filePath = path.join(UPLOAD_DIR, key)

    try {
      // Read binary data from request stream
      const chunks: Buffer[] = []
      for await (const chunk of req) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
      }
      const buffer = Buffer.concat(chunks)

      // Save file
      await fs.writeFile(filePath, buffer)

      console.log(` File saved: ${key}`)

      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ success: true, key, message: "File uploaded successfully" }))
    } catch (error) {
      console.error(" Upload error:", error)
      res.writeHead(500, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ success: false, message: `Failed to save file: ${String(error)}` }))
    }
  }
)

// GET /__local_download/:key
export const handleLocalDownload = api(
  { 
    method: "GET", 
    path: "/__local_download/:key", 
    expose: true,
  },
  async (req: { key: string }) => {
    await ensureUploadDir()
    
    const key = req.key
    const filePath = path.join(UPLOAD_DIR, key)
    
    try {
      await fs.access(filePath)
      const fileBuffer = await fs.readFile(filePath)
      
      // Trả về file với proper headers
      return new Response(fileBuffer, {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename="${key}"`,
        },
      })
    } catch (error) {
      console.error(" Download error:", error)
      return new Response("File not found", { status: 404 })
    }
  }
)