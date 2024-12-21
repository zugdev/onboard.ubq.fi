import { createAppKit } from "@reown/appkit";
import { Ethers5Adapter } from "@reown/appkit-adapter-ethers5";
import { gnosis, mainnet, polygon, optimism, arbitrum, base, bsc, blast, zksync, avalanche, worldchain } from "@reown/appkit/networks";
import { ethers } from "ethers";
import { renderErrorInModal } from "./display-popup-modal";
import { updateTokens } from "./populate-dropdown";
import { isApprovalValid, setupApproveButton, setupRevokeButton, setupValidityListener } from "./handle-approval";

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

const providersUrl: { [key: string]: string } = {
  100: "https://rpc.gnosischain.com",
  1: "https://eth.llamarpc.com",
  137: "https://polygon.llamarpc.com",
  10: "https://optimism.llamarpc.com",
  42161: "https://arbitrum.llamarpc.com",
  8453: "https://base.llamarpc.com",
  56: "https://binance.llamarpc.com",
  81457: "https://blast.drpc.org",
  324: "https://mainnet.era.zksync.io",
  43114: "https://rpc.ankr.com/avalanche",
  480: "https://rpc.worldchain.network",
};

export const appState = createAppKit({
  adapters: [new Ethers5Adapter()],
  networks: [gnosis, mainnet, polygon, optimism, arbitrum, base, bsc, blast, zksync, avalanche, worldchain],
  defaultNetwork: gnosis,
  metadata,
  projectId,
  features: {
    analytics: true,
  },
});

// create provider & signer for gnosis
const networkId = appState.getCaipNetwork()?.id;
export let provider = networkId ? new ethers.providers.JsonRpcProvider(providersUrl[networkId]) : undefined;
export let userSigner: ethers.Signer;

async function waitForConnection() {
  return new Promise<void>((resolve) => {
    const interval = setInterval(() => {
      if (appState.getIsConnectedState()) {
        if (provider) {
          userSigner = provider.getSigner(appState.getAddress());
        } else {
          console.error("Provider is undefined");
        }
        setupApproveButton();
        setupRevokeButton();
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
  // get network changes
  appState.subscribeCaipNetworkChange(async (newState?: { id: string | number; name: string }) => {
    if (newState) {
      switchProvider(newState.id.toString());
      setupApproveButton(); // update approve button
      setupRevokeButton(); // update revoke button
      updateTokens(); // update known tokens on the dropdown
    } else {
      console.error("New state is undefined");
    }
  });

  // get connected/disconnected
  appState.subscribeWalletInfo(async () => {
    isApprovalValid();
  });
}

function switchProvider(network: string) {
  const url = providersUrl[network];
  if (url) {
    provider = new ethers.providers.JsonRpcProvider(url);
    userSigner = provider.getSigner(appState.getAddress());
    console.log(`switched provider to ${provider.connection.url}`);
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
