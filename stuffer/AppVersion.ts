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
    if (level !== "none") this[level] += 1
    return this
  }

  toString(): string {
    const versionCore = `v${this.major}.${this.minor}.${this.patch}.${this.stuff}`
    return this.releaseType ? `${versionCore}-${this.releaseType}` : versionCore
  }
}
