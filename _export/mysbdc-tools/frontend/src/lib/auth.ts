/** Authentication helpers — stub for Phase 1 */

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('sbdc_token');
}
