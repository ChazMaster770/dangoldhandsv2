import fs from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

/** One-click download of the clean, ready-to-upload project archive. */
export async function GET() {
  try {
    const file = path.join(process.cwd(), "dangoldhands-upload.zip");
    const buf = await fs.readFile(file);
    const bytes = new Uint8Array(buf);
    return new Response(new Blob([bytes], { type: "application/zip" }), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="dangoldhands-upload.zip"',
        "Content-Length": String(bytes.byteLength),
      },
    });
  } catch {
    return new Response("Archive not found", { status: 404 });
  }
}
