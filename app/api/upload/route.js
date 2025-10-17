import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const productId = formData.get("productId");
    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const files = formData.getAll("files");
    const uploadDir = path.join(process.cwd(), "public", "products", String(productId));

    fs.mkdirSync(uploadDir, { recursive: true });

    const savedPaths = [];
    for (const file of files) {
      if (typeof file === "string") continue;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const target = path.join(uploadDir, safeName);
      fs.writeFileSync(target, buffer);
      const publicPath = `/products/${productId}/${safeName}`;
      savedPaths.push(publicPath);
    }

    return NextResponse.json({ paths: savedPaths });
  } catch (e) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}


