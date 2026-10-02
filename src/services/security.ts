/**
 * Hashes a 4-6 digit PIN using Web Crypto SHA-256
 */
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validates entered PIN against saved SHA-256 hash
 */
export async function verifyPin(enteredPin: string, savedHash: string): Promise<boolean> {
  if (!savedHash) return false;
  const hash = await hashPin(enteredPin);
  return hash === savedHash;
}
