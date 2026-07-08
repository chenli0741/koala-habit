import { getBookCatalog } from "../../data/bookStore";

export const runtime = "nodejs";

export async function GET() {
  return jsonResponse(await getBookCatalog());
}

function jsonResponse(data: unknown) {
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}
