export function getLocalStore<T>(key: string): T | null {
  const cachedIssues = localStorage.getItem(key);
  if (cachedIssues) {
    try {
      return JSON.parse(cachedIssues); // as OAuthToken;
    } catch (error) {
      console.error(error);
    }
  }
  return null;
}

export function setLocalStore<T>(key: string, value: T) {
  // remove state from issues before saving to local storage
  localStorage[key] = JSON.stringify(value);
}
