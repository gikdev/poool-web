import { cli } from "./cli"

cli().catch(err => {
  console.error("❌ Error:", err.message)
  process.exit(1)
})
