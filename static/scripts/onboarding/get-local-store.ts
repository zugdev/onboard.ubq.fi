export function getLocalStore<T>(key: string): T | null {
  const cachedIssues = localStorage.getItem(key);
  if (cachedIssues) {
    try {
      return JSON.parse(cachedIssues);
    } catch (error) {
      console.error(error);
    }
  }
  return null;
}

export function setLocalStore<T>(key: string, value: T) {
  localStorage[key] = JSON.stringify(value);
}
