import { defineConfig } from 'vitest/config'

export default defineConfig({

     test:{
          globals: true,
          environment: "node",
          setupFiles: ["./test/helpers.ts"],
          include: ["test/**/*.test.ts"],
          coverage: {
               provider: "v8",
               reporter: ["text", "json", "html"],
               include: ["app/**/*.ts"],
               exclude: [
                    "node_modules/",
                    "test/",
                    "drizzle/",
                    "docker/",
                    "**/*.api.ts",
                    "**/main.ts"
               ],
          }
     }
})