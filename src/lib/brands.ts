// Brand catalog for Treatcode voucher redemptions.
//
// NOTE: brand_slug values are pre-mapped to Tillo retailer IDs.
// When Tillo API is integrated, slug will be passed directly to their orders endpoint.
// denominations are in pence.

export interface Brand {
  name: string;
  slug: string;
  logo: string;
  denominations: number[];
  category: string;
}

export const BRANDS: Brand[] = [
  {
    name: "ASOS",
    slug: "asos",
    logo: "🛍️",
    denominations: [1000, 2500, 5000, 10000],
    category: "Fashion",
  },
  {
    name: "Nike",
    slug: "nike",
    logo: "👟",
    denominations: [2500, 5000, 10000],
    category: "Sport",
  },
  {
    name: "Zara",
    slug: "zara",
    logo: "👗",
    denominations: [1000, 2500, 5000, 10000],
    category: "Fashion",
  },
  {
    name: "Amazon",
    slug: "amazon",
    logo: "📦",
    denominations: [1000, 2500, 5000, 10000],
    category: "General",
  },
  {
    name: "Apple",
    slug: "apple",
    logo: "🍎",
    denominations: [2500, 5000, 10000],
    category: "Tech",
  },
  {
    name: "Sephora",
    slug: "sephora",
    logo: "💄",
    denominations: [1000, 2500, 5000],
    category: "Beauty",
  },
  {
    name: "Adidas",
    slug: "adidas",
    logo: "🏃",
    denominations: [2500, 5000, 10000],
    category: "Sport",
  },
  {
    name: "H&M",
    slug: "hm",
    logo: "👚",
    denominations: [1000, 2500, 5000, 10000],
    category: "Fashion",
  },
];
