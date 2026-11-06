export const SIZES = ['S', 'M', 'L', 'XL'] as const;

export type Size = (typeof SIZES)[number];
