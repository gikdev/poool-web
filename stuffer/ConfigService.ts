import fs from "node:fs"
import type { AppConfig } from "./AppConfig"
import { AppVersion } from "./AppVersion"
import { DeploymentManager } from "./DeploymentManager"
import type { PackageManager, VersionIncrementLevel } from "./types"

export class ConfigService {
  private static readonly CONFIG_PATH = "./stuffer.config.json"
  private packageManager: PackageManager = "npm"

  constructor(
    private version: AppVersion,
    private deployment: DeploymentManager,
    packageManager?: PackageManager,
  ) {
    if (packageManager) {
      this.packageManager = packageManager
    }
  }

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
      packageManager: "npm",
    }

    await fs.promises.writeFile(ConfigService.CONFIG_PATH, JSON.stringify(defaultConfig, null, 2))
    console.log("✅ Created default configuration file")
  }

  static async configExists(): Promise<boolean> {
    return fs.existsSync(ConfigService.CONFIG_PATH)
  }

  static async load(): Promise<ConfigService> {
    if (!(await ConfigService.configExists())) {
      throw new Error("Config file not found. Run 'stuffer init' first.")
    }

    const configData = await fs.promises.readFile(ConfigService.CONFIG_PATH, "utf-8")
    const config: AppConfig = JSON.parse(configData)

    const version = new AppVersion(
      config.version.major,
      config.version.minor,
      config.version.patch,
      config.version.stuff,
      config.version.mode,
    )
    const deployment = new DeploymentManager(config.urls, config.currentUrlName)
    return new ConfigService(version, deployment, config.packageManager)
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
      urls: { ...this.deployment.urls },
      currentUrlName: this.deployment.currentTarget,
      packageManager: this.packageManager,
    }

    await fs.promises.writeFile(ConfigService.CONFIG_PATH, JSON.stringify(config, null, 2))
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

  getPackageManager(): PackageManager {
    return this.packageManager
  }

  async setPackageManager(manager: PackageManager): Promise<void> {
    this.packageManager = manager
    await this.save()
  }
}
