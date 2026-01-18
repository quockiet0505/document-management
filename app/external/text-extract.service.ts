import fetch from "node-fetch"

export async function extractTextFromFile(url: string) {
  const res = await fetch("https://example.com/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  })

  if (!res.ok) throw new Error("Extract failed")

  const data = await res.json()
  return data
}
