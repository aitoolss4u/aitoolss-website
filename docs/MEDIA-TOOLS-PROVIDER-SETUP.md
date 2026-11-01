# Media tools provider setup

The media tools now use real server-side provider calls. Keep all credentials server-only; never add a `NEXT_PUBLIC_` prefix.

## AI image and video assessment

- Configure `AI_GATEWAY_API_KEY`, or deploy on Vercel with AI Gateway OIDC available.
- `AI_VISION_MODEL` defaults to `alibaba/qwen3-vl-235b-a22b-instruct`, a vision-capable model ID listed by the AI Gateway model catalog. Override it only with a currently listed model that accepts image input.
- Video analysis samples four frames in the browser and asks the vision model to assess those frames. It does not upload the original video file.
- These are AI-assisted visual assessments, not forensic authenticity detectors. They cannot establish provenance or guarantee detection.

## Background removal

- Create a remove.bg API key and set `REMOVE_BG_API_KEY` in the Vercel project environment variables for Preview and Production.
- The integration calls `https://api.remove.bg/v1.0/removebg` and returns a transparent PNG.
- The provider's free allowance is limited and subject to its current account terms. Requests fail clearly when the key is missing or credits are exhausted.

## Plagiarism checker

- This is a local five-word phrase-overlap checker against comparison text supplied by the user.
- Paste the text to check, then add each source after a line containing `--- SOURCE ---`.
- It does not crawl the web or query academic/student-paper databases and must not be marketed as a comprehensive plagiarism scan.

## Verification

Run `npm run typecheck`, `npm run lint`, `npm run test:tools`, and `npm run build`. Then configure the environment variables and test each provider from a deployed Preview URL. No provider credentials are stored in this repository.
