export function formatPrice(price: number): string {
  if (price === 0) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatCategoryLabel(category: string): string {
  switch (category.toLowerCase()) {
    case "tech":
      return "Technology";
    case "music":
      return "Live Music";
    case "sports":
      return "Sports";
    case "workshop":
      return "Workshop";
    default:
      return "Community";
  }
}
