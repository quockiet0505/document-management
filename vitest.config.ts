import { defineConfig } from 'vitest/config'
import  path  from 'path'

export default defineConfig({
     resolve: {
          alias: {
            //  MODULE ENCORE
            "encore.dev/api": path.resolve(__dirname, "test/mocks/encore-api.ts"),
          },
     },

     test:{
          globals: true,
          environment: "node",
          setupFiles: ["./test/setup.ts"],
          mockReset: true,
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