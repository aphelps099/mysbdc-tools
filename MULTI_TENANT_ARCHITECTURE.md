# Multi-Tenant SBDC Platform — SSO + White-Label Architecture

**NorCal Small Business Development Center**
**Licensing & Multi-Network Expansion Strategy**

Last updated: February 2026

---

## Executive Summary

SBDC Advisor AI is currently deployed for the Northern California SBDC network. This document outlines the architecture for licensing the platform to other SBDC networks nationwide — each with SSO, isolated data, custom branding, and per-network RAG training.

The SBA funds ~63 SBDC networks covering 1,000+ centers. A multi-tenant SaaS model lets every network run a branded instance without managing infrastructure.

---

## 1. SSO / Identity Layer

**Recommended: WorkOS (or Auth0)**

SBDC networks are government-adjacent — many already use Microsoft Entra ID (Azure AD) or Google Workspace for staff identity. WorkOS provides SAML/OIDC enterprise SSO with a single integration point.

```
User → Network IdP (Azure AD / Google / Okta) → WorkOS → SBDC Advisor AI
                                                   ↓
                                            tenant_id + role claim in JWT
```

### How it works

| Component | Implementation |
|-----------|---------------|
| IdP per network | Each SBDC network connects their existing identity provider (Azure AD, Google Workspace, Okta) via WorkOS directory sync |
| SSO protocol | SAML 2.0 or OIDC — WorkOS normalizes both into a single callback |
| Role mapping | SSO claims map to app roles: `advisor`, `network-admin`, `regional-director` |
| Tenant resolution | Subdomain (`norcal.sbdcadvisor.ai`) or login email domain resolves the tenant before auth |
| Fallback | Networks without an IdP get email/password auth (current system) as a fallback |

### JWT structure (extended)

```json
{
  "sub": "user_abc123",
  "email": "advisor@norcalsbdc.org",
  "network_id": "norcal",
  "role": "advisor",
  "exp": 1740268800
}
```

---

## 2. Multi-Tenancy Architecture

**Row-level isolation, not separate databases.**

Separate databases per network become an operational nightmare at 60+ tenants. Instead, use a shared database with strict row-level isolation.

### Database changes

Add `network_id` to every table:

```sql
-- Every table gets a network_id column
ALTER TABLE token_usage ADD COLUMN network_id TEXT NOT NULL DEFAULT 'norcal';
ALTER TABLE sessions ADD COLUMN network_id TEXT NOT NULL DEFAULT 'norcal';

-- New networks table
CREATE TABLE networks (
    id TEXT PRIMARY KEY,               -- 'norcal', 'socal', 'florida'
    display_name TEXT NOT NULL,         -- 'NorCal SBDC'
    domain TEXT NOT NULL,              -- 'norcal.sbdcadvisor.ai'
    idp_connection_id TEXT,            -- WorkOS connection ID
    logo_url TEXT,
    brand_primary TEXT DEFAULT '#1D5AA7',
    brand_accent TEXT DEFAULT '#8FC5D9',
    brand_dark TEXT DEFAULT '#0f1c2e',
    created_at TIMESTAMP DEFAULT NOW(),
    plan TEXT DEFAULT 'starter'        -- 'starter', 'pro', 'enterprise'
);

-- Network users
CREATE TABLE network_users (
    id TEXT PRIMARY KEY,
    network_id TEXT REFERENCES networks(id),
    email TEXT NOT NULL,
    role TEXT DEFAULT 'advisor',       -- 'advisor', 'network-admin', 'regional-director'
    sso_id TEXT,                       -- WorkOS user ID
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Postgres RLS (if migrating from SQLite)

```sql
-- Row Level Security enforces isolation at the DB layer
ALTER TABLE token_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON token_usage
    USING (network_id = current_setting('app.current_network'));
```

### Tenant resolution flow

```
1. Request arrives at norcal.sbdcadvisor.ai
2. Middleware extracts subdomain → looks up network_id
3. Sets network context for the request
4. All queries automatically scoped to that network
5. RLS enforces even if app code has a bug
```

---

## 3. Per-Network RAG Training

This is the core product differentiator. Each network has different regional economic data, industry focus, state-specific compliance, and local SBA district relationships.

### Namespaced vector stores

```
ChromaDB collections (or Pinecone namespaces):

  sbdc_documents_norcal      ← NorCal's uploaded docs
  sbdc_documents_socal       ← SoCal's uploaded docs
  sbdc_documents_florida     ← Florida's uploaded docs
  sbdc_documents_shared      ← Federal SBA guidelines, 2 CFR, universal content
```

### RAG retrieval scoping

```python
# Current (single-tenant)
results = collection.query(query_texts=[query], n_results=4)

# Multi-tenant
results = collection_for(network_id).query(query_texts=[query], n_results=4)

# Merge with shared federal knowledge
shared_results = shared_collection.query(query_texts=[query], n_results=2)
context = results + shared_results
```

### What each network uploads

| Content type | Examples |
|-------------|----------|
| Regional playbooks | Intake procedures, advising frameworks specific to their network |
| Local compliance | State-specific regulations, licensing requirements |
| Success stories | Network's own client success stories for SBA reporting |
| Lender info | Regional lender relationships, loan products, SBA district contacts |
| Training materials | Onboarding docs, advisor certification resources |

### Shared federal knowledge base (maintained centrally)

- SBA Standard Operating Procedures
- 2 CFR 200/130 compliance guidance
- SBDC program announcements and policy updates
- Federal loan program details (7(a), 504, microloans)

---

## 4. White-Label / Theming

The current frontend already uses CSS custom properties, making per-tenant branding straightforward.

### Brand configuration

```json
{
  "id": "socal",
  "display_name": "SoCal SBDC",
  "logo_url": "/networks/socal/logo.svg",
  "brand": {
    "--p-navy": "#1a2744",
    "--p-royal": "#2563eb",
    "--p-accent": "#60a5fa",
    "--p-cream": "#faf9f6",
    "--p-brick": "#dc2626"
  },
  "fonts": {
    "--sans": "GT America, system-ui",
    "--serif": "Tobias, Georgia"
  }
}
```

### Runtime injection

```tsx
// Layout component reads network config, injects as CSS vars
<div style={networkBrandVars}>
  <App />
</div>
```

### Per-network customization

| Element | Customizable |
|---------|-------------|
| Logo | Yes — header and about page |
| Color palette | Yes — 5 brand tokens |
| Display name | Yes — header, about, footer |
| Contact info | Yes — about page |
| External links | Yes — network website, Prompt House instance |
| Prompt library | Partial — shared federal + network-specific prompts |

---

## 5. Licensing Model

| Tier | Includes | Pricing model |
|------|----------|---------------|
| **Starter** | SSO + shared prompt library + chat + events feed | Per-seat/month |
| **Pro** | + Custom RAG (upload network docs) + analytics dashboard + custom branding | Per-seat/month + storage fee |
| **Enterprise** | + Custom workflows + API access + dedicated support + SLA + custom integrations | Annual contract |

### Seat definitions

| Role | Counts as seat |
|------|---------------|
| Advisor | Yes |
| Network admin | Yes |
| Regional director | Yes |
| Client (if enabled) | Separate client pricing tier |

### Unit economics (rough)

- 63 SBDC networks x avg 15 advisors = ~950 potential seats
- At $50/seat/month (Pro tier): ~$570K ARR at full penetration
- Enterprise contracts for large networks (NY, CA, TX, FL): $25K-50K/year each

---

## 6. Infrastructure

### Single deployment, multi-tenant

```
                    ┌─────────────────────────────┐
                    │  Load Balancer / CDN         │
                    │  *.sbdcadvisor.ai            │
                    └──────────┬──────────────────┘
                               │
                    ┌──────────┴──────────────────┐
                    │  Next.js Frontend            │
                    │  (tenant context from        │
                    │   subdomain middleware)       │
                    └──────────┬──────────────────┘
                               │
                    ┌──────────┴──────────────────┐
                    │  FastAPI Backend              │
                    │  (network_id on every query) │
                    └──────────┬──────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
     ┌────────┴───┐   ┌───────┴──────┐  ┌──────┴──────┐
     │ PostgreSQL  │   │ ChromaDB     │  │ Redis       │
     │ (RLS)       │   │ (namespaced) │  │ (sessions)  │
     └─────────────┘   └──────────────┘  └─────────────┘
```

### Why not one instance per network

| Approach | Ops overhead | Cost | Data sharing |
|----------|-------------|------|-------------|
| Multi-tenant (recommended) | Low — single deploy | Low — shared infra | Easy — shared federal KB |
| Instance-per-network | High — 63 deploys | High — 63x infra | Hard — sync across instances |

### Data residency

Some networks may have data residency requirements. Options:
- Postgres schemas or partitioning for logical separation
- Regional read replicas if latency matters
- Separate ChromaDB instances per region (rare, only if required)

---

## 7. Migration Path from Current State

### Phase 1: Foundation (4-6 weeks)

- [ ] Add `networks` table and `network_id` foreign keys
- [ ] Migrate SQLite → PostgreSQL (required for RLS)
- [ ] Namespace ChromaDB collections
- [ ] Add subdomain middleware to Next.js
- [ ] Seed NorCal as the first tenant

### Phase 2: SSO (2-3 weeks)

- [ ] Integrate WorkOS SDK
- [ ] Configure NorCal's IdP as first connection
- [ ] Role mapping (advisor, admin, director)
- [ ] Keep password fallback for networks without IdP

### Phase 3: Admin Dashboard (3-4 weeks)

- [ ] Network admin panel: manage users, upload docs, customize branding
- [ ] Network onboarding wizard
- [ ] Usage/billing dashboard per network
- [ ] Prompt library management (shared vs. network-specific)

### Phase 4: Pilot (2-4 weeks)

- [ ] Onboard second network (target: SoCal SBDC or a smaller state)
- [ ] Validate isolation, branding, and RAG scoping
- [ ] Gather feedback, iterate

### Phase 5: Scale

- [ ] Sales motion to remaining SBDC networks
- [ ] Conference presentations (ASBDC, state conferences)
- [ ] SBA/ASBDC partnership for distribution

---

## 8. Security & Compliance

| Concern | Approach |
|---------|----------|
| Data isolation | Postgres RLS + namespaced vector stores — enforced at DB level |
| PII | Existing policy: no client PII in AI prompts. Enforced per-network |
| Audit logging | All LLM interactions logged per network with retention policies |
| SOC 2 | Required for enterprise tier — Railway + WorkOS both SOC 2 compliant |
| 2 CFR 200/130 | Existing compliance framework extends to all tenants |
| Encryption | TLS in transit, encryption at rest (Railway/Postgres default) |

---

## Contact

**Aaron Phelps**
Marketing & Technology Director
NorCal SBDC
[linkedin.com/in/aaroncphelps](https://linkedin.com/in/aaroncphelps)

---

*Copyright 2026 NorCal SBDC. All rights reserved.*
