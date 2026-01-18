import { DBOS } from "@dbos-inc/dbos-sdk"

export async function initDBOS() {
  DBOS.setConfig({
    name: "document-management",
    systemDatabaseUrl: process.env.DBOS_SYSTEM_DATABASE_URL!,
  })

  await DBOS.launch()
}

