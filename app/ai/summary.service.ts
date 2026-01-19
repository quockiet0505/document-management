import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI( process.env.GEMINI_API_KEY! )

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
