import { createAppKit } from "@reown/appkit";
import { Ethers5Adapter } from "@reown/appkit-adapter-ethers5";
import { gnosis, mainnet, polygon, optimism, arbitrum, base, bsc, blast, zksync, avalanche, celo, worldchain, zora } from "@reown/appkit/networks";
import { ethers } from "ethers";
import { renderErrorInModal } from "./display-popup-modal";

// All unhandled errors are caught and displayed in a modal
window.addEventListener("error", (event: ErrorEvent) => renderErrorInModal(event.error));

// All unhandled promise rejections are caught and displayed in a modal
window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
  renderErrorInModal(event.reason as Error);
  event.preventDefault();
});

const projectId = "415760038f8e330de4868120be3205b8";

const metadata = {
  name: "Ubiquity Allowance",
  description: "Allow funding in Ubiquity",
  url: "https://onboard.ubq.fi",
  icons: ["https://avatars.githubusercontent.com/u/76412717"],
};

// create provider & signer for Ethereum mainnet
export const provider = new ethers.providers.JsonRpcProvider("https://eth.llamarpc.com");
export let userSigner: ethers.Signer;

export const appState = createAppKit({
  adapters: [new Ethers5Adapter()],
  networks: [gnosis, mainnet, polygon, optimism, arbitrum, base, bsc, blast, zksync, avalanche, celo, worldchain, zora],
  defaultNetwork: gnosis,
  metadata,
  projectId,
  features: {
    analytics: true,
  },
});

async function waitForConnection() {
  return new Promise<void>((resolve) => {
    const interval = setInterval(() => {
      if (appState.getIsConnectedState()) {
        userSigner = provider.getSigner(appState.getAddress());
        console.log(`User connected: ${appState.getAddress()}`);
        clearInterval(interval);
        resolve();
      } else {
        console.log("Waiting for user to connect...");
      }
    }, 1000);
  });
}

export async function mainModule() {
  try {
    console.log("Provider:", provider);

    console.log("Waiting for user connection...");
    void waitForConnection();
  } catch (error) {
    console.error("Error in main:", error);
  }
}

mainModule().catch((error) => {
  console.error("Unhandled error:", error);
});
