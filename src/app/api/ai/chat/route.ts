import { NextRequest } from 'next/server';
import { CHAT_SYSTEM_LOCKED, CHAT_SYSTEM_UNLOCKED } from '@/lib/prompts/chat';
import {
  resolveCenterId,
  fetchRecentEvents,
  fetchAttendees,
  fetchTrainers,
  fetchMilestoneLog,
  anonymizeMilestone,
  fetchImpactData,
} from '@/lib/neoserra';

export const dynamic = 'force-dynamic';

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 2048;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;
const MAX_TOOL_ROUNDS = 3; // Safety limit on tool use loops

// ── Types ──

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string | ContentBlock[];
}

interface FileContext {
  name: string;
  content: string;
}

interface ChatRequestBody {
  messages: ChatMessage[];
  unlocked?: boolean;
  fileContext?: FileContext[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ContentBlock = any;

// ── Tool definitions ──

const CHAT_TOOLS = [
  {
    name: 'get_recent_trainings',
    description:
      'Get training events from the last N days, optionally filtered by center. Returns event list with IDs, titles, dates, topics, and aggregate attendance.',
    input_schema: {
      type: 'object' as const,
      properties: {
        center_name: {
          type: 'string',
          description:
            'Center name like "Butte", "NorCal", "Sacramento", "Shasta", etc. If omitted, returns events across all centers.',
        },
        days: {
          type: 'number',
          description: 'Number of days to look back. Default 30.',
        },
      },
    },
  },
  {
    name: 'get_event_attendees',
    description:
      'Get the full attendee roster for a specific training event, including each person\'s registration/attendance status (R=Registered, A=Attended, N=No-show, C=Canceled, W=Waitlisted, etc.).',
    input_schema: {
      type: 'object' as const,
      properties: {
        conference_id: {
          type: 'string',
          description: 'The training event conference ID (from get_recent_trainings results).',
        },
      },
      required: ['conference_id'],
    },
  },
  {
    name: 'get_event_trainers',
    description: 'Get the instructors/presenters for a specific training event.',
    input_schema: {
      type: 'object' as const,
      properties: {
        conference_id: {
          type: 'string',
          description: 'The training event conference ID.',
        },
      },
      required: ['conference_id'],
    },
  },
  {
    name: 'get_milestone_spotlight',
    description:
      'Get recent anonymized milestone submissions to generate success story spotlights. Returns milestone categories (jobs created, funding secured, sales growth, business started) by center — all client PII is stripped. Use when users ask for success stories, spotlights, recent wins, or want to celebrate impact.',
    input_schema: {
      type: 'object' as const,
      properties: {
        days: {
          type: 'number',
          description: 'Number of days to look back. Default 7.',
        },
      },
    },
  },
  {
    name: 'get_impact_snapshot',
    description:
      'Get live NorCal SBDC impact metrics — capital accessed, jobs created, businesses started, revenue growth. Includes per-center breakdowns. Use when users ask about impact, performance, numbers, or want talking points, social posts, or board report content with real data.',
    input_schema: {
      type: 'object' as const,
      properties: {
        period: {
          type: 'string',
          enum: ['this_month', 'quarter', 'ytd', 'all_time'],
          description: 'Time period for impact data. Default: this_month.',
        },
      },
    },
  },
];

// ── Tool execution ──

async function executeTool(
  name: string,
  input: Record<string, unknown>,
): Promise<string> {
  try {
    switch (name) {
      case 'get_recent_trainings': {
        const centerName = input.center_name as string | undefined;
        const days = (input.days as number) || 30;
        let centerId: string | undefined;

        if (centerName) {
          centerId = resolveCenterId(centerName);
          if (!centerId) {
            return JSON.stringify({
              error: `Could not resolve center name "${centerName}". Known centers: NorCal (LEAD), Butte, Capital Region, Central Coast, Contra Costa, Gavilan, Greater Sacramento, Humboldt, Lake County, Marin, Mendocino WBC, Napa-Sonoma, North Coast, San Joaquin, San Mateo, Santa Cruz, Shasta, Silicon Valley, Solano, Yolo.`,
            });
          }
        }

        const events = await fetchRecentEvents(centerId, days);
        return JSON.stringify({
          count: events.length,
          days,
          centerId: centerId || 'all',
          centerName: centerName || 'all centers',
          events: events.map((e) => ({
            conference: e.conference,
            title: e.title,
            startDate: e.startDate,
            endDate: e.endDate,
            hours: e.hours,
            topics: e.topics,
            topic: e.topic,
            format: e.format,
            attTot: e.attTot,
            noshowTot: e.noshowTot,
            status: e.confstatus,
            city: e.locCity,
          })),
        });
      }

      case 'get_event_attendees': {
        const conferenceId = input.conference_id as string;
        const attendees = await fetchAttendees(conferenceId);
        return JSON.stringify({
          conferenceId,
          count: attendees.length,
          attendees: attendees.map((a) => ({
            first: a.first,
            last: a.last,
            email: a.email,
            status: a.status,
            presence: a.presence,
            entry: a.entry,
          })),
        });
      }

      case 'get_event_trainers': {
        const conferenceId = input.conference_id as string;
        const trainers = await fetchTrainers(conferenceId);
        return JSON.stringify({
          conferenceId,
          count: trainers.length,
          trainers: trainers.map((t) => ({
            first: t.first,
            last: t.last,
            role: t.role,
          })),
        });
      }

      case 'get_milestone_spotlight': {
        const days = (input.days as number) || 7;
        const entries = await fetchMilestoneLog(days);
        const anonymized = entries.map(anonymizeMilestone);
        return JSON.stringify({
          count: anonymized.length,
          days,
          note: 'All client PII has been stripped. Use center name + category only when writing about these milestones.',
          milestones: anonymized,
        });
      }

      case 'get_impact_snapshot': {
        const period = (input.period as string) || 'this_month';
        const impact = await fetchImpactData(period);
        return JSON.stringify({
          period: impact.period,
          since: impact.since,
          capital_accessed: impact.capital_accessed,
          jobs_created: impact.jobs_created,
          jobs_ft: impact.jobs_ft,
          jobs_pt: impact.jobs_pt,
          businesses_started: impact.businesses_started,
          revenue_growth: impact.revenue_growth,
          total_submissions: impact.total_submissions,
          by_center: impact.by_center,
          recent_activity_count: impact.recent.length,
        });
      }

      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[chat] Tool ${name} failed: ${msg}`);
    return JSON.stringify({ error: `Tool execution failed: ${msg}` });
  }
}

// ── Anthropic API helpers ──

function anthropicHeaders(apiKey: string) {
  return {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
  };
}

/** Make a non-streaming Anthropic call (for tool use detection). */
async function anthropicCall(
  apiKey: string,
  system: string,
  messages: ContentBlock[],
  attempt = 0,
): Promise<{ ok: true; data: ContentBlock } | { ok: false; error: string; status: number }> {
  try {
    const res = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: anthropicHeaders(apiKey),
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system,
        tools: CHAT_TOOLS,
        messages,
      }),
    });

    if (
      (res.status === 429 || res.status === 500 || res.status === 529) &&
      attempt < MAX_RETRIES
    ) {
      const retryAfter = res.headers.get('retry-after');
      const delay = retryAfter
        ? parseInt(retryAfter, 10) * 1000
        : RETRY_DELAY_MS * (attempt + 1);
      console.warn(`[chat] ${res.status} — retrying in ${delay}ms (attempt ${attempt + 1})`);
      await new Promise((r) => setTimeout(r, delay));
      return anthropicCall(apiKey, system, messages, attempt + 1);
    }

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[chat] Anthropic API error: ${res.status} ${errText}`);
      return { ok: false, error: `AI service returned ${res.status}`, status: 502 };
    }

    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      console.warn('[chat] Request failed, retrying...');
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
      return anthropicCall(apiKey, system, messages, attempt + 1);
    }
    const reason = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `AI service unavailable: ${reason}`, status: 502 };
  }
}

/** Make a streaming Anthropic call and return the raw response for forwarding. */
async function anthropicStream(
  apiKey: string,
  system: string,
  messages: ContentBlock[],
  attempt = 0,
): Promise<globalThis.Response | { ok: false; error: string; status: number }> {
  try {
    const res = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: anthropicHeaders(apiKey),
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system,
        tools: CHAT_TOOLS,
        stream: true,
        messages,
      }),
    });

    if (
      (res.status === 429 || res.status === 500 || res.status === 529) &&
      attempt < MAX_RETRIES
    ) {
      const retryAfter = res.headers.get('retry-after');
      const delay = retryAfter
        ? parseInt(retryAfter, 10) * 1000
        : RETRY_DELAY_MS * (attempt + 1);
      console.warn(`[chat] ${res.status} — retrying in ${delay}ms (attempt ${attempt + 1})`);
      await new Promise((r) => setTimeout(r, delay));
      return anthropicStream(apiKey, system, messages, attempt + 1);
    }

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[chat] Anthropic API error: ${res.status} ${errText}`);
      return { ok: false, error: `AI service returned ${res.status}`, status: 502 };
    }

    return res;
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      console.warn('[chat] Request failed, retrying...');
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
      return anthropicStream(apiKey, system, messages, attempt + 1);
    }
    const reason = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `AI service unavailable: ${reason}`, status: 502 };
  }
}

/** Convert an Anthropic SSE response into a plain text ReadableStream. */
function sseToTextStream(upstream: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const reader = upstream.getReader();
  const decoder = new TextDecoder();

  return new ReadableStream({
    async pull(controller) {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            controller.close();
            return;
          }

          try {
            const event = JSON.parse(data);

            if (
              event.type === 'content_block_delta' &&
              event.delta?.type === 'text_delta'
            ) {
              controller.enqueue(new TextEncoder().encode(event.delta.text));
            }

            if (event.type === 'message_stop') {
              controller.close();
              return;
            }
          } catch {
            // Skip unparseable lines
          }
        }
      }
    },
    cancel() {
      reader.cancel();
    },
  });
}

// ── Main handler ──

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY not configured. AI features are unavailable.' },
      { status: 503 },
    );
  }

  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.messages?.length) {
    return Response.json({ error: 'messages array is required' }, { status: 400 });
  }

  // Validate file context size server-side
  if (body.fileContext) {
    const totalSize = body.fileContext.reduce((sum, f) => sum + f.content.length, 0);
    if (totalSize > 600_000) {
      return Response.json(
        { error: 'File context too large. Maximum 500KB total.' },
        { status: 400 },
      );
    }
    if (body.fileContext.length > 5) {
      return Response.json(
        { error: 'Maximum 5 files allowed.' },
        { status: 400 },
      );
    }
  }

  let system = body.unlocked ? CHAT_SYSTEM_UNLOCKED : CHAT_SYSTEM_LOCKED;

  // Inject uploaded file contents as reference documents
  if (body.fileContext?.length) {
    const docs = body.fileContext
      .map((f) => `--- ${f.name} ---\n${f.content}`)
      .join('\n\n');
    system += `\n\n## REFERENCE DOCUMENTS\nThe user has uploaded the following files for context. Use them to inform your responses:\n\n${docs}`;
  }

  // Build messages array for Anthropic API
  const messages: ContentBlock[] = body.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  // ── Tool use loop ──
  // First call is non-streaming to detect tool use.
  // If Claude wants to use tools, we execute them and loop.
  // Final text response is streamed to the client.

  let toolRounds = 0;

  while (toolRounds < MAX_TOOL_ROUNDS) {
    const result = await anthropicCall(apiKey, system, messages);
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.status });
    }

    const response = result.data;
    const stopReason = response.stop_reason;
    const content: ContentBlock[] = response.content || [];

    // Check if Claude wants to use tools
    if (stopReason === 'tool_use') {
      toolRounds++;

      // Add Claude's response (with tool_use blocks) to conversation
      messages.push({ role: 'assistant', content });

      // Execute each tool call and build tool_result blocks
      const toolResults: ContentBlock[] = [];
      for (const block of content) {
        if (block.type === 'tool_use') {
          console.log(`[chat] Tool call: ${block.name}(${JSON.stringify(block.input)})`);
          const toolOutput = await executeTool(block.name, block.input);
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: toolOutput,
          });
        }
      }

      // Add tool results as a user message
      messages.push({ role: 'user', content: toolResults });
      // Continue the loop — Claude will process tool results
      continue;
    }

    // No tool use (or done with tools) — now stream the final response.
    // We already have the non-streaming response, so extract text and stream it.
    // For a smoother UX, re-request with streaming for the final turn.
    break;
  }

  // Final streaming call — Claude will produce the text response
  const streamResult = await anthropicStream(apiKey, system, messages);
  if ('error' in streamResult) {
    return Response.json({ error: streamResult.error }, { status: streamResult.status });
  }

  const upstream = streamResult.body;
  if (!upstream) {
    return Response.json({ error: 'No response body' }, { status: 502 });
  }

  return new Response(sseToTextStream(upstream), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Transfer-Encoding': 'chunked',
    },
  });
}
