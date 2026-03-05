Subject: Partnership Opportunity — Modernizing the SBDC Experience Together

---

Hi Collette,

I hope you're doing well. I'm Aaron Helps, and I lead the NorCal SBDC's technology initiatives. I wanted to reach out because we've been building some things on top of the Neoserra platform that I think you'd find interesting — and I'd love to explore how we might collaborate to push the platform forward for the entire SBDC network.

## What We've Built

Over the past year, we've developed an AI-powered tools layer that extends Neoserra's capabilities for our advisors and clients. A few highlights:

- **Multi-Program Application Wizards** — We built Typeform-style, multi-step intake forms for three programs (our Tech Futures Group accelerator, SBA Form 641 intake, and Roadmap for Innovation). These wizards handle everything from readiness scoring to pitch deck uploads to automatic Neoserra record creation — all without advisors touching the CRM directly.

- **Milestone Collection & Impact Dashboard** — Clients self-report milestones (jobs created, capital accessed, revenue growth) through a guided wizard. That data flows into Neoserra and powers a real-time Atlas dashboard our leadership uses for regional impact reporting.

- **AI Content Engine** — We integrated Claude (Anthropic's LLM) to generate brand-consistent email campaigns, social media posts, success stories, newsletter copy, and webpage content. Our advisors use a chat interface that understands our brand voice and produces publish-ready content in seconds.

The response from our team has been overwhelmingly positive. These tools have reduced intake processing time significantly and made impact reporting something that actually happens consistently.

## Where We Need the Platform to Go

As we've built this layer, we've run into limitations with the current API surface. There are two areas where new endpoints would be transformative — not just for us, but for every SBDC host in the network:

**1. 12-Month Aggregate Milestone Data**
We need the ability to pull milestone data in aggregate over a rolling 12-month period — filterable by milestone type (capital, jobs, revenue, new businesses) and by impact category. Right now, we're stitching this together manually. A purpose-built endpoint would let any SBDC host build dashboards, generate SBA reports, and tell their impact story with real data. Something like:

- `GET /api/milestones/aggregate?period=12m&type=capital_accessed&center_id=...`
- Breakdowns by type, time period, and region
- Summary statistics (totals, averages, trends)

**2. Training Management Endpoints**
The training side of the platform is an area with massive untapped potential. We'd love to see endpoints for:

- **Registration** — Create/read/update training registrations, with filtering by program, date range, and status
- **Attendance** — Record and retrieve attendance data, completion rates, and no-show tracking
- **Reporting** — Aggregate training metrics (registrations vs. attendance, popular topics, advisor workload)

This data is critical for SBA reporting, and right now there's no clean programmatic way to work with it.

## The Bigger Picture

I'm sharing all of this because I genuinely believe the SBDC network is at an inflection point. The centers that modernize their client experience — with AI-powered intake, self-service milestone reporting, and real-time dashboards — are going to dramatically outperform those that don't. And the platform that powers that modernization has an enormous opportunity.

We've proven the concept here at NorCal. Our AI layer works. Our advisors love it. Our clients have a better experience. But we built it despite the API limitations, not because the platform made it easy.

I'd love to have a conversation about:

1. **Your API roadmap** — Are aggregate milestones and training endpoints on the horizon?
2. **AI-native features** — How is Outreach Systems thinking about AI capabilities within the platform itself? There's a huge opportunity for embedded AI (smart intake, automated milestone follow-ups, content generation) that SBDCs would adopt immediately.
3. **Partnership** — We've learned a lot building this layer. I'd be happy to share our architecture, user feedback, and feature priorities to help inform your product roadmap.

The SBDCs need a platform that keeps pace with what's possible today. I think together we can define what that looks like.

Would you be open to a 30-minute call in the next couple of weeks? I'd love to show you a demo and talk through where we see this going.

Best regards,
Aaron Helps
NorCal SBDC
