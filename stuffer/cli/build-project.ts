import AdmZip from "adm-zip"
import configJSON from "../../stuffer.config.json"
import enquirer from "enquirer"
import { spawn } from "bun"
import { StufferConfig } from "../lib"

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const config = new StufferConfig(configJSON as any)

const questions = [
  {
    type: "select",
    name: "urlName",
    message: "URL Name:",
    choices: Object.keys(config.urls),
  },
]

spawn(["bun", "run", "build"])
  .exited.then(() => {
    console.log("Build finished, now creating the zip...")

    return enquirer.prompt(questions) as unknown as { urlName: string }
  })
  .then(({ urlName }) => {
    const zipName = `./${config.versionString}-${urlName}.zip`
    const zip = new AdmZip()
    zip.addLocalFolder("./dist")
    return zip.writeZipPromise(zipName)
  })
  .then(() => console.log("Successfully created the zip..."))
  .catch(error => console.error("An error occurred:", error))
