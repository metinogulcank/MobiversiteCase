const mockOrders = {
  "demo@mobishop.dev": [  
    {
      id: "ORD-1001",
      date: "2024-08-01",
      total: 129.97,
      items: [
        { productId: "1", title: "Product 1", qty: 1, price: 49.99 },
        { productId: "2", title: "Product 2", qty: 2, price: 39.99 },
      ],
    },
  ],
};

export function getOrdersForUser(email) {
  return mockOrders[email] || [];
}


