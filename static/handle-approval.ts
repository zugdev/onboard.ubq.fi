import { erc20Abi } from "./abis";
import { renderErrorInModal, renderSuccessModal } from "./display-popup-modal";
import { appState, provider, userSigner } from "./main";
import { getPermit2Address } from "./permit2-addresses";
import { ethers } from "ethers";

const amountInput = document.querySelector(".amount-selector") as HTMLInputElement;
const addressInput = document.querySelector(".token-selector") as HTMLInputElement;
const currentAllowanceAmount = document.querySelector(".current-allowance-amount") as HTMLSpanElement;
const approveButton = document.querySelector(".approve-button") as HTMLButtonElement;
const revokeButton = document.querySelector(".revoke-button") as HTMLButtonElement;

const red = "1px solid red";
const green = "1px solid #5af55a";
const grey = "1px solid rgba(255, 255, 255, 0.1)";

function isValidAddress(): boolean {
  //reset color
  addressInput.style.border = grey;

  const isValid = /^0x[a-fA-F0-9]{40}$/.test(addressInput.value);

  if (!isValid && addressInput.value !== "") {
    addressInput.style.border = red;
  }

  return isValid;
}

function isValidAmount(): boolean {
  const isValid = !isNaN(Number(amountInput.value)) && Number(amountInput.value) > 0;

  if (isValid) {
    amountInput.style.border = green;
  } else if (amountInput.value === "") {
    amountInput.style.border = grey;
  } else {
    amountInput.style.border = red;
  }

  return isValid;
}

export async function isApprovalButtonsValid() {
  currentAllowanceAmount.textContent = "...";
  const isConnected = appState.getIsConnectedState();
  const isAddressValid = isValidAddress();
  const isAmountValid = isValidAmount();

  approveButton.disabled = true;
  revokeButton.disabled = true;

  if (isAddressValid && isConnected) {
    const isSuccess = await getCurrentAllowance();
    if (isSuccess) {
      approveButton.disabled = !isAmountValid;
      revokeButton.disabled = false;
      addressInput.style.border = green;
    } else {
      addressInput.style.border = red;
    }
  }
}

async function getCurrentAllowance(): Promise<boolean> {
  if (!provider) {
    console.error("Provider is not initialized");
    return false;
  }

  const tokenAddress = addressInput.value;
  const permit2Address = getPermit2Address(appState.getChainId() as number);
  const userAddress = appState.getAddress();
  const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);

  try {
    const symbol = await tokenContract.symbol();
    const decimals = await tokenContract.decimals();
    const allowance = await tokenContract.allowance(userAddress, permit2Address);
    const formattedAllowance = ethers.utils.formatUnits(allowance, decimals);
    currentAllowanceAmount.textContent = formattedAllowance + " " + symbol;
    return true;
  } catch (error) {
    currentAllowanceAmount.textContent = "not a valid token";
    return false;
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

  const originalText = approveButton.textContent;
  try {
    approveButton.textContent = "Loading...";
    approveButton.disabled = true;
    revokeButton.disabled = true; // disable revoke as well to prevent conflicting actions

    const tokenAddress = addressInput.value;
    const permit2Address = getPermit2Address(appState.getChainId() as number);
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, userSigner);
    const decimals = await tokenContract.decimals();
    const amount = ethers.utils.parseUnits(amountInput.value, decimals);

    const tx = await tokenContract.approve(permit2Address, amount);
    await tx.wait();

    renderSuccessModal(tx.hash);

    await getCurrentAllowance();
  } catch (error) {
    console.error("Error approving allowance:", error);
    renderErrorInModal(error as Error);
  } finally {
    approveButton.textContent = originalText;
    await isApprovalButtonsValid(); // re-check the state to restore buttons correctly
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

  const originalText = revokeButton.textContent;
  try {
    revokeButton.textContent = "Loading...";
    revokeButton.disabled = true;
    approveButton.disabled = true; // disable approve as well

    const tokenAddress = addressInput.value;
    const permit2Address = getPermit2Address(appState.getChainId() as number);
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, userSigner);

    const tx = await tokenContract.approve(permit2Address, 0);
    await tx.wait();

    renderSuccessModal(tx.hash);

    await getCurrentAllowance();
  } catch (error) {
    console.error("Error revoking allowance:", error);
    renderErrorInModal(error as Error);
  } finally {
    revokeButton.textContent = originalText;
    await isApprovalButtonsValid(); // re-check state to restore buttons correctly
  }
}

export async function setupButtonValidityListener() {
  amountInput.addEventListener("change", isApprovalButtonsValid);
  addressInput.addEventListener("change", isApprovalButtonsValid);
}
