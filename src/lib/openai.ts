import OpenAI from 'openai';

// Create a singleton for the OpenAI client
let openaiInstance: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not defined in environment variables');
    }
    
    openaiInstance = new OpenAI({
      apiKey
    });
  }
  
  return openaiInstance;
}
