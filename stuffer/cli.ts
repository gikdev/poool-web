import { Command } from "commander"
import { BuildService } from "./BuildService"
import { ConfigService } from "./ConfigService"
import { UserInterface } from "./UserInterface"

export async function cli() {
  const program = new Command()
    .name("stuffer")
    .description("Build and deployment tool")
    .version("v1.0.1")

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

  // Package manager command
  program
    .command("pm")
    .description("Change package manager")
    .action(async () => {
      const config = await ConfigService.load()
      const manager = await UserInterface.selectPackageManager()
      await config.setPackageManager(manager)
      console.log(`📦 Package manager set to: ${manager}`)
    })

  // Build command
  program
    .command("build")
    .description("Build and package application")
    .action(async () => {
      const config = await ConfigService.load()
      const buildService = new BuildService(config.getPackageManager())
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
      const buildService = new BuildService(config.getPackageManager())
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
