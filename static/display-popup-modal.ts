export function renderErrorInModal(error: Error) {
  const modal = document.getElementById("error-modal");
  const closeButton = document.getElementsByClassName("error-close-modal");
  if (closeButton) {
    closeButton[0].addEventListener("click", closeErrorModal);
  }
  const errorMessageElement = document.getElementById("error-message");

  if (errorMessageElement) {
    errorMessageElement.textContent = `${error.message}\n\n${error.stack || ""}`;
  }

  if (modal) {
    modal.style.display = "flex";
  }
}

export function closeErrorModal() {
  const modal = document.getElementById("error-modal");
  if (modal) {
    modal.style.display = "none";
  }
}

export function renderSuccessModal(transactionHash: string) {
  const modal = document.getElementById("success-modal");
  const closeButton = document.getElementsByClassName("success-close-modal");
  if (closeButton) {
    closeButton[0].addEventListener("click", closeSuccessModal);
  }
  const successMessageElement = document.getElementById("success-message");

  if (successMessageElement) {
    successMessageElement.innerHTML = `You've successfully signed the transaction. Your allowance balance should be updated in a few blocks.<br><br>transaction hash: <span class="tx-hash">${transactionHash}</span>`;
  }

  if (modal) {
    modal.style.display = "flex";
  }
}

export function closeSuccessModal() {
  const modal = document.getElementById("success-modal");
  if (modal) {
    modal.style.display = "none";
  }
}
