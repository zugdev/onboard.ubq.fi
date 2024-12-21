import { erc20Abi } from "./abis";
import { renderErrorInModal } from "./display-popup-modal";
import { appState, provider, userSigner } from "./main";
import { getPermit2Address } from "./permit2-addresses";
import { ethers } from "ethers";

const amountInput = document.querySelector(".amount-selector") as HTMLInputElement;
const addressInput = document.querySelector(".token-selector") as HTMLInputElement;
const currentAllowanceAmount = document.querySelector(".current-allowance-amount") as HTMLSpanElement;
const approveButton = document.querySelector(".approve-button") as HTMLButtonElement;
const revokeButton = document.querySelector(".revoke-button") as HTMLButtonElement;

function isValidAddress(): boolean {
  const isValid = /^0x[a-fA-F0-9]{40}$/.test(addressInput.value);

  if (isValid) {
    addressInput.style.border = "1px solid #5af55a";
  } else if (addressInput.value === "") {
    addressInput.style.border = "1px solid rgba(255, 255, 255, 0.1)";
  } else {
    addressInput.style.border = "1px solid red";
  }

  return isValid;
}

function isValidAmount(): boolean {
  const isValid = !isNaN(Number(amountInput.value)) && Number(amountInput.value) > 0;

  if (isValid) {
    amountInput.style.border = "1px solid #5af55a";
  } else if (amountInput.value === "") {
    amountInput.style.border = "1px solid rgba(255, 255, 255, 0.1)";
  } else {
    amountInput.style.border = "1px solid red";
  }

  return isValid;
}

export function isApprovalValid() {
  const isConnected = appState.getIsConnectedState();
  const isAddressValid = isValidAddress();
  const isAmountValid = isValidAmount();

  approveButton.disabled = !(isConnected && isAddressValid && isAmountValid);
  revokeButton.disabled = !(isConnected && isAddressValid);

  if (isAmountValid && isAddressValid && isConnected) {
    void getCurrentAllowance();
  }
}

async function getCurrentAllowance() {
  if (!provider) {
    console.error("Provider is not initialized");
    return;
  }

  const tokenAddress = addressInput.value;
  const permit2Address = getPermit2Address(appState.getCaipNetworkId() as number);
  const userAddress = appState.getAddress();
  const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);

  try {
    const symbol = await tokenContract.symbol();
    const decimals = await tokenContract.decimals();
    const allowance = await tokenContract.allowance(userAddress, permit2Address);
    const formattedAllowance = ethers.utils.formatUnits(allowance, decimals);
    currentAllowanceAmount.textContent = formattedAllowance + " " + symbol;
    return allowance;
  } catch (error) {
    console.error("Error fetching allowance:", error);
    renderErrorInModal(error as Error);
  }
}

export function setupApproveButton() {
  approveButton.removeEventListener("click", onApproveClick); // ensure no duplicate listeners
  approveButton.addEventListener("click", onApproveClick);
}

async function onApproveClick() {
  if (!userSigner) {
    console.error("No signer available. Cannot send transaction.");
    return;
  }

  try {
    const tokenAddress = addressInput.value;
    const permit2Address = getPermit2Address(appState.getCaipNetworkId() as number);
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, userSigner);
    const decimals = await tokenContract.decimals();
    const amount = ethers.utils.parseUnits(amountInput.value, decimals);
    const tx = await tokenContract.approve(permit2Address, amount);
    await tx.wait();
    await getCurrentAllowance();
  } catch (error) {
    console.error("Error approving allowance:", error);
    renderErrorInModal(error as Error);
  }
}

export function setupRevokeButton() {
  revokeButton.removeEventListener("click", onRevokeClick); // ensure no duplicate listeners
  revokeButton.addEventListener("click", onRevokeClick);
}

async function onRevokeClick() {
  if (!userSigner) {
    console.error("No signer available. Cannot send transaction.");
    return;
  }

  try {
    const tokenAddress = addressInput.value;
    const permit2Address = getPermit2Address(appState.getCaipNetworkId() as number);
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, userSigner);
    const tx = await tokenContract.approve(permit2Address, 0);
    await tx.wait();
    await getCurrentAllowance();
  } catch (error) {
    console.error("Error revoking allowance:", error);
    renderErrorInModal(error as Error);
  }
}

export function setupValidityListener() {
  amountInput.addEventListener("change", isApprovalValid);
  addressInput.addEventListener("change", isApprovalValid);
}
