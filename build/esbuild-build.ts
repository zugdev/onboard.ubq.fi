import { config } from "dotenv";
import esbuild, { BuildOptions } from "esbuild";
config();

const ENTRY_POINTS = {
  typescript: ["static/main.ts"],
  // css: ["static/style.css"],
};

const DATA_URL_LOADERS = [".png", ".woff", ".woff2", ".eot", ".ttf", ".svg"];

export const esbuildOptions: BuildOptions = {
  sourcemap: true,
  entryPoints: [...ENTRY_POINTS.typescript /* ...ENTRY_POINTS.css */],
  bundle: true,
  minify: false,
  loader: Object.fromEntries(DATA_URL_LOADERS.map((ext) => [ext, "dataurl"])),
  outdir: "static/dist",
  define: createEnvDefines(["ALCHEMY_KEY"], {
    ALCHEMY_KEY: process.env.ALCHEMY_KEY
  })
};

async function runBuild() {
  try {
    await esbuild.build(esbuildOptions);
    console.log("\tesbuild complete");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

void runBuild();

function createEnvDefines(environmentVariables: string[], generatedAtBuild: Record<string, unknown>): Record<string, string> {
  const defines: Record<string, string> = {};
  for (const name of environmentVariables) {
    const envVar = process.env[name];
    if (envVar !== undefined) {
      defines[name] = JSON.stringify(envVar);
    } else {
      throw new Error(`Missing environment variable: ${name}`);
    }
  }
  for (const key in generatedAtBuild) {
    if (Object.prototype.hasOwnProperty.call(generatedAtBuild, key)) {
      defines[key] = JSON.stringify(generatedAtBuild[key]);
    }
  }
  return defines;
}
