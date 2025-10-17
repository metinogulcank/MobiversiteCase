import { NextResponse } from "next/server";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function POST(request) {
  try {
    const { oldEmail, newEmail } = await request.json();
    if (!oldEmail || !newEmail) {
      return NextResponse.json({ error: "oldEmail and newEmail are required" }, { status: 400 });
    }
    if (oldEmail === newEmail) {
      return NextResponse.json({ ok: true, unchanged: true });
    }

    // Duplicate check
    const existing = await axios.get(`${API_URL}/users`, { params: { email: newEmail } });
    if (Array.isArray(existing.data) && existing.data.length) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    // Update user
    const usersRes = await axios.get(`${API_URL}/users`, { params: { email: oldEmail } });
    if (!Array.isArray(usersRes.data) || usersRes.data.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const user = usersRes.data[0];
    await axios.patch(`${API_URL}/users/${user.id}`, { email: newEmail });

    // Collections to update: orders, wishlist, carts, reviews
    const updateEmailField = async (collection, field = "userEmail") => {
      const res = await axios.get(`${API_URL}/${collection}`, { params: { [field]: oldEmail } });
      const items = Array.isArray(res.data) ? res.data : [];
      for (const it of items) {
        await axios.patch(`${API_URL}/${collection}/${it.id}`, { [field]: newEmail });
      }
    };

    await updateEmailField("orders");
    await updateEmailField("wishlist");
    await updateEmailField("carts");
    await updateEmailField("reviews");

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Email update failed" }, { status: 500 });
  }
}


