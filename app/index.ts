import { DBOS } from "@dbos-inc/dbos-sdk"

let launched = false
export async function initDBOS() {
  console.log("Initializing DBOS...")
  DBOS.setConfig({
    name: "document-management",
    // systemDatabaseUrl: process.env.DBOS_SYSTEM_DATABASE_URL!,
    systemDatabaseUrl: "postgresql://postgres:12345678@localhost:5432/dbos_system"
  })
  console.log("Launching DBOS...")
  DBOS.launch()
  launched = true

  console.log("✅ DBOS launched")
}


