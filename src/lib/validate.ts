/**
 * Shared field validators for the public application forms.
 *
 * NeoSerra hard-rejects malformed emails on /api/v1/clients/new
 * ("Improperly formed email address in list"), which kills the entire
 * client creation — so every form must gate on this before submitting.
 */

/** True when the string looks like a deliverable email (user@domain.tld). */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}
