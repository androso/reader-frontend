
import OpenAI from 'openai';
import { StreamingTextResponse, OpenAIStream as createStream } from 'ai';
 
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
 
export async function POST(req: Request) {
  const { messages } = await req.json();

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages,
  });
 
  const stream = createStream(response);
  return new StreamingTextResponse(stream);
}
