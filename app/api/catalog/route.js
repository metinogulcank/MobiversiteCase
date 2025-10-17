import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function dbPath() {
  return path.join(process.cwd(), "db.json");
}

function readDb() {
  const p = dbPath();
  const raw = fs.readFileSync(p, "utf-8");
  return JSON.parse(raw || "{}");
}

function writeDb(json) {
  const p = dbPath();
  fs.writeFileSync(p, JSON.stringify(json, null, 2), "utf-8");
}

export async function GET() {
  try {
    const db = readDb();
    return NextResponse.json(db.catalog || { categories: {}, colors: [], sizes: [] });
  } catch (e) {
    return NextResponse.json({ error: "Failed to read catalog" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { gender, group, sub } = body || {};
    const db = readDb();
    db.catalog = db.catalog || { categories: {}, colors: [], sizes: [] };
    const cats = (db.catalog.categories = db.catalog.categories || {});
    if (gender && !group && !sub) {
      cats[gender] = cats[gender] || {};
    }
    if (gender && group && !sub) {
      cats[gender] = cats[gender] || {};
      cats[gender][group] = cats[gender][group] || [];
    }
    if (gender && group && sub) {
      cats[gender] = cats[gender] || {};
      cats[gender][group] = cats[gender][group] || [];
      if (!cats[gender][group].includes(sub)) {
        cats[gender][group].push(sub);
      }
    }
    writeDb(db);
    return NextResponse.json({ ok: true, catalog: db.catalog });
  } catch (e) {
    return NextResponse.json({ error: "Failed to add category" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const gender = searchParams.get("gender");
    const group = searchParams.get("group");
    const sub = searchParams.get("sub");
    if (!gender) return NextResponse.json({ error: "gender required" }, { status: 400 });
    const db = readDb();
    const cats = db?.catalog?.categories || {};
    if (gender && !group && !sub) {
      delete cats[gender];
    }
    else if (gender && group && !sub) {
      if (cats[gender]) delete cats[gender][group];
    }
    else if (gender && group && sub) {
      if (cats[gender] && cats[gender][group]) {
        cats[gender][group] = cats[gender][group].filter((s) => s !== sub);
      }
    }
    writeDb(db);
    return NextResponse.json({ ok: true, catalog: db.catalog });
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}


