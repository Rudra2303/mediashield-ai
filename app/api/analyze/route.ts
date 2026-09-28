import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Cloudinary credentials are missing" },
        { status: 500 }
      );
    }

    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

    const response = await fetch(
      `https://api.cloudinary.com/v2/analysis/${cloudName}/analyze/ai_vision_general`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: {
            uri: imageUrl,
          },
          prompts: [
            "Describe this image in detail.",
            "What objects or products are visible in this image?",
            "Is the image suitable for professional use? Explain briefly.",
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Cloudinary AI error:", data);

      return NextResponse.json(
        { error: "AI analysis failed", details: data },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Analysis error:", error);

    return NextResponse.json(
      { error: "Something went wrong during AI analysis" },
      { status: 500 }
    );
  }
}