/**
 * Dynamic pricing utility for the product
 * Handles bulk pricing discounts based on quantity
 */

export const calculatePrice = (quantity: number): number => {
  if (quantity === 1) return 220;
  if (quantity === 2) return 400;
  if (quantity === 3) return 580;
  if (quantity >= 4) return quantity * 190;
  return 220;
};

export const getPricePerItem = (quantity: number): number => {
  const totalPrice = calculatePrice(quantity);
  return totalPrice / quantity;
};

export const getPricingInfo = (quantity: number) => {
  const totalPrice = calculatePrice(quantity);
  const pricePerItem = getPricePerItem(quantity);
  const hasBulkDiscount = quantity > 1 && quantity <= 3;
  
  return {
    totalPrice,
    pricePerItem,
    hasBulkDiscount,
    quantity
  };
};

export const getPricingTable = () => {
  return [
    { quantity: 1, totalPrice: 220, pricePerItem: 220 },
    { quantity: 2, totalPrice: 400, pricePerItem: 200 },
    { quantity: 3, totalPrice: 580, pricePerItem: 193.33 },
    { quantity: '4+', totalPrice: 'varies', pricePerItem: 190 }
  ];
};
