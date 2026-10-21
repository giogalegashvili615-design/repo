import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to initialize GoogleGenAI
function getGeminiClient(customKey?: string) {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Please configure it in Settings or the Secrets panel.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Config info endpoint
app.get('/api/config', (_req, res) => {
  res.json({
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasAnthropicKey: Boolean(process.env.ANTHROPIC_API_KEY),
    defaultGeminiModel: 'gemini-3.8-flash',
    supportedModels: [
      {
        id: 'gemini-3.8-flash',
        name: 'Gemini 3.8 Flash',
        provider: 'gemini',
        badge: 'Free & Fast',
        description: 'Blazing fast, multimodality & Google Search Grounding. Zero setup.',
        isFree: true,
        supportsSearch: true,
        supportsThinking: false,
      },
      {
        id: 'gemini-3.1-flash-lite',
        name: 'Gemini 3.1 Flash-Lite',
        provider: 'gemini',
        badge: 'Ultra Fast',
        description: 'Super lightweight & optimized for high-speed queries.',
        isFree: true,
        supportsSearch: true,
        supportsThinking: false,
      },
      {
        id: 'gemini-4-argon',
        name: 'Gemini 4 Argon',
        provider: 'gemini',
        badge: 'Advanced Logic',
        description: 'Elite coding, deep math reasoning, and complex problem solving.',
        isFree: true,
        supportsSearch: true,
        supportsThinking: true,
      },
      {
        id: 'claude-3-7-sonnet-20250219',
        name: 'Claude 3.7 Sonnet',
        provider: 'anthropic',
        badge: 'Hybrid Reasoning',
        description: 'Anthropic flagship with extended thinking and coding power.',
        isFree: false,
        supportsSearch: false,
        supportsThinking: true,
      },
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        provider: 'anthropic',
        badge: 'Coding SOTA',
        description: 'Industry-leading code generation and nuanced reasoning.',
        isFree: false,
        supportsSearch: false,
        supportsThinking: false,
      },
      {
        id: 'claude-3-5-haiku-20241022',
        name: 'Claude 3.5 Haiku',
        provider: 'anthropic',
        badge: 'Lightning Fast',
        description: 'Near-instant responses for quick tasks and drafts.',
        isFree: false,
        supportsSearch: false,
        supportsThinking: false,
      },
    ],
  });
});

// Main Chat Streaming API
app.post('/api/chat', async (req, res) => {
  const {
    provider = 'gemini',
    model = 'gemini-3.8-flash',
    messages = [],
    systemInstruction,
    enableSearch = false,
    enableThinking = false,
    apiKey: customApiKey,
  } = req.body;

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    if (provider === 'gemini') {
      const ai = getGeminiClient(customApiKey);

      // Build clean contents array for @google/genai SDK
      const sanitizedContents: any[] = [];
      for (const m of messages) {
        if (!m || typeof m !== 'object') continue;
        const parts: any[] = [];

        // Attachments
        if (m.attachments && Array.isArray(m.attachments)) {
          for (const att of m.attachments) {
            if (att?.data && att?.mimeType) {
              parts.push({
                inlineData: {
                  mimeType: att.mimeType,
                  data: att.data,
                },
              });
            }
          }
        }

        // Text content
        if (m.content && typeof m.content === 'string' && m.content.trim()) {
          parts.push({ text: m.content.trim() });
        }

        if (parts.length > 0) {
          const role = m.role === 'assistant' ? 'model' : 'user';
          // Merge consecutive same-role turns to satisfy Gemini multi-turn requirement
          if (
            sanitizedContents.length > 0 &&
            sanitizedContents[sanitizedContents.length - 1].role === role
          ) {
            sanitizedContents[sanitizedContents.length - 1].parts.push(...parts);
          } else {
            sanitizedContents.push({ role, parts });
          }
        }
      }

      // Ensure first turn is 'user'
      while (sanitizedContents.length > 0 && sanitizedContents[0].role !== 'user') {
        sanitizedContents.shift();
      }

      if (sanitizedContents.length === 0) {
        sanitizedContents.push({
          role: 'user',
          parts: [{ text: 'Hello' }],
        });
      }

      const config: any = {};
      if (systemInstruction) {
        config.systemInstruction = systemInstruction;
      }

      if (enableSearch) {
        config.tools = [{ googleSearch: {} }];
        sendEvent('status', { message: 'Searching Google for real-time sources...' });
      }

      // Map models to active fast endpoint to avoid 503 high-demand retry stalls
      const resolvedModel =
        model === 'gemini-flash-latest' || model === 'gemini-3.8-flash' || model === 'gemini-3.1-flash-lite'
          ? 'gemini-3-flash-preview'
          : model;

      // Model fallback chain: try resolved model first, then resilient backups
      const modelChain = [
        resolvedModel,
        'gemini-3-flash-preview',
        'gemini-3.5-flash',
        'gemini-3.6-flash',
      ].filter((mName, idx, arr) => arr.indexOf(mName) === idx);

      let lastError: any = null;
      let hasStreamedAnyDelta = false;

      for (const modelToTry of modelChain) {
        try {
          const allGroundingChunks: any[] = [];

          const runStream = async (useTools: boolean) => {
            const currentConfig = { ...config };
            if (!useTools) delete currentConfig.tools;

            const responseStream = await ai.models.generateContentStream({
              model: modelToTry,
              contents: sanitizedContents,
              config: Object.keys(currentConfig).length > 0 ? currentConfig : undefined,
            });

            for await (const chunk of responseStream) {
              const text = chunk.text;
              if (text) {
                hasStreamedAnyDelta = true;
                sendEvent('delta', { text });
              }

              const chunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
              if (chunks && Array.isArray(chunks)) {
                for (const c of chunks) {
                  const web = (c as any).web;
                  if (web?.uri) {
                    const uri = web.uri;
                    const exists = allGroundingChunks.some((existing) => existing.uri === uri);
                    if (!exists) {
                      allGroundingChunks.push({
                        title: web.title || uri,
                        uri,
                      });
                    }
                  }
                }
              }
            }
          };

          try {
            await runStream(Boolean(config.tools));
          } catch (streamErr: any) {
            // If tools caused a 429 quota or other error and no deltas were sent, retry immediately without tools
            if (
              config.tools &&
              !hasStreamedAnyDelta &&
              (streamErr.status === 429 || String(streamErr.message).includes('429'))
            ) {
              console.warn(`Search grounding quota hit on ${modelToTry}; retrying without search tool...`);
              await runStream(false);
            } else {
              throw streamErr;
            }
          }

          if (allGroundingChunks.length > 0) {
            sendEvent('sources', { sources: allGroundingChunks });
          }

          if (hasStreamedAnyDelta) {
            break; // Succeeded!
          }
        } catch (mErr: any) {
          console.warn(`Gemini model ${modelToTry} failed:`, mErr.status || mErr.message);
          lastError = mErr;
          continue;
        }
      }

      // If all streaming attempts failed, try a non-streaming single call fallback
      if (!hasStreamedAnyDelta) {
        try {
          const nonStreamRes = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: sanitizedContents,
          });
          if (nonStreamRes.text) {
            sendEvent('delta', { text: nonStreamRes.text });
            hasStreamedAnyDelta = true;
          }
        } catch (fallbackErr: any) {
          console.warn('Non-streaming fallback failed:', fallbackErr);
        }
      }

      if (!hasStreamedAnyDelta && lastError) {
        throw lastError;
      }

      sendEvent('done', { finishReason: 'completed' });
      res.end();
    } else if (provider === 'anthropic') {
      const anthropicKey = customApiKey || process.env.ANTHROPIC_API_KEY;
      if (!anthropicKey) {
        sendEvent('error', {
          error:
            'Anthropic API Key is required. Please click the Settings gear icon in the top right to enter your Anthropic API Key (sk-ant-...).',
        });
        res.end();
        return;
      }

      // Format messages for Anthropic Messages API
      const formattedMessages = messages.map((m: any) => {
        if (m.attachments && m.attachments.length > 0) {
          const contentBlocks: any[] = [];
          for (const att of m.attachments) {
            if (att.mimeType && att.data) {
              contentBlocks.push({
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: att.mimeType,
                  data: att.data,
                },
              });
            }
          }
          if (m.content) {
            contentBlocks.push({ type: 'text', text: m.content });
          }
          return {
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: contentBlocks,
          };
        }
        return {
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content || '',
        };
      });

      const payload: any = {
        model,
        max_tokens: enableThinking ? 8192 : 4096,
        messages: formattedMessages,
        stream: true,
      };

      if (systemInstruction) {
        payload.system = systemInstruction;
      }

      if (enableThinking && model.includes('claude-3-7')) {
        payload.thinking = {
          type: 'enabled',
          budget_tokens: 2048,
        };
      }

      const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!anthropicRes.ok) {
        const errorText = await anthropicRes.text();
        let parsedError = errorText;
        try {
          const json = JSON.parse(errorText);
          parsedError = json.error?.message || errorText;
        } catch {
          // keep as raw text
        }
        sendEvent('error', { error: `Anthropic API error (${anthropicRes.status}): ${parsedError}` });
        res.end();
        return;
      }

      if (!anthropicRes.body) {
        throw new Error('No response body from Anthropic');
      }

      // Read SSE from Anthropic
      const reader = anthropicRes.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.type === 'content_block_delta') {
                if (parsed.delta?.type === 'thinking_delta') {
                  sendEvent('thought', { thought: parsed.delta.thinking });
                } else if (parsed.delta?.type === 'text_delta') {
                  sendEvent('delta', { text: parsed.delta.text });
                }
              } else if (parsed.type === 'error') {
                sendEvent('error', { error: parsed.error?.message || 'Anthropic stream error' });
              }
            } catch {
              // ignore parse errors for partial lines
            }
          }
        }
      }

      sendEvent('done', { finishReason: 'completed' });
      res.end();
    } else {
      sendEvent('error', { error: `Unsupported provider: ${provider}` });
      res.end();
    }
  } catch (err: any) {
    console.error('Chat error:', err);
    sendEvent('error', {
      error: err.message || 'An unexpected error occurred while communicating with the model.',
    });
    res.end();
  }
});

// Desktop builds made by scripts/build-exe.mjs live in the git-ignored
// release/ folder; expose them for download while the app runs locally.
const desktopBuildsPath = path.resolve(__dirname, 'release');
if (fs.existsSync(desktopBuildsPath)) {
  app.use('/downloads', express.static(desktopBuildsPath));
}

// Development vs Production serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 OmniChat server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
