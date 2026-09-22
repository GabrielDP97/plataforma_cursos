/**
 * Generate a cryptographically secure 5-digit temporary password.
 *
 * Uses crypto.getRandomValues() (available in Cloudflare Workers and all
 * modern runtimes). Each digit is independently generated, so leading
 * zeros are possible (e.g., "03841").
 *
 * @returns A 5-digit string (e.g., "83920", "01234")
 */
export function generateTemporaryPassword(): string {
  const array = new Uint8Array(1);
  let result = "";

  for (let i = 0; i < 5; i++) {
    crypto.getRandomValues(array);
    result += (array[0] % 10).toString();
  }

  return result;
}
