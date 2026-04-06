/**
 * PNR Generator — 6-character alphanumeric code
 * Excludes confusing characters: O, 0, I, 1, L, S, 5
 * Mirrors real airline PNR conventions.
 */
const CHARSET = 'ABCDEFGHJKMNPQRTUVWXYZ2346789';

export function generatePNR(): string {
  let pnr = '';
  for (let i = 0; i < 6; i++) {
    pnr += CHARSET.charAt(Math.floor(Math.random() * CHARSET.length));
  }
  return pnr;
}
