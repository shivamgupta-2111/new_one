/** Product catalogue and pricing rules. */
export function validateProduct(product) {
  const errors = {};
  if (!product?.name?.trim()) errors.name = 'Product name is required';
  const min = Number(product?.minimumPrice ?? 0), price = Number(product?.price ?? 0), max = Number(product?.maximumPrice ?? Infinity);
  if (price < min || price > max) errors.price = 'Price must be within the configured price range';
  return { valid: !Object.keys(errors).length, errors };
}
export function isWithinPriceLimit(product, price) {
  const value = Number(price);
  return Number.isFinite(value) && value >= Number(product.minimumPrice ?? 0) && value <= Number(product.maximumPrice ?? Infinity);
}
