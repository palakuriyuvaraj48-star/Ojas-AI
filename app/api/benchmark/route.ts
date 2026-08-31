import { NextResponse } from "next/server";
import { runBenchmarkSuite, generateBenchmarkReport } from "@/lib/testing/benchmark-scenarios";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";

    // Run the benchmark suite
    const { results, summary } = await runBenchmarkSuite();

    if (format === "text") {
      const report = generateBenchmarkReport(results, summary);
      return new NextResponse(report, {
        headers: { "Content-Type": "text/plain" },
      });
    }

    return NextResponse.json({
      status: "success",
      summary,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[API /api/benchmark] Error:", error);
    return NextResponse.json(
      { error: error.message || "Benchmark execution failed" },
      { status: 500 }
    );
  }
}
