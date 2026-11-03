# Security Policy

## Reporting a vulnerability

Please report suspected vulnerabilities privately through GitHub’s private vulnerability reporting for this repository. Open the repository’s **Security** tab, choose **Report a vulnerability**, and include enough detail to reproduce the issue. Do not publish credentials, personal data, or a working exploit in a public issue or pull request.

Please include:

- The affected route, page, or component.
- Reproduction steps and the observed security impact.
- The smallest safe proof of concept, if needed.
- Any relevant browser, runtime, or deployment details.

## Scope

In scope are vulnerabilities in the Smart Bharat source and deployed application, including:

- Next.js pages, API routes, request validation, rate limiting, CORS, security headers, service-worker behavior, and certificate verification.
- Client-side storage and privacy behavior where it could expose data beyond the current browser.
- Secret handling, provider integrations, unsafe URL handling, cross-site scripting, injection, authentication/authorization gaps, and unintended data disclosure.
- Dependency vulnerabilities that have a concrete impact on this application.

Out of scope are provider outages, inaccurate third-party data, ordinary rate-limit exhaustion against the current in-memory limiter, social engineering, and reports that only describe missing features without a security impact.
