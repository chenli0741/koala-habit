import { createBook, listBookCategories, listBooks, updateBook } from "../../data/bookStore";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    books: await listBooks(),
    categories: await listBookCategories()
  });
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as {
    category?: string;
    content?: string;
    id?: string;
    title?: string;
  } | null;

  const title = payload?.title?.trim() ?? "";
  const category = payload?.category?.trim() ?? "";
  const content = payload?.content?.trim() ?? "";
  const id = payload?.id?.trim();

  if (!title || !category || !content) {
    return Response.json({ error: "title, category, and content are required" }, { status: 400 });
  }

  try {
    const book = await createBook({
      category,
      content,
      id,
      title
    });

    return Response.json({ book }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create book content";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const payload = (await request.json().catch(() => null)) as {
    category?: string;
    content?: string;
    id?: string;
    title?: string;
  } | null;

  const id = payload?.id?.trim() ?? "";
  const title = payload?.title?.trim() ?? "";
  const category = payload?.category?.trim() ?? "";
  const content = payload?.content?.trim() ?? "";

  if (!id || !title || !category || !content) {
    return Response.json({ error: "id, title, category, and content are required" }, { status: 400 });
  }

  try {
    const book = await updateBook(id, {
      category,
      content,
      title
    });

    if (!book) {
      return Response.json({ error: "Book content not found" }, { status: 404 });
    }

    return Response.json({ book });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update book content";
    return Response.json({ error: message }, { status: 500 });
  }
}
