import { AIProvider, GroundingSource, Message } from '../types';

export interface StreamChatParams {
  messages: Message[];
  provider: AIProvider;
  model: string;
  systemInstruction?: string;
  enableSearch?: boolean;
  enableThinking?: boolean;
  apiKey?: string;
  signal?: AbortSignal;
  onDelta: (chunk: string) => void;
  onThought?: (chunk: string) => void;
  onSources?: (sources: GroundingSource[]) => void;
  onStatus?: (status: string) => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

export async function streamChat({
  messages,
  provider,
  model,
  systemInstruction,
  enableSearch = false,
  enableThinking = false,
  apiKey,
  signal,
  onDelta,
  onThought,
  onSources,
  onStatus,
  onDone,
  onError,
}: StreamChatParams): Promise<void> {
  try {
    const payload = {
      provider,
      model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
        attachments: m.attachments?.map((a) => ({
          name: a.name,
          mimeType: a.mimeType,
          data: a.data,
        })),
      })),
      systemInstruction,
      enableSearch,
      enableThinking,
      apiKey: apiKey || undefined,
    };

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server returned HTTP ${response.status}: ${errorText}`);
    }

    if (!response.body) {
      throw new Error('Readable stream not supported by browser or empty body returned.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      let currentEvent = 'message';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith('event: ')) {
          currentEvent = trimmed.slice(7).trim();
          continue;
        }

        if (trimmed.startsWith('data: ')) {
          const rawData = trimmed.slice(6).trim();
          try {
            const parsed = JSON.parse(rawData);

            if (currentEvent === 'delta' || parsed.text !== undefined) {
              if (parsed.text) onDelta(parsed.text);
            } else if (currentEvent === 'thought' || parsed.thought !== undefined) {
              if (parsed.thought && onThought) onThought(parsed.thought);
            } else if (currentEvent === 'sources' || parsed.sources !== undefined) {
              if (parsed.sources && onSources) onSources(parsed.sources);
            } else if (currentEvent === 'status' || parsed.message !== undefined) {
              if (parsed.message && onStatus) onStatus(parsed.message);
            } else if (currentEvent === 'error' || parsed.error !== undefined) {
              throw new Error(parsed.error || 'Unknown streaming error');
            } else if (currentEvent === 'done') {
              // completion
            }
          } catch (e: any) {
            if (e.message && e.message !== 'Unexpected end of JSON input') {
              console.warn('SSE Parse warning:', e);
            }
          }
        }
      }
    }

    onDone?.();
  } catch (err: any) {
    if (signal?.aborted) {
      // Aborted by user, not an unhandled error
      onDone?.();
      return;
    }
    console.error('streamChat error:', err);
    onError?.(err instanceof Error ? err : new Error(String(err)));
  }
}
