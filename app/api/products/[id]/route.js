import { NextResponse } from "next/server";
import { getProduct } from "../../../../lib/products";

export async function GET(_req, { params }) {
  const product = getProduct(params.id);
  if (!product) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}


