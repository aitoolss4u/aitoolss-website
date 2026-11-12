# Tool execution, media processing and limitations

## AI text tools

Configured writing and productivity generators use the server-side `/api/tools/ai-generate` route and the Gemini API key stored in Vercel. AI Chatbot and AI Humanizer use their dedicated server routes. Inputs are sent to Google's Gemini API; do not submit confidential or sensitive information through the free tier. If the API key is missing, quota is exhausted or the provider fails, the UI reports an error instead of returning a canned result.

## Local deterministic tools

Word counting, reading-time estimates, calculations, JSON/CSV conversion, URL/Base64/HTML encoding, slug/filename cleaning, color conversions, timestamp parsing and password generation are deterministic browser-side utilities. They should always return results based on the supplied values and validate malformed inputs. These utilities do not need AI credentials.

## Background removal

The Background Remover uses `@bg0/browser` with BiRefNet segmentation running locally through WebGPU or WebAssembly. It produces a transparent PNG. The model is downloaded on the first use and cached by the browser; an internet connection is needed for that initial download. The selected image remains on-device and is not uploaded to AITOOLSS.

The package is Apache-2.0 and its pinned BiRefNet browser model exports are MIT-licensed according to BG0's third-party notices. Browser memory, GPU/CPU capabilities and image dimensions affect processing time. Errors must be surfaced clearly; never show an unprocessed source image as a successful cutout.

## Image and video inspection

The AI Image Detector / AI Video Detector tools currently perform local file, pixel and sampled-frame inspection only. They do not run a validated AI-authenticity classifier and cannot determine whether media was generated or manipulated by AI. Do not present an authenticity score or definitive verdict without an approved, validated model and evaluation.

## Image compression and dimensions

Image Compressor runs in the browser using canvas and allows output format and quality selection. The tool must report the actual resulting file size; some PNG or already-compressed files may become larger. Image Dimension Checker reads the selected image's decoded width and height locally.

## Plagiarism checker

The Plagiarism Checker compares five-word phrases against only the comparison sources the user pastes. Add each source after a line containing `--- SOURCE ---`. It does not crawl websites or query academic/student-paper databases; paraphrased copying may not be detected.

## Dictionary

The English dictionary lookup uses the public dictionaryapi.dev endpoint without an API key. It is a third-party service, so availability and rate limits are outside this site's control.

## Cost and privacy

No paid AI Gateway, remove.bg or per-run image-removal provider is required by the current configuration. Gemini free-tier usage is subject to Google's rate limits and data terms. Browser-local image tools do not upload the selected image. Review outputs before relying on them.
