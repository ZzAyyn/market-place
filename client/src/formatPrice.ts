const priceFormat = new Intl.NumberFormat("en-MV", {
  style: "currency",
  currency: "MVR",
});

export function formatPrice(cents: number): string {
  return priceFormat.format(cents / 100);
}
