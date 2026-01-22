// Download file as Buffer
export async function downloadFileAsBuffer(url: string): Promise<Buffer> {
     const res = await fetch(url)
   
     if (!res.ok) {
       throw new Error(`Failed to download file: ${res.status}`)
     }
   
     const arrayBuffer = await res.arrayBuffer()
     return Buffer.from(arrayBuffer)
   }
   
  //  Download file as Uint8Array
   export async function downloadFileAsUint8Array(
    url: string
  ): Promise<Uint8Array> {
    const res = await fetch(url)
  
    if (!res.ok) {
      throw new Error(`Failed to download file: ${res.status}`)
    }
  
    const arrayBuffer = await res.arrayBuffer()
    return new Uint8Array(arrayBuffer)
  }
  