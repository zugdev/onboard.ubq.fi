import { createClient } from "@supabase/supabase-js";
import { getLocalStore } from "./get-local-store";
import { OAuthToken } from "./github-oauth";

declare const SUPABASE_URL: string;
declare const SUPABASE_ANON_KEY: string;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

declare const FRONTEND_URL: string;

async function gitHubLoginButtonHandler() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: FRONTEND_URL,
      scopes: "admin:org user:read repo",
    },
  });
  if (error) {
    console.error("Error logging in:", error);
  }
}
const gitHubLoginButton = document.createElement("button");
export async function renderGitHubLoginButton() {
  const stepContainer = document.getElementById("overlay-item-container") as HTMLDivElement;
  const overlay = document.getElementById("overlay") as HTMLDivElement;
  const setButton = document.getElementById("setBtn") as HTMLButtonElement;

  // No need to show the OAuth button if we are already logged in
  if (getSessionToken()) {
    overlay?.classList.add("hidden");
    return;
  }

  gitHubLoginButton.id = "github-login-button";
  gitHubLoginButton.innerHTML = "<span>Connect</span><span class='full'>&nbsp;To GitHub</span>";
  gitHubLoginButton.addEventListener("click", gitHubLoginButtonHandler);
  if (stepContainer) {
    stepContainer.insertBefore(gitHubLoginButton, stepContainer.firstChild);
  }
  setButton.disabled = false;
}

function getNewSessionToken() {
  const hash = window.location.hash;
  const params = new URLSearchParams(hash.substring(1)); // remove the '#' and parse
  const providerToken = params.get("provider_token");
  if (!providerToken) {
    return null;
  }
  return providerToken;
}

function getSessionToken() {
  // cspell:ignore wfzpewmlyiozupulbuur
  const cachedSessionToken = getLocalStore<OAuthToken>("sb-wfzpewmlyiozupulbuur-auth-token");
  if (cachedSessionToken) {
    return cachedSessionToken.provider_token;
  }
  const newSessionToken = getNewSessionToken();
  if (newSessionToken) {
    return newSessionToken;
  }
  return null;
}

export { getSessionToken };
