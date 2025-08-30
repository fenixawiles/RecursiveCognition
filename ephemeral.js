// ephemeral.js
// Centralized Ephemeral Mode utility

const EPHEMERAL_KEY = 'sonder_ephemeral';
const AUTO_TAG_KEY = 'sonder_auto_tag';

export function isEphemeralEnabled() {
  try {
    return localStorage.getItem(EPHEMERAL_KEY) === 'true';
  } catch (_) {
    return false;
  }
}

export function setEphemeralEnabled(enabled) {
  try {
    localStorage.setItem(EPHEMERAL_KEY, enabled ? 'true' : 'false');
  } catch (_) {}
}

export function shouldPersist() {
  return !isEphemeralEnabled();
}

export function isAutoTagEnabled() {
  try {
    const v = localStorage.getItem(AUTO_TAG_KEY);
    return v == null ? true : v === 'true';
  } catch (_) {
    return true;
  }
}

export function setAutoTagEnabled(enabled) {
  try {
    localStorage.setItem(AUTO_TAG_KEY, enabled ? 'true' : 'false');
  } catch (_) {}
}

