/**
 * Sidereal ayanam (per common Hindu calendar convention):
 * Uttarayana from Makara through Mithuna (sunsign 9–11, 0–2); Dakshinayana from Karka through Dhanu (3–8).
 * Sunsign indices match backend: 0=Mesha … 11=Meena.
 */
export function isSiderealUttarayana(sunsign: number | null | undefined): boolean | null {
  if (sunsign == null || sunsign < 0 || sunsign > 11) return null
  return sunsign >= 9 || sunsign <= 2
}
