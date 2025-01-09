import { createAppKit } from "@reown/appkit";
import { Ethers5Adapter } from "@reown/appkit-adapter-ethers5";
import { anvil, gnosis, mainnet, polygon, optimism, arbitrum, base, bsc, blast, zksync, avalanche, worldchain, AppKitNetwork } from "@reown/appkit/networks";
import { ethers } from "ethers";
import { renderErrorInModal } from "./display-popup-modal";
import { updateTokenDropdown } from "./populate-dropdown";
import { isApprovalButtonsValid, setupApproveButton, setupRevokeButton, setupButtonValidityListener } from "./handle-approval";

// all unhandled errors are caught and displayed in a modal
window.addEventListener("error", (event: ErrorEvent) => renderErrorInModal(event.error));
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
export const providersUrl: { [key: string]: string } = {
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

export const explorersUrl: { [key: string]: string } = {
  100: "https://gnosisscan.io",
  1: "https://etherscan.io",
  137: "https://polygonscan.com",
  10: "https://optimistic.etherscan.io",
  42161: "https://arbiscan.io",
  8453: "https://basescan.org",
  56: "https://bscscan.com",
  81457: "https://blastscan.io",
  324: "https://explorer.zksync.io",
  43114: "https://snowtrace.io",
  480: "https://explorer.worldchain.network",
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

export let provider: ethers.providers.JsonRpcProvider | undefined;
export let userSigner: ethers.Signer | undefined;
let web3Provider: ethers.providers.Web3Provider | undefined;

async function initializeProviderAndSigner() {
  const networkId = appState.getChainId();
  if (networkId && providersUrl[networkId]) {
    // read-only provider for fetching
    provider = new ethers.providers.JsonRpcProvider(providersUrl[networkId]);
  } else {
    console.error("No provider URL found for the current network ID");
    provider = undefined;
  }

  // if user is connected, set up the signer using the injected provider (window.ethereum)
  if (appState.getIsConnectedState() && window.ethereum) {
    const ethereum = window.ethereum as ethers.providers.ExternalProvider;
    if (ethereum.request) {
      await ethereum.request({ method: "eth_requestAccounts" });
    }

    // Create a Web3Provider from window.ethereum
    web3Provider = new ethers.providers.Web3Provider(window.ethereum);

    // web3Provider signer will handle transaction signing
    userSigner = web3Provider.getSigner(appState.getAddress());

    console.log("User address:", await userSigner.getAddress());
  } else {
    userSigner = undefined;
  }

  // update UI elements that depend on connection state
  await isApprovalButtonsValid();
  updateTokenDropdown();
}

function handleNetworkSwitch() {
  // network change listener
  appState.subscribeCaipNetworkChange(async (newState?: { id: string | number; name: string }) => {
    if (newState) {
      await initializeProviderAndSigner();
      console.log(`Network switched to ${newState.name} (${newState.id})`);
    }
  });

  // wallet connection listener
  appState.subscribeWalletInfo(async () => {
    await initializeProviderAndSigner();
  });
}

export async function mainModule() {
  try {
    await setupButtonValidityListener();
    updateTokenDropdown();
    setupApproveButton();
    setupRevokeButton();
    handleNetworkSwitch();

    // initialize for the first time
    await initializeProviderAndSigner();
  } catch (error) {
    console.error("Error in main:", error);
    renderErrorInModal(error as Error);
  }
}

mainModule().catch((error) => {
  console.error("Unhandled error:", error);
});
