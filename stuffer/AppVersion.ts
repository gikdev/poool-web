import type { ReleaseType, VersionIncrementLevel } from "./types"

export class AppVersion {
  constructor(
    public major: number,
    public minor: number,
    public patch: number,
    public stuff: number,
    public releaseType: ReleaseType = "",
  ) {}

  increment(level: VersionIncrementLevel): this {
    switch (level) {
      case "major":
        this.major += 1
        this.minor = 0
        this.patch = 0
        this.stuff = 0
        break
      case "minor":
        this.minor += 1
        this.patch = 0
        this.stuff = 0
        break
      case "patch":
        this.patch += 1
        this.stuff = 0
        break
      case "stuff":
        this.stuff += 1
        break
    }  

    return this
  }

  toString(): string {
    const versionCore = `v${this.major}.${this.minor}.${this.patch}.${this.stuff}`
    return this.releaseType ? `${versionCore}-${this.releaseType}` : versionCore
  }
}
