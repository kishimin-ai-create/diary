---
name: frontend-architecture
description: "Hosting, rendering, and platform-level architecture choices for modern web frontends."
---

# Frontend Architecture

Use this skill when you need to choose a deployment model, rendering strategy, or hosting topology for a web frontend.

## Core Principles

- Start from business constraints: public vs private network, SEO needs, traffic shape, and operating model.
- Prefer the simplest architecture that still satisfies routing, security headers, deployment, and performance needs.
- Treat hosting and rendering as linked decisions; do not choose them independently.

## SPA Hosting Patterns

| Pattern | Best for | Strengths | Trade-offs |
|---|---|---|---|
| **CloudFront + S3** | Internet-facing SPA | Edge delivery, low ops, low cost, flexible response headers, SPA fallback support | Not suitable for closed/private-only delivery |
| **ALB + S3** | Limited cases needing private S3 access | Managed infrastructure | Direct S3 access overhead, limited header control, poor blue/green switching |
| **Load Balancer + Web Server** | Private or closed-network SPA | Private delivery, flexible headers, SPA fallback, blue/green via target group switch | Requires server operations |

### Recommendations

- For an **internet-facing SPA**, choose **CloudFront + S3**.
- For a **private / closed-network SPA**, choose **Load Balancer + Web Server**.
- Do **not** rely on S3 website hosting alone for production architecture when you need:
  - HTTPS by default
  - custom security headers
  - practical blue/green deployment

## SSR Hosting Patterns

| Pattern | Best for | Strengths | Trade-offs |
|---|---|---|---|
| **Node server (for example Fargate)** | Stable traffic, strong ops team, high runtime control | Fast response, environment parity, flexible build/deploy | Fixed cost, server operations, scaling design required |
| **FaaS (for example Lambda)** | Serverless-first systems, highly variable traffic | Fully managed, auto-scaling, usage-based pricing | Cold starts, environment differences, static assets should be offloaded to CDN/S3 |

### Recommendations

- Choose a **Node server** when reliability, runtime control, and operational readiness matter most.
- Choose **FaaS** when traffic is spiky or very low for long periods and serverless cost pressure is strong.
- For SSR static assets, combine SSR runtime with **CloudFront + S3** instead of serving everything from functions.

## Rendering Strategies

| Strategy | Use when | Benefits | Risks |
|---|---|---|---|
| **CSR** | Highly interactive apps, dashboards, complex internal tools | Simple delivery, strong client interactivity, cheap runtime | Slower first paint, weaker SEO, more client-side attack surface |
| **SSR** | SEO and fast first render are critical | Better initial paint, crawler-friendly HTML | Higher server cost, more server complexity |
| **Hybrid** | Different pages need different rendering modes | Optimizes per route or feature | More architecture and debugging complexity |
| **SSG / ISR** | Content changes infrequently | Excellent performance and low runtime cost | Not suitable for frequently changing data |

### Recommendations

- Choose **SSR** for consumer-facing pages where SEO and Core Web Vitals strongly matter.
- Choose **CSR** for business apps or highly interactive surfaces where development simplicity matters more.
- Choose **Hybrid rendering** only when the business value clearly outweighs the added maintenance cost.
- Choose **SSG/ISR** for documentation, marketing pages, product detail pages, and other low-change content.

## Practical Decision Guide

1. **Is the app private-only?**
   - Yes -> prefer **LB + Web Server** for SPA hosting.
   - No -> continue.
2. **Do you need SEO or the fastest first render?**
   - Yes -> consider **SSR**.
   - No -> continue.
3. **Is the app mostly interactive after login?**
   - Yes -> prefer **CSR**.
4. **Is content mostly static?**
   - Yes -> consider **SSG/ISR**.
5. **Do you have server operations capability?**
   - Yes -> **Node server SSR** is viable.
   - No -> consider **FaaS SSR**.

## Architecture Anti-Patterns

- Choosing SSR only because a framework makes it easy.
- Using hybrid rendering without clear route-level reasoning.
- Ignoring SPA fallback requirements for history-mode routing.
- Treating private delivery and response-header control as afterthoughts.
- Using production S3 website hosting when HTTPS and security headers are required.
