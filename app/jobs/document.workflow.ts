import { DBOS } from "@dbos-inc/dbos-sdk"
import { DocumentsRepo } from "../documents/documents.repo"
import { SummaryService } from "../ai/summary.service"
import { cp } from "fs"

// STEP FUNCTIONS 
async function extractText(docId: string) {
  console.log(`[extractText] Starting for document: ${docId}`)
  const doc = await DocumentsRepo.getDocumentById(docId)
  console.log(`[extractText] Fetched document: ${doc?.name}`)
  if (!doc) throw new Error("Document not found")
  return `Extracted text of ${doc.name}`
}

async function generateSummary(text: string) {
  console.log(`[generateSummary] Generating summary`)
  return SummaryService.generate(text)
}

async function saveResult(
  documentId: string,
  extractedText: string,
  summary: string
) {
  console.log(`[saveResult] Saving results for document: ${documentId}`)
  console.log(`[saveResult] Summary length: ${summary.length}`)
  console.log(`[saveResult] Summary preview: ${summary.substring(0, 500)}...`)
  await DocumentsRepo.saveDocumentMetadata({
    documentId,
    extractedText,
    summary,
  })

  await DocumentsRepo.updateDocument(documentId, {
    status: "ready",
  })
  console.log(`[saveResult] Document ${documentId} updated to ready status`)
}

// WORKFLOW FUNCTION
async function processDocumentWorkflow(documentId: string) {
  console.log(`[processDocumentWorkflow] Processing document: ${documentId}`)
  const text = await DBOS.runStep(
    () => extractText(documentId),
    { name: "extractText" }
  )

  console.log(`[step 1] Extracted text: ${text}`)
  const summary = await DBOS.runStep(
    () => generateSummary(text),
    { name: "generateSummary" }
  )

  console.log(`[step 2] Generated summary: ${summary.substring(0, 500)}...`)
  await DBOS.runStep(
    () => saveResult(documentId, text, summary),
    { name: "saveResult" }
  )
}

// REGISTER WORKFLOW
export const processDocument =
  DBOS.registerWorkflow(processDocumentWorkflow)

