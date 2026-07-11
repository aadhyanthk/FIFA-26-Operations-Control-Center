export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
}

export class OllamaClient {
  private static readonly ENDPOINT = 'http://localhost:11434/api/chat';
  private static readonly MODEL = 'phi3:mini';

  static async chat(messages: ChatMessage[], tools: any[]): Promise<any> {
    try {
      const response = await fetch(this.ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.MODEL,
          messages,
          tools,
          stream: false,
          options: {
            temperature: 0.1
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error('Failed to communicate with Ollama:', error);
      throw error;
    }
  }
}
