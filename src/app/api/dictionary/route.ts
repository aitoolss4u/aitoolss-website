import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const word = new URL(request.url).searchParams.get("word")?.trim() ?? "";
  if (!/^[\\p{L}\\p{M}'’-]{1,80}$/u.test(word)) {
    return NextResponse.json({ error: "Enter one word (up to 80 characters)." }, { status: 400 });
  }
  try {
    const response = await fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + encodeURIComponent(word), {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });
    if (response.status === 404) return NextResponse.json({ error: "No English dictionary entry was found for this word." }, { status: 404 });
    if (!response.ok) return NextResponse.json({ error: "The dictionary service is temporarily unavailable." }, { status: 502 });
    const entries = await response.json();
    const output = (entries as Array<{ word?: string; phonetic?: string; meanings?: Array<{ partOfSpeech?: string; definitions?: Array<{ definition?: string; example?: string }> }> }>)
      .map((entry) => [
        (entry.word ?? word) + (entry.phonetic ? " " + entry.phonetic : ""),
        ...(entry.meanings ?? []).flatMap((meaning) => [
          (meaning.partOfSpeech ?? "Meaning") + ":",
          ...(meaning.definitions ?? []).slice(0, 4).map((definition, index) =>
            `  ${index + 1}. ${definition.definition ?? "Definition unavailable"}${definition.example ? "\\n     Example: " + definition.example : ""}`),
        ]),
      ].join("\\n"))
      .join("\\n\\n");
    return NextResponse.json({ output }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Could not reach the dictionary service. Please try again." }, { status: 502 });
  }
}
