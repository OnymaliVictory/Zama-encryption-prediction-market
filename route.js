export async function GET() {
  try {
    const res = await fetch(
      "https://gamma-api.polymarket.com/markets?active=true&closed=false&limit=30&order=volume&ascending=false",
      { next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error("Polymarket error");
    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    return Response.json([], { status: 200 }); // return empty array silently
  }
}