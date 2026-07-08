import { bookCatalog } from "../../data/bookCatalog";

export function GET() {
  return jsonResponse(bookCatalog);
}

function jsonResponse(data: unknown) {
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}
