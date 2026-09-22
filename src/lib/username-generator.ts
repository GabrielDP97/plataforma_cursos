/**
 * Generate a username from a full name.
 *
 * Rules:
 * - Remove accents/diacritics (á→a, é→e, ñ→n, etc.)
 * - Lowercase
 * - Take first name + first last name (by space)
 * - Remove non-alphanumeric except dot
 * - Format: firstname.lastname
 *
 * Examples:
 *   "Gabriel García Márquez" → "gabriel.garcia"
 *   "María José"             → "maria.jose"
 *   "JOHN DOE"               → "john.doe"
 */
export function generateUsername(fullName: string): string {
  // Map of common diacritics → ASCII
  const diacriticsMap: Record<string, string> = {
    á: "a", é: "e", í: "i", ó: "o", ú: "u", ü: "u",
    ñ: "n",
    à: "a", è: "e", ì: "i", ò: "o", ù: "u",
    ä: "a", ë: "e", ï: "i", ö: "o",
    â: "a", ê: "e", î: "i", ô: "o", û: "u",
    å: "a", ø: "o",
  };

  const normalized = fullName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove combining diacritical marks
    .replace(/[áàâäã]/g, "a")
    .replace(/[éèêë]/g, "e")
    .replace(/[íìîï]/g, "i")
    .replace(/[óòôöõ]/g, "o")
    .replace(/[úùûü]/g, "u")
    .replace(/ñ/g, "n")
    .toLowerCase();

  const parts = normalized
    .split(/\s+/)
    .filter((p) => p.length > 0);

  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].replace(/[^a-z0-9]/g, "");

  // First name + first last name
  const first = parts[0].replace(/[^a-z0-9]/g, "");
  const second = parts[1].replace(/[^a-z0-9]/g, "");

  return `${first}.${second}`;
}

/**
 * Generate a unique username by appending an incrementing counter if needed.
 *
 * @param fullName - The user's full name
 * @param checkExists - Async function that returns true if the username is already taken
 * @returns A unique username
 */
export async function generateUniqueUsername(
  fullName: string,
  checkExists: (username: string) => Promise<boolean>
): Promise<string> {
  const base = generateUsername(fullName);
  if (!base) {
    // Fallback: use a timestamp-based username
    return `user.${Date.now()}`;
  }

  let candidate = base;
  let counter = 2;

  while (await checkExists(candidate)) {
    candidate = `${base}${counter}`;
    counter++;
  }

  return candidate;
}
