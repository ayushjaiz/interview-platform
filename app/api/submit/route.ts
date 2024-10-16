import { createClient } from "@deepgram/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY!);
const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

async function generateResponse(userResponse: string): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `You are conducting a technical interview on node js. The interviewee just said: "${userResponse}". Provide a follow-up question or comment based on their response. Keep your response concise and focused on react concepts.`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text();
    } catch (error) {
        console.error('Error generating response:', error);
        throw new Error('Failed to generate response');
    }
}

export const POST = async (request: Request) => {
    const body = (await request.json()) as { caption: string };

    const text = await generateResponse(body.caption);
    //return Response.json({ chatResponse: response });

    //const text = 'api hit for first time';

    const response = await deepgram.speak.request({ text }, {
        model: "aura-asteria-en",
        container: "ogg",
        encoding: "opus",
        
    });

    const [stream, headers] = await Promise.all([
        response.getStream(),
        response.getHeaders(),
    ]);


    //return Response.json({ response: 'api hit' });
    return new Response(stream, { headers });
}