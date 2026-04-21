import { randomInt } from "crypto";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/** Código de 6 caracteres [A-Z0-9] criptográficamente aleatorio (servidor). */
export function generateAccessCode(): string {
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    out += ALPHABET[randomInt(0, ALPHABET.length)];
  }
  return out;
}
