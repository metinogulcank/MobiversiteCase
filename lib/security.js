export function generateSalt(bytes = 16) {
  const arr = new Uint8Array(bytes);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < bytes; i++) arr[i] = Math.floor(Math.random() * 256);
  }
  return bufferToHex(arr);
}

export async function hashWithSalt(saltHex, password) {
  const encoder = new TextEncoder();
  const saltBytes = hexToBuffer(saltHex);
  const pwdBytes = encoder.encode(password);
  const combined = new Uint8Array(saltBytes.length + pwdBytes.length);
  combined.set(saltBytes, 0);
  combined.set(pwdBytes, saltBytes.length);
  const digest = await crypto.subtle.digest("SHA-256", combined);
  return bufferToHex(new Uint8Array(digest));
}

function bufferToHex(buf) {
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}


