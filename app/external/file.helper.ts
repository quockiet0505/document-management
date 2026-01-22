export async function downloadFileAsBuffer(url: string): Promise<Buffer> {
     const res = await fetch(url)
   
     if (!res.ok) {
       throw new Error(`Failed to download file: ${res.status}`)
     }
   
     const arrayBuffer = await res.arrayBuffer()
     return Buffer.from(arrayBuffer)
   }
   