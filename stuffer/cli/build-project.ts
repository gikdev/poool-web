import AdmZip from "adm-zip"
import { spawn } from "bun"
import enquirer from "enquirer"
import configJSON from "../../stuffer.config.json"
import { StufferConfig, type StufferConfigCtorProps, type Version } from "../lib"
import packageJSON from "../../package.json"

const appName = packageJSON.name
const config = new StufferConfig(configJSON as StufferConfigCtorProps)
const configFile = Bun.file("./stuffer.config.json")

type VersionChange = "major" | "minor" | "patch" | "stuff" | "none"
type UrlChange = keyof typeof config.urls

function writeNewConfig(newConfig: StufferConfig | StufferConfigCtorProps) {
  return Bun.write(configFile, JSON.stringify(newConfig, null, 2))
}

function changeConfig({
  urlChange,
  versionChange,
}: { versionChange?: VersionChange; urlChange?: UrlChange }) {
  const newConfig: StufferConfigCtorProps = structuredClone(config)

  console.log(versionChange)

  switch (versionChange) {
    case "major":
      newConfig.version.major = newConfig.version.major + 1
      break
    case "minor":
      newConfig.version.minor = newConfig.version.minor + 1
      break
    case "patch":
      newConfig.version.patch = newConfig.version.patch + 1
      break
    case "stuff":
      newConfig.version.stuff = newConfig.version.stuff + 1
      break
    case "none":
      break
  }

  if (urlChange && urlChange in config.urls) {
    newConfig.currentUrlName = urlChange
  }

  return newConfig
}

function askVersion() {
  return enquirer.prompt({
    type: "select",
    name: "versionChange",
    message: "Change version:",
    choices: [
      "major", "minor", "patch", "stuff", "none"
    ],
  }) as unknown as Promise<{ versionChange: VersionChange }>
}

function runBuildCommand() {
  return spawn(["bun", "run", "build"]).exited
}

function askUrlName() {
  return enquirer.prompt({
    type: "select",
    name: "urlName",
    message: "URL Name:",
    choices: Object.keys(config.urls),
  }) as unknown as Promise<{ urlName: string }>
}

function makeTheZip(version: string, urlName: string) {
  const zipName = `./${appName}-${version}-${urlName}.zip`
  const zip = new AdmZip()
  zip.addLocalFolder("./dist")

  return zip.writeZipPromise(zipName)
}

async function main() {
  const versionChange = await askVersion()
  const urlChange = await askUrlName()
  const newConfig = changeConfig({
    urlChange: urlChange.urlName,
    versionChange: versionChange.versionChange,
  })
  await writeNewConfig(newConfig)
  await runBuildCommand()
  await makeTheZip(new StufferConfig(newConfig).versionString, urlChange.urlName)
  console.log("success!")
}

main()
