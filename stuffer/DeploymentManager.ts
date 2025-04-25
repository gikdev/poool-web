export class DeploymentManager {
  constructor(
    public readonly urls: Record<string, string>,
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
