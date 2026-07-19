/**
 * @file OllamaClient.ts
 * @description Thin HTTP client for communicating with a locally running Ollama
 * instance. Streams responses token-by-token and exposes an optional `onChunk`
 * callback so callers can render partial content in real time.
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
}

export interface OllamaResponse {
  role: 'assistant';
  content: string;
  tool_calls?: { function: { name: string; arguments: Record<string, unknown> } }[];
}

/**
 * Stateless HTTP client for the Ollama chat completions API.
 *
 * The endpoint is resolved at call time from `window.location.hostname`,
 * which ensures the client works both during local development and when the
 * Tauri app is accessed from another device on the same LAN.
 */
export class OllamaClient {
  /** Returns the resolved Ollama API endpoint URL */
  static get ENDPOINT(): string {
    const host =
      typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
    return `http://${host}:11434/api/chat`;
  }

  private static readonly MODEL = 'phi3:mini';

  /**
   * Sends a chat request to Ollama and streams the response.
   *
   * Responses are streamed line-by-line (Ollama's NDJSON format). Each line
   * is parsed independently; partial or malformed lines from the stream are
   * silently discarded. The full accumulated response string is returned once
   * the stream ends.
   *
   * @param messages - Conversation history to send (system + user + any prior turns)
   * @param onChunk - Optional callback invoked with the growing partial response
   *                  string after each received token. Useful for streaming UI updates.
   * @returns The completed assistant response including any native `tool_calls`
   * @throws Error if the HTTP request fails or Ollama returns a non-OK status
   */
  static async chat(
    messages: ChatMessage[],
    onChunk?: (partialContent: string) => void
  ): Promise<OllamaResponse> {
    try {
      const payload = {
        model: this.MODEL,
        messages,
        stream: true,
        format: 'json',
        options: { temperature: 0.1 },
      };

      const response = await fetch(this.ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter((line) => line.trim() !== '');

          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.message?.content) {
                fullContent += parsed.message.content;
                if (onChunk) onChunk(fullContent);
              }
            } catch {
              // Intentionally ignore partial line parses from the NDJSON stream
            }
          }
        }
      }

      return { role: 'assistant', content: fullContent };
    } catch (error) {
      console.error('Failed to communicate with Ollama:', error);
      throw error;
    }
  }
}
