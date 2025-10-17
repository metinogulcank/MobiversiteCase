export const products = Array.from({ length: 24 }).map((_, idx) => {
  const id = String(idx + 1);
  const base = idx + 1;
  const price = ((base * 7) % 90) + 10; 
  const rating = 3 + (((base * 37) % 20) / 10); 
  return {
    id,
    title: `Product ${id}`,
    description: `This is a great product number ${id} with awesome features.`,
    price: price.toFixed(2),
    image: `https://picsum.photos/seed/mobi-${id}/400/300`,
    category: idx % 2 === 0 ? "Gadgets" : "Accessories",
    rating: Math.round(rating * 10) / 10,
  };
});

export function getProducts() {
  return products;
}

export function getProduct(id) {
  return products.find((p) => p.id === String(id));
}


