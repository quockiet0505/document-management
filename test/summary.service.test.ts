import { describe, it, expect, vi } from "vitest"
import { SummaryService } from "../app/ai/summary.service"

vi.mock("@google/generative-ai", () => {
     return {
       GoogleGenerativeAI: class {
         constructor() {}
         getGenerativeModel() {
           return {
             generateContent: async () => ({
               response: {
                 text: () => "Mocked summary",
               },
             }),
           }
         }
       },
     }
   })
   

   describe("SummaryService", () => {
     it("should return summary text", async () => {
       const result = await SummaryService.generate("Hello world")
       expect(result).toBe("Mocked summary")
     })
   })
   