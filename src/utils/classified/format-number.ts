export function formatNumber(
  num: number | null,
  options?: Intl.NumberFormatOptions,
) {
  if (!num) return "0";

  return new Intl.NumberFormat("en-GB", options).format(num);
}
