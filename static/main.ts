import { AppKit, createAppKit } from "@reown/appkit";
import { Ethers5Adapter } from "@reown/appkit-adapter-ethers5";
import { anvil, gnosis, mainnet, polygon, optimism, arbitrum, base, bsc, blast, zksync, avalanche, worldchain, AppKitNetwork } from "@reown/appkit/networks";
import { ethers } from "ethers";
import { renderErrorInModal } from "./display-popup-modal";
import { updateTokens } from "./populate-dropdown";
import { setupApproveButton, setupRevokeButton, setupValidityListener } from "./handle-approval";

// passed in at runtime
declare const ALCHEMY_KEY: string;

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

const alchemyKey = ALCHEMY_KEY || "";

const providersUrl: { [key: string]: string } = {
  31337: `http://localhost:8545`,
  100: alchemyKey ? `https://gnosis-mainnet.g.alchemy.com/v2/${alchemyKey}` : "https://rpc.gnosischain.com",
  1: alchemyKey ? `https://eth-mainnet.alchemyapi.io/v2/${alchemyKey}` : "https://eth.llamarpc.com",
  137: alchemyKey ? `https://polygon-mainnet.g.alchemy.com/v2/${alchemyKey}` : "https://polygon.llamarpc.com",
  10: alchemyKey ? `https://opt-mainnet.g.alchemy.com/v2/${alchemyKey}` : "https://optimism.llamarpc.com",
  42161: alchemyKey ? `https://arb-mainnet.g.alchemy.com/v2/${alchemyKey}` : "https://arbitrum.llamarpc.com",
  8453: alchemyKey ? `https://base-mainnet.g.alchemy.com/v2/${alchemyKey}` : "https://base.llamarpc.com",
  56: alchemyKey ? `https://bnb-mainnet.g.alchemy.com/v2/${alchemyKey}` : "https://binance.llamarpc.com",
  81457: alchemyKey ? `https://blast-mainnet.g.alchemy.com/v2/${alchemyKey}` : "https://blast.drpc.org",
  324: alchemyKey ? `https://zksync-mainnet.g.alchemy.com/v2/${alchemyKey}` : "https://mainnet.era.zksync.io",
  43114: alchemyKey ? `https://avax-mainnet.g.alchemy.com/v2/${alchemyKey}` : "https://rpc.ankr.com/avalanche",
  480: alchemyKey ? `https://worldchain-mainnet.g.alchemy.com/v2/${alchemyKey}` : "https://rpc.worldchain.network",
};

let networks: [AppKitNetwork, ...AppKitNetwork[]];
if (window.location.hostname === "localhost" || window.location.hostname === "0.0.0.0") {
  console.log("enabling anvil");
  networks = [anvil, gnosis, mainnet, polygon, optimism, arbitrum, base, bsc, blast, zksync, avalanche, worldchain];
} else {
  networks = [gnosis, mainnet, polygon, optimism, arbitrum, base, bsc, blast, zksync, avalanche, worldchain];
}

export const appState = createAppKit({
  adapters: [new Ethers5Adapter()],
  networks,
  defaultNetwork: gnosis,
  metadata,
  projectId,
  features: {
    analytics: true,
  },
});

// get network
function getNetwork(): string {
  const network = appState.getCaipNetwork();
  return network ? network.id.toString() : "";
}

// create provider & signer for gnosis
export let provider = new ethers.providers.JsonRpcProvider(providersUrl[getNetwork()]);
export let userSigner: ethers.Signer;

async function waitForConnection() {
  return new Promise<void>((resolve) => {
    const interval = setInterval(() => {
      if (appState.getIsConnectedState()) {
        userSigner = provider.getSigner(appState.getAddress());
        console.log(`user connected: ${appState.getAddress()}`);
        clearInterval(interval);
        resolve();
      } else {
        console.log("waiting for user to connect...");
      }
    }, 1000);
  });
}

function handleNetworkSwitch() {
  appState.subscribeCaipNetworkChange(async (newNetwork: { id: string; name: string }) => {
    switchProvider(newNetwork?.id);
    updateTokens(); // update known tokens on the dropdown
    setupApproveButton(); // setup approve button
    setupRevokeButton(); // setup revoke button
  });
}

function switchProvider(network: string) {
  const url = providersUrl[network];
  if (url) {
    provider = new ethers.providers.JsonRpcProvider(url);
    userSigner = provider.getSigner(appState.getAddress());
    console.log(`switched provider to ${network}`);
  } else {
    console.error(`No URL found for network: ${network}`);
  }
}

export async function mainModule() {
  try {
    setupValidityListener(); // setup amount and token validity listeners
    updateTokens(); // update known tokens on the dropdown
    setupApproveButton(); // setup approve button
    setupRevokeButton(); // setup revoke button
    void waitForConnection();
    handleNetworkSwitch();
  } catch (error) {
    console.error("Error in main:", error);
  }
}

mainModule().catch((error) => {
  console.error("Unhandled error:", error);
});
