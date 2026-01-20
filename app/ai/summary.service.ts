import { GoogleGenerativeAI } from "@google/generative-ai"

import dotenv from "dotenv"
import path from "path"
// LOAD ENV FIRST!
dotenv.config({ 
  path: path.resolve(process.cwd(), '.env'),
  override: true 
})

// check .env GEMINI_API_KEY
console.log("🔧 Gemini AI Config:")
console.log("GEMINI API KEY: ", process.env.GEMINI_API_KEY ? "**SET API**" : "NOT SET")

const genAI = new GoogleGenerativeAI( process.env.GEMINI_API_KEY || "no-api-key gemini")

export const SummaryService = {
  async generate(text: string): Promise<string> {
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
    })

    const prompt = `
          Summarize the following document in 3–5 sentences.
          Focus on key points, no bullet points.

          Document:
          ${text}
          `

    const result = await model.generateContent(prompt)
    return result.response.text()
  },
}
