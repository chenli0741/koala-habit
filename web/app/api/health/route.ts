export function GET() {
  return Response.json({
    ok: true,
    service: "koala-habit-web",
    status: "running"
  });
}
