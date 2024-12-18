import { gnosis, mainnet } from "@reown/appkit/networks";
import { appState } from "./main";

const gnosisTokens = {
  UUSD: "0xc6ed4f520f6a4e4dc27273509239b7f8a68d2068",
};

const mainnetTokens = {
  UUSD: "0x4DA97a8b831C345dBe6d16FF7432DF2b7b776d98",
};

const tokenSelector = document.querySelector(".token-selector") as HTMLInputElement;
const tokenOptions = document.querySelector("#token-options") as HTMLSelectElement;

export function updateTokens() {
  const networkId = appState.getCaipNetworkId();
  let tokens = {};
  if (networkId === gnosis.id) {
    tokens = gnosisTokens;
  } else if (networkId === mainnet.id) {
    tokens = mainnetTokens;
  }

  if (tokenSelector && tokenOptions) {
    tokenOptions.innerHTML = ""; // Clear existing options

    for (const [key, value] of Object.entries(tokens)) {
      const option = document.createElement("option");
      option.text = key;
      option.value = value as string;
      tokenOptions.appendChild(option);
    }
  }
}
