
import { vi, beforeAll, afterAll } from 'vitest'
import dotenv from 'dotenv'
import path from 'path'

// Load test environment
dotenv.config({ 
  path: path.resolve(process.cwd(), '.env.test'),
  override: true 
})


beforeAll(() => {
  process.env.NODE_ENV = 'test'
  process.env.ENCORE_RUNTIME_LIB = '/mock/path/encore-runtime.node'
  process.env.ENCORE_APP_ID = 'test-app'
  process.env.ENCORE_ENV = 'test'
})

afterAll(() => {
  vi.clearAllMocks()
  vi.resetAllMocks()
})