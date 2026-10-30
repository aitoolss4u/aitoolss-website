# Contact email configuration

The public contact form sends messages to `aitoolss4u@gmail.com` through the Resend email API.

Before delivery can work in a deployment:

1. Create or sign in to a Resend account.
2. Add and verify a sender domain in Resend. A sender address on that verified domain is required.
3. In the deployment project's server-side environment variables, set:
   - `RESEND_API_KEY`: the Resend API key (server-only; never use a `NEXT_PUBLIC_` prefix).
   - `CONTACT_FROM_EMAIL`: a sender such as `AIToolss Contact <contact@your-verified-domain.example>` using the domain verified in Resend.
4. Redeploy so the server route receives the new environment variables.

The recipient is fixed in `src/app/api/contact/route.ts` as `aitoolss4u@gmail.com`. The visitor's validated address is passed as Reply-To. The route returns a configuration error until both environment variables are present and reports provider failures without displaying a false success message.

The current rate limiter is process-local and is a lightweight abuse barrier, not a distributed rate-limiting service. For high-traffic production use, replace it with a shared rate-limit store or edge/WAF rule.
