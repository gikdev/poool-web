import { existsSync } from "node:fs"
import AdmZip from "adm-zip"
import { file, write } from "bun"
import { spawn } from "bun"
import { Command } from "commander"
import enquirer from "enquirer"
import packageJSON from "./package.json"

// ========== Types ==========
type VersionIncrementLevel = "major" | "minor" | "patch" | "stuff" | "none"
type ReleaseType = "alpha" | "beta" | "rc" | "stable" | ""

interface AppConfig {
  version: {
    major: number
    minor: number
    patch: number
    stuff: number
    mode?: ReleaseType
  }
  urls: Record<string, string>
  currentUrlName: string
}

// ========== Core Classes ==========
class AppVersion {
  constructor(
    public major: number,
    public minor: number,
    public patch: number,
    public stuff: number,
    public releaseType: ReleaseType = "",
  ) {}

  increment(level: VersionIncrementLevel): this {
    if (level !== "none") this[level] += 1
    return this
  }

  toString(): string {
    const versionCore = `v${this.major}.${this.minor}.${this.patch}.${this.stuff}`
    return this.releaseType ? `${versionCore}-${this.releaseType}` : versionCore
  }
}

class DeploymentManager {
  constructor(
    private readonly urls: Record<string, string>,
    private activeTarget: string,
  ) {
    if (!(activeTarget in urls)) {
      throw new Error(`Initial target '${activeTarget}' not found in URLs`)
    }
  }

  setTarget(target: string): void {
    if (!(target in this.urls)) {
      throw new Error(`Target '${target}' not found`)
    }
    this.activeTarget = target
  }

  get currentTarget(): string {
    return this.activeTarget
  }

  get currentUrl(): string {
    return this.urls[this.activeTarget]
  }

  get availableTargets(): string[] {
    return Object.keys(this.urls)
  }
}

// ========== Services ==========
class ConfigService {
  private static readonly CONFIG_PATH = "./stuffer.config.json"

  constructor(
    private version: AppVersion,
    private deployment: DeploymentManager,
  ) {}

  static async init(): Promise<void> {
    if (await ConfigService.configExists()) {
      console.log("Configuration already exists")
      return
    }

    const defaultConfig: AppConfig = {
      version: { major: 0, minor: 0, patch: 0, stuff: 0 },
      urls: {
        production: "https://api.example.com",
        staging: "https://staging.example.com",
      },
      currentUrlName: "staging",
    }

    await write(ConfigService.CONFIG_PATH, JSON.stringify(defaultConfig, null, 2))
    console.log("✅ Created default configuration file")
  }

  static async configExists(): Promise<boolean> {
    return existsSync(ConfigService.CONFIG_PATH)
  }

  static async load(): Promise<ConfigService> {
    if (!(await ConfigService.configExists())) {
      throw new Error("Config file not found. Run 'stuffer init' first.")
    }

    const configFile = file(ConfigService.CONFIG_PATH)
    const config: AppConfig = await configFile.json()

    const version = new AppVersion(
      config.version.major,
      config.version.minor,
      config.version.patch,
      config.version.stuff,
      config.version.mode,
    )
    const deployment = new DeploymentManager(config.urls, config.currentUrlName)
    return new ConfigService(version, deployment)
  }

  async save(): Promise<void> {
    const config: AppConfig = {
      version: {
        major: this.version.major,
        minor: this.version.minor,
        patch: this.version.patch,
        stuff: this.version.stuff,
        mode: this.version.releaseType,
      },
      urls: this.deployment.availableTargets.reduce(
        (acc, target) => {
          acc[target] = this.deployment.currentUrl
          return acc
        },
        {} as Record<string, string>,
      ),
      currentUrlName: this.deployment.currentTarget,
    }

    await write(ConfigService.CONFIG_PATH, JSON.stringify(config, null, 2))
  }

  get currentVersion(): AppVersion {
    return this.version
  }

  updateVersion(increment: VersionIncrementLevel): AppVersion {
    this.version.increment(increment)
    return this.version
  }

  get deploymentManager(): DeploymentManager {
    return this.deployment
  }
}

class BuildService {
  constructor(private readonly appName: string) {}

  async execute(): Promise<void> {
    console.log("🏗️ Building application...")
    await spawn(["bun", "run", "build"]).exited
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
}

class UserInterface {
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
}

// ========== CLI Setup ==========
async function main() {
  const program = new Command()
    .name("stuffer")
    .description("Build and deployment tool")
    .version(packageJSON.version)

  // Version command
  program
    .command("v")
    .description("Update version")
    .action(async () => {
      const config = await ConfigService.load()
      const increment = await UserInterface.selectVersionIncrement()
      config.updateVersion(increment)
      await config.save()
      console.log(`🆕 New version: ${config.currentVersion.toString()}`)
    })

  // URL command
  program
    .command("url")
    .description("Change deployment target")
    .action(async () => {
      const config = await ConfigService.load()
      const target = await UserInterface.selectDeploymentTarget(
        config.deploymentManager.availableTargets,
      )
      config.deploymentManager.setTarget(target)
      await config.save()
      console.log(`🌍 Deployment target set to: ${target}`)
    })

  // Build command
  program
    .command("build")
    .description("Build and package application")
    .action(async () => {
      const config = await ConfigService.load()
      const buildService = new BuildService(packageJSON.name)
      await buildService.execute()
      await buildService.createZip(
        config.currentVersion.toString(),
        config.deploymentManager.currentTarget,
      )
    })

  // Combined command
  program
    .command("vub")
    .description("Version update → URL selection → Build")
    .action(async () => {
      const config = await ConfigService.load()

      // Version update
      const versionIncrement = await UserInterface.selectVersionIncrement()
      config.updateVersion(versionIncrement)

      // URL selection
      const target = await UserInterface.selectDeploymentTarget(
        config.deploymentManager.availableTargets,
      )
      config.deploymentManager.setTarget(target)

      await config.save()
      console.log(`⚡ Updated to ${config.currentVersion.toString()} for ${target}`)

      // Build
      const buildService = new BuildService(packageJSON.name)
      await buildService.execute()
      await buildService.createZip(
        config.currentVersion.toString(),
        config.deploymentManager.currentTarget,
      )
    })

  // Init command
  program
    .command("init")
    .description("Create a default config file")
    .action(async () => {
      await ConfigService.init()
    })

  await program.parseAsync(process.argv)
}

main().catch(err => {
  console.error("❌ Error:", err.message)
  process.exit(1)
})
