import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function shingles(value: string, size = 5) {
  const tokens = value.toLowerCase().normalize("NFKC").match(/[\p{L}\p{N}]+/gu) ?? [];
  const result = new Set<string>();
  for (let i = 0; i <= tokens.length - size; i++) result.add(tokens.slice(i, i + size).join(" "));
  return result;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = typeof body?.input === "string" ? body.input.slice(0, 30000) : "";
    const sections = input.split(/^---\s*SOURCE\s*---$/gim);
    const checkedText = sections.shift()?.trim() ?? "";
    const sources = sections.map((source: string) => source.trim()).filter(Boolean);
    if (checkedText.length < 30 || sources.length === 0) {
      return NextResponse.json({ error: "Enter at least 30 characters of text, then add one or more comparison sources below a line containing exactly: --- SOURCE ---" }, { status: 400 });
    }
    const target = shingles(checkedText);
    if (target.size === 0) return NextResponse.json({ error: "Not enough text to compare." }, { status: 400 });
    const sourceSets = sources.map(shingles);
    const matched = new Set<string>();
    const perSource = sourceSets.map((source: Set<string>, index: number) => {
      let overlap = 0;
      for (const phrase of source) if (target.has(phrase)) { overlap++; matched.add(phrase); }
      return { source: index + 1, matchedPhrases: overlap, sourcePhrases: source.size, overlapPercent: Math.round((overlap / Math.max(1, target.size)) * 1000) / 10 };
    });
    const percent = Math.round((matched.size / target.size) * 1000) / 10;
    return NextResponse.json({
      output: `Text-to-supplied-sources overlap estimate: ${percent}%\n\nCompared ${target.size} unique five-word phrases against ${sources.length} source(s).\n\n` +
        perSource.map((item: { source: number; matchedPhrases: number; sourcePhrases: number; overlapPercent: number }) => `Source ${item.source}: ${item.matchedPhrases} matching phrases · ${item.overlapPercent}% of checked-text phrases`).join("\n") +
        "\n\nLimitations: this is a local phrase-overlap check against only the sources you pasted. It does not search websites, books, journals or student-paper databases; it is not a formal plagiarism verdict. Paraphrased copying may not be detected.",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Similarity check failed", error);
    return NextResponse.json({ error: "Could not compare the supplied text." }, { status: 500 });
  }
}
