import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import { ensureDb } from "@/db/ensure";

export const dynamic = "force-dynamic";

/**
 * Branded fallback so the site never shows a broken image, even on a
 * deployment where /public/images weren't uploaded and the DB has no copy.
 */
const PLACEHOLDER = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <defs>
    <radialGradient id="bg" cx="50%" cy="42%" r="75%">
      <stop offset="0%" stop-color="#1c1c4a"/><stop offset="100%" stop-color="#070716"/>
    </radialGradient>
  </defs>
  <rect width="800" height="800" fill="url(#bg)"/>
  <circle cx="400" cy="350" r="230" fill="none" stroke="#f5c542" stroke-width="8"/>
  <circle cx="400" cy="350" r="196" fill="none" stroke="#f5c542" stroke-opacity="0.35" stroke-width="18" stroke-dasharray="4 16" stroke-linecap="round"/>
  <circle cx="400" cy="350" r="96" fill="#ef3f4e"/>
  <path d="M304 350a96 96 0 0 0 192 0z" fill="#f8fafc"/>
  <rect x="304" y="342" width="192" height="16" fill="#0f172a"/>
  <circle cx="400" cy="350" r="32" fill="#0f172a"/>
  <circle cx="400" cy="350" r="17" fill="#f8fafc"/>
  <text x="400" y="690" font-family="Heebo, Arial, sans-serif" font-size="56" font-weight="900" fill="#f5c542" text-anchor="middle">דן ידי זהב</text>
  <text x="400" y="734" font-family="Arial, sans-serif" font-size="19" letter-spacing="7" fill="#8a8ab0" text-anchor="middle">DAN GOLD HANDS TCG</text>
</svg>`;

export async function GET(req: NextRequest) {
  // Direct form:  /api/img?path=products/box-gold.jpg
  // Rewrite form: config fallback rewrites /images/* here; in that case the
  // handler still sees the ORIGINAL pathname (/images/...), so we read it.
  const url = new URL(req.url);
  let name = url.searchParams.get("path") ?? "";
  if (!name && url.pathname.startsWith("/images/")) {
    name = decodeURIComponent(url.pathname.slice("/images/".length));
  }
  if (!name || name.includes("..") || name.startsWith("/")) {
    return new NextResponse("bad request", { status: 400 });
  }

  try {
    await ensureDb();
    const [row] = await db
      .select()
      .from(media)
      .where(eq(media.name, name))
      .limit(1);
    if (row) {
      const bytes = new Uint8Array(Buffer.from(row.data, "base64"));
      return new NextResponse(new Blob([bytes], { type: row.contentType }), {
        headers: {
          "Content-Type": row.contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }
  } catch (err) {
    console.error("media lookup failed:", err instanceof Error ? err.message : err);
  }

  return new NextResponse(PLACEHOLDER, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=300",
    },
  });
}
