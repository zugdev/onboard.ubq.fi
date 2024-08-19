import type { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: ["build/index.ts"],
  project: ["src/**/*.ts"],
  ignore: ["src/types/config.ts"],
  ignoreExportsUsedInFile: true,
  ignoreDependencies: [
    "libsodium-wrappers",
    "eslint-config-prettier",
    "eslint-plugin-prettier",
    "@octokit/core",
    "@octokit/plugin-create-or-update-text-file",
    "@octokit/rest",
    "@types/libsodium-wrappers",
    "@uniswap/permit2-sdk",
    "ethers",
    "yaml",
    "@supabase/supabase-js",
    "@ubiquibot/configuration",
  ],
};

export default config;
