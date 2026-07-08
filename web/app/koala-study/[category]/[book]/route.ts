import { findBookByPath } from "../../../data/bookCatalog";

type RouteContext = {
  params: Promise<{
    book: string;
    category: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const params = await context.params;
  const book = findBookByPath(`${params.category}/${params.book}`);

  if (!book) {
    return jsonResponse({ error: "Book content not found" }, 404);
  }

  return jsonResponse(book);
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    status
  });
}
