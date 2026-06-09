/**
 * Prompt for parsing a forwarded R4I application email (or any pasted
 * application text) into the R4I form schema.
 *
 * The enum codes below go straight into NeoSerra — they must match
 * src/components/roadmap/types.ts exactly. Update the EXTRACTION RULES
 * as real sample emails reveal new quirks; that's where parse quality lives.
 */

export const R4I_PARSE_SYSTEM = `You are a data-extraction assistant. You extract structured application data from raw email text.

Rules:
- Return ONLY a JSON object. No prose, no markdown fences.
- Omit any field that is not present in the text. Never invent values.
- Copy partial values verbatim rather than guessing the rest.`;

export function buildR4iParsePrompt(emailText: string): string {
  return `Extract the applicant's data from the email below into this JSON schema. Every key is optional — omit keys with no corresponding information.

SCHEMA (key — type / allowed values):
- firstName — string
- lastName — string
- email — string
- phone — string (digits only, e.g. "5105551234")
- title — one of: "OWN" | "CEO" | "PR" | "VPR" | "GM" | "PTR" | "SP" | "EMP"
  (Owner=OWN, CEO=CEO, President=PR, Vice President=VPR, General Manager=GM, Partner=PTR, Sole Proprietor=SP, Employee=EMP)
- companyName — string
- website — string
- streetAddress — string (street line only)
- city — string
- state — string (2-letter code, e.g. "CA")
- zipCode — string (5 digits)
- dateEstablished — string, formatted YYYY-MM-DD
- yearsInOperation — one of: "pre" | "<1" | "1-3" | "4-10" | "10+"
  (Not yet started=pre, Less than 1 year=<1, 1–3 years=1-3, 4–10 years=4-10, 10+ years=10+)
- productDescription — string (what they manufacture / their products)
- coachingInterests — array of: "lean" | "quality" | "cybersecurity" | "hr" | "food" | "financial" | "strategy"
  (Lean Operations=lean, Quality Systems=quality, Cybersecurity=cybersecurity, Human Resources / HR=hr, Food Market Development=food, Financial Advising=financial, Strategy & Leadership=strategy)
- groupCourses — array of: "strategic_planning" | "supply_chain"
  (Strategic Planning for Manufacturers=strategic_planning, Supply Chain Procurement Training=supply_chain)
- biggestChallenge — string (their #1 business challenge, verbatim)
- referralSource — one of: "sbdc" | "sba" | "calosba" | "CT" | "mep" | "industry" | "peer" | "web" | "social" | "event" | "other"
  (SBDC=sbdc, SBA=sba, CalOSBA=calosba, Roadmap 4 Innovation=CT, MEP Center=mep, Industry Association=industry, Peer / Business Owner=peer, Website / Online Search=web, Social Media=social, Event or Workshop=event, anything else=other)
- referralOther — string (only when referralSource is "other": the verbatim source)
- signature — string (the applicant's typed signature / full name from a signature field)
- privacyRelease — "Yes" | "No"

EXTRACTION RULES:
- A one-line address like "123 Main St, Oakland, CA 94601" splits into streetAddress="123 Main St", city="Oakland", state="CA", zipCode="94601".
- phone: strip all formatting — digits only.
- For enum fields, map the email's wording onto the closest allowed value; if nothing matches, omit the key (except referralSource, where unmatched sources become "other" with the verbatim text in referralOther).
- coachingInterests / groupCourses: the email may list these as labels, checkboxes, or comma-separated text — map each onto its code; skip items with no matching code.
- yearsInOperation: only set if the email states it (or an exact year count maps cleanly into a range). Do not compute it from dateEstablished.
- dateEstablished: normalize any date format to YYYY-MM-DD; if only a year is given, use YYYY-01-01.
- Job titles not in the list (e.g. "Founder", "Director of Ops"): pick the closest code (Founder → OWN); omit if genuinely ambiguous.
- privacyRelease: "Yes" only if the email clearly shows consent to a privacy/information release; "No" if it clearly declines; omit otherwise.
- Free-text fields (productDescription, biggestChallenge): copy the applicant's wording verbatim; do not summarize.

EMAIL TEXT:
<<<BEGIN EMAIL>>>
${emailText}
<<<END EMAIL>>>

Return the JSON object now.`;
}
