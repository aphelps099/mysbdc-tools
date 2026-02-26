import { NextRequest } from 'next/server';
import { CHAT_SYSTEM_LOCKED, CHAT_SYSTEM_UNLOCKED } from '@/lib/prompts/chat';

export const dynamic = 'force-dynamic';

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 2048;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
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

  // Retry loop for transient errors
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(ANTHROPIC_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system,
          stream: true,
          messages: body.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      // Retryable status codes
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
        continue;
      }

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`[chat] Anthropic API error: ${res.status} ${errText}`);
        return Response.json(
          { error: `AI service returned ${res.status}` },
          { status: 502 },
        );
      }

      // Stream the response — forward Anthropic SSE text_delta events as plain text chunks
      const upstream = res.body;
      if (!upstream) {
        return Response.json({ error: 'No response body' }, { status: 502 });
      }

      const reader = upstream.getReader();
      const decoder = new TextDecoder();

      const stream = new ReadableStream({
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

                // content_block_delta → text chunk
                if (
                  event.type === 'content_block_delta' &&
                  event.delta?.type === 'text_delta'
                ) {
                  controller.enqueue(
                    new TextEncoder().encode(event.delta.text),
                  );
                }

                // message_stop → end of stream
                if (event.type === 'message_stop') {
                  controller.close();
                  return;
                }
              } catch {
                // Skip unparseable lines (comments, empty data, etc.)
              }
            }
          }
        },
        cancel() {
          reader.cancel();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Transfer-Encoding': 'chunked',
        },
      });
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        console.warn('[chat] Request failed, retrying...');
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
        continue;
      }
      const reason = err instanceof Error ? err.message : String(err);
      console.warn(`[chat] Request failed: ${reason}`);
      return Response.json(
        { error: `AI service unavailable: ${reason}` },
        { status: 502 },
      );
    }
  }

  return Response.json({ error: 'Max retries exceeded' }, { status: 502 });
}
