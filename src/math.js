export function grains(square) {
  if (!Number.isInteger(square) || square < 1 || square > 64) throw new RangeError('格数须为 1–64 的整数');
  return { current: 2n ** BigInt(square - 1), total: 2n ** BigInt(square) - 1n };
}
export function scientific(exponent) {
  if (!Number.isInteger(exponent) || exponent < 0 || exponent > 12) throw new RangeError('指数须为 0–12 的整数');
  return 10n ** BigInt(exponent);
}
export function hotelRoom(guest, mode) {
  if (!Number.isInteger(guest) || guest < 1) throw new RangeError('房号须为正整数');
  if (mode === 'one') return guest + 1;
  if (mode === 'many') return guest * 2;
  if (mode === 'reset') return guest;
  throw new RangeError('未知入住方式');
}
export function gcd(a, b) { while (b) [a, b] = [b, a % b]; return a; }
export function rationalSequence(count) {
  if (!Number.isInteger(count) || count < 1 || count > 1000) throw new RangeError('数量须为 1–1000');
  const result = [];
  for (let sum = 2; result.length < count; sum++) {
    for (let numerator = 1; numerator < sum && result.length < count; numerator++) {
      const denominator = sum - numerator;
      if (gcd(numerator, denominator) === 1) result.push([numerator, denominator]);
    }
  }
  return result;
}
