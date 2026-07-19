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

export class OllamaClient {
  static get ENDPOINT() {
    // Dynamically use the current hostname so it works when accessed from other devices on the LAN via Docker
    const host = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
    return `http://${host}:11434/api/chat`;
  }
  private static readonly MODEL = 'phi3:mini';

  static async chat(messages: ChatMessage[], onChunk?: (partialContent: string) => void): Promise<OllamaResponse> {
    try {
      const payload = {
        model: this.MODEL,
        messages,
        stream: true,
        format: 'json',
        options: {
          temperature: 0.1
        }
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
          const lines = chunk.split('\n').filter(line => line.trim() !== '');
          
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.message?.content) {
                fullContent += parsed.message.content;
                if (onChunk) onChunk(fullContent);
              }
            } catch {
              // Intentionally ignore partial line parses from the stream
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
