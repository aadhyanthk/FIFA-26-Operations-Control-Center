export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
}

export class OllamaClient {
  private static readonly ENDPOINT = 'http://127.0.0.1:11434/api/chat';
  private static readonly MODEL = 'phi3:mini';

  static async chat(messages: ChatMessage[]): Promise<any> {
    try {
      const payload = {
        model: this.MODEL,
        messages,
        stream: true,
        options: {
          temperature: 0.1
        }
      };
      
      console.log('Sending request to Ollama with payload:', payload);
      
      const response = await fetch(this.ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      console.log('Ollama connection established. Receiving stream...');
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
                // Optional: console.log(parsed.message.content) if you want to see every word
              }
            } catch (e) {
              // ignore partial lines
            }
          }
        }
      }

      console.log('Stream finished. Full content length:', fullContent.length);
      return { role: 'assistant', content: fullContent };
    } catch (error) {
      console.error('Failed to communicate with Ollama:', error);
      throw error;
    }
  }
}
