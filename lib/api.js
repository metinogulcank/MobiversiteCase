import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const api = axios.create({ baseURL: API_URL });

export async function fetchProducts() {
  const { data } = await api.get("/products");
  return data;
}

export async function fetchProduct(id) {
  const { data } = await api.get(`/products/${id}`);
  return data;
}

export async function createProduct(product) {
  const { data } = await api.post("/products", product);
  return data;
}

export async function createOrder(order) {
  const { data } = await api.post("/orders", order);
  return data;
}

export async function updateOrder(id, patch) {
  const { data } = await api.patch(`/orders/${id}`, patch);
  return data;
}

export async function fetchOrders() {
  const { data } = await api.get("/orders");
  return data;
}

export async function fetchOrder(id) {
  const { data } = await api.get(`/orders/${id}`);
  return data;
}

export async function fetchProductReviews(productId) {
  const { data } = await api.get(`/reviews`, { params: { productId } });
  return data || [];
}

export async function fetchUserReviews(userEmail) {
  const { data } = await api.get(`/reviews`, { params: { userEmail } });
  return data || [];
}

export async function createReview(review) {
  const { data } = await api.post(`/reviews`, review);
  return data;
}

export async function fetchUsers() {
  const { data } = await api.get(`/users`);
  return data || [];
}

export async function fetchUserByEmail(email) {
  const { data } = await api.get(`/users`, { params: { email } });
  return Array.isArray(data) && data.length ? data[0] : null;
}

export async function createUser(user) {
  const { data } = await api.post(`/users`, user);
  return data;
}

export async function updateUser(id, patch) {
  const { data } = await api.patch(`/users/${id}`, patch);
  return data;
}

export async function updateUserEmailEverywhere(oldEmail, newEmail) {
  const res = await api.post(`/api/users/update-email`, { oldEmail, newEmail });
  return res.data;
}

export async function fetchCatalog() {
  const { data } = await api.get(`/catalog`);
  return data;
}

export async function updateProduct(id, patch) {
  const { data } = await api.patch(`/products/${id}`, patch);
  return data;
}

export async function deleteProduct(id) {
  const { data } = await api.delete(`/products/${id}`);
  return data;
}

export async function fetchWishlist() {
  const { data } = await api.get(`/wishlist`);
  return data || [];
}

export async function addToWishlist(item) {
  const { data } = await api.post(`/wishlist`, item);
  return data;
}

export async function removeFromWishlist(id) {
  const { data } = await api.delete(`/wishlist/${id}`);
  return data;
}

export async function fetchUserCart(userEmail) {
  const { data } = await api.get(`/carts`, { params: { userEmail } });
  return Array.isArray(data) && data.length ? data[0] : null;
}

export async function saveUserCart(userEmail, items) {
  const existing = await fetchUserCart(userEmail);
  if (existing && existing.id) {
    const { data } = await api.patch(`/carts/${existing.id}`, { items, userEmail });
    return data;
  }
  const { data } = await api.post(`/carts`, { userEmail, items });
  return data;
}


