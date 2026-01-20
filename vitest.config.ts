import { defineConfig } from 'vitest/config'

export default defineConfig({
     test:{
          globals: true,
          environment: "node",
          clearMocks: true,
          restoreMocks: true,
          coverage: {
               provider: "v8",
               reporter: ["text", "json", "html"],
               include: ["app/**/*.ts"],
               exclude: [
                    "**/*.api.ts",      
                    "**/*.schema.ts",
                    "**/index.ts",
               ],
          }
     }
})