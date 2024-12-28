
// import OpenAI from 'openai';
// import { generateText, streamText } from 'ai';
import { generateText, streamText } from 'ai';
import { openai } from '@ai-sdk/openai'; // Ensure OPENAI_API_KEY environment variable is set
 
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });
 
export async function POST(req: Request) {
  const { messages } = await req.json();
  const response = streamText({
    model: openai('gpt-4o'),
    system: "You're a friendly assistant",
    messages
  })

  console.log({messages}, response )
  return response.toDataStreamResponse();
  // const response = await openai.chat.completions.create({
  //   model: 'gpt-3.5-turbo',
  //   stream: true,
  //   messages,
  // });
 
}
