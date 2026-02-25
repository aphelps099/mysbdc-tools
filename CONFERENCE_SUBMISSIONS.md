# America's SBDC 2026 — Call for Papers Submissions

**Deadline:** March 6, 2026 
**Presenter:** Aaron Phelps, Marketing & Technology Director, NorCal SBDC
**Session Type:** Lecture (both proposals)

---

## PROPOSAL 1 — Center Operations Pathway

**Focus Area:** Programs to Improve SBDC Operations

### Session Title (10 words max)

**Building an AI Advisor Platform to Scale SBDC Operations**

### Session Description (400 words max)

SBDC advisors are stretched thin. With growing caseloads, reporting requirements, and client expectations, centers need tools that multiply human capacity without compromising compliance or quality. This session presents SBDC Advisor AI — a purpose-built platform developed at the NorCal SBDC that puts secure, compliant AI directly into advisors' daily workflows.

Unlike generic AI tools, SBDC Advisor AI was designed around how advisors actually work. It integrates with Neoserra CRM for instant client and contact lookups, pulls live training events from your website, and includes a library of 50+ curated prompt templates covering the tasks advisors perform most: drafting session notes, writing impact narratives, preparing quarterly reports, generating marketing copy for events, and building business plans.

The platform's signature feature is its guided workflow engine. The Success Story Builder, for example, walks advisors step-by-step through turning raw client data into publish-ready impact stories — automatically classifying them by tier (Signature, Growth, or Community Spotlight) and scoring them against five reporting criteria. What used to take hours now takes minutes, and the output is consistent and SBA-ready.

Compliance is built into the foundation, not bolted on. The system enforces federal grant requirements (2 CFR 200/130), prevents PII from being echoed in responses, automatically appends compliance disclaimers when conversations touch sensitive topics, and clearly defines approved versus prohibited AI uses. Advisors can focus on their clients, not on second-guessing whether they're using AI safely.

The platform also supports document-augmented retrieval (RAG), letting centers upload their own policies, templates, and training materials so that AI responses draw on center-specific knowledge — not just general internet data.

In this session, you'll see the platform in action through a live demonstration covering the chat interface, prompt composer, workflow engine, events feed, and Neoserra integration. We'll share adoption results from the NorCal network's 18 centers, discuss practical lessons learned during rollout, and outline a realistic path for other SBDCs to build or adapt similar tools. You'll leave with a clear understanding of what's possible, what's practical, and what to watch out for when bringing AI into center operations.

This isn't a pitch for a product — it's a playbook from one SBDC to another.

### Learning Objectives (up to 4)

1. **Following this session, attendees will be able to** identify specific SBDC workflows — session notes, impact narratives, event promotion, and client research — where AI tools can save advisors measurable time each week.

2. **Following this session, attendees will be able to** explain the compliance guardrails required to use AI safely within federal grant programs, including PII handling, 2 CFR requirements, and approved-use policies.

3. **Following this session, attendees will be able to** evaluate whether a purpose-built AI platform or a general-purpose tool (like ChatGPT Teams) better fits their center's operational needs and technical capacity.

4. **Attendees will leave this session with** a practical framework for scoping, building, and rolling out AI tools within their own SBDC — including integration points with Neoserra and existing WordPress infrastructure.

### Agenda (60 minutes)

| Time | Activity |
|------|----------|
| 0:00–5:00 | **Opening & Context** — The advisor capacity problem: caseload growth vs. staffing reality across the SBDC network. Why general-purpose AI isn't enough. |
| 5:00–10:00 | **Platform Overview** — Architecture at a glance: what it does, how it's built, how it fits into an advisor's day. |
| 10:00–25:00 | **Live Demo: Core Workflows** — Chat interface with streaming AI, prompt composer (filling templates with client context), Success Story Builder workflow (raw data → SBA-ready narrative), and compliance guardrails in action. |
| 25:00–32:00 | **Live Demo: Integrations** — Neoserra CRM search and client lookup, live events feed with AI-generated promo copy, document upload and RAG-powered responses. |
| 32:00–38:00 | **Adoption Results** — Usage data from NorCal's 18 centers: what's working, what surprised us, and where advisors pushed back. |
| 38:00–43:00 | **Build vs. Buy** — Honest comparison: purpose-built platform vs. ChatGPT Teams vs. other off-the-shelf tools. When each makes sense. |
| 43:00–48:00 | **Playbook for Your Center** — Steps to scope, pilot, and scale AI tools at your SBDC. Key decisions: hosting, LLM provider, compliance review, stakeholder buy-in. |
| 48:00–55:00 | **Q&A** — Open discussion. |
| 55:00–60:00 | **Session Survey** — Complete evaluation before exiting. |

---

## PROPOSAL 2 — Technology & Specialized Pathway

**Focus Area:** Innovation and Technology

### Session Title (10 words max)

**From Prompt to Platform: Engineering Compliant AI for SBDCs**

### Session Description (400 words max)

Most SBDCs experimenting with AI start the same way: someone opens ChatGPT, types a question, and gets a surprisingly useful answer. But moving from casual experimentation to a secure, compliant, production-grade AI platform is a different challenge entirely — one that involves architecture decisions, compliance engineering, data integration, and user experience design that most centers aren't staffed to tackle.

This session walks through the technical journey of building SBDC Advisor AI, a full-stack platform developed at the NorCal SBDC that combines real-time LLM streaming, retrieval-augmented generation (RAG), multi-step workflow automation, CRM integration, and federal compliance enforcement into a single tool purpose-built for business advisors.

We'll cover the architecture in plain language: a Next.js frontend with server-sent event streaming, a FastAPI backend orchestrating OpenAI (with Ollama as a local fallback), ChromaDB for vector-based document retrieval, and SQLite for privacy-respecting analytics. You'll see how the system prompt — over 300 lines of SBDC-specific context including network data, program descriptions, compliance rules, and voice guidelines — transforms a general-purpose LLM into a knowledgeable SBDC colleague.

The technical heart of the session focuses on three engineering problems every SBDC will face when building AI tools. First, compliance at the model layer: how we enforce PII echo prevention, automatic compliance footers triggered by 25+ keyword patterns, and clear approved/prohibited boundaries — all without relying on advisors to remember the rules. Second, retrieval-augmented generation: how centers can upload their own documents and have AI responses grounded in local knowledge rather than generic training data. Third, workflow orchestration: how the Success Story Builder guides advisors through multi-step processes with state tracking, intelligent follow-up questions, and tier-based scoring — turning unstructured input into formatted, SBA-ready output.

We'll also cover practical infrastructure: hosting on Railway, JWT authentication, Neoserra API integration for CRM data, WordPress REST API integration for live events, and token usage logging for cost monitoring — all while never logging prompt content.

This session is designed for SBDC technology leads, center directors evaluating AI investments, and anyone who has wondered what it actually takes to move from "we use ChatGPT sometimes" to "we have a platform." No coding experience required — the goal is architectural literacy, not syntax.

### Learning Objectives (up to 4)

1. **Following this session, attendees will be able to** describe the core components of a production AI platform for SBDCs — LLM orchestration, retrieval-augmented generation, workflow automation, and CRM integration — and how they work together.

2. **Following this session, attendees will be able to** implement compliance guardrails at the model layer, including PII echo prevention, automatic compliance footers, and approved-use policy enforcement aligned with 2 CFR requirements.

3. **Following this session, attendees will be able to** evaluate hosting, LLM provider, and data architecture options for AI platforms — including cost, privacy, and scalability tradeoffs between cloud (OpenAI/Railway) and local (Ollama) deployments.

4. **Attendees will leave this session with** an understanding of how to connect AI tools to existing SBDC infrastructure (Neoserra, WordPress, Google Sheets) using API integrations, and where those integrations deliver the most value.

### Agenda (60 minutes)

| Time | Activity |
|------|----------|
| 0:00–5:00 | **Opening** — The gap between "using ChatGPT" and "having a platform." What it took, what we learned. |
| 5:00–12:00 | **Architecture Overview** — Full-stack walkthrough: Next.js + FastAPI + OpenAI + ChromaDB + SQLite. How the pieces connect. The 300-line system prompt that makes it SBDC-aware. |
| 12:00–22:00 | **Deep Dive: Compliance Engineering** — PII echo prevention, keyword-triggered compliance footers, approved/prohibited use enforcement, 2 CFR alignment. Live demo showing guardrails activating in real time. |
| 22:00–30:00 | **Deep Dive: RAG & Document Intelligence** — How document upload, chunking, embedding, and vector retrieval work. Demo: uploading a center policy doc and seeing it influence AI responses. |
| 30:00–38:00 | **Deep Dive: Workflow Orchestration** — Success Story Builder walkthrough: multi-step state tracking, intelligent questioning, tier scoring, formatted output. How to define new workflows in JSON. |
| 38:00–43:00 | **Integrations & Infrastructure** — Neoserra API, WordPress events, Google Sheets bridge, Railway hosting, JWT auth, token usage monitoring. |
| 43:00–48:00 | **Build Decisions** — OpenAI vs. Ollama, cloud vs. local, cost realities (token pricing), privacy tradeoffs. What we'd do differently. |
| 48:00–55:00 | **Q&A** — Open discussion. |
| 55:00–60:00 | **Session Survey** — Complete evaluation before exiting. |

---

## PROPOSAL 3 — Center Operations Pathway

**Focus Area:** Programs to Improve SBDC Operations

### Session Title (10 words max)

**Brand in a Box: Building a Self-Service SBDC Brand System**

### Session Description (400 words max)

Most SBDCs manage their brand the same way: a shared Google Drive folder with outdated logos, a color palette someone remembers, and event fliers that look different every time. When you're running lean — a handful of staff across multiple centers — marketing consistency feels like a luxury. But inconsistent branding doesn't just look unprofessional; it undermines the credibility that makes clients and stakeholders trust your program.

This session presents a different approach. At NorCal SBDC's Tech Futures Group, we built a complete brand operations system — what we call the Brand House — that puts every asset, guideline, and content creation tool into a single interactive hub our team can use without a designer, agency, or expensive SaaS subscription.

The Brand House is a self-service brand portal that includes logo usage rules with live examples across light and dark backgrounds, a clickable color palette (click a swatch, copy the hex code), typography specimens showing exactly how to pair headline, body, and label fonts, and a pattern generator that creates custom brand graphics on demand. Below the guidelines sits a full asset library organized by category — social templates, event graphics, email templates, one-pagers, business cards, marketing campaigns, and an impact report — each one clickable and previewable without downloading a single file.

But guidelines alone don't solve the production bottleneck. That's why we also built the Animation Studio — a browser-based content creation tool with 15 pre-designed social media templates covering hero posts, stat callouts, founder stories, testimonial quotes, and campaign closers. Staff select a template, choose a size (square, portrait, or landscape), and export a print-ready PNG with one click. Each template includes a pre-written LinkedIn caption. Batch export produces all 15 posts in under a minute.

Everything runs in the browser. No Canva subscription, no Adobe license, no design skills required. The entire system is built with standard HTML, CSS, and JavaScript — technology every SBDC already has access to.

In this session, you'll see both tools in action through live demonstrations. We'll walk through how we structured the brand strategy, translated it into an interactive system, and deployed it across our team. You'll leave with a replicable framework for building your own brand operations hub — and a clear understanding of how small teams can produce agency-quality content at scale.

This is a playbook, not a pitch. If your team can open a web browser, they can run this system.

### Learning Objectives (up to 4)

1. **Following this session, attendees will be able to** identify the core components of a self-service brand system — guidelines, asset library, and content creation tools — and assess which gaps exist in their own center's marketing operations.

2. **Following this session, attendees will be able to** explain how interactive brand portals reduce dependency on external designers and improve content consistency across multi-center SBDC networks.

3. **Following this session, attendees will be able to** evaluate whether browser-based content tools (built with HTML/CSS/JS) can replace paid design subscriptions like Canva or Adobe for their center's most common marketing needs.

4. **Attendees will leave this session with** a practical framework for building a brand operations hub — including how to structure asset libraries, create templated content systems, and deploy them to non-technical staff without training overhead.

### Agenda (60 minutes)

| Time | Activity |
|------|----------|
| 0:00–5:00 | **Opening & Problem** — The SBDC branding problem: inconsistent assets, scattered files, designer dependency. What it costs in credibility and staff time. |
| 5:00–12:00 | **Brand Strategy Foundation** — How we built TFG's brand architecture: positioning, voice, visual identity system. The decisions that make everything downstream possible. |
| 12:00–22:00 | **Live Demo: The Brand House** — Interactive walkthrough: logo usage gallery, clickable color palette, typography specimens, pattern generator, and the full asset library (social templates, event graphics, emails, one-pagers, marketing campaigns). |
| 22:00–32:00 | **Live Demo: Animation Studio** — Content creation in action: selecting templates, switching sizes, exporting PNGs, copying captions. Batch export of all 15 posts. How non-designers produce agency-quality social content in minutes. |
| 32:00–38:00 | **Technical Approach** — How it's built: standard HTML/CSS/JS, no dependencies, runs in any browser. Why we chose this over Canva, Figma, or custom apps. Cost: $0. |
| 38:00–44:00 | **Results & Adoption** — Before-and-after: content production speed, brand consistency, team confidence. How staff who "aren't designers" became the marketing team. |
| 44:00–50:00 | **Build Your Own** — Step-by-step framework: audit your current brand assets, define your visual system, structure your asset library, create your first template set. What to prioritize when resources are limited. |
| 50:00–55:00 | **Q&A** — Open discussion. |
| 55:00–60:00 | **Session Survey** — Complete evaluation before exiting. |

---

## PROPOSAL 4 — Center Operations Pathway

**Focus Area:** Programs to Improve SBDC Operations

### Session Title (10 words max)

**MySBDC: Replacing 18 Websites With One Unified Client Portal**

### Session Description (400 words max)

Most SBDCs run on fragmented infrastructure — a patchwork of separate websites, redundant logins, manual intake routing, and newsletters assembled by hand. When a client visits one center's website, they have no idea they're part of a broader network. When they move across the region, they start over. And behind the scenes, staff spend hours on busywork that technology should handle.

This session presents MySBDC — a unified client portal developed at the NorCal SBDC that consolidates 18 regional center websites into a single, locally-aware platform. The architecture follows one rule: one login, one intake, one dashboard. Everything else is automated.

The system begins with a Smart 641 Intake — a 7-step autosaving wizard that uses SSO to pre-populate fields and conditional logic to suppress irrelevant questions. Completion time drops to 4–7 minutes. Upon submission, a readiness scoring algorithm (0–100) automatically routes clients: those scoring 60 or above land on the Advising-Ready track with an auto-paired advisor and a concierge welcome call; those below 60 enter a self-serve Training-First track to build readiness before unlocking advisor access. Fast-Track Overrides — urgent capital needs, active LOI, launching within 90 days — bypass scoring entirely.

Post-intake, clients land on the MySBDC Business Tracker — a personal dashboard built for doing, not browsing. A dynamic "Next Step" card surfaces a single clear action. Milestone logging (Funding, Hire, Revenue) takes under 60 seconds through TurboTax-style forms and feeds directly into the Success Atlas — a public-facing impact map that gives directors and SBA real-time KPI visibility without quarterly report assembly.

Behind the scenes, the platform orchestrates five core APIs under a strict "one source of truth per data type" rule. Neoserra masters client records and events. LearnWorlds handles on-demand courses via SSO. Zoom manages live registrations and attendance sync. Constant Contact assembles center-specific newsletters automatically from Neoserra event feeds. Stripe processes paid event registrations with webhook-triggered enrollment.

The operational impact is measurable: a projected 40% reduction in administrative hours, $182,000 in annual savings across the network, and a 3x increase in milestone reporting velocity. Geolocation ensures every client sees their local center first, while a "Nearby Today" traveler safeguard prevents temporary GPS data from corrupting permanent profiles.

In this session, you'll see the full client journey — from first Google search to year-one milestones — demonstrated live. We'll share the API architecture, routing logic, and implementation roadmap. You'll leave with a framework for building your own unified portal.

One SBDC sharing what works. No vendor required.

### Learning Objectives (up to 4)

1. **Following this session, attendees will be able to** identify the key components of a unified SBDC client portal — SSO, smart intake routing, automated dashboards, and API orchestration — and assess which capabilities would deliver the most value for their own network.

2. **Following this session, attendees will be able to** explain how automated intake scoring and routing (advising-ready vs. training-first tracks) can reduce advisor bottlenecks and ensure clients reach the right resources faster.

3. **Following this session, attendees will be able to** evaluate API integration strategies for connecting Neoserra, Zoom, Constant Contact, and LMS platforms into a single source-of-truth architecture that eliminates redundant data entry.

4. **Attendees will leave this session with** a practical implementation roadmap — including phased rollout steps, geolocation design, and newsletter automation — that they can adapt for their own multi-center SBDC network.

### Agenda (60 minutes)

| Time | Activity |
|------|----------|
| 0:00–5:00 | **Opening & Problem** — The fragmentation tax: what 18 separate websites, redundant intakes, and manual newsletters actually cost in staff hours, client friction, and data integrity. |
| 5:00–12:00 | **Platform Overview** — The "one login, one 641, one dashboard" architecture. How geolocation, SSO, and API orchestration create a unified experience that still feels local. |
| 12:00–22:00 | **Live Demo: Smart 641 & Automated Routing** — The 7-step intake wizard in action: conditional logic, readiness scoring, Fast-Track Overrides, and real-time routing to Advising-Ready or Training-First tracks. |
| 22:00–32:00 | **Live Demo: Business Tracker & Success Atlas** — The client dashboard: dynamic Next Step card, one-click registration, milestone logging, and how client wins feed the public-facing impact map in real time. |
| 32:00–40:00 | **API Architecture** — Five integrations, one source of truth: Neoserra, LearnWorlds, Zoom, Constant Contact, and Stripe. How "newsletters that build themselves" actually work. |
| 40:00–46:00 | **Operational Impact** — The numbers: 40% admin hour reduction, $182K annual savings, 3x milestone velocity. What we measured and how. |
| 46:00–52:00 | **Implementation Roadmap** — Five phases from foundation to full migration. Hosting, SSO provider selection, pilot center strategy, and SEO preservation through 301 mapping. |
| 52:00–57:00 | **Q&A** — Open discussion. |
| 57:00–60:00 | **Session Survey** — Complete evaluation before exiting. |

---

## PRESENTER BIO — Aaron Phelps (300 words max)

Aaron Phelps is Marketing & Technology Director for the Northern California Small Business Development Center (NorCal SBDC), where he leads digital strategy, brand communications, and AI integration across a network of 18 centers serving entrepreneurs in 36 Northern California counties.

A strategic marketing executive with over 15 years driving digital transformation and growth across small businesses, startups, and enterprises, Aaron brings a rare combination of creative and technical skill to the SBDC network. His background spans brand strategy, UX/UI design, full-stack software development, and AI-powered solution design — experience built across roles at agencies, startups, and higher education before joining the SBDC. He studied at the University of Missouri–Kansas City and has since built a career defined by helping organizations unlock new opportunities through technology.

At NorCal SBDC, Aaron designed and built SBDC Advisor AI — a full-stack conversational AI platform purpose-built for business advisors. The platform combines real-time language model streaming, document-augmented retrieval, compliance enforcement, and Neoserra CRM integration into a single tool. It includes 50+ curated prompt templates, guided workflows for SBA impact reporting, live event integration, and privacy-first analytics — enabling advisors across the network to work faster without compromising federal compliance standards.

Aaron's approach to AI in the SBDC centers on a core principle: technology should multiply human expertise, not replace it. His work embeds compliance guardrails — PII protection, 2 CFR alignment, and approved-use policies — directly into the AI layer, so advisors can focus on their clients rather than second-guessing the technology.

His work contributes to a network that secured $549 million in capital, created 3,723 jobs, and started 712 businesses in FY 2025 — serving a client base that is 52% women-owned, 48% minority-owned, and 7% veteran-owned. Aaron is committed to sharing practical, people-first approaches that other SBDCs can adapt for their own networks.

---

*Submission deadline: March 6, 2026*
*Event dates: September 28–29, 2026*
