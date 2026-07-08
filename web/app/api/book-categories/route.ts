import { createBookCategory, listBookCategories } from "../../data/bookStore";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    categories: await listBookCategories()
  });
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as { name?: string } | null;
  const name = payload?.name?.trim() ?? "";

  if (!name) {
    return Response.json({ error: "name is required" }, { status: 400 });
  }

  try {
    return Response.json({ category: await createBookCategory(name) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create book category";
    return Response.json({ error: message }, { status: 500 });
  }
}
