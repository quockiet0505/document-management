import { DBOS } from "@dbos-inc/dbos-sdk"
import { DocumentsRepo } from "../documents/documents.repo"
import { SummaryService } from "../ai/summary.service"


// STEP FUNCTIONS 
// read file dox
import mammoth from "mammoth"
import { getStorage } from "../storage"
import { downloadFileAsUint8Array } from "../external/file.helper"

// read pdf
import { PDFParse } from 'pdf-parse'

// extract text from document
async function extractText(docId: string) {
  const doc = await DocumentsRepo.getDocumentById(docId)
  if (!doc) throw new Error("Document not found")

  const { downloadUrl } = await getStorage().getDownloadUrl({
    storageKey: doc.storageKey,
  })

  const buffer = await downloadFileAsUint8Array(downloadUrl)

  switch (doc.mimeType) {
    case "application/pdf": {
      const data = new PDFParse(buffer)
      const result = await data.getText();
	    console.log(result.text);

      return result.text
    }

    // read docx
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      const nodeBuffer = Buffer.from(buffer)
      const result = await mammoth.extractRawText({ buffer: nodeBuffer })
      return result.value
    }

    // read doc
    case "text/plain": {
      return new TextDecoder("utf-8").decode(buffer)
    }

    default:
      throw new Error(`Unsupported mime type: ${doc.mimeType}`)

  }
}

// generate summary from text
async function generateSummary(text: string) {
  console.log(`[generateSummary] Generating summary`)
  return SummaryService.generate(text)
}

// save result to database
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

// truncate text to max length
function truncateText(text: string, max = 1500) {
  return text.length > max ? text.slice(0, max) : text
}


// WORKFLOW FUNCTION
async function processDocumentWorkflow(documentId: string) {
  console.log(`[processDocumentWorkflow] Processing document: ${documentId}`)
  const text = await DBOS.runStep(
    () => extractText(documentId),
    { name: "extractText" }
  )

  const truncatedText = truncateText(text)

  console.log(`[step 1] Extracted text: ${text}`)
  const summary = await DBOS.runStep(
    () => generateSummary(truncatedText),
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

