import { DBOS } from "@dbos-inc/dbos-sdk"
import { DocumentsRepo } from "../documents/documents.repo"
import { SummaryService } from "../ai/summary.service"

// STEP FUNCTIONS 
async function extractText(docId: string) {
  const doc = await DocumentsRepo.getDocumentById(docId)
  if (!doc) throw new Error("Document not found")
  return `Extracted text of ${doc.name}`
}

async function generateSummary(text: string) {
  return SummaryService.generate(text)
}

async function saveResult(
  documentId: string,
  extractedText: string,
  summary: string
) {
  await DocumentsRepo.saveDocumentMetadata({
    documentId,
    extractedText,
    summary,
  })

  await DocumentsRepo.updateDocument(documentId, {
    status: "ready",
  })
}

// WORKFLOW FUNCTION
async function processDocumentWorkflow(documentId: string) {
  const text = await DBOS.runStep(
    () => extractText(documentId),
    { name: "extractText" }
  )

  const summary = await DBOS.runStep(
    () => generateSummary(text),
    { name: "generateSummary" }
  )

  await DBOS.runStep(
    () => saveResult(documentId, text, summary),
    { name: "saveResult" }
  )
}

// REGISTER WORKFLOW
export const processDocument =
  DBOS.registerWorkflow(processDocumentWorkflow)
