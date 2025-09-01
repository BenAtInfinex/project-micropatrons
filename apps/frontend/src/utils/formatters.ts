// Conversion rate: 1,983,711 µPatrons = $8,185.96
const MICROPATRONS_PER_DOLLAR = 1983711 / 8185.96;

export const formatMicropatrons = (amount: number): string => {
  return `${amount.toLocaleString()} µPatrons`;
};

export const formatDollars = (micropatrons: number): string => {
  const dollars = micropatrons / MICROPATRONS_PER_DOLLAR;
  return `$${dollars.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

export const formatWithDollars = (micropatrons: number): string => {
  return `${formatMicropatrons(micropatrons)} (${formatDollars(micropatrons)})`;
};
