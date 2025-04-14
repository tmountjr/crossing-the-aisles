import { allLegislators, stateLegislators } from "@/db/queries/legislators";

export async function GET(request: Request) {
  const url = request.url;
  const { searchParams } = new URL(url);
  const state = searchParams.get("state");
  if (state) {
    const legislators = await stateLegislators(state);
    return Response.json(legislators);
  }
  const legislators = await allLegislators;
  return Response.json(legislators);
}