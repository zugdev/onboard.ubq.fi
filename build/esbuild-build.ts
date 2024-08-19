import { execSync } from "child_process";
import { config } from "dotenv";
import esbuild from "esbuild";

const typescriptEntries = ["static/scripts/onboarding/onboarding.ts"];
const cssEntries = ["static/styles/onboarding/onboarding.css"];
export const entries = [...typescriptEntries, ...cssEntries];

export const esBuildContext: esbuild.BuildOptions = {
  sourcemap: true,
  entryPoints: entries,
  bundle: true,
  minify: false,
  loader: {
    ".png": "dataurl",
    ".woff": "dataurl",
    ".woff2": "dataurl",
    ".eot": "dataurl",
    ".ttf": "dataurl",
    ".svg": "dataurl",
  },
  outdir: "static/out",
  define: createEnvDefines(["SUPABASE_URL", "SUPABASE_ANON_KEY", "FRONTEND_URL"], {
    commitHash: execSync(`git rev-parse --short HEAD`).toString().trim(),
  }),
};

esbuild
  .build(esBuildContext)
  .then(() => {
    console.log("\tesbuild complete");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

function createEnvDefines(environmentVariables: string[], generatedAtBuild: Record<string, unknown>): Record<string, string> {
  const defines: Record<string, string> = {};
  config();
  for (const name of environmentVariables) {
    const envVar = process.env[name];
    if (envVar !== undefined) {
      defines[name] = JSON.stringify(envVar);
    } else {
      throw new Error(`Missing environment variable: ${name}`);
    }
  }
  Object.keys(generatedAtBuild).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(generatedAtBuild, key)) {
      defines[key] = JSON.stringify(generatedAtBuild[key]);
    }
  });
  return defines;
}
