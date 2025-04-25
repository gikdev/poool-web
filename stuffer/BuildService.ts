import { spawn } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import AdmZip from "adm-zip"
import type { PackageManager } from "./types"

export class BuildService {
  private appName: string

  constructor(private readonly packageManager: PackageManager) {
    // Read package.json directly instead of importing
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8"),
    )
    this.appName = packageJson.name
  }

  async execute(): Promise<void> {
    console.log("🎈 Building application...")
    await this.runCommand(this.packageManager, ["run", "build"])
    console.log("✅ Build completed")
  }

  async createZip(version: string, target: string): Promise<void> {
    console.log(`📦 Creating deployment package (${target})...`)
    const zip = new AdmZip()
    zip.addLocalFolder("./dist")
    const zipName = `./${this.appName}-${version}-${target}.zip`
    await zip.writeZipPromise(zipName)
    console.log(`🎉 Package created: ${zipName}`)
  }

  private runCommand(command: string, args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: "inherit",
        shell: true, // Add shell: true for better cross-platform compatibility
      })
      child.on("close", code => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`Command failed with exit code ${code}`))
        }
      })
      child.on("error", err => {
        reject(err)
      })
    })
  }
}
