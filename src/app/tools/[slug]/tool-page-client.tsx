"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getTool } from "@/lib/tools";
import PomodoroTimer from "@/components/pomodoro-timer";
import ToolDetailSections from "@/components/tool-detail-sections";
import type { ToolSeoContent } from "@/lib/tool-seo";

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function words(value: string) { return value.trim() ? value.trim().split(/\s+/).length : 0; }
function sentenceCase(value: string) { return value.replace(/\s+/g, " ").trim().replace(/(^|[.!?]\s+)([a-z])/g, (_, prefix, letter: string) => prefix + letter.toUpperCase()); }
function titleCase(value: string) { return value.toLowerCase().replace(/\b[a-z]/g, (letter) => letter.toUpperCase()); }
function escapeHtml(value: string) { return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }

function run(slug: string, input: string, option: string): string {
  const text = input.trim();
  if (!text) return "Add some input above, then select Run tool.";
  switch (slug) {
    case "citation-generator": { const fields = Object.fromEntries(text.split("\\n").map((line) => { const i = line.indexOf(":"); return i > 0 ? [line.slice(0,i).trim().toLowerCase(),line.slice(i+1).trim()] : ["", ""]; }).filter(([key]) => key)); const author=fields.author||"Author"; const title=fields.title||"Title"; const year=fields.year||"n.d."; const source=fields.source||fields.publisher||"Publisher"; const url=fields.url||""; if(option==="mla") return `${author}. "${title}." ${source}, ${year}.${url ? " "+url : ""}`; if(option==="chicago") return `${author}. "${title}." ${source}. ${year}.${url ? " "+url : ""}`; return `${author} (${year}). ${title}. ${source}.${url ? " "+url : ""}`; }
    case "word-counter": return JSON.stringify({ words: words(text), characters: text.length, charactersWithoutSpaces: text.replace(/\s/g, "").length, sentences: (text.match(/[.!?]+(?=\s|$)/g) || []).length || (text ? 1 : 0), paragraphs: text.split(/\n\s*\n/).filter(Boolean).length, estimatedReadingTime: Math.max(1, Math.ceil(words(text) / 225)) + " min" }, null, 2);
    case "text-summarizer": { const sentences = text.match(/[^.!?]+[.!?]*/g) || [text]; const count = Math.max(1, Math.min(sentences.length, Number(option) || Math.ceil(sentences.length / 3))); return sentences.slice(0, count).map((s) => s.trim()).filter(Boolean).join(" "); }
    case "slug-generator": case "filename-cleaner": return slugify(text).slice(0, 120);
    case "color-palette-builder": { const hex = text.replace(/^#/, ""); if (!/^(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) return "Enter a valid 3- or 6-digit hex color, such as #7657FF."; const full = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex; const base = [parseInt(full.slice(0,2),16),parseInt(full.slice(2,4),16),parseInt(full.slice(4,6),16)]; const mix = (target:number, amount:number) => "#" + base.map((v) => Math.round(v*(1-amount)+target*amount).toString(16).padStart(2,"0")).join("").toUpperCase(); return ["Lightest  "+mix(255,.8),"Light      "+mix(255,.45),"Base       #"+full.toUpperCase(),"Dark       "+mix(0,.25),"Darkest    "+mix(0,.5)].join("\n"); }
    case "decision-matrix": { const rows = text.split("\n").map((line) => line.split(",").map((part) => part.trim())).filter((parts) => parts.length >= 2 && parts[0]); if (rows.length < 2 || rows.some((row) => row.slice(1).some((score) => !Number.isFinite(Number(score))))) return "Enter one option per line, followed by numeric scores separated by commas. Example: Option A, 4, 5, 3"; const scored = rows.map((row) => ({ name: row[0], scores: row.slice(1).map(Number) })); return scored.map((row) => row.name + ": " + row.scores.join(" + ") + " = " + row.scores.reduce((sum, n) => sum+n, 0)).sort((a,b) => Number(b.split(" = ").pop()) - Number(a.split(" = ").pop())).join("\n"); }
    case "random-password-generator": { const length = Math.max(8, Math.min(64, Number(text) || 20)); const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*_-+="; const bytes = new Uint8Array(length); crypto.getRandomValues(bytes); return Array.from(bytes, (byte) => chars[byte % chars.length]).join(""); }
    case "json-formatter": { try { return JSON.stringify(JSON.parse(text), null, 2); } catch (error) { return "Invalid JSON: " + (error instanceof Error ? error.message : "could not parse input"); } }
    case "json-to-csv-converter": { try { const data = JSON.parse(text); if (!Array.isArray(data) || !data.every((row) => row && typeof row === "object" && !Array.isArray(row))) return "Input must be a JSON array of objects."; const keys = [...new Set(data.flatMap((row) => Object.keys(row)))]; const cell = (v: unknown) => '"' + String(v ?? "").replace(/"/g, '""') + '"'; return [keys.map(cell).join(","), ...data.map((row) => keys.map((key) => cell(row[key])).join(","))].join("\n"); } catch { return "Invalid JSON. Paste an array of objects."; } }
    case "url-encoder-decoder": try { return option === "decode" ? decodeURIComponent(text) : encodeURIComponent(text); } catch { return "Could not decode this value. Check the percent-encoding."; }
    case "base64-encoder-decoder": try { return option === "decode" ? decodeURIComponent(escape(atob(text))) : btoa(unescape(encodeURIComponent(text))); } catch { return "Could not decode Base64. Check the input."; }
    case "html-entity-encoder": return option === "decode" ? text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&") : escapeHtml(text);
    case "markdown-formatter": return text.split("\n").map((line) => line.trim()).join("\n").replace(/\n{3,}/g, "\n\n");
    case "hex-to-rgb-converter": { const hex = text.replace(/^#/, ""); if (!/^(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) return "Enter a valid 3- or 6-digit hex color, such as #7657FF."; const full = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex; const n = parseInt(full, 16); const r = n >> 16, g = n >> 8 & 255, b = n & 255; return JSON.stringify({ hex: "#" + full.toUpperCase(), rgb: "rgb(" + r + ", " + g + ", " + b + ")", hsl: rgbToHsl(r,g,b) }, null, 2); }
    case "rgb-to-hex-converter": { const vals = text.match(/\d+(?:\.\d+)?/g)?.map(Number); if (!vals || vals.length < 3 || vals.slice(0,3).some((n) => n < 0 || n > 255)) return "Enter three RGB values between 0 and 255, e.g. 118, 87, 255."; return "#" + vals.slice(0,3).map((n) => Math.round(n).toString(16).padStart(2,"0")).join("").toUpperCase(); }
    case "timestamp-converter": { const date = /^\d{9,13}$/.test(text) ? new Date(Number(text) * (text.length <= 10 ? 1000 : 1)) : new Date(text); return Number.isNaN(date.getTime()) ? "Enter a Unix timestamp or a date string." : JSON.stringify({ iso: date.toISOString(), local: date.toString(), unixSeconds: Math.floor(date.getTime()/1000), unixMilliseconds: date.getTime() }, null, 2); }
    case "reading-time-estimator": return words(text) + " words · about " + Math.max(1, Math.ceil(words(text) / 225)) + " minute(s) at 225 words per minute.";
    case "paragraph-rewriter": case "tone-changer": case "achievement-bullet-rewriter": return (option === "formal" ? sentenceCase(text) : option === "friendly" ? sentenceCase(text).replace(/\butilize\b/gi, "use").replace(/\btherefore\b/gi, "so") : sentenceCase(text)).replace(/\s+/g, " ");
    case "bullet-point-maker": case "vocabulary-list-maker": return [...new Set(text.split(/[\n.!?;]+/).map((s) => s.trim()).filter(Boolean))].map((s) => "• " + s).join("\n");
    case "meta-description-writer": return text.replace(/\s+/g, " ").slice(0, 155).trim() + (text.length > 155 ? "…" : "");
    case "email-draft-helper": return "Subject: " + text.split(/[.!?\n]/)[0].slice(0, 70) + "\n\nHello,\n\n" + text + "\n\nPlease let me know if you have any questions.\n\nBest,";
    case "cover-letter-builder": return "Dear Hiring Manager,\n\nI am excited to apply for this opportunity. " + text + "\n\nI would welcome the opportunity to discuss how my experience can contribute to your team.\n\nSincerely,\n[Your name]";
    case "social-caption-writer": return text + "\n\nWhat do you think? Share your thoughts below.\n\n# " + text.split(/\s+/).filter((w) => w.length > 4).slice(0,3).map(slugify).join(" #");
    case "wordpress-excerpt-maker": case "product-description-writer": case "image-alt-text-helper": return text.replace(/\s+/g, " ").slice(0, slug === "wordpress-excerpt-maker" ? 220 : 500) + (text.length > 500 ? "…" : "");
    case "utm-link-builder": { try { const url = new URL(text); url.searchParams.set("utm_source", option || "website"); url.searchParams.set("utm_medium", "referral"); url.searchParams.set("utm_campaign", "campaign"); return url.toString(); } catch { return "Enter a full URL including https://"; } }
    case "aspect-ratio-calculator": case "pomodoro-session-planner": case "salary-hourly-converter": case "invoice-tax-calculator": case "break-even-calculator": { const n = text.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || []; if (slug === "aspect-ratio-calculator") { if (n.length < 2 || !n[0] || !n[1]) return "Enter width and height, e.g. 1920, 1080."; const gcd=(a:number,b:number):number=>b?gcd(b,a%b):a; const d=gcd(Math.round(n[0]),Math.round(n[1])); return JSON.stringify({ ratio: (n[0]/d)+":"+(n[1]/d), width:n[0], height:n[1] },null,2); } if (slug === "pomodoro-session-planner") { const work=Math.max(1,n[0]||25), br=Math.max(1,n[1]||5), rounds=Math.max(1,Math.floor(n[2]||4)); return Array.from({length:rounds},(_,i)=>"Round "+(i+1)+": Focus "+work+" min → Break "+br+" min").join("\n")+"\nTotal planned time: "+(rounds*(work+br))+" minutes."; } if (slug === "salary-hourly-converter") return n.length ? "$"+(n[0]/2080).toFixed(2)+" per hour (assuming 40 hours/week × 52 weeks)." : "Enter annual salary, e.g. 65000."; if (slug === "invoice-tax-calculator") return n.length>=2 ? JSON.stringify({subtotal:n[0],taxRate:n[1]+"%",taxAmount:+(n[0]*n[1]/100).toFixed(2),total:+(n[0]*(1+n[1]/100)).toFixed(2)},null,2) : "Enter subtotal and tax rate, e.g. 1000, 18."; return n.length>=2 && n[1]>0 ? "Break-even units: "+Math.ceil(n[0]/n[1])+" (fixed costs ÷ contribution per unit)." : "Enter fixed costs and contribution per unit, e.g. 5000, 25."; }
    case "daily-planner": case "goal-breakdown": case "habit-tracker-template": case "resume-checklist": case "grammar-checklist": case "citation-checklist": case "swot-analysis-builder": { const items = slug === "resume-checklist" ? ["Contact details and professional summary","Relevant experience with measurable impact","Skills matched to the role","Education and certifications","Proofread dates, spelling and formatting"] : slug === "grammar-checklist" ? ["Check subject–verb agreement","Review punctuation and sentence boundaries","Replace unclear pronouns","Check consistent tense","Read aloud for awkward phrasing"] : slug === "citation-checklist" ? ["Author or organization","Publication date","Title of work","Publisher or site name","URL or DOI where applicable","Required style guide formatting"] : slug === "swot-analysis-builder" ? ["Strengths — internal advantages","Weaknesses — internal limitations","Opportunities — external openings","Threats — external risks"] : slug === "habit-tracker-template" ? ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"] : slug === "goal-breakdown" ? ["Define the outcome and success measure","Split into 3–5 milestones","Choose the next small action","Set a review date","Track progress and adjust"] : ["Top priority","Second priority","Quick task","Break / reset","End-of-day review"]; return (text ? "Focus: "+text+"\n\n" : "")+items.map((item)=>"☐ "+item).join("\n"); }
    case "business-name-ideas": case "headline-generator": case "blog-outline-builder": case "prompt-generator": case "hashtag-ideas": case "video-script-outline": case "interview-practice-questions": case "quiz-question-builder": case "essay-outline-builder": case "flashcard-maker": case "meeting-agenda-maker": case "meeting-notes-formatter": case "study-notes-organizer": case "regex-cheat-sheet": case "code-explainer": case "youtube-description-builder": { const topic=text; const templates: Record<string,string[]> = { "business-name-ideas":["Bright "+titleCase(topic),"Next "+titleCase(topic),"Nova "+titleCase(topic),titleCase(topic)+" Studio", "True "+titleCase(topic)], "headline-generator":["The Complete Guide to "+titleCase(topic),"What to Know About "+titleCase(topic),"5 Ways to Improve "+titleCase(topic),"A Smarter Approach to "+titleCase(topic)], "blog-outline-builder":["Introduction: why "+topic+" matters","Key concepts and context","Practical steps or examples","Common mistakes to avoid","Conclusion and next steps"], "prompt-generator":["Role: Act as an experienced specialist in "+topic+".","Goal: Help me achieve a specific, measurable outcome.","Context: [Add audience, constraints and background].","Output: Provide a structured, actionable response.","Quality bar: State assumptions and ask clarifying questions when needed."], "hashtag-ideas": ["#"+slugify(topic),"#"+slugify(topic+"tips"),"#"+slugify(topic+"community"),"#learn"+titleCase(topic).replace(/\s/g,""),"#"+slugify("how to "+topic)], "video-script-outline":["Hook (0–5 sec): open with a clear promise about "+topic,"Context: explain why it matters","Main point 1: teach or demonstrate","Main point 2: show an example","Wrap-up: recap and invite action"], "interview-practice-questions":["Tell me about your experience with "+topic+".","Describe a challenge you solved related to "+topic+".","How do you prioritize when deadlines compete?","What would you improve about your current approach?"], "quiz-question-builder":["Define the central idea of "+topic+".","What is one practical example of "+topic+"?","Compare two important aspects of "+topic+".","What common misconception exists about "+topic+"?"], "essay-outline-builder":["Introduction and thesis about "+topic,"Background and key terms","Main argument 1 with evidence","Main argument 2 with evidence","Counterargument and response","Conclusion"], "flashcard-maker":topic.split(/\n/).filter(Boolean).map((line)=>"Q: "+line.split(/[:–-]/)[0]+"\nA: "+(line.split(/[:–-]/).slice(1).join("-").trim()||"Add a definition for this term.")), "meeting-agenda-maker":["Objective: "+topic,"Updates and context (5 min)","Discussion and decisions (15 min)","Owners and next actions (5 min)"], "meeting-notes-formatter":["## Summary",""+topic,"## Decisions","- [Add decision]","## Action items","- [Owner] — [Task] — [Due date]"], "study-notes-organizer":["## Topic: "+topic,"### Key ideas","- "+topic.split(/[.!?\n]/).filter(Boolean).slice(0,4).join("\n- "),"### Questions to review","- What is the main concept?","- How could it be applied?"], "regex-cheat-sheet":["Email-like pattern: ^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$","Digits: \\d+","Word boundary: \\bword\\b","Whitespace: \\s+","Start/end: ^pattern$"], "code-explainer":["Input received: "+topic,"Look for declarations, functions, control flow and data transformations.","Check edge cases, external dependencies and error handling.","This is a heuristic overview, not an AI-generated code review."], "youtube-description-builder":["[One-sentence video summary about "+topic+"]","","⏱️ Chapters","00:00 Introduction","00:30 Main topic","","🔗 Resources","[Add links]","","Subscribe for more and leave your questions below."], "swot-analysis-builder":["Strengths: internal advantages of "+topic,"Weaknesses: internal limitations to address","Opportunities: external openings to explore","Threats: external risks to monitor"] }; return (templates[slug] || ["Introduction: "+topic,"Main point: "+topic,"Next step: add detail and examples"]).join("\n"); }
    default: { const definition = getTool(slug); const lines = text.split(/[\n.!?;]+/).map((line) => line.trim()).filter(Boolean); if (definition?.mode === "ideas") return ["Starting point: " + text, "Angle 1: explain the problem and who it affects", "Angle 2: share a practical example", "Angle 3: offer a step-by-step solution", "Next step: choose one angle and add specific details."].join("\n"); if (definition?.mode === "checklist") return ["Goal: " + text, "☐ Define the desired outcome", "☐ Gather the relevant details", "☐ Identify risks or missing information", "☐ Complete the next action", "☐ Review and refine"].join("\n"); if (definition?.mode === "formatter") return lines.map((line) => "• " + line).join("\n"); if (definition?.mode === "json") { try { return JSON.stringify(JSON.parse(text), null, 2); } catch { return "Input is not valid JSON. Check commas, quotes, brackets and braces."; } } return lines.join("\n"); }
  }
}
function rgbToHsl(r:number,g:number,b:number) { const rr=r/255,gg=g/255,bb=b/255,max=Math.max(rr,gg,bb),min=Math.min(rr,gg,bb); let h=0,s=0; const l=(max+min)/2; if(max!==min){const d=max-min;s=l>.5?d/(2-max-min):d/(max+min);switch(max){case rr:h=(gg-bb)/d+(gg<bb?6:0);break;case gg:h=(bb-rr)/d+2;break;default:h=(rr-gg)/d+4;}h/=6;}return "hsl("+Math.round(h*360)+", "+Math.round(s*100)+"%, "+Math.round(l*100)+"%)"; }

async function extractVideoFrames(file: File): Promise<string[]> {
  if (file.size > 40 * 1024 * 1024) throw new Error("Please choose a video smaller than 40 MB.");
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.preload = "metadata";
  video.muted = true;
  video.src = url;
  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("This video could not be opened by your browser."));
    });
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 768 / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Video frame extraction is not supported in this browser.");
    const frames: string[] = [];
    for (const fraction of [0.1, 0.35, 0.6, 0.85]) {
      video.currentTime = Math.min(Math.max(0, video.duration * fraction), Math.max(0, video.duration - 0.1));
      await new Promise<void>((resolve, reject) => {
        video.onseeked = () => resolve();
        video.onerror = () => reject(new Error("Could not sample this video."));
      });
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      frames.push(canvas.toDataURL("image/jpeg", 0.72));
    }
    return frames;
  } finally {
    URL.revokeObjectURL(url);
    video.removeAttribute("src");
    video.load();
  }
}


async function removeFlatBackgroundLocally(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file.");
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Could not read this image."));
      element.src = url;
    });
    const scale = Math.min(1, 1200 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Canvas processing is not supported in this browser.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const { data, width, height } = context.getImageData(0, 0, canvas.width, canvas.height);
    const edge: number[][] = [];
    const step = Math.max(1, Math.floor(Math.max(width, height) / 80));
    for (let x = 0; x < width; x += step) {
      edge.push([data[x * 4], data[x * 4 + 1], data[x * 4 + 2]]);
      const bottom = ((height - 1) * width + x) * 4;
      edge.push([data[bottom], data[bottom + 1], data[bottom + 2]]);
    }
    for (let y = 0; y < height; y += step) {
      const left = y * width * 4, right = (y * width + width - 1) * 4;
      edge.push([data[left], data[left + 1], data[left + 2]], [data[right], data[right + 1], data[right + 2]]);
    }
    const background = [0, 1, 2].map((channel) => edge.map((pixel) => pixel[channel]).sort((a, b) => a - b)[Math.floor(edge.length / 2)]);
    const total = width * height, visited = new Uint8Array(total), queue = new Int32Array(total);
    let head = 0, tail = 0;
    const add = (index: number) => { if (!visited[index]) { visited[index] = 1; queue[tail++] = index; } };
    for (let x = 0; x < width; x++) { add(x); add((height - 1) * width + x); }
    for (let y = 1; y < height - 1; y++) { add(y * width); add(y * width + width - 1); }
    const threshold = 58;
    while (head < tail) {
      const index = queue[head++], p = index * 4;
      const distance = Math.hypot(data[p] - background[0], data[p + 1] - background[1], data[p + 2] - background[2]);
      if (distance > threshold) continue;
      data[p + 3] = distance < threshold * 0.72 ? 0 : Math.round(255 * (distance - threshold * 0.72) / (threshold * 0.28));
      const x = index % width, y = Math.floor(index / width);
      if (x > 0) add(index - 1);
      if (x < width - 1) add(index + 1);
      if (y > 0) add(index - width);
      if (y < height - 1) add(index + width);
    }
    context.putImageData(new ImageData(data, width, height), 0, 0);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Could not create the transparent PNG.")), "image/png"));
    return URL.createObjectURL(blob);
  } finally { URL.revokeObjectURL(url); }
}
async function inspectMediaLocally(file: File, slug: string): Promise<string> {
  if (slug === "ai-video-detector") {
    const frames = await extractVideoFrames(file);
    return "Local video inspection complete\\n\\nFile: " + file.name + "\\nSize: " + (file.size / 1024 / 1024).toFixed(2) + " MB\\nType: " + (file.type || "unknown") + "\\nFrames sampled: " + frames.length + "\\n\\nNo AI-generated-video classification is performed because that requires a trained detection model. This free local tool does not upload the video or claim an authenticity verdict.";
  }
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Could not read this image."));
      element.src = url;
    });
    const canvas = document.createElement("canvas"), scale = Math.min(1, 512 / Math.max(image.width, image.height));
    canvas.width = Math.max(1, Math.round(image.width * scale)); canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Canvas inspection is not supported.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let sum = 0, sumSquares = 0;
    for (let i = 0; i < pixels.length; i += 4) { const l = 0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2]; sum += l; sumSquares += l * l; }
    const count = pixels.length / 4, mean = sum / count, deviation = Math.sqrt(Math.max(0, sumSquares / count - mean * mean));
    return "Local image inspection complete\\n\\nFile: " + file.name + "\\nDimensions: " + image.width + " × " + image.height + " px\\nSize: " + (file.size / 1024).toFixed(1) + " KB\\nFormat: " + (file.type || "unknown") + "\\nAverage brightness: " + mean.toFixed(1) + " / 255\\nBrightness variation: " + deviation.toFixed(1) + " / 255\\n\\nThese are basic file and pixel statistics, not AI-image detection. They cannot determine whether an image was generated or edited by AI. No file was uploaded.";
  } finally { URL.revokeObjectURL(url); }
}
\nexport default function ToolPageClient({ slug, seo }: { slug: string; seo: ToolSeoContent }) {
  const [input, setInput] = useState("");
  const [option, setOption] = useState("default");
  const [output, setOutput] = useState("");
  const [imageInfo, setImageInfo] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const tool = useMemo(() => getTool(slug), [slug]);
  const usesAI = false; // All text tools use deterministic browser-local fallbacks; no paid AI provider is called.
  const isMediaTool = slug === "ai-image-detector" || slug === "ai-video-detector";
  const process = async () => {
    if (isProcessing) return;
    setIsProcessing(true); setOutput("");
    try {
      if (isMediaTool) {
        if (!selectedFile) throw new Error("Please choose a media file first.");
        setOutput(await inspectMediaLocally(selectedFile, slug));
      } else if (slug === "background-remover") {
        if (!selectedFile) throw new Error("Please choose an image first.");
        setOutput(await removeFlatBackgroundLocally(selectedFile));
      } else if (slug === "plagiarism-checker") {
        const response = await fetch("/api/tools/plagiarism", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ input }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Similarity check failed.");
        setOutput(data.output);
      } else if (slug === "dictionary") {
        const response = await fetch("/api/dictionary?word=" + encodeURIComponent(input.trim()));
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Dictionary lookup failed.");
        setOutput(data.output);
      } else setOutput(run(slug, input, option));
    } catch (error) { setOutput(error instanceof Error ? error.message : "The tool could not complete this request."); }
    finally { setIsProcessing(false); }
  };
  const onImage = (picked: File | null) => {
    setOutput("");
    setSelectedFile(picked);
    if (!picked) { setImageInfo(""); return; }
    if (slug === "ai-video-detector") { setImageInfo(picked.name + " · " + (picked.size / 1024 / 1024).toFixed(1) + " MB"); return; }
    const url = URL.createObjectURL(picked);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); setImageInfo(image.width+" × "+image.height+" px · "+(picked.size/1024).toFixed(1)+" KB"); if (slug === "image-dimension-checker") { setOutput("Image dimensions: "+image.width+" × "+image.height+" px\nFile size: "+(picked.size/1024).toFixed(1)+" KB\nFile type: "+(picked.type || "unknown")); } if (slug === "image-compressor") { const canvas = document.createElement("canvas"); canvas.width=image.width; canvas.height=image.height; const ctx=canvas.getContext("2d"); if (!ctx) return; ctx.drawImage(image,0,0); canvas.toBlob((blob)=>{ if (!blob) return; const resultUrl=URL.createObjectURL(blob); setOutput("Compressed image ready · "+(blob.size/1024).toFixed(1)+" KB · "+Math.round((1-blob.size/picked.size)*100)+"% size change. Use the download button below."); setImageInfo(image.width+" × "+image.height+" px · "+(picked.size/1024).toFixed(1)+" KB → "+(blob.size/1024).toFixed(1)+" KB"); setOutput(resultUrl); }, "image/jpeg", .78); } };
    image.onerror = () => { URL.revokeObjectURL(url); setImageInfo("Could not read this image file."); };
    image.src = url;
  };
  if (!tool) return <main className="tool-page-shell"><div className="tool-page-content"><p className="tool-eyebrow">AIToolss / Tool not found</p><h1 className="tool-page-title">We couldn’t find that tool.</h1><Link href="/" className="tool-primary-button">Back to all tools</Link></div></main>;
  const isImage = tool.mode === "image";
  const runDisabled = isImage ? !selectedFile : !input.trim();
  return <ToolDetailSections tool={tool} seo={seo}>
    <section className="tool-panel">
      <div className="tool-eyebrow">{tool.category} · Browser tool</div>
      {slug === "pomodoro-timer" ? <PomodoroTimer /> : <div className="tool-workspace">
        <label htmlFor="tool-input" className="tool-field-label">{isImage ? slug === "ai-video-detector" ? "Choose a video" : "Choose an image" : "Your input"}</label>
        {isImage
          ? <input id="tool-input" type="file" accept={slug === "ai-video-detector" ? "video/*" : slug === "background-remover" ? "image/png,image/jpeg" : "image/*"} onChange={(e)=>onImage(e.target.files?.[0]??null)} className="tool-file-input" />
          : <textarea id="tool-input" value={input} onChange={(e)=>setInput(e.target.value)} rows={8} placeholder="Paste text, enter a topic, or add values…" className="tool-input" />}
        {["text-summarizer"].includes(slug) && <label className="tool-option-label">Summary sentences <select value={option} onChange={(e)=>setOption(e.target.value)} className="tool-select"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="default">Automatic</option></select></label>}
        {["tone-changer","paragraph-rewriter","url-encoder-decoder","base64-encoder-decoder","html-entity-encoder","citation-generator"].includes(slug) && <label className="tool-option-label">Mode <select value={option} onChange={(e)=>setOption(e.target.value)} className="tool-select"><option value="default">Default / encode</option><option value="formal">Formal</option><option value="friendly">Friendly</option><option value="decode">Decode</option>{slug === "citation-generator" && <><option value="mla">MLA</option><option value="chicago">Chicago</option></>}</select></label>}
        {imageInfo && <p className="tool-image-info">{imageInfo}</p>}
        {slug === "plagiarism-checker" && <p className="rounded-xl border border-slate-200 p-3 text-sm">Paste the text to check, then add comparison material under a separate <strong>--- SOURCE ---</strong> line. This checks similarity only against the sources you provide; it does not search the whole web or academic databases.</p>}
        <div className="tool-actions">
          <button disabled={runDisabled || isProcessing || slug === "dictionary" && !input.trim()} onClick={process} className="tool-primary-button">{isProcessing ? "Processing…" : isImage ? "Process file" : usesAI ? "Generate with AI" : "Run tool"} ↗</button>
          <button onClick={()=>{setInput("");setOutput("");setImageInfo("");setSelectedFile(null);}} className="tool-secondary-button">Clear</button>
        </div>
      </div>}
      {output && <section className="tool-result">
        <div className="tool-result-heading"><h2>Result</h2>{!output.startsWith("blob:") && !output.startsWith("data:image/") && <button onClick={()=>navigator.clipboard.writeText(output)} className="tool-copy-button">Copy result</button>}</div>
        {output.startsWith("blob:") || output.startsWith("data:image/") ? <><img src={output} alt="Processed image preview" className="tool-output-image" /><a href={output} download={slug === "background-remover" ? "aitoolss-background-removed.png" : "aitoolss-compressed.jpg"} className="tool-download-link">Download processed image</a></> : <pre className="tool-output-text">{output}</pre>}
      </section>}
      <p className="tool-privacy-note">{isMediaTool ? "Free local inspection only: no AI authenticity model runs, and no file is uploaded. Metadata and frame patterns cannot prove whether media is AI-generated." : slug === "background-remover" ? "Runs locally in your browser. Best results are with a plain, evenly coloured background; complex scenes may leave artefacts. No image is uploaded." : slug === "plagiarism-checker" ? "Phrase matching runs on this site's server against only the sources you paste. No paid API or external plagiarism database is used." : "This utility runs locally in your browser and does not call a paid AI service. Generated text uses deterministic templates and is not an AI model response."}</p>
    </section>
  </ToolDetailSections>;
}
