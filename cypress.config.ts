import { defineConfig } from "cypress";
import path from "node:path";
import AdmZip from "adm-zip";

export default defineConfig({
  e2e: {
    setupNodeEvents(on) {
      on("before:browser:launch", (browser, launchOptions) => {
        // absolute path to the unpacked extension's folder
        // NOTE: extensions cannot be loaded in headless Chrome
        const extensionPath = path.resolve(__dirname, "./cypress/fixtures");
        const unzippedPath = `${extensionPath}/metamask`;
        const zip = new AdmZip(`${extensionPath}/metamask-chrome.zip`);
        zip.extractAllTo(unzippedPath);
        launchOptions.extensions.push(unzippedPath);

        return launchOptions;
      });
    },
    experimentalStudio: true,
    baseUrl: "http://localhost:8080",
    watchForFileChanges: false,
  },
});
