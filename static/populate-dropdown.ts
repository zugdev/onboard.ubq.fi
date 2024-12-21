import { appState } from "./main";

const tokensByNetwork: { [key: number]: { [token: string]: string } } = {
  1: {
    UUSD: "0x0f644658510c95cb46955e55d7ba9dda9e9fbec6",
  },
  100: {
    UUSD: "0xc6ed4f520f6a4e4dc27273509239b7f8a68d2068",
  },
};

const tokenSelector = document.querySelector(".token-selector") as HTMLInputElement;
const tokenOptions = document.querySelector("#token-options") as HTMLSelectElement;

export function updateTokens() {
  const networkId = Number(appState.getCaipNetworkId());

  let tokens = {};

  tokens = tokensByNetwork[networkId] || {};

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
