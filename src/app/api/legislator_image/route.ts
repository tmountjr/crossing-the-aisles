import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const bioguideId = request.nextUrl.searchParams.get("bioguide_id");
  if (!bioguideId) {
    return new Response("Bioguide ID is required", { status: 400 });
  }

  const primaryUrl = `https://unitedstates.github.io/images/congress/225x275/${bioguideId}.jpg`;
  const backupUrl = `https://api.congress.gov/v3/member/${bioguideId}?api_key=${process.env.CONGRESS_API_KEY}&format=json`;

  try {
    let response = await fetch(primaryUrl);
    if (!response.ok) {
      console.log("Falling back on Congress API");
      const apiResponse = await fetch(backupUrl);
      const apiData = await apiResponse.json();
      response = await fetch(apiData.member?.depiction?.imageUrl);
    }

    const buffer = await response.arrayBuffer();
    const mimeType = response.headers.get("content-type") || "image/jpeg";

    const resp = new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type": mimeType,
      },
    });
    return resp;
  } catch (error) {
    console.log(error);
    return new Response("Failed to fetch image", { status: 500 });
  }
}
