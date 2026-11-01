# Free, local-first tools

The tool pages are designed to run without paid AI-provider credentials or per-request API charges.

## Text generation tools

Text utilities and writing helpers run in the browser using deterministic templates and transformations. They do not call Vercel AI Gateway and should not be described as responses from an AI model. Results are useful starting points and may need editing.

## Image and video inspection

The AI image/video detector pages provide local file and pixel/frame inspection only. They do not run an AI-authenticity classifier. Basic metadata, brightness and sampled frames cannot establish whether media was AI-generated or manipulated.

## Background removal

Background removal uses a browser canvas colour-similarity/flood-fill method. It works best with a plain, evenly coloured background. It is not semantic subject segmentation and may leave artefacts on complex scenes. Files remain in the browser.

## Plagiarism checker

This is a local five-word phrase-overlap checker against comparison text supplied by the user. Paste the text to check, then add each source after a line containing `--- SOURCE ---`. It does not crawl the web or query academic/student-paper databases; paraphrased copying may not be detected.

## Dictionary

The English dictionary lookup uses the public dictionaryapi.dev endpoint without an API key. It is a third-party public service, so availability and rate limits are outside this site's control.

## Cost and privacy

No paid AI Gateway, remove.bg, or other paid per-run provider is required for these tools. Browser-local tools do not upload the selected file. The plagiarism checker processes only the pasted text on this site's own server.