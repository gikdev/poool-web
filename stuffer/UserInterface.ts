import enquirer from "enquirer"
import type { PackageManager, VersionIncrementLevel } from "./types"

export class UserInterface {
  static async selectVersionIncrement(): Promise<VersionIncrementLevel> {
    const { level } = await enquirer.prompt<{ level: VersionIncrementLevel }>({
      type: "select",
      name: "level",
      message: "Select version increment:",
      choices: ["major", "minor", "patch", "stuff", "none"],
    })
    return level
  }

  static async selectDeploymentTarget(targets: string[]): Promise<string> {
    const { target } = await enquirer.prompt<{ target: string }>({
      type: "select",
      name: "target",
      message: "Select deployment target:",
      choices: targets,
    })
    return target
  }

  static async selectPackageManager(): Promise<PackageManager> {
    const { manager } = await enquirer.prompt<{ manager: PackageManager }>({
      type: "select",
      name: "manager",
      message: "Select package manager:",
      choices: ["npm", "bun"],
    })
    return manager
  }
}
