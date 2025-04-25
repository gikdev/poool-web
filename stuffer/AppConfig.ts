import type { PackageManager, ReleaseType } from "./types"

export interface AppConfig {
  version: {
    major: number
    minor: number
    patch: number
    stuff: number
    mode?: ReleaseType
  }
  urls: Record<string, string>
  currentUrlName: string
  packageManager?: PackageManager
}
