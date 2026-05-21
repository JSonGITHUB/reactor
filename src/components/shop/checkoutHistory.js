// Utility for storing and retrieving checkout history
export const CHECKOUT_HISTORY_KEY = 'checkoutHistory';

export function getCheckoutHistory() {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    return JSON.parse(localStorage.getItem(CHECKOUT_HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveCheckoutHistory(history) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  localStorage.setItem(CHECKOUT_HISTORY_KEY, JSON.stringify(history));
}

export function addCheckoutRecord(record) {
  const history = getCheckoutHistory();
  history.unshift(record); // newest first
  saveCheckoutHistory(history);
}
