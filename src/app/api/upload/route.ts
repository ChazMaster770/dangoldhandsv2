import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { media } from "@/db/schema";
import { ensureDb } from "@/db/ensure";
import { isAdminRequest } from "@/lib/admin";

export const dynamic = "force-dynamic";

const MAX_BYTES = 4 * 1024 * 1024; // 4MB — safe for serverless payloads

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/**
 * Admin image upload: stores the file in the media table (base64) so it is
 * served via /api/img on ANY deployment — no git/static files needed.
 */
export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  await ensureDb();

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "לא נבחר קובץ" }, { status: 400 });
  }
  const ext = TYPES[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "סוג קובץ לא נתמך — jpg / png / webp / gif בלבד" },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "הקובץ גדול מדי — עד 4MB" },
      { status: 400 },
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const base =
    (file.name || "image")
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/[^a-z0-9-]+/gi, "-")
      .toLowerCase()
      .slice(0, 40) || "image";
  const name = `uploads/${Date.now()}-${base}.${ext}`;

  await db
    .insert(media)
    .values({
      name,
      contentType: file.type,
      data: buf.toString("base64"),
    })
    .onConflictDoNothing({ target: media.name });

  return NextResponse.json(
    { url: `/api/img?path=${encodeURIComponent(name)}`, name },
    { status: 201 },
  );
}
