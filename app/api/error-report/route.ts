import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const errorReport = await request.json();

    // Log the error report to Vercel Logs instead of writing to a file
    console.error(
      "🚨 [Client-Side Error Report]:",
      JSON.stringify(errorReport, null, 2)
    );

    return NextResponse.json({
      success: true,
      message: "Error report received and logged successfully.",
    });
  } catch (error) {
    console.error("❌ Error processing error report:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process error report" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // This endpoint is no longer needed as we are not storing reports in files
  return NextResponse.json({
    success: true,
    message:
      "Error reporting is active. Reports are logged to the server console.",
  });
}
