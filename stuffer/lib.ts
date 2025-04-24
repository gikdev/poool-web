interface Version {
  major: number
  minor: number
  patch: number
  stuff: number
  mode?: "alpha" | "beta" | "rc" | "stable" | ""
}

type Urls = Record<string, string>

interface StufferConfigCtorProps {
  urls: Urls
  currentUrlName: string
  version: Version
}

export class StufferConfig {
  urls: Urls
  version: Version
  currentUrlName: string

  constructor({ urls, version, currentUrlName }: StufferConfigCtorProps) {
    this.urls = urls
    this.version = version
    if (!(currentUrlName in urls)) throw new Error("currentUrlName is not in urls...")
    this.currentUrlName = currentUrlName
  }

  get versionString(): string {
    if (!this.version) return "v.nothing"
    const { major, minor, patch, stuff, mode } = this.version
    return `v${major}.${minor}.${patch}.${stuff}${mode ? `-${mode}` : ""}`
  }

  get currentUrl(): string {
    return this.urls[this.currentUrlName]
  }
}
